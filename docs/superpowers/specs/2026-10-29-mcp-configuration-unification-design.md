# MCP Configuration Unification

## Goal

Make the managed MCP server list the only user-facing and persisted source for MCP connection settings. Chrome and Cognee use the same server entry fields as every other server; Cognee keeps its internal memory behavior and does not expose its MCP tools to the model.

## User experience

- The MCP settings page has one server list and one editor for Streamable HTTP and stdio servers.
- Remove the Chrome and Cognee cards, including their separate endpoint, credential, enablement, and status controls.
- Configure Chrome and Cognee by adding or editing ordinary server rows. HTTP rows support regular request headers and separately stored secret header references.
- A Cognee row is managed by the memory integration. Its enabled state controls the memory connection. The list row reports the memory integration's readiness state.
- Preserve existing ordinary managed server rows, including `new-gold`.

## Configuration ownership and runtime

- `mcp-server-manager` owns the canonical server list, its editable fields, credential references, and enablement state.
- Chrome connects through the ordinary managed MCP client using the row's URL, headers, and credential references. It does not use a separate Chrome endpoint configuration or bridge-specific UI.
- Cognee's memory integration consumes the matching managed server row and its credentials. The integration may keep its dedicated connection lifecycle because it needs to validate the Cognee tools and mediate task-scoped memory operations.
- The managed client must delegate a Cognee-owned row to the memory integration instead of registering its tools in the model-facing tool registry. The memory integration continues to allow only its existing recall and proposal operations.
- The Cognee integration registers the row's readiness in the same status list shown by the ordinary server editor. There is no separate Cognee status screen.
- No endpoint, header, credential, or enabled setting is stored in a second Cognee- or Chrome-specific configuration object.

## Compatibility and migration

- On upgrade, convert existing Chrome settings into the equivalent managed HTTP row, including its endpoint, Origin header, token reference, and enabled state.
- Convert existing Cognee settings into the equivalent managed HTTP row, including endpoint, authorization credential reference, and enabled state.
- Preserve credential values in the credential store; migrate references only.
- If a matching managed row already exists, preserve that row as authoritative and do not overwrite user edits with legacy settings.
- Keep the existing `new-gold` row and any other managed rows unchanged.
- After migration, the removed card-specific settings are no longer read or written.

## Safety and failure behavior

- Cognee tools remain unavailable as model-facing tools. The memory integration rejects tools outside its existing allow-list.
- Credential values never appear in the server list, status responses, logs, or error text. HTTP credentials continue to resolve from credential references at connection time.
- Invalid or missing server configuration produces the existing safe connection/readiness status and does not delete the saved row.
- A disabled or removed Cognee row stops memory access without affecting other managed MCP rows.

## Verification

- Test migration of legacy Chrome and Cognee settings, including when a target row already exists.
- Test that generic HTTP headers and secret references reach the transport correctly, without leaking credential values.
- Test that Chrome works through the managed client with its Origin and authentication headers.
- Test that Cognee reads the managed row, keeps memory enablement behavior, and never registers its tools in the model-facing registry.
- Test that deleting/disabling the Cognee row stops memory access while other managed rows keep running.
- Build and validate the runtime packages in `deepseek-harness`, rebuild the settings UI package, refresh its vendored artifacts in this repository using the documented vendor procedure, and verify both repositories' relevant test/build gates.
