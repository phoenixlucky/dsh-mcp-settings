---
description: "可选 bundle，在统一列表中配置所有 MCP 服务器，并迁移旧版 Chrome 与 VISION-LIAO 设置。"
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

[English](README.md) | 中文

## 概述

该 bundle 在 Settings UI 中提供一个统一托管 MCP 服务器列表。可在其中配置 Streamable HTTP 与 stdio 服务，Chrome 也作为普通 HTTP 行配置。Cognee 项目记忆通过内部 `project-memory` 用途运行，不会向模型公开 Cognee 工具。默认 `new-gold` 地址仍在 `http://127.0.0.1:12888/new-gold` 启用。

## 兼容性

此版本要求 DSH `0.2.2-alpha.2` 或后续稳定版 `0.2.x`。本包随附 Settings 页面所需的 MCP 管理器、Cognee 消费者和 UI 运行产物。

## 使用本包

将 `@deepseek-ai/dsh-mcp-settings` 加入 profile manifest 的 `dsh.profile.bundles`。随附的 Web 和 Desktop profile 已包含它。自定义 profile 可移除此 bundle，以移除对应 MCP 配置项和 Settings 入口。

## 理解实现

`cordis.patch.yml` 插入托管服务器管理器、内部 Cognee 记忆提供方、默认禁用的 Chrome 迁移 shim，以及 MCP Settings UI 插件。界面源码由 `vendor/dsh-client-ui-settings-mcp/src` 管理，并随仓库携带编译后的客户端 bundle。托管列表中出现 `chrome` 行后，旧 shim 会停止。

## 迁移

升级后，MCP Settings UI 会在注册页面前读取旧版 `mcp-chrome` 和 `cognee-memory` 设置，并写入统一的 `mcp-server-manager.servers` 列表。Chrome 会变为用途 `model-tools` 的 Streamable HTTP 行，并带有 `Origin` 请求头及现有 `DSH_CHROME_MCP_TOKEN` 凭据引用。Cognee 会变为用途 `project-memory` 的行，并保留原配置的凭据引用。若列表里已存在同名 `serverName`，以已有行配置为准。只有托管列表保存成功后，界面才清空旧的端点和启用字段；凭据值仍保存在凭据存储中。

升级后打开 MCP 设置并检查转换后的行。Chrome 行名为 `chrome`，可检查普通 HTTP 连接。Cognee 行名为 `cognee`，用途显示为“内部项目记忆”；Cognee 工具仍对模型隐藏，状态及检索／提案生命周期行为则继续使用该行。

## 开发备注

该 bundle 不自行实现 MCP 服务。`dsh.bundle.patch` manifest 字段声明 profile 配置项，随仓库提供的 client 运行包与其他依赖则让 profile resolver 能找到这些服务。

MCP Settings UI 源码位于 `vendor/dsh-client-ui-settings-mcp/src`。在同级的 `deepseek-harness` 仓库根目录运行 `pnpm exec tsdown --config ../dsh-mcp/vendor/dsh-client-ui-settings-mcp/tsdown.config.ts`，即可从本仓库源码重建界面包。

## Model Experience

只有用途为 `model-tools` 的 MCP 行成功连接后，模型才能使用对应工具。Cognee 记忆保持可选，并仅执行内部允许列表中的操作。新 Chrome 连接与其他 MCP 服务使用相同的托管 HTTP 传输和请求头配置。

## 已知限制与延期工作

- Settings UI 依赖包含 Web 客户端 Settings 插件的 profile；该 bundle 不会为 headless profile 单独添加 Settings 页面。

## 随仓库提供的依赖

本仓库在 `vendor/` 中包含 MCP Settings UI 源码与编译副本、Cognee provider，以及 MCP client 运行包。bundle 使用相对 `file:` 依赖，因此可以移动或克隆到其他目录。从仓库所在目录运行 `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings` 即可安装。
