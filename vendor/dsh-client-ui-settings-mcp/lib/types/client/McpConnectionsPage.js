import { useSyncExternalStore } from 'react';
import { IconSettingsOutlineMedium } from '@deepseek-ai/dsh-client-ui-primitives';
import { ChromeCard } from "./ChromeCard.js";
import { CogneeCard } from "./CogneeCard.js";
import { ManagedMcpServers } from "./ManagedMcpServers.js";
import css from './mcp-settings.module.css';
/** Show each managed connection on the shared MCP settings page when served. */
export function McpConnectionsPage({ cogneeForm, chromeForm, managedForm, remote, t }) {
    const cognee = useSyncExternalStore(cogneeForm.subscribe.bind(cogneeForm), cogneeForm.getSnapshot.bind(cogneeForm));
    const chrome = useSyncExternalStore(chromeForm.subscribe.bind(chromeForm), chromeForm.getSnapshot.bind(chromeForm));
    const managed = useSyncExternalStore(managedForm.subscribe.bind(managedForm), managedForm.getSnapshot.bind(managedForm));
    return <div className={css.connections}>
    <header className={css.pageHeader}>
      <span className={css.pageIcon} aria-hidden="true"><IconSettingsOutlineMedium size={24}/></span>
      <div className={css.pageCopy}>
        <h2 className={css.pageTitle}>{t('pageTitle')}</h2>
        <p className={css.pageDescription}>{t('pageDescription')}</p>
      </div>
    </header>
    {cognee.status === 'ready' && <CogneeCard form={cogneeForm} remote={remote} t={t}/>}
    {chrome.status === 'ready' && <ChromeCard form={chromeForm} remote={remote} t={t}/>}
    {managed.status === 'ready' && <ManagedMcpServers form={managedForm} remote={remote} t={t}/>}
  </div>;
}
//# sourceMappingURL=McpConnectionsPage.js.map