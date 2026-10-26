import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return _jsxs("div", { className: css.connections, children: [_jsxs("header", { className: css.pageHeader, children: [_jsx("span", { className: css.pageIcon, "aria-hidden": "true", children: _jsx(IconSettingsOutlineMedium, { size: 24 }) }), _jsxs("div", { className: css.pageCopy, children: [_jsx("h2", { className: css.pageTitle, children: t('pageTitle') }), _jsx("p", { className: css.pageDescription, children: t('pageDescription') })] })] }), cognee.status === 'ready' && _jsx(CogneeCard, { form: cogneeForm, remote: remote, t: t }), chrome.status === 'ready' && _jsx(ChromeCard, { form: chromeForm, remote: remote, t: t }), managed.status === 'ready' && _jsx(ManagedMcpServers, { form: managedForm, remote: remote, t: t })] });
}
//# sourceMappingURL=McpConnectionsPage.js.map