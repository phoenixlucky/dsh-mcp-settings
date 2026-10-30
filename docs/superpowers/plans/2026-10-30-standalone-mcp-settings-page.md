# Standalone MCP Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a standalone MCP settings page and align the published managed-server runtime with its shipped type contract.

**Architecture:** Route the vendored client's `./managed` export to its matching implementation under `lib/types/managed.js`, which is already included in the package and matches `managed.d.ts`. Add a dependency-free browser page that edits that managed-server shape, saves drafts locally, and exports JSON or a Cordis profile override; update package documentation and files allowlist.

**Tech Stack:** HTML, CSS, browser JavaScript, JSON, npm package metadata, Markdown.

**Spec:** [2026-10-30-standalone-mcp-settings-page-design.md](../specs/2026-10-30-standalone-mcp-settings-page-design.md)

## Global Constraints

- The page runs locally in the user's browser and does not connect to a DSH process.
- The page stores no credential values; it edits `headerRefs` and `envRefs` only.
- HTTP authentication headers and stdio environment values are not stored as plaintext.
- The `./managed` runtime export resolves to the shipped implementation matching its declaration, including regular HTTP headers and managed-purpose consumer lifecycle.
- Cordis export overrides the existing manager row by id and module name, and restates `servers` and `checkTimeoutMs` because config is replaced wholesale.
- No front-end or runtime dependency is added.
- English and Chinese package documentation describe the standalone workflow and its limits.

## Review Focus

- Runtime package resolution must use the implementation matching the exposed types; verify `./managed` imports and its packaged relative modules resolve.
- Corrupt or unavailable local storage must leave the page usable and show a clear message; inspect manually with invalid stored data.
- Invalid JSON, unsupported entries, duplicate names, and invalid fields must not replace the existing draft; exercise import and validation in a browser.
- Sensitive HTTP headers and every inline stdio `env` map must be rejected without persisting or exporting their values.
- Cordis export must target only the existing manager row and contain its full config; inspect the downloaded file.
- The npm package allowlist must include the page and every asset it uses; verify with `npm pack --dry-run`.

---

### Task 1: Confirm the managed runtime export alignment

**Files:**
- Read: `package.json`
- Read: `lib/managed.js`
- Read: `vendor/dsh-mcp-client/package.json`
- Read: `vendor/dsh-mcp-client/lib/types/managed.js`

**Interfaces:**
- The root package `./managed` facade re-exports `@deepseek-ai/dsh-mcp-client/managed`.
- The vendored client `./managed` export maps types to `./lib/types/managed.d.ts` and runtime to `./lib/types/managed.js`.
- The target implementation exposes `Config`, `ManagedMcpServerManager`, `apply`, `checkManagedMcpServer`, `inject`, and `name`, and supports headers and managed purposes.

- [x] Trace the root facade through the vendored package export to the matching managed implementation.
- [x] Resolve the facade through Node and inspect exported names; confirm imported relative files exist in the vendor allowlist.
- [x] Read the selected implementation to confirm it validates and forwards non-sensitive `headers`, rejects inline sensitive headers, and dispatches `model-tools` versus registered consumer purposes.

### Task 2: Build the standalone server editor

**Files:**
- Create: `settings/index.html`
- Create: `settings/settings.css`
- Create: `settings/settings.js`

**Interfaces:**
- `settings.js` owns an in-memory `servers` array matching `ManagedMcpServer[]` from `vendor/dsh-mcp-client/lib/types/types.d.ts`.
- Storage key is `dsh-mcp-settings.v1`; stored value is `{ version: 1, servers }`.
- `validateServer(server, existingServers, editingId)` returns field errors and commits only validated rows.
- IDs use `crypto.randomUUID()`. Server names match `/^[A-Za-z0-9_-]{1,32}$/` and remain unique.

- [x] Create accessible semantic markup for the server list, editor, import/export controls, and live validation messages.
- [x] Style the page locally for desktop and narrow screens; labels, keyboard focus, and button names remain visible and clear.
- [x] Implement add/edit/remove/enable actions for HTTP and stdio rows, including `purpose`, non-secret `headers`, `headerRefs`, `args`, `cwd`, and `envRefs`; explain that `project-memory` requires a registered consumer and does not publish model tools.
- [x] Implement validation for required fields, unique ids/names, HTTP URL policy (HTTPS or loopback HTTP, with no URL credentials), header names/values and secret-name collisions, credential reference names, and stdio environment-reference names.
- [x] Load and save versioned drafts in local storage; malformed or unavailable storage shows a non-blocking message and leaves editing usable.
- [ ] Open the page in a browser and manually verify create, edit, delete, toggle, purpose selection, transport switch, persistence, focus order, and narrow layout. Not run: no regular browser provider is available in this session.

### Task 3: Add safe import and configuration exports

**Files:**
- Modify: `settings/index.html`
- Modify: `settings/settings.js`

**Interfaces:**
- `parseMcpServers(input)` returns `{ servers, errors }` without mutating current state.
- Import reads either a documented object with `mcpServers` or the page's own `{ servers: [...] }` export; `mcpServers` keys become `serverName`, new IDs are generated, and optional `purpose`, `headerRefs`, and `envRefs` are retained.
- Each imported entry must describe exactly one transport. HTTP entries accept `url`, optional `transport: "streamable-http"`, non-sensitive `headers`, and `headerRefs`; stdio entries accept `command`, `args`, `cwd`, and `envRefs`.
- Reject case-insensitive `authorization`, `cookie`, `proxy-authorization`, or `x-api-key` inline headers; reject any inline stdio `env` object. Tell the user to configure values in DSH credentials and enter references.
- Importing over a non-empty draft requires confirmation. Invalid input or cancellation leaves the draft unchanged.
- JSON export is `{ servers: [...] }`. Cordis export is a JSON-form YAML array with one id-targeted override for `mcp-server-manager`, `name: "@deepseek-ai/dsh-mcp-settings/managed"`, and complete `config: { servers, checkTimeoutMs: 10000 }`.

- [x] Implement JSON parsing and normalized HTTP/stdio mapping, validating the full imported list before replacing draft state.
- [x] Implement confirmation before replacing a non-empty draft and clear, field-specific error messages for unsupported or unsafe input.
- [x] Implement JSON and Cordis patch downloads with `Blob`/object URLs and revoke each URL after download.
- [ ] In a browser, manually verify valid imports, malformed and duplicate rows, sensitive-value rejection, cancel/confirm, persistence, and both exports. Not run: no regular browser provider is available in this session.

### Task 4: Package the page and correct documentation

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `README.zh.md`
- Modify: `README.i18n.yaml`

**Interfaces:**
- Published package includes `settings/index.html`, `settings/settings.css`, and `settings/settings.js` via the `files` allowlist.
- README instructions explain opening the installed page, supported JSON import, applying the Cordis override, and provisioning credential references separately.

- [x] Add `settings/**` to the npm package file allowlist.
- [x] Replace claims that this package supplies a DSH settings page with accurate standalone-page instructions and limitations in both READMEs.
- [x] Update the bilingual README pairing hashes for changed sections.
- [x] Run `npm pack --dry-run` and inspect that all page assets and the corrected managed runtime route are shipped, with no unintended files; if npm itself fails, use `pnpm pack --dry-run`.
- [x] Review the final diff against the spec and the Cordis patch override semantics; a static follow-up review found no remaining concrete issues.

---

## Self-review

- Spec coverage: independent page, CRUD, HTTP/stdio shape, purpose editing, local drafts, safe import, both exports, credential handling, runtime/type alignment, bilingual docs, and package inclusion all map to tasks.
- Step scan: each step changes one package/runtime/page/doc concern and ends with a manual or package-level verification. No automated tests are added or run because the request did not ask for tests.
- Type consistency: the runtime export and page both use the shipped `ManagedMcpServer` and manager contract; Cordis export restates both manager config fields.
- Review focus: runtime path resolution, storage failure, malformed/unsafe imports, and export/package integrity each have explicit checks.
- Proportion: four tasks cover the single page, one export-path correction, and its documentation/package delivery without a server or new dependency.
