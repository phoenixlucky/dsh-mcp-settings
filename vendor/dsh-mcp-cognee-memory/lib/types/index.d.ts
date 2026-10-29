/** Optional Cognee MCP access for task-scoped recall and reviewed proposals. */
import { Context, Service } from '@deepseek-ai/cordis';
import type { Volatile } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { CogneeStatus } from './types.ts';
import z from '@deepseek-ai/schemastery';
export type { CogneeClientError } from './client.ts';
export type { CogneeStatus } from './types.ts';
export { cogneeMemoryProjection, installCogneeMemoryLifecycle } from './lifecycle.ts';
/** One project-memory proposal sent for human review. */
export interface CogneeProposal {
    /** Human-reviewed storage destination. */
    readonly destination: 'private' | 'global';
    /** A short redacted outcome summary; never transcript or tool chatter. */
    readonly summary: string;
}
/** Task-lifecycle interface; proposal writes stay outside the model tool registry. */
export interface CogneeMemoryRuntime {
    /** Inspect connectivity, authorization, and managed tool compatibility. */
    status(signal: AbortSignal): Promise<CogneeStatus>;
    /** Search for one bounded, untrusted evidence context. */
    recall(query: string, signal: AbortSignal): Promise<string>;
    /** Submit one bounded summary for human review. */
    propose(destination: 'private' | 'global', summary: string, signal: AbortSignal): Promise<void>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Managed Cognee calls; no Cognee operation is exposed as a model tool. */
        cogneeMemory: CogneeMemoryService;
    }
}
/** Optional Cognee endpoint and credential reference. */
interface Config {
    /** Whether task lifecycle operations may use Cognee. */
    enabled: Volatile<boolean>;
    /** HTTPS or loopback HTTP MCP endpoint. */
    endpoint: Volatile<string>;
    /** Environment-style reference resolved through `ctx.credentials`. */
    credentialRef: Volatile<string>;
    /** Deadline for handshake, discovery, and each tool operation. */
    requestTimeoutMs: Volatile<number>;
}
/** Host service that owns the Cognee connection and allow-listed MCP calls. */
export declare class CogneeMemoryService extends TypertRemoteService implements CogneeMemoryRuntime {
    static inject: string[];
    static Config: z<Partial<{
        enabled: boolean;
        endpoint: string;
        credentialRef: string;
        requestTimeoutMs: number;
    }>, Config>;
    private readonly config;
    private managedServer;
    private managedOwnsMemory;
    private unregisterConsumer;
    private managedStatus;
    /** @param ctx - Host with the credential provider. @param config - endpoint and readiness policy. */
    constructor(ctx: Context, config: Config);
    protected [Service.init](): Promise<void>;
    /**
     * Inspect connectivity, authorization, and managed tool compatibility.
     *
     * @param signal - Cancellation signal for the bounded connection probe.
     * @returns The current closed readiness state.
     */
    status(signal: AbortSignal): Promise<CogneeStatus>;
    /**
     * Search for one bounded, untrusted evidence context.
     *
     * @param query - Redacted and bounded task query.
     * @param signal - Cancellation signal for discovery and retrieval.
     * @returns A bounded, source-attributed recall text.
     */
    recall(query: string, signal: AbortSignal): Promise<string>;
    /**
     * Submit one bounded summary for human review, with no automatic retry.
     *
     * @param destination - The private or global review queue.
     * @param summary - Redacted completed-task summary.
     * @param signal - Cancellation signal for the submission.
     */
    propose(destination: 'private' | 'global', summary: string, signal: AbortSignal): Promise<void>;
    /** Reject operations while the opt-in setting or endpoint is absent. */
    private assertEnabled;
    private snapshotConfig;
    private startManagedServer;
    private checkManagedServer;
    /** Bound one MCP connection and its requests, then clear the operation timer. */
    private withDeadline;
}
export default CogneeMemoryService;
//# sourceMappingURL=index.d.ts.map