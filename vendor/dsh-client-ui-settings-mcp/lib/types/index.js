import z from '@deepseek-ai/schemastery';
/** Host plugin identity for display-only MCP card preferences. */
export const name = 'mcp-card-presentation';
/** Schema for user-owned display preferences, separate from connection config. */
export const Config = z.object({
    servers: z.dict(z.object({
        displayName: z.string().max(120), description: z.string().max(500), icon: z.string().max(256),
        showConnectionStatus: z.boolean(), showToolCount: z.boolean(), showTransport: z.boolean(), showSource: z.boolean(),
    })).default({}),
});
/** Register the preference namespace without opening or changing MCP connections.
 * @param _ctx - Cordis context supplied by the host.
 */
export function apply(_ctx) { }
/** Cordis plugin entry. */
export default { name, Config, apply };
//# sourceMappingURL=index.js.map