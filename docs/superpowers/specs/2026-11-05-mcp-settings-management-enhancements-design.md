# MCP Settings Management Enhancements

## Goal

Make the managed MCP settings page safer and easier to use when configuring, importing, inspecting, and exporting multiple MCP servers.

## Agreed scope

- Add search by server name and filters for connection state and transport.
- Preview supported JSON imports before any credentials or settings are written.
- Improve connection check feedback with safe, category-based guidance.
- Show discovered tool names and descriptions for connected servers. Tool-level enable/disable is out of scope.
- Export managed server settings without exporting credential values.
- Keep secret inputs masked by default and add an accessible eye control to reveal or hide each value.

## Current behavior and constraints

The settings page already supports adding and editing managed Streamable HTTP and stdio servers, checking a draft connection, toggling a server, deleting a server, and importing two supported JSON shapes. Import currently writes extracted credential values to the credential store and saves accepted servers in one action. Secret input values are masked, but there is no reveal control.

Live MCP status currently exposes server identity, transport, source, connection state, and tool count. Temporary checks return one of `ready`, `authorization-required`, `connection-failed`, or `timed-out`; they do not expose a reliable low-level cause or server-provided error text. The UI must not imply more diagnostic precision than these categories provide.

The managed settings store credential references, while credential values live in the separate credential store. Export must never resolve or include credential values. Tool details require extending the credential-safe live status contract and its producer to carry only tool names and descriptions.

## User experience

### Server list

Add a search field that matches server names case-insensitively and filters for connection state and transport. Filters operate over the existing managed server rows and current live status. Disabled servers use the disabled state. Show a clear empty-filter result and a way to clear filters. Keep existing editing, enable/disable, and delete actions intact.

### Import preview

Split import into parse/preview and confirm steps. Preview the accepted server names, transport, purpose, count of duplicate names that will be skipped, and any validation errors. Indicate when credentials from the import will be stored, without rendering their values. Do not call credential storage or save settings before confirmation. On confirmation, preserve the current supported formats, validation, duplicate-skipping behavior, and credential-store handling. Clear the pending preview and source JSON after a successful import; retain them after an error so the user can correct or retry.

### Connection diagnostics

Keep the existing safe result categories and add brief, localized next steps for each: check credentials for authorization-required, review endpoint/command and server availability for connection-failed, and retry after checking server responsiveness for timed-out. Do not display raw transport exceptions or response bodies. Ready continues to show discovered tool count.

### Tool inventory

For a connected server, allow its card to expand to show discovered tool names and descriptions. Show an empty state when no tools are available and an unavailable state while disconnected or when live status cannot be read. Do not expose input schemas, credential data, or per-tool controls. Keep status polling bounded by the existing connection-status refresh behavior.

### Export

Provide an export action that downloads a JSON document in the managed `servers` format already accepted by the importer. Include server settings and credential references, but never read from the credential store or include credential values. The UI should state that secret values remain in the local credential store and must be provisioned separately on another profile. Generate the download client-side and do not persist the exported file in the app.

### Secret visibility

Every secret value input starts with `type=password`. Add a keyboard-accessible eye button per input to toggle that one field between masked and visible; the button must expose a localized accessible label/state. Switching transport or closing/discarding the editor should not accidentally leave another field visible. Visibility state is transient and must not be persisted.

## Data flow and interfaces

1. Search and filters operate only on settings and safe live status already present in the page.
2. Import parsing builds a pending preview in UI state. Confirmation performs credential writes first, then persists the accepted server rows, matching the current save semantics. Partial credential-store failures must surface an error and must not persist the server list.
3. The MCP client runtime records discovered tool names and descriptions with its live status update. The remote status response includes those safe fields; the UI displays them only for the matching connected server row.
4. Export serializes the persisted managed server settings as JSON and never calls credential resolution.
5. Diagnostics map only the existing check result categories to localized guidance.

## Error handling and security

- Import parse/validation, credential storage, and settings save failures remain distinguishable and preserve the pending input for retry.
- Diagnostic copy is generated from fixed result categories, never raw server output.
- Credential values stay in the credential store and are not added to live status, exports, logs, or previews.
- Secret reveal affects only the current input's DOM type and transient component state.
- Exported credential references are identifiers, not credential values; users still need to configure the referenced secrets on a different profile.

## Localization and accessibility

Add English and Simplified Chinese strings for search, filters, no-match state, import preview/confirmation, diagnostic advice, tool inventory, export, and secret show/hide controls. All controls must have accessible names, keyboard operation, visible focus, and status/error announcements consistent with the existing page.

## Out of scope

- Enabling or disabling individual MCP tools.
- Changing the MCP server manager's connection or retry policy.
- Revealing stored credentials after they have been saved; the eye control only toggles values currently entered in an editor.
- Displaying raw server logs, exception text, tool input schemas, or tool results.
- Exporting secret values or automatically transferring credential-store contents.

## Acceptance criteria

- Search and each filter narrow the server list correctly, including disabled and disconnected rows.
- Import preview performs no credential writes or settings save until confirmed; confirm imports valid new rows and reports skipped duplicates.
- Import errors leave the pending input available and do not persist a partial server list.
- Connection outcomes show guidance matching only the safe result category returned by the host.
- Connected server cards show tool names/descriptions from live status; unavailable status and empty inventories are clear.
- Exported JSON can be parsed and imported in managed format, contains no credential values, and documents that references require separately provisioned secrets.
- Secret inputs are masked initially; each eye button toggles only its corresponding input and can be operated by keyboard.
- English and Chinese labels exist for all new controls and states.
