import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { ManagedMcpServers } from './ManagedMcpServers.tsx'
import type { McpManagerApi, McpSettingsApi, McpStatusApi } from './ManagedMcpServers.tsx'
import css from './mcp-settings.module.css'

interface ManagedSettings { servers?: import('@deepseek-ai/dsh-mcp-client').ManagedMcpServer[] }
interface Injected {
  managedForm: ConfigForm<ManagedSettings>
  remote: ClientContext['remote']
  statusApi?: McpStatusApi
  managerApi?: McpManagerApi
  settingsApi?: McpSettingsApi
}

/** Show each managed connection on the shared MCP settings page when served. */
export function McpConnectionsPage({ managedForm, remote, statusApi, managerApi, settingsApi, t }: Injected & PropsLocale<'settings.mcp'>) {
  return <div className={css.connections}>
    <ManagedMcpServers form={managedForm} remote={remote} statusApi={statusApi} managerApi={managerApi} settingsApi={settingsApi} t={t} />
  </div>
}
