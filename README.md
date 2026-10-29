---
description: "Optional bundle for MCP server, Chrome, and Cognee runtime providers configured through profile patches."
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

English | [中文](README.zh.md)

## Summary

This bundle provides MCP runtime providers for profile configuration. Configure Streamable HTTP and stdio servers through the `mcp-server-manager` Cordis row, including Chrome as a normal HTTP server. Cognee project memory uses an internal `project-memory` row purpose and does not expose Cognee tools to the model. The default `new-gold` endpoint remains enabled at `http://127.0.0.1:12888/new-gold`.

## Compatibility

This release requires DSH `0.2.2-alpha.2` or a later stable `0.2.x` release. The bundle vendors the MCP manager and Cognee consumer.

## Use this package

Add `@deepseek-ai/dsh-mcp-settings` to `dsh.profile.bundles` in the profile manifest. The shipped Web and Desktop profiles include it. Configure servers in the MCP settings page or in the profile's Cordis patch. The settings page can import JSON with an `mcpServers` object and `streamable-http` entries.

## Understand the implementation

`cordis.patch.yml` inserts the managed server manager, the internal Cognee memory provider, and a disabled-by-default Chrome compatibility plugin. The Chrome plugin stops when a managed `chrome` row exists.

## Dev Note

The bundle does not implement MCP services itself. Its `dsh.bundle.patch` manifest field supplies the profile rows, and the vendored client runtime plus the other dependencies make those services available to the profile resolver.

## Model Experience

Model-facing MCP tools are available only when a `model-tools` row connects successfully. Cognee memory remains optional and uses only its internal allow-listed operations. New Chrome connections use the same managed HTTP transport and header configuration as other MCP servers.

## Known Limitations and Deferred Work

- JSON import supports `streamable-http` entries. Add stdio servers through the settings page or Cordis patch.

## Vendored packages

This repository includes the Cognee provider and MCP client runtime under `vendor/`. The bundle uses relative `file:` dependencies, so the checkout can be moved or cloned to another location. From the directory containing the checkout, install it with `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings`.
