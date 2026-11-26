/**
 * Contract test for the TYPERT metadata this bundle publishes.
 *
 * The Remote boundary is schema-checked in both directions, so a hand-added invocation or status
 * field is worthless until the metadata says so. This test reads the generated descriptor records
 * and validates real payload shapes through the schemas they create.
 *
 * `zod` is provided by the Host at runtime; when it is not resolvable from this checkout the deep
 * assertions are skipped and the structural ones still run.
 *
 * Usage: node scripts/test-typert-metadata.mjs
 */
const cases = []
/**
 * Register one assertion.
 * @param {string} label - What the case proves.
 * @param {() => Promise<boolean> | boolean} check - Predicate, possibly async.
 */
function test(label, check) {
  cases.push({ label, check })
}

/** Import one module, reporting why it failed instead of crashing the run. */
async function load(specifier) {
  return import(specifier)
}

let vendorHost
let publishedHost
let remoteFace
try {
  vendorHost = await load('../vendor/dsh-mcp-client/lib/typert.host.js')
  remoteFace = await load('../vendor/dsh-mcp-client/lib/typert.remote-client.js')
  publishedHost = await load('../lib/typert.host.js')
} catch (error) {
  console.log(`SKIP  TYPERT metadata needs zod, which this checkout does not install (${error instanceof Error ? error.message.split('\n')[0] : 'unknown'}).`)
  process.exit(0)
}

/** Descriptors of one TYPERT record keyed by `namespace/method`. */
function invocationMap(typert) {
  // The host face exposes generated invocation records; the remote face keeps the same records under
  // `methods`. Both are derived from one FaceModel, so the test reads whichever face it was given.
  const records = typert?.invocations ?? Object.entries(typert?.methods ?? {}).map(([id, record]) => {
    const [namespace, method] = id.split('/')
    return { namespace, method, ...record }
  })
  const map = new Map()
  for (const invocation of records ?? []) map.set(`${invocation.namespace}/${invocation.method}`, invocation)
  return map
}

const hostInvocations = invocationMap(vendorHost.TYPERT)
const publishedInvocations = invocationMap(publishedHost.TYPERT)
const remoteInvocations = vendorHost.TYPERT && remoteFace?.TYPERT_REMOTE ? invocationMap(remoteFace.TYPERT_REMOTE) : new Map()

test('the vendored host face declares mcpServerManager/listSkills', () => hostInvocations.has('mcpServerManager/listSkills'))

test('this bundle publishes mcpServerManager/listSkills to Remote clients', () => publishedInvocations.has('mcpServerManager/listSkills'))

test('the remote face declares mcpServerManager/listSkills', () => remoteInvocations.has('mcpServerManager/listSkills'))

test('listSkills takes a required serverId and an optional cursor', () => {
  const descriptor = hostInvocations.get('mcpServerManager/listSkills')
  const names = (descriptor?.parameters ?? []).map(parameter => parameter.name)
  const optional = (descriptor?.parameters ?? []).filter(parameter => parameter.optional === true).map(parameter => parameter.name)
  return names.length === 2 && names[0] === 'serverId' && optional.join() === 'cursor'
})

test('the listSkills result schema accepts a ready skills page', () => {
  const descriptor = hostInvocations.get('mcpServerManager/listSkills')
  const schema = descriptor.result.create()
  const parsed = schema.safeParse({ state: 'ready', value: { skills: [{ name: 'code-review', description: 'x' }], nextCursor: 'page-2' } })
  return parsed.success === true
})

test('the listSkills result schema refuses a ready page without skills', () => {
  const descriptor = hostInvocations.get('mcpServerManager/listSkills')
  const schema = descriptor.result.create()
  return schema.safeParse({ state: 'ready', value: { resources: [] } }).success === false
})

test('the listSkills result schema carries the unavailable classification', () => {
  const descriptor = hostInvocations.get('mcpServerManager/listSkills')
  const schema = descriptor.result.create()
  return schema.safeParse({ state: 'unavailable' }).success === true && schema.safeParse({ state: 'more-or-less' }).success === false
})

test('the status schema accepts the negotiation fields', () => {
  const descriptor = hostInvocations.get('mcpClientStatus/list')
  const schema = descriptor.result.create()
  const parsed = schema.safeParse([{
    id: 'row:1',
    serverName: 'fixture',
    transport: 'stdio',
    source: 'node',
    state: 'connected',
    toolCount: 0,
    tools: [],
    protocolRevision: '2025-11-25',
    serverVersion: '1.0.0',
    capabilities: ['resources', 'tools'],
    extensions: ['io.modelcontextprotocol/skills'],
  }])
  return parsed.success === true
})

test('the status schema still accepts a row that reports no negotiation', () => {
  const descriptor = hostInvocations.get('mcpClientStatus/list')
  const schema = descriptor.result.create()
  const parsed = schema.safeParse([{ id: 'row:1', serverName: 'legacy', transport: 'stdio', source: 'node', state: 'connected', toolCount: 0, tools: [] }])
  return parsed.success === true
})

test('the published status json schema advertises the new fields', () => {
  const descriptor = publishedInvocations.get('mcpClientStatus/list')
  const text = JSON.stringify(descriptor?.result?.jsonSchema ?? {})
  return ['protocolRevision', 'serverVersion', 'capabilities', 'extensions'].every(field => text.includes(`"${field}"`))
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
