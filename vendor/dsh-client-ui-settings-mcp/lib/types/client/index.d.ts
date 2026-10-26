/** MCP settings page for managed connection and card presentation settings. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { en } from './locales.ts';
export declare const inject: string[];
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'settings.mcp': keyof typeof en;
    }
}
/** Register MCP settings while at least one managed MCP setting is available. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map