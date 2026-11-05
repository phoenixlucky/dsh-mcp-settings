import { n as apply$1, r as inject$1, s as createTransport } from "./types-DH-mQw7k.js";
import { isIP } from "node:net";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { Client } from "@modelcontextprotocol/client";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import z from "@deepseek-ai/schemastery";
//#region lib/types/managed.js
/** Host manager for configurable Streamable HTTP and stdio MCP servers. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/;
const DEFAULT_CHECK_TIMEOUT_MS = 1e4;
const DEFAULT_TOOL_CALL_TIMEOUT_MS = 6e4;
const DEFAULT_MAX_INSTRUCTION_BYTES = 32768;
const MAX_TOOL_CALL_TIMEOUT_MS = 6e5;
const MAX_INSTRUCTION_BYTES = 1048576;
const MAX_TIMER_DELAY_MS = 2147483647;
const GENERATION_CLOSE_TIMEOUT_MS = 5e3;
const VOLATILE_WRITE = Symbol.for("cosmokit.volatile.write");
const DEFAULT_RECONNECT = Object.freeze({
	enabled: true,
	initialDelayMs: 500,
	maxDelayMs: 3e4,
	maxAttempts: 10
});
const ReconnectSchema = z.object({
	enabled: z.boolean().default(DEFAULT_RECONNECT.enabled),
	initialDelayMs: z.number().step(1).min(1).max(MAX_TIMER_DELAY_MS).default(DEFAULT_RECONNECT.initialDelayMs),
	maxDelayMs: z.number().step(1).min(1).max(MAX_TIMER_DELAY_MS).default(DEFAULT_RECONNECT.maxDelayMs),
	maxAttempts: z.number().step(1).min(1).max(1e3).default(DEFAULT_RECONNECT.maxAttempts)
});
const Purpose = z.union([z.const("model-tools"), z.const("project-memory")]).required(false);
const ServerName = z.string().required().pattern(SERVER_NAME_PATTERN);
const CredentialRefs = z.dict(z.string().required().pattern(CREDENTIAL_REF_PATTERN)).default({});
const ManagedServerSchema = z.union([z.object({
	id: z.string().required().min(1),
	serverName: ServerName,
	enabled: z.boolean().default(true),
	purpose: Purpose,
	transport: z.const("streamable-http"),
	url: z.string().required(),
	headers: z.dict(String).default({}),
	headerRefs: CredentialRefs
}), z.object({
	id: z.string().required().min(1),
	serverName: ServerName,
	enabled: z.boolean().default(true),
	purpose: Purpose,
	transport: z.const("stdio"),
	command: z.string().required().min(1),
	args: z.array(String).default([]),
	cwd: z.string().default(""),
	envRefs: CredentialRefs
})]);
/** Settings schema for a general managed MCP server manager. */
const Config = z.object({
	servers: z.array(ManagedServerSchema).default([]).volatile(),
	checkTimeoutMs: z.number().step(1).min(1).max(12e4).default(DEFAULT_CHECK_TIMEOUT_MS).volatile(),
	toolCallTimeoutMs: z.number().step(1).min(1).max(MAX_TOOL_CALL_TIMEOUT_MS).default(DEFAULT_TOOL_CALL_TIMEOUT_MS),
	maxInstructionBytes: z.number().step(1).min(1).max(MAX_INSTRUCTION_BYTES).default(DEFAULT_MAX_INSTRUCTION_BYTES),
	reconnect: ReconnectSchema
});
/** Cordis entry name. */
const name = "mcp-server-manager";
/** Services used to resolve secret references and start delegated MCP clients. */
const inject = ["credentials", ...inject$1];
/** Host service for server-list reconciliation and isolated connection checks. */
let ManagedMcpServerManager = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _check_decorators;
	return class ManagedMcpServerManager extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_check_decorators = [Remote];
			__esDecorate(this, null, _check_decorators, {
				kind: "method",
				name: "check",
				static: false,
				private: false,
				access: {
					has: (obj) => "check" in obj,
					get: (obj) => obj.check
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["credentials", "tools"];
		static Config = Config;
		config = __runInitializers(this, _instanceExtraInitializers);
		credentials;
		tuning;
		active = /* @__PURE__ */ new Map();
		tail = Promise.resolve();
		disposed = false;
		stopVolatile;
		stopCredential;
		/** Completes after the initial server list has been scheduled and reconciled. */
		ready;
		/** @param ctx - Host with credentials and MCP tool services. @param config - Managed-server settings. */
		constructor(ctx, config) {
			super(ctx, "mcpServerManager", { namespace: "mcpServerManager" });
			this.config = config;
			this.credentials = ctx.credentials;
			this.tuning = resolveTuning(config);
			this.stopVolatile = ctx.on("loader/volatile-update", (paths) => {
				if (paths.some(([field]) => field === "servers")) return this.reconcile(configuredServers(config)).catch((error) => {
					this.ctx.logger.warn("mcp-server-manager: rejected server settings (%s)", error instanceof Error ? error.name : "unknown error");
				});
			});
			this.stopCredential = ctx.on("credentials/reference-updated", (ref) => {
				const changedIds = new Set(configuredServers(config).filter((server) => Object.values(secretRefs(server)).includes(ref)).map((server) => server.id));
				if (changedIds.size > 0) return this.reconcile(configuredServers(config), changedIds).catch((error) => {
					this.ctx.logger.warn("mcp-server-manager: credential update failed (%s)", error instanceof Error ? error.name : "unknown error");
				});
			});
			ctx.effect(() => () => this.dispose(), "mcp-server-manager.connections");
			this.ready = this.reconcile(configuredServers(config)).catch((error) => {
				this.ctx.logger.warn("mcp-server-manager: rejected initial server settings (%s)", error instanceof Error ? error.name : "unknown error");
			});
		}
		/** Check a draft without publishing tools or invoking a server tool.
		* @param server - Draft server settings; credential references are resolved for this call only.
		* @returns A safe result classification and discovered tool count on success.
		*/
		async check(server) {
			let checked;
			try {
				checked = validateManagedServers([server])[0];
			} catch {
				return { state: "invalid" };
			}
			const live = this.liveCheck(checked);
			if (live !== undefined) return live;
			return checkManagedMcpServer(this.ctx, this.credentials, checked, volatileValue(this.config.checkTimeoutMs), this.tuning);
		}
		/** Reuse the live generation when the draft matches an active, connected row.
		* @param server - Validated draft server settings.
		* @returns A ready result with the live tool summaries, or undefined to probe.
		*/
		liveCheck(server) {
			const entry = this.active.get(server.id);
			if (entry === undefined || entry.fingerprint !== fingerprint(server)) return void 0;
			const catalog = this.ctx.get("mcpClientStatus");
			if (catalog === void 0 || typeof catalog.list !== "function") return void 0;
			let rows;
			try {
				rows = catalog.list();
			} catch {
				return void 0;
			}
			const row = rows.find((candidate) => candidate.serverName === server.serverName && candidate.state === "connected");
			if (row === void 0) return void 0;
			return {
				state: "ready",
				toolCount: row.toolCount,
				tools: (row.tools ?? []).map((tool) => ({
					name: tool.name,
					description: tool.description
				}))
			};
		}
		/** Replace or remove only the active client fibers affected by the new list.
		* @param servers - Complete next settings list.
		* @param restartIds - Optional ids to restart after a referenced credential changes.
		* @returns Completion after every changed row has been reconciled.
		*/
		async reconcile(servers, restartIds = /* @__PURE__ */ new Set()) {
			const snapshot = this.acceptServers(servers);
			const task = this.tail.then(async () => {
				if (this.disposed) return;
				const nextById = new Map(snapshot.map((server) => [server.id, server]));
				for (const [id, current] of this.active) {
					const next = nextById.get(id);
					if (next === void 0 || !next.enabled || restartIds.has(id) || fingerprint(next) !== current.fingerprint) {
						this.active.delete(id);
						try {
							await current.fiber.dispose();
						} catch (error) {
							this.ctx.logger.warn("mcp-server-manager: could not dispose server \"%s\" (%s)", id, error instanceof Error ? error.name : "unknown error");
						}
					}
				}
				for (const server of snapshot) {
					if (this.disposed || !server.enabled || this.active.has(server.id)) continue;
					try {
						const runtime = await resolveClientConfig(this.credentials, server, this.tuning);
						const fiber = await this.ctx.plugin({
							name: "mcp-server-manager:" + server.id,
							inject: inject$1,
							apply: apply$1
						}, runtime);
						if (this.disposed) await fiber.dispose();
						else this.active.set(server.id, {
							fingerprint: fingerprint(server),
							fiber
						});
					} catch (error) {
						this.ctx.logger.warn("mcp-server-manager: could not start server \"%s\" (%s)", server.serverName, error instanceof Error ? error.name : "unknown error");
					}
				}
			});
			this.tail = task.catch((error) => {
				this.ctx.logger.error("mcp-server-manager: server update failed (%s)", error instanceof Error ? error.name : "unknown error");
			});
			return this.tail;
		}
		/** Accept each configured row on its own so one invalid row cannot stop the rest.
		* @param servers - Complete next settings list.
		* @returns Accepted rows in input order, without duplicates.
		*/
		acceptServers(servers) {
			const ids = /* @__PURE__ */ new Set();
			const names = /* @__PURE__ */ new Set();
			const accepted = [];
			for (const server of Array.isArray(servers) ? servers : []) {
				let row;
				try {
					row = validateManagedServers([server])[0];
				} catch (error) {
					this.ctx.logger.warn("mcp-server-manager: skipped invalid server row (%s)", error instanceof Error ? error.message : "unknown error");
					continue;
				}
				if (ids.has(row.id) || names.has(row.serverName)) {
					this.ctx.logger.warn("mcp-server-manager: skipped duplicate server \"%s\"", row.serverName);
					continue;
				}
				ids.add(row.id);
				names.add(row.serverName);
				accepted.push(row);
			}
			return accepted;
		}
		/** Stop listening for configuration changes and await all delegated clients.
		* @returns Completion after every delegated client has been disposed.
		*/
		async dispose() {
			if (this.disposed) return;
			this.disposed = true;
			this.stopVolatile();
			this.stopCredential();
			await this.tail;
			const clients = [...this.active.values()];
			this.active.clear();
			const settled = await Promise.allSettled(clients.map(({ fiber }) => fiber.dispose()));
			for (const outcome of settled) if (outcome.status === "rejected") this.ctx.logger.warn("mcp-server-manager: server disposal failed (%s)", outcome.reason instanceof Error ? outcome.reason.name : "unknown error");
		}
	};
})();
/** Mount the manager and begin reconciling its initial server list.
* @param ctx - Cordis context providing credentials and tool registration.
* @param config - Resolved managed-server settings.
* @returns Completion after the manager service is registered.
*/
async function apply(ctx, config) {
	new ManagedMcpServerManager(ctx, config);
}
/** Perform one bounded initialization and discovery pass without registering tools.
* @param ctx - Host context used for redacted diagnostics.
* @param credentials - Provider resolving the draft's secret references.
* @param server - Draft entry to check.
* @param timeoutMs - Maximum duration for credential resolution, connect, and discovery.
* @returns A safe check result; server response text and credentials are never returned.
*/
async function checkManagedMcpServer(ctx, credentials, server, timeoutMs, tuning = resolveTuning({})) {
	let checked;
	try {
		checked = validateManagedServers([server])[0];
	} catch {
		return { state: "invalid" };
	}
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	timeout.unref();
	let client;
	let connected = false;
	let failed = false;
	const closed = Promise.withResolvers();
	try {
		const runtime = await raceAbort(resolveClientConfig(credentials, checked, tuning), controller.signal);
		if (controller.signal.aborted) return { state: "timed-out" };
		const transport = createTransport(runtime);
		client = new Client({
			name: "dsh-mcp-client-check",
			version: "0.0.1"
		}, {
			capabilities: {},
			versionNegotiation: { mode: "auto" },
			listChanged: { tools: {
				autoRefresh: false,
				debounceMs: 0,
				onChanged: () => {}
			} }
		});
		client.onclose = () => closed.resolve();
		await client.connect(transport, { signal: controller.signal });
		connected = true;
		if (controller.signal.aborted) return { state: "timed-out" };
		const tools = client.getServerCapabilities()?.tools === void 0 ? [] : (await client.listTools(void 0, {
			signal: controller.signal,
			cacheMode: "refresh"
		})).tools;
		return {
			state: "ready",
			toolCount: tools.length,
			tools: tools.map((tool) => ({
				name: tool.name,
				description: tool.description ?? ""
			}))
		};
	} catch (error) {
		failed = true;
		if (controller.signal.aborted) return { state: "timed-out" };
		return { state: isAuthorizationFailure(error) ? "authorization-required" : "connection-failed" };
	} finally {
		clearTimeout(timeout);
		if (client !== undefined) {
			let closedCleanly = false;
			try {
				await client.close();
				closedCleanly = !connected || await waitForClose(closed.promise);
			} catch (error) {
				if (!failed) ctx.logger.warn("mcp-server-manager: connection-check cleanup failed (%s)", error instanceof Error ? error.name : "unknown error");
			}
			if (connected && !closedCleanly) ctx.logger.warn("mcp-server-manager: connection-check process exit could not be confirmed");
		}
	}
}
/** Race one promise against an abort signal without leaking the listener. */
function raceAbort(promise, signal) {
	if (signal.aborted) return Promise.reject(new Error("timeout"));
	return new Promise((resolve, reject) => {
		const abort = () => reject(new Error("timeout"));
		signal.addEventListener("abort", abort, { once: true });
		promise.then((value) => {
			signal.removeEventListener("abort", abort);
			resolve(value);
		}, (error) => {
			signal.removeEventListener("abort", abort);
			reject(error);
		});
	});
}
/** Wait for the transport-owned close signal without wedging teardown forever. */
function waitForClose(closed) {
	return new Promise((resolve) => {
		const timeout = setTimeout(() => resolve(false), GENERATION_CLOSE_TIMEOUT_MS);
		timeout.unref();
		closed.then(() => {
			clearTimeout(timeout);
			resolve(true);
		});
	});
}
/** Remove volatile references and nested arrays without trusting loader wrappers.
* @param value - Parsed settings, a volatile reference, or an ordinary value.
* @returns A detached plain value.
*/
function plainConfig(value) {
	if (typeof value === "object" && value !== null && VOLATILE_WRITE in value) return plainConfig(value.get());
	if (Array.isArray(value)) return value.map(plainConfig);
	if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, plainConfig(child)]));
	return value;
}
/** Read one possibly-volatile settings value. */
function volatileValue(value) {
	return typeof value === "object" && value !== null && VOLATILE_WRITE in value ? value.get() : value;
}
/** Read the configured server list from either a volatile or a plain config. */
function configuredServers(config) {
	const value = volatileValue(config.servers);
	return Array.isArray(value) ? value : [];
}
/** Validate tunables again because programmatic construction bypasses Schemastery. */
function resolveTuning(config) {
	const toolCallTimeoutMs = boundedInteger(config.toolCallTimeoutMs, DEFAULT_TOOL_CALL_TIMEOUT_MS, MAX_TOOL_CALL_TIMEOUT_MS, "toolCallTimeoutMs");
	const maxInstructionBytes = boundedInteger(config.maxInstructionBytes, DEFAULT_MAX_INSTRUCTION_BYTES, MAX_INSTRUCTION_BYTES, "maxInstructionBytes");
	return Object.freeze({
		toolCallTimeoutMs,
		maxInstructionBytes,
		reconnect: resolveReconnect(config.reconnect)
	});
}
/** Validate one positive integer setting. */
function boundedInteger(value, fallback, max, field) {
	const resolved = value ?? fallback;
	if (!Number.isInteger(resolved) || resolved < 1 || resolved > max) throw new Error(`mcp-server-manager: ${field} must be an integer between 1 and ${max}`);
	return resolved;
}
/** Resolve and freeze the reconnect policy, rejecting unknown keys and bad bounds. */
function resolveReconnect(input) {
	const config = input ?? {};
	for (const key of Object.keys(config)) if (!Object.hasOwn(DEFAULT_RECONNECT, key)) throw new Error(`mcp-server-manager: reconnect.${key} is not a reconnect option`);
	const enabled = config.enabled ?? DEFAULT_RECONNECT.enabled;
	if (typeof enabled !== "boolean") throw new Error("mcp-server-manager: reconnect.enabled must be a boolean");
	const initialDelayMs = boundedInteger(config.initialDelayMs, DEFAULT_RECONNECT.initialDelayMs, MAX_TIMER_DELAY_MS, "reconnect.initialDelayMs");
	const maxDelayMs = boundedInteger(config.maxDelayMs, DEFAULT_RECONNECT.maxDelayMs, MAX_TIMER_DELAY_MS, "reconnect.maxDelayMs");
	if (initialDelayMs > maxDelayMs) throw new Error("mcp-server-manager: reconnect.initialDelayMs must be less than or equal to reconnect.maxDelayMs");
	const maxAttempts = boundedInteger(config.maxAttempts, DEFAULT_RECONNECT.maxAttempts, 1e3, "reconnect.maxAttempts");
	return Object.freeze({
		enabled,
		initialDelayMs,
		maxDelayMs,
		maxAttempts
	});
}
/** Validate the complete list before any connection is changed. */
function validateManagedServers(servers) {
	const ids = /* @__PURE__ */ new Set();
	const names = /* @__PURE__ */ new Set();
	const result = servers.map((server) => ManagedServerSchema(plainConfig(server)));
	for (const server of result) {
		if (ids.has(server.id)) throw new TypeError("mcp-server-manager: duplicate server id \"" + server.id + "\"");
		if (names.has(server.serverName)) throw new TypeError("mcp-server-manager: duplicate serverName \"" + server.serverName + "\"");
		ids.add(server.id);
		names.add(server.serverName);
		if (server.transport === "streamable-http") {
			validateHttpUrl(server.url);
			if ([...Object.keys(server.headerRefs), ...Object.keys(server.headers ?? {})].some((key) => !HEADER_NAME_PATTERN.test(key))) throw new TypeError("mcp-server-manager: invalid HTTP header name");
		} else if (Object.keys(server.envRefs).some((key) => !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key))) throw new TypeError("mcp-server-manager: invalid environment variable name");
	}
	return result;
}
/** Resolve secret references into the existing mcp-client configuration. */
async function resolveClientConfig(credentials, server, tuning = resolveTuning({})) {
	if (server.transport === "streamable-http") {
		const url = validateHttpUrl(server.url);
		const secrets = await resolveSecretMap(credentials, server.headerRefs);
		const headers = {
			...server.headers,
			...secrets
		};
		for (const name of Object.keys(headers)) if (!HEADER_NAME_PATTERN.test(name)) throw new TypeError("mcp-server-manager: invalid HTTP header name");
		return {
			transport: "streamable-http",
			serverName: server.serverName,
			url: url.href,
			headers,
			toolCallTimeoutMs: tuning.toolCallTimeoutMs,
			maxInstructionBytes: tuning.maxInstructionBytes,
			reconnect: tuning.reconnect,
			failOnStartupError: false
		};
	}
	const env = await resolveSecretMap(credentials, server.envRefs);
	return {
		transport: "stdio",
		serverName: server.serverName,
		command: server.command,
		args: [...server.args],
		env,
		cwd: server.cwd,
		toolCallTimeoutMs: tuning.toolCallTimeoutMs,
		maxInstructionBytes: tuning.maxInstructionBytes,
		reconnect: tuning.reconnect,
		failOnStartupError: false
	};
}
/** Resolve every configured secret and refuse to start with a missing reference. */
async function resolveSecretMap(credentials, refs) {
	const resolved = {};
	for (const [key, ref] of Object.entries(refs)) {
		const hit = await credentials.resolve(credentialRef(ref));
		if (hit === void 0) throw new Error("a referenced credential is not configured");
		Object.defineProperty(resolved, key, {
			value: hit.value,
			enumerable: true,
			configurable: true,
			writable: true
		});
	}
	return resolved;
}
/** Return stored references without resolving their secret values. */
function secretRefs(server) {
	return server.transport === "streamable-http" ? server.headerRefs : server.envRefs;
}
/** Enforce HTTPS or loopback HTTP and reject URL-embedded credentials. */
function validateHttpUrl(input) {
	let url;
	try {
		url = new URL(input);
	} catch {
		throw new TypeError("MCP endpoint must be an absolute URL");
	}
	const hostname = url.hostname.toLowerCase();
	const address = hostname.replace(/^\[|\]$/gu, "");
	const loopback = hostname === "localhost" || isIP(address) === 4 && address.startsWith("127.") || address === "::1" || address.startsWith("::ffff:") && isIP(address.slice(7)) === 4 && address.slice(7).startsWith("127.");
	const privateIpv4 = isIP(address) === 4 && (address.startsWith("10.") || address.startsWith("192.168.") || /^172\.(?:1[6-9]|2\d|3[01])\./u.test(address));
	if (url.username !== "" || url.password !== "" || !(url.protocol === "https:" || url.protocol === "http:" && (loopback || privateIpv4))) throw new TypeError("MCP endpoint must use HTTPS or HTTP on a loopback/private IPv4 address, without URL credentials");
	return url;
}
/** Compare settings without exposing values in diagnostics. */
function fingerprint(server) {
	return JSON.stringify(server);
}
/** Detect authorization status without returning transport-provided text. */
function isAuthorizationFailure(error) {
	let candidate = error;
	for (let depth = 0; depth < 4; depth++) {
		if (typeof candidate !== "object" || candidate === null) return false;
		if ("status" in candidate && (candidate.status === 401 || candidate.status === 403)) return true;
		candidate = "cause" in candidate ? candidate.cause : void 0;
	}
	return false;
}
//#region settings-only credential reveal

/**
 * Add one SRC-mode Remote marker without the decorator runtime.
 * @param prototype - manager prototype carrying the generated marker record.
 */
function markRevealSecret(prototype) {
	const key = '@deepseek-ai/dsh-typert-protocol/remote-methods';
	const current = Object.getOwnPropertyDescriptor(prototype, key);
	const methods = current?.value?.methods ?? [];
	if (methods.some((marker) => marker.method === 'revealSecret')) return;
	Object.defineProperty(prototype, key, {
		configurable: true,
		value: Object.freeze({
			version: 1,
			methods: Object.freeze([...methods, Object.freeze({ method: 'revealSecret', invocation: Object.freeze({ kind: 'direct' }) })])
		})
	});
}
markRevealSecret(ManagedMcpServerManager.prototype);
/**
 * Resolve one stored credential for display in the local settings UI.
 * @param ref - credential reference stored on one server row.
 * @returns the stored value, or an empty string when the reference is unset.
 */
ManagedMcpServerManager.prototype.revealSecret = async function revealSecret(ref) {
	if (typeof ref !== 'string' || !CREDENTIAL_REF_PATTERN.test(ref)) return { value: '' };
	const configured = configuredServers(this.config).some((server) => Object.values(secretRefs(server)).includes(ref));
	if (!configured) return { value: '' };
	const hit = await this.credentials.resolve(credentialRef(ref));
	return { value: hit === void 0 ? '' : hit.value };
};
//#endregion
export { Config, ManagedMcpServerManager, apply, checkManagedMcpServer, inject, name };
