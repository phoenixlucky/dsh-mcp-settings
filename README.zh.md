---
description: "可选 bundle，通过 profile patch 配置 MCP 服务器、Chrome 和 Cognee 运行提供方。"
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

[English](README.md) | 中文

## 概述

该 bundle 提供 MCP 运行时提供方，供 profile 配置使用。通过 `mcp-server-manager` Cordis 项配置 Streamable HTTP 与 stdio 服务，Chrome 也作为普通 HTTP 服务器配置。Cognee 项目记忆通过内部 `project-memory` 用途运行，不会向模型公开 Cognee 工具。默认 `new-gold` 地址仍在 `http://127.0.0.1:12888/new-gold` 启用。

## 兼容性

此版本要求 DSH `0.2.2-alpha.2` 或后续稳定版 `0.2.x`。本包随附 MCP 管理器和 Cognee 消费者。

## 使用本包

将 `@deepseek-ai/dsh-mcp-settings` 加入 profile manifest 的 `dsh.profile.bundles`。随附的 Web 和 Desktop profile 已包含它。通过 profile 的 Cordis patch 配置 MCP 服务器行。

## 理解实现

`cordis.patch.yml` 插入托管服务器管理器、内部 Cognee 记忆提供方，以及默认禁用的 Chrome 兼容插件。托管列表中出现 `chrome` 行后，该插件会停止。

## 开发备注

该 bundle 不自行实现 MCP 服务。`dsh.bundle.patch` manifest 字段声明 profile 配置项，随仓库提供的 client 运行包与其他依赖则让 profile resolver 能找到这些服务。

## Model Experience

只有用途为 `model-tools` 的 MCP 行成功连接后，模型才能使用对应工具。Cognee 记忆保持可选，并仅执行内部允许列表中的操作。新 Chrome 连接与其他 MCP 服务使用相同的托管 HTTP 传输和请求头配置。

## 已知限制与延期工作

- MCP 服务器配置需要编辑 profile Cordis patch；该 bundle 不提供设置页面。

## 随仓库提供的依赖

本仓库在 `vendor/` 中包含 Cognee provider 和 MCP client 运行包。bundle 使用相对 `file:` 依赖，因此可以移动或克隆到其他目录。从仓库所在目录运行 `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings` 即可安装。
