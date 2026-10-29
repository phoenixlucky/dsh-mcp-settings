/** Host manager for configurable Streamable HTTP and stdio MCP servers. */
import { Context } from '@deepseek-ai/cordis';
import type { Volatile } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { CredentialProvider } from '@deepseek-ai/dsh-credentials';
import z from '@deepseek-ai/schemastery';
import type { ManagedMcpCheck, ManagedMcpPurpose, ManagedMcpServer } from './types.ts';
/** Host-local lifecycle supplied by a managed row's non-model consumer. */
export interface ManagedMcpConsumer {
    /** Start one validated row and return its asynchronous disposer. */
    start(server: ManagedMcpServer): Promise<() => Promise<void>>;
    /** Check one draft without publishing tools. */
    check(server: ManagedMcpServer): Promise<ManagedMcpCheck>;
}
/** Config for the host manager's persisted server list. */
export interface ManagedConfig {
    /** Volatile settings list edited by the MCP settings page. */
    servers: Volatile<ManagedMcpServer[]>;
    /** Maximum duration of a temporary check, in milliseconds. */
    checkTimeoutMs: Volatile<number>;
}
type ManagedConfigInput = Partial<{
    servers: ManagedMcpServer[];
    checkTimeoutMs: number;
}>;
/** Settings schema for a general managed MCP server manager. */
export declare const Config: z<ManagedConfigInput, ManagedConfig>;
/** Cordis entry name. */
export declare const name = "mcp-server-manager";
/** Services used to resolve secret references and start delegated MCP clients. */
export declare const inject: string[];
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Manage multiple configured MCP servers and check unsaved server drafts. */
        mcpServerManager: ManagedMcpServerManager;
    }
}
/** Host service for server-list reconciliation and isolated connection checks. */
export declare class ManagedMcpServerManager extends TypertRemoteService {
    static inject: string[];
    static Config: z<Partial<{
        servers: ManagedMcpServer[];
        checkTimeoutMs: number;
    }>, ManagedConfig>;
    private readonly config;
    private readonly credentials;
    private readonly active;
    private readonly consumers;
    private tail;
    private disposed;
    private readonly stopVolatile;
    private readonly stopCredential;
    /** Completes after the initial server list has been scheduled and reconciled. */
    readonly ready: Promise<void>;
    /** @param ctx - Host with credentials and MCP tool services. @param config - Managed-server settings. */
    constructor(ctx: Context, config: ManagedConfig);
    /** Check a draft without publishing tools or invoking a server tool.
     * @param server - Draft server settings; credential references are resolved for this call only.
     * @returns A safe result classification and discovered tool count on success.
     */
    check(server: ManagedMcpServer): Promise<ManagedMcpCheck>;
    /** Tell upgrade shims whether a managed row now owns this name.
     * @param serverName - Server namespace to look up.
     * @returns Whether any persisted managed row claims the namespace.
     */
    hasServer(serverName: string): boolean;
    /** Register the host-only owner for a managed row purpose.
     * @param purpose - Row purpose owned by the consumer.
     * @param consumer - Start, dispose, and check operations for those rows.
     * @returns An asynchronous disposer that stops rows owned by this consumer.
     */
    registerConsumer(purpose: ManagedMcpPurpose, consumer: ManagedMcpConsumer): Promise<() => Promise<void>>;
    /** Replace or remove only the active client fibers affected by the new list.
     * @param servers - Complete next settings list.
     * @param restartIds - Optional ids to restart after a referenced credential changes.
     * @returns Completion after every changed row has been reconciled.
     */
    private reconcile;
    /** Stop listening for configuration changes and await all delegated clients.
     * @returns Completion after every delegated client has been disposed.
     */
    dispose(): Promise<void>;
}
/** Mount the manager and begin reconciling its initial server list.
 * @param ctx - Cordis context providing credentials and tool registration.
 * @param config - Resolved managed-server settings.
 * @returns Completion after the manager service is registered.
 */
export declare function apply(ctx: Context, config: ManagedConfig): Promise<void>;
/** Perform one bounded initialization and discovery pass without registering tools.
 * @param ctx - Host context used for redacted diagnostics.
 * @param credentials - Provider resolving the draft's secret references.
 * @param server - Draft entry to check.
 * @param timeoutMs - Maximum duration for credential resolution, connect, and discovery.
 * @returns A safe check result; server response text and credentials are never returned.
 */
export declare function checkManagedMcpServer(ctx: Context, credentials: CredentialProvider, server: ManagedMcpServer, timeoutMs: number): Promise<ManagedMcpCheck>;
export {};
//# sourceMappingURL=managed.d.ts.map