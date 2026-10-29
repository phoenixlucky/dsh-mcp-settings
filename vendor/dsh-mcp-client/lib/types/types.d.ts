/** Display state for a configured MCP connection. */
export type McpConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
/** Selects whether a managed MCP row publishes model tools or serves project memory. */
export type ManagedMcpPurpose = 'model-tools' | 'project-memory';
/** Credential-safe information displayed on an MCP server card. */
export interface McpServerStatus {
    readonly id: string;
    readonly serverName: string;
    readonly transport: 'stdio' | 'streamable-http';
    readonly source: string;
    readonly state: McpConnectionState;
    readonly toolCount: number;
}
/** Streamable HTTP server settings; secret header values remain in credentials. */
export interface ManagedHttpServer {
    /** Stable settings identity. */
    id: string;
    /** Unique namespace for this server's model-facing tools. */
    serverName: string;
    /** Whether the server should be connected. */
    enabled: boolean;
    /** Consumer that owns this server connection. */
    purpose?: ManagedMcpPurpose;
    /** Selects Streamable HTTP transport. */
    transport: 'streamable-http';
    /** MCP endpoint. */
    url: string;
    /** Non-secret request headers. Authentication headers belong in `headerRefs`. */
    headers?: Record<string, string>;
    /** Header names mapped to credential references. */
    headerRefs: Record<string, string>;
}
/** Local stdio server settings; secret environment values remain in credentials. */
export interface ManagedStdioServer {
    /** Stable settings identity. */
    id: string;
    /** Unique namespace for this server's model-facing tools. */
    serverName: string;
    /** Whether the server should be connected. */
    enabled: boolean;
    /** Consumer that owns this server connection. */
    purpose?: ManagedMcpPurpose;
    /** Selects stdio transport. */
    transport: 'stdio';
    /** Executable started directly. */
    command: string;
    /** Arguments passed directly. */
    args: readonly string[];
    /** Child working directory. */
    cwd: string;
    /** Environment names mapped to credential references. */
    envRefs: Record<string, string>;
}
/** One persisted server entry in the managed MCP settings. */
export type ManagedMcpServer = ManagedHttpServer | ManagedStdioServer;
/** Client-safe result of a temporary MCP connection check. */
export type ManagedMcpCheck = {
    state: 'authorization-required';
} | {
    state: 'connection-failed';
} | {
    state: 'timed-out';
} | {
    state: 'ready';
    toolCount: number;
};
/** Client-safe readiness result for the managed Chrome MCP endpoint. */
export type ChromeConnectionCheck = {
    state: 'not-configured' | 'disabled' | 'authorization-required' | 'connection-failed' | 'timed-out' | 'ready';
    /** Discovered tools when the endpoint is ready. */
    toolCount?: number;
};
//# sourceMappingURL=types.d.ts.map