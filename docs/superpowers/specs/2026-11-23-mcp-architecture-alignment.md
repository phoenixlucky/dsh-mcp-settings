# MCP Architecture Alignment

## Goal

Decide, against the public MCP architecture map (`https://phoenixlucky.github.io/tech-stack-tree/mcp.html`, which references MCP revision 2026-07-28), which of that map's recommendations this bundle can and should act on, and land the ones that belong here.

## Boundary

The map splits responsibilities across Host, Client, and Server. This bundle is a **Host-side settings surface plus a vendored managed client**. That fixes what it can change:

| Map concern | Owner in this repository | Disposition |
| --- | --- | --- |
| Transport, credential binding, server rows | this bundle (`cordis.patch.yml`, `vendor/dsh-mcp-client`) | in scope |
| Tool context cost visibility | this bundle (operator-facing measurement) | in scope, implemented |
| `mcp__<server>__<tool>` naming contract | this bundle (`vendor/dsh-mcp-client/lib/types/tools.js`) | in scope, measured |
| Code Mode / on-demand tool loading, `search_tools` | Host assembly (`dsh-tools`, agent runtime) | out of scope |
| Result truncation, cancellation, retry policy | Host runtime | out of scope |
| OAuth 2.1 + PKCE, audience binding | runtime auth provider; this bundle stores static bearer references | out of scope, residual risk reported |
| Prompts as `/server:prompt` commands | Host command surface | out of scope; counts reported only |
| Per-call audit log | Host runtime | out of scope; per-run audit record implemented |

## Gaps found

1. **Standing context cost was invisible.** Nothing in the repository answered "what does this profile cost the model before the first question". Measured reference point: a single configured server (`new-gold`) publishes 53 tools whose definitions total 23,751 UTF-8 bytes, about 5,900 tokens, before any work starts. That is the map's "context explosion / tool overload" failure mode, and it was previously unmeasured.
2. **The naming contract was duplicated, not reused.** `scripts/verify-mcp-servers.mjs` carried a hand-copied `publicToolName()` implementation. A drift between the copy and the runtime would have made every naming report quietly wrong (the map's "capability drift" failure mode).
3. **Credential and patch readers were triplicated** across `verify-mcp-servers.mjs`, `test-managed-auth.mjs`, and the audit work, each with its own idea of what a configured server is.
4. **A regression test failed for environmental reasons.** `test-managed-auth.mjs` reported four credential-handling failures whenever its fixture endpoint was offline or had lost its route, which is noise, not evidence.
5. **Negotiation facts were unobservable.** The negotiated protocol revision, declared capabilities, and attributed-instruction size were never surfaced, so version drift had to be diagnosed by hand.

## Changes

- `scripts/mcp-audit.mjs` (new) — connects with the runtime's own SDK and `versionNegotiation: { mode: 'auto' }`, then reports per server: negotiated revision, announced server identity, declared capabilities, attributed-instruction bytes, tool count, tool-definition bytes with a `bytes / 4` token estimate, the largest definitions, model-facing names the contract had to rewrite, fixed check results (transport class, credential binding, naming, context budget), and resource/prompt counts when declared. Emits an optional JSON audit record. Calls no tool, prints no secret, skips stdio rows unless `--allow-stdio`, and marks runtime-owned checks `unverifiable` instead of passing them.
- `scripts/lib/mcp-profile.mjs` (new) — single reader for a profile's patch rows and credential references; the audit and the credential regression test both use it.
- `scripts/test-managed-auth.mjs` — uses the shared reader, and reports `SKIP` with a reason when its fixture endpoint is closed or its MCP route is gone.
- `scripts/verify-mcp-servers.mjs` — deleted; the audit supersedes it and imports the runtime's real `publicToolName()` instead of copying it.
- `README.md` / `README.zh.md` — a paired "Auditing a server profile" / "接入体检" section and a features bullet for the card cost line; `README.i18n.yaml` re-recorded.
- Settings page (version 1.2.0) — each connected server card now states its standing cost as `{bytes} B · ≈{tokens} tok standing`, computed from the names and descriptions the live status already reports; the tool inventory gained one hint line stating that names are upstream names, that the model calls `mcp__<server>__<tool>` (long names are truncated with a hash suffix), and that the count excludes parameter schemas. Two locale keys were added to both dictionaries. The Client bundle was rebuilt with the repository's own build command, which also moved it to the current bundler output (148,028 → 112,757 bytes).

## Verification

```sh
node scripts/mcp-audit.mjs                                     # ~/.dsh/profiles/web
node scripts/mcp-audit.mjs "$HOME/.dsh/profiles/desktop"       # another profile
```

Observed on 2026-11-23:

- `web` — 3 rows, 1 connected. `new-gold`: negotiated `2026-07-28`, server `rmcp 3.6.0`, capability `tools`, 53 tools, 23,751 B (~5,938 tok), warning: tool count over the 40-tool budget. `chrome`: failed, `Route POST:/mcp-new not found` (endpoint served, MCP route absent). `cognee`: `authorization-required`, HTTP 401 during version negotiation.
- `desktop` — 4 rows, 3 connected, **144 tools / 177,275 B / ~44,319 tok of standing definition cost**. `mcp-chrome-super` alone is 84 tools and 148,051 B (~37,013 tok, 84% of the profile's total); `VISION-LIAO` declares `logging, prompts, resources, tools, extensions` with 1,051 B of instructions but lists zero resources and zero prompts.
- Credential regression test — `SKIP`: fixture endpoint answers 404.

`pnpm --dir ../deepseek-harness exec tsx scripts/verify-translation-pairing.ts ../dsh-mcp/README.md` reports `1 named pair(s) consistent`.

## Findings worth acting on

- A profile can spend more context on tool definitions than most tasks spend on the task. `mcp-chrome-super` (84 tools, ~37k tokens) is the clear case: this is the map's "tool overload" failure mode with a number attached, and the fix belongs to Host assembly (on-demand loading or a narrower tool surface), not to this bundle.
- Declaring a capability is not the same as publishing its contents: `VISION-LIAO` advertises `resources` and `prompts` yet returns an empty list for both. Browsers and audits must read the list, not the declaration.
- Rows are serialized in the settings UI's key order, so `- url:` can precede `- id:`. Any reader that starts a row at `- id:` mis-parses such a profile; this was fixed in the shared reader.

## Non-goals

- No change to the managed runtime's protocol behavior, tool registration, timeouts, or credential storage.
- No OAuth, Code Mode, prompt browser, or per-call audit store.
- The page does not compute model-facing tool names. `McpToolSummary` reports upstream names only, and the naming rule lives in the runtime; copying it into the Client would recreate the very duplication this change removed. The card shows a static hint instead.

## Why the runtime field was not added

The obvious fix — publish `publicName` in `McpToolSummary` — cannot be built from the current toolchain: the pinned vendor snapshot is `@deepseek-ai/dsh-mcp-client@0.2.2-alpha.2`, while the sibling checkout `E:\home\deepseek-harness` now carries `0.2.2-rc.4`, where the managed-server status surface this bundle vendors no longer exists (no `managed.ts`/`chrome.ts`, no `McpToolSummary`). Rebuilding artifacts from that checkout would produce a different runtime, not a patched one, and hand-editing the pinned compiled bundles would be lost on the next re-vendor. The cost line therefore uses the fields the pinned snapshot actually publishes, and states that schema bytes are excluded.

Newer DSH already ships the map's context-economics answer for the runtime side: `packages/mcp/mcp-client/src/tool-loading.ts` keeps a server's tools out of the registry and registers only the ones an agent loads through that server's `load_tools` loader. Re-vendoring this bundle onto such a runtime is the real follow-up, and it is a compatibility task of its own.

## Open items

- The Client UI still shows upstream tool names only. Showing the model-facing name needs a runtime field, which in turn needs either a re-vendored runtime or an upstream change.
- The local `web` profile installs `@tinyforge/dsh-mcp-settings` from a pinned tarball; the 1.2.0 tarball was built but the profile is upgraded only when its dependency and install are updated.
- `README.i18n.yaml` is still packed: npm and pnpm always include files whose name starts with `readme`, and a `!README.i18n.yaml` entry in `files` does not exclude it. Only renaming would.
