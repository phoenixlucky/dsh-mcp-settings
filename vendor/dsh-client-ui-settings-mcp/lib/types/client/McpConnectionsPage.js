import { IconSettingsOutlineMedium } from '@deepseek-ai/dsh-client-ui-primitives';
import { ManagedMcpServers } from "./ManagedMcpServers.js";
import css from './mcp-settings.module.css';
/** Show each managed connection on the shared MCP settings page when served. */
export function McpConnectionsPage({ managedForm, remote, t }) {
    return <div className={css.connections}>
    <header className={css.pageHeader}>
      <span className={css.pageIcon} aria-hidden="true"><IconSettingsOutlineMedium size={24}/></span>
      <div className={css.pageCopy}>
        <h2 className={css.pageTitle}>{t('pageTitle')}</h2>
        <p className={css.pageDescription}>{t('pageDescription')}</p>
      </div>
    </header>
    <ManagedMcpServers form={managedForm} remote={remote} t={t}/>
  </div>;
}
//# sourceMappingURL=McpConnectionsPage.js.map