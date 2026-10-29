/** Safe live status for configured MCP client connections. */
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { McpServerStatus } from './types.ts';
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
    register(input: Omit<McpServerStatus, 'id'>): {
        update(patch: Pick<McpServerStatus, 'state' | 'toolCount'>): void;
        dispose(): void;
    };
}
export default McpClientStatusCatalog;
//# sourceMappingURL=status.d.ts.map