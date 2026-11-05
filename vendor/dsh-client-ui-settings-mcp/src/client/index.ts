/** MCP settings page for managed connection and card presentation settings. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-mcp-client/remote'
import mcpRemote from '@deepseek-ai/dsh-mcp-client/remote'
import { McpCardSettings } from './McpCardSettings.tsx'
import { McpConnectionsPage } from './McpConnectionsPage.tsx'
import type { McpCardAppearance } from './mcpCardAppearance.ts'
import { en, zh } from './locales.ts'

interface ManagedSettings { servers?: import('@deepseek-ai/dsh-mcp-client').ManagedMcpServer[] }
interface AppearanceSettings { servers?: Readonly<Record<string, McpCardAppearance>> }

export const inject = [
  'slots', 'locale', 'remote', 'remote.credentials',
  'configForms',
]
const NS = 'settings.mcp'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'settings.mcp': keyof typeof en }
}

/**
 * Resolve a Remote namespace this plugin mounted itself.
 * Property access on `ctx.remote` is gated by the Cordis inject declaration, so a
 * namespace created by this plugin's own `$mount` is reached through `ctx.get`.
 * @param ctx - Client root.
 * @param namespace - Namespace mounted by `$mount` (e.g. `mcpClientStatus`).
 * @returns The namespace facade, or undefined while it is not mounted.
 */
function remoteNamespace(ctx: ClientContext, namespace: string): unknown {
  return ctx.get(`remote.${namespace}` as never)
}

/** Register MCP settings while at least one managed MCP setting is available. */
export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  const unmountRemote = await ctx.remote.$mount(mcpRemote)
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'ui-settings-mcp: dictionaries')
  ctx.effect(() => ctx.configForms.whileServed(['mcp-server-manager'], () => {
    let stopSection: (() => void) | undefined
    const managed = ctx.configForms.get<ManagedSettings>('mcp-server-manager')
    stopSection = ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section', id: 'mcp', order: 14, priority: -1, label: () => t('title'), locale: NS,
      inject: () => ({
        managedForm: managed,
        remote: ctx.remote,
        statusApi: remoteNamespace(ctx, 'mcpClientStatus'),
        managerApi: remoteNamespace(ctx, 'mcpServerManager'),
      }),
    }, McpConnectionsPage))
    return () => stopSection?.()
  }), 'ui-settings-mcp: connection settings section')
  const appearanceInjected = () => ({ form: ctx.configForms.get<AppearanceSettings>('mcp-card-presentation'), remote: ctx.remote })
  ctx.effect(() => ctx.configForms.whileServed(['mcp-card-presentation'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'mcp-card-appearance', order: 14.1, label: () => t('appearanceTitle'), locale: NS, inject: appearanceInjected,
  }, McpCardSettings))), 'ui-settings-mcp: MCP card appearance section')
  return async () => { await unmountRemote() }
}
