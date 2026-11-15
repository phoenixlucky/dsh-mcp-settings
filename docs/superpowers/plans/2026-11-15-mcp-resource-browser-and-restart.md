# MCP Resource Browser and Server Restart Implementation Plan

> **For agentic workers:** This plan is executed natively in the current workspace. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add read-only resource browsing and per-server reconnection to the existing managed MCP settings page.

**Architecture:** Reuse each live MCP connection's existing resource provider. Associate managed providers with the stable server settings id in the host-local status catalog, and expose resource operations and a single-row restart through `ManagedMcpServerManager` remotes. Keep content transient in the Client UI and render untrusted text as plain text.

**Tech Stack:** Vendored TypeScript/JavaScript DSH MCP client artifacts, Cordis Typert remotes, React, CSS Modules, `tsdown`, English and Simplified Chinese locales.

**Spec:** `docs/superpowers/specs/2026-11-15-mcp-resource-browser-and-restart-design.md`

## Global Constraints

- Resource operations use the existing live managed connection and its existing credentials.
- A browser caller addresses a managed server by its stable settings id, never by arbitrary server name.
- Only enabled rows with a connected current generation can list or read resources.
- Resource read responses are limited to 512 KiB of serialized JSON.
- Text is rendered as plain text; binary payloads are represented by MIME type and size only.
- Resource content is transient and is never persisted, exported, logged, or sent to model context.
- Reconnect affects only one enabled managed row and leaves settings unchanged on failure.
- Do not add tool execution, OAuth, workspace-scoped configuration, or a new transport.
- Preserve all pre-existing working-tree changes; do not stage or commit unrelated files.

## Review Focus

- Duplicate server names from different DSH layers must not let the manager read another connection's resources; bind the provider to the managed row id.
- A stale request completing after disable, deletion, restart, or disconnect must not repopulate resource content.
- Large text and binary responses must not exceed the response limit or reach the UI as decoded binary data.
- A failed or timed-out reconnect must leave configuration and credential references untouched.
- Server-provided text and metadata must remain escaped plain text with no raw transport error or credential values.

## File Map

- `vendor/dsh-mcp-client/lib/types-DH-mQw7k.js`, `vendor/dsh-mcp-client/lib/types/types.d.ts`, `vendor/dsh-mcp-client/lib/types/status.{js,d.ts}`, and Typert host/client descriptors — pass an internal managed id to the live client, associate safe status summaries with it, and publish a connection-state revision for stale-view invalidation.
- `vendor/dsh-mcp-client/lib/managed.js` and `vendor/dsh-mcp-client/lib/types/managed.d.ts` — add id-scoped resource methods and one-row restart to the package's exported manager runtime and declaration.
- `vendor/dsh-mcp-client/lib/typert.host.{js,d.ts}` and `vendor/dsh-mcp-client/lib/typert.remote-client.{js,d.ts}` — keep generated remote contracts aligned with the manager API.
- `vendor/dsh-client-ui-settings-mcp/src/client/McpResources.tsx` — new transient resource browser component.
- `vendor/dsh-client-ui-settings-mcp/src/client/ManagedMcpServers.tsx`, `mcp-settings.module.css`, and `locales.ts` — connect the browser and reconnect action to existing server cards and translations.
- `vendor/dsh-client-ui-settings-mcp/lib/client.js` and its source map — regenerate from Client source.
- `README.md` and `README.zh.md` — document resource browsing and per-server reconnect.

## Tasks

### Task 1: Expose managed resource operations through the host manager

**Files:**
- Modify: `vendor/dsh-mcp-client/lib/types-DH-mQw7k.js`
- Modify: `vendor/dsh-mcp-client/lib/types/status.js`
- Modify: `vendor/dsh-mcp-client/lib/types/status.d.ts`
- Modify: `vendor/dsh-mcp-client/lib/managed.js`
- Modify: `vendor/dsh-mcp-client/lib/types/managed.d.ts`
- Modify: `vendor/dsh-mcp-client/lib/typert.host.js`
- Modify: `vendor/dsh-mcp-client/lib/typert.host.d.ts`
- Modify: `vendor/dsh-mcp-client/lib/typert.remote-client.js`
- Modify: `vendor/dsh-mcp-client/lib/typert.remote-client.d.ts`

**Interfaces:**
- The client runtime accepts optional internal `managedServerId`, supplied only by the manager. The status catalog's local `register()` stores a resource provider under that id; the provider is not part of the remote status result.
- `listResources(serverId: string, cursor?: string)`, `listResourceTemplates(serverId: string, cursor?: string)`, `readResource(serverId: string, uri: string)`, and `restart(serverId: string)` are remote methods on `ManagedMcpServerManager`.
- List/read methods return `{ state: 'ready', value }` or `{ state: 'unavailable' | 'timed-out' | 'failed' | 'too-large' }`. Resource list values contain safe resource summaries and an optional `nextCursor`; read values contain text blocks or binary metadata only.
- Restart returns `{ state: 'scheduled' }` or `{ state: 'unavailable' }`; completion is determined from the existing live status feed.

- [x] Pass `managedServerId: server.id` only from `startManagedClient`, accept it as an optional runtime-only client config field, and associate the current live connection's existing resource provider with it; clear it with that exact client disposal.
- [x] Add manager methods that validate the id, enabled setting, current connected status, and exact registered provider before every request.
- [x] Bound serialized resource reads to 512 KiB and use the manager's existing tool-call timeout; reject oversized reads without returning partial content.
- [x] Implement restart through the existing serialized reconciliation path with only the requested id in the restart set; reject missing or disabled rows.
- [x] Update the generated host and client Typert descriptors and declarations to match the runtime API.

### Task 2: Add the transient resource browser and reconnect controls

**Files:**
- Create: `vendor/dsh-client-ui-settings-mcp/src/client/McpResources.tsx`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/ManagedMcpServers.tsx`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/mcp-settings.module.css`
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/locales.ts`

**Interfaces:**
- `McpResources` receives the server's stable settings id, the typed manager remote, the current connected state, and its status id/revision.
- Resource list/template pages, selected content, and loading/error states remain component-local and are discarded when the disclosure closes or status disconnects.
- Reconnect is a card action that invokes only the selected server id and reports pending state until live status changes.

- [x] Add a keyboard-accessible Resources disclosure that loads the first list and template page only when opened, with continuation-cursor pagination.
- [x] Add on-demand resource reads; render text in escaped `<pre>` content and render blobs as MIME type and byte count only.
- [x] Discard asynchronous results when the server id, connection state, connection revision, or request generation changes; clear resource data on close or disconnect.
- [x] Search loaded resource summaries, provide a selected-resource preview, collapse templates, and adapt the list/preview layout to the panel width.
- [x] Refresh resource/template lists on demand while clearing stale previews and preserving the search query.
- [x] Match status rows by managed settings id and invalidate tool probes after configuration or connection revision changes.
- [x] Add the per-server reconnect action and pending state without blocking unrelated server cards.
- [x] Add English and Simplified Chinese copy for resource lists, pagination, loading, empty, disconnected, unavailable, failed, timeout, oversized response, and reconnecting states.
- [x] Style the disclosure, content view, and status controls using existing page tokens and preserve visible focus states.

### Task 3: Regenerate the Client bundle and document the behavior

**Files:**
- Regenerate: `vendor/dsh-client-ui-settings-mcp/lib/client.js` and its source map
- Modify: `README.md`
- Modify: `README.zh.md`

- [x] Run the existing `bundle` script from `vendor/dsh-client-ui-settings-mcp` and confirm generated output includes the new UI and locales.
- [x] Update both READMEs to describe read-only resource browsing, transient content handling, and per-server reconnect.
- [x] Review the final diff and `git status` to confirm all pre-existing unrelated changes remain untouched.

## Verification Limits

No tests or test files are included in this plan because the current task did not request test work. Verification is limited to the required Client bundle generation and read-only review of the changed interfaces, generated artifacts, documentation, and working-tree diff.
