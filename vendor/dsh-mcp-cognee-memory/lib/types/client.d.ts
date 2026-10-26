/** Managed Cognee MCP calls; no operation is registered as a model tool. */
import { Client, type CallToolResult } from '@modelcontextprotocol/client';
import type { CredentialProvider, CredentialRef } from '@deepseek-ai/dsh-credentials';
declare const COGNEE_TOOL_NAMES: readonly ["get_guidance", "search_memory", "propose_memory"];
/** One schema-validated Cognee read operation. */
export interface CogneeRecallTool {
    /** Supported MCP operation name. */
    readonly name: 'get_guidance' | 'search_memory';
    /** String field used to send the query. */
    readonly queryField: 'task' | 'query';
}
/** Validated fields needed to submit a human-reviewed proposal. */
export interface CogneeProposalTool {
    /** MCP tool that accepts the proposal. */
    readonly name: 'propose_memory';
    /** String field containing the summary. */
    readonly contentField: 'content' | 'text';
    /** String field containing the supported category. */
    readonly categoryField: 'category';
    /** Category accepted by the server schema. */
    readonly categoryValue: 'adaptive_strategy' | 'decision_principle' | 'collaboration_practice' | 'experience';
    /** String field containing `private` or `global`. */
    readonly scopeField: 'target_scope';
    /** String attribution field. */
    readonly sourceField: 'source' | 'source_description';
    /** Optional reason field. */
    readonly reasonField?: 'reason';
}
/** A managed MCP tool description, narrowed at the wire boundary. */
interface ToolDescription {
    readonly name: string;
    readonly inputSchema: unknown;
}
/** Return the schema-compatible preferred recall tool.
 * @param tools - MCP tool descriptors from the managed Cognee connection.
 * @returns A validated allow-listed recall tool, when available.
 */
export declare function resolveCogneeRecallTool(tools: readonly ToolDescription[]): CogneeRecallTool | undefined;
/** Return proposal fields only when the server schema accepts both destinations.
 * @param tools - MCP tool descriptors from the managed Cognee connection.
 * @returns Validated proposal fields, or `undefined` when incompatible.
 */
export declare function resolveCogneeProposalTool(tools: readonly ToolDescription[]): CogneeProposalTool | undefined;
/** Validate and normalize an MCP endpoint under the Cognee network policy.
 * @param raw - User-configured MCP URL.
 * @returns A normalized HTTPS or loopback HTTP URL.
 */
export declare function validateCogneeEndpoint(raw: string): URL;
/** Restrict proposal writes to the two human-reviewed destinations.
 * @param destination - Requested review destination.
 * @returns The validated destination.
 */
export declare function validateCogneeDestination(destination: string): 'private' | 'global';
/** Redact secrets and paths, then fit the complete untrusted-context frame within its UTF-8 byte budget.
 * @param raw - Untrusted recall result.
 * @returns Bounded, framed context for the model history.
 */
export declare function cogneeRecallText(raw: string): string;
/** Bound and redact the user request sent to a Cognee read tool.
 * @param raw - User request text.
 * @returns Safe query text within the UTF-8 byte limit.
 */
export declare function cogneeQuery(raw: string): string;
/** Build the only content value sent to a Cognee proposal tool.
 * @param raw - Completed-task summary.
 * @returns Redacted, bounded proposal content.
 */
export declare function cogneeProposalSummary(raw: string): string;
/** One operation-scoped authenticated SDK client.
 * @param options - Endpoint, credential owner, cancellation, and operation.
 * @returns The managed operation's result.
 */
export declare function withCogneeClient<T>(options: {
    endpoint: string;
    credentialRef: CredentialRef;
    credentials: CredentialProvider;
    signal: AbortSignal;
    operation: (client: Client) => Promise<T>;
}): Promise<T>;
/** Structured failure states consumed by the readiness service. */
export declare class CogneeClientError extends Error {
    /** Stable failure state for UI status projection. */
    readonly state: 'authorization-required' | 'connection-failed' | 'incompatible-tools';
    /**
     * @param state - stable handling category.
     * @param message - safe diagnostic without endpoint secrets.
     * @param cause - underlying SDK failure when available.
     */
    constructor(state: CogneeClientError['state'], message: string, options?: {
        cause?: unknown;
    });
}
/** Read only the managed operation's SDK tool list.
 * @param client - Connected Cognee MCP client.
 * @param signal - Cancellation signal for tool discovery.
 * @returns The server tool descriptions.
 */
export declare function listCogneeTools(client: Client, signal: AbortSignal): Promise<readonly ToolDescription[]>;
/** Reject any server operation outside the fixed Cognee allow-list.
 * @param name - Tool name about to be invoked.
 * @returns Nothing; narrows the name on success.
 */
export declare function assertCogneeToolAllowed(name: string): asserts name is typeof COGNEE_TOOL_NAMES[number];
/** Map HTTP authorization failures to an actionable, stable state.
 * @param error - Transport, SDK, or protocol failure.
 * @returns A stable failure for UI and lifecycle handling.
 */
export declare function normalizeClientError(error: unknown): CogneeClientError;
/** Narrow a transport result to a text-only recall value.
 * @param result - Tool result returned by the MCP SDK.
 * @returns Joined plain text or the supported structured string.
 */
export declare function cogneeResultText(result: CallToolResult): string;
export {};
//# sourceMappingURL=client.d.ts.map