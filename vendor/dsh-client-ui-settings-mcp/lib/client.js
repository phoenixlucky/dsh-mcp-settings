window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-mcp",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/mcpCardAppearance.js
		/** Validate a server key before it is used to address presentation settings.
		* @param value - Candidate MCP `serverName`.
		* @returns Whether the key matches the stable server-name format.
		*/
		function isMcpServerIdentity(value) {
			return /^[A-Za-z0-9_-]{1,32}$/u.test(value);
		}
		/** Replace only the named server's visual preferences, preserving all others.
		* @param current - Existing saved server preferences.
		* @param serverName - Stable server identity.
		* @param appearance - Display-only values to save.
		* @returns Updated preference map.
		*/
		function withMcpCardAppearance(current, serverName, appearance) {
			if (!isMcpServerIdentity(serverName)) throw new TypeError("MCP server name must contain 1–32 letters, digits, _ or -");
			return {
				...current,
				[serverName]: { ...appearance }
			};
		}
		/** Remove one override and let the default card presentation take over.
		* @param current - Existing saved server preferences.
		* @param serverName - Stable server identity to reset.
		* @returns Updated preference map.
		*/
		function withoutMcpCardAppearance(current, serverName) {
			if (!Object.hasOwn(current, serverName)) return current;
			return Object.fromEntries(Object.entries(current).filter(([name]) => name !== serverName));
		}
		//#endregion
		//#region \0dsh-css:E:\home\deepseek-harness\packages\client\ui-settings-mcp\src\client\mcp-settings.module.css.mjs
		const css = ".DqpPCW_connections{--mcp-space-1:4px;--mcp-space-2:8px;--mcp-space-3:12px;--mcp-space-4:16px;--mcp-space-5:20px;--dsw-alias-button-primary-fill:var(--dsw-static-amber-600);--mcp-card-fill:color-mix(in srgb, var(--dsw-static-amber-100) 28%, var(--dsw-alias-settings-card-fill));--mcp-field-fill:color-mix(in srgb, var(--dsw-static-amber-100) 48%, var(--dsw-alias-bg-layer-1));--mcp-card-stroke:color-mix(in srgb, var(--dsw-static-amber-600) 18%, var(--dsw-alias-settings-card-stroke));gap:var(--mcp-space-5);grid-template-columns:minmax(0,1fr);width:100%;max-width:none;margin-inline:auto;display:grid}.DqpPCW_pageHeader{align-items:center;gap:var(--mcp-space-3);min-width:0;padding:0 var(--mcp-space-1) var(--mcp-space-2);display:flex}.DqpPCW_pageIcon{border-radius:var(--dsw-radius-xl);background:var(--mcp-field-fill);width:3.5rem;height:3.5rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.DqpPCW_pageCopy{gap:var(--mcp-space-1);min-width:0;display:grid}.DqpPCW_pageTitle{color:var(--dsw-alias-label-primary);font:500 28px/36px var(--dsw-font-family);margin:0}.DqpPCW_pageDescription{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);margin:0}.DqpPCW_card{align-content:start;gap:var(--mcp-space-3);width:100%;min-width:0;padding:var(--mcp-space-4);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--mcp-card-fill);color:var(--dsw-alias-label-primary);box-shadow:none;display:grid;container-type:inline-size}.DqpPCW_cardHeader{justify-content:space-between;align-items:center;gap:var(--mcp-space-4);min-height:3.5rem;padding-inline:var(--mcp-space-1);display:flex}.DqpPCW_cardIdentity{align-items:center;gap:var(--mcp-space-3);min-width:0;display:flex}.DqpPCW_cardIcon{border-radius:var(--dsw-radius-lg);background:var(--mcp-field-fill);width:3rem;height:3rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.DqpPCW_cardCopy{gap:var(--mcp-space-1);min-width:0;display:grid}.DqpPCW_cardTitle{min-width:0;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xl-24);margin:0}.DqpPCW_card>h3{padding:0 var(--mcp-space-1) var(--mcp-space-3);border-bottom:.5px solid var(--mcp-card-stroke);color:var(--dsw-alias-label-primary);font:var(--dsw-font-l-20);margin:0}.DqpPCW_cardDescription{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);margin:0}.DqpPCW_enableControl{align-items:center;gap:var(--mcp-space-3);flex:none;padding:0;display:flex}.DqpPCW_enableLabel{max-width:14rem;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);text-align:right}.DqpPCW_fieldGroup{gap:var(--mcp-space-4);min-width:0;padding:var(--mcp-space-4);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--mcp-field-fill);display:grid}.DqpPCW_fieldGroupTitle{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.DqpPCW_field{gap:var(--mcp-space-2);color:var(--dsw-alias-label-primary);font:var(--dsw-font-base-strong-16);display:grid}.DqpPCW_field input,.DqpPCW_field textarea,.DqpPCW_field select{box-sizing:border-box;width:100%;min-width:0;min-height:2.5rem;padding:var(--mcp-space-2) var(--mcp-space-3);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-md);background:var(--mcp-field-fill);color:var(--dsw-alias-label-primary);font:inherit}.DqpPCW_field textarea:focus-visible,.DqpPCW_field select:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.DqpPCW_field textarea:disabled,.DqpPCW_field select:disabled{opacity:.6}.DqpPCW_field input:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.DqpPCW_field input:disabled{opacity:.6}.DqpPCW_field small{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16)}.DqpPCW_cardFooter{align-items:center;gap:var(--mcp-space-4);padding:var(--mcp-space-3) var(--mcp-space-1) 0;border-top:.5px dashed var(--mcp-card-stroke);grid-template-columns:minmax(0,1fr) auto;display:grid}.DqpPCW_status{align-items:center;gap:var(--mcp-space-2) var(--mcp-space-3);min-width:0;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);flex-wrap:wrap;margin:0;display:flex}.DqpPCW_status strong{width:fit-content;padding:var(--mcp-space-1) var(--mcp-space-3);corner-shape:round;background:var(--mcp-field-fill);color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-strong-14);border-radius:999px}.DqpPCW_status strong[data-state=ready]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-success-primary)}.DqpPCW_error{color:var(--dsw-alias-state-error-primary);grid-column:1/-1;margin:0}.DqpPCW_actions{justify-content:flex-end;gap:var(--mcp-space-2);flex-wrap:wrap;display:flex}.DqpPCW_serverList{gap:var(--mcp-space-3);min-width:0;display:grid}.DqpPCW_serverList h4{color:var(--dsw-alias-label-primary);margin:0}.DqpPCW_serverCard{align-items:center;gap:var(--mcp-space-4);padding:var(--mcp-space-4);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--mcp-field-fill);color:var(--dsw-alias-label-secondary);grid-template-columns:minmax(0,1fr) auto auto;display:grid}.DqpPCW_serverCard strong{color:var(--dsw-alias-label-primary)}.DqpPCW_serverCard p{margin:0}.DqpPCW_serverCard>p{padding-inline:var(--mcp-space-4);border-inline:.5px solid var(--mcp-card-stroke);color:var(--dsw-alias-label-primary);white-space:nowrap}.DqpPCW_serverHeading{justify-content:space-between;align-items:center;gap:var(--mcp-space-3);display:flex}.DqpPCW_serverIdentity{align-items:center;gap:var(--mcp-space-3);min-width:0;display:flex}.DqpPCW_serverIcon{border-radius:var(--dsw-radius-lg);background:var(--mcp-field-fill);width:2.75rem;height:2.75rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.DqpPCW_serverState{width:fit-content;padding:2px var(--mcp-space-2);background:var(--mcp-field-fill);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);border-radius:999px;align-items:center;display:inline-flex}.DqpPCW_serverState[data-state=connected]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-success-primary)}.DqpPCW_serverCardEditing{grid-template-columns:minmax(0,1fr)}.DqpPCW_serverCardEditing>p{white-space:normal;border:0;padding:0}.DqpPCW_serverCardEditing>.DqpPCW_actions,.DqpPCW_serverCardEditing>section{grid-column:1/-1}.DqpPCW_secretRow{align-items:end;gap:var(--mcp-space-3);grid-template-columns:repeat(3,minmax(0,1fr)) auto;display:grid}@container (width<=48rem){.DqpPCW_serverCard:not(.DqpPCW_serverCardEditing){align-items:center;column-gap:var(--mcp-space-4);row-gap:var(--mcp-space-4);grid-template-columns:minmax(0,1fr) auto}.DqpPCW_serverCard:not(.DqpPCW_serverCardEditing)>.DqpPCW_serverHeading{grid-column:1/-1}.DqpPCW_serverCard:not(.DqpPCW_serverCardEditing)>p{white-space:normal;border:0;padding:0}.DqpPCW_serverCard:not(.DqpPCW_serverCardEditing)>.DqpPCW_actions{justify-content:flex-end;gap:var(--mcp-space-3)}}@container (width<=40rem){.DqpPCW_cardHeader{flex-wrap:wrap;align-items:flex-start}.DqpPCW_cardIdentity{flex:100%}.DqpPCW_enableControl{flex:auto;justify-content:space-between;max-width:100%}.DqpPCW_serverCard:not(.DqpPCW_serverCardEditing){grid-template-columns:minmax(0,1fr);align-items:start}.DqpPCW_serverCard:not(.DqpPCW_serverCardEditing)>p{white-space:normal;border:0;padding:0}.DqpPCW_serverCard:not(.DqpPCW_serverCardEditing)>.DqpPCW_actions{justify-content:flex-start}}@container (width>=38rem){.DqpPCW_field{align-items:center;column-gap:var(--mcp-space-4);grid-template-columns:minmax(9rem,12rem) minmax(0,1fr)}.DqpPCW_field small{grid-column:2}.DqpPCW_secretRow .DqpPCW_field{grid-template-columns:minmax(0,1fr)}.DqpPCW_secretRow .DqpPCW_field small{grid-column:1}}@container (width<=32rem){.DqpPCW_card{padding:var(--mcp-space-3)}.DqpPCW_field{grid-template-columns:minmax(0,1fr)}.DqpPCW_field small{grid-column:1}.DqpPCW_cardFooter{grid-template-columns:minmax(0,1fr)}.DqpPCW_actions{justify-content:flex-start}.DqpPCW_secretRow{grid-template-columns:minmax(0,1fr)}.DqpPCW_serverHeading{flex-wrap:wrap;align-items:flex-start}.DqpPCW_serverCard>.DqpPCW_actions{justify-content:flex-start}.DqpPCW_serverCard{grid-template-columns:minmax(0,1fr);align-items:start}.DqpPCW_serverCard>p{white-space:normal;border:0;padding:0}}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-mcp/mcp-settings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-mcp";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var mcp_settings_module_css_default = {
			"actions": "DqpPCW_actions",
			"card": "DqpPCW_card",
			"cardCopy": "DqpPCW_cardCopy",
			"cardDescription": "DqpPCW_cardDescription",
			"cardFooter": "DqpPCW_cardFooter",
			"cardHeader": "DqpPCW_cardHeader",
			"cardIcon": "DqpPCW_cardIcon",
			"cardIdentity": "DqpPCW_cardIdentity",
			"cardTitle": "DqpPCW_cardTitle",
			"connections": "DqpPCW_connections",
			"enableControl": "DqpPCW_enableControl",
			"enableLabel": "DqpPCW_enableLabel",
			"error": "DqpPCW_error",
			"field": "DqpPCW_field",
			"fieldGroup": "DqpPCW_fieldGroup",
			"fieldGroupTitle": "DqpPCW_fieldGroupTitle",
			"pageCopy": "DqpPCW_pageCopy",
			"pageDescription": "DqpPCW_pageDescription",
			"pageHeader": "DqpPCW_pageHeader",
			"pageIcon": "DqpPCW_pageIcon",
			"pageTitle": "DqpPCW_pageTitle",
			"secretRow": "DqpPCW_secretRow",
			"serverCard": "DqpPCW_serverCard",
			"serverCardEditing": "DqpPCW_serverCardEditing",
			"serverHeading": "DqpPCW_serverHeading",
			"serverIcon": "DqpPCW_serverIcon",
			"serverIdentity": "DqpPCW_serverIdentity",
			"serverList": "DqpPCW_serverList",
			"serverState": "DqpPCW_serverState",
			"status": "DqpPCW_status"
		};
		//#endregion
		//#region lib/types/client/McpCardSettings.js
		/** Configure display-only metadata without touching an MCP server declaration. */
		function McpCardSettings({ form, remote, t }) {
			const state = (0, react.useSyncExternalStore)((listener) => form.subscribe(listener), () => form.getSnapshot());
			const [serverName, setServerName] = (0, react.useState)("");
			const [draft, setDraft] = (0, react.useState)({});
			const [error, setError] = (0, react.useState)(false);
			const saved = state.value?.servers ?? {};
			const [servers, setServers] = (0, react.useState)([]);
			const [statusAvailable, setStatusAvailable] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				let active = true;
				let timer;
				const refresh = async () => {
					try {
						const reply = await remote.mcpClientStatus.list();
						if (active && reply.ok) {
							setServers(reply.value);
							setStatusAvailable(true);
						}
					} catch {
						if (active) setStatusAvailable(false);
					}
					if (active) timer = setTimeout(() => {
						refresh();
					}, 2500);
				};
				refresh();
				return () => {
					active = false;
					clearTimeout(timer);
				};
			}, [remote]);
			const load = (name) => {
				setDraft(saved[name] ?? {});
			};
			const save = async () => {
				if (!isMcpServerIdentity(serverName)) {
					setError(true);
					return;
				}
				setError(false);
				const next = withMcpCardAppearance(saved, serverName, draft);
				if (!await form.set("servers", next)) setError(true);
			};
			const reset = async () => {
				if (!isMcpServerIdentity(serverName)) {
					setError(true);
					return;
				}
				setError(!await form.set("servers", withoutMcpCardAppearance(saved, serverName)));
				setDraft({});
			};
			const field = (key, label) => (0, react_jsx_runtime.jsxs)("label", {
				className: mcp_settings_module_css_default.field,
				children: [(0, react_jsx_runtime.jsx)("span", { children: label }), (0, react_jsx_runtime.jsx)("input", {
					value: draft[key] ?? "",
					disabled: !state.writable,
					onChange: (event) => {
						setDraft((value) => ({
							...value,
							[key]: event.currentTarget.value
						}));
					}
				})]
			});
			const flag = (key, label) => (0, react_jsx_runtime.jsxs)("label", {
				className: mcp_settings_module_css_default.switchRow,
				children: [(0, react_jsx_runtime.jsx)("span", { children: label }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
					checked: draft[key] ?? true,
					label,
					disabled: !state.writable,
					onChange: (value) => {
						setDraft((current) => ({
							...current,
							[key]: value
						}));
					}
				})]
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.card,
				"aria-label": t("appearanceTitle"),
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("appearanceTitle") }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.serverList,
						"aria-label": t("serverCards"),
						children: [
							(0, react_jsx_runtime.jsx)("h4", { children: t("serverCards") }),
							servers.length === 0 && (0, react_jsx_runtime.jsx)("p", {
								role: "status",
								children: t(statusAvailable ? "noServers" : "statusUnavailable")
							}),
							servers.map((server) => {
								const appearance = saved[server.serverName] ?? {};
								return (0, react_jsx_runtime.jsxs)("article", {
									className: mcp_settings_module_css_default.serverCard,
									children: [
										(0, react_jsx_runtime.jsxs)("strong", { children: [appearance.icon && (0, react_jsx_runtime.jsxs)("span", {
											"aria-hidden": "true",
											children: [appearance.icon, " "]
										}), appearance.displayName || server.serverName] }),
										appearance.description && (0, react_jsx_runtime.jsx)("p", { children: appearance.description }),
										appearance.showConnectionStatus !== false && (0, react_jsx_runtime.jsxs)("span", { children: [
											t("connectionState"),
											": ",
											t(`connection.${server.state}`)
										] }),
										appearance.showToolCount !== false && (0, react_jsx_runtime.jsxs)("span", { children: [
											t("toolCount"),
											": ",
											server.toolCount
										] }),
										appearance.showTransport !== false && (0, react_jsx_runtime.jsxs)("span", { children: [
											t("transport"),
											": ",
											t(`transport.${server.transport}`)
										] }),
										appearance.showSource !== false && (0, react_jsx_runtime.jsxs)("span", { children: [
											t("source"),
											": ",
											server.source
										] })
									]
								}, server.id);
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: t("serverName") }),
							(0, react_jsx_runtime.jsx)("input", {
								value: serverName,
								disabled: !state.writable,
								onChange: (event) => {
									setServerName(event.currentTarget.value);
									load(event.currentTarget.value);
								}
							}),
							(0, react_jsx_runtime.jsx)("small", { children: t("serverNameHint") })
						]
					}),
					field("displayName", t("displayName")),
					field("description", t("description")),
					field("icon", t("icon")),
					flag("showConnectionStatus", t("showConnectionStatus")),
					flag("showToolCount", t("showToolCount")),
					flag("showTransport", t("showTransport")),
					flag("showSource", t("showSource")),
					(0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.actions,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: !state.writable,
							onClick: () => {
								save();
							},
							children: t("saveAppearance")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: !state.writable,
							onClick: () => {
								reset();
							},
							children: t("resetAppearance")
						})]
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: t("invalidServerName")
					})
				]
			});
		}
		//#endregion
		//#region ../../util/crypto/lib/index.js
		/**
		* Random v4 UUID, minted from `crypto.getRandomValues`.
		* @returns the UUID string.
		*/
		function randomUUID() {
			const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
			const hex = Array.from(bytes, (byte, index) => {
				return (index === 6 ? byte & 15 | 64 : index === 8 ? byte & 63 | 128 : byte).toString(16).padStart(2, "0");
			}).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
		//#endregion
		//#region lib/types/client/ManagedMcpServers.js
		function emptyDraft() {
			return {
				id: randomUUID(),
				serverName: "",
				enabled: true,
				purpose: "model-tools",
				transport: "streamable-http",
				url: "",
				headers: [],
				command: "",
				args: "",
				cwd: "",
				secrets: []
			};
		}
		function toDraft(server) {
			const secrets = server.transport === "streamable-http" ? server.headerRefs : server.envRefs;
			return {
				id: server.id,
				serverName: server.serverName,
				enabled: server.enabled,
				purpose: server.purpose ?? "model-tools",
				transport: server.transport,
				url: server.transport === "streamable-http" ? server.url : "",
				headers: server.transport === "streamable-http" ? Object.entries(server.headers ?? {}).map(([name, value]) => ({
					name,
					value
				})) : [],
				command: server.transport === "stdio" ? server.command : "",
				args: server.transport === "stdio" ? server.args.join("\n") : "",
				cwd: server.transport === "stdio" ? server.cwd : "",
				secrets: Object.entries(secrets).map(([name, ref]) => ({
					name,
					ref,
					value: ""
				}))
			};
		}
		/** Edit multiple host-managed MCP servers and check their connection state. */
		function ManagedMcpServers({ form, remote, t }) {
			const snapshot = (0, react.useSyncExternalStore)(form.subscribe.bind(form), form.getSnapshot.bind(form));
			const servers = snapshot.value?.servers ?? [];
			const [statuses, setStatuses] = (0, react.useState)([]);
			const [draft, setDraft] = (0, react.useState)(emptyDraft);
			const [activeEditorId, setActiveEditorId] = (0, react.useState)();
			const [busy, setBusy] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)();
			const [checkState, setCheckState] = (0, react.useState)();
			(0, react.useEffect)(() => {
				let active = true;
				const refresh = async () => {
					try {
						const reply = await remote.mcpClientStatus.list();
						if (active && reply.ok) setStatuses(reply.value);
					} catch (error) {
						if (active) setStatuses([]);
					}
				};
				refresh();
				const timer = setInterval(() => {
					refresh();
				}, 5e3);
				return () => {
					active = false;
					clearInterval(timer);
				};
			}, [remote]);
			const saveServers = async (next) => {
				if (!await form.set("servers", next)) throw new Error("settings refused");
				await refreshStatuses();
			};
			const refreshStatuses = async () => {
				try {
					const reply = await remote.mcpClientStatus.list();
					if (reply.ok) setStatuses(reply.value);
				} catch {
					setStatuses([]);
				}
			};
			const prepareDraft = async () => {
				const serverName = draft.serverName.trim();
				if (!/^[A-Za-z0-9_-]{1,32}$/u.test(serverName) || servers.some((server) => server.id !== draft.id && server.serverName === serverName) || (draft.transport === "streamable-http" ? !isAllowedEndpoint(draft.url) : draft.command.trim() === "")) {
					setFailure("invalid");
					return;
				}
				const refs = {};
				const headers = {};
				const headerNames = /* @__PURE__ */ new Set();
				for (const row of draft.headers) {
					const name = row.name.trim();
					const value = row.value;
					const normalized = name.toLowerCase();
					if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || /[\r\n]/u.test(value) || /^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name) || headerNames.has(normalized)) {
						setFailure("invalid");
						return;
					}
					headerNames.add(normalized);
					headers[name] = value;
				}
				for (const row of draft.secrets) {
					const name = row.name.trim();
					const ref = row.ref.trim();
					const validName = draft.transport === "streamable-http" ? /^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) : /^[A-Za-z_][A-Za-z0-9_]*$/u.test(name);
					const normalized = name.toLowerCase();
					if (!validName || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref) || headerNames.has(normalized)) {
						setFailure("invalid");
						return;
					}
					headerNames.add(normalized);
					refs[name] = ref;
				}
				setFailure(void 0);
				try {
					for (const row of draft.secrets) {
						if (row.value === "") continue;
						if (!(await remote.credentials.set(row.ref.trim(), row.value)).ok) {
							setFailure("credential");
							return;
						}
					}
				} catch (error) {
					setFailure("credential");
					return;
				}
				if (draft.purpose === "project-memory" && draft.transport !== "streamable-http") {
					setFailure("invalid");
					return;
				}
				return draft.transport === "streamable-http" ? {
					id: draft.id,
					serverName,
					enabled: draft.enabled,
					purpose: draft.purpose,
					transport: "streamable-http",
					url: draft.url.trim(),
					headers,
					headerRefs: refs
				} : {
					id: draft.id,
					serverName,
					enabled: draft.enabled,
					purpose: draft.purpose,
					transport: "stdio",
					command: draft.command.trim(),
					args: draft.args.split(/\r?\n/u).filter((value) => value.trim() !== ""),
					cwd: draft.cwd,
					envRefs: refs
				};
			};
			const saveDraft = async () => {
				const server = await prepareDraft();
				if (server === void 0) return void 0;
				const next = servers.some((current) => current.id === server.id) ? servers.map((current) => current.id === server.id ? server : current) : [...servers, server];
				try {
					await saveServers(next);
					setDraft(toDraft(server));
					setActiveEditorId(server.id);
					return server;
				} catch {
					setFailure("save");
					return;
				}
			};
			const checkDraft = async () => {
				setBusy(true);
				setFailure(void 0);
				setCheckState(void 0);
				try {
					const server = await prepareDraft();
					if (server === void 0) return;
					const reply = await remote.mcpServerManager.check(server);
					if (!reply.ok) {
						setFailure("check");
						return;
					}
					setCheckState(managedCheckLabel(t, reply.value));
				} catch {
					setFailure("check");
				} finally {
					setBusy(false);
				}
			};
			const remove = async (id) => {
				setBusy(true);
				setFailure(void 0);
				try {
					await saveServers(servers.filter((server) => server.id !== id));
					if (activeEditorId === id) setActiveEditorId(void 0);
				} catch {
					setFailure("save");
				} finally {
					setBusy(false);
				}
			};
			const toggle = async (server, enabled) => {
				setBusy(true);
				setFailure(void 0);
				try {
					await saveServers(servers.map((current) => current.id === server.id ? {
						...current,
						enabled
					} : current));
				} catch {
					setFailure("save");
				} finally {
					setBusy(false);
				}
			};
			const statusFor = (server) => statuses.find((status) => status.serverName === server.serverName);
			const isEditingExisting = servers.some((server) => server.id === draft.id);
			const editor = (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.fieldGroup,
				"aria-label": t("managed.editor"),
				children: [
					(0, react_jsx_runtime.jsx)("h4", {
						className: mcp_settings_module_css_default.fieldGroupTitle,
						children: t("managed.editor")
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("serverName") }), (0, react_jsx_runtime.jsx)("input", {
							value: draft.serverName,
							disabled: busy,
							onChange: (event) => setDraft({
								...draft,
								serverName: event.currentTarget.value
							})
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.purpose") }), (0, react_jsx_runtime.jsxs)("select", {
							value: draft.purpose,
							disabled: busy,
							onChange: (event) => {
								const purpose = event.currentTarget.value;
								setDraft({
									...draft,
									purpose,
									transport: purpose === "project-memory" ? "streamable-http" : draft.transport
								});
							},
							children: [(0, react_jsx_runtime.jsx)("option", {
								value: "model-tools",
								children: t("managed.purpose.model-tools")
							}), (0, react_jsx_runtime.jsx)("option", {
								value: "project-memory",
								children: t("managed.purpose.project-memory")
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("transport") }), (0, react_jsx_runtime.jsxs)("select", {
							value: draft.transport,
							disabled: busy,
							onChange: (event) => setDraft({
								...draft,
								transport: event.currentTarget.value,
								secrets: []
							}),
							children: [(0, react_jsx_runtime.jsx)("option", {
								value: "streamable-http",
								children: t("transport.streamable-http")
							}), (0, react_jsx_runtime.jsx)("option", {
								value: "stdio",
								children: t("transport.stdio")
							})]
						})]
					}),
					draft.transport === "streamable-http" ? (0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: t("managed.endpoint") }),
							(0, react_jsx_runtime.jsx)("input", {
								type: "url",
								value: draft.url,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									url: event.currentTarget.value
								})
							}),
							(0, react_jsx_runtime.jsx)("small", { children: t("endpointHint") })
						]
					}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("label", {
							className: mcp_settings_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.command") }), (0, react_jsx_runtime.jsx)("input", {
								value: draft.command,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									command: event.currentTarget.value
								})
							})]
						}),
						(0, react_jsx_runtime.jsxs)("label", {
							className: mcp_settings_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.args") }), (0, react_jsx_runtime.jsx)("textarea", {
								rows: 3,
								value: draft.args,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									args: event.currentTarget.value
								})
							})]
						}),
						(0, react_jsx_runtime.jsxs)("label", {
							className: mcp_settings_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.cwd") }), (0, react_jsx_runtime.jsx)("input", {
								value: draft.cwd,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									cwd: event.currentTarget.value
								})
							})]
						})
					] }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.serverList,
						children: [
							draft.transport === "streamable-http" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								(0, react_jsx_runtime.jsx)("h4", { children: t("managed.headers") }),
								draft.headers.map((row, index) => (0, react_jsx_runtime.jsxs)("div", {
									className: mcp_settings_module_css_default.secretRow,
									children: [
										(0, react_jsx_runtime.jsxs)("label", {
											className: mcp_settings_module_css_default.field,
											children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.headerName") }), (0, react_jsx_runtime.jsx)("input", {
												value: row.name,
												disabled: busy,
												onChange: (event) => setDraft({
													...draft,
													headers: draft.headers.map((item, rowIndex) => rowIndex === index ? {
														...item,
														name: event.currentTarget.value
													} : item)
												})
											})]
										}),
										(0, react_jsx_runtime.jsxs)("label", {
											className: mcp_settings_module_css_default.field,
											children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.headerValue") }), (0, react_jsx_runtime.jsx)("input", {
												value: row.value,
												disabled: busy,
												onChange: (event) => setDraft({
													...draft,
													headers: draft.headers.map((item, rowIndex) => rowIndex === index ? {
														...item,
														value: event.currentTarget.value
													} : item)
												})
											})]
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: busy,
											onClick: () => setDraft({
												...draft,
												headers: draft.headers.filter((_item, rowIndex) => rowIndex !== index)
											}),
											children: t("managed.removeHeader")
										})
									]
								}, `header-${index}`)),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy,
									onClick: () => setDraft({
										...draft,
										headers: [...draft.headers, {
											name: "",
											value: ""
										}]
									}),
									children: t("managed.addHeader")
								})
							] }),
							(0, react_jsx_runtime.jsx)("h4", { children: draft.transport === "streamable-http" ? t("managed.credentials") : t("managed.environment") }),
							draft.secrets.map((row, index) => (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.secretRow,
								children: [
									(0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [(0, react_jsx_runtime.jsx)("span", { children: draft.transport === "streamable-http" ? t("managed.headerName") : t("managed.envName") }), (0, react_jsx_runtime.jsx)("input", {
											value: row.name,
											disabled: busy,
											onChange: (event) => setDraft({
												...draft,
												secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? {
													...item,
													name: event.currentTarget.value
												} : item)
											})
										})]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.credentialRef") }), (0, react_jsx_runtime.jsx)("input", {
											value: row.ref,
											disabled: busy,
											onChange: (event) => setDraft({
												...draft,
												secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? {
													...item,
													ref: event.currentTarget.value
												} : item)
											})
										})]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("managed.secret") }), (0, react_jsx_runtime.jsx)("input", {
											type: "password",
											autoComplete: "new-password",
											value: row.value,
											disabled: busy,
											onChange: (event) => setDraft({
												...draft,
												secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? {
													...item,
													value: event.currentTarget.value
												} : item)
											})
										})]
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										disabled: busy,
										onClick: () => setDraft({
											...draft,
											secrets: draft.secrets.filter((_item, rowIndex) => rowIndex !== index)
										}),
										children: t("managed.removeSecret")
									})
								]
							}, index)),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: busy,
								onClick: () => setDraft({
									...draft,
									secrets: [...draft.secrets, {
										name: "",
										ref: "",
										value: ""
									}]
								}),
								children: t("managed.addSecret")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("footer", {
						className: mcp_settings_module_css_default.cardFooter,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.actions,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy || !snapshot.writable,
									onClick: () => {
										saveDraft();
									},
									children: t("save")
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy,
									onClick: () => {
										checkDraft();
									},
									children: busy ? t("checking") : t("check")
								})]
							}),
							checkState !== void 0 && (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.status,
								role: "status",
								children: checkState
							}),
							failure !== void 0 && (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.error,
								role: "alert",
								children: managedFailureLabel(t, failure)
							})
						]
					})
				]
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.card,
				"aria-label": t("managed.title"),
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: mcp_settings_module_css_default.cardHeader,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.cardIdentity,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: mcp_settings_module_css_default.cardIcon,
							"aria-hidden": "true",
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 24 })
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.cardCopy,
							children: [(0, react_jsx_runtime.jsx)("h3", {
								className: mcp_settings_module_css_default.cardTitle,
								children: t("managed.title")
							}), (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.cardDescription,
								children: t("managed.description")
							})]
						})]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: busy || !snapshot.writable,
						"aria-expanded": !isEditingExisting && activeEditorId === draft.id,
						onClick: () => {
							if (!isEditingExisting && activeEditorId === draft.id) setActiveEditorId(void 0);
							else {
								const next = emptyDraft();
								setDraft(next);
								setActiveEditorId(next.id);
							}
							setFailure(void 0);
							setCheckState(void 0);
						},
						children: t("managed.add")
					})]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: mcp_settings_module_css_default.serverList,
					children: [
						servers.length === 0 && activeEditorId !== draft.id && (0, react_jsx_runtime.jsx)("p", { children: t("managed.empty") }),
						servers.map((server) => {
							const status = statusFor(server);
							const state = !server.enabled ? "disabled" : status?.state ?? "disconnected";
							return (0, react_jsx_runtime.jsxs)("article", {
								className: `${mcp_settings_module_css_default.serverCard} ${activeEditorId === server.id ? mcp_settings_module_css_default.serverCardEditing : ""}`,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: mcp_settings_module_css_default.serverHeading,
										children: [(0, react_jsx_runtime.jsxs)("div", {
											className: mcp_settings_module_css_default.serverIdentity,
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: mcp_settings_module_css_default.serverIcon,
												"aria-hidden": "true",
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 22 })
											}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: server.serverName }), (0, react_jsx_runtime.jsxs)("p", { children: [
												t(server.transport === "stdio" ? "transport.stdio" : "transport.streamable-http"),
												" · ",
												(0, react_jsx_runtime.jsx)("span", {
													className: mcp_settings_module_css_default.serverState,
													"data-state": state,
													children: managedStateLabel(t, state)
												})
											] })] })]
										}), (0, react_jsx_runtime.jsxs)("div", {
											className: mcp_settings_module_css_default.enableControl,
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: mcp_settings_module_css_default.enableLabel,
												children: t("managed.enabled")
											}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
												checked: server.enabled,
												label: t("managed.enabled"),
												disabled: busy || !snapshot.writable,
												onChange: (value) => {
													toggle(server, value);
												}
											})]
										})]
									}),
									(0, react_jsx_runtime.jsxs)("p", { children: [
										t("toolCount"),
										": ",
										status?.toolCount ?? 0
									] }),
									(0, react_jsx_runtime.jsxs)("div", {
										className: mcp_settings_module_css_default.actions,
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: busy || !snapshot.writable,
											"aria-expanded": activeEditorId === server.id,
											onClick: () => {
												if (activeEditorId === server.id) setActiveEditorId(void 0);
												else {
													setDraft(toDraft(server));
													setActiveEditorId(server.id);
												}
												setFailure(void 0);
												setCheckState(void 0);
											},
											children: t("managed.edit")
										}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: busy || !snapshot.writable,
											onClick: () => {
												remove(server.id);
											},
											children: t("managed.delete")
										})]
									}),
									activeEditorId === server.id && editor
								]
							}, server.id);
						}),
						!isEditingExisting && activeEditorId === draft.id && (0, react_jsx_runtime.jsx)("article", {
							className: `${mcp_settings_module_css_default.serverCard} ${mcp_settings_module_css_default.serverCardEditing}`,
							children: editor
						})
					]
				})]
			});
		}
		function isAllowedEndpoint(input) {
			try {
				const url = new URL(input);
				const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
				const loopback = hostname === "localhost" || /^127(?:\.\d{1,3}){3}$/u.test(hostname) || hostname === "::1";
				return url.username === "" && url.password === "" && (url.protocol === "https:" || url.protocol === "http:" && loopback);
			} catch (error) {
				return false;
			}
		}
		function managedStateLabel(t, state) {
			switch (state) {
				case "disabled": return t("managed.state.disabled");
				case "connecting": return t("managed.state.connecting");
				case "connected": return t("managed.state.connected");
				case "reconnecting": return t("managed.state.reconnecting");
				case "disconnected": return t("managed.state.disconnected");
			}
		}
		function managedCheckLabel(t, result) {
			switch (result.state) {
				case "ready": return t("managed.checkReady").replace("{count}", String(result.toolCount));
				case "authorization-required": return t("managed.check.authorization-required");
				case "connection-failed": return t("managed.check.connection-failed");
				case "timed-out": return t("managed.check.timed-out");
			}
		}
		function managedFailureLabel(t, failure) {
			switch (failure) {
				case "save": return t("managed.error.save");
				case "credential": return t("managed.error.credential");
				case "check": return t("managed.error.check");
				case "invalid": return t("managed.error.invalid");
			}
		}
		//#endregion
		//#region lib/types/client/McpConnectionsPage.js
		/** Show each managed connection on the shared MCP settings page when served. */
		function McpConnectionsPage({ managedForm, remote, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: mcp_settings_module_css_default.connections,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: mcp_settings_module_css_default.pageHeader,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: mcp_settings_module_css_default.pageIcon,
						"aria-hidden": "true",
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium, { size: 24 })
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.pageCopy,
						children: [(0, react_jsx_runtime.jsx)("h2", {
							className: mcp_settings_module_css_default.pageTitle,
							children: t("pageTitle")
						}), (0, react_jsx_runtime.jsx)("p", {
							className: mcp_settings_module_css_default.pageDescription,
							children: t("pageDescription")
						})]
					})]
				}), (0, react_jsx_runtime.jsx)(ManagedMcpServers, {
					form: managedForm,
					remote,
					t
				})]
			});
		}
		//#endregion
		//#region lib/types/client/migration.js
		/** Move legacy endpoint settings into the single managed MCP list.
		* @param cogneeForm - Legacy Cognee settings form.
		* @param chromeForm - Legacy Chrome settings form.
		* @param managedForm - Canonical managed server list form.
		* @returns Whether an old configuration was migrated.
		*/
		async function runLegacyMcpMigration(cogneeForm, chromeForm, managedForm) {
			await Promise.all([
				waitForFirstSnapshot(cogneeForm),
				waitForFirstSnapshot(chromeForm),
				waitForFirstSnapshot(managedForm)
			]);
			const cognee = cogneeForm.getSnapshot().value ?? {};
			const chrome = chromeForm.getSnapshot().value ?? {};
			if (!Boolean(cognee.enabled || cognee.endpoint || chrome.enabled || chrome.url)) return false;
			const servers = [...managedForm.getSnapshot().value?.servers ?? []];
			if (chrome.url?.trim() && !servers.some((server) => server.serverName === "chrome")) {
				const url = safeEndpoint(chrome.url);
				if (url === void 0) throw new TypeError("legacy Chrome endpoint is not a supported HTTP endpoint");
				servers.push({
					id: "chrome",
					serverName: "chrome",
					enabled: chrome.enabled ?? false,
					purpose: "model-tools",
					transport: "streamable-http",
					url: url.href,
					headers: { Origin: url.origin },
					headerRefs: { Authorization: "DSH_CHROME_MCP_TOKEN" }
				});
			}
			if (cognee.endpoint?.trim() && !servers.some((server) => server.serverName === "cognee")) {
				const url = safeEndpoint(cognee.endpoint);
				if (url === void 0) throw new TypeError("legacy Cognee endpoint is not a supported HTTP endpoint");
				const ref = /^[A-Za-z_][A-Za-z0-9_]*$/u.test(cognee.credentialRef ?? "") ? cognee.credentialRef : "DSH_COGNEE_MCP_TOKEN";
				servers.push({
					id: "cognee",
					serverName: "cognee",
					enabled: cognee.enabled ?? false,
					purpose: "project-memory",
					transport: "streamable-http",
					url: url.href,
					headers: {},
					headerRefs: { Authorization: ref }
				});
			}
			if (!await managedForm.set("servers", servers)) throw new Error("managed MCP settings refused the migration");
			if ((await Promise.all([
				cogneeForm.set("enabled", false),
				cogneeForm.set("endpoint", ""),
				chromeForm.set("enabled", false),
				chromeForm.set("url", "")
			])).some((accepted) => !accepted)) throw new Error("legacy MCP settings could not be cleared");
			return true;
		}
		function waitForFirstSnapshot(form) {
			if (form.getSnapshot().status !== "loading") return Promise.resolve();
			return new Promise((resolve) => {
				const unsubscribe = form.subscribe(() => {
					if (form.getSnapshot().status === "loading") return;
					unsubscribe();
					resolve();
				});
			});
		}
		function safeEndpoint(input) {
			try {
				const url = new URL(input);
				const host = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
				const loopback = host === "localhost" || host === "::1" || /^127(?:\.\d{1,3}){3}$/u.test(host);
				if (url.username || url.password || url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) return void 0;
				return url;
			} catch {
				return;
			}
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** English strings for Cognee and MCP card settings. */
		const en = {
			title: "MCP",
			pageTitle: "MCP settings",
			pageDescription: "Configure every MCP server in one managed list.",
			cogneeDescription: "Configure the Cognee MCP connection and project memory.",
			chromeDescription: "Connect Chrome browser tools through MCP.",
			endpoint: "Cognee MCP endpoint",
			endpointHint: "Use HTTPS, or HTTP on this computer only.",
			enabled: "Use Cognee project memory",
			token: "Bearer token",
			tokenSet: "Token is configured",
			tokenUnset: "Token is not configured",
			credentialsUnavailable: "Credential storage is unavailable for this token.",
			save: "Save",
			check: "Check connection",
			checking: "Checking…",
			status: "Connection status",
			error: "Could not save or check the Cognee connection.",
			"status.not-configured": "Endpoint is not configured",
			"status.disabled": "Disabled",
			"status.authorization-required": "Authorization required",
			"status.connection-failed": "Connection failed",
			"status.incompatible-tools": "Cognee tools are incompatible",
			"status.ready": "Connected; required tools are available",
			connectionSettings: "Connection settings",
			chromeTitle: "Chrome MCP",
			chromeEndpoint: "Chrome MCP endpoint",
			chromeEndpointHint: "Use HTTPS; HTTP is allowed only for localhost or loopback addresses.",
			chromeEnabled: "Enable Chrome browser tools",
			"chromeError.save": "Could not save the Chrome MCP settings. Check that settings are writable and try again.",
			"chromeError.credential": "Could not access the Chrome MCP credential store.",
			"chromeError.check": "Could not check the Chrome MCP connection. Verify the endpoint and try again.",
			"chromeStatus.not-configured": "Endpoint is not configured",
			"chromeStatus.disabled": "Disabled",
			"chromeStatus.authorization-required": "Authorization required",
			"chromeStatus.connection-failed": "Connection failed",
			"chromeStatus.timed-out": "Connection check timed out",
			"chromeStatus.ready": "Connected; tools are available",
			"chromeStatus.readyCount": "Connected; {count} tools available",
			appearanceTitle: "MCP card appearance",
			serverName: "Server name",
			serverNameHint: "Use the stable serverName from its MCP client entry.",
			displayName: "Display name",
			description: "Description",
			icon: "Icon",
			showConnectionStatus: "Show connection status",
			showToolCount: "Show tool count",
			showTransport: "Show transport",
			showSource: "Show source",
			saveAppearance: "Save appearance",
			resetAppearance: "Restore defaults",
			invalidServerName: "Enter a valid MCP server name.",
			serverCards: "Configured MCP servers",
			noServers: "No MCP servers are configured.",
			statusUnavailable: "Live MCP status is unavailable.",
			connectionState: "Connection",
			toolCount: "Tools",
			transport: "Transport",
			source: "Source",
			"connection.connecting": "Connecting",
			"connection.connected": "Connected",
			"connection.reconnecting": "Reconnecting",
			"connection.disconnected": "Disconnected",
			"transport.stdio": "Local process",
			"transport.streamable-http": "Streamable HTTP",
			"managed.title": "MCP servers",
			"managed.description": "Configure server connections, purpose, credentials, and live status in one list.",
			"managed.add": "Add server",
			"managed.empty": "No MCP servers are configured.",
			"managed.enabled": "Enabled",
			"managed.edit": "Edit",
			"managed.delete": "Delete",
			"managed.editor": "Server settings",
			"managed.purpose": "Purpose",
			"managed.purpose.model-tools": "Tools for the model",
			"managed.purpose.project-memory": "Internal project memory",
			"managed.endpoint": "MCP endpoint",
			"managed.command": "Executable",
			"managed.args": "Arguments (one per line)",
			"managed.cwd": "Working directory",
			"managed.headers": "HTTP headers",
			"managed.credentials": "Credential references",
			"managed.environment": "Secret environment variables",
			"managed.headerName": "Header name",
			"managed.headerValue": "Header value",
			"managed.addHeader": "Add header",
			"managed.removeHeader": "Remove header",
			"managed.envName": "Environment variable",
			"managed.credentialRef": "Credential reference",
			"managed.secret": "Secret value",
			"managed.addSecret": "Add secret mapping",
			"managed.removeSecret": "Remove",
			"managed.checkReady": "Connected; {count} tools found",
			"managed.check.authorization-required": "Authorization required",
			"managed.check.connection-failed": "Connection failed",
			"managed.check.timed-out": "Connection check timed out",
			"managed.check.ready": "Connected",
			"managed.state.disabled": "Disabled",
			"managed.state.connecting": "Connecting",
			"managed.state.connected": "Connected",
			"managed.state.reconnecting": "Reconnecting",
			"managed.state.disconnected": "Disconnected",
			"managed.error.save": "Could not save the server settings.",
			"managed.error.credential": "Could not store a credential.",
			"managed.error.check": "Could not check this MCP server.",
			"managed.error.invalid": "Complete the required fields and use unique names."
		};
		/** Simplified Chinese strings for Cognee and MCP card settings. */
		const zh = {
			title: "MCP",
			pageTitle: "MCP 设置",
			pageDescription: "在一个托管列表中配置所有 MCP 服务器。",
			cogneeDescription: "配置 Cognee MCP 连接与项目记忆。",
			chromeDescription: "通过 MCP 连接 Chrome 浏览器工具。",
			endpoint: "Cognee MCP 地址",
			endpointHint: "请使用 HTTPS；HTTP 仅允许本机回环地址。",
			enabled: "启用 Cognee 项目记忆",
			token: "Bearer 令牌",
			tokenSet: "已配置令牌",
			tokenUnset: "尚未配置令牌",
			credentialsUnavailable: "当前无法使用凭据存储来保存此令牌。",
			save: "保存",
			check: "检查连接",
			checking: "正在检查…",
			status: "连接状态",
			error: "无法保存或检查 Cognee 连接。",
			"status.not-configured": "尚未配置地址",
			"status.disabled": "已停用",
			"status.authorization-required": "需要授权",
			"status.connection-failed": "连接失败",
			"status.incompatible-tools": "Cognee 工具不兼容",
			"status.ready": "已连接，所需工具可用",
			connectionSettings: "连接设置",
			chromeTitle: "Chrome MCP",
			chromeEndpoint: "Chrome MCP 地址",
			chromeEndpointHint: "请使用 HTTPS；HTTP 仅允许 localhost 或本机回环地址。",
			chromeEnabled: "启用 Chrome 浏览器工具",
			"chromeError.save": "无法保存 Chrome MCP 设置，请确认设置可写后重试。",
			"chromeError.credential": "无法访问 Chrome MCP 凭据存储。",
			"chromeError.check": "无法检查 Chrome MCP 连接，请确认地址后重试。",
			"chromeStatus.not-configured": "尚未配置地址",
			"chromeStatus.disabled": "已停用",
			"chromeStatus.authorization-required": "需要授权",
			"chromeStatus.connection-failed": "连接失败",
			"chromeStatus.timed-out": "连接检查超时",
			"chromeStatus.ready": "已连接，工具可用",
			"chromeStatus.readyCount": "已连接，工具数量：{count}",
			appearanceTitle: "MCP 卡片外观",
			serverName: "服务名称",
			serverNameHint: "填写 MCP 客户端配置中的稳定 serverName。",
			displayName: "显示名",
			description: "描述",
			icon: "图标",
			showConnectionStatus: "显示连接状态",
			showToolCount: "显示工具数量",
			showTransport: "显示传输方式",
			showSource: "显示来源",
			saveAppearance: "保存外观",
			resetAppearance: "恢复默认",
			invalidServerName: "请输入有效的 MCP 服务名称。",
			serverCards: "已配置的 MCP 服务",
			noServers: "尚未配置 MCP 服务。",
			statusUnavailable: "暂时无法读取 MCP 实时状态。",
			connectionState: "连接状态",
			toolCount: "工具数量",
			transport: "传输方式",
			source: "来源",
			"connection.connecting": "连接中",
			"connection.connected": "已连接",
			"connection.reconnecting": "重连中",
			"connection.disconnected": "已断开",
			"transport.stdio": "本地进程",
			"transport.streamable-http": "Streamable HTTP",
			"managed.title": "MCP 服务器",
			"managed.description": "在同一列表中配置服务器连接、用途、凭据和实时状态。",
			"managed.add": "添加服务器",
			"managed.empty": "尚未配置 MCP 服务器。",
			"managed.enabled": "启用",
			"managed.edit": "编辑",
			"managed.delete": "删除",
			"managed.editor": "服务设置",
			"managed.purpose": "用途",
			"managed.purpose.model-tools": "向模型提供工具",
			"managed.purpose.project-memory": "内部项目记忆",
			"managed.endpoint": "MCP 地址",
			"managed.command": "可执行文件",
			"managed.args": "参数（每行一个）",
			"managed.cwd": "工作目录",
			"managed.headers": "HTTP 请求头",
			"managed.credentials": "凭据引用",
			"managed.environment": "秘密环境变量",
			"managed.headerName": "请求头名称",
			"managed.headerValue": "请求头值",
			"managed.addHeader": "添加请求头",
			"managed.removeHeader": "移除请求头",
			"managed.envName": "环境变量名称",
			"managed.credentialRef": "凭据引用",
			"managed.secret": "秘密值",
			"managed.addSecret": "添加秘密映射",
			"managed.removeSecret": "移除",
			"managed.checkReady": "已连接，发现 {count} 个工具",
			"managed.check.authorization-required": "需要授权",
			"managed.check.connection-failed": "连接失败",
			"managed.check.timed-out": "连接检查超时",
			"managed.check.ready": "已连接",
			"managed.state.disabled": "已停用",
			"managed.state.connecting": "连接中",
			"managed.state.connected": "已连接",
			"managed.state.reconnecting": "重连中",
			"managed.state.disconnected": "已断开",
			"managed.error.save": "无法保存 MCP 服务设置。",
			"managed.error.credential": "无法保存凭据。",
			"managed.error.check": "无法检查 MCP 服务连接。",
			"managed.error.invalid": "请填写必填项，并确保名称唯一。"
		};
		//#endregion
		//#region lib/types/client/index.js
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.credentials",
			"remote.mcpClientStatus",
			"remote.mcpServerManager",
			"configForms"
		];
		const NS = "settings.mcp";
		/** Register MCP settings while at least one managed MCP setting is available. */
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				en,
				zh
			}), "ui-settings-mcp: dictionaries");
			ctx.effect(() => ctx.configForms.whileServed(["mcp-server-manager"], () => {
				let active = true;
				let stopSection;
				const cognee = ctx.configForms.get("cognee-memory");
				const chrome = ctx.configForms.get("mcp-chrome");
				const managed = ctx.configForms.get("mcp-server-manager");
				runLegacyMcpMigration(cognee, chrome, managed).catch(() => void 0).finally(() => {
					if (!active) return;
					stopSection = ctx.slots.inject("settings.section", () => ctx.slots.register({
						name: "settings.section",
						id: "mcp",
						order: 14,
						label: () => t("title"),
						locale: NS,
						inject: () => ({
							managedForm: managed,
							remote: ctx.remote
						})
					}, McpConnectionsPage));
				});
				return () => {
					active = false;
					stopSection?.();
				};
			}), "ui-settings-mcp: connection settings section");
			const appearanceInjected = () => ({
				form: ctx.configForms.get("mcp-card-presentation"),
				remote: ctx.remote
			});
			ctx.effect(() => ctx.configForms.whileServed(["mcp-card-presentation"], () => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "mcp-card-appearance",
				order: 14.1,
				label: () => t("appearanceTitle"),
				locale: NS,
				inject: appearanceInjected
			}, McpCardSettings))), "ui-settings-mcp: MCP card appearance section");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map