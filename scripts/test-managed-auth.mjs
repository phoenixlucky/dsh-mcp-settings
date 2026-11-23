/**
 * Regression test for managed MCP credential handling.
 *
 * Exercises the real `checkManagedMcpServer` path (transport + SDK + headers) against a live
 * modern-only endpoint, so it needs no model call.
 *
 * Covers:
 *   1. a bare token stored in an `Authorization` reference (legacy form)
 *   2. the same secret already carrying the `Bearer` scheme
 *   3. a profile with no credential provider at all, for a row with no secret
 *   4. a profile with no credential provider, for a row that references one
 *
 * When the endpoint is not listening the run reports SKIP and exits 0: an offline service is not
 * evidence that credential handling regressed.
 *
 * Usage: node scripts/test-managed-auth.mjs [profileDir]
 */
import { checkManagedMcpServer } from '../vendor/dsh-mcp-client/lib/managed.js';
import { DEFAULT_PROFILE_DIR, readProfileRefs } from './lib/mcp-profile.mjs';

/** Live modern-only endpoint used as the fixture. */
const ENDPOINT = 'http://127.0.0.1:12306/mcp-new';

/**
 * Check that the fixture endpoint is actually serving an MCP route right now.
 *
 * A closed port and a stale route both look like "connection failed" to the code under test, but
 * neither says anything about credential handling. Only a live route runs the cases.
 * @param {string} url - Endpoint to probe.
 * @returns {Promise<{ready: true} | {ready: false, reason: string}>} probe verdict.
 */
async function probeFixture(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
      signal: AbortSignal.timeout(1500),
    });
    if (response.status === 404) return { ready: false, reason: 'endpoint answers 404; the MCP route is not served' };
    return { ready: true };
  } catch (error) {
    return { ready: false, reason: `endpoint unreachable (${String(error?.cause?.code ?? error?.name ?? error)})` };
  }
}

const fixture = await probeFixture(ENDPOINT);
if (!fixture.ready) {
  console.log(`SKIP  ${ENDPOINT}: ${fixture.reason}. Start a modern MCP server there and rerun.`);
  process.exit(0);
}

const stored = readProfileRefs(process.argv[2] ?? DEFAULT_PROFILE_DIR);
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
