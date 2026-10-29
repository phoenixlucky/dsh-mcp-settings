---
description: "Optional bundle for configuring all MCP servers in one managed list, with legacy Chrome and VISION-LIAO migration."
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

English | [中文](README.zh.md)

## Summary

This bundle provides one managed MCP server list in the Settings UI. Configure Streamable HTTP and stdio servers there, including Chrome as a normal HTTP row. Cognee project memory uses an internal `project-memory` row purpose and does not expose Cognee tools to the model. The default `new-gold` endpoint remains enabled at `http://127.0.0.1:12888/new-gold`.

## Compatibility

This release requires DSH `0.2.2-alpha.2` or a later stable `0.2.x` release. The bundle vendors the MCP manager, Cognee consumer, and UI artifacts used by the Settings page.

## Use this package

Add `@deepseek-ai/dsh-mcp-settings` to `dsh.profile.bundles` in the profile manifest. The shipped Web and Desktop profiles include it. Remove the bundle from a customized profile to remove its MCP configuration rows and Settings entry.

## Understand the implementation

`cordis.patch.yml` inserts the managed server manager, the internal Cognee memory provider, a disabled-by-default Chrome migration shim, and the MCP Settings UI plugin. The UI source is maintained in `vendor/dsh-client-ui-settings-mcp/src`; its compiled client bundle is shipped alongside it. The Chrome shim stops when a managed `chrome` row exists.

## Migration

When the MCP Settings UI sees the legacy `mcp-chrome` and `cognee-memory` settings, it writes them into the managed `mcp-server-manager.servers` list before registering the page. Chrome becomes a `model-tools` Streamable HTTP row with an `Origin` header and the existing `DSH_CHROME_MCP_TOKEN` reference. Cognee becomes a `project-memory` row and retains its configured credential reference. A row with the same `serverName` already in the list takes precedence. The UI clears old endpoint and enablement fields only after the managed list save succeeds; credential values remain in the credential store.

After upgrading, open MCP settings and check the converted rows. Chrome appears as `chrome`; test its ordinary HTTP connection. Cognee appears as `cognee` with purpose `Internal project memory`; its tools remain hidden from the model while status and recall/proposal lifecycle behavior continue to use the row.

## Dev Note

The bundle does not implement MCP services itself. Its `dsh.bundle.patch` manifest field supplies the profile rows, and the vendored client runtime plus the other dependencies make those services available to the profile resolver.

The MCP Settings UI source lives in `vendor/dsh-client-ui-settings-mcp/src`. To rebuild the UI package artifacts in a sibling `deepseek-harness` checkout, run `pnpm exec tsdown --config ../dsh-mcp/vendor/dsh-client-ui-settings-mcp/tsdown.config.ts` from the harness root.

## Model Experience

Model-facing MCP tools are available only when a `model-tools` row connects successfully. Cognee memory remains optional and uses only its internal allow-listed operations. New Chrome connections use the same managed HTTP transport and header configuration as other MCP servers.

## Known Limitations and Deferred Work

- The Settings UI requires a profile that includes the Web client Settings plugins; this bundle does not add a standalone Settings page to headless profiles.

## Vendored packages

This repository includes the MCP Settings UI source and compiled bundle, the Cognee provider, and the MCP client runtime under `vendor/`. The bundle uses relative `file:` dependencies, so the checkout can be moved or cloned to another location. From the directory containing the checkout, install it with `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings`.
