/** Managed Chrome MCP entry point using the packaged HTTP-to-stdio bridge. */
import { Context } from '@deepseek-ai/cordis';
import type { Volatile } from '@deepseek-ai/cordis';
import type { CredentialProvider } from '@deepseek-ai/dsh-credentials';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import type { StdioConfig } from './index.ts';
import type { ChromeConnectionCheck } from './types.ts';
/** Stable credential reference used by the Chrome bridge. */
export declare const CHROME_CREDENTIAL_REF = "DSH_CHROME_MCP_TOKEN";
/** Volatile connection settings owned by the `mcp-chrome` entry. */
export interface ChromeConfig {
    /** Whether to start the Chrome MCP connection. */
    enabled: Volatile<boolean>;
    /** HTTPS or loopback HTTP Streamable HTTP endpoint. */
    url: Volatile<string>;
    /** Credential reference resolved only when starting the bridge. */
    credentialRef: Volatile<string>;
    /** Resolved path to the installed stdio bridge entry point. */
    bridgePath: string;
    /** Deadline for the connection and tool-discovery check. */
    requestTimeoutMs: Volatile<number>;
}
type ChromeConfigInput = Partial<{
    enabled: boolean;
    url: string;
    credentialRef: string;
    bridgePath: string;
    requestTimeoutMs: number;
}>;
/** Settings schema for the managed Chrome MCP entry. */
export declare const Config: z<ChromeConfigInput, ChromeConfig>;
/** User-facing Cordis plugin name. */
export declare const name = "mcp-chrome";
/** Services required to start the delegated MCP client. */
export declare const inject: string[];
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Bounded connection check for the managed Chrome MCP endpoint. */
        chromeMcp: ChromeMcpService;
    }
}
/** Host service that owns the Chrome bridge and exposes a bounded readiness check. */
export declare class ChromeMcpService extends TypertRemoteService {
    static inject: string[];
    static Config: z<Partial<{
        enabled: boolean;
        url: string;
        credentialRef: string;
        bridgePath: string;
        requestTimeoutMs: number;
    }>, ChromeConfig>;
    private readonly config;
    /** @param ctx - Host with credentials and MCP tools. @param config - Managed endpoint settings. */
    constructor(ctx: Context, config: ChromeConfig);
    /**
     * Check endpoint authorization and list tools without running server tools.
     * @returns A client-safe connection state; the response never contains endpoint or credential values.
     */
    checkChromeConnection(): Promise<ChromeConnectionCheck>;
}
/** Check a Chrome endpoint without invoking tools or returning server-supplied text.
 * @param ctx - Host containing the credential provider and logger.
 * @param config - Managed Chrome endpoint settings.
 * @returns A bounded check result, including the discovered tool count when ready.
 */
export declare function checkChromeConnection(ctx: Context, config: ChromeConfig): Promise<ChromeConnectionCheck>;
interface ChromeController {
    /** Start the connection and subscribe to endpoint, enablement, and token changes. */
    start(): Promise<void>;
    /** Stop event subscriptions and dispose the delegated MCP client. */
    dispose(): Promise<void>;
}
/** Create the bridge's stdio configuration after validating its HTTP endpoint.
 * @param endpoint - HTTPS or loopback HTTP MCP endpoint.
 * @param token - Resolved bearer token, if one is stored.
 * @param bridgePath - Installed bridge executable path.
 * @returns The generic MCP client's stdio settings.
 */
export declare function createChromeClientConfig(endpoint: string, token: string | undefined, bridgePath: string): StdioConfig;
/** Build the single Chrome connection controller used by the managed entry.
 * @param ctx - Owner context for config and credential events and safe diagnostics.
 * @param config - Managed Chrome endpoint and credential settings.
 * @param credentials - Provider that resolves the Chrome token for each child start.
 * @param startClient - Starts the generic MCP client and returns its disposer.
 * @returns The managed connection's start and disposal controls.
 */
export declare function createChromeConnectionController(ctx: Context, config: ChromeConfig, credentials: CredentialProvider, startClient: (clientConfig: StdioConfig) => Promise<() => Promise<void>>, hasManagedServer?: () => boolean | Promise<boolean>): ChromeController;
/** Classify authorization failures while keeping endpoint and response text private.
 * @param error - Error reported by the MCP transport.
 * @returns The client-safe state category.
 */
export declare function classifyChromeConnectionError(error: unknown): ChromeConnectionCheck['state'];
export default ChromeMcpService;
//# sourceMappingURL=chrome.d.ts.map