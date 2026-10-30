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

本包自带独立页面 `settings/index.html`。可以从仓库直接打开；安装本包后，也可打开 `node_modules/@deepseek-ai/dsh-mcp-settings/settings/index.html`。页面把草稿保存在浏览器中，不连接 DSH，也不会修改正在运行的 profile。

页面支持添加 Streamable HTTP 或 stdio 服务、设置用途，以及导入和导出配置文件。JSON 导入支持本页面导出的 `{ "servers": [...] }`，也支持包含 `mcpServers` 对象的配置，其中 HTTP 条目使用 `url`，stdio 条目使用 `command`。HTTP 支持非敏感 `headers` 和托管的 `headerRefs`；stdio 支持 `args`、`cwd` 和托管的 `envRefs`。

凭据值需要单独保存在 DSH credential store 中。`headerRefs` 或 `envRefs` 只填写 credential 引用名。页面会拒绝明文的 authorization、cookie、proxy-authorization、x-api-key 请求头，以及 stdio 的明文 `env` 值。

页面可导出 `dsh-mcp-servers.json` 或 `mcp-server-manager.patch.yml`。应用 patch 时，将其中按 id 定位的 `mcp-server-manager` override 加入 profile 的 `cordis.patch.yml`，并替换该 id 的已有 override。由于 Cordis 会整体替换配置，patch 会包含完整 manager 配置。该 profile 还需要包含本 bundle。

页面可以检查配置格式，但不能测试连接。应用 patch 并加载 profile 后，服务才会启动。`project-memory` 用途的条目需要已注册的 consumer；其 MCP 工具不会发布给模型。

## 理解实现

`cordis.patch.yml` 只插入一个初始服务列表为空的托管管理器。独立页面编辑本地服务列表，并导出 profile override。profile 加载后，管理器会启动已配置的服务。

## 模型可用工具

只有用途为 `model-tools` 且成功连接的 MCP 服务才会向模型发布工具。`project-memory` 服务由注册的 consumer 管理，不会进入模型工具列表。

## 已知限制

- 独立页面不读取或写入正在运行的 DSH profile，也不能测试连接。
- JSON 导入支持文档列出的 `mcpServers` 子集。明文密钥会被拒绝；请改用 DSH credential 引用。

## 随仓库提供的依赖

本仓库在 `vendor/` 中包含 MCP client 运行时。bundle 使用相对 `file:` 依赖，因此可以移动或克隆到其他目录。从仓库所在目录运行 `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings` 即可安装。
