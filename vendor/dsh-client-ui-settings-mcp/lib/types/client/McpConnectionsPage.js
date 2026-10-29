import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconSettingsOutlineMedium } from '@deepseek-ai/dsh-client-ui-primitives';
import { ManagedMcpServers } from "./ManagedMcpServers.js";
import css from './mcp-settings.module.css';
/** Show each managed connection on the shared MCP settings page when served. */
export function McpConnectionsPage({ managedForm, remote, t }) {
    return _jsxs("div", { className: css.connections, children: [_jsxs("header", { className: css.pageHeader, children: [_jsx("span", { className: css.pageIcon, "aria-hidden": "true", children: _jsx(IconSettingsOutlineMedium, { size: 24 }) }), _jsxs("div", { className: css.pageCopy, children: [_jsx("h2", { className: css.pageTitle, children: t('pageTitle') }), _jsx("p", { className: css.pageDescription, children: t('pageDescription') })] })] }), _jsx(ManagedMcpServers, { form: managedForm, remote: remote, t: t })] });
}
//# sourceMappingURL=McpConnectionsPage.js.map