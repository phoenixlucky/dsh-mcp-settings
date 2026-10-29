/** Managed Chrome MCP entry point using the packaged HTTP-to-stdio bridge. */
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
import { createTransport } from "./transport.js";
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { apply as applyMcpClient, inject as mcpClientInject } from "./index.js";
/** Stable credential reference used by the Chrome bridge. */
export const CHROME_CREDENTIAL_REF = 'DSH_CHROME_MCP_TOKEN';
/** Settings schema for the managed Chrome MCP entry. */
export const Config = z.object({
    enabled: z.boolean().default(false).volatile(),
    url: z.string().default('').volatile(),
    credentialRef: z.string().pattern(/^[A-Za-z_][A-Za-z0-9_]*$/).default(CHROME_CREDENTIAL_REF).volatile(),
    bridgePath: z.string().default('@deepseek-ai/dsh-chrome-bridge/bridge'),
    requestTimeoutMs: z.number().step(1).min(1).max(120_000).default(10_000).volatile(),
});
/** User-facing Cordis plugin name. */
export const name = 'mcp-chrome';
/** Services required to start the delegated MCP client. */
export const inject = ['credentials', ...mcpClientInject];
/** Host service that owns the Chrome bridge and exposes a bounded readiness check. */
let ChromeMcpService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _checkChromeConnection_decorators;
    return class ChromeMcpService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _checkChromeConnection_decorators = [Remote];
            __esDecorate(this, null, _checkChromeConnection_decorators, { kind: "method", name: "checkChromeConnection", static: false, private: false, access: { has: obj => "checkChromeConnection" in obj, get: obj => obj.checkChromeConnection }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['credentials', 'tools', 'mcpServerManager'];
        static Config = Config;
        config = __runInitializers(this, _instanceExtraInitializers);
        /** @param ctx - Host with credentials and MCP tools. @param config - Managed endpoint settings. */
        constructor(ctx, config) {
            super(ctx, 'chromeMcp', { namespace: 'chromeMcp' });
            this.config = config;
            const controller = createChromeConnectionController(ctx, config, ctx.credentials, async (clientConfig) => {
                const fiber = await ctx.plugin({ name: 'mcp-chrome.client', inject: mcpClientInject, apply: applyMcpClient }, clientConfig);
                return async () => { await fiber.dispose(); };
            }, () => ctx.mcpServerManager.hasServer('chrome'));
            ctx.effect(() => controller.dispose, 'mcp-chrome.connection');
            void controller.start();
        }
        /**
         * Check endpoint authorization and list tools without running server tools.
         * @returns A client-safe connection state; the response never contains endpoint or credential values.
         */
        async checkChromeConnection() {
            return checkChromeConnection(this.ctx, this.config);
        }
    };
})();
export { ChromeMcpService };
/** Check a Chrome endpoint without invoking tools or returning server-supplied text.
 * @param ctx - Host containing the credential provider and logger.
 * @param config - Managed Chrome endpoint settings.
 * @returns A bounded check result, including the discovered tool count when ready.
 */
export async function checkChromeConnection(ctx, config) {
    if (!config.enabled.get())
        return { state: 'disabled' };
    const endpoint = config.url.get().trim();
    if (endpoint === '')
        return { state: 'not-configured' };
    const ref = credentialRef(config.credentialRef.get());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error('Chrome MCP check timed out')), config.requestTimeoutMs.get());
    timeout.unref();
    let client;
    let failed = false;
    try {
        const credential = await Promise.race([
            ctx.credentials.resolve(ref),
            new Promise((_resolve, reject) => controller.signal.addEventListener('abort', () => reject(controller.signal.reason), { once: true })),
        ]);
        if (controller.signal.aborted)
            return { state: 'timed-out' };
        const transport = createTransport(createChromeClientConfig(endpoint, credential?.value, config.bridgePath));
        client = new Client({ name: 'deepseek-harness-chrome-check', version: '0.2.1' });
        await client.connect(transport, { signal: controller.signal });
        const tools = await client.listTools({}, { signal: controller.signal });
        return { state: 'ready', toolCount: tools.tools.length };
    }
    catch (error) {
        failed = true;
        if (controller.signal.aborted)
            return { state: 'timed-out' };
        return { state: classifyChromeConnectionError(error) };
    }
    finally {
        clearTimeout(timeout);
        try {
            await client?.close();
        }
        catch (error) {
            if (!failed)
                ctx.logger.warn('mcp-chrome: connection check cleanup failed (%s)', error instanceof Error ? error.name : 'unknown error');
        }
    }
}
/** Create the bridge's stdio configuration after validating its HTTP endpoint.
 * @param endpoint - HTTPS or loopback HTTP MCP endpoint.
 * @param token - Resolved bearer token, if one is stored.
 * @param bridgePath - Installed bridge executable path.
 * @returns The generic MCP client's stdio settings.
 */
export function createChromeClientConfig(endpoint, token, bridgePath) {
    let url;
    try {
        url = new URL(endpoint);
    }
    catch {
        throw new TypeError('Chrome MCP endpoint must be an absolute URL');
    }
    const loopback = url.hostname === 'localhost' || (isIP(url.hostname.replace(/^\[|\]$/gu, '')) === 4
        && url.hostname.startsWith('127.')) || url.hostname === '[::1]';
    if (url.username !== '' || url.password !== '' || !(url.protocol === 'https:' || (url.protocol === 'http:' && loopback))) {
        throw new TypeError('Chrome MCP endpoint must use HTTPS or HTTP on a loopback address, without URL credentials');
    }
    if (bridgePath.trim() === '')
        throw new TypeError('Chrome MCP bridge path must not be empty');
    return {
        transport: 'stdio',
        serverName: 'chrome',
        command: process.execPath,
        args: [bridgePath],
        env: {
            DSH_CHROME_MCP_URL: url.href,
            DSH_CHROME_MCP_ORIGIN: `${url.protocol}//${url.hostname}`,
            ...(token === undefined ? {} : { DSH_CHROME_MCP_TOKEN: token }),
        },
        cwd: '',
        toolCallTimeoutMs: 60_000,
        failOnStartupError: false,
    };
}
/** Build the single Chrome connection controller used by the managed entry.
 * @param ctx - Owner context for config and credential events and safe diagnostics.
 * @param config - Managed Chrome endpoint and credential settings.
 * @param credentials - Provider that resolves the Chrome token for each child start.
 * @param startClient - Starts the generic MCP client and returns its disposer.
 * @returns The managed connection's start and disposal controls.
 */
export function createChromeConnectionController(ctx, config, credentials, startClient, hasManagedServer = () => false) {
    let currentDispose;
    let tail = Promise.resolve();
    let disposed = false;
    const enqueue = () => {
        const task = tail.then(async () => {
            const dispose = currentDispose;
            currentDispose = undefined;
            if (dispose !== undefined)
                await dispose();
            if (disposed || await hasManagedServer() || !config.enabled.get() || config.url.get().trim() === '')
                return;
            const endpoint = config.url.get().trim();
            const ref = credentialRef(config.credentialRef.get());
            const secret = await credentials.resolve(ref);
            const nextDispose = await startClient(createChromeClientConfig(endpoint, secret?.value, config.bridgePath));
            if (disposed)
                await nextDispose();
            else
                currentDispose = nextDispose;
        });
        tail = task.catch((error) => {
            ctx.logger.error('mcp-chrome: connection update failed (%s)', error instanceof Error ? error.name : 'unknown error');
        });
        return tail;
    };
    const stopConfig = ctx.on('loader/volatile-update', (paths) => {
        if (paths.some(([field]) => field === 'enabled' || field === 'url' || field === 'credentialRef' || field === 'servers'))
            return enqueue();
    });
    const stopCredential = ctx.on('credentials/reference-updated', (ref) => {
        if (ref === credentialRef(config.credentialRef.get()))
            return enqueue();
    });
    return {
        start: enqueue,
        async dispose() {
            disposed = true;
            stopConfig();
            stopCredential();
            await tail;
            const dispose = currentDispose;
            currentDispose = undefined;
            await dispose?.();
        },
    };
}
/** Classify authorization failures while keeping endpoint and response text private.
 * @param error - Error reported by the MCP transport.
 * @returns The client-safe state category.
 */
export function classifyChromeConnectionError(error) {
    let candidate = error;
    for (let depth = 0; depth < 3; depth++) {
        if (typeof candidate !== 'object' || candidate === null)
            break;
        if ('status' in candidate && (candidate.status === 401 || candidate.status === 403))
            return 'authorization-required';
        candidate = 'cause' in candidate ? candidate.cause : undefined;
    }
    return 'connection-failed';
}
export default ChromeMcpService;
//# sourceMappingURL=chrome.js.map