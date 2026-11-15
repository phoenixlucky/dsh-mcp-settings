/**
 * Regression test for managed MCP credential handling.
 *
 * Exercises the real `checkManagedMcpServer` path (transport + SDK + headers)
 * against a live modern-only endpoint, so it needs no model call.
 *
 * Covers:
 *   1. a bare token stored in an `Authorization` reference (legacy form)
 *   2. the same secret already carrying the `Bearer` scheme
 *   3. a profile with no credential provider at all, for a row with no secret
 *   4. a profile with no credential provider, for a row that references one
 *
 * Usage: node scripts/test-managed-auth.mjs
 */
import { readFileSync } from 'node:fs';
import { checkManagedMcpServer } from '../vendor/dsh-mcp-client/lib/managed.js';

const CREDENTIALS = 'C:/Users/Administrator/.dsh/.credentials.yaml';
const ENDPOINT = 'http://127.0.0.1:12306/mcp-new';

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

const stored = readRefs(readFileSync(CREDENTIALS, 'utf8'));
const bare = (stored.DSH_CHROME_MCP_TOKEN ?? '').replace(/^Bearer\s+/iu, '');
const bearer = `Bearer ${bare}`;

/** Provider stub: behaves like the credential store for the values under test. */
const provider = { resolve: async (ref) => ({ value: stored[String(ref)] }) };

const ctx = { logger: { warn() {}, error() {}, info() {} } };

const row = (headerRefs) => ({
  id: 'chrome',
  serverName: 'chrome',
  enabled: true,
  purpose: 'model-tools',
  transport: 'streamable-http',
  url: ENDPOINT,
  headers: {},
  headerRefs,
});

const cases = [
  {
    label: '1. bare token in an Authorization ref (legacy / migrated config)',
    credentials: { resolve: async () => ({ value: bare }) },
    server: row({ Authorization: 'ANY_REF' }),
    expect: (result) => result.state === 'ready' && result.toolCount > 0,
  },
  {
    label: '2. secret already carries the Bearer scheme',
    credentials: provider,
    server: row({ Authorization: 'MCP_CHROME_AUTHORIZATION' }),
    expect: (result) => result.state === 'ready' && result.toolCount > 0,
  },
  {
    label: '3. no credential provider, row references no secret',
    credentials: undefined,
    server: row({}),
    expect: (result) => result.state === 'authorization-required',
  },
  {
    label: '4. no credential provider, row references a secret',
    credentials: undefined,
    server: row({ Authorization: 'ANY_REF' }),
    expect: (result) => result.state === 'connection-failed',
  },
];

let failures = 0;
for (const testCase of cases) {
  const result = await checkManagedMcpServer(ctx, testCase.credentials, testCase.server, 10_000);
  const passed = testCase.expect(result);
  if (!passed) failures += 1;
  const detail = result.state === 'ready' ? `toolCount=${result.toolCount}` : `state=${result.state}`;
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${testCase.label} → ${detail}`);
}

console.log(`\n${failures === 0 ? 'all passed' : `${failures} failed`}`);
process.exitCode = failures === 0 ? 0 : 1;
