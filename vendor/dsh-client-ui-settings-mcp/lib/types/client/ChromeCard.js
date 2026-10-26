import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, IconGlobeOutlineRegular, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './mcp-settings.module.css';
const CREDENTIAL = 'DSH_CHROME_MCP_TOKEN';
/** Configure the managed Chrome MCP endpoint and its separately stored token. */
export function ChromeCard({ form, remote, t }) {
    const snapshot = form.getSnapshot();
    const [enabled, setEnabled] = useState(snapshot.value?.enabled ?? false);
    const [url, setUrl] = useState(snapshot.value?.url ?? '');
    const [token, setToken] = useState('');
    const [tokenConfigured, setTokenConfigured] = useState(false);
    const [tokenWritable, setTokenWritable] = useState(false);
    const [status, setStatus] = useState({ state: 'not-configured' });
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState();
    useEffect(() => form.subscribe(() => {
        const value = form.getSnapshot().value;
        if (value !== undefined) {
            setEnabled(value.enabled ?? false);
            setUrl(value.url ?? '');
        }
    }), [form]);
    useEffect(() => {
        let active = true;
        void remote.credentials.describe([CREDENTIAL]).then((reply) => {
            const credential = reply.ok ? reply.value[CREDENTIAL] : undefined;
            if (active && credential !== undefined) {
                setTokenConfigured(credential.configured);
                setTokenWritable(credential.writable);
            }
        }).catch(() => { if (active)
            setFailure('credential'); });
        return () => { active = false; };
    }, [remote]);
    useEffect(() => {
        let active = true;
        void remote.chromeMcp.checkChromeConnection().then((reply) => {
            if (active && reply.ok)
                setStatus(reply.value);
            else if (active)
                setFailure('check');
        }).catch(() => { if (active)
            setFailure('check'); });
        return () => { active = false; };
    }, [remote]);
    const readStatus = async () => {
        try {
            const reply = await remote.chromeMcp.checkChromeConnection();
            if (!reply.ok) {
                setFailure('check');
                return;
            }
            setStatus(reply.value);
        }
        catch {
            setFailure('check');
        }
    };
    const check = async () => {
        setBusy(true);
        setFailure(undefined);
        try {
            await readStatus();
        }
        finally {
            setBusy(false);
        }
    };
    const save = async () => {
        setBusy(true);
        setFailure(undefined);
        try {
            const accepted = await form.mutate([
                { op: 'set', path: ['enabled'], value: enabled },
                { op: 'set', path: ['url'], value: url },
            ]);
            if (!accepted) {
                setFailure('save');
                return;
            }
            if (token !== '') {
                const reply = await remote.credentials.set(CREDENTIAL, token);
                if (!reply.ok) {
                    setFailure('credential');
                    return;
                }
                setToken('');
                setTokenConfigured(true);
            }
            await readStatus();
        }
        catch {
            setFailure('save');
        }
        finally {
            setBusy(false);
        }
    };
    const tokenLabel = tokenWritable ? tokenConfigured ? 'tokenSet' : 'tokenUnset' : 'credentialsUnavailable';
    return _jsxs("section", { className: css.card, "aria-label": t('chromeTitle'), children: [_jsxs("header", { className: css.cardHeader, children: [_jsxs("div", { className: css.cardIdentity, children: [_jsx("span", { className: css.cardIcon, "aria-hidden": "true", children: _jsx(IconGlobeOutlineRegular, { size: 24 }) }), _jsxs("div", { className: css.cardCopy, children: [_jsx("h3", { className: css.cardTitle, children: "Chrome MCP" }), _jsx("p", { className: css.cardDescription, children: t('chromeDescription') })] })] }), _jsxs("div", { className: css.enableControl, children: [_jsx("span", { className: css.enableLabel, children: t('chromeEnabled') }), _jsx(Switch, { checked: enabled, label: t('chromeEnabled'), disabled: busy || !form.getSnapshot().writable, onChange: setEnabled })] })] }), _jsxs("section", { className: css.fieldGroup, "aria-labelledby": "chrome-connection-settings", children: [_jsx("h4", { className: css.fieldGroupTitle, id: "chrome-connection-settings", children: t('connectionSettings') }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('chromeEndpoint') }), _jsx("input", { type: "url", value: url, disabled: busy || !form.getSnapshot().writable, onChange: event => setUrl(event.currentTarget.value) }), _jsx("small", { children: t('chromeEndpointHint') })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('token') }), _jsx("input", { type: "password", autoComplete: "new-password", value: token, disabled: busy || !tokenWritable, onChange: event => setToken(event.currentTarget.value) }), _jsx("small", { children: t(tokenLabel) })] })] }), _jsxs("footer", { className: css.cardFooter, children: [_jsxs("p", { className: css.status, role: "status", children: [_jsx("span", { children: t('status') }), _jsx("strong", { "data-state": status.state, children: status.state === 'ready' && status.toolCount !== undefined ? t('chromeStatus.readyCount').replace('{count}', String(status.toolCount)) : t(`chromeStatus.${status.state}`) })] }), _jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "primary", disabled: busy || !form.getSnapshot().writable, onClick: () => { void save(); }, children: t('save') }), _jsx(Button, { variant: "outline", disabled: busy, onClick: () => { void check(); }, children: busy ? t('checking') : t('check') })] }), failure !== undefined && _jsx("p", { className: css.error, role: "alert", children: t(`chromeError.${failure}`) })] })] });
}
//# sourceMappingURL=ChromeCard.js.map