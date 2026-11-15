# MCP Resource Browser and Server Restart

## Goal

Let an operator inspect resources exposed by a configured MCP server and retry one server's connection from the existing MCP settings page, without restarting the DSH profile.

## Approved scope

- Read-only resource browsing for enabled, connected managed servers: list resources, list resource templates, and read a selected resource.
- A per-server **Reconnect** action that disposes and recreates only that server's managed client using its saved configuration and credential references.
- The resource browser is user-initiated. Resource content stays in the settings UI and is never sent to model context.

## Current behavior and constraints

The settings page already shows safe live connection state and tool summaries, supports a temporary connection check, and manages credentials through the DSH credential store. The managed client connection already implements the MCP resource list/read protocol and registers a provider with `dsh-mcp-resources`, but that provider is currently reachable through model-facing shared tools rather than a settings-page remote API. The manager tracks each active client fiber and reconciles configuration changes, but it does not expose a per-server restart operation.

Resource operations must use the existing live connection and its existing credentials. Do not start a second connection for browsing, expose credentials or transport configuration through resource responses, or add a second MCP transport implementation.

## User experience

### Resource browser

- Add a **Resources** disclosure to each enabled, connected managed server card. Keep it unavailable for disabled, disconnected, or non-managed rows.
- Opening it fetches the first page of resources and resource templates on demand. Provide a **Load more** action when the server returns a continuation cursor.
- Provide a labeled search over the resource summaries already loaded; explain when more pages can be loaded to continue searching. Selecting a resource reads only that item and shows it in a single preview with its metadata.
- Use a list and preview side by side when the panel is wide, then stack them when narrow. Keep resource templates in a collapsed native disclosure.
- Provide an explicit **Refresh lists** action. Refreshing discards the selected resource and loaded pages, then reloads the first page while retaining the search query.
- Selecting a resource reads it and displays text content as plain text. Do not interpret HTML, Markdown links, or other server-provided content as trusted UI markup.
- For binary content, display the MIME type and payload size only; do not decode or embed the payload.
- Bound a single read response to 512 KiB of serialized JSON. If a response exceeds the limit, return a safe `too-large` result and ask the user to select a smaller resource. Use the existing managed MCP tool-call timeout.
- Show localized loading, empty, disconnected, unavailable, error, and oversized-resource states. Keep server-provided error text out of the UI.
- Closing the Resources disclosure, changing the managed connection revision, or losing connection clears its transient resource list and selected content. Do not persist resource data.

### Server card actions

- Keep **Resources**, **View tools**, **Reconnect**, and the enabled switch available on the card.
- Put **Edit** and **Delete** under a keyboard-operable **More** disclosure so maintenance actions do not crowd the routine actions.

### Reconnect

- Add a per-server **Reconnect** action for enabled managed rows, including rows whose live status is disconnected or reconnecting.
- Disable the action while that server is already being restarted. Other server cards remain usable.
- Reuse the saved server row and the existing credential references. Show a pending state until the new generation reports connected or disconnected; do not report success merely because the restart request was accepted.
- Keep the saved settings unchanged if reconnection fails.

## Host and Client interfaces

1. Keep using the resource provider already returned by the live MCP connection; do not create a second connection or duplicate the MCP protocol operations.
2. Extend the host-local MCP status catalog to retain that provider under the managed row's stable settings `id`. The safe status summary may expose the optional managed settings id and a connection-state revision for exact UI matching and stale-view invalidation. This registration and resource-provider lookup stay host-local; the catalog gains no remote resource methods, and standalone client rows without a managed id cannot be browsed through this UI path.
3. Add remote methods to `ManagedMcpServerManager` for resource list, template list, resource read, and restart. Each method resolves a managed server by its stable settings `id`, verifies that its live status is connected, rejects missing, disabled, or unsupported rows, and delegates to the provider registered for that exact id. A browser caller cannot address arbitrary MCP client rows by server name.
4. Resource requests use the existing managed MCP tool-call timeout. Restart uses the manager's existing serialized reconciliation path with only the selected settings id marked for restart. It returns after reconciliation has scheduled the replacement; the UI observes the existing live status feed for the resulting connection state.
5. Extend the generated Typert host/client descriptions and types for the new manager methods and the safe resource response shapes. Do not add methods to the model-facing tool registry.

## Data safety and failure behavior

- Resource content is untrusted data. Render text as escaped plain text and binary payloads as metadata; never render HTML or execute content.
- Keep headers, environment values, command arguments, and credential references out of resource API responses. Responses contain only safe resource metadata and requested resource content.
- Do not log resource contents or raw transport errors. Map failures to fixed categories: unavailable, timed out, failed, or too large.
- Revalidate enabled state and connected generation on every operation so a stale UI cannot read a removed, disabled, or disconnected server.
- Increment the safe status revision on every live state transition. The UI uses it to clear transient data even when a disconnect and reconnect happen between status polls.
- If a connection drops while a read is in flight, discard the result and clear the displayed content.
- A failed reconnect leaves the server row and its credential references untouched and preserves the manager's normal retry behavior.

## Localization and accessibility

Add English and Simplified Chinese labels for the Resources disclosure, resource/template lists, load-more action, content view, loading and empty states, error categories, oversized response, reconnect action, and reconnecting status. Use keyboard-operable controls, visible focus, `aria-expanded` on disclosures, and accessible busy/status announcements.

## Out of scope

- Calling MCP tools from the settings page. Tool calls may have server-side effects and require a separate interaction and approval design.
- OAuth, workspace-scoped server configuration, cross-agent config discovery, log viewer, WebDAV backup, or a new MCP transport.
- Prompt browsing or resource subscriptions.
- Persisting or exporting resource contents.
- Changing existing import/export formats, credential storage, check categories, or connection retry policy.

## Acceptance criteria

- Resource list, template list, pagination, and resource reads use the existing live managed connection without opening a second connection.
- The settings UI only requests resources after the operator opens the browser and selects a resource.
- Only enabled managed rows with a connected current generation can be read; requests for other rows fail with a safe category.
- Text is displayed as plain text, binary payloads are not embedded, and serialized read responses above 512 KiB are rejected safely.
- Resource content is not persisted, exported, logged, or added to model context.
- Status rows are matched by the optional managed settings id, never by display name; a changed connection revision clears cached resource previews and tool probes.
- Reconnect affects exactly one managed server, uses the saved credentials, and leaves settings unchanged on failure.
- English and Simplified Chinese controls and status states are present and keyboard accessible.
