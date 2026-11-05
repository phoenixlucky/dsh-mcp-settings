window.__ModuleLoader__.load({
	id: "@tinyforge/dsh-mcp-settings",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let zod = require("zod");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region ../../node_modules/.pnpm/@deepseek-ai+dsh-typert-pro_2e073fa9830b436143adccb4bc65f602/node_modules/@deepseek-ai/dsh-typert-protocol/lib/types/remote-info.js
		/** Lazy assembly of generated Remote definitions using caller-supplied Zod; no runtime imports. */
		/**
		* Retain one generated definition per endpoint without constructing parsers or projections.
		* The class instance builds its shared descriptor/method index on first access;
		* input schemas and JSON Schema projections are cached only when requested.
		* @param spec - compiler-produced method facts and Zod factories.
		* @param zod - the generated artifact's Zod runtime for named-input parsers.
		* @returns a lazy, mountable info instance with no registration or transport effects.
		*/
		function createTypertRemoteInfo(spec, zod) {
			return new RemoteInfo(spec, zod);
		}
		var RemoteInfo = class {
			spec;
			zod;
			index;
			constructor(spec, zod) {
				this.spec = spec;
				this.zod = zod;
			}
			get package() {
				return this.spec.package;
			}
			get descriptors() {
				return this.resolve().descriptors;
			}
			get methods() {
				return this.resolve().methods;
			}
			resolve() {
				if (this.index !== void 0) return this.index;
				const zod = this.zod;
				const descriptors = [];
				const methods = Object.create(null);
				for (const [endpoint, definition] of Object.entries(this.spec.methods)) {
					const separator = endpoint.indexOf("/");
					const namespace = endpoint.slice(0, separator);
					const method = endpoint.slice(separator + 1);
					const parameters = definition.parameters.map((parameter) => ({
						...parameter,
						wire: parameter.wire ?? parameter.name
					}));
					const descriptor = {
						...definition,
						id: `${this.spec.package}#${endpoint}`,
						namespace,
						method,
						parameters,
						result: definition.result.description === void 0 ? definition.result : new ResultValue(definition.result)
					};
					if (definition.invocation.kind === "direct") {
						const inputs = [];
						methods[endpoint] = Object.assign(descriptor, {
							input(options) {
								const strict = options?.strict === true;
								return inputs[strict ? 1 : 0] ??= new NamedInput(parameters, strict, zod);
							},
							invoke(remote, input, signal) {
								const named = input;
								const values = parameters.map((parameter) => named[parameter.wire]);
								if (definition.cancellation !== void 0) values.push(signal);
								const receiver = Reflect.get(remote, namespace);
								return Reflect.get(receiver, method).apply(receiver, values);
							}
						});
					}
					descriptors.push(descriptor);
				}
				return this.index = {
					descriptors,
					methods
				};
			}
		};
		function optional(parameter) {
			return parameter.source === "json" && parameter.acceptsUndefined === true;
		}
		var NamedInput = class {
			parameters;
			strict;
			zod;
			schema;
			projection;
			constructor(parameters, strict, zod) {
				this.parameters = parameters;
				this.strict = strict;
				this.zod = zod;
			}
			codec(parameter) {
				return this.strict ? parameter.strictCodec : parameter.codec;
			}
			create = () => this.schema ??= this.zod.strictObject(Object.fromEntries(this.parameters.map((parameter) => {
				const value = this.codec(parameter).create();
				return [parameter.wire, optional(parameter) ? value.optional() : value.nonoptional()];
			})));
			get jsonSchema() {
				return this.project().jsonSchema;
			}
			get jsonSchemaError() {
				return this.project().jsonSchemaError;
			}
			project() {
				if (this.projection !== void 0) return this.projection;
				const unavailable = this.parameters.find((parameter) => this.codec(parameter).jsonSchema === void 0);
				if (unavailable !== void 0) return this.projection = { jsonSchemaError: this.codec(unavailable).jsonSchemaError ?? `No JSON Schema for parameter ${unavailable.wire}` };
				return this.projection = { jsonSchema: {
					type: "object",
					properties: Object.fromEntries(this.parameters.map((parameter) => [parameter.wire, {
						...this.codec(parameter).jsonSchema,
						...parameter.description === void 0 ? {} : { description: parameter.description }
					}])),
					required: this.parameters.filter((parameter) => !optional(parameter)).map((parameter) => parameter.wire),
					additionalProperties: false
				} };
			}
		};
		var ResultValue = class {
			spec;
			projection;
			constructor(spec) {
				this.spec = spec;
			}
			get mode() {
				return this.spec.mode;
			}
			get typeSymbol() {
				return this.spec.typeSymbol;
			}
			get create() {
				return this.spec.create;
			}
			get decode() {
				return this.spec.decode;
			}
			get encode() {
				return this.spec.encode;
			}
			get description() {
				return this.spec.description;
			}
			get jsonSchemaError() {
				return this.spec.jsonSchemaError;
			}
			get jsonSchema() {
				if (this.projection === void 0) {
					const schema = this.spec.jsonSchema;
					this.projection = { value: schema === void 0 ? void 0 : {
						...schema,
						description: this.spec.description
					} };
				}
				return this.projection.value;
			}
		};
		//#endregion
		//#region ../../node_modules/.pnpm/@deepseek-ai+dsh-mcp-client_b8198a624c49e8d3239460efc43ec704/node_modules/@deepseek-ai/dsh-mcp-client/lib/typert.remote-client.js
		let _deepseek_ai_dsh_mcp_client_chromeMcp_checkChromeConnection_result$schema$value;
		const _deepseek_ai_dsh_mcp_client_chromeMcp_checkChromeConnection_result$schema = () => _deepseek_ai_dsh_mcp_client_chromeMcp_checkChromeConnection_result$schema$value ??= zod.z.object({
			"state": zod.z.union([
				zod.z.literal("ready"),
				zod.z.literal("not-configured"),
				zod.z.literal("disabled"),
				zod.z.literal("authorization-required"),
				zod.z.literal("connection-failed"),
				zod.z.literal("timed-out")
			]),
			"toolCount": zod.z.number().optional().describe("Discovered tools when the endpoint is ready.")
		});
		let _deepseek_ai_dsh_mcp_client_mcpClientStatus_list_result$schema$value;
		const _deepseek_ai_dsh_mcp_client_mcpClientStatus_list_result$schema = () => _deepseek_ai_dsh_mcp_client_mcpClientStatus_list_result$schema$value ??= zod.z.array(zod.z.object({
			"id": zod.z.string().readonly(),
			"serverName": zod.z.string().readonly(),
			"transport": zod.z.union([zod.z.literal("streamable-http"), zod.z.literal("stdio")]).readonly(),
			"source": zod.z.string().readonly(),
			"state": zod.z.union([
				zod.z.literal("connecting"),
				zod.z.literal("connected"),
				zod.z.literal("reconnecting"),
				zod.z.literal("disconnected")
			]).readonly(),
			"toolCount": zod.z.number().readonly(),
			"tools": zod.z.array(zod.z.object({
				"name": zod.z.string().readonly(),
				"description": zod.z.string().readonly()
			})).readonly()
		}));
		let _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0$schema$value;
		const _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0$schema = () => _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0$schema$value ??= zod.z.union([zod.z.object({
			"id": zod.z.string().describe("Stable settings identity."),
			"serverName": zod.z.string().describe("Unique namespace for this server's model-facing tools."),
			"enabled": zod.z.boolean().describe("Whether the server should be connected."),
			"purpose": zod.z.union([zod.z.literal("model-tools"), zod.z.literal("project-memory")]).optional().describe("Consumer that owns this server connection."),
			"transport": zod.z.literal("streamable-http").describe("Selects Streamable HTTP transport."),
			"url": zod.z.string().describe("MCP endpoint."),
			"headers": zod.z.record(zod.z.string(), zod.z.string()).optional().describe("Non-secret request headers. Authentication headers belong in `headerRefs`."),
			"headerRefs": zod.z.record(zod.z.string(), zod.z.string()).describe("Header names mapped to credential references.")
		}), zod.z.object({
			"id": zod.z.string().describe("Stable settings identity."),
			"serverName": zod.z.string().describe("Unique namespace for this server's model-facing tools."),
			"enabled": zod.z.boolean().describe("Whether the server should be connected."),
			"purpose": zod.z.union([zod.z.literal("model-tools"), zod.z.literal("project-memory")]).optional().describe("Consumer that owns this server connection."),
			"transport": zod.z.literal("stdio").describe("Selects stdio transport."),
			"command": zod.z.string().describe("Executable started directly."),
			"args": zod.z.array(zod.z.string()).describe("Arguments passed directly."),
			"cwd": zod.z.string().describe("Child working directory."),
			"envRefs": zod.z.record(zod.z.string(), zod.z.string()).describe("Environment names mapped to credential references.")
		})]);
		let _deepseek_ai_dsh_mcp_client_mcpServerManager_check_result$schema$value;
		const _deepseek_ai_dsh_mcp_client_mcpServerManager_check_result$schema = () => _deepseek_ai_dsh_mcp_client_mcpServerManager_check_result$schema$value ??= zod.z.union([
			zod.z.object({ "state": zod.z.literal("invalid") }),
			zod.z.object({ "state": zod.z.literal("authorization-required") }),
			zod.z.object({ "state": zod.z.literal("connection-failed") }),
			zod.z.object({ "state": zod.z.literal("timed-out") }),
			zod.z.object({
				"state": zod.z.literal("ready"),
				"toolCount": zod.z.number(),
				"tools": zod.z.array(zod.z.object({
					"name": zod.z.string(),
					"description": zod.z.string()
				})).optional()
			})
		]);
		let _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0_strict$schema$value;
		const _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0_strict$schema = () => _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0_strict$schema$value ??= zod.z.union([zod.z.strictObject({
			"id": zod.z.string().describe("Stable settings identity."),
			"serverName": zod.z.string().describe("Unique namespace for this server's model-facing tools."),
			"enabled": zod.z.boolean().describe("Whether the server should be connected."),
			"purpose": zod.z.union([zod.z.literal("model-tools"), zod.z.literal("project-memory")]).optional().describe("Consumer that owns this server connection."),
			"transport": zod.z.literal("streamable-http").describe("Selects Streamable HTTP transport."),
			"url": zod.z.string().describe("MCP endpoint."),
			"headers": zod.z.record(zod.z.string(), zod.z.string()).optional().describe("Non-secret request headers. Authentication headers belong in `headerRefs`."),
			"headerRefs": zod.z.record(zod.z.string(), zod.z.string()).describe("Header names mapped to credential references.")
		}), zod.z.strictObject({
			"id": zod.z.string().describe("Stable settings identity."),
			"serverName": zod.z.string().describe("Unique namespace for this server's model-facing tools."),
			"enabled": zod.z.boolean().describe("Whether the server should be connected."),
			"purpose": zod.z.union([zod.z.literal("model-tools"), zod.z.literal("project-memory")]).optional().describe("Consumer that owns this server connection."),
			"transport": zod.z.literal("stdio").describe("Selects stdio transport."),
			"command": zod.z.string().describe("Executable started directly."),
			"args": zod.z.array(zod.z.string()).describe("Arguments passed directly."),
			"cwd": zod.z.string().describe("Child working directory."),
			"envRefs": zod.z.record(zod.z.string(), zod.z.string()).describe("Environment names mapped to credential references.")
		})]);
		const TYPERT_REMOTE = createTypertRemoteInfo({
			package: "@deepseek-ai/dsh-mcp-client",
			methods: {
				"chromeMcp/checkChromeConnection": {
					service: "chromeMcp",
					description: "Check endpoint authorization and list tools without running server tools.",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-mcp-client/types#ChromeConnectionCheck",
						create: _deepseek_ai_dsh_mcp_client_chromeMcp_checkChromeConnection_result$schema,
						description: "A client-safe connection state; the response never contains endpoint or credential values.",
						jsonSchema: {
							"type": "object",
							"properties": {
								"state": {
									"type": "string",
									"enum": [
										"ready",
										"not-configured",
										"disabled",
										"authorization-required",
										"connection-failed",
										"timed-out"
									]
								},
								"toolCount": {
									"type": "number",
									"description": "Discovered tools when the endpoint is ready."
								}
							},
							"required": ["state"],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/mcp/mcp-client/src/chrome.ts",
						"line": 84,
						"column": 9
					}
				},
				"mcpClientStatus/list": {
					service: "mcpClientStatus",
					description: "Return live connection summaries with credentials and command arguments omitted.",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-mcp-client#mcpClientStatus/list:result",
						create: _deepseek_ai_dsh_mcp_client_mcpClientStatus_list_result$schema,
						description: "The current server status rows.",
						jsonSchema: {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"id": { "type": "string" },
									"serverName": { "type": "string" },
									"transport": {
										"type": "string",
										"enum": ["streamable-http", "stdio"]
									},
									"source": { "type": "string" },
									"state": {
										"type": "string",
										"enum": [
											"connecting",
											"connected",
											"reconnecting",
											"disconnected"
										]
									},
									"toolCount": { "type": "number" },
									"tools": {
										"type": "array",
										"items": {
											"type": "object",
											"properties": {
												"name": { "type": "string" },
												"description": { "type": "string" }
											},
											"required": ["name", "description"],
											"additionalProperties": true
										}
									}
								},
								"required": [
									"id",
									"serverName",
									"transport",
									"source",
									"state",
									"toolCount",
									"tools"
								],
								"additionalProperties": true
							}
						}
					},
					sourceLocation: {
						"file": "packages/mcp/mcp-client/src/status.ts",
						"line": 25,
						"column": 3
					}
				},
				"mcpServerManager/check": {
					service: "mcpServerManager",
					description: "Check a draft without publishing tools or invoking a server tool.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "server",
						description: "Draft server settings; credential references are resolved for this call only.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-mcp-client/types#ManagedMcpServer",
							create: _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0$schema,
							jsonSchemaError: "typert tool schema: selected dictionaries require string keys and unconstrained JSON values"
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-mcp-client/types#ManagedMcpServer",
							create: _deepseek_ai_dsh_mcp_client_mcpServerManager_check_parameter_0_strict$schema,
							jsonSchemaError: "typert tool schema: selected dictionaries require string keys and unconstrained JSON values"
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-mcp-client/types#ManagedMcpCheck",
						create: _deepseek_ai_dsh_mcp_client_mcpServerManager_check_result$schema,
						description: "A safe result classification and discovered tool count on success.",
						jsonSchema: { "oneOf": [
							{
								"type": "object",
								"properties": { "state": {
									"type": "string",
									"const": "invalid"
								} },
								"required": ["state"],
								"additionalProperties": true
							},
							{
								"type": "object",
								"properties": { "state": {
									"type": "string",
									"const": "authorization-required"
								} },
								"required": ["state"],
								"additionalProperties": true
							},
							{
								"type": "object",
								"properties": { "state": {
									"type": "string",
									"const": "connection-failed"
								} },
								"required": ["state"],
								"additionalProperties": true
							},
							{
								"type": "object",
								"properties": { "state": {
									"type": "string",
									"const": "timed-out"
								} },
								"required": ["state"],
								"additionalProperties": true
							},
							{
								"type": "object",
								"properties": {
									"state": {
										"type": "string",
										"const": "ready"
									},
									"toolCount": { "type": "number" },
									"tools": {
										"type": "array",
										"items": {
											"type": "object",
											"properties": {
												"name": { "type": "string" },
												"description": { "type": "string" }
											},
											"required": ["name", "description"],
											"additionalProperties": true
										}
									}
								},
								"required": ["state", "toolCount"],
								"additionalProperties": true
							}
						] }
					},
					sourceLocation: {
						"file": "packages/mcp/mcp-client/src/managed.ts",
						"line": 122,
						"column": 3
					}
				},
				"mcpServerManager/revealSecret": {
					service: "mcpServerManager",
					description: "Resolve one stored credential reference for the settings UI.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "ref",
						description: "Credential reference stored on one server row.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@tinyforge/dsh-mcp-settings#CredentialRef",
							create: () => zod.z.string()
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "@tinyforge/dsh-mcp-settings#CredentialRef",
							create: () => zod.z.string()
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@tinyforge/dsh-mcp-settings#RevealedSecret",
						create: () => zod.z.object({ value: zod.z.string() }),
						description: "The stored secret value, or an empty string when unset.",
						jsonSchema: {
							"type": "object",
							"properties": { "value": { "type": "string" } },
							"required": ["value"],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/mcp/mcp-client/src/managed.ts",
						"line": 160,
						"column": 3
					}
				}
			}
		}, zod.z);
		//#endregion
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
		const css = ".oetn4G_connections{--mcp-gap:12px;--mcp-gap-sm:8px;width:100%;max-width:60rem;color:var(--dsw-alias-label-primary);grid-template-columns:minmax(0,1fr);gap:16px;margin-inline:auto;display:grid;container-type:inline-size}.oetn4G_actions{justify-content:flex-end;align-items:center;gap:var(--mcp-gap-sm);flex-wrap:wrap;display:flex}.oetn4G_pageHeader{justify-content:space-between;align-items:flex-start;gap:16px;min-width:0;display:flex}.oetn4G_pageCopy{gap:4px;min-width:0;display:grid}.oetn4G_pageTitle{color:var(--dsw-alias-label-primary);font:600 18px/26px var(--dsw-font-family);margin:0}.oetn4G_pageDescription{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-s-14);margin:0}.oetn4G_toolbar{align-items:center;gap:var(--mcp-gap-sm);flex-wrap:wrap;display:flex}.oetn4G_toolbarEnd{align-items:center;gap:var(--mcp-gap-sm);flex-wrap:wrap;margin-inline-start:auto;display:flex}.oetn4G_searchField{flex:14rem;min-width:10rem}.oetn4G_filterField{flex:0 auto;min-width:8.5rem}.oetn4G_srOnly{clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.oetn4G_statusProblem{border:1px solid color-mix(in srgb, var(--dsw-static-amber-600) 26%, var(--dsw-alias-settings-card-stroke));border-radius:var(--dsw-radius-lg);background:color-mix(in srgb, var(--dsw-static-amber-100) 22%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);margin:0;padding:8px 12px}.oetn4G_field{min-width:0;color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-14);gap:6px;display:grid}.oetn4G_field input,.oetn4G_field select,.oetn4G_field textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);width:100%;min-width:0;min-height:2.125rem;color:var(--dsw-alias-label-primary);font:inherit;padding:6px 10px}.oetn4G_field textarea{resize:vertical;line-height:1.5}.oetn4G_field input:focus-visible,.oetn4G_field select:focus-visible,.oetn4G_field textarea:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.oetn4G_field input:disabled,.oetn4G_field select:disabled,.oetn4G_field textarea:disabled{opacity:.6}.oetn4G_field small{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13)}.oetn4G_importPanel{gap:var(--mcp-gap);border:1px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);min-width:0;padding:16px;display:grid}.oetn4G_importPreview{gap:var(--mcp-gap-sm);border:1px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);min-width:0;padding:12px;display:grid}.oetn4G_importPreview h4,.oetn4G_importPreview p{margin:0}.oetn4G_importPreview ul{gap:6px;margin:0;padding-inline-start:1.1rem;display:grid}.oetn4G_importPreview li{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;font:var(--dsw-font-xs-13)}.oetn4G_serverList{gap:var(--mcp-gap-sm);min-width:0;display:grid}.oetn4G_serverList h4{color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-strong-14);margin:0}.oetn4G_serverList>small{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13)}.oetn4G_empty{border:1px dashed var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-s-14);text-align:center;margin:0;padding:20px 16px}.oetn4G_serverCard{border:1px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px 12px;min-width:0;padding:10px 12px;transition:border-color .14s,background-color .14s;display:grid}.oetn4G_serverCard:not(.oetn4G_serverCardEditing):hover{border-color:color-mix(in srgb, var(--dsw-alias-label-primary) 16%, var(--dsw-alias-settings-card-stroke))}.oetn4G_serverMain{align-items:center;gap:10px;min-width:0;display:flex}.oetn4G_stateDot{background:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;width:8px;height:8px}.oetn4G_stateDot[data-state=connected]{background:var(--dsw-alias-state-success-primary)}.oetn4G_stateDot[data-state=connecting],.oetn4G_stateDot[data-state=reconnecting]{background:var(--dsw-static-amber-600)}.oetn4G_stateDot[data-state=disconnected]{background:var(--dsw-alias-state-error-primary)}.oetn4G_stateDot[data-state=disabled]{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 45%, transparent)}.oetn4G_serverIcon{border-radius:var(--dsw-radius-md);background:color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, transparent);width:28px;height:28px;color:var(--dsw-alias-label-secondary);flex:none;place-items:center;display:grid}.oetn4G_serverIdentity{gap:2px;min-width:0;display:grid}.oetn4G_serverNameRow{align-items:center;gap:8px;min-width:0;display:flex}.oetn4G_serverName{color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-strong-14);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.oetn4G_statePill{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 12%, transparent);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);border-radius:999px;flex:none;padding:1px 8px;line-height:1.5}.oetn4G_statePill[data-state=connected]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent);color:var(--dsw-alias-state-success-primary)}.oetn4G_statePill[data-state=connecting],.oetn4G_statePill[data-state=reconnecting]{background:color-mix(in srgb, var(--dsw-static-amber-600) 14%, transparent);color:var(--dsw-static-amber-600)}.oetn4G_statePill[data-state=disconnected]{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);color:var(--dsw-alias-state-error-primary)}.oetn4G_serverMeta{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);margin:0}.oetn4G_separator{padding-inline:4px}.oetn4G_serverActions{flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:4px;display:flex}.oetn4G_toolInventory{border:1px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);grid-column:1/-1;gap:6px;min-width:0;margin-top:4px;padding:10px 12px;display:grid}.oetn4G_toolInventory p{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);margin:0}.oetn4G_toolInventory ul{gap:6px;margin:0;padding-inline-start:1.1rem;display:grid}.oetn4G_toolInventory li{min-width:0;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);overflow-wrap:anywhere}.oetn4G_toolInventory li p{margin-top:2px}.oetn4G_fieldGroup{gap:var(--mcp-gap);border:1px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);grid-column:1/-1;min-width:0;margin-top:8px;padding:14px;display:grid}.oetn4G_fieldGroupTitle{border-bottom:1px solid var(--dsw-alias-settings-card-stroke);color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-strong-14);margin:0;padding-bottom:8px}.oetn4G_formGrid{gap:var(--mcp-gap);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.oetn4G_secretRow{align-items:end;gap:var(--mcp-gap-sm);grid-template-columns:repeat(3,minmax(0,1fr)) auto;display:grid}.oetn4G_secretInput{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px;min-width:0;display:grid}.oetn4G_secretVisibilityButton{padding-inline:6px}.oetn4G_secretMask{letter-spacing:1.5px;color:var(--dsw-alias-label-secondary);user-select:none}.oetn4G_secretVisibilityButton svg{fill:none;stroke:currentColor;stroke-width:1.7px;stroke-linecap:round;stroke-linejoin:round;width:1rem;height:1rem}.oetn4G_cardFooter{align-items:center;gap:var(--mcp-gap);border-top:1px solid var(--dsw-alias-settings-card-stroke);grid-template-columns:minmax(0,1fr) auto;padding-top:10px;display:grid}.oetn4G_status{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);margin:0}.oetn4G_error{color:var(--dsw-alias-state-error-primary);font:var(--dsw-font-xs-13);grid-column:1/-1;margin:0}.oetn4G_exportHint{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);margin:0}.oetn4G_card{gap:var(--mcp-gap);border:1px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);min-width:0;color:var(--dsw-alias-label-primary);padding:16px;display:grid}.oetn4G_switchRow{justify-content:space-between;align-items:center;gap:var(--mcp-gap);color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-14);display:flex}.oetn4G_serverCardEditing{background:var(--dsw-alias-settings-card-fill);border-color:color-mix(in srgb, var(--dsw-alias-label-primary) 18%, var(--dsw-alias-settings-card-stroke));grid-template-columns:minmax(0,1fr)}@container (width<=42rem){.oetn4G_pageHeader{flex-direction:column;align-items:stretch}.oetn4G_pageHeader>.oetn4G_actions{justify-content:flex-start}.oetn4G_formGrid,.oetn4G_secretRow,.oetn4G_cardFooter{grid-template-columns:minmax(0,1fr)}}@container (width<=34rem){.oetn4G_serverCard{grid-template-columns:minmax(0,1fr)}.oetn4G_serverActions{justify-content:flex-start}.oetn4G_toolbarEnd{margin-inline-start:0}}@media (prefers-reduced-motion:reduce){.oetn4G_serverCard{transition:none}}";
		const tagId = "@tinyforge/dsh-mcp-settings/mcp-settings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@tinyforge/dsh-mcp-settings";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var mcp_settings_module_css_default = {
			"actions": "oetn4G_actions",
			"card": "oetn4G_card",
			"cardFooter": "oetn4G_cardFooter",
			"connections": "oetn4G_connections",
			"empty": "oetn4G_empty",
			"error": "oetn4G_error",
			"exportHint": "oetn4G_exportHint",
			"field": "oetn4G_field",
			"fieldGroup": "oetn4G_fieldGroup",
			"fieldGroupTitle": "oetn4G_fieldGroupTitle",
			"filterField": "oetn4G_filterField",
			"formGrid": "oetn4G_formGrid",
			"importPanel": "oetn4G_importPanel",
			"importPreview": "oetn4G_importPreview",
			"pageCopy": "oetn4G_pageCopy",
			"pageDescription": "oetn4G_pageDescription",
			"pageHeader": "oetn4G_pageHeader",
			"pageTitle": "oetn4G_pageTitle",
			"searchField": "oetn4G_searchField",
			"secretInput": "oetn4G_secretInput",
			"secretMask": "oetn4G_secretMask",
			"secretRow": "oetn4G_secretRow",
			"secretVisibilityButton": "oetn4G_secretVisibilityButton",
			"separator": "oetn4G_separator",
			"serverActions": "oetn4G_serverActions",
			"serverCard": "oetn4G_serverCard",
			"serverCardEditing": "oetn4G_serverCardEditing",
			"serverIcon": "oetn4G_serverIcon",
			"serverIdentity": "oetn4G_serverIdentity",
			"serverList": "oetn4G_serverList",
			"serverMain": "oetn4G_serverMain",
			"serverMeta": "oetn4G_serverMeta",
			"serverName": "oetn4G_serverName",
			"serverNameRow": "oetn4G_serverNameRow",
			"srOnly": "oetn4G_srOnly",
			"stateDot": "oetn4G_stateDot",
			"statePill": "oetn4G_statePill",
			"status": "oetn4G_status",
			"statusProblem": "oetn4G_statusProblem",
			"switchRow": "oetn4G_switchRow",
			"toolInventory": "oetn4G_toolInventory",
			"toolbar": "oetn4G_toolbar",
			"toolbarEnd": "oetn4G_toolbarEnd"
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
					id: randomUUID(),
					name,
					ref,
					value: "",
					visible: false
				}))
			};
		}
		/** Read live connection rows from the status Remote this plugin mounted. */
		async function readStatusRows(statusApi) {
			if (statusApi === void 0) return {
				rows: [],
				problem: "status-namespace-unmounted"
			};
			try {
				const reply = await statusApi.list();
				if (reply?.ok === true) return { rows: reply.value ?? [] };
				return {
					rows: [],
					problem: `status-rejected ${reply?.error?.message ?? ""}`.trim()
				};
			} catch (error) {
				return {
					rows: [],
					problem: `status-failed ${error instanceof Error ? error.message : "unknown"}`
				};
			}
		}
		/** Probe each enabled server through the manager's bounded connection check. */
		async function probeServers(managerApi, servers) {
			if (managerApi === void 0) return [];
			const rows = [];
			for (const server of servers) {
				if (!server.enabled) continue;
				try {
					const reply = await managerApi.check(server);
					if (!reply.ok) continue;
					const result = reply.value;
					if (result?.state === "ready") rows.push({
						serverName: server.serverName,
						transport: server.transport,
						state: "connected",
						toolCount: result.toolCount,
						tools: result.tools
					});
				} catch {}
			}
			return rows;
		}
		/** Edit multiple host-managed MCP servers and check their connection state. */
		function ManagedMcpServers({ form, remote, statusApi, managerApi, t }) {
			const snapshot = (0, react.useSyncExternalStore)(form.subscribe.bind(form), form.getSnapshot.bind(form));
			const servers = snapshot.value?.servers ?? [];
			const [statuses, setStatuses] = (0, react.useState)([]);
			const [probed, setProbed] = (0, react.useState)([]);
			const [statusProblem, setStatusProblem] = (0, react.useState)();
			const [draft, setDraft] = (0, react.useState)(emptyDraft);
			const [activeEditorId, setActiveEditorId] = (0, react.useState)();
			const [busy, setBusy] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)();
			const [importFailure, setImportFailure] = (0, react.useState)();
			const [checkState, setCheckState] = (0, react.useState)();
			const [importJson, setImportJson] = (0, react.useState)("");
			const [importState, setImportState] = (0, react.useState)();
			const [importPreview, setImportPreview] = (0, react.useState)();
			const [importOpen, setImportOpen] = (0, react.useState)(false);
			const [searchQuery, setSearchQuery] = (0, react.useState)("");
			const [stateFilter, setStateFilter] = (0, react.useState)("all");
			const [transportFilter, setTransportFilter] = (0, react.useState)("all");
			const [expandedToolIds, setExpandedToolIds] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [toolProbes, setToolProbes] = (0, react.useState)({});
			const statusRequestId = (0, react.useRef)(0);
			const checkSignature = (0, react.useRef)("");
			const draftRef = (0, react.useRef)(draft);
			draftRef.current = draft;
			(0, react.useEffect)(() => {
				let active = true;
				const refresh = async (deep) => {
					const requestId = ++statusRequestId.current;
					const result = await readStatusRows(statusApi);
					if (!active || requestId !== statusRequestId.current) return;
					setStatuses(result.rows);
					setStatusProblem(result.problem !== void 0 && result.rows.length === 0 ? result.problem : void 0);
					if (result.rows.length > 0) {
						setProbed([]);
						return;
					}
					if (!deep) return;
					const measured = await probeServers(managerApi, form.getSnapshot().value?.servers ?? []);
					if (!active || requestId !== statusRequestId.current) return;
					setProbed(measured);
				};
				refresh(true);
				const timer = setInterval(() => {
					refresh(false);
				}, 5e3);
				return () => {
					active = false;
					clearInterval(timer);
				};
			}, [statusApi, managerApi]);
			const refreshStatuses = async (deep = true) => {
				const requestId = ++statusRequestId.current;
				const result = await readStatusRows(statusApi);
				if (requestId !== statusRequestId.current) return;
				setStatuses(result.rows);
				setStatusProblem(result.problem !== void 0 && result.rows.length === 0 ? result.problem : void 0);
				if (result.rows.length > 0) {
					setProbed([]);
					return;
				}
				if (!deep) return;
				const measured = await probeServers(managerApi, form.getSnapshot().value?.servers ?? []);
				if (requestId !== statusRequestId.current) return;
				setProbed(measured);
			};
			const saveServers = async (next) => {
				if (!await form.set("servers", next)) throw new Error("settings refused");
				await refreshStatuses();
			};
			const closeEditor = () => {
				setActiveEditorId(void 0);
				setDraft(emptyDraft());
				setFailure(void 0);
				setCheckState(void 0);
			};
			/** Reveal one secret row: stored values are fetched from the Host, typed values just toggle. */
			const toggleSecret = async (rowId) => {
				const row = draft.secrets.find((item) => item.id === rowId);
				if (row === void 0) return;
				const reveal = (value) => setDraft((current) => ({
					...current,
					secrets: current.secrets.map((item) => item.id === rowId ? {
						...item,
						visible: true,
						...value === void 0 ? {} : { value }
					} : item)
				}));
				if (row.visible) {
					setDraft((current) => ({
						...current,
						secrets: current.secrets.map((item) => item.id === rowId ? {
							...item,
							visible: false
						} : item)
					}));
					return;
				}
				if (row.value !== "" || row.ref.trim() === "" || managerApi?.revealSecret === void 0) {
					reveal();
					return;
				}
				setBusy(true);
				try {
					const reply = await managerApi.revealSecret(row.ref.trim());
					reveal(reply.ok ? reply.value?.value ?? "" : "");
				} catch {
					reveal();
				} finally {
					setBusy(false);
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
				return draft.transport === "streamable-http" ? {
					id: draft.id,
					serverName,
					enabled: draft.enabled,
					purpose: "model-tools",
					transport: "streamable-http",
					url: draft.url.trim(),
					headers,
					headerRefs: refs
				} : {
					id: draft.id,
					serverName,
					enabled: draft.enabled,
					purpose: "model-tools",
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
				if (busy) return;
				const signature = JSON.stringify(draft);
				checkSignature.current = signature;
				setBusy(true);
				setFailure(void 0);
				setCheckState(void 0);
				try {
					if (managerApi === void 0) {
						setFailure("check");
						return;
					}
					const server = await prepareDraft();
					if (server === void 0) return;
					const reply = await managerApi.check(server);
					if (checkSignature.current !== signature || signature !== JSON.stringify(draftRef.current)) return;
					if (!reply.ok || reply.value === void 0) {
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
					if (activeEditorId === id) closeEditor();
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
			const exportServers = () => {
				const exportableServers = servers.map((server) => {
					const common = {
						id: server.id,
						serverName: server.serverName,
						enabled: server.enabled,
						purpose: server.purpose
					};
					if (server.transport === "streamable-http") {
						const headers = Object.fromEntries(Object.entries(server.headers ?? {}).filter(([name]) => !/^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name)));
						return {
							...common,
							transport: server.transport,
							url: server.url,
							...Object.keys(headers).length > 0 ? { headers } : {},
							headerRefs: { ...server.headerRefs }
						};
					}
					return {
						...common,
						transport: server.transport,
						command: server.command,
						args: [...server.args],
						cwd: server.cwd,
						envRefs: { ...server.envRefs }
					};
				});
				const url = URL.createObjectURL(new Blob([JSON.stringify({ servers: exportableServers }, null, 2)], { type: "application/json" }));
				const link = document.createElement("a");
				link.href = url;
				link.download = "mcp-servers.json";
				document.body.append(link);
				link.click();
				link.remove();
				window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
			};
			const previewImport = () => {
				setImportFailure(void 0);
				setImportState(void 0);
				setImportPreview(void 0);
				try {
					const parsed = JSON.parse(importJson);
					if (!isRecord(parsed) || parsed.mcpServers !== void 0 && parsed.servers !== void 0) throw new Error("invalid");
					const existingNames = new Set(servers.map((server) => server.serverName.toLowerCase()));
					const importedNames = /* @__PURE__ */ new Set();
					const candidates = [];
					let skipped = 0;
					const append = (serverName, server, secrets) => {
						if (!/^[A-Za-z0-9_-]{1,32}$/u.test(serverName)) throw new Error("invalid");
						if (existingNames.has(serverName.toLowerCase()) || importedNames.has(serverName.toLowerCase())) {
							skipped++;
							return;
						}
						importedNames.add(serverName.toLowerCase());
						const secretRefs = Object.fromEntries(Object.keys(secrets).map((name) => [name, `MCP_IMPORT_${randomUUID().replaceAll("-", "")}`]));
						candidates.push({
							server,
							secrets,
							secretRefs
						});
					};
					if (isRecord(parsed.mcpServers)) for (const [serverName, raw] of Object.entries(parsed.mcpServers)) {
						if (existingNames.has(serverName.toLowerCase()) || importedNames.has(serverName.toLowerCase())) {
							skipped++;
							continue;
						}
						if (!isRecord(raw) || raw.type !== "streamable-http" || typeof raw.url !== "string" || !isAllowedEndpoint(raw.url) || raw.headers !== void 0 && !isRecord(raw.headers)) throw new Error("invalid");
						const headers = Object.create(null);
						const secrets = Object.create(null);
						const headerNames = /* @__PURE__ */ new Set();
						for (const [name, value] of Object.entries(raw.headers ?? {})) {
							const normalized = name.toLowerCase();
							if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || typeof value !== "string" || /[\r\n]/u.test(value) || headerNames.has(normalized)) throw new Error("invalid");
							headerNames.add(normalized);
							if (/^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name)) secrets[name] = value;
							else headers[name] = value;
						}
						append(serverName, {
							serverName,
							enabled: true,
							purpose: "model-tools",
							transport: "streamable-http",
							url: raw.url,
							headers,
							headerRefs: {}
						}, secrets);
					}
					else if (Array.isArray(parsed.servers)) for (const raw of parsed.servers) {
						if (!isRecord(raw) || typeof raw.serverName !== "string") throw new Error("invalid");
						const serverName = raw.serverName;
						if (existingNames.has(serverName.toLowerCase()) || importedNames.has(serverName.toLowerCase())) {
							skipped++;
							continue;
						}
						if (typeof raw.enabled !== "boolean" || raw.purpose !== void 0 && raw.purpose !== "model-tools" && raw.purpose !== "project-memory") throw new Error("invalid");
						const purpose = raw.purpose ?? "model-tools";
						if (raw.transport === "streamable-http" && typeof raw.url === "string" && isAllowedEndpoint(raw.url) && (raw.headers === void 0 || isRecord(raw.headers)) && (raw.headerRefs === void 0 || isRecord(raw.headerRefs))) {
							const headers = Object.create(null);
							const headerRefs = Object.create(null);
							const secrets = Object.create(null);
							const headerNames = /* @__PURE__ */ new Set();
							for (const [name, value] of Object.entries(raw.headers ?? {})) {
								const normalized = name.toLowerCase();
								if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || typeof value !== "string" || /[\r\n]/u.test(value) || headerNames.has(normalized)) throw new Error("invalid");
								headerNames.add(normalized);
								if (/^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name)) secrets[name] = value;
								else headers[name] = value;
							}
							for (const [name, ref] of Object.entries(raw.headerRefs ?? {})) {
								const normalized = name.toLowerCase();
								if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || typeof ref !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref) || headerNames.has(normalized)) throw new Error("invalid");
								headerNames.add(normalized);
								headerRefs[name] = ref;
							}
							append(serverName, {
								serverName,
								enabled: raw.enabled,
								purpose,
								transport: "streamable-http",
								url: raw.url,
								headers,
								headerRefs
							}, secrets);
						} else if (raw.transport === "stdio" && typeof raw.command === "string" && raw.command.trim() !== "" && Array.isArray(raw.args) && raw.args.every((value) => typeof value === "string") && typeof raw.cwd === "string" && (raw.envRefs === void 0 || isRecord(raw.envRefs))) {
							const envRefs = Object.create(null);
							for (const [name, ref] of Object.entries(raw.envRefs ?? {})) {
								if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(name) || typeof ref !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref)) throw new Error("invalid");
								envRefs[name] = ref;
							}
							append(serverName, {
								serverName,
								enabled: raw.enabled,
								purpose,
								transport: "stdio",
								command: raw.command.trim(),
								args: raw.args,
								cwd: raw.cwd,
								envRefs
							}, {});
						} else throw new Error("invalid");
					}
					else throw new Error("invalid");
					if (candidates.length === 0 && skipped === 0) throw new Error("invalid");
					setImportPreview({
						candidates,
						skipped,
						secretCount: candidates.reduce((count, candidate) => count + Object.keys(candidate.secrets).length, 0),
						revision: snapshot.revision
					});
				} catch {
					setImportState(void 0);
					setImportFailure("import-invalid");
				}
			};
			const confirmImport = async () => {
				if (importPreview === void 0) return;
				const currentSnapshot = form.getSnapshot();
				if (currentSnapshot.revision !== importPreview.revision) {
					setImportPreview(void 0);
					setImportState(t("managed.import.previewStale"));
					return;
				}
				const { candidates, skipped } = importPreview;
				setBusy(true);
				setImportFailure(void 0);
				setImportState(void 0);
				try {
					const next = [];
					for (const candidate of candidates) {
						const server = candidate.server;
						const refs = server.transport === "streamable-http" ? { ...server.headerRefs } : { ...server.envRefs };
						for (const [name, value] of Object.entries(candidate.secrets)) {
							const ref = candidate.secretRefs[name];
							try {
								if (!(await remote.credentials.set(ref, value)).ok) {
									setImportFailure("credential");
									return;
								}
							} catch {
								setImportFailure("credential");
								return;
							}
							refs[name] = ref;
						}
						next.push(server.transport === "streamable-http" ? {
							...server,
							id: randomUUID(),
							headerRefs: refs
						} : {
							...server,
							id: randomUUID(),
							envRefs: refs
						});
					}
					try {
						if (next.length > 0) {
							if (!await form.mutate([{
								op: "set",
								path: ["servers"],
								value: [...currentSnapshot.value?.servers ?? [], ...next]
							}], importPreview.revision)) {
								if (form.getSnapshot().revision !== importPreview.revision) {
									setImportPreview(void 0);
									setImportState(t("managed.import.previewStale"));
								} else setImportFailure("save");
								return;
							}
							await refreshStatuses();
						}
					} catch {
						setImportFailure("save");
						return;
					}
					setImportJson("");
					setImportPreview(void 0);
					setImportOpen(false);
					setImportState(t("managed.import.complete").replace("{imported}", String(next.length)).replace("{skipped}", String(skipped)));
				} catch {
					setImportFailure("save");
				} finally {
					setBusy(false);
				}
			};
			const statusFor = (server) => statuses.find((status) => status.serverName === server.serverName) ?? probed.find((status) => status.serverName === server.serverName);
			/** Read one connected row's tool list on demand when live status carries no inventory. */
			const probeTools = async (server) => {
				if (managerApi === void 0) return;
				if (toolProbes[server.id]?.state === "loading" || toolProbes[server.id]?.state === "ready") return;
				setToolProbes((current) => ({
					...current,
					[server.id]: { state: "loading" }
				}));
				try {
					const reply = await managerApi.check(server);
					const value = reply.ok ? reply.value : void 0;
					setToolProbes((current) => ({
						...current,
						[server.id]: value?.state === "ready" ? {
							state: "ready",
							tools: value.tools,
							toolCount: value.toolCount
						} : { state: "failed" }
					}));
				} catch {
					setToolProbes((current) => ({
						...current,
						[server.id]: { state: "failed" }
					}));
				}
			};
			const stateFor = (server) => {
				if (!server.enabled) return "disabled";
				return statusFor(server)?.state ?? "unknown";
			};
			const query = searchQuery.trim().toLocaleLowerCase();
			const matchingServers = servers.filter((server) => {
				const nameMatches = query === "" || server.serverName.toLocaleLowerCase().includes(query);
				const stateMatches = stateFilter === "all" || stateFor(server) === stateFilter;
				const transportMatches = transportFilter === "all" || server.transport === transportFilter;
				return nameMatches && stateMatches && transportMatches;
			});
			const displayedServers = servers.filter((server) => matchingServers.includes(server) || server.id === activeEditorId);
			const hasFilters = searchQuery !== "" || stateFilter !== "all" || transportFilter !== "all";
			const isEditingExisting = servers.some((server) => server.id === draft.id);
			const connectedCount = servers.filter((server) => stateFor(server) === "connected").length;
			const editor = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: mcp_settings_module_css_default.fieldGroup,
				"aria-label": t("managed.editor"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
						className: mcp_settings_module_css_default.fieldGroupTitle,
						children: t("managed.editor")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.formGrid,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: mcp_settings_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("serverName") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: draft.serverName,
								disabled: busy,
								onChange: (event) => setDraft({
									...draft,
									serverName: event.currentTarget.value
								})
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
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
							draft.transport === "streamable-http" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: t("managed.headers") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("managed.headersHint") }),
								draft.headers.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: mcp_settings_module_css_default.secretRow,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: mcp_settings_module_css_default.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.headerName") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: mcp_settings_module_css_default.field,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.headerValue") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: draft.transport === "streamable-http" ? t("managed.credentials") : t("managed.environment") }),
							draft.transport === "streamable-http" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("managed.credentialsHint") }),
							draft.secrets.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.secretRow,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: draft.transport === "streamable-http" ? t("managed.headerName") : t("managed.envName") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											value: row.name,
											disabled: busy,
											onChange: (event) => setDraft({
												...draft,
												secrets: draft.secrets.map((item) => item.id === row.id ? {
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
												secrets: draft.secrets.map((item) => item.id === row.id ? {
													...item,
													ref: event.currentTarget.value
												} : item)
											})
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: mcp_settings_module_css_default.field,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.secret") }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: mcp_settings_module_css_default.secretInput,
												children: [row.visible ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													type: "text",
													autoComplete: "new-password",
													value: row.value,
													placeholder: t("managed.secret.placeholder"),
													disabled: busy,
													onChange: (event) => setDraft({
														...draft,
														secrets: draft.secrets.map((item) => item.id === row.id ? {
															...item,
															value: event.currentTarget.value
														} : item)
													})
												}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													className: mcp_settings_module_css_default.secretMask,
													type: "text",
													readOnly: true,
													value: "*".repeat(22),
													title: t("managed.secret.hidden"),
													"aria-label": t("managed.secret.hidden"),
													disabled: busy
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "outline",
													size: "sm",
													className: mcp_settings_module_css_default.secretVisibilityButton,
													"aria-label": t(row.visible ? "managed.secret.hide" : "managed.secret.show"),
													"aria-pressed": row.visible,
													disabled: busy,
													onClick: () => {
														toggleSecret(row.id);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
														viewBox: "0 0 24 24",
														"aria-hidden": "true",
														focusable: "false",
														children: row.visible ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 12s3.25-6 9.5-6 9.5 6 9.5 6-3.25 6-9.5 6-9.5-6-9.5-6Z" }),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
																cx: "12",
																cy: "12",
																r: "2.5"
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m4 4 16 16" })
														] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 12s3.25-6 9.5-6 9.5 6 9.5 6-3.25 6-9.5 6-9.5-6-9.5-6Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
															cx: "12",
															cy: "12",
															r: "2.5"
														})] })
													})
												})]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: row.visible ? t("managed.secret.placeholder") : t("managed.secret.hint") })
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										disabled: busy,
										onClick: () => setDraft({
											...draft,
											secrets: draft.secrets.filter((item) => item.id !== row.id)
										}),
										children: t("managed.removeSecret")
									})
								]
							}, row.id)),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: busy,
								onClick: () => setDraft({
									...draft,
									secrets: [...draft.secrets, {
										id: randomUUID(),
										name: "",
										ref: "",
										value: "",
										visible: false
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
				className: mcp_settings_module_css_default.connections,
				"aria-label": t("managed.title"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: mcp_settings_module_css_default.pageHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.pageCopy,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: mcp_settings_module_css_default.pageTitle,
								children: t("managed.title")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.pageDescription,
								children: servers.length === 0 ? t("managed.description") : t("managed.summary").replace("{connected}", String(connectedCount)).replace("{total}", String(servers.length))
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: mcp_settings_module_css_default.actions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: servers.length === 0,
								onClick: exportServers,
								children: t("managed.export")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								disabled: busy || !snapshot.writable,
								"aria-expanded": !isEditingExisting && activeEditorId === draft.id,
								onClick: () => {
									if (!isEditingExisting && activeEditorId === draft.id) closeEditor();
									else {
										const next = emptyDraft();
										setDraft(next);
										setActiveEditorId(next.id);
										setImportOpen(false);
									}
									setFailure(void 0);
									setCheckState(void 0);
								},
								children: t("managed.add")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.toolbar,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: `${mcp_settings_module_css_default.field} ${mcp_settings_module_css_default.searchField}`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: mcp_settings_module_css_default.srOnly,
									children: t("managed.search")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "search",
									value: searchQuery,
									onChange: (event) => setSearchQuery(event.currentTarget.value),
									placeholder: t("managed.search.placeholder")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: `${mcp_settings_module_css_default.field} ${mcp_settings_module_css_default.filterField}`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: mcp_settings_module_css_default.srOnly,
									children: t("managed.filter.state")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: stateFilter,
									onChange: (event) => setStateFilter(event.currentTarget.value),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "all",
											children: t("managed.filter.allStates")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "connected",
											children: t("managed.state.connected")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "connecting",
											children: t("managed.state.connecting")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "reconnecting",
											children: t("managed.state.reconnecting")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "disconnected",
											children: t("managed.state.disconnected")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "unknown",
											children: t("managed.state.unknown")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "disabled",
											children: t("managed.state.disabled")
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: `${mcp_settings_module_css_default.field} ${mcp_settings_module_css_default.filterField}`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: mcp_settings_module_css_default.srOnly,
									children: t("managed.filter.transport")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: transportFilter,
									onChange: (event) => setTransportFilter(event.currentTarget.value),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "all",
											children: t("managed.filter.allTransports")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "streamable-http",
											children: t("transport.streamable-http")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "stdio",
											children: t("transport.stdio")
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: mcp_settings_module_css_default.toolbarEnd,
								children: [
									hasFilters && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "ghost",
										onClick: () => {
											setSearchQuery("");
											setStateFilter("all");
											setTransportFilter("all");
										},
										children: t("managed.filter.clear")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "ghost",
										disabled: busy,
										onClick: () => {
											refreshStatuses();
										},
										children: t("managed.refresh")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										"aria-expanded": importOpen,
										onClick: () => {
											setImportOpen(!importOpen);
											setImportPreview(void 0);
										},
										children: t("managed.import")
									})
								]
							})
						]
					}),
					statusProblem !== void 0 && probed.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: mcp_settings_module_css_default.statusProblem,
						role: "status",
						title: statusProblem,
						children: t("managed.status.unavailable")
					}),
					importOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: mcp_settings_module_css_default.importPanel,
						"aria-label": t("managed.import"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
								className: mcp_settings_module_css_default.fieldGroupTitle,
								children: t("managed.import")
							}),
							importPreview === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: mcp_settings_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: mcp_settings_module_css_default.srOnly,
										children: t("managed.import")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										rows: 6,
										value: importJson,
										disabled: busy,
										onChange: (event) => {
											setImportJson(event.currentTarget.value);
											setImportPreview(void 0);
											setImportState(void 0);
											setImportFailure(void 0);
										},
										placeholder: t("managed.import.placeholder")
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("managed.import.hint") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: mcp_settings_module_css_default.actions,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										disabled: busy || !snapshot.writable || importJson.trim() === "",
										onClick: previewImport,
										children: t("managed.import.previewAction")
									})
								})
							] }),
							importState !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.status,
								role: "status",
								children: importState
							}),
							importFailure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.error,
								role: "alert",
								children: managedFailureLabel(t, importFailure)
							}),
							importPreview !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: mcp_settings_module_css_default.importPreview,
								"aria-label": t("managed.import.previewTitle"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: t("managed.import.previewTitle") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("managed.import.previewSummary").replace("{count}", String(importPreview.candidates.length)).replace("{skipped}", String(importPreview.skipped)) }),
									importPreview.candidates.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: importPreview.candidates.map((candidate) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: candidate.server.serverName }),
										" 璺?",
										t(candidate.server.transport === "stdio" ? "transport.stdio" : "transport.streamable-http"),
										" 璺?",
										t(candidate.server.purpose === "project-memory" ? "managed.purpose.project-memory" : "managed.purpose.model-tools")
									] }, candidate.server.serverName)) }),
									importPreview.secretCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("managed.import.credentialsNotice").replace("{count}", String(importPreview.secretCount)) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: mcp_settings_module_css_default.actions,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											disabled: busy || !snapshot.writable,
											onClick: () => {
												confirmImport();
											},
											children: t("managed.import.confirm")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: busy,
											onClick: () => setImportPreview(void 0),
											children: t("managed.import.cancel")
										})]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: mcp_settings_module_css_default.serverList,
						children: [
							servers.length === 0 && !(activeEditorId === draft.id) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.empty,
								children: t("managed.empty")
							}),
							hasFilters && matchingServers.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.empty,
								role: "status",
								children: t("managed.filter.noResults")
							}),
							displayedServers.map((server) => {
								const status = statusFor(server);
								const state = stateFor(server);
								const toolsExpanded = expandedToolIds.has(server.id);
								const probe = toolProbes[server.id];
								const inventory = (status?.tools !== void 0 && (status.tools.length > 0 || status.toolCount === 0) ? status.tools : void 0) ?? (probe?.state === "ready" ? probe.tools : void 0);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: `${mcp_settings_module_css_default.serverCard} ${activeEditorId === server.id ? mcp_settings_module_css_default.serverCardEditing : ""}`,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: mcp_settings_module_css_default.serverMain,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: mcp_settings_module_css_default.stateDot,
													"data-state": state,
													"aria-hidden": "true"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: mcp_settings_module_css_default.serverIcon,
													"aria-hidden": "true",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 18 })
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: mcp_settings_module_css_default.serverIdentity,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: mcp_settings_module_css_default.serverNameRow,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
															className: mcp_settings_module_css_default.serverName,
															children: server.serverName
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															className: mcp_settings_module_css_default.statePill,
															"data-state": state,
															children: managedStateLabel(t, state)
														})]
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
														className: mcp_settings_module_css_default.serverMeta,
														children: [
															t(server.transport === "stdio" ? "transport.stdio" : "transport.streamable-http"),
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: mcp_settings_module_css_default.separator,
																"aria-hidden": "true",
																children: "·"
															}),
															t("managed.toolCountInline").replace("{count}", String(status?.toolCount ?? 0))
														]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: mcp_settings_module_css_default.serverActions,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "ghost",
													size: "sm",
													disabled: busy || status === void 0 || state !== "connected",
													"aria-expanded": toolsExpanded,
													onClick: () => {
														const next = new Set(expandedToolIds);
														if (next.has(server.id)) next.delete(server.id);
														else {
															next.add(server.id);
															if (inventory === void 0) probeTools(server);
														}
														setExpandedToolIds(next);
													},
													children: t(toolsExpanded ? "managed.tools.hide" : "managed.tools.show")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "outline",
													size: "sm",
													disabled: busy || !snapshot.writable,
													"aria-expanded": activeEditorId === server.id,
													onClick: () => {
														if (activeEditorId === server.id) closeEditor();
														else {
															setDraft(toDraft(server));
															setActiveEditorId(server.id);
														}
														setFailure(void 0);
														setCheckState(void 0);
													},
													children: t("managed.edit")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "ghost",
													size: "sm",
													disabled: busy || !snapshot.writable,
													onClick: () => {
														remove(server.id);
													},
													children: t("managed.delete")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
													checked: server.enabled,
													label: t("managed.enabled"),
													disabled: busy || !snapshot.writable,
													onChange: (value) => {
														toggle(server, value);
													}
												})
											]
										}),
										toolsExpanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
											className: mcp_settings_module_css_default.toolInventory,
											"aria-label": `${server.serverName} ${t("managed.tools.title")}`,
											children: inventory !== void 0 ? inventory.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("managed.tools.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: inventory.map((tool) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: tool.name }), tool.description !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tool.description })] }, tool.name)) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: state !== "connected" ? t("managed.tools.unavailable") : probe?.state === "loading" ? t("managed.tools.loading") : t("managed.tools.unknown") })
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
					}),
					servers.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: mcp_settings_module_css_default.exportHint,
						children: t("managed.export.notice")
					})
				]
			});
		}
		function isAllowedEndpoint(input) {
			try {
				const url = new URL(input);
				const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
				const loopback = hostname === "localhost" || /^127(?:\.\d{1,3}){3}$/u.test(hostname) || hostname === "::1";
				const privateIpv4 = /^10(?:\.\d{1,3}){3}$/u.test(hostname) || /^192\.168(?:\.\d{1,3}){2}$/u.test(hostname) || /^172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}$/u.test(hostname);
				return url.username === "" && url.password === "" && (url.protocol === "https:" || url.protocol === "http:" && (loopback || privateIpv4));
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
				case "unknown": return t("managed.state.unknown");
			}
		}
		function managedCheckLabel(t, result) {
			switch (result.state) {
				case "ready": return t("managed.checkReady").replace("{count}", String(result.toolCount));
				case "invalid": return t("managed.check.invalid");
				case "authorization-required": return `${t("managed.check.authorization-required")} — ${t("managed.check.advice.authorization-required")}`;
				case "connection-failed": return `${t("managed.check.connection-failed")} — ${t("managed.check.advice.connection-failed")}`;
				case "timed-out": return `${t("managed.check.timed-out")} — ${t("managed.check.advice.timed-out")}`;
			}
		}
		function managedFailureLabel(t, failure) {
			switch (failure) {
				case "save": return t("managed.error.save");
				case "credential": return t("managed.error.credential");
				case "check": return t("managed.error.check");
				case "invalid": return t("managed.error.invalid");
				case "import-invalid": return t("managed.import.invalid");
			}
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		//#endregion
		//#region src/client/McpConnectionsPage.tsx
		/** Show each managed connection on the shared MCP settings page when served. */
		function McpConnectionsPage({ managedForm, remote, statusApi, managerApi, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: mcp_settings_module_css_default.connections,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManagedMcpServers, {
					form: managedForm,
					remote,
					statusApi,
					managerApi,
					t
				})
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** English strings for MCP server settings. */
		const en = {
			title: "MCP settings",
			pageTitle: "MCP settings",
			pageDescription: "Configure every MCP server in one managed list.",
			endpointHint: "Use HTTPS, or HTTP on localhost or a private IPv4 address.",
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
			"managed.search": "Search servers",
			"managed.search.placeholder": "Search by server name",
			"managed.filter.state": "Status",
			"managed.filter.allStates": "All statuses",
			"managed.filter.transport": "Transport",
			"managed.filter.allTransports": "All transports",
			"managed.filter.clear": "Clear filters",
			"managed.filter.noResults": "No servers match these filters.",
			"managed.tools.show": "View tools",
			"managed.tools.hide": "Hide tools",
			"managed.tools.title": "Available tools",
			"managed.tools.empty": "No tools are available.",
			"managed.tools.unavailable": "Tool list is unavailable while the server is disconnected.",
			"managed.tools.unknown": "The connection is live, but the tool list could not be read.",
			"managed.tools.loading": "Reading the tool list…",
			"managed.enabled": "Enabled",
			"managed.edit": "Edit",
			"managed.delete": "Delete",
			"managed.editor": "Server settings",
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
			"managed.headersHint": "Example: X-Client-Version → 1.0. Put Authorization and API keys under Credential references below.",
			"managed.credentialsHint": "Example: Header name Authorization · Credential reference MCP_NEW_TOKEN · Secret value Bearer <your token>.",
			"managed.envName": "Environment variable",
			"managed.credentialRef": "Credential reference",
			"managed.secret": "Secret value",
			"managed.addSecret": "Add secret mapping",
			"managed.removeSecret": "Remove",
			check: "Check",
			"managed.checkReady": "Connected; {count} tools found",
			"managed.check.authorization-required": "Authorization required",
			"managed.check.connection-failed": "Connection failed",
			"managed.check.timed-out": "Connection check timed out",
			"managed.check.ready": "Connected",
			"managed.check.invalid": "The server settings are invalid; fix them and check again.",
			"managed.check.advice.authorization-required": "Check the credential reference and secret value.",
			"managed.check.advice.connection-failed": "Check the endpoint or command and confirm the server is available.",
			"managed.check.advice.timed-out": "Check whether the server is responsive, then retry.",
			"managed.state.disabled": "Disabled",
			"managed.state.connecting": "Connecting",
			"managed.state.connected": "Connected",
			"managed.state.reconnecting": "Reconnecting",
			"managed.state.disconnected": "Disconnected",
			"managed.state.unknown": "Status unknown",
			"managed.summary": "{connected} of {total} connected",
			"managed.toolCountInline": "{count} tools",
			"managed.refresh": "Refresh",
			"managed.status.unavailable": "Live connection status is unavailable right now, so the states and tool counts above may be stale.",
			"managed.error.save": "Could not save the server settings.",
			"managed.error.credential": "Could not store a credential.",
			"managed.error.check": "Could not check this MCP server.",
			"managed.error.invalid": "Complete the required fields and use unique names.",
			"managed.import": "Import JSON",
			"managed.import.placeholder": "Paste a configuration containing an mcpServers object.",
			"managed.import.hint": "Imports streamable-http servers. Secret headers are stored in the credential store; existing names are skipped.",
			"managed.import.previewAction": "Preview import",
			"managed.import.previewTitle": "Import preview",
			"managed.import.previewSummary": "Ready to add {count} server(s); {skipped} duplicate(s) will be skipped.",
			"managed.import.previewStale": "Settings changed since this preview. Review the JSON and preview it again before confirming.",
			"managed.import.credentialsNotice": "After confirmation, {count} credential value(s) will be stored in the credential store.",
			"managed.import.confirm": "Confirm import",
			"managed.import.cancel": "Cancel preview",
			"managed.import.action": "Import servers",
			"managed.import.complete": "Imported {imported} server(s); skipped {skipped} duplicate(s).",
			"managed.import.invalid": "Invalid JSON or unsupported server configuration. Check the mcpServers object and streamable-http entries.",
			"managed.export": "Export settings",
			"managed.export.notice": "Credential values stay in the local credential store and must be configured separately in another profile.",
			"managed.secret.show": "Show secret",
			"managed.secret.hide": "Hide secret",
			"managed.secret.placeholder": "Enter a new secret value",
			"managed.secret.hint": "The secret is masked. Use the eye button to reveal it or type a new value.",
			"managed.purpose.model-tools": "Model tools",
			"managed.purpose.project-memory": "Project memory"
		};
		/** Simplified Chinese strings for MCP server settings. */
		const zh = {
			title: "MCP 设置",
			pageTitle: "MCP 设置",
			pageDescription: "在一个托管列表中配置所有 MCP 服务器。",
			endpointHint: "请使用 HTTPS；HTTP 仅允许本机回环地址或私有 IPv4 地址。",
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
			"managed.search": "搜索服务",
			"managed.search.placeholder": "按服务名称搜索",
			"managed.filter.state": "连接状态",
			"managed.filter.allStates": "全部状态",
			"managed.filter.transport": "传输方式",
			"managed.filter.allTransports": "全部传输方式",
			"managed.filter.clear": "清除筛选",
			"managed.filter.noResults": "没有符合这些筛选条件的服务。",
			"managed.tools.show": "查看工具",
			"managed.tools.hide": "收起工具",
			"managed.tools.title": "可用工具",
			"managed.tools.empty": "此服务没有可用工具。",
			"managed.tools.unavailable": "服务未连接，暂时无法查看工具列表。",
			"managed.tools.unknown": "连接正常，但暂时读不到工具清单。",
			"managed.tools.loading": "正在读取工具清单…",
			"managed.enabled": "启用",
			"managed.edit": "编辑",
			"managed.delete": "删除",
			"managed.editor": "服务设置",
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
			"managed.headersHint": "示例：X-Client-Version → 1.0。Authorization 和 API Key 请填写在下方“凭据引用”中。",
			"managed.credentialsHint": "示例：请求头名称 Authorization · 凭据引用 MCP_NEW_TOKEN · 秘密值 Bearer <你的令牌>。",
			"managed.envName": "环境变量名称",
			"managed.credentialRef": "凭据引用",
			"managed.secret": "秘密值",
			"managed.addSecret": "添加秘密映射",
			"managed.removeSecret": "移除",
			check: "检查",
			"managed.checkReady": "已连接，发现 {count} 个工具",
			"managed.check.authorization-required": "需要授权",
			"managed.check.connection-failed": "连接失败",
			"managed.check.timed-out": "连接检查超时",
			"managed.check.ready": "已连接",
			"managed.check.invalid": "服务器配置无效，请修正后重试。",
			"managed.check.advice.authorization-required": "请检查凭据引用和秘密值。",
			"managed.check.advice.connection-failed": "请检查服务地址或命令，并确认服务器可用。",
			"managed.check.advice.timed-out": "请检查服务器是否响应，然后重试。",
			"managed.state.disabled": "已停用",
			"managed.state.connecting": "连接中",
			"managed.state.connected": "已连接",
			"managed.state.reconnecting": "重连中",
			"managed.state.disconnected": "已断开",
			"managed.state.unknown": "状态未知",
			"managed.summary": "已连接 {connected} / 共 {total} 个",
			"managed.toolCountInline": "{count} 个工具",
			"managed.refresh": "刷新",
			"managed.status.unavailable": "暂时无法读取实时连接状态，上面的状态和工具数量可能不是最新的。",
			"managed.error.save": "无法保存 MCP 服务设置。",
			"managed.error.credential": "无法保存凭据。",
			"managed.error.check": "无法检查 MCP 服务连接。",
			"managed.error.invalid": "请填写必填项，并确保名称唯一。",
			"managed.import": "导入 JSON",
			"managed.import.placeholder": "粘贴包含 mcpServers 对象的配置。",
			"managed.import.hint": "支持导入 streamable-http 服务。敏感请求头会保存到凭据库；已有名称会跳过。",
			"managed.import.previewAction": "预览导入",
			"managed.import.previewTitle": "导入预览",
			"managed.import.previewSummary": "将新增 {count} 个服务；跳过 {skipped} 个重复项。",
			"managed.import.previewStale": "预览后设置已更改。请重新检查 JSON 并预览，再确认导入。",
			"managed.import.credentialsNotice": "确认后将把 {count} 个凭据值保存到凭据库。",
			"managed.import.confirm": "确认导入",
			"managed.import.cancel": "取消预览",
			"managed.import.action": "导入服务",
			"managed.import.complete": "已导入 {imported} 个服务；跳过 {skipped} 个重复项。",
			"managed.import.invalid": "JSON 或服务器配置无效。请检查 mcpServers 对象及 streamable-http 配置。",
			"managed.export": "导出配置",
			"managed.export.notice": "密钥值仍保存在本地凭据库；在其他配置文件中需要单独设置。",
			"managed.secret.show": "显示密钥",
			"managed.secret.hide": "隐藏密钥",
			"managed.secret.placeholder": "输入新的秘密值",
			"managed.secret.hint": "秘密值已隐藏；点眼睛按钮可显示，或直接输入新的值。",
			"managed.purpose.model-tools": "模型工具",
			"managed.purpose.project-memory": "项目记忆"
		};
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.credentials",
			"configForms"
		];
		const NS = "settings.mcp";
		/**
		* Resolve a Remote namespace this plugin mounted itself.
		* Property access on `ctx.remote` is gated by the Cordis inject declaration, so a
		* namespace created by this plugin's own `$mount` is reached through `ctx.get`.
		* @param ctx - Client root.
		* @param namespace - Namespace mounted by `$mount` (e.g. `mcpClientStatus`).
		* @returns The namespace facade, or undefined while it is not mounted.
		*/
		function remoteNamespace(ctx, namespace) {
			return ctx.get(`remote.${namespace}`);
		}
		/** Register MCP settings while at least one managed MCP setting is available. */
		async function apply(ctx) {
			const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				en,
				zh
			}), "ui-settings-mcp: dictionaries");
			ctx.effect(() => ctx.configForms.whileServed(["mcp-server-manager"], () => {
				let stopSection;
				const managed = ctx.configForms.get("mcp-server-manager");
				stopSection = ctx.slots.inject("settings.section", () => ctx.slots.register({
					name: "settings.section",
					id: "mcp",
					order: 14,
					priority: -1,
					label: () => t("title"),
					locale: NS,
					inject: () => ({
						managedForm: managed,
						remote: ctx.remote,
						statusApi: remoteNamespace(ctx, "mcpClientStatus"),
						managerApi: remoteNamespace(ctx, "mcpServerManager")
					})
				}, McpConnectionsPage));
				return () => stopSection?.();
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
			return async () => {
				await unmountRemote();
			};
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map