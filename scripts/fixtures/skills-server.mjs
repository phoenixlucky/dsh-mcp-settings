/**
 * Stdio MCP server fixture for the skills-extension tests.
 *
 * Hand-written over newline-delimited JSON-RPC so the test needs no MCP server package: the
 * repository only depends on `@modelcontextprotocol/client`. It is deliberately strict about the
 * three situations the settings page must tell apart:
 *
 *   - a server that declares `io.modelcontextprotocol/skills` and lists skills
 *   - the same server, page two, which is a real empty answer
 *   - a server that declares the extension but publishes an empty list
 *   - a server that never declares the extension at all
 *   - a server that declares it and answers with a malformed payload
 *
 * Env: `FIXTURE_MODE` (`skills` default, `empty`, `no-extension`, `garbage`), `FIXTURE_LOG` (append
 * every inbound and outbound message as JSON lines). The mode may also be passed as the first
 * argument, which is how the audit test drives it: the audit spawns a row's command without
 * forwarding its own environment.
 */
import fs from 'node:fs'
import readline from 'node:readline'

const mode = process.argv[2] ?? process.env.FIXTURE_MODE ?? 'skills'
const logPath = process.env.FIXTURE_LOG ?? ''
const SKILLS_EXTENSION = 'io.modelcontextprotocol/skills'

/** Append one framed message to the fixture log, when enabled. */
function log(entry) {
  if (logPath === '') return
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`)
}

/** Write one JSON-RPC message to stdout. */
function send(message) {
  log({ out: message })
  process.stdout.write(`${JSON.stringify(message)}\n`)
}

/** Capabilities for the selected mode. */
function capabilities() {
  const base = { tools: {}, resources: {} }
  if (mode === 'no-extension') return base
  return { ...base, extensions: { [SKILLS_EXTENSION]: { directoryRead: false } } }
}

/** Payload for one `skills/list` page. */
function skillsPage(params) {
  if (mode === 'garbage') return { items: [{ name: 'nested-wrong-key' }] }
  if (mode === 'empty') return { skills: [] }
  if (typeof params?.cursor === 'string') return { skills: [] }
  // Page one carries both published shapes on purpose: the first entry mirrors SEP-2640
  // (`frontmatter` plus an entry-level manifest), the second is the flat shape an earlier
  // draft used. A projection that only reads one of them silently loses half the page.
  return {
    skills: [
      {
        uri: 'skill://code-review/SKILL.md',
        frontmatter: { name: 'code-review', description: 'Review a diff against the project checklist.' },
        resources: [
          { uri: 'skill://code-review/SKILL.md', digest: 'sha256:0000000000000000000000000000000000000000000000000000000000000001', size: 512 },
        ],
      },
      { name: 'invoice-audit', description: 'Check expense claims against policy.', uri: 'skill://invoice-audit' },
    ],
    nextCursor: 'page-2',
  }
}

/** Answer one request. */
function handle(message) {
  const { id, method, params } = message
  switch (method) {
    case 'initialize':
      send({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? '2025-11-25',
          capabilities: capabilities(),
          serverInfo: { name: 'skills-fixture', version: '1.0.0' },
        },
      })
      return
    case 'tools/list':
      send({ jsonrpc: '2.0', id, result: { tools: [] } })
      return
    case 'resources/list':
      send({ jsonrpc: '2.0', id, result: { resources: [] } })
      return
    case 'skills/list':
      if (mode === 'no-extension') send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: skills/list' } })
      else send({ jsonrpc: '2.0', id, result: skillsPage(params) })
      return
    case 'ping':
      send({ jsonrpc: '2.0', id, result: {} })
      return
    default:
      // Version negotiation probes with `server/discover`; answering "not found" is how an earlier
      // revision's server behaves, so the client falls back to `initialize`.
      if (id !== undefined) send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${String(method)}` } })
  }
}

const input = readline.createInterface({ input: process.stdin })
input.on('line', (line) => {
  if (line.trim() === '') return
  let message
  try {
    message = JSON.parse(line)
  } catch {
    return
  }
  log({ in: message })
  if (message.method !== undefined) handle(message)
})
