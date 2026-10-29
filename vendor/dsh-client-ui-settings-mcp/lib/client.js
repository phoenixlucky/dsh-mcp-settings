window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-mcp",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/mcpCardAppearance.ts
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
		//#region \0dsh-css:E:\home\dsh-mcp\vendor\dsh-client-ui-settings-mcp\src\client\mcp-settings.module.css.mjs
		const css = ".oetn4G_connections{--mcp-space-1:4px;--mcp-space-2:8px;--mcp-space-3:12px;--mcp-space-4:16px;--mcp-space-5:20px;--dsw-alias-button-primary-fill:var(--dsw-static-amber-600);--mcp-card-fill:color-mix(in srgb, var(--dsw-static-amber-100) 28%, var(--dsw-alias-settings-card-fill));--mcp-field-fill:color-mix(in srgb, var(--dsw-static-amber-100) 48%, var(--dsw-alias-bg-layer-1));--mcp-card-stroke:color-mix(in srgb, var(--dsw-static-amber-600) 18%, var(--dsw-alias-settings-card-stroke));gap:var(--mcp-space-5);grid-template-columns:minmax(0,1fr);width:100%;max-width:none;margin-inline:auto;display:grid}.oetn4G_pageHeader{align-items:center;gap:var(--mcp-space-3);min-width:0;padding:0 var(--mcp-space-1) var(--mcp-space-2);display:flex}.oetn4G_pageIcon{border-radius:var(--dsw-radius-xl);background:var(--mcp-field-fill);width:3.5rem;height:3.5rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.oetn4G_pageCopy{gap:var(--mcp-space-1);min-width:0;display:grid}.oetn4G_pageTitle{color:var(--dsw-alias-label-primary);font:500 28px/36px var(--dsw-font-family);margin:0}.oetn4G_pageDescription{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);margin:0}.oetn4G_card{align-content:start;gap:var(--mcp-space-3);width:100%;min-width:0;padding:var(--mcp-space-4);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--mcp-card-fill);color:var(--dsw-alias-label-primary);box-shadow:none;display:grid;container-type:inline-size}.oetn4G_cardHeader{justify-content:space-between;align-items:center;gap:var(--mcp-space-4);min-height:3.5rem;padding-inline:var(--mcp-space-1);display:flex}.oetn4G_cardIdentity{align-items:center;gap:var(--mcp-space-3);min-width:0;display:flex}.oetn4G_cardIcon{border-radius:var(--dsw-radius-lg);background:var(--mcp-field-fill);width:3rem;height:3rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.oetn4G_cardCopy{gap:var(--mcp-space-1);min-width:0;display:grid}.oetn4G_cardTitle{min-width:0;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xl-24);margin:0}.oetn4G_card>h3{padding:0 var(--mcp-space-1) var(--mcp-space-3);border-bottom:.5px solid var(--mcp-card-stroke);color:var(--dsw-alias-label-primary);font:var(--dsw-font-l-20);margin:0}.oetn4G_cardDescription{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);margin:0}.oetn4G_enableControl{align-items:center;gap:var(--mcp-space-3);flex:none;padding:0;display:flex}.oetn4G_enableLabel{max-width:14rem;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);text-align:right}.oetn4G_fieldGroup{gap:var(--mcp-space-4);min-width:0;padding:var(--mcp-space-4);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--mcp-field-fill);display:grid}.oetn4G_fieldGroupTitle{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.oetn4G_field{gap:var(--mcp-space-2);color:var(--dsw-alias-label-primary);font:var(--dsw-font-base-strong-16);display:grid}.oetn4G_field input,.oetn4G_field textarea,.oetn4G_field select{box-sizing:border-box;width:100%;min-width:0;min-height:2.5rem;padding:var(--mcp-space-2) var(--mcp-space-3);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-md);background:var(--mcp-field-fill);color:var(--dsw-alias-label-primary);font:inherit}.oetn4G_field textarea:focus-visible,.oetn4G_field select:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.oetn4G_field textarea:disabled,.oetn4G_field select:disabled{opacity:.6}.oetn4G_field input:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.oetn4G_field input:disabled{opacity:.6}.oetn4G_field small{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16)}.oetn4G_cardFooter{align-items:center;gap:var(--mcp-space-4);padding:var(--mcp-space-3) var(--mcp-space-1) 0;border-top:.5px dashed var(--mcp-card-stroke);grid-template-columns:minmax(0,1fr) auto;display:grid}.oetn4G_status{align-items:center;gap:var(--mcp-space-2) var(--mcp-space-3);min-width:0;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);flex-wrap:wrap;margin:0;display:flex}.oetn4G_status strong{width:fit-content;padding:var(--mcp-space-1) var(--mcp-space-3);corner-shape:round;background:var(--mcp-field-fill);color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-strong-14);border-radius:999px}.oetn4G_status strong[data-state=ready]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-success-primary)}.oetn4G_error{color:var(--dsw-alias-state-error-primary);grid-column:1/-1;margin:0}.oetn4G_actions{justify-content:flex-end;gap:var(--mcp-space-2);flex-wrap:wrap;display:flex}.oetn4G_serverList{gap:var(--mcp-space-3);min-width:0;display:grid}.oetn4G_serverList h4{color:var(--dsw-alias-label-primary);margin:0}.oetn4G_serverCard{align-items:center;gap:var(--mcp-space-4);padding:var(--mcp-space-4);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--mcp-field-fill);color:var(--dsw-alias-label-secondary);grid-template-columns:minmax(0,1fr) auto auto;display:grid}.oetn4G_serverCard strong{color:var(--dsw-alias-label-primary)}.oetn4G_serverCard p{margin:0}.oetn4G_serverCard>p{padding-inline:var(--mcp-space-4);border-inline:.5px solid var(--mcp-card-stroke);color:var(--dsw-alias-label-primary);white-space:nowrap}.oetn4G_serverHeading{justify-content:space-between;align-items:center;gap:var(--mcp-space-3);display:flex}.oetn4G_serverIdentity{align-items:center;gap:var(--mcp-space-3);min-width:0;display:flex}.oetn4G_serverIcon{border-radius:var(--dsw-radius-lg);background:var(--mcp-field-fill);width:2.75rem;height:2.75rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.oetn4G_serverState{width:fit-content;padding:2px var(--mcp-space-2);background:var(--mcp-field-fill);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);border-radius:999px;align-items:center;display:inline-flex}.oetn4G_serverState[data-state=connected]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-success-primary)}.oetn4G_serverCardEditing{grid-template-columns:minmax(0,1fr)}.oetn4G_serverCardEditing>p{white-space:normal;border:0;padding:0}.oetn4G_serverCardEditing>.oetn4G_actions,.oetn4G_serverCardEditing>section{grid-column:1/-1}.oetn4G_secretRow{align-items:end;gap:var(--mcp-space-3);grid-template-columns:repeat(3,minmax(0,1fr)) auto;display:grid}@container (width<=48rem){.oetn4G_serverCard:not(.oetn4G_serverCardEditing){align-items:center;column-gap:var(--mcp-space-4);row-gap:var(--mcp-space-4);grid-template-columns:minmax(0,1fr) auto}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>.oetn4G_serverHeading{grid-column:1/-1}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>p{white-space:normal;border:0;padding:0}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>.oetn4G_actions{justify-content:flex-end;gap:var(--mcp-space-3)}}@container (width<=40rem){.oetn4G_cardHeader{flex-wrap:wrap;align-items:flex-start}.oetn4G_cardIdentity{flex:100%}.oetn4G_enableControl{flex:auto;justify-content:space-between;max-width:100%}.oetn4G_serverCard:not(.oetn4G_serverCardEditing){grid-template-columns:minmax(0,1fr);align-items:start}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>p{white-space:normal;border:0;padding:0}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>.oetn4G_actions{justify-content:flex-start}}@container (width>=38rem){.oetn4G_field{align-items:center;column-gap:var(--mcp-space-4);grid-template-columns:minmax(9rem,12rem) minmax(0,1fr)}.oetn4G_field small{grid-column:2}.oetn4G_secretRow .oetn4G_field{grid-template-columns:minmax(0,1fr)}.oetn4G_secretRow .oetn4G_field small{grid-column:1}}@container (width<=32rem){.oetn4G_card{padding:var(--mcp-space-3)}.oetn4G_field{grid-template-columns:minmax(0,1fr)}.oetn4G_field small{grid-column:1}.oetn4G_cardFooter{grid-template-columns:minmax(0,1fr)}.oetn4G_actions{justify-content:flex-start}.oetn4G_secretRow{grid-template-columns:minmax(0,1fr)}.oetn4G_serverHeading{flex-wrap:wrap;align-items:flex-start}.oetn4G_serverCard>.oetn4G_actions{justify-content:flex-start}.oetn4G_serverCard{grid-template-columns:minmax(0,1fr);align-items:start}.oetn4G_serverCard>p{white-space:normal;border:0;padding:0}}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-mcp/mcp-settings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-mcp";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var mcp_settings_module_css_default = {
			"actions": "oetn4G_actions",
			"card": "oetn4G_card",
			"cardCopy": "oetn4G_cardCopy",
			"cardDescription": "oetn4G_cardDescription",
			"cardFooter": "oetn4G_cardFooter",
			"cardHeader": "oetn4G_cardHeader",
			"cardIcon": "oetn4G_cardIcon",
			"cardIdentity": "oetn4G_cardIdentity",
			"cardTitle": "oetn4G_cardTitle",
			"connections": "oetn4G_connections",
			"enableControl": "oetn4G_enableControl",
			"enableLabel": "oetn4G_enableLabel",
			"error": "oetn4G_error",
			"field": "oetn4G_field",
			"fieldGroup": "oetn4G_fieldGroup",
			"fieldGroupTitle": "oetn4G_fieldGroupTitle",
			"pageCopy": "oetn4G_pageCopy",
			"pageDescription": "oetn4G_pageDescription",
			"pageHeader": "oetn4G_pageHeader",
			"pageIcon": "oetn4G_pageIcon",
			"pageTitle": "oetn4G_pageTitle",
			"secretRow": "oetn4G_secretRow",
			"serverCard": "oetn4G_serverCard",
			"serverCardEditing": "oetn4G_serverCardEditing",
			"serverHeading": "oetn4G_serverHeading",
			"serverIcon": "oetn4G_serverIcon",
			"serverIdentity": "oetn4G_serverIdentity",
			"serverList": "oetn4G_serverList",
			"serverState": "oetn4G_serverState",
			"status": "oetn4G_status"
		};
		//#endregion
		//#region src/client/McpCardSettings.tsx
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
			const field = (key, label) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: mcp_settings_module_css_default.field,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
			const flag = (key, label) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: mcp_settings_module_css_default.switchRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.card,
				"aria-label": t("appearanceTitle"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("appearanceTitle") }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.serverList,
						"aria-label": t("serverCards"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: t("serverCards") }),
							servers.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: "status",
								children: t(statusAvailable ? "noServers" : "statusUnavailable")
							}),
							servers.map((server) => {
								const appearance = saved[server.serverName] ?? {};
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: mcp_settings_module_css_default.serverCard,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [appearance.icon && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											"aria-hidden": "true",
											children: [appearance.icon, " "]
										}), appearance.displayName || server.serverName] }),
										appearance.description && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: appearance.description }),
										appearance.showConnectionStatus !== false && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											t("connectionState"),
											": ",
											t(`connection.${server.state}`)
										] }),
										appearance.showToolCount !== false && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											t("toolCount"),
											": ",
											server.toolCount
										] }),
										appearance.showTransport !== false && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											t("transport"),
											": ",
											t(`transport.${server.transport}`)
										] }),
										appearance.showSource !== false && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											t("source"),
											": ",
											server.source
										] })
									]
								}, server.id);
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("serverName") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: serverName,
								disabled: !state.writable,
								onChange: (event) => {
									setServerName(event.currentTarget.value);
									load(event.currentTarget.value);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("serverNameHint") })
						]
					}),
					field("displayName", t("displayName")),
					field("description", t("description")),
					field("icon", t("icon")),
					flag("showConnectionStatus", t("showConnectionStatus")),
					flag("showToolCount", t("showToolCount")),
					flag("showTransport", t("showTransport")),
					flag("showSource", t("showSource")),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.actions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: !state.writable,
							onClick: () => {
								save();
							},
							children: t("saveAppearance")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: !state.writable,
							onClick: () => {
								reset();
							},
							children: t("resetAppearance")
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: t("invalidServerName")
					})
				]
			});
		}
		//#endregion
		//#region src/client/ChromeCard.tsx
		const CREDENTIAL$1 = "DSH_CHROME_MCP_TOKEN";
		/** Configure the managed Chrome MCP endpoint and its separately stored token. */
		function ChromeCard({ form, remote, t }) {
			const snapshot = form.getSnapshot();
			const [enabled, setEnabled] = (0, react.useState)(snapshot.value?.enabled ?? false);
			const [url, setUrl] = (0, react.useState)(snapshot.value?.url ?? "");
			const [origin, setOrigin] = (0, react.useState)(snapshot.value?.origin ?? "");
			const [token, setToken] = (0, react.useState)("");
			const [tokenConfigured, setTokenConfigured] = (0, react.useState)(false);
			const [tokenWritable, setTokenWritable] = (0, react.useState)(false);
			const [status, setStatus] = (0, react.useState)({ state: "not-configured" });
			const [busy, setBusy] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)();
			(0, react.useEffect)(() => form.subscribe(() => {
				const value = form.getSnapshot().value;
				if (value !== void 0) {
					setEnabled(value.enabled ?? false);
					setUrl(value.url ?? "");
					setOrigin(value.origin ?? "");
				}
			}), [form]);
			(0, react.useEffect)(() => {
				let active = true;
				remote.credentials.describe([CREDENTIAL$1]).then((reply) => {
					const credential = reply.ok ? reply.value[CREDENTIAL$1] : void 0;
					if (active && credential !== void 0) {
						setTokenConfigured(credential.configured);
						setTokenWritable(credential.writable);
					}
				}).catch(() => {
					if (active) setFailure("credential");
				});
				return () => {
					active = false;
				};
			}, [remote]);
			(0, react.useEffect)(() => {
				let active = true;
				remote.chromeMcp.checkChromeConnection().then((reply) => {
					if (active && reply.ok) setStatus(reply.value);
					else if (active) setFailure("check");
				}).catch(() => {
					if (active) setFailure("check");
				});
				return () => {
					active = false;
				};
			}, [remote]);
			const readStatus = async () => {
				try {
					const reply = await remote.chromeMcp.checkChromeConnection();
					if (!reply.ok) {
						setFailure("check");
						return;
					}
					setStatus(reply.value);
				} catch {
					setFailure("check");
				}
			};
			const check = async () => {
				setBusy(true);
				setFailure(void 0);
				try {
					await readStatus();
				} finally {
					setBusy(false);
				}
			};
			const save = async () => {
				setBusy(true);
				setFailure(void 0);
				try {
					if (!await form.mutate([
						{
							op: "set",
							path: ["enabled"],
							value: enabled
						},
						{
							op: "set",
							path: ["url"],
							value: url
						},
						{
							op: "set",
							path: ["origin"],
							value: origin
						}
					])) {
						setFailure("save");
						return;
					}
					if (token !== "") {
						if (!(await remote.credentials.set(CREDENTIAL$1, token)).ok) {
							setFailure("credential");
							return;
						}
						setToken("");
						setTokenConfigured(true);
					}
					await readStatus();
				} catch {
					setFailure("save");
				} finally {
					setBusy(false);
				}
			};
			const tokenLabel = tokenWritable ? tokenConfigured ? "tokenSet" : "tokenUnset" : "credentialsUnavailable";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.card,
				"aria-label": t("chromeTitle"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: mcp_settings_module_css_default.cardHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.cardIdentity,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: mcp_settings_module_css_default.cardIcon,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGlobeOutlineRegular, { size: 24 })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.cardCopy,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									className: mcp_settings_module_css_default.cardTitle,
									children: "Chrome MCP"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: mcp_settings_module_css_default.cardDescription,
									children: t("chromeDescription")
								})]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.enableControl,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: mcp_settings_module_css_default.enableLabel,
								children: t("chromeEnabled")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
								checked: enabled,
								label: t("chromeEnabled"),
								disabled: busy || !form.getSnapshot().writable,
								onChange: setEnabled
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: mcp_settings_module_css_default.fieldGroup,
						"aria-labelledby": "chrome-connection-settings",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
								className: mcp_settings_module_css_default.fieldGroupTitle,
								id: "chrome-connection-settings",
								children: t("connectionSettings")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: mcp_settings_module_css_default.field,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("chromeEndpoint") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "url",
										value: url,
										disabled: busy || !form.getSnapshot().writable,
										onChange: (event) => setUrl(event.currentTarget.value)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("chromeEndpointHint") })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: mcp_settings_module_css_default.field,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("chromeOrigin") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										value: origin,
										disabled: busy || !form.getSnapshot().writable,
										onChange: (event) => setOrigin(event.currentTarget.value)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("chromeOriginHint") })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: mcp_settings_module_css_default.field,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("token") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "password",
										autoComplete: "new-password",
										value: token,
										disabled: busy || !tokenWritable,
										onChange: (event) => setToken(event.currentTarget.value)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t(tokenLabel) })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: mcp_settings_module_css_default.cardFooter,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: mcp_settings_module_css_default.status,
								role: "status",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("status") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									"data-state": status.state,
									children: status.state === "ready" && status.toolCount !== void 0 ? t("chromeStatus.readyCount").replace("{count}", String(status.toolCount)) : t(`chromeStatus.${status.state}`)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.actions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy || !form.getSnapshot().writable,
									onClick: () => {
										save();
									},
									children: t("save")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy,
									onClick: () => {
										check();
									},
									children: busy ? t("checking") : t("check")
								})]
							}),
							failure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.error,
								role: "alert",
								children: t(`chromeError.${failure}`)
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/CogneeCard.tsx
		const CREDENTIAL = "DSH_COGNEE_MCP_TOKEN";
		/** Settings screen for VISION-LIAO's endpoint, separate credential, and readiness. */
		function CogneeCard({ form, remote, t }) {
			const snapshot = form.getSnapshot();
			const [enabled, setEnabled] = (0, react.useState)(snapshot.value?.enabled ?? false);
			const [endpoint, setEndpoint] = (0, react.useState)(snapshot.value?.endpoint ?? "");
			const [token, setToken] = (0, react.useState)("");
			const [tokenConfigured, setTokenConfigured] = (0, react.useState)(false);
			const [tokenWritable, setTokenWritable] = (0, react.useState)(false);
			const [status, setStatus] = (0, react.useState)("not-configured");
			const [busy, setBusy] = (0, react.useState)(false);
			const [failed, setFailed] = (0, react.useState)(false);
			(0, react.useEffect)(() => form.subscribe(() => {
				const value = form.getSnapshot().value;
				if (value !== void 0) {
					setEnabled(value.enabled ?? false);
					setEndpoint(value.endpoint ?? "");
				}
			}), [form]);
			(0, react.useEffect)(() => {
				let active = true;
				remote.credentials.describe([CREDENTIAL]).then((reply) => {
					const credential = reply.ok ? reply.value[CREDENTIAL] : void 0;
					if (active && credential !== void 0) {
						setTokenConfigured(credential.configured);
						setTokenWritable(credential.writable);
					}
				}).catch(() => {
					if (active) setFailed(true);
				});
				return () => {
					active = false;
				};
			}, [remote]);
			const check = async () => {
				setBusy(true);
				setFailed(false);
				try {
					const reply = await remote.cognee.status();
					if (!reply.ok) throw new Error("status unavailable");
					setStatus(reply.value.state);
				} catch {
					setFailed(true);
				} finally {
					setBusy(false);
				}
			};
			const save = async () => {
				setBusy(true);
				setFailed(false);
				try {
					if ((await Promise.all([form.set("enabled", enabled), form.set("endpoint", endpoint)])).some((value) => !value)) throw new Error("settings refused");
					if (token !== "") {
						if (!(await remote.credentials.set(CREDENTIAL, token)).ok) throw new Error("credential refused");
						setToken("");
						setTokenConfigured(true);
					}
					await check();
				} catch {
					setFailed(true);
				} finally {
					setBusy(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.card,
				"aria-label": t("cogneeTitle"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: mcp_settings_module_css_default.cardHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.cardIdentity,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: mcp_settings_module_css_default.cardIcon,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutlineRegular, { size: 24 })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.cardCopy,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									className: mcp_settings_module_css_default.cardTitle,
									children: t("cogneeTitle")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: mcp_settings_module_css_default.cardDescription,
									children: t("cogneeDescription")
								})]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.enableControl,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: mcp_settings_module_css_default.enableLabel,
								children: t("enabled")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
								checked: enabled,
								label: t("enabled"),
								disabled: busy,
								onChange: setEnabled
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: mcp_settings_module_css_default.fieldGroup,
						"aria-labelledby": "vision-liao-connection-settings",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
								className: mcp_settings_module_css_default.fieldGroupTitle,
								id: "vision-liao-connection-settings",
								children: t("connectionSettings")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: mcp_settings_module_css_default.field,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("endpoint") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										value: endpoint,
										disabled: busy,
										onChange: (event) => {
											setEndpoint(event.currentTarget.value);
										}
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("endpointHint") })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: mcp_settings_module_css_default.field,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("token") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "password",
										autoComplete: "new-password",
										value: token,
										disabled: busy || !tokenWritable,
										onChange: (event) => {
											setToken(event.currentTarget.value);
										}
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t(tokenConfigured ? "tokenSet" : "tokenUnset") })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: mcp_settings_module_css_default.cardFooter,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: mcp_settings_module_css_default.status,
								role: "status",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("status") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									"data-state": status,
									children: t(`status.${status}`)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.actions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy || !form.getSnapshot().writable,
									onClick: () => {
										save();
									},
									children: t("save")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy,
									onClick: () => {
										check();
									},
									children: busy ? t("checking") : t("check")
								})]
							}),
							failed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.error,
								role: "alert",
								children: t("error")
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region ../../../deepseek-harness/packages/util/crypto/src/index.ts
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
		//#region src/client/ManagedMcpServers.tsx
		function emptyDraft() {
			return {
				id: randomUUID(),
				serverName: "",
				enabled: true,
				transport: "streamable-http",
				url: "",
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
				transport: server.transport,
				url: server.transport === "streamable-http" ? server.url : "",
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
				let timer;
				const refresh = async () => {
					try {
						const reply = await remote.mcpClientStatus.list();
						if (active && reply.ok) setStatuses(reply.value);
					} catch (error) {
						if (active) setStatuses([]);
					}
					if (active) timer = setTimeout(() => {
						refresh();
					}, 5e3);
				};
				refresh();
				return () => {
					active = false;
					clearTimeout(timer);
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
				for (const row of draft.secrets) {
					const name = row.name.trim();
					const ref = row.ref.trim();
					if (!(draft.transport === "streamable-http" ? /^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) : /^[A-Za-z_][A-Za-z0-9_]*$/u.test(name)) || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref) || Object.hasOwn(refs, name)) {
						setFailure("invalid");
						return;
					}
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
				return draft.transport === "streamable-http" ? {
					id: draft.id,
					serverName,
					enabled: draft.enabled,
					transport: "streamable-http",
					url: draft.url.trim(),
					headerRefs: refs
				} : {
					id: draft.id,
					serverName,
					enabled: draft.enabled,
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
			const editor = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.fieldGroup,
				"aria-label": t("managed.editor"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
						className: mcp_settings_module_css_default.fieldGroupTitle,
						children: t("managed.editor")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("serverName") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							value: draft.serverName,
							disabled: busy,
							onChange: (event) => setDraft({
								...draft,
								serverName: event.currentTarget.value
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("transport") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: draft.transport,
							disabled: busy,
							onChange: (event) => setDraft({
								...draft,
								transport: event.currentTarget.value,
								secrets: []
							}),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "streamable-http",
								children: t("transport.streamable-http")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "stdio",
								children: t("transport.stdio")
							})]
						})]
					}),
					draft.transport === "streamable-http" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: mcp_settings_module_css_default.field,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.endpoint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "url",
								value: draft.url,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									url: event.currentTarget.value
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("endpointHint") })
						]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: mcp_settings_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.command") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: draft.command,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									command: event.currentTarget.value
								})
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: mcp_settings_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.args") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								rows: 3,
								value: draft.args,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									args: event.currentTarget.value
								})
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: mcp_settings_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.cwd") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: draft.cwd,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									cwd: event.currentTarget.value
								})
							})]
						})
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.serverList,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: draft.transport === "streamable-http" ? t("managed.headers") : t("managed.environment") }),
							draft.secrets.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.secretRow,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: draft.transport === "streamable-http" ? t("managed.headerName") : t("managed.envName") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.credentialRef") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.secret") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: mcp_settings_module_css_default.cardFooter,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.actions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy || !snapshot.writable,
									onClick: () => {
										saveDraft();
									},
									children: t("save")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy,
									onClick: () => {
										checkDraft();
									},
									children: busy ? t("checking") : t("check")
								})]
							}),
							checkState !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.status,
								role: "status",
								children: checkState
							}),
							failure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.error,
								role: "alert",
								children: managedFailureLabel(t, failure)
							})
						]
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.card,
				"aria-label": t("managed.title"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: mcp_settings_module_css_default.cardHeader,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.cardIdentity,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: mcp_settings_module_css_default.cardIcon,
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 24 })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.cardCopy,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: mcp_settings_module_css_default.cardTitle,
								children: t("managed.title")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.cardDescription,
								children: t("managed.description")
							})]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: mcp_settings_module_css_default.serverList,
					children: [
						servers.length === 0 && activeEditorId !== draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("managed.empty") }),
						servers.map((server) => {
							const status = statusFor(server);
							const state = !server.enabled ? "disabled" : status?.state ?? "disconnected";
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
								className: `${mcp_settings_module_css_default.serverCard} ${activeEditorId === server.id ? mcp_settings_module_css_default.serverCardEditing : ""}`,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: mcp_settings_module_css_default.serverHeading,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: mcp_settings_module_css_default.serverIdentity,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: mcp_settings_module_css_default.serverIcon,
												"aria-hidden": "true",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 22 })
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: server.serverName }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
												t(server.transport === "stdio" ? "transport.stdio" : "transport.streamable-http"),
												" · ",
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: mcp_settings_module_css_default.serverState,
													"data-state": state,
													children: managedStateLabel(t, state)
												})
											] })] })]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: mcp_settings_module_css_default.enableControl,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: mcp_settings_module_css_default.enableLabel,
												children: t("managed.enabled")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
												checked: server.enabled,
												label: t("managed.enabled"),
												disabled: busy || !snapshot.writable,
												onChange: (value) => {
													toggle(server, value);
												}
											})]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
										t("toolCount"),
										": ",
										status?.toolCount ?? 0
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: mcp_settings_module_css_default.actions,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
						!isEditingExisting && activeEditorId === draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("article", {
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
		//#region src/client/McpConnectionsPage.tsx
		/** Show each managed connection on the shared MCP settings page when served. */
		function McpConnectionsPage({ cogneeForm, chromeForm, managedForm, remote, t }) {
			const cognee = (0, react.useSyncExternalStore)(cogneeForm.subscribe.bind(cogneeForm), cogneeForm.getSnapshot.bind(cogneeForm));
			const chrome = (0, react.useSyncExternalStore)(chromeForm.subscribe.bind(chromeForm), chromeForm.getSnapshot.bind(chromeForm));
			const managed = (0, react.useSyncExternalStore)(managedForm.subscribe.bind(managedForm), managedForm.getSnapshot.bind(managedForm));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: mcp_settings_module_css_default.connections,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: mcp_settings_module_css_default.pageHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: mcp_settings_module_css_default.pageIcon,
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium, { size: 24 })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.pageCopy,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: mcp_settings_module_css_default.pageTitle,
								children: t("pageTitle")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.pageDescription,
								children: t("pageDescription")
							})]
						})]
					}),
					cognee.status === "ready" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CogneeCard, {
						form: cogneeForm,
						remote,
						t
					}),
					chrome.status === "ready" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChromeCard, {
						form: chromeForm,
						remote,
						t
					}),
					managed.status === "ready" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManagedMcpServers, {
						form: managedForm,
						remote,
						t
					})
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** English strings for VISION-LIAO and MCP card settings. */
		const en = {
			title: "MCP",
			pageTitle: "MCP settings",
			pageDescription: "Configure and manage MCP service connections.",
			cogneeTitle: "VISION-LIAO",
			cogneeDescription: "Configure the VISION-LIAO MCP connection and project memory.",
			chromeDescription: "Connect Chrome browser tools through MCP.",
			endpoint: "VISION-LIAO MCP endpoint",
			endpointHint: "Use HTTPS, or HTTP on this computer only.",
			enabled: "Use VISION-LIAO project memory",
			token: "Bearer token",
			tokenSet: "Token is configured",
			tokenUnset: "Token is not configured",
			credentialsUnavailable: "Credential storage is unavailable for this token.",
			save: "Save",
			check: "Check connection",
			checking: "Checking…",
			status: "Connection status",
			error: "Could not save or check the VISION-LIAO connection.",
			"status.not-configured": "Endpoint is not configured",
			"status.disabled": "Disabled",
			"status.authorization-required": "Authorization required",
			"status.connection-failed": "Connection failed",
			"status.incompatible-tools": "VISION-LIAO tools are incompatible",
			"status.ready": "Connected; required tools are available",
			connectionSettings: "Connection settings",
			chromeTitle: "Chrome MCP",
			chromeEndpoint: "Chrome MCP endpoint",
			chromeEndpointHint: "Use HTTPS; HTTP is allowed only for localhost or loopback addresses.",
			chromeOrigin: "Origin request header",
			chromeOriginHint: "Leave blank to derive it from the endpoint; for example, http://127.0.0.1.",
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
			"managed.title": "Managed MCP servers",
			"managed.description": "Manage third-party MCP servers and their connection status.",
			"managed.add": "Add server",
			"managed.empty": "No managed MCP servers are configured.",
			"managed.enabled": "Enabled",
			"managed.edit": "Edit",
			"managed.delete": "Delete",
			"managed.editor": "Server settings",
			"managed.endpoint": "MCP endpoint",
			"managed.command": "Executable",
			"managed.args": "Arguments (one per line)",
			"managed.cwd": "Working directory",
			"managed.headers": "Secret HTTP headers",
			"managed.environment": "Secret environment variables",
			"managed.headerName": "Header name",
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
		/** Simplified Chinese strings for VISION-LIAO and MCP card settings. */
		const zh = {
			title: "MCP",
			pageTitle: "MCP 设置",
			pageDescription: "配置和管理 MCP 服务连接。",
			cogneeTitle: "VISION-LIAO",
			cogneeDescription: "配置 VISION-LIAO MCP 连接与项目记忆。",
			chromeDescription: "通过 MCP 连接 Chrome 浏览器工具。",
			endpoint: "VISION-LIAO MCP 地址",
			endpointHint: "请使用 HTTPS；HTTP 仅允许本机回环地址。",
			enabled: "启用 VISION-LIAO 项目记忆",
			token: "Bearer 令牌",
			tokenSet: "已配置令牌",
			tokenUnset: "尚未配置令牌",
			credentialsUnavailable: "当前无法使用凭据存储来保存此令牌。",
			save: "保存",
			check: "检查连接",
			checking: "正在检查…",
			status: "连接状态",
			error: "无法保存或检查 VISION-LIAO 连接。",
			"status.not-configured": "尚未配置地址",
			"status.disabled": "已停用",
			"status.authorization-required": "需要授权",
			"status.connection-failed": "连接失败",
			"status.incompatible-tools": "VISION-LIAO 工具不兼容",
			"status.ready": "已连接，所需工具可用",
			connectionSettings: "连接设置",
			chromeTitle: "Chrome MCP",
			chromeEndpoint: "Chrome MCP 地址",
			chromeEndpointHint: "请使用 HTTPS；HTTP 仅允许 localhost 或本机回环地址。",
			chromeOrigin: "Origin 请求头",
			chromeOriginHint: "留空时根据地址自动生成；例如 http://127.0.0.1。",
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
			"managed.title": "受管 MCP 服务",
			"managed.description": "管理第三方 MCP 服务及其连接状态。",
			"managed.add": "添加服务",
			"managed.empty": "尚未配置受管 MCP 服务。",
			"managed.enabled": "启用",
			"managed.edit": "编辑",
			"managed.delete": "删除",
			"managed.editor": "服务设置",
			"managed.endpoint": "MCP 地址",
			"managed.command": "可执行文件",
			"managed.args": "参数（每行一个）",
			"managed.cwd": "工作目录",
			"managed.headers": "HTTP 秘密请求头",
			"managed.environment": "秘密环境变量",
			"managed.headerName": "请求头名称",
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
		//#region src/client/index.ts
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.credentials",
			"remote.cognee",
			"remote.chromeMcp",
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
			const connectionsInjected = () => ({
				cogneeForm: ctx.configForms.get("cognee-memory"),
				chromeForm: ctx.configForms.get("mcp-chrome"),
				managedForm: ctx.configForms.get("mcp-server-manager"),
				remote: ctx.remote
			});
			ctx.effect(() => ctx.configForms.whileServed([
				"cognee-memory",
				"mcp-chrome",
				"mcp-server-manager"
			], () => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "mcp",
				order: 14,
				label: () => t("title"),
				locale: NS,
				inject: connectionsInjected
			}, McpConnectionsPage))), "ui-settings-mcp: connection settings section");
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