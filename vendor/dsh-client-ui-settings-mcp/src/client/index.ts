/** MCP settings page for managed connection and card presentation settings. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-mcp-client/remote'
import { McpCardSettings } from './McpCardSettings.tsx'
import { McpConnectionsPage } from './McpConnectionsPage.tsx'
import { runLegacyMcpMigration } from './migration.ts'
import type { McpCardAppearance } from './mcpCardAppearance.ts'
import { en, zh } from './locales.ts'

interface ManagedSettings { servers?: import('@deepseek-ai/dsh-mcp-client').ManagedMcpServer[] }
interface AppearanceSettings { servers?: Readonly<Record<string, McpCardAppearance>> }

export const inject = [
  'slots', 'locale', 'remote', 'remote.credentials',
  'remote.mcpClientStatus', 'remote.mcpServerManager', 'configForms',
]
const NS = 'settings.mcp'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'settings.mcp': keyof typeof en }
}

/** Register MCP settings while at least one managed MCP setting is available. */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'ui-settings-mcp: dictionaries')
  ctx.effect(() => ctx.configForms.whileServed(['mcp-server-manager'], () => {
    let active = true
    let stopSection: (() => void) | undefined
    const cognee = ctx.configForms.get<{ enabled?: boolean; endpoint?: string; credentialRef?: string }>('cognee-memory')
    const chrome = ctx.configForms.get<{ enabled?: boolean; url?: string }>('mcp-chrome')
    const managed = ctx.configForms.get<ManagedSettings>('mcp-server-manager')
    void runLegacyMcpMigration(cognee, chrome, managed).catch(() => undefined).finally(() => {
      if (!active) return
      stopSection = ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section', id: 'mcp', order: 14, label: () => t('title'), locale: NS,
        inject: () => ({ managedForm: managed, remote: ctx.remote }),
      }, McpConnectionsPage))
    })
    return () => { active = false; stopSection?.() }
  }), 'ui-settings-mcp: connection settings section')
  const appearanceInjected = () => ({ form: ctx.configForms.get<AppearanceSettings>('mcp-card-presentation'), remote: ctx.remote })
  ctx.effect(() => ctx.configForms.whileServed(['mcp-card-presentation'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'mcp-card-appearance', order: 14.1, label: () => t('appearanceTitle'), locale: NS, inject: appearanceInjected,
  }, McpCardSettings))), 'ui-settings-mcp: MCP card appearance section')
}
