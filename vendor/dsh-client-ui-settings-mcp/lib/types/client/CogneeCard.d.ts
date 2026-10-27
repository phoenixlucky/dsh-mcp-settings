import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
interface Config {
    enabled?: boolean;
    endpoint?: string;
    credentialRef?: string;
}
type Remote = ClientContext['remote'];
interface Injected {
    form: ConfigForm<Config>;
    remote: Remote;
}
/** Settings screen for VISION-LIAO's endpoint, separate credential, and readiness. */
export declare function CogneeCard({ form, remote, t }: Injected & PropsLocale<'settings.mcp'>): import("react").JSX.Element;
export {};
//# sourceMappingURL=CogneeCard.d.ts.map