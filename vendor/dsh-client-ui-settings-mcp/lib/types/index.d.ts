/** Host-owned, display-only MCP card preferences. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Host plugin identity for display-only MCP card preferences. */
export declare const name = "mcp-card-presentation";
/** Schema for user-owned display preferences, separate from connection config. */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    servers: z<import("@deepseek-ai/cosmokit").Dict<{
        displayName?: string | null;
        description?: string | null;
        icon?: string | null;
        showConnectionStatus?: boolean | null;
        showToolCount?: boolean | null;
        showTransport?: boolean | null;
        showSource?: boolean | null;
    } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
        displayName: z<string, string, "plain">;
        description: z<string, string, "plain">;
        icon: z<string, string, "plain">;
        showConnectionStatus: z<boolean, boolean, "plain">;
        showToolCount: z<boolean, boolean, "plain">;
        showTransport: z<boolean, boolean, "plain">;
        showSource: z<boolean, boolean, "plain">;
    }>>, string>, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    servers: z<import("@deepseek-ai/cosmokit").Dict<{
        displayName?: string | null;
        description?: string | null;
        icon?: string | null;
        showConnectionStatus?: boolean | null;
        showToolCount?: boolean | null;
        showTransport?: boolean | null;
        showSource?: boolean | null;
    } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
        displayName: z<string, string, "plain">;
        description: z<string, string, "plain">;
        icon: z<string, string, "plain">;
        showConnectionStatus: z<boolean, boolean, "plain">;
        showToolCount: z<boolean, boolean, "plain">;
        showTransport: z<boolean, boolean, "plain">;
        showSource: z<boolean, boolean, "plain">;
    }>>, string>, "defined">;
}>>, "plain">;
/** Register the preference namespace without opening or changing MCP connections.
 * @param _ctx - Cordis context supplied by the host.
 */
export declare function apply(_ctx: Context): void;
/** Cordis plugin entry. */
declare const _default: {
    name: string;
    Config: z<Schemastery.ObjectS<NoInfer<{
        servers: z<import("@deepseek-ai/cosmokit").Dict<{
            displayName?: string | null;
            description?: string | null;
            icon?: string | null;
            showConnectionStatus?: boolean | null;
            showToolCount?: boolean | null;
            showTransport?: boolean | null;
            showSource?: boolean | null;
        } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
            displayName: z<string, string, "plain">;
            description: z<string, string, "plain">;
            icon: z<string, string, "plain">;
            showConnectionStatus: z<boolean, boolean, "plain">;
            showToolCount: z<boolean, boolean, "plain">;
            showTransport: z<boolean, boolean, "plain">;
            showSource: z<boolean, boolean, "plain">;
        }>>, string>, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        servers: z<import("@deepseek-ai/cosmokit").Dict<{
            displayName?: string | null;
            description?: string | null;
            icon?: string | null;
            showConnectionStatus?: boolean | null;
            showToolCount?: boolean | null;
            showTransport?: boolean | null;
            showSource?: boolean | null;
        } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
            displayName: z<string, string, "plain">;
            description: z<string, string, "plain">;
            icon: z<string, string, "plain">;
            showConnectionStatus: z<boolean, boolean, "plain">;
            showToolCount: z<boolean, boolean, "plain">;
            showTransport: z<boolean, boolean, "plain">;
            showSource: z<boolean, boolean, "plain">;
        }>>, string>, "defined">;
    }>>, "plain">;
    apply: typeof apply;
};
export default _default;
//# sourceMappingURL=index.d.ts.map