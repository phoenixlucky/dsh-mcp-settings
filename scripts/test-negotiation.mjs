/**
 * Unit tests for the negotiation and skills projections.
 *
 * These functions are what the vendored client publishes on a status row and what the settings page
 * renders, so they are pinned here without a Host: a value in, a value out. The point of most cases
 * is the negative direction — an absent or malformed field must stay absent rather than become a
 * confident zero.
 *
 * Usage: node scripts/test-negotiation.mjs
 */
import {
  SKILL_DESCRIPTION_BYTES,
  SKILL_NAME_BYTES,
  SKILLS_EXTENSION,
  SKILLS_PAGE_LIMIT,
  declaresExtension,
  declaresSkills,
  isRevisionEnvelopeViolation,
  projectSkillsList,
  summarizeNegotiation,
} from '../vendor/dsh-mcp-client/lib/negotiation.js'

const encoder = new TextEncoder()

const cases = []
/**
 * Register one assertion.
 * @param {string} label - What the case proves.
 * @param {() => boolean} check - Predicate over the value under test.
 */
function test(label, check) {
  cases.push({ label, check })
}

const initializeResult = {
  protocolVersion: '2025-11-25',
  capabilities: {
    resources: {},
    tools: { listChanged: false },
    tasks: { list: {}, cancel: {} },
    extensions: { [SKILLS_EXTENSION]: { directoryRead: false } },
  },
  serverInfo: { name: 'fixture', version: '1.4.2' },
}

test('summary keeps the negotiated revision and server version', () => {
  const summary = summarizeNegotiation(initializeResult)
  return summary.protocolRevision === '2025-11-25' && summary.serverVersion === '1.4.2'
})

test('capability names are sorted and exclude the extensions key', () => {
  const summary = summarizeNegotiation(initializeResult)
  return JSON.stringify(summary.capabilities) === JSON.stringify(['resources', 'tasks', 'tools'])
})

test('extension ids are reported separately from capability names', () => {
  const summary = summarizeNegotiation(initializeResult)
  return JSON.stringify(summary.extensions) === JSON.stringify([SKILLS_EXTENSION])
})

test('a server that reports nothing gets no invented fields', () => {
  const summary = summarizeNegotiation({})
  return Object.keys(summary).length === 0
})

test('capabilities that are null or booleans are not declarations', () => {
  const summary = summarizeNegotiation({ capabilities: { tools: null, prompts: true } })
  return summary.capabilities === undefined
})

test('an empty extension record leaves extensions absent, not empty', () => {
  const summary = summarizeNegotiation({ capabilities: { extensions: {} } })
  return summary.extensions === undefined && summary.capabilities === undefined
})

test('the summary is frozen so a caller cannot mutate catalog state', () => {
  const summary = summarizeNegotiation(initializeResult)
  return Object.isFrozen(summary) && Object.isFrozen(summary.capabilities) && Object.isFrozen(summary.extensions)
})

test('a declared skills extension is detected', () => {
  return declaresSkills(summarizeNegotiation(initializeResult))
})

test('no declaration means no skills, even for another extension', () => {
  const other = summarizeNegotiation({ capabilities: { extensions: { 'io.modelcontextprotocol/tasks': {} } } })
  return declaresSkills(other) === false && declaresExtension(other, 'io.modelcontextprotocol/tasks') === true
})

test('a row without extensions is not treated as declaring skills', () => {
  return declaresSkills({}) === false && declaresSkills(undefined) === false
})

test('a skills page keeps names, uris, and descriptions', () => {
  const page = projectSkillsList({
    skills: [
      { name: 'code-review', description: 'Review a diff against the checklist.', uri: 'skill://code-review' },
      { name: 'invoice-audit' },
    ],
  })
  return JSON.stringify(page) === JSON.stringify({
    skills: [
      { name: 'code-review', uri: 'skill://code-review', description: 'Review a diff against the checklist.' },
      { name: 'invoice-audit', description: '' },
    ],
  })
})

test('an entry without a string name is dropped rather than shown blank', () => {
  const page = projectSkillsList({ skills: [{ name: 42 }, { name: 'kept' }, { description: 'nameless' }] })
  return page.skills.length === 1 && page.skills[0].name === 'kept'
})

test('a SEP-2640 entry is read from frontmatter, not only from flat fields', () => {
  const page = projectSkillsList({
    skills: [{
      uri: 'skill://chrome-browser/SKILL.md',
      frontmatter: { name: 'chrome-browser', description: 'Observe and verify browser tasks.' },
      resources: [{ uri: 'skill://chrome-browser/SKILL.md', digest: 'sha256:bba32a6f', size: 2046 }],
    }],
    ttlMs: 300000,
    cacheScope: 'public',
  })
  return JSON.stringify(page) === JSON.stringify({
    skills: [{ name: 'chrome-browser', uri: 'skill://chrome-browser/SKILL.md', description: 'Observe and verify browser tasks.' }],
  })
})

test('frontmatter wins over flat fields when an entry carries both', () => {
  const page = projectSkillsList({ skills: [{ name: 'flat-name', description: 'flat', frontmatter: { name: 'spec-name', description: 'spec' } }] })
  return page.skills.length === 1 && page.skills[0].name === 'spec-name' && page.skills[0].description === 'spec'
})

test('a frontmatter entry without a name is still dropped', () => {
  const page = projectSkillsList({ skills: [{ frontmatter: { description: 'nameless' } }, { frontmatter: { name: 'kept' } }] })
  return page.skills.length === 1 && page.skills[0].name === 'kept' && page.skills[0].description === ''
})

test('a frontmatter name longer than the budget is trimmed like a flat one', () => {
  const name = '检查'.repeat(80)
  const page = projectSkillsList({ skills: [{ frontmatter: { name } }] })
  const bytes = encoder.encode(page.skills[0].name).length
  return bytes <= SKILL_NAME_BYTES && page.skills[0].name.endsWith('…')
})

test('both shapes in one page keep their own names, and a repeated one is deduped', () => {
  const page = projectSkillsList({
    skills: [
      { frontmatter: { name: 'from-frontmatter' } },
      { name: 'from-flat' },
      { frontmatter: { name: 'from-flat' } },
    ],
  })
  return JSON.stringify(page.skills.map(skill => skill.name)) === JSON.stringify(['from-frontmatter', 'from-flat'])
})

test('duplicate names keep the first occurrence', () => {
  const page = projectSkillsList({ skills: [{ name: 'same', description: 'first' }, { name: 'same', description: 'second' }] })
  return page.skills.length === 1 && page.skills[0].description === 'first'
})

test('a payload without a skills array is undefined, not an empty page', () => {
  return projectSkillsList({ resources: [] }) === undefined
    && projectSkillsList(undefined) === undefined
    && projectSkillsList([{ name: 'x' }]) === undefined
})

test('the page stops at the per-page limit', () => {
  const many = Array.from({ length: SKILLS_PAGE_LIMIT + 25 }, (_item, index) => ({ name: `skill-${index}` }))
  return projectSkillsList({ skills: many }).skills.length === SKILLS_PAGE_LIMIT
})

test('an over-long name is trimmed to its byte budget on a code-point boundary', () => {
  const name = '技能'.repeat(80)
  const page = projectSkillsList({ skills: [{ name }] })
  const bytes = encoder.encode(page.skills[0].name).length
  return bytes <= SKILL_NAME_BYTES && page.skills[0].name.endsWith('…') && page.skills[0].name.startsWith('技能')
})

test('an over-long description is trimmed to its byte budget', () => {
  const page = projectSkillsList({ skills: [{ name: 'x', description: 'd'.repeat(SKILL_DESCRIPTION_BYTES * 2) }] })
  return encoder.encode(page.skills[0].description).length <= SKILL_DESCRIPTION_BYTES
})

test('the next cursor is carried only when it is a non-empty string', () => {
  const withCursor = projectSkillsList({ skills: [], nextCursor: 'page-2' })
  const withoutCursor = projectSkillsList({ skills: [], nextCursor: 7 })
  return withCursor.nextCursor === 'page-2' && withoutCursor.nextCursor === undefined
})

test('an empty skills list is a real answer and stays distinct from undefined', () => {
  const page = projectSkillsList({ skills: [] })
  return Array.isArray(page.skills) && page.skills.length === 0
})

test('the SDK revision-envelope rejection is recognized by its violation tag', () => {
  const error = Object.assign(new Error('Invalid result for skills/list: missing required resultType'), {
    name: 'SdkError',
    code: 'INVALID_RESULT',
    data: { method: 'skills/list', violation: 'missing-resultType' },
  })
  return isRevisionEnvelopeViolation(error) === true
})

test('a plain failure is not mistaken for a revision-envelope rejection', () => {
  return isRevisionEnvelopeViolation(new Error('boom')) === false
    && isRevisionEnvelopeViolation({ code: 'INVALID_RESULT', data: { violation: 'other' } }) === false
    && isRevisionEnvelopeViolation(undefined) === false
})

let failures = 0
for (const { label, check } of cases) {
  let passed = false
  try {
    passed = check() === true
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
