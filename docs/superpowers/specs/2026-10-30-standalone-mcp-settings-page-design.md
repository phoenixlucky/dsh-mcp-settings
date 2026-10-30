# Standalone MCP Settings Page

## Goal

Provide a usable MCP configuration interface from this repository without requiring the DSH host application's settings UI. The page edits a local draft and exports configuration that the user can apply to a DSH profile.

## User experience

- The repository ships a self-contained page that the user can open locally.
- The page lists configured servers and supports adding, editing, enabling, disabling, and removing Streamable HTTP and stdio entries.
- The page edits the managed purpose (`model-tools` or `project-memory`) and preserves it across import, export, and subsequent edits.
- Drafts persist in browser-local storage. Import and export provide explicit file-based backup and transfer.
- Import accepts a documented `mcpServers` JSON subset or the page's own managed `{ servers: [...] }` export, and validates it before replacing the draft; a non-empty draft requires confirmation first.
- Export provides the managed `servers` JSON and a Cordis profile patch that overrides the existing `mcp-server-manager` row by id and module name. It restates `servers` and `checkTimeoutMs` because Cordis replaces config wholesale.
- Validation errors identify the affected field and leave the current draft intact.

## Configuration mapping

- HTTP entries include `id`, `serverName`, `enabled`, `purpose`, `transport`, `url`, non-sensitive `headers`, and `headerRefs`.
- Stdio entries include `id`, `serverName`, `enabled`, `purpose`, `transport`, `command`, `args`, `cwd`, and `envRefs`.
- Import maps each `mcpServers` key to `serverName`, creates a stable row id, and accepts HTTP `url` plus optional non-secret `headers`, or stdio `command`, `args`, and `cwd`. Optional `purpose` and existing managed reference maps (`headerRefs` and `envRefs`) are also accepted.
- HTTP authentication headers and stdio environment values are not stored as plaintext. The UI edits credential reference names only; users provision the referenced values through DSH's credential store.
- Import rejects inline sensitive HTTP headers and inline stdio `env` values that cannot be represented safely as credential references. Errors explain how to enter references instead.
- Exported Cordis patch contains only the override for the managed server manager and its current server list. It does not change other profile entries.

## Architecture and delivery

- Add a dependency-free static page under `settings/`; it runs in the user's browser and does not connect to a DSH process.
- Keep page code self-contained in the repository and include its assets in the published package.
- Align the published `@deepseek-ai/dsh-mcp-client/managed` runtime export with its matching shipped implementation and declaration so regular HTTP headers, managed purposes, and consumer lifecycle are effective at runtime.
- Use browser local storage for drafts and standard file selection/download for import and export. No backend service, account, or network access is required.
- Use the manager's current server schema as the source of truth. Do not duplicate connection or lifecycle behavior in the page.
- Correct the English and Chinese package documentation to describe the independent workflow and its limits.

## Safety and limitations

- No credential value is persisted in browser storage or generated configuration.
- Rows with `project-memory` purpose stay owned by their registered consumer and do not publish tools to model-facing tool catalogs.
- The page can validate structure and known schema constraints but cannot test connectivity or change a running DSH profile.
- Servers start only after the exported patch is applied to a DSH profile and that profile loads the bundle.
- A user can clear the draft through the page; exporting is explicit and does not write files automatically.

## Verification

- Review the page in a browser at a desktop viewport and a narrow viewport.
- Exercise add/edit/remove, transport switching, enablement, browser draft persistence, JSON import validation, and both export formats.
- Confirm imported invalid data does not replace a valid existing draft and exported patches target only the manager row, with a full replacement config.
- Verify the published package file list includes the page and its assets.
- Confirm the `./managed` package export resolves to the runtime implementation that supports the shipped managed-server declaration, including headers and purpose dispatch.
