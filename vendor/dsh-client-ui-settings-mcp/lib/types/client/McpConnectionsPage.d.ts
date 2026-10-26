import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
interface CogneeSettings {
    enabled?: boolean;
    endpoint?: string;
    credentialRef?: string;
}
interface ChromeSettings {
    enabled?: boolean;
    url?: string;
}
interface ManagedSettings {
    servers?: import('@deepseek-ai/dsh-mcp-client').ManagedMcpServer[];
}
interface Injected {
    cogneeForm: ConfigForm<CogneeSettings>;
    chromeForm: ConfigForm<ChromeSettings>;
    managedForm: ConfigForm<ManagedSettings>;
    remote: ClientContext['remote'];
}
/** Show each managed connection on the shared MCP settings page when served. */
export declare function McpConnectionsPage({ cogneeForm, chromeForm, managedForm, remote, t }: Injected & PropsLocale<'settings.mcp'>): import("react").JSX.Element;
export {};
//# sourceMappingURL=McpConnectionsPage.d.ts.map