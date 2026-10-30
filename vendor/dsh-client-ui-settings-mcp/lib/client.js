window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-mcp-settings",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let zod = require("zod");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region ../../node_modules/.pnpm/@deepseek-ai+dsh-typert-pro_a6e9a8aa967178344e20691a5993d5fa/node_modules/@deepseek-ai/dsh-typert-protocol/lib/types/remote-info.js
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
		//#region ../../node_modules/.pnpm/@deepseek-ai+dsh-mcp-client_36e5434467f07009774fd0c3f47f3628/node_modules/@deepseek-ai/dsh-mcp-client/lib/typert.remote-client.js
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
			"toolCount": zod.z.number().readonly()
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
			zod.z.object({ "state": zod.z.literal("authorization-required") }),
			zod.z.object({ "state": zod.z.literal("connection-failed") }),
			zod.z.object({ "state": zod.z.literal("timed-out") }),
			zod.z.object({
				"state": zod.z.literal("ready"),
				"toolCount": zod.z.number()
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
									"toolCount": { "type": "number" }
								},
								"required": [
									"id",
									"serverName",
									"transport",
									"source",
									"state",
									"toolCount"
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
									"toolCount": { "type": "number" }
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
		const css = ".oetn4G_connections{--mcp-space-1:4px;--mcp-space-2:8px;--mcp-space-3:12px;--mcp-space-4:16px;--mcp-space-5:20px;--dsw-alias-button-primary-fill:var(--dsw-static-amber-600);--mcp-card-fill:color-mix(in srgb, var(--dsw-static-amber-100) 12%, var(--dsw-alias-settings-card-fill));--mcp-field-fill:var(--dsw-alias-bg-layer-1);--mcp-card-stroke:color-mix(in srgb, var(--dsw-static-amber-600) 18%, var(--dsw-alias-settings-card-stroke));gap:var(--mcp-space-5);grid-template-columns:minmax(0,1fr);width:100%;max-width:76rem;margin-inline:auto;display:grid}.oetn4G_pageHeader{align-items:center;gap:var(--mcp-space-4);min-width:0;padding:0 var(--mcp-space-1) var(--mcp-space-2);display:flex}.oetn4G_pageIcon{border-radius:var(--dsw-radius-xl);background:var(--mcp-field-fill);width:3.5rem;height:3.5rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.oetn4G_pageCopy{gap:var(--mcp-space-1);min-width:0;display:grid}.oetn4G_pageTitle{color:var(--dsw-alias-label-primary);font:500 28px/36px var(--dsw-font-family);margin:0}.oetn4G_pageDescription{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);margin:0}.oetn4G_card{align-content:start;gap:var(--mcp-space-4);width:100%;min-width:0;padding:var(--mcp-space-4);border:1px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--mcp-card-fill);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);display:grid;container-type:inline-size}.oetn4G_cardHeader{justify-content:space-between;align-items:center;gap:var(--mcp-space-4);min-height:3.5rem;padding:0 var(--mcp-space-1) var(--mcp-space-3);border-bottom:1px solid var(--mcp-card-stroke);display:flex}.oetn4G_cardIdentity{align-items:center;gap:var(--mcp-space-3);min-width:0;display:flex}.oetn4G_cardIcon{border-radius:var(--dsw-radius-lg);background:var(--mcp-field-fill);width:3rem;height:3rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.oetn4G_cardCopy{gap:var(--mcp-space-1);min-width:0;display:grid}.oetn4G_cardTitle{min-width:0;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xl-24);margin:0}.oetn4G_card>h3{padding:0 var(--mcp-space-1) var(--mcp-space-3);border-bottom:.5px solid var(--mcp-card-stroke);color:var(--dsw-alias-label-primary);font:var(--dsw-font-l-20);margin:0}.oetn4G_cardDescription{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);margin:0}.oetn4G_enableControl{align-items:center;gap:var(--mcp-space-3);flex:none;padding:0;display:flex}.oetn4G_enableLabel{max-width:14rem;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);text-align:right}.oetn4G_fieldGroup{gap:var(--mcp-space-4);min-width:0;padding:var(--mcp-space-5);border:1px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, transparent);display:grid}.oetn4G_fieldGroupTitle{padding-bottom:var(--mcp-space-3);border-bottom:1px solid var(--mcp-card-stroke);color:var(--dsw-alias-label-primary);font:var(--dsw-font-l-20);margin:0}.oetn4G_field{gap:var(--mcp-space-2);color:var(--dsw-alias-label-primary);font:var(--dsw-font-base-strong-16);display:grid}.oetn4G_formGrid{gap:var(--mcp-space-4);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.oetn4G_formGrid .oetn4G_field{align-items:center;column-gap:var(--mcp-space-3);grid-template-columns:minmax(7rem,.8fr) minmax(0,1.2fr)}.oetn4G_field input,.oetn4G_field textarea,.oetn4G_field select{box-sizing:border-box;width:100%;min-width:0;min-height:2.5rem;padding:var(--mcp-space-2) var(--mcp-space-3);border:.5px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-md);background:var(--mcp-field-fill);color:var(--dsw-alias-label-primary);font:inherit}.oetn4G_field textarea:focus-visible,.oetn4G_field select:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.oetn4G_field textarea:disabled,.oetn4G_field select:disabled{opacity:.6}.oetn4G_field input:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.oetn4G_field input:disabled{opacity:.6}.oetn4G_field small{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16)}.oetn4G_cardFooter{align-items:center;gap:var(--mcp-space-4);padding:var(--mcp-space-3) var(--mcp-space-1) 0;border-top:1px solid var(--mcp-card-stroke);grid-template-columns:minmax(0,1fr) auto;display:grid}.oetn4G_status{align-items:center;gap:var(--mcp-space-2) var(--mcp-space-3);min-width:0;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16);flex-wrap:wrap;margin:0;display:flex}.oetn4G_status strong{width:fit-content;padding:var(--mcp-space-1) var(--mcp-space-3);corner-shape:round;background:var(--mcp-field-fill);color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-strong-14);border-radius:999px}.oetn4G_status strong[data-state=ready]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-success-primary)}.oetn4G_error{color:var(--dsw-alias-state-error-primary);grid-column:1/-1;margin:0}.oetn4G_actions{justify-content:flex-end;gap:var(--mcp-space-2);flex-wrap:wrap;display:flex}.oetn4G_serverList{gap:var(--mcp-space-3);min-width:0;display:grid}.oetn4G_serverList h4{color:var(--dsw-alias-label-primary);margin:0}.oetn4G_serverList>small{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-base-16)}.oetn4G_serverCard{align-items:center;gap:var(--mcp-space-4);padding:var(--mcp-space-4) var(--mcp-space-5);border:1px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);color:var(--dsw-alias-label-secondary);grid-template-columns:minmax(0,1fr) auto auto;transition:border-color .14s,box-shadow .14s;display:grid}.oetn4G_serverCard:not(.oetn4G_serverCardEditing):hover{border-color:color-mix(in srgb, var(--dsw-static-amber-600) 38%, var(--mcp-card-stroke));box-shadow:0 2px 8px color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent)}.oetn4G_serverCard strong{color:var(--dsw-alias-label-primary)}.oetn4G_serverCard p{margin:0}.oetn4G_serverCard>p{padding-inline:var(--mcp-space-4);border-inline:.5px solid var(--mcp-card-stroke);color:var(--dsw-alias-label-primary);white-space:nowrap}.oetn4G_serverHeading{justify-content:space-between;align-items:center;gap:var(--mcp-space-3);min-width:0;display:flex}.oetn4G_serverIdentity{align-items:center;gap:var(--mcp-space-3);min-width:0;display:flex}.oetn4G_serverIcon{border-radius:var(--dsw-radius-lg);background:var(--mcp-field-fill);width:2.75rem;height:2.75rem;color:var(--dsw-alias-button-primary-fill);flex:none;place-items:center;display:grid}.oetn4G_serverState{width:fit-content;padding:var(--mcp-space-1) var(--mcp-space-2);background:color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, var(--dsw-alias-settings-card-fill));color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);border-radius:999px;align-items:center;line-height:1.2;display:inline-flex}.oetn4G_serverState[data-state=connected]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-success-primary)}.oetn4G_serverCardEditing{border-color:color-mix(in srgb, var(--dsw-static-amber-600) 42%, var(--mcp-card-stroke));background:color-mix(in srgb, var(--dsw-static-amber-100) 10%, var(--dsw-alias-settings-card-fill));grid-template-columns:minmax(0,1fr)}.oetn4G_serverCardEditing>p{white-space:normal;border:0;padding:0}.oetn4G_serverCardEditing>.oetn4G_actions,.oetn4G_serverCardEditing>section{grid-column:1/-1}.oetn4G_secretRow{align-items:end;gap:var(--mcp-space-3);grid-template-columns:repeat(3,minmax(0,1fr)) auto;display:grid}.oetn4G_toolCount{width:fit-content;padding:var(--mcp-space-2) var(--mcp-space-3);border:1px solid var(--mcp-card-stroke);border-radius:var(--dsw-radius-md);background:var(--mcp-field-fill);color:var(--dsw-alias-label-primary);font:var(--dsw-font-s-14)}@media (prefers-reduced-motion:reduce){.oetn4G_serverCard{transition:none}}@container (width<=48rem){.oetn4G_serverCard:not(.oetn4G_serverCardEditing){align-items:center;column-gap:var(--mcp-space-4);row-gap:var(--mcp-space-4);grid-template-columns:minmax(0,1fr) auto}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>.oetn4G_serverHeading{grid-column:1/-1}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>p{white-space:normal;border:0;padding:0}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>.oetn4G_actions{justify-content:flex-end;gap:var(--mcp-space-3)}}@container (width<=40rem){.oetn4G_cardHeader{flex-wrap:wrap;align-items:flex-start}.oetn4G_cardIdentity{flex:100%}.oetn4G_cardHeader>.oetn4G_actions{justify-content:flex-start;width:100%}.oetn4G_formGrid{grid-template-columns:minmax(0,1fr)}.oetn4G_enableControl{flex:auto;justify-content:space-between;max-width:100%}.oetn4G_serverCard:not(.oetn4G_serverCardEditing){grid-template-columns:minmax(0,1fr);align-items:start}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>p{white-space:normal;border:0;padding:0}.oetn4G_serverCard:not(.oetn4G_serverCardEditing)>.oetn4G_actions{justify-content:flex-start}}@container (width>=38rem){.oetn4G_field{align-items:center;column-gap:var(--mcp-space-4);grid-template-columns:minmax(9rem,12rem) minmax(0,1fr)}.oetn4G_field small{grid-column:2}.oetn4G_secretRow .oetn4G_field{grid-template-columns:minmax(0,1fr)}.oetn4G_secretRow .oetn4G_field small{grid-column:1}}@container (width<=32rem){.oetn4G_card{padding:var(--mcp-space-3)}.oetn4G_field{grid-template-columns:minmax(0,1fr)}.oetn4G_field small{grid-column:1}.oetn4G_cardFooter{grid-template-columns:minmax(0,1fr)}.oetn4G_actions{justify-content:flex-start}.oetn4G_secretRow{grid-template-columns:minmax(0,1fr)}.oetn4G_serverHeading{flex-wrap:wrap;align-items:flex-start}.oetn4G_serverCard>.oetn4G_actions{justify-content:flex-start}.oetn4G_serverCard{grid-template-columns:minmax(0,1fr);align-items:start}.oetn4G_serverCard>p{white-space:normal;border:0;padding:0}}";
		const tagId = "@deepseek-ai/dsh-mcp-settings/mcp-settings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mcp-settings";
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
			"formGrid": "oetn4G_formGrid",
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
			"status": "oetn4G_status",
			"toolCount": "oetn4G_toolCount"
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
			const [importFailure, setImportFailure] = (0, react.useState)();
			const [checkState, setCheckState] = (0, react.useState)();
			const [importJson, setImportJson] = (0, react.useState)("");
			const [importState, setImportState] = (0, react.useState)();
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
			const importServers = async () => {
				setBusy(true);
				setImportFailure(void 0);
				setImportState(void 0);
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
						candidates.push({
							server,
							secrets
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
					if (candidates.length === 0) {
						if (skipped === 0) throw new Error("invalid");
					}
					const next = [];
					for (const candidate of candidates) {
						const server = candidate.server;
						const refs = server.transport === "streamable-http" ? { ...server.headerRefs } : { ...server.envRefs };
						for (const [name, value] of Object.entries(candidate.secrets)) {
							const ref = `MCP_IMPORT_${randomUUID().replaceAll("-", "")}`;
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
						if (next.length > 0) await saveServers([...servers, ...next]);
					} catch {
						setImportFailure("save");
						return;
					}
					setImportJson("");
					setImportState(t("managed.import.complete").replace("{imported}", String(next.length)).replace("{skipped}", String(skipped)));
				} catch {
					setImportState(void 0);
					setImportFailure("import-invalid");
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
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
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
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: mcp_settings_module_css_default.actions,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						id: "managed-mcp-import",
						className: mcp_settings_module_css_default.fieldGroup,
						"aria-label": t("managed.import"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: mcp_settings_module_css_default.field,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("managed.import") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									rows: 8,
									value: importJson,
									disabled: busy,
									onChange: (event) => setImportJson(event.currentTarget.value),
									placeholder: t("managed.import.placeholder")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("managed.import.hint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: mcp_settings_module_css_default.actions,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy || !snapshot.writable || importJson.trim() === "",
									onClick: () => {
										importServers();
									},
									children: busy ? t("checking") : t("managed.import")
								})
							}),
							importState !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.status,
								role: "status",
								children: importState
							}),
							importFailure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: mcp_settings_module_css_default.error,
								role: "alert",
								children: managedFailureLabel(t, importFailure)
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
											className: mcp_settings_module_css_default.toolCount,
											children: [
												t("toolCount"),
												": ",
												status?.toolCount ?? 0
											]
										}),
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
				case "import-invalid": return t("managed.import.invalid");
			}
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		//#endregion
		//#region src/client/McpConnectionsPage.tsx
		/** Show each managed connection on the shared MCP settings page when served. */
		function McpConnectionsPage({ managedForm, remote, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: mcp_settings_module_css_default.connections,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
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
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManagedMcpServers, {
					form: managedForm,
					remote,
					t
				})]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** English strings for MCP server settings. */
		const en = {
			title: "MCP",
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
			"managed.state.disabled": "Disabled",
			"managed.state.connecting": "Connecting",
			"managed.state.connected": "Connected",
			"managed.state.reconnecting": "Reconnecting",
			"managed.state.disconnected": "Disconnected",
			"managed.error.save": "Could not save the server settings.",
			"managed.error.credential": "Could not store a credential.",
			"managed.error.check": "Could not check this MCP server.",
			"managed.error.invalid": "Complete the required fields and use unique names.",
			"managed.import": "Import JSON",
			"managed.import.placeholder": "Paste a configuration containing an mcpServers object.",
			"managed.import.hint": "Imports streamable-http servers. Secret headers are stored in the credential store; existing names are skipped.",
			"managed.import.action": "Import servers",
			"managed.import.complete": "Imported {imported} server(s); skipped {skipped} duplicate(s).",
			"managed.import.invalid": "Invalid JSON or unsupported server configuration. Check the mcpServers object and streamable-http entries."
		};
		/** Simplified Chinese strings for MCP server settings. */
		const zh = {
			title: "MCP",
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
			"managed.state.disabled": "已停用",
			"managed.state.connecting": "连接中",
			"managed.state.connected": "已连接",
			"managed.state.reconnecting": "重连中",
			"managed.state.disconnected": "已断开",
			"managed.error.save": "无法保存 MCP 服务设置。",
			"managed.error.credential": "无法保存凭据。",
			"managed.error.check": "无法检查 MCP 服务连接。",
			"managed.error.invalid": "请填写必填项，并确保名称唯一。",
			"managed.import": "导入 JSON",
			"managed.import.placeholder": "粘贴包含 mcpServers 对象的配置。",
			"managed.import.hint": "支持导入 streamable-http 服务。敏感请求头会保存到凭据库；已有名称会跳过。",
			"managed.import.action": "导入服务",
			"managed.import.complete": "已导入 {imported} 个服务；跳过 {skipped} 个重复项。",
			"managed.import.invalid": "JSON 或服务器配置无效。请检查 mcpServers 对象及 streamable-http 配置。"
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
						remote: ctx.remote
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