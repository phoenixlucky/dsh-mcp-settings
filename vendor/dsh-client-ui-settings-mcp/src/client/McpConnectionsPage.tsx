import { useSyncExternalStore } from 'react'
import { IconSettingsOutlineMedium } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { ChromeCard } from './ChromeCard.tsx'
import { CogneeCard } from './CogneeCard.tsx'
import { ManagedMcpServers } from './ManagedMcpServers.tsx'
import css from './mcp-settings.module.css'

interface CogneeSettings { enabled?: boolean; endpoint?: string; credentialRef?: string }
interface ChromeSettings { enabled?: boolean; url?: string }
interface ManagedSettings { servers?: import('@deepseek-ai/dsh-mcp-client').ManagedMcpServer[] }
interface Injected {
  cogneeForm: ConfigForm<CogneeSettings>
  chromeForm: ConfigForm<ChromeSettings>
  managedForm: ConfigForm<ManagedSettings>
  remote: ClientContext['remote']
}

/** Show each managed connection on the shared MCP settings page when served. */
export function McpConnectionsPage({ cogneeForm, chromeForm, managedForm, remote, t }: Injected & PropsLocale<'settings.mcp'>) {
  const cognee = useSyncExternalStore(cogneeForm.subscribe.bind(cogneeForm), cogneeForm.getSnapshot.bind(cogneeForm))
  const chrome = useSyncExternalStore(chromeForm.subscribe.bind(chromeForm), chromeForm.getSnapshot.bind(chromeForm))
  const managed = useSyncExternalStore(managedForm.subscribe.bind(managedForm), managedForm.getSnapshot.bind(managedForm))

  return <div className={css.connections}>
    <header className={css.pageHeader}>
      <span className={css.pageIcon} aria-hidden="true"><IconSettingsOutlineMedium size={24} /></span>
      <div className={css.pageCopy}>
        <h2 className={css.pageTitle}>{t('pageTitle')}</h2>
        <p className={css.pageDescription}>{t('pageDescription')}</p>
      </div>
    </header>
    {cognee.status === 'ready' && <CogneeCard form={cogneeForm} remote={remote} t={t} />}
    {chrome.status === 'ready' && <ChromeCard form={chromeForm} remote={remote} t={t} />}
    {managed.status === 'ready' && <ManagedMcpServers form={managedForm} remote={remote} t={t} />}
  </div>
}
