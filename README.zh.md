---
description: "可选 bundle，通过 profile patch 配置并添加 MCP 服务器。"
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

[English](README.md) | 中文

## 概述

该 bundle 只提供 `mcp-server-manager`，用于添加和管理 Streamable HTTP 与 stdio MCP 服务器。默认服务器列表为空，不会预置或启动任何 MCP 服务。

## 兼容性

此版本要求 DSH `0.2.2-alpha.2` 或后续稳定版 `0.2.x`。本包随附 MCP 管理器运行时。

## 使用本包

将 `@deepseek-ai/dsh-mcp-settings` 加入 profile manifest 的 `dsh.profile.bundles`。随附的 Web 和 Desktop profile 已包含它。可在 MCP 设置页配置服务器，也可通过 profile 的 Cordis patch 配置。设置页支持导入包含 `mcpServers` 对象和 `streamable-http` 条目的 JSON。

## 理解实现

`cordis.patch.yml` 只插入托管服务器管理器，服务器列表初始为空。添加服务器后，管理器按配置连接 MCP 服务。

## 开发备注

该 bundle 不自行实现 MCP 服务。`dsh.bundle.patch` manifest 字段声明 profile 配置项，随仓库提供的 client 运行包与其他依赖则让 profile resolver 能找到这些服务。

## Model Experience

只有用途为 `model-tools` 的 MCP 行成功连接后，模型才能使用对应工具。

## 已知限制与延期工作

- JSON 导入支持 `streamable-http` 条目；stdio 服务可在设置页手动添加，或通过 Cordis patch 配置。

## 随仓库提供的依赖

本仓库在 `vendor/` 中包含 MCP client 运行包。bundle 使用相对 `file:` 依赖，因此可以移动或克隆到其他目录。从仓库所在目录运行 `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings` 即可安装。
