/**
 * Test the skills bridge on the manager itself, without a Host.
 *
 * `listSkills` is the Remote method the settings page calls, so its gates and failure classes are
 * pinned here against a stand-in status catalog and connection provider: this is where "declared
 * first", timeout, generation change, and payload bounds are decided. The SDK round trip itself is
 * covered by `test-skills-fixture.mjs`.
 *
 * Usage: node scripts/test-skills-manager.mjs
 */
import { ManagedMcpServerManager } from '../vendor/dsh-mcp-client/lib/managed.js'
import { SKILLS_EXTENSION } from '../vendor/dsh-mcp-client/lib/negotiation.js'

/** One managed row and the status row the catalog reports for it. */
function harness({ declared = true, state = 'connected', provide }) {
  const server = {
    id: 'fixture',
    serverName: 'fixture',
    enabled: true,
    purpose: 'model-tools',
    transport: 'stdio',
    command: process.execPath,
    args: [],
    cwd: '',
    envRefs: {},
  }
  const statusRow = {
    id: 'fixture:1',
    managedServerId: 'fixture',
    serverName: 'fixture',
    transport: 'stdio',
    source: 'node',
    state,
    toolCount: 0,
    tools: [],
    ...declared ? { extensions: [SKILLS_EXTENSION] } : {},
  }
  const holder = { revision: 1, state }
  const provider = {
    calls: [],
    async request(request, execution) {
      provider.calls.push(request)
      return provide({ request, execution, holder })
    },
  }
  const catalog = {
    list: () => [statusRow],
    getManagedResourceHandle: (id) => (id === 'fixture' ? { provider, revision: holder.revision, state: holder.state } : undefined),
  }
  const manager = Object.create(ManagedMcpServerManager.prototype)
  manager.ctx = { get: (key) => (key === 'mcpClientStatus' ? catalog : undefined), logger: { warn() {}, error() {}, info() {} } }
  manager.config = { servers: [server] }
  manager.tuning = { toolCallTimeoutMs: 2_000 }
  manager.active = new Map([[server.id, { fingerprint: 'x', fiber: {} }]])
  return { manager, provider, holder, statusRow }
}

const cases = []
/**
 * Register one async case.
 * @param {string} label - What the case proves.
 * @param {() => Promise<boolean>} check - Async predicate.
 */
function test(label, check) {
  cases.push({ label, check })
}

test('a declared server yields a bounded skills page', async () => {
  const { manager } = harness({
    provide: () => ({ skills: [{ name: 'code-review', description: 'Review a diff.' }, { name: 'invoice-audit', description: 'Check claims.', uri: 'skill://invoice-audit' }], nextCursor: 'page-2' }),
  })
  const result = await manager.listSkills('fixture')
  return result.state === 'ready'
    && result.value.skills.length === 2
    && result.value.skills[0].name === 'code-review'
    && result.value.nextCursor === 'page-2'
})

test('the cursor is forwarded to the server unchanged', async () => {
  const { manager, provider } = harness({ provide: () => ({ skills: [] }) })
  await manager.listSkills('fixture', 'page-3')
  return provider.calls[0]?.method === 'skills/list' && provider.calls[0]?.cursor === 'page-3'
})

test('a server that never declared the extension is refused before the wire', async () => {
  let called = false
  const { manager } = harness({ declared: false, provide: () => { called = true; return { skills: [] } } })
  const result = await manager.listSkills('fixture')
  return result.state === 'unavailable' && called === false
})

test('a declared server with an empty list is ready, not unavailable', async () => {
  const { manager } = harness({ provide: () => ({ skills: [] }) })
  const result = await manager.listSkills('fixture')
  return result.state === 'ready' && Array.isArray(result.value.skills) && result.value.skills.length === 0
})

test('a disconnected row is unavailable', async () => {
  const { manager } = harness({ state: 'disconnected', provide: () => ({ skills: [] }) })
  return (await manager.listSkills('fixture')).state === 'unavailable'
})

test('a payload that is not a skill list fails instead of reporting zero skills', async () => {
  const { manager } = harness({ provide: () => ({ items: [] }) })
  return (await manager.listSkills('fixture')).state === 'failed'
})

test('a rejected request is classified as failed', async () => {
  const { manager } = harness({ provide: () => { throw new Error('boom') } })
  return (await manager.listSkills('fixture')).state === 'failed'
})

test('a request past the timeout budget is classified as timed out', async () => {
  const { manager } = harness({
    provide: ({ execution }) => new Promise((_resolve, reject) => {
      execution.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'TimeoutError' })), { once: true })
    }),
  })
  manager.tuning = { toolCallTimeoutMs: 20 }
  return (await manager.listSkills('fixture')).state === 'timed-out'
})

test('a generation change mid-request is classified as unavailable', async () => {
  const { manager, holder } = harness({ provide: () => { holder.revision += 1; return { skills: [{ name: 'late', description: '' }] } } })
  return (await manager.listSkills('fixture')).state === 'unavailable'
})

test('an oversized page is refused rather than shipped to the page', async () => {
  const { manager } = harness({ provide: () => ({ skills: [{ name: 'huge', description: 'x'.repeat(600 * 1024) }] }) })
  return (await manager.listSkills('fixture')).state === 'too-large'
})

test('a project-memory row never exposes skills', async () => {
  const { manager } = harness({ provide: () => ({ skills: [] }) })
  manager.config = { servers: [{ ...manager.config.servers[0], purpose: 'project-memory' }] }
  return (await manager.listSkills('fixture')).state === 'unavailable'
})

test('a SEP-2640 page reaches the page with its frontmatter names intact', async () => {
  const { manager } = harness({
    provide: () => ({
      skills: [{
        uri: 'skill://chrome-browser/SKILL.md',
        frontmatter: { name: 'chrome-browser', description: 'Observe and verify browser tasks.' },
        resources: [{ uri: 'skill://chrome-browser/SKILL.md', digest: 'sha256:bba32a6f', size: 2046 }],
      }],
      ttlMs: 300000,
      cacheScope: 'public',
    }),
  })
  const result = await manager.listSkills('fixture')
  return result.state === 'ready'
    && result.value.skills.length === 1
    && result.value.skills[0].name === 'chrome-browser'
    && result.value.skills[0].uri === 'skill://chrome-browser/SKILL.md'
})

let failures = 0
for (const { label, check } of cases) {
  let passed = false
  try {
    passed = (await check()) === true
  } catch (error) {
    console.log(`FAIL  ${label} → threw ${error instanceof Error ? error.message : String(error)}`)
    failures += 1
    continue
  }
  if (!passed) failures += 1
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`)
}

console.log(`\n${cases.length - failures}/${cases.length} passed${failures === 0 ? '' : `, ${failures} failed`}`)
process.exitCode = failures === 0 ? 0 : 1
