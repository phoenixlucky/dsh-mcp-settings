/**
 * Call one MCP tool from a profile and report what came back, so a report like "the card says
 * connected but calls fail" can be split into "endpoint", "handshake", or "this tool".
 *
 * Read-only by construction: the caller names the tool and its arguments, nothing else is called.
 * The connection mirrors `scripts/mcp-audit.mjs` (credential references resolved from the profile,
 * version negotiation on auto), and the call is bounded by `--timeout`.
 *
 * Usage:
 *   node scripts/mcp-tool-probe.mjs <serverName> <toolName> [--args '<json>'] [--repeat 3]
 *                                  [--profile <dir>] [--timeout 30000]
 *   node scripts/mcp-tool-probe.mjs taexpr check_triggers
 *
 * Exit code 0 when every attempt answered without `isError`; 1 otherwise.
 */
import { resolve } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { DEFAULT_PROFILE_DIR, readProfileRefs, readProfileServers } from './lib/mcp-profile.mjs';

const argv = process.argv.slice(2);
const VALUE_FLAGS = new Set(['args', 'profile', 'timeout', 'repeat']);

/** Read one `--flag value` pair; undefined when absent. */
function flag(name) {
  const index = argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  return value === undefined || value.startsWith('--') ? undefined : value;
}

const positionals = argv.filter((argument, index) => {
  if (argument.startsWith('--')) return false;
  const previous = argv[index - 1];
  return previous === undefined || !VALUE_FLAGS.has(previous.replace(/^--/, ''));
});

const [serverName, toolName] = positionals;
if (serverName === undefined || toolName === undefined) {
  console.error('usage: node scripts/mcp-tool-probe.mjs <serverName> <toolName> [--args <json>] [--repeat 3] [--profile <dir>] [--timeout 30000]');
  process.exitCode = 2;
  throw new Error('missing arguments');
}

const profileDir = resolve(flag('profile') ?? DEFAULT_PROFILE_DIR);
const timeoutMs = Number(flag('timeout') ?? 30000);
const repeat = Math.max(1, Number(flag('repeat') ?? 3));
const toolArguments = JSON.parse(flag('args') ?? '{}');

const refs = readProfileRefs(profileDir);
const row = readProfileServers(profileDir).find((candidate) => candidate.serverName === serverName);
if (row === undefined) {
  console.error(`profile ${profileDir} has no server named "${serverName}"`);
  process.exitCode = 1;
  throw new Error('server not found');
}
if (row.transport !== 'streamable-http') {
  console.error(`${serverName} uses ${row.transport}; this probe only speaks streamable-http`);
  process.exitCode = 2;
  throw new Error('unsupported transport');
}

/** Resolve one promise against a deadline without leaking a rejection. */
function withDeadline(promise, ms) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`deadline ${ms}ms`)), ms) }),
  ]);
}

const headers = { ...(row.headers ?? {}) };
const authRef = row.headerRefs?.Authorization;
const authorization = typeof authRef === 'string' ? refs[authRef] : undefined;
if (typeof authRef === 'string' && authorization === undefined) {
  console.error(`credential reference "${authRef}" is not in the profile credential store`);
  process.exitCode = 1;
  throw new Error('credential unresolved');
}
if (authorization !== undefined) headers.Authorization = authorization;

const client = new Client(
  { name: 'dsh-mcp-tool-probe', version: '1.0.0' },
  { capabilities: {}, versionNegotiation: { mode: 'auto' } },
);

let failures = 0;
const startedAt = Date.now();
try {
  await withDeadline(client.connect(new StreamableHTTPClientTransport(new URL(String(row.url)), { requestInit: { headers } })), timeoutMs);
  console.log(`${serverName}: connected in ${Date.now() - startedAt}ms · ${client.getNegotiatedProtocolVersion() ?? 'no revision'}`);
} catch (error) {
  console.log(`${serverName}: CONNECT FAILED — ${error?.message ?? error}`);
  process.exitCode = 1;
  throw error;
}

for (let attempt = 1; attempt <= repeat; attempt += 1) {
  const started = Date.now();
  try {
    const result = await withDeadline(client.callTool({ name: toolName, arguments: toolArguments }), timeoutMs);
    const isError = result?.isError === true;
    if (isError) failures += 1;
    const body = JSON.stringify(result?.content ?? result).replace(/\s+/g, ' ');
    console.log(`${toolName} #${attempt}: ${Date.now() - started}ms isError=${isError} ${body.slice(0, 160)}`);
  } catch (error) {
    failures += 1;
    console.log(`${toolName} #${attempt}: FAIL ${Date.now() - started}ms — ${error?.message ?? error}`);
  }
}

await client.close().catch(() => {});
console.log(failures === 0 ? `\nall ${repeat} call(s) answered without isError` : `\n${failures} of ${repeat} call(s) did not answer cleanly`);
process.exitCode = failures === 0 ? 0 : 1;
