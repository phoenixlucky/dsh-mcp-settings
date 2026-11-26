# Negotiation Surface and Remote Skills

## Goal

Bring this bundle's settings surface up to the MCP capability model described in the 2026-11-24 MCP update — Skills over MCP (`io.modelcontextprotocol/skills`), Tasks, Elicitation — to the extent the Host-side boundary allows, and give each server card a truthful account of what it negotiated.

Source article: `https://mp.weixin.qq.com/s/h_LvXURK1dvdoXornMPFDw` (MCP servers can now ship skills, run tasks, and more).

## Boundary

This bundle is a **Host-side settings page plus a vendored managed client**. The article's four capabilities land on different owners:

| Article capability | Owner | Disposition here |
| --- | --- | --- |
| Skills over MCP (`skills/list`, `skills/get`, `resources/read`) | this bundle can list names and descriptions over the connection it owns | **in scope: `skills/list` only** |
| Skill bodies, `frontmatter`, SHA-256 file manifests, `directoryRead` | a Host skill loader that does not exist in this composition | out of scope; the page states bodies are not loaded |
| Tasks (async handles, `tasks/get`, cancel) | Host agent runtime | out of scope; only the declaration is shown |
| Elicitation (`form` / `url`) | Host runtime prompt surface | out of scope; only the declaration is shown |
| File uploads | announced as "coming soon" | not claimed anywhere |
| Auth, scopes, rate limits | Host runtime | out of scope |

Only the extension names a server **declares** are reported. A declaration is not content: `resources`/`prompts` can be declared with empty lists, so the skills list is always read, never inferred from the flag.

## Gaps found

1. **Negotiation was invisible on the page.** `scripts/mcp-audit.mjs` reported revision, capabilities, and extensions per server, but the settings card showed only transport, tool count, and standing cost. An operator could not tell from the page whether a server had negotiated the modern revision or declared `skills` at all.
2. **Skills could not be discovered without reading them.** Progressive disclosure has two halves: list the names first, load a body on demand. The bundle had no `skills/list` path, so the only way to use a remote skill was to guess its name.
3. **Nothing enforced "declared first".** Skills work must not be attempted against a server that never declared the extension; the page had no way to say "not declared" as opposed to "declared but empty".

## Changes

### Contract (host → Client)

`McpServerStatus` gains four optional, additive fields; absent means "not reported", never "empty":

```ts
readonly protocolRevision?: string          // negotiated revision, e.g. "2025-11-25"
readonly serverVersion?: string             // serverInfo.version
readonly capabilities?: readonly string[]   // sorted declared capability keys, "extensions" excluded
readonly extensions?: readonly string[]     // sorted declared extension ids
```

New remote invocation, mirroring the existing resource bridge:

```ts
mcpServerManager.listSkills(serverId: string, cursor?: string)
  → { state: 'ready'; value: { skills: readonly { name: string; uri?: string; description?: string }[]; nextCursor?: string } }
  | { state: 'unavailable' | 'timed-out' | 'failed' }
```

Errors and gates:

| Situation | Result |
| --- | --- |
| row not enabled, not `model-tools`, or not connected | `unavailable` |
| row did not declare `io.modelcontextprotocol/skills` | `unavailable` (**no request is sent**) |
| connection generation changed mid-request | `unavailable` |
| `toolCallTimeoutMs` elapsed | `timed-out` |
| JSON-RPC error, or a payload that is not `{ skills: [...] }` | `failed` |

No new timeout, retry, or credential behavior: `listSkills` rides the managed row's existing `toolCallTimeoutMs` budget and its single live generation.

### Runtime pieces

- `vendor/dsh-mcp-client/lib/negotiation.js` (new, dependency-free) — `summarizeNegotiation()`, `declaresSkills()`, `projectSkillsList()`. Bounds: 200 skills per page, 120-byte names, 400-byte descriptions; entries without a string name are dropped, duplicates keep the first occurrence.
- `vendor/dsh-mcp-client/lib/types-DH-mQw7k.js` — the live per-server client records negotiation facts once the connection settles, publishes them on the status row, and answers `skills/list` from the same provider seam resources already use.
- `vendor/dsh-mcp-client/lib/managed.js` — `listSkills` with the declaration gate above.
- `vendor/dsh-mcp-client/lib/typert.host.js` / `typert.remote-client.js` — TYPERT descriptors for the new status fields and the new invocation.
- `lib/typert.host.js` — publish `mcpServerManager/listSkills` to Remote clients.

### Settings page (1.3.0)

- Each card's meta line gains the negotiated revision (`2025-11-25`), and a capability row lists declared extensions with the skills one marked.
- A **Skills** disclosure per connected card lists name and description only, pages through `nextCursor`, and states that bodies are not loaded and that the list comes from the server, not from a local cache. The disclosure is disabled with a "not declared" hint when the extension is missing.
- `scripts/mcp-audit.mjs` prints declared extensions, and the skills count when declared.

## Verification

```sh
node scripts/test-negotiation.mjs       # pure projection and gate rules
node scripts/test-skills-fixture.mjs    # real SDK client against a stdio fixture that declares skills
node scripts/test-client-bundle.mjs     # jsdom render of the shipped bundle, positive + negative
node scripts/mcp-audit.mjs              # live profile report
```

## Non-goals

- No `skills/get`, no `resources/directory/read`, no SKILL.md body loading, no SHA-256 manifest verification. Those need a Host skill loader that keeps provenance; this page only presents the server's own list.
- No Tasks, Elicitation, or file-upload support: no agent runtime here to honor them.
- No change to tool registration, timeouts, credentials, or transport behavior.
