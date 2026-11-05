# MCP Settings Management Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add safer import, filtering, diagnostics, tool inventory, redacted export, and reveal controls to the managed MCP settings page.

**Architecture:** Extend the existing MCP live-status payload with credential-safe tool summaries from the active client runtime. Keep the remaining behavior in the existing managed settings page, using transient client state for previews and secret visibility and the current managed settings format for export.

**Tech Stack:** TypeScript, React, CSS Modules, Cordis remote services, localized UI strings, existing vendored JavaScript runtime bundle.

**Spec:** `docs/superpowers/specs/2026-11-05-mcp-settings-management-enhancements-design.md`

## Global Constraints

- Tool-level enable/disable is out of scope.
- Credential values must never enter live status, exported JSON, logs, or persisted server settings.
- Diagnostics must use only the existing safe result categories and must not display raw transport exceptions or response bodies.
- The MCP settings page remains owned by `@tinyforge/dsh-mcp-settings`; do not move it to Harness settings.
- Secret reveal state is transient and each eye control affects only its own input.
- Preserve current JSON import formats, validation rules, and duplicate-skipping behavior.

## Review Focus

- An invalid import or credential-storage failure must leave the managed server list unchanged and keep the input available.
- A preview containing secret values must not write credentials before explicit confirmation or display those values.
- An export must never resolve credentials and must include only the managed settings and credential references.
- A disconnected or unavailable status must not present stale tool inventory as live data.
- Removing a secret row or closing/switching the editor must not reveal a different row after its index changes.

---

### Task 1: Publish safe tool summaries in live MCP status

**Files:**
- Modify: `vendor/dsh-mcp-client/lib/types/types.d.ts`
- Modify: `vendor/dsh-mcp-client/lib/types/status.d.ts`
- Modify: `vendor/dsh-mcp-client/lib/types/status.js`
- Modify: `vendor/dsh-mcp-client/lib/types-DH-mQw7k.js`
- Modify: `vendor/dsh-mcp-client/lib/typert.host.js`
- Modify: `vendor/dsh-mcp-client/lib/typert.remote-client.js`

**Interfaces:**
- Add `McpToolSummary` with `name: string` and `description: string`.
- Add `tools: readonly McpToolSummary[]` to `McpServerStatus`.
- Extend the status registration update patch to accept `tools` with `state` and `toolCount`.
- Publish an empty tool list before discovery and after disconnect; publish the current connected generation's names and descriptions after successful synchronization.

- [x] Update the declared status types and `McpClientStatusCatalog.register().update()` signature.
- [x] Update the shipped runtime bundle so tool synchronization keeps safe name/description summaries with the current generation and publishes them alongside state/count updates.
- [x] Update both generated Typert descriptors so host and client validate the extended live-status result and expose the matching type declaration.
- [x] Confirm the status producer clears summaries when a generation goes down and preserves the previous generation when a replacement synchronization fails before swap.
- [x] Ensure only the `types-DH-mQw7k.js` bundle imported by `managed.js` and `chrome.js` is changed; do not edit the unreferenced `types-C3MH1P_W.js` artifact.
- [x] Commit only the Task 1 files with message `feat: publish MCP tool summaries in status`.

### Task 2: Add server search, filters, and tool inventory UI

**Files:**
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/ManagedMcpServers.tsx`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/mcp-settings.module.css`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/locales.ts`

**Interfaces:**
- Derive the displayed rows from the existing `servers` array and `statuses` list; do not persist search or filter state.
- Add local search by case-insensitive `serverName`, a connection-state filter, and a transport filter.
- Read connected tool summaries from `McpServerStatus.tools`; do not add another remote call.

- [x] Add localized search, state-filter, transport-filter, clear-filter, no-match, and tool-inventory labels in English and Simplified Chinese.
- [x] Filter rows by server name, derived state (including disabled), and transport while retaining the existing card actions and edit state.
- [x] Add a per-card disclosure control with `aria-expanded` to show tool names and descriptions only for a connected status row; show localized empty and unavailable states as specified.
- [x] Update the responsive styles for the controls and expanded inventory.
- [x] Commit only the Task 2 files with message `feat: search MCP servers and inspect tools`.

### Task 3: Stage imports and add per-secret reveal controls

**Files:**
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/ManagedMcpServers.tsx`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/mcp-settings.module.css`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/locales.ts`

**Interfaces:**
- Keep a pending import preview in component state containing normalized server candidates, their secret values, and duplicate counts; do not call `remote.credentials.set` while parsing.
- Add a transient stable row key and visibility flag to editor-only secret rows; neither field enters `ManagedMcpServer` settings.

- [x] Refactor parsing into a preview phase that preserves both supported formats, validation, and duplicate-skipping behavior.
- [x] Render a preview of server name, transport, purpose, skipped duplicates, validation errors, and whether credentials will be stored, without rendering secret values.
- [x] Move credential writes and the single settings save to explicit confirmation; on errors, retain the JSON and preview and leave the server list unchanged.
- [x] Clear JSON and preview only after successful save; keep existing failure distinctions.
- [x] Add an accessible eye button to every secret value input, default hidden, toggling only that stable row; reset visibility when removing a row, changing transport, or closing/discarding the editor.
- [x] Add localized preview, confirmation, credential notice, and show/hide labels in English and Simplified Chinese.
- [x] Commit only the Task 3 files with message `feat: preview MCP imports and reveal secrets`.

### Task 4: Add safe connection guidance and managed settings export

**Files:**
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/ManagedMcpServers.tsx`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/mcp-settings.module.css`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/locales.ts`

**Interfaces:**
- Map each existing `ManagedMcpCheck.state` value to fixed localized guidance; do not parse exception text.
- Serialize `servers` from the current managed form snapshot to the existing `{ "servers": [...] }` format.

- [x] Add category-specific localized next steps for authorization-required, connection-failed, and timed-out results while preserving ready tool-count feedback.
- [x] Add a client-side JSON download action and a clear notice that credential values remain in the local credential store and must be configured separately on another profile.
- [x] Ensure export never calls the credentials remote and serializes only current managed settings, including credential references.
- [x] Add localized diagnostics, export, and credential-portability copy in English and Simplified Chinese.
- [x] Commit only the Task 4 files with message `feat: export MCP settings and explain checks`.

### Task 5: Regenerate the shipped client bundle and update feature documentation

**Files:**
- Regenerate: `vendor/dsh-client-ui-settings-mcp/lib/client.js` and its source map
- Modify: `README.md`
- Modify: `README.zh.md`

**Interfaces:**
- Use the existing `vendor/dsh-client-ui-settings-mcp` `bundle` script so the shipped Client companion matches its TypeScript source.
- Keep package exports and settings ownership unchanged.

- [x] Run the existing client bundle command and confirm the generated artifact contains the new controls and locale strings.
- [x] Update both READMEs to list search/filter, import preview, tool inventory, safe diagnostics, redacted export, and secret reveal.
- [x] Commit the generated bundle and README updates with message `docs: describe MCP settings enhancements`.

