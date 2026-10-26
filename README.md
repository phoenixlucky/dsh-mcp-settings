---
description: "Optional bundle for managing MCP servers, Chrome access, and Cognee memory in Web and Desktop profiles."
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

English | [中文](README.zh.md)

## Summary

This bundle groups the MCP controls previously included by the Web profile. Install it in a profile that provides the Web Settings UI to expose managed MCP servers, the optional Chrome connector, and Cognee memory settings. The default `new-gold` endpoint remains enabled at `http://127.0.0.1:12888/new-gold`; Cognee and Chrome remain opt-in.

## Use this package

Add `@deepseek-ai/dsh-mcp-settings` to `dsh.profile.bundles` in the profile manifest. The shipped Web and Desktop profiles include it. Remove the bundle from a customized profile to remove its MCP configuration rows and Settings entry.

## Understand the implementation

`cordis.patch.yml` inserts the MCP server manager, Chrome connector, Cognee memory provider, and the existing MCP Settings UI plugin. The browser UI remains implemented by `@deepseek-ai/dsh-client-ui-settings-mcp`.

## Dev Note

The bundle has no runtime implementation of its own. Its `dsh.bundle.patch` manifest field supplies the profile rows, and its dependencies make those rows available to the profile resolver.

## Model Experience

MCP tools are available only when a configured MCP server connects successfully and exposes tools. Cognee memory is disabled by default; Chrome access is not started until configured.

## Known Limitations and Deferred Work

- The Settings UI requires a profile that includes the Web client Settings plugins; this bundle does not add a standalone Settings page to headless profiles.

## Vendored packages

This repository includes compiled copies of the MCP Settings UI and Cognee packages under `vendor/`. The bundle uses relative `file:` dependencies, so the checkout can be moved or cloned to another location. From the directory containing the checkout, install it with `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings`.
