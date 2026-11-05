import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { ManagedMcpServers } from './ManagedMcpServers.tsx'
import type { McpManagerApi, McpStatusApi } from './ManagedMcpServers.tsx'
import css from './mcp-settings.module.css'

interface ManagedSettings { servers?: import('@deepseek-ai/dsh-mcp-client').ManagedMcpServer[] }
interface Injected {
  managedForm: ConfigForm<ManagedSettings>
  remote: ClientContext['remote']
  statusApi?: McpStatusApi
  managerApi?: McpManagerApi
}

/** Show each managed connection on the shared MCP settings page when served. */
export function McpConnectionsPage({ managedForm, remote, statusApi, managerApi, t }: Injected & PropsLocale<'settings.mcp'>) {
  return <div className={css.connections}>
    <ManagedMcpServers form={managedForm} remote={remote} statusApi={statusApi} managerApi={managerApi} t={t} />
  </div>
}
