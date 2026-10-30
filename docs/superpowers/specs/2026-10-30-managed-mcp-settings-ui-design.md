# Plugin-Owned Managed MCP Settings UI

## Goal

Manage MCP servers from the settings UI owned by `@deepseek-ai/dsh-mcp-settings`, writing directly to the `mcp-server-manager` configuration. Do not use the Harness page's browser-local draft and export flow for managed servers.

## User experience

- The plugin's Client companion renders the MCP settings page while the Host serves `mcp-server-manager`.
- The page reads the current server list and writes add, edit, enable, remove, and import changes directly through the managed config form.
- A JSON textarea is always visible. The top **Import JSON** button parses and imports the pasted configuration.
- Import accepts the managed `servers` format and the `mcpServers` format supported by the existing importer. Duplicate names are skipped; invalid entries leave the current configuration unchanged.
- Sensitive headers in imported HTTP entries are written to the Host credential store. Only generated credential references enter `mcp-server-manager` config.
- Connection status comes from the managed MCP status Remote. Successful settings writes take effect through the existing manager lifecycle; users do not export or apply a separate patch.

## Ownership and package boundaries

- `@deepseek-ai/dsh-mcp-settings/managed` remains the Host runtime export. It validates the canonical server list, owns server lifecycle, resolves credentials, and reports status.
- React rendering runs in a Client companion shipped and activated with the MCP settings bundle. The Client reads and writes the Host-owned manager config through `configForms` and uses the credentials Remote for secret values.
- Keep the page implementation with the MCP settings bundle. Do not add this behavior to Harness `ui-settings-mcp`.
- When the managed config is served, the plugin-owned page takes the `mcp` settings section so the Harness local-draft page does not compete for the same section.

## Import and credential flow

1. Parse and normalize the textarea contents without mutating config.
2. Validate the complete result and identify sensitive HTTP headers.
3. If validation succeeds, store sensitive values under generated credential references.
4. Replace the corresponding inline header values with those references and write the resulting server list through the config form.
5. Clear the textarea and report success only after the settings write succeeds. Parse, validation, credential, and settings errors remain visible without exposing secret values.

Credential values must never be written to browser storage, the server config, status output, or logs. If credential storage fails, do not write the imported server list.

## Compatibility

- The existing `mcp-server-manager` schema and runtime remain the canonical storage and execution path.
- Existing profile rows remain visible in the new page without migration.
- Browser-local drafts from the old Harness page are not imported automatically; users can paste their configuration into the new importer.
- The standalone `settings/` page remains removed.

## Acceptance criteria

- The MCP settings page is provided by the `dsh-mcp-settings` Client companion and appears only when its managed Host config is available.
- The page directly reflects and updates `mcp-server-manager` without local draft or export steps.
- Pasting the user's Streamable HTTP `mcpServers` example and clicking **Import JSON** adds the server; the Authorization value is stored as a credential and only its reference is persisted in config.
- Invalid JSON or invalid server data causes no settings mutation. Credential failures do not write the server list or display secret values.
- Existing add/edit/enable/remove and connection-status behavior continues to work through the managed runtime.
