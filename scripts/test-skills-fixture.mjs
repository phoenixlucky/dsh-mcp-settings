/**
 * Integration test: read a real server's declaration and list its skills.
 *
 * Runs the installed MCP SDK client against `scripts/fixtures/skills-server.mjs`, so the handshake,
 * the negotiated revision, the declared extensions, and the `skills/list` round trip are exercised
 * on the wire rather than mocked. The projections under test are the same ones the vendored client
 * publishes to the settings page.
 *
 * Usage: node scripts/test-skills-fixture.mjs
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { declaresSkills, projectSkillsList, summarizeNegotiation } from '../vendor/dsh-mcp-client/lib/negotiation.js'

const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'skills-server.mjs')

/**
 * Minimal Standard Schema validator for one `skills/list` result.
 *
 * The runtime validates server payloads before projecting them, so the test does the same: a
 * malformed answer must fail here rather than reach the page as an empty list.
 */
const skillsListSchema = {
  '~standard': {
    version: 1,
    vendor: 'dsh-mcp-settings-test',
    validate(value) {
      if (typeof value !== 'object' || value === null) return { issues: [{ message: 'result must be an object' }] }
      if (!Array.isArray(value.skills)) return { issues: [{ message: 'result.skills must be an array' }] }
      const issues = []
      value.skills.forEach((entry, index) => {
        if (typeof entry?.name !== 'string') issues.push({ message: `skills[${index}].name must be a string` })
      })
      return issues.length > 0 ? { issues } : { value }
    },
  },
}

/**
 * Run one fixture session and hand back the log of what crossed the wire.
 * @param {string} mode - `FIXTURE_MODE` for the fixture.
 * @param {(context: { summary: object, list: (cursor?: string) => Promise<unknown> }) => Promise<void>} body - Test body.
 * @returns {Promise<readonly object[]>} Framed fixture log entries.
 */
async function session(mode, body) {
  const logPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-skills-')), 'log.ndjson')
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [FIXTURE],
    env: { ...process.env, FIXTURE_MODE: mode, FIXTURE_LOG: logPath },
  })
  const client = new Client(
    { name: 'skills-fixture-test', version: '0.0.1' },
    { capabilities: {}, versionNegotiation: { mode: 'auto' }, listChanged: { tools: { autoRefresh: false, debounceMs: 0, onChanged: () => {} } } },
  )
  try {
    await client.connect(transport)
    const summary = summarizeNegotiation({
      protocolVersion: client.getNegotiatedProtocolVersion(),
      serverInfo: client.getServerInfo?.() ?? { version: '1.0.0' },
      capabilities: client.getServerCapabilities(),
    })
    await body({
      summary,
      list: async (cursor) => client.request(
        { method: 'skills/list', params: cursor === undefined ? {} : { cursor } },
        skillsListSchema,
      ),
    })
  } finally {
    await client.close().catch(() => {})
  }
  const text = fs.readFileSync(logPath, 'utf8').trim()
  return text === '' ? [] : text.split('\n').map(line => JSON.parse(line))
}

/** Count inbound requests with one method name. */
function inboundCount(log, method) {
  return log.filter(entry => entry.in?.method === method).length
}

let failures = 0
/**
 * Report one assertion.
 * @param {string} label - What the case proves.
 * @param {boolean} passed - Assertion result.
 * @param {string} [detail] - Observed value for the log line.
 */
function assert(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}${detail === '' ? '' : ` → ${detail}`}`)
}

// 1. A server that declares the extension and lists two skills.
let pageOne
let pageTwo
let declaredSummary
let declaredLog
await session('skills', async ({ summary, list }) => {
  declaredSummary = summary
  pageOne = projectSkillsList(await list())
  pageTwo = projectSkillsList(await list('page-2'))
  declaredLog = undefined
}).then(log => { declaredLog = log })

assert('negotiation reports a revision for a server that answers initialize', typeof declaredSummary.protocolRevision === 'string', declaredSummary.protocolRevision)
assert('the skills extension is visible on the negotiated capabilities', declaresSkills(declaredSummary), JSON.stringify(declaredSummary.extensions))
assert('declared capabilities are published in sorted order', JSON.stringify(declaredSummary.capabilities) === JSON.stringify(['resources', 'tools']), JSON.stringify(declaredSummary.capabilities))
assert('the first page carries both skills with descriptions', pageOne?.skills.length === 2 && pageOne.skills[1].description.includes('expense'), JSON.stringify(pageOne?.skills.map(skill => skill.name)))
assert('the optional skill uri survives the projection', pageOne?.skills[1].uri === 'skill://invoice-audit')
assert('a next cursor is reported when the server pages', pageOne?.nextCursor === 'page-2', String(pageOne?.nextCursor))
assert('the second page is a real empty page, not an undefined answer', Array.isArray(pageTwo?.skills) && pageTwo.skills.length === 0 && pageTwo.nextCursor === undefined)
assert('each page cost exactly one skills/list request', inboundCount(declaredLog, 'skills/list') === 2, String(inboundCount(declaredLog, 'skills/list')))

// 2. A server that declares the extension but publishes nothing.
let emptyPage
await session('empty', async ({ summary, list }) => {
  assert('an empty publisher still declares skills', declaresSkills(summary))
  emptyPage = projectSkillsList(await list())
})
assert('a declared-but-empty server yields an empty page', Array.isArray(emptyPage?.skills) && emptyPage.skills.length === 0)

// 3. A server that never declares the extension: the caller must not even ask.
let missingSummary
let missingLog = []
await session('no-extension', async ({ summary }) => { missingSummary = summary }).then(log => { missingLog = log })
assert('a server without the extension reports no extensions', missingSummary.extensions === undefined, JSON.stringify(missingSummary))
assert('no declaration means no skills', declaresSkills(missingSummary) === false)
assert('the gate kept skills/list off the wire', inboundCount(missingLog, 'skills/list') === 0, String(inboundCount(missingLog, 'skills/list')))

// 4. A server that declares the extension and answers with the wrong shape.
let garbageRejected
await session('garbage', async ({ summary, list }) => {
  assert('the malformed-payload server still declares skills', declaresSkills(summary))
  try {
    projectSkillsList(await list())
    garbageRejected = false
  } catch {
    garbageRejected = true
  }
})
assert('a payload without a skills array is rejected before projection', garbageRejected === true)

// 5. The audit reports the declaration and the list for a profile row that points at the fixture.
/**
 * Write a one-row profile whose stdio command launches the fixture.
 * @param {string} mode - `FIXTURE_MODE` for that row.
 * @returns {string} The profile directory.
 */
function writeProfile(mode) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-skills-profile-'))
  const profileDir = path.join(dir, 'profiles', 'skills')
  fs.mkdirSync(profileDir, { recursive: true })
  // `readProfileRefs` reads `<profileDir>/../../.credentials.yaml`.
  fs.writeFileSync(path.join(dir, '.credentials.yaml'), 'refs:\n')
  fs.writeFileSync(path.join(profileDir, 'cordis.patch.yml'), [
    '- insert:',
    '    - id: mcp-server-manager',
    "      name: '@tinyforge/dsh-mcp-settings/managed'",
    '      config:',
    '        servers:',
    '          - id: fixture',
    '            serverName: fixture',
    '            enabled: true',
    '            purpose: model-tools',
    '            transport: stdio',
    '            command: node',
    '            args:',
    `              - ${FIXTURE.replace(/\\/g, '/')}`,
    `              - ${mode}`,
    `            cwd: ${path.dirname(FIXTURE).replace(/\\/g, '/')}`,
    '            envRefs: {}',
    '',
  ].join('\n'))
  return profileDir
}

/** Run the audit against one profile and return its stdout. */
async function runAudit(mode) {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const run = promisify(execFile)
  const profileDir = writeProfile(mode)
  const { stdout } = await run(process.execPath, [path.join(import.meta.dirname, 'mcp-audit.mjs'), profileDir, '--allow-stdio', '--timeout', '15000'], { timeout: 120_000 })
  return stdout
}

const auditOut = await runAudit('skills')
assert('the audit reports the declared extension', auditOut.includes('extensions: io.modelcontextprotocol/skills'), auditOut.split('\n').filter(line => line.includes('extension')).join(' | '))
assert('the audit lists the skills it read', /skills=2 \(code-review, invoice-audit\)/.test(auditOut), auditOut.split('\n').filter(line => line.includes('skills=')).join(' | '))

const plainAudit = await runAudit('no-extension')
assert('a server without the extension prints no extension or skills line', !plainAudit.includes('io.modelcontextprotocol/skills'), plainAudit.split('\n').filter(line => line.includes('skills=')).join(' | '))

console.log(`\n${failures === 0 ? 'all passed' : `${failures} failed`}`)
process.exitCode = failures === 0 ? 0 : 1
