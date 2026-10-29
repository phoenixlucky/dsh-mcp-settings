---
description: "Optional bundle for managing MCP servers, Chrome access, and VISION-LIAO memory in Web and Desktop profiles."
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

English | [中文](README.zh.md)

## Summary

This bundle groups the MCP controls previously included by the Web profile. Install it in a profile that provides the Web Settings UI to expose managed MCP servers, the optional Chrome connector, and VISION-LIAO memory settings. The default `new-gold` endpoint remains enabled at `http://127.0.0.1:12888/new-gold`; VISION-LIAO and Chrome remain opt-in.

## Compatibility

This release requires DSH `0.2.2-alpha.2` or a later stable `0.2.x` release. It vendors the MCP client runtime entries used by the Settings UI because `dsh-mcp-client@0.2.1-rc.3` does not contain the published `chrome` and `managed` entry files.

## Use this package

Add `@deepseek-ai/dsh-mcp-settings` to `dsh.profile.bundles` in the profile manifest. The shipped Web and Desktop profiles include it. Remove the bundle from a customized profile to remove its MCP configuration rows and Settings entry.

## Understand the implementation

`cordis.patch.yml` inserts the MCP server manager, Chrome connector, VISION-LIAO memory provider, and the MCP Settings UI plugin. The UI source is maintained in `vendor/dsh-client-ui-settings-mcp/src` in this repository; its compiled client bundle is shipped alongside it. The compatible `dsh-mcp-client` runtime is vendored because the published `0.2.1-rc.3` package omits the `chrome` and `managed` entry files used by this bundle.

## Dev Note

The bundle does not implement MCP services itself. Its `dsh.bundle.patch` manifest field supplies the profile rows, and the vendored client runtime plus the other dependencies make those services available to the profile resolver.

The MCP Settings UI source lives in `vendor/dsh-client-ui-settings-mcp/src`. Its `dsh-mcp-client` dependency uses the compatible runtime in `vendor/dsh-mcp-client`. To rebuild the UI package artifacts in a sibling `deepseek-harness` checkout, run `pnpm exec tsdown --config ../dsh-mcp/vendor/dsh-client-ui-settings-mcp/tsdown.config.ts` from the harness root.

## Model Experience

MCP tools are available only when a configured MCP server connects successfully and exposes tools. VISION-LIAO memory is disabled by default; Chrome access is not started until configured.

## Known Limitations and Deferred Work

- The Settings UI requires a profile that includes the Web client Settings plugins; this bundle does not add a standalone Settings page to headless profiles.

## Vendored packages

This repository includes the MCP Settings UI source and compiled bundle, the VISION-LIAO provider, and the compatible MCP client runtime under `vendor/`. The bundle uses relative `file:` dependencies, so the checkout can be moved or cloned to another location. From the directory containing the checkout, install it with `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings`.
