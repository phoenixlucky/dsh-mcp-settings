/** Optional Cognee MCP access for task-scoped recall and reviewed proposals. */
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
import { Service } from '@deepseek-ai/cordis';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { credentialRef } from '@deepseek-ai/dsh-credentials';
import { installCogneeMemoryLifecycle } from "./lifecycle.js";
import { CogneeClientError as CogneeError, assertCogneeToolAllowed, cogneeProposalSummary, cogneeQuery, cogneeRecallText, cogneeResultText, listCogneeTools, normalizeClientError, resolveCogneeProposalTool, resolveCogneeRecallTool, validateCogneeDestination, withCogneeClient, } from "./client.js";
export { cogneeMemoryProjection, installCogneeMemoryLifecycle } from "./lifecycle.js";
const DEFAULT_CREDENTIAL_REF = 'DSH_COGNEE_MCP_TOKEN';
const ConfigSchema = z.object({
    enabled: z.boolean().default(false).volatile(),
    endpoint: z.string().default('').volatile(),
    credentialRef: z.string().pattern(/^[A-Za-z_][A-Za-z0-9_]*$/).default(DEFAULT_CREDENTIAL_REF).volatile(),
    requestTimeoutMs: z.number().step(1).min(1).max(120_000).default(15_000).volatile(),
});
/** Host service that owns the Cognee connection and allow-listed MCP calls. */
let CogneeMemoryService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _status_decorators;
    return class CogneeMemoryService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _status_decorators = [Remote];
            __esDecorate(this, null, _status_decorators, { kind: "method", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['credentials', 'sessionProjections', 'fs'];
        static Config = ConfigSchema;
        config = __runInitializers(this, _instanceExtraInitializers);
        /** @param ctx - Host with the credential provider. @param config - endpoint and readiness policy. */
        constructor(ctx, config) {
            super(ctx, 'cogneeMemory', { namespace: 'cognee' });
            this.config = config;
        }
        async [Service.init]() {
            await installCogneeMemoryLifecycle(this.ctx, this);
        }
        /**
         * Inspect connectivity, authorization, and managed tool compatibility.
         *
         * @param signal - Cancellation signal for the bounded connection probe.
         * @returns The current closed readiness state.
         */
        async status(signal) {
            const options = this.snapshotConfig();
            if (!options.enabled)
                return status('disabled');
            if (options.endpoint === '')
                return status('not-configured');
            try {
                return await this.withDeadline(signal, async (deadline) => withCogneeClient({
                    endpoint: options.endpoint,
                    credentialRef: options.credential,
                    credentials: this.ctx.credentials,
                    signal: deadline,
                    operation: async (client) => {
                        const tools = await listCogneeTools(client, deadline);
                        if (resolveCogneeRecallTool(tools) === undefined || resolveCogneeProposalTool(tools) === undefined) {
                            return status('incompatible-tools');
                        }
                        return status('ready');
                    },
                }));
            }
            catch (error) {
                if (signal.aborted)
                    throw signal.reason;
                const failure = normalizeClientError(error);
                return status(failure.state);
            }
        }
        /**
         * Search for one bounded, untrusted evidence context.
         *
         * @param query - Redacted and bounded task query.
         * @param signal - Cancellation signal for discovery and retrieval.
         * @returns A bounded, source-attributed recall text.
         */
        async recall(query, signal) {
            this.assertEnabled();
            const options = this.snapshotConfig();
            const boundedQuery = cogneeQuery(query);
            if (boundedQuery === '')
                throw new CogneeError('incompatible-tools', 'Cognee recall query is empty after redaction');
            return this.withDeadline(signal, deadline => withCogneeClient({
                endpoint: options.endpoint,
                credentialRef: options.credential,
                credentials: this.ctx.credentials,
                signal: deadline,
                operation: async (client) => {
                    const tools = await listCogneeTools(client, deadline);
                    const recallTool = resolveCogneeRecallTool(tools);
                    if (recallTool === undefined)
                        throw new CogneeError('incompatible-tools', 'Cognee has no compatible recall tool');
                    assertCogneeToolAllowed(recallTool.name);
                    const result = await client.callTool({
                        name: recallTool.name,
                        arguments: { [recallTool.queryField]: boundedQuery },
                    }, { signal: deadline });
                    return cogneeRecallText(cogneeResultText(result));
                },
            }));
        }
        /**
         * Submit one bounded summary for human review, with no automatic retry.
         *
         * @param destination - The private or global review queue.
         * @param summary - Redacted completed-task summary.
         * @param signal - Cancellation signal for the submission.
         */
        async propose(destination, summary, signal) {
            this.assertEnabled();
            const scope = validateCogneeDestination(destination);
            const options = this.snapshotConfig();
            const boundedSummary = cogneeProposalSummary(summary);
            if (boundedSummary === '')
                throw new CogneeError('incompatible-tools', 'Cognee proposal summary is empty after redaction');
            await this.withDeadline(signal, deadline => withCogneeClient({
                endpoint: options.endpoint,
                credentialRef: options.credential,
                credentials: this.ctx.credentials,
                signal: deadline,
                operation: async (client) => {
                    const tools = await listCogneeTools(client, deadline);
                    const proposalTool = resolveCogneeProposalTool(tools);
                    if (proposalTool === undefined)
                        throw new CogneeError('incompatible-tools', 'Cognee proposal tool is unavailable or incompatible');
                    assertCogneeToolAllowed(proposalTool.name);
                    await callCogneeProposal(client, proposalTool, scope, boundedSummary, deadline);
                },
            }));
        }
        /** Reject operations while the opt-in setting or endpoint is absent. */
        assertEnabled() {
            const options = this.snapshotConfig();
            if (!options.enabled)
                throw new CogneeError('connection-failed', 'Cognee memory is disabled');
            if (options.endpoint === '')
                throw new CogneeError('connection-failed', 'Cognee endpoint is not configured');
        }
        snapshotConfig() {
            return {
                enabled: this.config.enabled.get(),
                endpoint: this.config.endpoint.get().trim(),
                credential: credentialRef(this.config.credentialRef.get()),
            };
        }
        /** Bound one MCP connection and its requests, then clear the operation timer. */
        async withDeadline(signal, operation) {
            if (signal.aborted)
                throw signal.reason;
            const controller = new AbortController();
            const relayAbort = () => { controller.abort(signal.reason); };
            signal.addEventListener('abort', relayAbort, { once: true });
            const timeout = setTimeout(() => { controller.abort(new Error('Cognee request timed out')); }, this.config.requestTimeoutMs.get());
            timeout.unref();
            try {
                return await operation(controller.signal);
            }
            finally {
                clearTimeout(timeout);
                signal.removeEventListener('abort', relayAbort);
            }
        }
    };
})();
export { CogneeMemoryService };
/** Return a status with its translation key. */
function status(state) {
    return { state, messageKey: `cognee.status.${state}` };
}
/** Send the schema-selected proposal fields and reject server-side error results. */
async function callCogneeProposal(client, tool, destination, summary, signal) {
    assertCogneeToolAllowed(tool.name);
    const result = await client.callTool({
        name: tool.name,
        arguments: {
            [tool.contentField]: summary,
            [tool.categoryField]: tool.categoryValue,
            [tool.scopeField]: destination,
            [tool.sourceField]: 'DeepSeek Harness task outcome',
            ...(tool.reasonField === undefined ? {} : { [tool.reasonField]: 'Private, human-reviewed proposal' }),
        },
    }, { signal });
    if (result.isError)
        throw new CogneeError('connection-failed', 'Cognee did not confirm proposal submission');
}
export default CogneeMemoryService;
//# sourceMappingURL=index.js.map