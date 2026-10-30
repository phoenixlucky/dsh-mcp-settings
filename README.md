---
description: "Optional bundle for adding and managing MCP servers through profile patches."
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

English | [中文](README.zh.md)

## Summary

This bundle provides only the `mcp-server-manager` runtime for adding and managing Streamable HTTP and stdio MCP servers. Its server list starts empty, with no preconfigured or automatically started MCP services.

## Compatibility

This release requires DSH `0.2.2-alpha.2` or a later stable `0.2.x` release. The bundle vendors the MCP manager runtime.

## Use this package

Add `@deepseek-ai/dsh-mcp-settings` to `dsh.profile.bundles` in the profile manifest. The shipped Web and Desktop profiles include it. Configure servers in the MCP settings page or in the profile's Cordis patch. The settings page can import JSON with an `mcpServers` object and `streamable-http` entries.

## Understand the implementation

`cordis.patch.yml` inserts only the managed server manager with an empty server list. The manager connects to MCP services after they are added.

## Dev Note

The bundle does not implement MCP services itself. Its `dsh.bundle.patch` manifest field supplies the profile rows, and the vendored client runtime plus the other dependencies make those services available to the profile resolver.

## Model Experience

Model-facing MCP tools are available only when a `model-tools` row connects successfully.

## Known Limitations and Deferred Work

- JSON import supports `streamable-http` entries. Add stdio servers through the settings page or Cordis patch.

## Vendored packages

This repository includes the MCP client runtime under `vendor/`. The bundle uses relative `file:` dependencies, so the checkout can be moved or cloned to another location. From the directory containing the checkout, install it with `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings`.
