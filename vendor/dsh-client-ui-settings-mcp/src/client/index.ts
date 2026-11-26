/** MCP settings page for managed connection and card presentation settings. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-mcp-client/remote'
// The mounted model must be this bundle's own copy: the Host publishes the endpoints from
// `vendor/dsh-mcp-client`, so a model resolved from the build workspace can lag behind it (it has no
// `mcpServerManager/listSkills`), and the facade would then lack a method the page calls.
import mcpRemote from '../../../dsh-mcp-client/lib/typert.remote-client.js'
import { McpCardSettings } from './McpCardSettings.tsx'
import { McpConnectionsPage } from './McpConnectionsPage.tsx'
import type { McpCardAppearance } from './mcpCardAppearance.ts'
import { en, zh } from './locales.ts'
import classes from './mcp-settings.module.css'
import rawStylesheet from './mcp-settings.module.css?inline'

/** Attribute marking the style element this plugin installs for itself. */
const STYLE_ATTRIBUTE = 'data-dsh-mcp-settings-styles'

/**
 * Scope an inline module stylesheet with the module's own class map.
 *
 * `?inline` returns the compiled text with unscoped selectors (`.connections`), while components
 * apply the hashed names from the module import (`oetn4G_connections`). Applying the map keeps the
 * injected rules matching the rendered markup without a second hand-written stylesheet.
 * @param text - Compiled stylesheet text from the `?inline` import.
 * @param map - The same file's CSS-module class map.
 * @returns Stylesheet text whose selectors carry the hashed class names.
 */
function scopeStylesheet(text: string, map: Readonly<Record<string, string>>): string {
  return Object.entries(map).reduce(
    (result, [name, hashed]) => result.replace(
      new RegExp(`\\.${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'g'),
      `.${hashed}`,
    ),
    text,
  )
}

const STYLESHEET = scopeStylesheet(rawStylesheet, classes)

/**
 * Install the compiled stylesheet into the current document.
 *
 * Client bundles used to carry their CSS as a module-scope string that the bundle injected itself.
 * The current bundler instead exposes stylesheet text through module metadata for the renderer to
 * install, which leaves the page unstyled on hosts whose renderer does not consume that metadata.
 * Installing the same compiled text here works on both, and the attribute keeps repeated `apply`
 * calls (hot replacement) from stacking duplicate sheets.
 * @param document - Document that owns the settings page.
 * @returns Disposer that removes the style element this call installed.
 */
function installStyles(document: Document): () => void {
  if (document.querySelector(`style[${STYLE_ATTRIBUTE}]`) !== null) return () => {}
  const element = document.createElement('style')
  element.setAttribute(STYLE_ATTRIBUTE, '')
  element.textContent = STYLESHEET
  document.head.append(element)
  return () => { element.remove() }
}

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
  ctx.effect(() => installStyles(document), 'ui-settings-mcp: stylesheet')
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
        // Read-only describe face: the page re-reads the Host revision when a write is refused.
        settingsApi: remoteNamespace(ctx, 'settings'),
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
