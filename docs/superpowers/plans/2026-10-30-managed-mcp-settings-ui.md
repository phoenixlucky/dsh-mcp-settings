# Managed MCP Settings UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the MCP settings page as a Client companion of `@deepseek-ai/dsh-mcp-settings` that edits `mcp-server-manager` directly and imports pasted JSON.

**Architecture:** Keep the Host runtime in the existing `./managed` export and keep the React page implementation in this repository's MCP settings UI source. Expose the existing Client bundle from the root package under the root package identity so installing the managed bundle activates that page; register it only while `mcp-server-manager` is served, with a lower `mcp` section priority than the Harness local-draft page. Continue using `configForms` and the credentials/status Remotes as the live source of truth.

**Tech Stack:** TypeScript, React, Cordis Client modules, DSH `configForms` and Remotes, tsdown client bundling.

**Spec:** `docs/superpowers/specs/2026-10-30-managed-mcp-settings-ui-design.md`

## Global Constraints

- `@deepseek-ai/dsh-mcp-settings/managed` remains the Host runtime export.
- Keep the page implementation with the MCP settings bundle. Do not add this behavior to Harness `ui-settings-mcp`.
- The Client reads and writes the Host-owned manager config through `configForms` and uses the credentials Remote for secret values.
- Credential values must never be written to browser storage, the server config, status output, or logs.
- Existing profile rows remain visible in the new page without migration.
- The standalone `settings/` page remains removed.

## Review Focus

- Root package installs without its Client bundle asset or manifest declaration: verify package export, `dsh.client`, build output, and packed file allowlist agree.
- Both settings modules claim the `mcp` section: inspect the registered priority and verify the plugin section wins while its manager config is served.
- Invalid JSON or a malformed entry is imported: verify the importer reports an error and does not call `form.set`.
- Credential storage rejects an Authorization header: verify no server-list write occurs and the error contains no credential value.
- Existing server names collide with imported entries: verify duplicate names are skipped without replacing configured rows.

---

### Task 1: Expose a Client companion from the managed settings package

**Files:**
- Modify: `package.json` — add the root `./client` export, `dsh.client` metadata, and publish the UI bundle emitted under `vendor/`.
- Modify: `vendor/dsh-client-ui-settings-mcp/package.json` — make the existing Client build emit the root package module identity; keep it as a build input rather than a separately declared DSH plugin.
- Modify: `vendor/dsh-client-ui-settings-mcp/lib/client.js` and `.map` — generated artifacts from the existing Client build.

**Interfaces:**
- Consumes: the existing UI module in `vendor/dsh-client-ui-settings-mcp/src/client/index.ts` and its page component; `./managed` remains the Host-owned runtime export.
- Produces: root package export `@deepseek-ai/dsh-mcp-settings/client` resolving to the generated UI bundle under `vendor/dsh-client-ui-settings-mcp/lib/client.js`, and a `dsh.client` declaration that injects the existing settings, locale, remotes, and managed MCP client modules for web.

- [ ] **Step 1: Define the root Client module entry and package contract**

Set the existing UI build package's `name` to `@deepseek-ai/dsh-mcp-settings` so `clientBundle` stamps the compiled module with the root package ID. Remove its nested `dsh.client` declaration; declare that Client face only in the root package. Set root `exports["./client"]` to the generated nested Client bundle and declare the inject dependencies already used by the implementation. Keep `exports["./managed"]` pointed at `./lib/managed.js`.

- [ ] **Step 2: Wire the root Client bundle build**

Reuse `vendor/dsh-client-ui-settings-mcp/tsdown.config.ts` and the shared `clientBundle` helper to produce the root-identity bundle. Add no duplicate root build entry or UI source copy.

- [ ] **Step 3: Verify package metadata and generated bundle**

Run the existing Client bundle command. Inspect the result to confirm the root `./client` export target exists, the generated module ID matches `@deepseek-ai/dsh-mcp-settings`, the `dsh.client` manifest is present, and package `files` includes the generated bundle and source map.

Expected: both Host `./managed` and Client `./client` assets are present in the root package without changing `cordis.patch.yml`'s managed manager identity.

### Task 2: Make the plugin page own live managed MCP settings

**Files:**
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/index.ts` — active managed-config registration and section priority.
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/ManagedMcpServers.tsx` — pasted JSON import UI/flow and live config writes, if any changes are needed after integration review.
- Modify: `vendor/dsh-client-ui-settings-mcp/src/client/McpConnectionsPage.tsx` — ensure the page renders the managed editor with the injected form and remotes.

**Interfaces:**
- Consumes: Task 1's root Client companion; `ctx.configForms.whileServed(['mcp-server-manager'], ...)`; `ConfigForm.set('servers', next)`; `remote.credentials`; `remote.mcpClientStatus`.
- Produces: an `mcp` settings section registered only while `mcp-server-manager` is served, using priority `-1`, with direct add/edit/enable/remove/import writes to the managed form.

- [ ] **Step 1: Ensure the managed page takes the `mcp` settings section**

Keep registration inside `whileServed(['mcp-server-manager'], ...)` and assign the plugin page `priority: -1` so it takes the existing `mcp` slot while the managed config is available. Do not edit `deepseek-harness/packages/client/ui-settings-mcp`.

- [ ] **Step 2: Verify the visible paste-and-import flow uses live config**

Keep the JSON textarea visible on the managed page and the **Import JSON** action above it. Ensure the importer accepts both the existing managed `servers` list and supported `mcpServers` object format, validates the complete import before mutation, skips duplicate server names, writes accepted servers through `form.set('servers', next)`, and clears the textarea only after a successful write.

- [ ] **Step 3: Verify credential and status handling**

For sensitive HTTP headers, persist values through `remote.credentials` and put only generated references in manager config. On credential or config-write failure, preserve the textarea, leave the server list unchanged, and display an error without echoing secret values. Continue reading connection state from `remote.mcpClientStatus`.

- [ ] **Step 4: Build the integrated Client page**

Run the Client bundle build and TypeScript checks for the page. Review the flow against the sample in the spec: `streamable-mcp-server-new`, `http://127.0.0.1:12306/mcp-new`, and an Authorization Bearer header.

Expected: a valid sample produces a managed row with a credential reference; malformed JSON, malformed entries, or credential failure do not mutate the managed server list.

### Task 3: Align package publication and user-facing setup guidance

**Files:**
- Modify: `package.json` — ensure only required root Host/Client outputs and existing vendored runtime files are published.
- Modify: `README.md` and `README.zh.md` — describe the plugin-owned live settings page and paste/import entry point.
- Modify: `README.i18n.yaml` — update the recorded English/Chinese section hashes after editing both README files.

**Interfaces:**
- Consumes: Task 1's root package Client export and Task 2's managed settings behavior.
- Produces: a publishable package whose installation provides both the `mcp-server-manager` Host runtime and its Client settings page, with documentation that does not direct users to the local-draft/export flow.

- [ ] **Step 1: Update the package allowlist**

Include the Client bundle in the root package `files` list and ensure the existing managed runtime files remain included. Do not publish build caches or unrelated source trees.

- [ ] **Step 2: Update English and Chinese setup copy**

State that after installing the bundle users can open Settings → MCP Servers, paste an `mcpServers` JSON object, and click **Import JSON**; explain that changes are written to the managed settings and sensitive headers use the credential store. Remove references to exporting/applying local drafts.

- [ ] **Step 3: Verify final package metadata and diff hygiene**

Run the package build/typecheck commands from Tasks 1–2 and `git diff --check`. Inspect the final diff to confirm there are no changes under Harness `ui-settings-mcp` and no remaining standalone `settings/` page.

Expected: the root package manifest resolves both managed Host and Client exports, documentation matches the live settings behavior, and the diff has no whitespace errors.
