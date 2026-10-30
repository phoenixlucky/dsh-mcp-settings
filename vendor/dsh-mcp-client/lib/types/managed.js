/** Host manager for configurable Streamable HTTP and stdio MCP servers. */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { isIP } from 'node:net';
import { credentialRef } from '@deepseek-ai/dsh-credentials';
import { Client } from '@modelcontextprotocol/client';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { apply as applyMcpClient, inject as mcpClientInject } from "./index.js";
import { createTransport } from "./transport.js";
const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/;
const INLINE_SECRET_HEADER_PATTERN = /^(?:authorization|cookie|proxy-authorization|x-api-key)$/iu;
const DEFAULT_CHECK_TIMEOUT_MS = 10_000;
const ServerName = z.string().required().pattern(SERVER_NAME_PATTERN);
const CredentialRefs = z.dict(z.string().required().pattern(CREDENTIAL_REF_PATTERN)).default({});
const Purpose = z.union([z.const('model-tools'), z.const('project-memory')]).default('model-tools');
const ManagedServerSchema = z.union([
    z.object({
        id: z.string().required().min(1), serverName: ServerName, enabled: z.boolean().default(true), purpose: Purpose,
        transport: z.const('streamable-http'), url: z.string().required(), headers: z.dict(String).default({}), headerRefs: CredentialRefs,
    }),
    z.object({
        id: z.string().required().min(1), serverName: ServerName, enabled: z.boolean().default(true), purpose: Purpose,
        transport: z.const('stdio'), command: z.string().required().min(1), args: z.array(String).default([]),
        cwd: z.string().default(''), envRefs: CredentialRefs,
    }),
]);
/** Settings schema for a general managed MCP server manager. */
export const Config = z.object({
    servers: z.array(ManagedServerSchema).default([]).volatile(),
    checkTimeoutMs: z.number().step(1).min(1).max(120_000).default(DEFAULT_CHECK_TIMEOUT_MS).volatile(),
});
/** Cordis entry name. */
export const name = 'mcp-server-manager';
/** Services used to resolve secret references and start delegated MCP clients. */
export const inject = ['credentials', ...mcpClientInject];
/** Host service for server-list reconciliation and isolated connection checks. */
let ManagedMcpServerManager = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _check_decorators;
    return class ManagedMcpServerManager extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _check_decorators = [Remote];
            __esDecorate(this, null, _check_decorators, { kind: "method", name: "check", static: false, private: false, access: { has: obj => "check" in obj, get: obj => obj.check }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['credentials', 'tools'];
        static Config = Config;
        config = __runInitializers(this, _instanceExtraInitializers);
        credentials;
        active = new Map();
        consumers = new Map();
        tail = Promise.resolve();
        disposed = false;
        stopVolatile;
        stopCredential;
        /** Completes after the initial server list has been scheduled and reconciled. */
        ready;
        /** @param ctx - Host with credentials and MCP tool services. @param config - Managed-server settings. */
        constructor(ctx, config) {
            super(ctx, 'mcpServerManager', { namespace: 'mcpServerManager' });
            this.config = config;
            this.credentials = ctx.credentials;
            this.stopVolatile = ctx.on('loader/volatile-update', (paths) => {
                if (paths.some(([field]) => field === 'servers'))
                    return this.reconcile(config.servers.get()).catch((error) => {
                        this.ctx.logger.warn('mcp-server-manager: rejected server settings (%s)', error instanceof Error ? error.name : 'unknown error');
                    });
            });
            this.stopCredential = ctx.on('credentials/reference-updated', (ref) => {
                const changedIds = new Set(config.servers.get()
                    .filter(server => Object.values(secretRefs(server)).includes(ref))
                    .map(server => server.id));
                if (changedIds.size > 0)
                    return this.reconcile(config.servers.get(), changedIds).catch((error) => {
                        this.ctx.logger.warn('mcp-server-manager: credential update failed (%s)', error instanceof Error ? error.name : 'unknown error');
                    });
            });
            ctx.effect(() => () => this.dispose(), 'mcp-server-manager.connections');
            this.ready = this.reconcile(config.servers.get()).catch((error) => {
                this.ctx.logger.warn('mcp-server-manager: rejected initial server settings (%s)', error instanceof Error ? error.name : 'unknown error');
            });
        }
        /** Check a draft without publishing tools or invoking a server tool.
         * @param server - Draft server settings; credential references are resolved for this call only.
         * @returns A safe result classification and discovered tool count on success.
         */
        check(server) {
            const checked = ManagedServerSchema(server);
            validateManagedServer(checked);
            const purpose = managedPurpose(checked);
            if (purpose === 'model-tools') {
                return checkManagedMcpServer(this.ctx, this.credentials, { ...checked, purpose }, this.config.checkTimeoutMs.get());
            }
            return this.consumers.get(purpose)?.check({ ...checked, purpose }) ?? Promise.resolve({ state: 'connection-failed' });
        }
        /** Tell upgrade shims whether a managed row now owns this name.
         * @param serverName - Server namespace to look up.
         * @returns Whether any persisted managed row claims the namespace.
         */
        hasServer(serverName) {
            return this.config.servers.get().some(server => server.serverName === serverName);
        }
        /** Register the host-only owner for a managed row purpose.
         * @param purpose - Row purpose owned by the consumer.
         * @param consumer - Start, dispose, and check operations for those rows.
         * @returns An asynchronous disposer that stops rows owned by this consumer.
         */
        async registerConsumer(purpose, consumer) {
            if (purpose === 'model-tools')
                throw new TypeError('mcp-server-manager: model-tools purpose is reserved');
            if (this.disposed)
                throw new Error('mcp-server-manager: cannot register a consumer after disposal');
            if (this.consumers.has(purpose))
                throw new TypeError(`mcp-server-manager: consumer for "${purpose}" is already registered`);
            this.consumers.set(purpose, consumer);
            await this.reconcile(this.config.servers.get());
            let registered = true;
            return async () => {
                if (!registered)
                    return;
                registered = false;
                if (this.consumers.get(purpose) !== consumer)
                    return;
                this.consumers.delete(purpose);
                await this.reconcile(this.config.servers.get());
            };
        }
        /** Replace or remove only the active client fibers affected by the new list.
         * @param servers - Complete next settings list.
         * @param restartIds - Optional ids to restart after a referenced credential changes.
         * @returns Completion after every changed row has been reconciled.
         */
        async reconcile(servers, restartIds = new Set()) {
            const snapshot = validateManagedServers(servers);
            const task = this.tail.then(async () => {
                if (this.disposed)
                    return;
                const nextById = new Map(snapshot.map(server => [server.id, server]));
                for (const [id, current] of this.active) {
                    const next = nextById.get(id);
                    const consumer = next === undefined || managedPurpose(next) === 'model-tools' ? undefined : this.consumers.get(managedPurpose(next));
                    if (next === undefined || !next.enabled || current.consumer !== consumer || restartIds.has(id) || fingerprint(next) !== current.fingerprint) {
                        this.active.delete(id);
                        await current.dispose();
                    }
                }
                for (const server of snapshot) {
                    if (this.disposed || !server.enabled || this.active.has(server.id))
                        continue;
                    const purpose = managedPurpose(server);
                    const consumer = purpose === 'model-tools' ? undefined : this.consumers.get(purpose);
                    if (purpose !== 'model-tools' && consumer === undefined)
                        continue;
                    try {
                        const dispose = consumer === undefined
                            ? await startManagedClient(this.ctx, this.credentials, server)
                            : await consumer.start({ ...server, purpose });
                        if (this.disposed)
                            await dispose();
                        else
                            this.active.set(server.id, { fingerprint: fingerprint(server), ...(consumer === undefined ? {} : { consumer }), dispose });
                    }
                    catch (error) {
                        this.ctx.logger.warn('mcp-server-manager: could not start server "%s" (%s)', server.serverName, error instanceof Error ? error.name : 'unknown error');
                    }
                }
            });
            this.tail = task.catch((error) => {
                this.ctx.logger.error('mcp-server-manager: server update failed (%s)', error instanceof Error ? error.name : 'unknown error');
            });
            return this.tail;
        }
        /** Stop listening for configuration changes and await all delegated clients.
         * @returns Completion after every delegated client has been disposed.
         */
        async dispose() {
            if (this.disposed)
                return;
            this.disposed = true;
            this.stopVolatile();
            this.stopCredential();
            await this.tail;
            const clients = [...this.active.values()];
            this.active.clear();
            await Promise.all(clients.map(({ dispose }) => dispose()));
        }
    };
})();
export { ManagedMcpServerManager };
/** Mount the manager and begin reconciling its initial server list.
 * @param ctx - Cordis context providing credentials and tool registration.
 * @param config - Resolved managed-server settings.
 * @returns Completion after the manager service is registered.
 */
export async function apply(ctx, config) {
    new ManagedMcpServerManager(ctx, config);
}
/** Perform one bounded initialization and discovery pass without registering tools.
 * @param ctx - Host context used for redacted diagnostics.
 * @param credentials - Provider resolving the draft's secret references.
 * @param server - Draft entry to check.
 * @param timeoutMs - Maximum duration for credential resolution, connect, and discovery.
 * @returns A safe check result; server response text and credentials are never returned.
 */
export async function checkManagedMcpServer(ctx, credentials, server, timeoutMs) {
    const checked = ManagedServerSchema(server);
    validateManagedServer(checked);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    timeout.unref();
    let client;
    let failed = false;
    try {
        const runtime = await Promise.race([
            resolveClientConfig(credentials, checked),
            new Promise((_resolve, reject) => controller.signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true })),
        ]);
        if (controller.signal.aborted)
            return { state: 'timed-out' };
        const transport = createTransport(runtime);
        client = new Client({ name: 'deepseek-harness-mcp-check', version: '0.2.1' });
        await client.connect(transport, { signal: controller.signal });
        const result = await client.listTools({}, { signal: controller.signal });
        return { state: 'ready', toolCount: result.tools.length };
    }
    catch (error) {
        failed = true;
        if (controller.signal.aborted)
            return { state: 'timed-out' };
        return { state: isAuthorizationFailure(error) ? 'authorization-required' : 'connection-failed' };
    }
    finally {
        clearTimeout(timeout);
        try {
            await client?.close();
        }
        catch (error) {
            if (!failed)
                ctx.logger.warn('mcp-server-manager: connection-check cleanup failed (%s)', error instanceof Error ? error.name : 'unknown error');
        }
    }
}
/** Validate the complete list before any connection is changed. */
function validateManagedServers(servers) {
    const ids = new Set();
    const names = new Set();
    const result = servers.map(server => ManagedServerSchema(server));
    for (const server of result) {
        if (ids.has(server.id))
            throw new TypeError('mcp-server-manager: duplicate server id "' + server.id + '"');
        if (names.has(server.serverName))
            throw new TypeError('mcp-server-manager: duplicate serverName "' + server.serverName + '"');
        ids.add(server.id);
        names.add(server.serverName);
        validateManagedServer(server);
    }
    return result;
}
/** Validate fields that cannot be expressed by the persisted server schema. */
function validateManagedServer(server) {
    if (server.transport === 'streamable-http') {
        validateHttpUrl(server.url);
        const names = new Set();
        for (const [name, value] of Object.entries(server.headers ?? {})) {
            const normalized = name.toLowerCase();
            if (!HEADER_NAME_PATTERN.test(name) || /[\r\n]/u.test(value) || INLINE_SECRET_HEADER_PATTERN.test(name)) {
                throw new TypeError('mcp-server-manager: invalid or sensitive inline HTTP header');
            }
            names.add(normalized);
        }
        for (const name of Object.keys(server.headerRefs)) {
            const normalized = name.toLowerCase();
            if (!HEADER_NAME_PATTERN.test(name) || names.has(normalized))
                throw new TypeError('mcp-server-manager: invalid or duplicate HTTP header name');
            names.add(normalized);
        }
    }
    else if (Object.keys(server.envRefs).some(key => !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key))) {
        throw new TypeError('mcp-server-manager: invalid environment variable name');
    }
}
/** Resolve secret references into the existing mcp-client configuration. */
async function resolveClientConfig(credentials, server) {
    if (server.transport === 'streamable-http') {
        const url = validateHttpUrl(server.url);
        const headers = { ...server.headers, ...await resolveSecretMap(credentials, server.headerRefs) };
        return { transport: 'streamable-http', serverName: server.serverName, url: url.href, headers, toolCallTimeoutMs: 60_000, failOnStartupError: false };
    }
    const env = await resolveSecretMap(credentials, server.envRefs);
    return { transport: 'stdio', serverName: server.serverName, command: server.command, args: [...server.args], env, cwd: server.cwd, toolCallTimeoutMs: 60_000, failOnStartupError: false };
}
/** Start one ordinary managed server and return the plugin fiber's disposer. */
async function startManagedClient(ctx, credentials, server) {
    const runtime = await resolveClientConfig(credentials, server);
    const fiber = await ctx.plugin({ name: 'mcp-server-manager:' + server.id, inject: mcpClientInject, apply: applyMcpClient }, runtime);
    return () => fiber.dispose();
}
/** Resolve every configured secret and refuse to start with a missing reference. */
async function resolveSecretMap(credentials, refs) {
    const resolved = {};
    for (const [key, ref] of Object.entries(refs)) {
        const hit = await credentials.resolve(credentialRef(ref));
        if (hit === undefined)
            throw new Error('a referenced credential is not configured');
        Object.defineProperty(resolved, key, { value: hit.value, enumerable: true, configurable: true, writable: true });
    }
    return resolved;
}
/** Return stored references without resolving their secret values. */
function secretRefs(server) {
    return server.transport === 'streamable-http' ? server.headerRefs : server.envRefs;
}
/** Enforce HTTPS or loopback HTTP and reject URL-embedded credentials. */
function validateHttpUrl(input) {
    let url;
    try {
        url = new URL(input);
    }
    catch {
        throw new TypeError('MCP endpoint must be an absolute URL');
    }
    const hostname = url.hostname.toLowerCase();
    const address = hostname.replace(/^\[|\]$/gu, '');
    const loopback = hostname === 'localhost'
        || (isIP(address) === 4 && address.startsWith('127.'))
        || address === '::1'
        || (address.startsWith('::ffff:') && isIP(address.slice(7)) === 4 && address.slice(7).startsWith('127.'));
    const privateIpv4 = isIP(address) === 4 && (address.startsWith('10.') || address.startsWith('192.168.')
        || /^172\.(?:1[6-9]|2\d|3[01])\./u.test(address));
    if (url.username !== '' || url.password !== '' || !(url.protocol === 'https:' || (url.protocol === 'http:' && (loopback || privateIpv4)))) {
        throw new TypeError('MCP endpoint must use HTTPS or HTTP on a loopback/private IPv4 address, without URL credentials');
    }
    return url;
}
/** Compare settings without exposing values in diagnostics. */
function fingerprint(server) { return JSON.stringify(server); }
/** Resolve compatibility rows whose purpose predates the managed purpose field. */
function managedPurpose(server) {
    return server.purpose ?? 'model-tools';
}
/** Detect authorization status without returning transport-provided text. */
function isAuthorizationFailure(error) {
    let candidate = error;
    for (let depth = 0; depth < 4; depth++) {
        if (typeof candidate !== 'object' || candidate === null)
            return false;
        if ('status' in candidate && (candidate.status === 401 || candidate.status === 403))
            return true;
        candidate = 'cause' in candidate ? candidate.cause : undefined;
    }
    return false;
}
//# sourceMappingURL=managed.js.map
