/** User presentation preferences keyed by the stable MCP server name. */
export interface McpCardAppearance {
    displayName?: string;
    description?: string;
    icon?: string;
    showConnectionStatus?: boolean;
    showToolCount?: boolean;
    showTransport?: boolean;
    showSource?: boolean;
}
/** Preferences indexed by stable MCP server identity. */
export type McpCardAppearanceMap = Readonly<Record<string, McpCardAppearance>>;
/** Validate a server key before it is used to address presentation settings.
 * @param value - Candidate MCP `serverName`.
 * @returns Whether the key matches the stable server-name format.
 */
export declare function isMcpServerIdentity(value: string): boolean;
/** Replace only the named server's visual preferences, preserving all others.
 * @param current - Existing saved server preferences.
 * @param serverName - Stable server identity.
 * @param appearance - Display-only values to save.
 * @returns Updated preference map.
 */
export declare function withMcpCardAppearance(current: McpCardAppearanceMap, serverName: string, appearance: McpCardAppearance): McpCardAppearanceMap;
/** Remove one override and let the default card presentation take over.
 * @param current - Existing saved server preferences.
 * @param serverName - Stable server identity to reset.
 * @returns Updated preference map.
 */
export declare function withoutMcpCardAppearance(current: McpCardAppearanceMap, serverName: string): McpCardAppearanceMap;
//# sourceMappingURL=mcpCardAppearance.d.ts.map