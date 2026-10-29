---
description: "可选 bundle，为 Web 和 Desktop profile 提供 MCP 服务器管理、Chrome 连接与 VISION-LIAO 记忆设置。"
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

[English](README.md) | 中文

## 概述

该 bundle 将此前由 Web profile 默认包含的 MCP 控件集中在一起。将它加入提供 Web Settings UI 的 profile 后，可管理 MCP 服务器、可选 Chrome 连接和 VISION-LIAO 记忆设置。默认 `new-gold` 地址仍在 `http://127.0.0.1:12888/new-gold` 启用；VISION-LIAO 与 Chrome 默认关闭。

## 兼容性

此版本要求 DSH `0.2.2-alpha.2` 或后续稳定版 `0.2.x`。本包随附 MCP client 运行时入口，因为已发布的 `dsh-mcp-client@0.2.1-rc.3` 缺少 Settings UI 使用的 `chrome` 和 `managed` 入口文件。

## 使用本包

将 `@deepseek-ai/dsh-mcp-settings` 加入 profile manifest 的 `dsh.profile.bundles`。随附的 Web 和 Desktop profile 已包含它。自定义 profile 可移除此 bundle，以移除对应 MCP 配置项和 Settings 入口。

## 理解实现

`cordis.patch.yml` 插入 MCP 服务器管理器、Chrome 连接器、VISION-LIAO 记忆提供方，以及 MCP Settings UI 插件。界面源码由本仓库的 `vendor/dsh-client-ui-settings-mcp/src` 管理，并随仓库携带编译后的客户端 bundle。已发布的 `dsh-mcp-client@0.2.1-rc.3` 缺少本 bundle 使用的 `chrome` 和 `managed` 入口文件，因此仓库也会提供兼容的运行包。

## 开发备注

该 bundle 不自行实现 MCP 服务。`dsh.bundle.patch` manifest 字段声明 profile 配置项，随仓库提供的 client 运行包与其他依赖则让 profile resolver 能找到这些服务。

MCP Settings UI 源码位于 `vendor/dsh-client-ui-settings-mcp/src`，`dsh-mcp-client` 依赖使用 `vendor/dsh-mcp-client` 中的兼容运行包。在同级的 `deepseek-harness` 仓库根目录运行 `pnpm exec tsdown --config ../dsh-mcp/vendor/dsh-client-ui-settings-mcp/tsdown.config.ts`，即可从本仓库源码重建界面包。

## Model Experience

只有 MCP 服务器成功连接并提供工具后，模型才能使用 MCP 工具。VISION-LIAO 记忆默认禁用；Chrome 配置完成后才会启动。

## 已知限制与延期工作

- Settings UI 依赖包含 Web 客户端 Settings 插件的 profile；该 bundle 不会为 headless profile 单独添加 Settings 页面。

## 随仓库提供的依赖

本仓库在 `vendor/` 中包含 MCP Settings UI 源码与编译副本、VISION-LIAO provider，以及兼容的 MCP client 运行包。bundle 使用相对 `file:` 依赖，因此可以移动或克隆到其他目录。从仓库所在目录运行 `pnpm dsh plugin --profile <profile> add file:./dsh-mcp-settings` 即可安装。
