---
description: "可选 bundle，为 Web 和 Desktop profile 提供 MCP 服务器管理、Chrome 连接与 Cognee 记忆设置。"
kind: "package-bundle"
---

# `@deepseek-ai/dsh-mcp-settings`

[English](README.md) | 中文

## 概述

该 bundle 将此前由 Web profile 默认包含的 MCP 控件集中在一起。将它加入提供 Web Settings UI 的 profile 后，可管理 MCP 服务器、可选 Chrome 连接和 Cognee 记忆设置。默认 `new-gold` 地址仍在 `http://127.0.0.1:12888/new-gold` 启用；Cognee 与 Chrome 默认关闭。

## 使用本包

将 `@deepseek-ai/dsh-mcp-settings` 加入 profile manifest 的 `dsh.profile.bundles`。随附的 Web 和 Desktop profile 已包含它。自定义 profile 可移除此 bundle，以移除对应 MCP 配置项和 Settings 入口。

## 理解实现

`cordis.patch.yml` 插入 MCP 服务器管理器、Chrome 连接器、Cognee 记忆提供方，以及现有 MCP Settings UI 插件。浏览器界面仍由 `@deepseek-ai/dsh-client-ui-settings-mcp` 实现。

## 开发备注

该 bundle 不包含自己的运行时实现。`dsh.bundle.patch` manifest 字段声明 profile 配置项，依赖项则确保 profile resolver 能找到这些插件。

## Model Experience

只有 MCP 服务器成功连接并提供工具后，模型才能使用 MCP 工具。Cognee 记忆默认禁用；Chrome 配置完成后才会启动。

## 已知限制与延期工作

- Settings UI 依赖包含 Web 客户端 Settings 插件的 profile；该 bundle 不会为 headless profile 单独添加 Settings 页面。

## 随仓库提供的依赖

本仓库在 `vendor/` 中包含 MCP Settings UI 和 Cognee 包的编译副本。bundle 使用相对 `file:` 依赖，因此可以移动或克隆到其他目录。从仓库所在目录运行 `pnpm dsh plugin --profile <profile> add file:./dsh-mcp` 即可安装。
