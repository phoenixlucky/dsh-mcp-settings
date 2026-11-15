/** Safe live status for configured MCP client connections. */
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { McpServerStatus } from './types.ts';
import type { ToolExecution } from '@deepseek-ai/dsh-tools';

export type ManagedMcpResourceRequest = { method: 'resources/list' | 'resources/templates/list'; cursor?: string }
  | { method: 'resources/read'; uri: string }
export interface ManagedMcpResourceProvider {
    request(request: ManagedMcpResourceRequest, execution: ToolExecution): Promise<unknown>
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        mcpClientStatus: McpClientStatusCatalog;
    }
}
/** Root catalog shared by every configured mcp-client instance. */
export declare class McpClientStatusCatalog extends TypertRemoteService {
    static inject: string[];
    private readonly rows;
    private nextId;
    constructor(ctx: Context);
    /** Return live connection summaries with credentials and command arguments omitted.
     * @returns The current server status rows.
     */
    list(): readonly McpServerStatus[];
    /**
     * Add one server row and return its update and teardown functions.
     * @param input - Credential-safe connection details for the server.
     * @returns Functions that update or remove the registered row.
     */
    register(input: Omit<McpServerStatus, 'id'>, managedServerId?: string): {
        update(patch: Pick<McpServerStatus, 'state' | 'toolCount' | 'tools'>): void;
        setResourceProvider(provider: ManagedMcpResourceProvider | undefined): void;
        dispose(): void;
    };
    /** Resolve an id-scoped resource provider only while the exact connection is connected. */
    getManagedResourceHandle(managedServerId: string): { provider: ManagedMcpResourceProvider; revision: number; state: string } | undefined;
}
export default McpClientStatusCatalog;
//# sourceMappingURL=status.d.ts.map
