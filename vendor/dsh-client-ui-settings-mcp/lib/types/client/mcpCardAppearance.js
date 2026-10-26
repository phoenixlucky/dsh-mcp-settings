/** Validate a server key before it is used to address presentation settings.
 * @param value - Candidate MCP `serverName`.
 * @returns Whether the key matches the stable server-name format.
 */
export function isMcpServerIdentity(value) {
    return /^[A-Za-z0-9_-]{1,32}$/u.test(value);
}
/** Replace only the named server's visual preferences, preserving all others.
 * @param current - Existing saved server preferences.
 * @param serverName - Stable server identity.
 * @param appearance - Display-only values to save.
 * @returns Updated preference map.
 */
export function withMcpCardAppearance(current, serverName, appearance) {
    if (!isMcpServerIdentity(serverName))
        throw new TypeError('MCP server name must contain 1–32 letters, digits, _ or -');
    return { ...current, [serverName]: { ...appearance } };
}
/** Remove one override and let the default card presentation take over.
 * @param current - Existing saved server preferences.
 * @param serverName - Stable server identity to reset.
 * @returns Updated preference map.
 */
export function withoutMcpCardAppearance(current, serverName) {
    if (!Object.hasOwn(current, serverName))
        return current;
    return Object.fromEntries(Object.entries(current).filter(([name]) => name !== serverName));
}
//# sourceMappingURL=mcpCardAppearance.js.map