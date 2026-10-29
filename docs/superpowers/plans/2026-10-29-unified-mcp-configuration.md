# Unified MCP Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the managed MCP server list the only MCP connection settings UI and config source for ordinary servers, Chrome, and Cognee.

**Architecture:** Extend managed server entries with regular HTTP headers and a purpose that distinguishes model-facing tools from the Cognee memory consumer. The manager owns and validates each row; a registered Cognee consumer receives the internal row without publishing Cognee tools to the model. Migrate legacy Chrome and Cognee settings into ordinary rows, remove their dedicated cards/configs, then rebuild and sync the runtime and UI artifacts into `dsh-mcp`.

**Tech Stack:** TypeScript, Cordis plugins, Typert services, MCP SDK, React, Vitest, tsdown, pnpm.

**Spec:** [2026-10-29-mcp-configuration-unification-design.md](../specs/2026-10-29-mcp-configuration-unification-design.md)

## Global Constraints

- The `mcp-server-manager` row is the only persisted source for MCP endpoints, transports, credentials, and enablement.
- Cognee MCP operations remain internal to memory and its existing recall/proposal allow-list.
- Credential values remain in the credential store; server rows contain credential references.
- Existing `new-gold` and unrelated managed server rows keep their current values.
- Upgrade migration preserves pre-existing user-edited managed rows and converts legacy plugin settings without copying secret values.
- Runtime source changes live in `E:/home/deepseek-harness`; bundle sources and shipped copies live in `E:/home/dsh-mcp`.

## Review Focus

- HTTP `Origin` and other regular headers reach both checks and live connections, while secret values remain out of config/status/logs. Pin in Task 1's manager tests.
- A Cognee row is never model-visible, including when a tool appears after reconnection. Pin in Task 2's consumer and tool-registry tests.
- Cognee memory stops when its row is disabled or removed and resumes with its last saved row when enabled. Pin in Task 2's provider tests.
- Legacy settings migrate only when no matching managed row exists; rerunning migration is harmless and does not overwrite a user-edited row. Pin in Task 3's migration tests.
- Removing Chrome/Cognee cards does not remove or alter unrelated managed rows and appearance preferences. Pin in Task 3's UI tests.

---

### Task 1: Extend the managed MCP server contract

**Files:**
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/src/types.ts`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/src/managed.ts`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/src/transport.ts`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/src/status.ts`
- Test: `E:/home/deepseek-harness/packages/mcp/mcp-client/tests/managed.spec.ts`
- Test: `E:/home/deepseek-harness/packages/mcp/mcp-client/tests/apply.spec.ts`

**Interfaces:**
- Add `ManagedMcpPurpose = 'model-tools' | 'project-memory'` to the persisted managed row; omitted values parse as `model-tools` for existing rows.
- HTTP rows gain `headers: Record<string, string>` for non-secret headers while `headerRefs` remains the secret reference map.
- Add `registerConsumer(purpose, consumer)` to `ManagedMcpServerManager`. A consumer supplies `start(server)` and `check(server)` callbacks; `start` returns the async disposer for that row. Registration starts matching rows already in the list, and disposal stops those rows while retaining their configuration.
- `model-tools` rows continue through the existing generic client. `project-memory` rows require a registered consumer and are never passed to the model tool registry.

- [x] Write failing tests for default purpose compatibility, HTTP regular headers plus resolved secret headers, purpose-based consumer dispatch, a missing consumer failing closed without model exposure, consumer disposal on row disable/removal, and check delegation.
- [x] Run `pnpm exec vitest run packages/mcp/mcp-client/tests/managed.spec.ts packages/mcp/mcp-client/tests/apply.spec.ts` and confirm the new cases fail for the missing contract.
- [x] Implement purpose validation, safe regular-header validation, transport merging, consumer lifecycle/reconciliation, and check dispatch in the files above.
- [x] Run the same focused test command and confirm both the new cases and existing manager/client lifecycle cases pass.

### Task 2: Move Chrome and Cognee onto the managed contract

**Files:**
- Modify: `E:/home/deepseek-harness/packages/mcp/cognee-memory/src/index.ts`
- Modify: `E:/home/deepseek-harness/packages/mcp/cognee-memory/package.json`
- Modify: `E:/home/deepseek-harness/packages/mcp/cognee-memory/tests/client.spec.ts`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/src/chrome.ts`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/tests/chrome.spec.ts`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/README.md`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/README.zh.md`
- Modify: `E:/home/deepseek-harness/packages/mcp/mcp-client/README.i18n.yaml`
- Modify: `E:/home/deepseek-harness/packages/mcp/cognee-memory/README.md`
- Modify: `E:/home/deepseek-harness/packages/mcp/cognee-memory/README.zh.md`
- Modify: `E:/home/deepseek-harness/packages/mcp/cognee-memory/README.i18n.yaml`

**Interfaces:**
- `CogneeMemoryService` registers the `project-memory` consumer with `mcpServerManager` and receives the ordinary validated row through that consumer. It reads legacy endpoint/credential fields only as a temporary upgrade fallback until the matching managed row appears.
- `mcp-chrome` remains a hidden migration shim for one release so existing settings stay readable; once a managed Chrome row appears, it stops the legacy connection and does not read or write the old fields. New Chrome connections use the `model-tools` purpose, generic Streamable HTTP transport, regular `Origin` headers, and secret header references.
- The existing Cognee recall/proposal behavior, redaction, timeout, and allow-list stay unchanged.

- [x] Write failing provider tests for Cognee readiness and calls using the managed row, disabled/missing row behavior, credential resolution, and absence of every Cognee tool from `ctx.tools`.
- [x] Run `pnpm exec vitest run packages/mcp/cognee-memory/tests/client.spec.ts` and confirm the new tests fail against the old standalone config path.
- [x] Rewire Cognee to register and dispose its purpose consumer, with a legacy fallback that is ignored as soon as the managed row exists. Rewire Chrome as an upgrade-only shim that yields to a managed row and never owns the new row's connection.
- [x] Update package docs to describe generic server configuration and the Cognee internal-only purpose.
- [x] Run targeted Cognee client + MCP manager + replacement Chrome shim suites (25/25 passed); the standalone Cognee lifecycle suite has 3 proposal-timing failures.

### Task 3: Unify the MCP settings page and migrate legacy config

**Files:**
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/src/client/index.ts`
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/src/client/McpConnectionsPage.tsx`
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/src/client/ManagedMcpServers.tsx`
- Delete: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/src/client/ChromeCard.tsx`
- Delete: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/src/client/CogneeCard.tsx`
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/src/client/locales.ts`
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/README.md`
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/README.zh.md`
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/README.i18n.yaml`
- Modify: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/tests/mcp-settings-layout.client.spec.ts`
- Create: `E:/home/deepseek-harness/packages/client/ui-settings-mcp/tests/managed-mcp.client.spec.tsx`

**Interfaces:**
- `ManagedMcpServers` edits the row purpose, HTTP regular headers, and secret references in one form.
- The page receives the managed-server form and live status service; it no longer renders dedicated Chrome or Cognee cards.
- When the settings plugin first sees the legacy and managed forms, migrate legacy Chrome/Cognee values into matching managed rows. A pre-existing row is authoritative. After a successful save, clear the old endpoint/enablement fields while preserving credential values in the credential store. This runs before the settings section is registered, not only when a user opens the page.

- [x] Add failing UI/migration tests for Chrome row conversion (including Origin and token reference), Cognee row conversion, an existing-row conflict, repeat migration, clearing legacy fields only after a successful save, and one-list rendering without either dedicated card.
- [x] Run the focused UI tests and confirm the migration cases initially fail before implementation.
- [x] Implement the unified editor and migration; route all product copy through the paired English and Chinese locale dictionaries.
- [x] Run focused UI tests (8/8 pass), `tsdown` UI bundle, and bilingual README pairing checks.

### Task 4: Update the bundle, upgrade docs, and vendored package

**Files:**
- Modify: `E:/home/dsh-mcp/cordis.patch.yml`
- Modify: `E:/home/dsh-mcp/package.json`
- Modify: `E:/home/dsh-mcp/README.md`
- Modify: `E:/home/dsh-mcp/README.zh.md`
- Modify: `E:/home/dsh-mcp/README.i18n.yaml`
- Modify: `E:/home/dsh-mcp/vendor/dsh-client-ui-settings-mcp/src/client/`
- Modify: `E:/home/dsh-mcp/vendor/dsh-client-ui-settings-mcp/lib/`
- Modify: `E:/home/dsh-mcp/vendor/dsh-mcp-client/package.json` and its `lib/` runtime/type artifacts
- Modify: `E:/home/dsh-mcp/vendor/dsh-mcp-cognee-memory/package.json` and its `lib/` runtime/type artifacts
- Create: `E:/home/deepseek-harness/docs/upgrade-guide/v0.2.2-alpha.2/mcp-configuration/guide.md`
- Create: `E:/home/deepseek-harness/docs/upgrade-guide/v0.2.2-alpha.2/mcp-configuration/guide.zh.md`
- Create/update: `E:/home/deepseek-harness/docs/upgrade-guide/v0.2.2-alpha.2/mcp-configuration/guide.i18n.yaml`

**Interfaces:**
- The bundle keeps the Chrome and Cognee legacy rows only as temporary migration shims. New endpoints and user edits live only in the manager's `servers` list; the Chrome shim defaults disabled and both shims yield to matching managed rows.
- The published `dsh-mcp-settings` payload contains the rebuilt unified UI and matching manager/Cognee runtime artifacts. The Chrome shim remains packaged for migration compatibility but is no longer presented as a configurable MCP.
- The bilingual upgrade guide documents the legacy keys, automatic migration behavior, and how users verify each converted server.

- [x] Inspect the bundle composition and package manifest to confirm the Chrome migration shim is disabled, the two dedicated cards are absent, and rebuilt server-list UI artifacts are included; focused UI migration tests cover the single-list composition.
- [x] Update the bilingual bundle READMEs and create the upgrade guide in the same change as the removed settings surface.
- [x] Run `pnpm exec vitest run scripts/verify-cordis-config.spec.ts scripts/publication-payload.spec.ts` (28/28 passed) and the upgrade-guide/translation-pairing checks.
- [x] Run `pnpm run build:artifacts` in `E:/home/deepseek-harness`, rebuild the UI with `pnpm exec tsdown --config ../dsh-mcp/vendor/dsh-client-ui-settings-mcp/tsdown.config.ts`, and copy the built manager/Cognee package artifacts into the corresponding `dsh-mcp/vendor` packages.
- [x] Run `pnpm run build:check` in `E:/home/deepseek-harness` (host and client aggregate checks pass); run `git diff --check` and inspect both repository diffs for stale Chrome/Cognee card/config references.

