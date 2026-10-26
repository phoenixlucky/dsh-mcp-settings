import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
interface Config {
    enabled?: boolean;
    url?: string;
}
interface Injected {
    form: ConfigForm<Config>;
    remote: ClientContext['remote'];
}
/** Configure the managed Chrome MCP endpoint and its separately stored token. */
export declare function ChromeCard({ form, remote, t }: Injected & PropsLocale<'settings.mcp'>): import("react").JSX.Element;
export {};
//# sourceMappingURL=ChromeCard.d.ts.map