import { IconSettingsOutlineMedium } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { ManagedMcpServers } from './ManagedMcpServers.tsx'
import css from './mcp-settings.module.css'

interface ManagedSettings { servers?: import('@deepseek-ai/dsh-mcp-client').ManagedMcpServer[] }
interface Injected {
  managedForm: ConfigForm<ManagedSettings>
  remote: ClientContext['remote']
}

/** Show each managed connection on the shared MCP settings page when served. */
export function McpConnectionsPage({ managedForm, remote, t }: Injected & PropsLocale<'settings.mcp'>) {
  return <div className={css.connections}>
    <header className={css.pageHeader}>
      <span className={css.pageIcon} aria-hidden="true"><IconSettingsOutlineMedium size={24} /></span>
      <div className={css.pageCopy}>
        <h2 className={css.pageTitle}>{t('pageTitle')}</h2>
        <p className={css.pageDescription}>{t('pageDescription')}</p>
      </div>
    </header>
    <ManagedMcpServers form={managedForm} remote={remote} t={t} />
  </div>
}
