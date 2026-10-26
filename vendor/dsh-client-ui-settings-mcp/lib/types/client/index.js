import { McpCardSettings } from "./McpCardSettings.js";
import { McpConnectionsPage } from "./McpConnectionsPage.js";
import { en, zh } from "./locales.js";
export const inject = [
    'slots', 'locale', 'remote', 'remote.credentials', 'remote.cognee', 'remote.chromeMcp',
    'remote.mcpClientStatus', 'remote.mcpServerManager', 'configForms',
];
const NS = 'settings.mcp';
/** Register MCP settings while at least one managed MCP setting is available. */
export function apply(ctx) {
    const t = ctx.locale.bind(NS);
    ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'ui-settings-mcp: dictionaries');
    const connectionsInjected = () => ({
        cogneeForm: ctx.configForms.get('cognee-memory'),
        chromeForm: ctx.configForms.get('mcp-chrome'),
        managedForm: ctx.configForms.get('mcp-server-manager'),
        remote: ctx.remote,
    });
    ctx.effect(() => ctx.configForms.whileServed(['cognee-memory', 'mcp-chrome', 'mcp-server-manager'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section', id: 'mcp', order: 14, label: () => t('title'), locale: NS, inject: connectionsInjected,
    }, McpConnectionsPage))), 'ui-settings-mcp: connection settings section');
    const appearanceInjected = () => ({ form: ctx.configForms.get('mcp-card-presentation'), remote: ctx.remote });
    ctx.effect(() => ctx.configForms.whileServed(['mcp-card-presentation'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section', id: 'mcp-card-appearance', order: 14.1, label: () => t('appearanceTitle'), locale: NS, inject: appearanceInjected,
    }, McpCardSettings))), 'ui-settings-mcp: MCP card appearance section');
}
//# sourceMappingURL=index.js.map