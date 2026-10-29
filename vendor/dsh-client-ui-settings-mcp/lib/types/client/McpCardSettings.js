import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import { isMcpServerIdentity, withMcpCardAppearance, withoutMcpCardAppearance } from "./mcpCardAppearance.js";
import css from './mcp-settings.module.css';
/** Configure display-only metadata without touching an MCP server declaration. */
export function McpCardSettings({ form, remote, t }) {
    const state = useSyncExternalStore(listener => form.subscribe(listener), () => form.getSnapshot());
    const [serverName, setServerName] = useState('');
    const [draft, setDraft] = useState({});
    const [error, setError] = useState(false);
    const saved = state.value?.servers ?? {};
    const [servers, setServers] = useState([]);
    const [statusAvailable, setStatusAvailable] = useState(false);
    useEffect(() => {
        let active = true;
        let timer;
        const refresh = async () => {
            try {
                const reply = await remote.mcpClientStatus.list();
                if (active && reply.ok) {
                    setServers(reply.value);
                    setStatusAvailable(true);
                }
            }
            catch {
                if (active)
                    setStatusAvailable(false);
            }
            if (active)
                timer = setTimeout(() => { void refresh(); }, 2500);
        };
        void refresh();
        return () => { active = false; clearTimeout(timer); };
    }, [remote]);
    const load = (name) => { setDraft(saved[name] ?? {}); };
    const save = async () => {
        if (!isMcpServerIdentity(serverName)) {
            setError(true);
            return;
        }
        setError(false);
        const next = withMcpCardAppearance(saved, serverName, draft);
        if (!await form.set('servers', next))
            setError(true);
    };
    const reset = async () => {
        if (!isMcpServerIdentity(serverName)) {
            setError(true);
            return;
        }
        setError(!await form.set('servers', withoutMcpCardAppearance(saved, serverName)));
        setDraft({});
    };
    const field = (key, label) => (_jsxs("label", { className: css.field, children: [_jsx("span", { children: label }), _jsx("input", { value: draft[key] ?? '', disabled: !state.writable, onChange: (event) => {
                    setDraft(value => ({ ...value, [key]: event.currentTarget.value }));
                } })] }));
    const flag = (key, label) => (_jsxs("label", { className: css.switchRow, children: [_jsx("span", { children: label }), _jsx(Switch, { checked: draft[key] ?? true, label: label, disabled: !state.writable, onChange: (value) => {
                    setDraft(current => ({ ...current, [key]: value }));
                } })] }));
    return _jsxs("section", { className: css.card, "aria-label": t('appearanceTitle'), children: [_jsx("h3", { children: t('appearanceTitle') }), _jsxs("div", { className: css.serverList, "aria-label": t('serverCards'), children: [_jsx("h4", { children: t('serverCards') }), servers.length === 0 && _jsx("p", { role: "status", children: t(statusAvailable ? 'noServers' : 'statusUnavailable') }), servers.map((server) => {
                        const appearance = saved[server.serverName] ?? {};
                        return _jsxs("article", { className: css.serverCard, children: [_jsxs("strong", { children: [appearance.icon && _jsxs("span", { "aria-hidden": "true", children: [appearance.icon, " "] }), appearance.displayName || server.serverName] }), appearance.description && _jsx("p", { children: appearance.description }), appearance.showConnectionStatus !== false && _jsxs("span", { children: [t('connectionState'), ": ", t(`connection.${server.state}`)] }), appearance.showToolCount !== false && _jsxs("span", { children: [t('toolCount'), ": ", server.toolCount] }), appearance.showTransport !== false && _jsxs("span", { children: [t('transport'), ": ", t(`transport.${server.transport}`)] }), appearance.showSource !== false && _jsxs("span", { children: [t('source'), ": ", server.source] })] }, server.id);
                    })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('serverName') }), _jsx("input", { value: serverName, disabled: !state.writable, onChange: (event) => { setServerName(event.currentTarget.value); load(event.currentTarget.value); } }), _jsx("small", { children: t('serverNameHint') })] }), field('displayName', t('displayName')), field('description', t('description')), field('icon', t('icon')), flag('showConnectionStatus', t('showConnectionStatus')), flag('showToolCount', t('showToolCount')), flag('showTransport', t('showTransport')), flag('showSource', t('showSource')), _jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "primary", disabled: !state.writable, onClick: () => { void save(); }, children: t('saveAppearance') }), _jsx(Button, { variant: "outline", disabled: !state.writable, onClick: () => { void reset(); }, children: t('resetAppearance') })] }), error && _jsx("p", { role: "alert", children: t('invalidServerName') })] });
}
//# sourceMappingURL=McpCardSettings.js.map