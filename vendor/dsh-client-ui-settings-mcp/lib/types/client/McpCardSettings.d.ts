import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { McpCardAppearanceMap } from './mcpCardAppearance.ts';
interface Config {
    servers?: McpCardAppearanceMap;
}
interface Injected {
    form: ConfigForm<Config>;
    remote: ClientContext['remote'];
}
export type McpCardSettingsProps = Injected & PropsLocale<'settings.mcp'>;
/** Configure display-only metadata without touching an MCP server declaration. */
export declare function McpCardSettings({ form, remote, t }: McpCardSettingsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=McpCardSettings.d.ts.map