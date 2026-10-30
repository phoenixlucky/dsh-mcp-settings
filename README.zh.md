---
description: "可选 bundle，通过 profile patch 添加和管理 MCP 服务。"
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

[English](README.md) | 中文

## 概述

该 bundle 提供 `mcp-server-manager` 运行时，用于管理 Streamable HTTP 和 stdio MCP 服务。默认服务列表为空，不会预配置或自动启动 MCP 服务。

## 兼容性

此版本要求 DSH `0.2.2-alpha.2` 或后续稳定版 `0.2.x`。MCP client 运行时随包放在 `vendor/` 中。

## 配置 MCP 服务

将本 bundle 安装到 profile 后，可在 DSH「设置 → MCP 服务器」中管理服务。在此添加 Streamable HTTP 或 stdio 服务，也可以粘贴 `mcpServers` JSON 并点击「导入 JSON」。JSON 导入支持 Streamable HTTP 条目；`Authorization` 等敏感请求头会保存到 DSH credential store。

## 理解实现

`cordis.patch.yml` 只插入一个初始服务列表为空的托管管理器。设置页面编辑管理器中的服务列表；profile 加载后，管理器会启动已配置的服务。

## 模型可用工具

只有用途为 `model-tools` 且成功连接的 MCP 服务才会向模型发布工具。`project-memory` 服务由注册的 consumer 管理，不会进入模型工具列表。

## 已知限制

- JSON 导入支持 `mcpServers` 对象中的 Streamable HTTP 条目。stdio 服务请从设置表单添加。

## 随仓库提供的依赖

本仓库在 `vendor/` 中包含 MCP client 运行时。bundle 使用相对 `file:` 依赖，因此可以移动或克隆到其他目录。从仓库所在目录运行 `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings` 即可安装。
