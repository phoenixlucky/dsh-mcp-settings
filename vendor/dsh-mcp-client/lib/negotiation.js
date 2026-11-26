/**
 * Pure projection of what one MCP connection negotiated, plus the bounded
 * projection of a `skills/list` result.
 *
 * Kept dependency-free so the vendored client can import it at runtime and the
 * repository's own scripts can import the same file to test it without a Host.
 * Nothing here performs I/O: a value in, a value out.
 *
 * @module @deepseek-ai/dsh-mcp-client/negotiation
 */

/** Extension identifier for Skills over MCP. */
export const SKILLS_EXTENSION = 'io.modelcontextprotocol/skills'

/** Most skills one page may carry before the projection stops listing them. */
export const SKILLS_PAGE_LIMIT = 200

/** UTF-8 byte budget for one skill name. */
export const SKILL_NAME_BYTES = 120

/** UTF-8 byte budget for one skill description. */
export const SKILL_DESCRIPTION_BYTES = 400

/** Capability keys reported separately rather than as a declared capability. */
const EXTENSIONS_KEY = 'extensions'

/**
 * Read a non-empty string, or nothing.
 * @param value - Candidate value from a server response.
 * @returns The value when it is a non-empty string.
 */
function text(value) {
  return typeof value === 'string' && value !== '' ? value : undefined
}

/**
 * Sorted keys whose value is a declared object.
 * @param record - Candidate capability record.
 * @returns Declared names in stable order; empty when the record is not an object.
 */
function declaredNames(record) {
  if (typeof record !== 'object' || record === null) return []
  return Object.entries(record)
    .filter(([, value]) => typeof value === 'object' && value !== null)
    .map(([key]) => key)
    .sort()
}

/**
 * Summarize one connection's negotiation for a status row.
 *
 * Every field is omitted rather than guessed when the server did not report it,
 * so an absent field means "unknown", never "empty".
 * @param input - Negotiated identity: protocol revision, server info, capabilities.
 * @returns A credential-safe summary safe to publish on the settings page.
 */
export function summarizeNegotiation(input) {
  const capabilities = input?.capabilities
  const declared = declaredNames(capabilities).filter(name => name !== EXTENSIONS_KEY)
  const extensions = declaredNames(capabilities?.[EXTENSIONS_KEY])
  const protocolRevision = text(input?.protocolVersion)
  const serverVersion = text(input?.serverInfo?.version)
  const summary = {}
  if (protocolRevision !== undefined) summary.protocolRevision = protocolRevision
  if (serverVersion !== undefined) summary.serverVersion = serverVersion
  if (declared.length > 0) summary.capabilities = Object.freeze(declared)
  if (extensions.length > 0) summary.extensions = Object.freeze(extensions)
  return Object.freeze(summary)
}

/**
 * Whether a status row's published summary declares one extension.
 * @param summary - Status fields carrying `extensions`.
 * @param id - Extension identifier to look for.
 * @returns True only when the server declared that exact extension.
 */
export function declaresExtension(summary, id) {
  const extensions = summary?.extensions
  return Array.isArray(extensions) && extensions.includes(id)
}

/**
 * Whether a status row declared Skills over MCP.
 *
 * A declaration is a precondition, not content: callers must still read the list
 * rather than infer skills from the flag.
 * @param summary - Status fields carrying `extensions`.
 * @returns True only when the skills extension was declared.
 */
export function declaresSkills(summary) {
  return declaresExtension(summary, SKILLS_EXTENSION)
}

/** Byte length of one string in UTF-8. */
const encoder = new TextEncoder()

/**
 * Trim one string to a byte budget on a code-point boundary.
 * @param value - Source string.
 * @param budget - Maximum UTF-8 bytes.
 * @returns The original string, or a truncated one ending in an ellipsis.
 */
function trimBytes(value, budget) {
  if (encoder.encode(value).length <= budget) return value
  let result = ''
  let used = 0
  for (const character of value) {
    const size = encoder.encode(character).length
    if (used + size > budget - 3) break
    result += character
    used += size
  }
  return `${result}…`
}

/**
 * Project one `skills/list` payload into the settings page's vocabulary.
 *
 * Names and descriptions only: a skill body is a separate, explicitly authorized
 * read that this projection never performs.
 * @param raw - Value the server returned for `skills/list`.
 * @returns The bounded page, or undefined when the payload is not a skill list.
 */
export function projectSkillsList(raw) {
  if (typeof raw !== 'object' || raw === null) return undefined
  const entries = raw.skills
  if (!Array.isArray(entries)) return undefined
  const seen = new Set()
  const skills = []
  for (const entry of entries) {
    if (skills.length >= SKILLS_PAGE_LIMIT) break
    const name = text(entry?.name)
    if (name === undefined) continue
    const trimmed = trimBytes(name, SKILL_NAME_BYTES)
    if (seen.has(trimmed)) continue
    seen.add(trimmed)
    const description = text(entry?.description)
    const uri = text(entry?.uri)
    const skill = { name: trimmed }
    if (uri !== undefined) skill.uri = trimBytes(uri, SKILL_DESCRIPTION_BYTES)
    skill.description = description === undefined ? '' : trimBytes(description, SKILL_DESCRIPTION_BYTES)
    skills.push(Object.freeze(skill))
  }
  const nextCursor = text(raw.nextCursor)
  const page = { skills: Object.freeze(skills) }
  if (nextCursor !== undefined) page.nextCursor = nextCursor
  return Object.freeze(page)
}
