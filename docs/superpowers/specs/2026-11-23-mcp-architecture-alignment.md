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
- `README.md` / `README.zh.md` — a paired "Auditing a server profile" / "接入体检" section; `README.i18n.yaml` re-recorded.

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
- No settings-page change: adding cost or model-facing-name display requires rebuilding the Client bundle and verifying it in a live profile, which cannot be validated from this repository alone.
- No OAuth, Code Mode, prompt browser, or per-call audit store.

## Open items

- The Client UI still shows raw upstream tool names while the model sees `mcp__<server>__<tool>`. The audit exposes the mapping; showing it in the page needs a UI build plus live verification.
- The local `web` profile installs `@tinyforge/dsh-mcp-settings@1.0.41` from a pinned tarball while this repository is at 1.1.1, so UI behavior verified here is not necessarily what that profile runs.
