/** MCP settings page for managed connection and card presentation settings. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-mcp-client/remote'
import mcpRemote from '@deepseek-ai/dsh-mcp-client/remote'
import mcpSettingsRemote from '../../../../lib/typert.remote-client.js'
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

/** Register MCP settings while at least one managed MCP setting is available. */
export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  const unmountRemote = await ctx.remote.$mount(mcpRemote)
  let unmountSettingsRemote: (() => Promise<void>) | undefined
  try {
    unmountSettingsRemote = await ctx.remote.$mount(mcpSettingsRemote)
  } catch (error) {
    await unmountRemote()
    throw error
  }
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'ui-settings-mcp: dictionaries')
  ctx.effect(() => ctx.configForms.whileServed(['mcp-server-manager'], () => {
    let stopSection: (() => void) | undefined
    const managed = ctx.configForms.get<ManagedSettings>('mcp-server-manager')
    stopSection = ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section', id: 'mcp', order: 14, priority: -1, label: () => t('title'), locale: NS,
      inject: () => ({ managedForm: managed, remote: ctx.remote }),
    }, McpConnectionsPage))
    return () => stopSection?.()
  }), 'ui-settings-mcp: connection settings section')
  const appearanceInjected = () => ({ form: ctx.configForms.get<AppearanceSettings>('mcp-card-presentation'), remote: ctx.remote })
  ctx.effect(() => ctx.configForms.whileServed(['mcp-card-presentation'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'mcp-card-appearance', order: 14.1, label: () => t('appearanceTitle'), locale: NS, inject: appearanceInjected,
  }, McpCardSettings))), 'ui-settings-mcp: MCP card appearance section')
  return async () => { await unmountSettingsRemote?.(); await unmountRemote() }
}
