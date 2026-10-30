---
description: "Optional bundle for adding and managing MCP servers through profile patches."
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

English | [中文](README.zh.md)

## Summary

This bundle provides the `mcp-server-manager` runtime for Streamable HTTP and stdio MCP servers. The default server list is empty; the bundle does not preconfigure or automatically start an MCP service.

## Compatibility

This release requires DSH `0.2.2-alpha.2` or a later stable `0.2.x` release. The MCP client runtime is included under `vendor/`.

## Configure MCP servers

This package includes a standalone page at `settings/index.html`. Open it from a checkout, or open `node_modules/@deepseek-ai/dsh-mcp-settings/settings/index.html` after installing the package. The page stores a draft in the browser; it does not connect to DSH or change a running profile.

Add Streamable HTTP or stdio servers, set their purpose, and import or export configuration files. JSON import accepts the page's own `{ "servers": [...] }` export or an `mcpServers` object with HTTP `url` entries or stdio `command` entries. HTTP supports non-sensitive `headers` and managed `headerRefs`; stdio supports `args`, `cwd`, and managed `envRefs`.

Credential values must be saved separately in DSH's credential store. Put only the credential reference name in `headerRefs` or `envRefs`. The page rejects inline authorization, cookie, proxy-authorization, and x-api-key header values, along with inline stdio `env` values.

The page can export `dsh-mcp-servers.json` or `mcp-server-manager.patch.yml`. To apply the patch, add its id-targeted `mcp-server-manager` override to the profile's `cordis.patch.yml`, replacing any existing override for that id. The patch contains the full manager config because Cordis replaces the config as a whole. The profile must also include this bundle.

The page validates configuration but cannot test a connection. A server starts after the patch is applied and the profile loads. A `project-memory` row requires a registered consumer; its MCP tools are not published to the model.

## Understand the implementation

`cordis.patch.yml` inserts only the managed server manager with an empty server list. The standalone page edits a local copy of that list and exports a profile override. The manager starts configured servers after the profile loads.

## Model experience

Only a successfully connected server with purpose `model-tools` publishes tools for the model. Purpose `project-memory` is owned by its registered consumer and stays out of the model-facing tool catalog.

## Known limitations

- The standalone page does not read or write a live DSH profile and does not test connections.
- JSON import supports the documented `mcpServers` subset. Inline secrets are rejected; use DSH credential references instead.

## Vendored packages

This repository includes the MCP client runtime under `vendor/`. The bundle uses relative `file:` dependencies, so the checkout can be moved or cloned. From the directory containing the checkout, install it with `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings`.
