import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { ManagedMcpServer } from '@deepseek-ai/dsh-mcp-client';
type Remote = ClientContext['remote'];
interface Injected {
    form: ConfigForm<{
        servers?: ManagedMcpServer[];
    }>;
    remote: Remote;
}
/** Edit multiple host-managed MCP servers and check their connection state. */
export declare function ManagedMcpServers({ form, remote, t }: Injected & PropsLocale<'settings.mcp'>): import("react").JSX.Element;
export {};
//# sourceMappingURL=ManagedMcpServers.d.ts.map