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

After installing this bundle in a profile, manage servers from DSH Settings → MCP Servers. Add Streamable HTTP or stdio servers there, or paste an `mcpServers` JSON configuration and select **Import JSON**. JSON import accepts Streamable HTTP entries; sensitive headers such as `Authorization` are saved in DSH's credential store.

## Understand the implementation

`cordis.patch.yml` inserts only the managed server manager with an empty server list. The settings page edits that manager's server list. The manager starts configured servers after the profile loads.

## Model experience

Only a successfully connected server with purpose `model-tools` publishes tools for the model. Purpose `project-memory` is owned by its registered consumer and stays out of the model-facing tool catalog.

## Known limitations

- JSON import supports Streamable HTTP entries from an `mcpServers` object. Add stdio servers from the settings form.

## Vendored packages

This repository includes the MCP client runtime under `vendor/`. The bundle uses relative `file:` dependencies, so the checkout can be moved or cloned. From the directory containing the checkout, install it with `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings`.
