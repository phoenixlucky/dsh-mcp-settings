/**
 * MCP 接入体检：把「这套 MCP 配置在模型侧要占多少上下文、协商到了什么、命名契约有没有被改写」
 * 变成一次可复现、可回放的检查。
 *
 * 它只做装配管线里「发现 → 建目录 → 归一 → 审计」这几段，不调用任何工具：
 *
 *   1. 发现：用与运行时相同的 SDK（`@modelcontextprotocol/client`，`versionNegotiation: auto`）
 *      建立连接，记录协商到的协议修订版、服务端能力与 instructions 字节数。
 *   2. 目录：`tools/list`（含分页），并在声明了对应能力时顺带取 `resources/list`、
 *      `resources/templates/list`、`prompts/list` 的条目数。
 *   3. 归一：用 vendored 运行时的 `publicToolName()`（唯一真源，不复制实现）算出模型实际看到的
 *      工具名，标出被字符替换或截断加哈希改写的条目。
 *   4. 成本：把每个工具的定义（name + description + inputSchema + outputSchema）按 UTF-8 字节计量，
 *      给出 `bytes / 4` 的粗估 token——这是「工具定义常驻上下文」的直接度量。
 *   5. 审计：把服务、耗时、结果状态与检查项写入一份 JSON，便于回放与追责；密钥只按引用名出现。
 *
 * 口径与边界：
 *   - token 数只是粗估（UTF-8 字节 / 4），中文描述会偏低；字节数才是客观值，两者都输出。
 *   - 不打印、不写入任何秘密值；不记录工具返回内容；不调用工具。
 *   - 结果上限、取消语义、写操作幂等属于 Host 运行时，这里一律标 `unverifiable`，不冒充通过。
 *   - stdio 行默认跳过（启动本机进程属副作用）。确需体检用 `--allow-stdio`；envRefs 只在运行时
 *     凭据库内解析，故带 envRefs 的 stdio 行仍会跳过。
 *
 * 用法：
 *   node scripts/mcp-audit.mjs [profileDir] [--json <path>] [--timeout 20000]
 *                             [--max-tools 40] [--max-tokens 15000] [--strict] [--allow-stdio]
 *   node scripts/mcp-audit.mjs                                # 默认 ~/.dsh/profiles/web
 *   node scripts/mcp-audit.mjs --json .audit/2026-11-23.json  # 另存审计记录
 *
 * 退出码：0 = 全部连上且无告警；1 = 有服务失败（或 `--strict` 下有告警）。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { publicToolName } from '../vendor/dsh-mcp-client/lib/types/tools.js';
import { SKILLS_EXTENSION, declaresSkills, projectSkillsList } from '../vendor/dsh-mcp-client/lib/negotiation.js';
import { DEFAULT_PROFILE_DIR, profilePaths, readProfileRefs, readProfileServers } from './lib/mcp-profile.mjs';

/** Rough token estimate denominator: UTF-8 bytes per token. */
const BYTES_PER_TOKEN = 4;
/** Header names that carry a secret when placed in plain settings. */
const SECRET_HEADER = /^(authorization|proxy-authorization|x-api-key|api-key|x-auth-token)$/i;

const argv = process.argv.slice(2);
/** Flags that consume the following argument as their value. */
const VALUE_FLAGS = new Set(['json', 'timeout', 'max-tools', 'max-tokens']);

/** Read one `--flag [value]` pair; returns undefined when absent, `true` for a bare switch. */
function flag(name) {
  const index = argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (VALUE_FLAGS.has(name)) return value;
  return value === undefined || value.startsWith('--') ? true : value;
}

const positionals = argv.filter((argument, index) => {
  if (argument.startsWith('--')) return false;
  const previous = argv[index - 1];
  return previous === undefined || !VALUE_FLAGS.has(previous.replace(/^--/, ''));
});

const profileDir = resolve(positionals[0] ?? DEFAULT_PROFILE_DIR);
const timeoutMs = Number(flag('timeout') ?? 20000);
const maxTools = Number(flag('max-tools') ?? 40);
const maxTokens = Number(flag('max-tokens') ?? 15000);
const strict = flag('strict') === true;
const allowStdio = flag('allow-stdio') === true;
const jsonTarget = flag('json');

/**
 * Measure one tool's definition size and the model-facing name it will get.
 * @param {string} serverName - Namespace from the managed row.
 * @param {Record<string, unknown>} tool - Upstream tool from `tools/list`.
 * @returns {{rawName: string, publicName: string, rewritten: boolean, bytes: number}} summary.
 */
function measureTool(serverName, tool) {
  const rawName = String(tool.name ?? '');
  const definition = {
    name: rawName,
    description: tool.description ?? '',
    inputSchema: tool.inputSchema ?? null,
    ...(tool.outputSchema === undefined ? {} : { outputSchema: tool.outputSchema }),
  };
  const publicName = publicToolName(serverName, rawName);
  return {
    rawName,
    publicName,
    rewritten: publicName !== `mcp__${serverName}__${rawName}`,
    bytes: Buffer.byteLength(JSON.stringify(definition), 'utf8'),
  };
}

/**
 * Classify a Streamable HTTP endpoint for the transport check.
 * @param {string} url - Configured MCP endpoint.
 * @returns {'tls'|'loopback'|'private'|'plaintext-remote'|'unsupported-scheme'|'invalid-url'} class.
 */
function classifyEndpoint(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return 'tls';
    if (parsed.protocol !== 'http:') return 'unsupported-scheme';
    const host = parsed.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]') return 'loopback';
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return 'private';
    return 'plaintext-remote';
  } catch { return 'invalid-url'; }
}

/** Resolve one promise against a deadline without leaking a rejection. */
async function withDeadline(promise, ms) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(Object.assign(new Error('deadline exceeded'), { code: 'deadline' })), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Count list entries across pages, bounded so a hostile cursor cannot loop forever. */
async function countPages(list, key, limit = 5) {
  let cursor;
  let total = 0;
  const names = [];
  for (let page = 0; page < limit; page += 1) {
    const result = await list(cursor);
    const items = result?.[key] ?? [];
    total += items.length;
    for (const item of items) names.push(String(item.name ?? item.uri ?? '?'));
    cursor = result?.nextCursor;
    if (cursor === undefined) break;
  }
  return { total, names };
}

/** Standard Schema validator for one `skills/list` result, shared with the runtime's shape. */
const skillsResultSchema = {
  '~standard': {
    version: 1,
    vendor: 'dsh-mcp-audit',
    validate(value) {
      if (typeof value !== 'object' || value === null || !Array.isArray(value.skills)) return { issues: [{ message: 'skills/list must return a skills array' }] };
      return { value };
    },
  },
};

/** Count skills across pages, projecting each payload the way the settings page does. */
async function countSkills(request, limit = 5) {
  let cursor;
  let total = 0;
  const names = [];
  for (let page = 0; page < limit; page += 1) {
    const projected = projectSkillsList(await request(cursor));
    if (projected === undefined) throw new Error('skills/list returned a payload without a skills array');
    total += projected.skills.length;
    for (const skill of projected.skills) names.push(skill.name);
    cursor = projected.nextCursor;
    if (cursor === undefined) break;
  }
  return { total, names };
}

/**
 * Audit one managed server row. Never throws: every failure becomes a status.
 * @param {Record<string, unknown>} row - Managed settings row.
 * @param {Record<string, string>} refs - Credential references by name.
 * @returns {Promise<Record<string, unknown>>} the audit record for this server.
 */
async function auditServer(row, refs) {
  const serverName = String(row.serverName ?? row.id);
  const startedAt = Date.now();
  const record = {
    id: String(row.id),
    serverName,
    transport: String(row.transport),
    purpose: row.purpose ?? 'model-tools',
    enabled: row.enabled !== 'false',
    status: 'ok',
    durationMs: 0,
    checks: [],
    tools: { count: 0, bytes: 0, estimateTokens: 0, rewritten: [], largest: [] },
    capabilities: [],
    extensions: [],
    resources: undefined,
    prompts: undefined,
    skills: undefined,
  };
  const check = (id, status, detail) => record.checks.push({ id, status, detail });

  const headerRefs = row.headerRefs ?? {};
  const plainHeaders = row.headers ?? {};
  const secretHeader = Object.keys(plainHeaders).find((name) => SECRET_HEADER.test(name));
  if (secretHeader !== undefined) {
    check('credentials', 'warn', `plaintext secret-bearing header "${secretHeader}" stored in settings`);
  } else if (Object.keys(headerRefs).length > 0) {
    check('credentials', 'pass', `bound via credential reference(s): ${Object.keys(headerRefs).join(', ')}`);
  } else {
    check('credentials', 'warn', 'no credential reference; the connection is unauthenticated');
  }

  if (!record.enabled) {
    record.status = 'disabled';
    check('transport', 'info', 'row disabled; no connection attempted');
    record.durationMs = Date.now() - startedAt;
    return record;
  }

  let client;
  try {
    if (record.transport === 'stdio') {
      const envRefs = row.envRefs ?? {};
      if (!allowStdio) {
        record.status = 'skipped';
        check('transport', 'info', 'stdio row skipped; rerun with --allow-stdio to spawn it');
        record.durationMs = Date.now() - startedAt;
        return record;
      }
      if (Object.keys(envRefs).length > 0) {
        record.status = 'skipped';
        check('credentials', 'unverifiable', 'stdio envRefs resolve inside the runtime credential store');
        record.durationMs = Date.now() - startedAt;
        return record;
      }
      check('transport', 'info', 'local child process; only audit commands you trust');
      client = new Client(
        { name: 'dsh-mcp-audit', version: '1.0.0' },
        { capabilities: {}, versionNegotiation: { mode: 'auto' }, listChanged: { tools: { autoRefresh: false, debounceMs: 0, onChanged: () => {} } } },
      );
      await withDeadline(client.connect(new StdioClientTransport({
        command: String(row.command ?? ''),
        args: Array.isArray(row.args) ? row.args.map(String) : [],
        cwd: typeof row.cwd === 'string' ? row.cwd : undefined,
        stderr: 'pipe',
      })), timeoutMs);
    } else {
      const url = String(row.url ?? '');
      const endpoint = classifyEndpoint(url);
      record.endpoint = endpoint;
      if (endpoint === 'invalid-url' || endpoint === 'unsupported-scheme') {
        record.status = 'invalid-row';
        check('parse', 'fail', `row has no usable MCP endpoint url (read "${url.slice(0, 80)}")`);
        record.durationMs = Date.now() - startedAt;
        return record;
      }
      const authRef = headerRefs.Authorization;
      const authorization = typeof authRef === 'string' ? refs[authRef] : undefined;
      if (typeof authRef === 'string' && authorization === undefined) {
        record.status = 'authorization-unresolved';
        check('credentials', 'warn', `credential reference "${authRef}" is missing from the credential store`);
        record.durationMs = Date.now() - startedAt;
        return record;
      }
      if (endpoint === 'tls') check('transport', 'pass', 'HTTPS endpoint');
      else if (endpoint === 'loopback') check('transport', 'pass', 'loopback HTTP endpoint');
      else if (endpoint === 'private') check('transport', 'warn', 'private-address HTTP endpoint; the token crosses the LAN in clear text');
      else check('transport', 'warn', `endpoint classified "${endpoint}"`);

      const headers = { ...plainHeaders };
      if (authorization !== undefined) headers.Authorization = authorization;
      client = new Client(
        { name: 'dsh-mcp-audit', version: '1.0.0' },
        { capabilities: {}, versionNegotiation: { mode: 'auto' }, listChanged: { tools: { autoRefresh: false, debounceMs: 0, onChanged: () => {} } } },
      );
      await withDeadline(client.connect(new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers } })), timeoutMs);
    }

    record.protocol = {
      negotiated: client.getNegotiatedProtocolVersion() ?? null,
      server: client.getServerVersion() ?? null,
      instructionsBytes: Buffer.byteLength(client.getInstructions() ?? '', 'utf8'),
    };
    const capabilities = client.getServerCapabilities() ?? {};
    record.capabilities = Object.keys(capabilities);
    check('capabilities', 'info', record.capabilities.length === 0 ? 'server declared no capabilities' : record.capabilities.join(', '));
    // Extensions are declared separately from capabilities, and a declaration is not content: the
    // list below is read from the server rather than inferred from the flag.
    record.extensions = Object.keys(capabilities.extensions ?? {}).sort();
    const skillsDeclared = declaresSkills({ extensions: record.extensions });
    check('extensions', 'info', record.extensions.length === 0
      ? 'server declared no extensions'
      : `${record.extensions.join(', ')}${skillsDeclared ? ' (skills over MCP)' : ''}`);
    if (skillsDeclared) {
      try {
        const skills = await withDeadline(
          countSkills((cursor) => client.request({ method: 'skills/list', params: cursor === undefined ? {} : { cursor } }, skillsResultSchema)),
          timeoutMs,
        );
        record.skills = { count: skills.total, names: skills.names.slice(0, 8) };
        check('skills', skills.total === 0 ? 'info' : 'pass', skills.total === 0
          ? `declares ${SKILLS_EXTENSION} but lists no skills`
          : `${skills.total} skill(s): ${skills.names.slice(0, 8).join(', ')}`);
      } catch (error) {
        record.skills = { error: String(error?.message ?? error).slice(0, 160) };
        check('skills', 'warn', `declares ${SKILLS_EXTENSION} but skills/list failed: ${record.skills.error}`);
      }
    }
    if (record.protocol.instructionsBytes > 8192) {
      check('instructions', 'warn', `${record.protocol.instructionsBytes} B of server instructions are attributed into every request`);
    } else if (record.protocol.instructionsBytes > 0) {
      check('instructions', 'pass', `${record.protocol.instructionsBytes} B of attributed instructions`);
    }

    const { tools } = await withDeadline(client.listTools(undefined, { cacheMode: 'refresh' }), timeoutMs);
    const measured = tools.map((tool) => measureTool(serverName, tool));
    const bytes = measured.reduce((sum, item) => sum + item.bytes, 0);
    record.tools = {
      count: measured.length,
      bytes,
      estimateTokens: Math.ceil(bytes / BYTES_PER_TOKEN),
      rewritten: measured.filter((item) => item.rewritten).map((item) => ({ rawName: item.rawName, publicName: item.publicName })),
      largest: measured
        .slice()
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 3)
        .map((item) => ({ publicName: item.publicName, bytes: item.bytes })),
    };

    if (record.tools.rewritten.length > 0) {
      check('naming', 'warn', `${record.tools.rewritten.length} model-facing name(s) rewritten (replaced characters or truncation plus hash)`);
    } else {
      check('naming', 'pass', 'model-facing names are verbatim `mcp__<server>__<tool>`');
    }
    if (record.tools.count > maxTools) check('context-budget', 'warn', `${record.tools.count} tools exceed the ${maxTools}-tool budget`);
    else if (record.tools.estimateTokens > maxTokens) check('context-budget', 'warn', `~${record.tools.estimateTokens} tokens exceed the ${maxTokens}-token budget`);
    else check('context-budget', 'pass', `${record.tools.count} tools, ~${record.tools.estimateTokens} tokens standing cost`);

    if (capabilities.resources !== undefined) {
      try {
        const resources = await withDeadline(countPages((cursor) => client.listResources(cursor === undefined ? undefined : { cursor }), 'resources'), timeoutMs);
        const templates = await withDeadline(
          countPages((cursor) => client.listResourceTemplates(cursor === undefined ? undefined : { cursor }), 'resourceTemplates'),
          timeoutMs,
        );
        record.resources = { count: resources.total, templates: templates.total };
      } catch (error) {
        record.resources = { error: String(error?.message ?? error).slice(0, 160) };
      }
    }
    if (capabilities.prompts !== undefined) {
      try {
        const prompts = await withDeadline(countPages((cursor) => client.listPrompts(cursor === undefined ? undefined : { cursor }), 'prompts'), timeoutMs);
        record.prompts = { count: prompts.total, names: prompts.names.slice(0, 8) };
      } catch (error) {
        record.prompts = { error: String(error?.message ?? error).slice(0, 160) };
      }
    }

    check('result-limit', 'unverifiable', 'truncation and result caps live in the Host runtime');
    check('audit', 'pass', 'this run recorded source, duration, status and check results');
  } catch (error) {
    const message = String(error?.message ?? error);
    const code = String(error?.code ?? '');
    if (code === 'deadline' || /timed? ?out/i.test(message)) record.status = 'timed-out';
    else if (/401|unauthoriz|authorization required|forbidden/i.test(`${code} ${message}`)) record.status = 'authorization-required';
    else record.status = 'failed';
    record.error = { code: code || null, message: message.slice(0, 240) };
    check('connection', record.status === 'timed-out' ? 'warn' : 'fail', record.status);
  } finally {
    await client?.close().catch(() => {});
    record.durationMs = Date.now() - startedAt;
  }
  return record;
}

const refs = readProfileRefs(profileDir);
const rows = readProfileServers(profileDir);
if (rows.length === 0) {
  console.error(`no managed MCP servers found in ${profilePaths(profileDir).patch}`);
  process.exit(1);
}

const records = [];
for (const row of rows) records.push(await auditServer(row, refs));

const connected = records.filter((record) => record.status === 'ok');
const failed = records.filter((record) => ['failed', 'timed-out', 'authorization-required'].includes(record.status));
const totalBytes = connected.reduce((sum, record) => sum + record.tools.bytes, 0);
const totalTokens = Math.ceil(totalBytes / BYTES_PER_TOKEN);
const warnings = records.flatMap((record) => record.checks.filter((entry) => entry.status === 'warn').map((entry) => `${record.serverName}/${entry.id}`));

const audit = {
  tool: 'dsh-mcp-audit',
  version: 1,
  generatedAt: new Date().toISOString(),
  profile: profileDir,
  estimate: { bytesPerToken: BYTES_PER_TOKEN, basis: 'tool definition (name + description + inputSchema + outputSchema) as UTF-8 JSON' },
  budgets: { maxTools, maxTokens },
  totals: {
    servers: records.length,
    connected: connected.length,
    failed: failed.length,
    tools: connected.reduce((sum, record) => sum + record.tools.count, 0),
    bytes: totalBytes,
    estimateTokens: totalTokens,
  },
  servers: records,
};

for (const record of records) {
  const serverVersion = record.protocol?.server?.name === undefined
    ? ''
    : ` · ${record.protocol.server.name} ${record.protocol.server.version ?? ''}`;
  console.log(`${record.serverName} [${record.transport}${record.enabled ? '' : ', disabled'}] — ${record.status}${record.protocol === undefined ? '' : ` · ${record.protocol.negotiated ?? 'unknown'}${serverVersion}`} (${record.durationMs} ms)`);
  if (record.status === 'ok') {
    const share = totalBytes === 0 || connected.length < 2 ? '' : `, ${Math.round((record.tools.bytes / totalBytes) * 100)}% of total`;
    console.log(`  tools=${record.tools.count} definition=${record.tools.bytes} B (~${record.tools.estimateTokens} tok${share})`);
    console.log(`  server: ${record.capabilities.length === 0 ? 'no capabilities' : record.capabilities.join(', ')}${record.protocol.instructionsBytes > 0 ? ` · ${record.protocol.instructionsBytes} B instructions` : ''}`);
    if (record.extensions.length > 0) console.log(`  extensions: ${record.extensions.join(', ')}`);
    if (record.skills !== undefined) {
      console.log(`  skills=${record.skills.error === undefined ? `${record.skills.count}${record.skills.names.length === 0 ? '' : ` (${record.skills.names.join(', ')})`}` : 'error'}`);
    }
    if (record.tools.largest.length > 0) {
      console.log(`  largest: ${record.tools.largest.map((item) => `${item.publicName} ${item.bytes} B`).join(', ')}`);
    }
    if (record.tools.rewritten.length > 0) {
      console.log(`  renamed: ${record.tools.rewritten.slice(0, 3).map((item) => `${item.rawName} → ${item.publicName}`).join(', ')}`);
    }
    const extras = [];
    if (record.resources !== undefined) {
      extras.push(`resources=${record.resources.error === undefined ? `${record.resources.count} + ${record.resources.templates} templates` : 'error'}`);
    }
    if (record.prompts !== undefined) extras.push(`prompts=${record.prompts.error === undefined ? record.prompts.count : 'error'}`);
    if (extras.length > 0) console.log(`  ${extras.join(' · ')}`);
  } else if (record.error !== undefined) {
    console.log(`  ${`${record.error.code ?? ''} ${record.error.message}`.trim()}`);
  }
  for (const entry of record.checks.filter((item) => item.status === 'warn' || item.status === 'fail')) {
    console.log(`  ! ${entry.id}: ${entry.detail}`);
  }
}

console.log(`\ntotal servers=${records.length} connected=${connected.length} failed=${failed.length} tools=${audit.totals.tools} definition=${totalBytes} B (~${totalTokens} tok) warnings=${warnings.length}`);
if (typeof jsonTarget === 'string') {
  const target = resolve(jsonTarget);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  console.log(`audit record: ${target}`);
}

process.exitCode = failed.length > 0 || (strict && warnings.length > 0) ? 1 : 0;
