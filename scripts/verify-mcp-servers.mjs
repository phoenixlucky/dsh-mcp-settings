/**
 * Verify the MCP servers declared in a DSH profile.
 *
 * Runs the same client path the managed MCP plugin uses — `@modelcontextprotocol/client`
 * with `versionNegotiation: { mode: 'auto' }` and the profile's `headerRefs` resolved
 * from the local credential store — then reports each server's tool count and the
 * public tool names the model will see (`mcp__<serverName>__<tool>`).
 *
 * Secret values are never printed.
 *
 * Usage:
 *   node scripts/verify-mcp-servers.mjs [profileDir]
 *   node scripts/verify-mcp-servers.mjs C:/Users/Administrator/.dsh/profiles/web
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

const profileDir = process.argv[2] ?? 'C:/Users/Administrator/.dsh/profiles/web';
const credentialsPath = join(profileDir, '../../.credentials.yaml');

/** Read the flat `refs:` map of the credentials document. */
function readRefs(text) {
  const refs = {};
  let inRefs = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^refs:\s*$/.test(line)) { inRefs = true; continue; }
    if (/^[A-Za-z0-9_]+:\s*$/.test(line)) { inRefs = false; continue; }
    if (!inRefs) continue;
    const match = line.match(/^\s+([A-Za-z0-9_]+):\s*(.+?)\s*$/);
    if (match) refs[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return refs;
}

/**
 * Collect the managed server rows from a profile patch file.
 * Only the `streamable-http` / `stdio` rows the manager accepts are returned.
 */
function readServers(text) {
  const servers = [];
  let current;
  for (const line of text.split(/\r?\n/)) {
    const rowStart = line.match(/^\s*-\s+id:\s*(\S+)\s*$/);
    if (rowStart) {
      current = { id: rowStart[1] };
      servers.push(current);
      continue;
    }
    if (current === undefined) continue;
    const serverName = line.match(/^\s+serverName:\s*(.+?)\s*$/);
    if (serverName) current.serverName = serverName[1];
    const url = line.match(/^\s+url:\s*(.+?)\s*$/);
    if (url) current.url = url[1];
    const transport = line.match(/^\s+transport:\s*(.+?)\s*$/);
    if (transport) current.transport = transport[1];
    const headerRef = line.match(/^\s+Authorization:\s*([A-Za-z_][A-Za-z0-9_]*)\s*$/);
    if (headerRef) current.authorizationRef = headerRef[1];
  }
  return servers.filter((server) => server.transport === 'streamable-http' && server.url !== undefined);
}

const MAX_PUBLIC_NAME_LENGTH = 64;
const INVALID_NAME_CHARS = /[^A-Za-z0-9_-]/g;
const HASH_LENGTH = 12;

/** Mirrors the plugin's public-name contract for model-facing tool names. */
function publicToolName(serverName, rawName) {
  const joined = `mcp__${serverName}__${rawName}`;
  const normalized = joined.replace(INVALID_NAME_CHARS, '_');
  if (normalized === joined && normalized.length <= MAX_PUBLIC_NAME_LENGTH) return normalized;
  const hash = createHash('sha256').update(`${serverName}\0${rawName}`).digest('hex').slice(0, HASH_LENGTH);
  return `${normalized.slice(0, MAX_PUBLIC_NAME_LENGTH - HASH_LENGTH - 1)}_${hash}`;
}

const refs = readRefs(readFileSync(credentialsPath, 'utf8'));
const servers = readServers(readFileSync(join(profileDir, 'cordis.patch.yml'), 'utf8'));

if (servers.length === 0) {
  console.log(`no managed streamable-http servers found in ${join(profileDir, 'cordis.patch.yml')}`);
  process.exit(1);
}

let total = 0;
let failures = 0;

for (const server of servers) {
  const name = server.serverName ?? server.id;
  const authorization = server.authorizationRef === undefined ? undefined : refs[server.authorizationRef];
  if (server.authorizationRef !== undefined && authorization === undefined) {
    console.log(`${name}: MISSING CREDENTIAL ${server.authorizationRef}`);
    failures += 1;
    continue;
  }

  const transport = new StreamableHTTPClientTransport(new URL(server.url), {
    requestInit: { headers: authorization === undefined ? {} : { Authorization: authorization } },
  });
  const client = new Client(
    { name: 'dsh-mcp-verify', version: '0.0.1' },
    {
      capabilities: {},
      versionNegotiation: { mode: 'auto' },
      listChanged: { tools: { autoRefresh: false, debounceMs: 0, onChanged: () => {} } },
    },
  );

  try {
    await client.connect(transport);
    const { tools } = await client.listTools(undefined, { cacheMode: 'refresh' });
    const publicNames = tools.map((tool) => publicToolName(name, tool.name));
    const invalid = publicNames.filter((publicName) => !/^[A-Za-z0-9_-]{1,64}$/u.test(publicName));
    total += tools.length;
    console.log(`${name}: ${tools.length} tools (auth=${authorization?.startsWith('Bearer ') ? 'bearer' : 'none'}, invalid names=${invalid.length})`);
    console.log(`  ${publicNames.slice(0, 3).join(', ')}${publicNames.length > 3 ? ', …' : ''}`);
  } catch (error) {
    failures += 1;
    console.log(`${name}: FAILED ${String(error?.message ?? error).slice(0, 240)}`);
  } finally {
    await client.close().catch(() => {});
  }
}

console.log(`\ntotal tools=${total} servers=${servers.length} failures=${failures}`);
process.exitCode = failures === 0 && total > 0 ? 0 : 1;
