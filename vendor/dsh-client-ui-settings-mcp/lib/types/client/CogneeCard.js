import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, IconDataOutlineRegular, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './mcp-settings.module.css';
const CREDENTIAL = 'DSH_COGNEE_MCP_TOKEN';
/** Settings screen for Cognee's endpoint, separate credential, and readiness. */
export function CogneeCard({ form, remote, t }) {
    const snapshot = form.getSnapshot();
    const [enabled, setEnabled] = useState(snapshot.value?.enabled ?? false);
    const [endpoint, setEndpoint] = useState(snapshot.value?.endpoint ?? '');
    const [token, setToken] = useState('');
    const [tokenConfigured, setTokenConfigured] = useState(false);
    const [tokenWritable, setTokenWritable] = useState(false);
    const [status, setStatus] = useState('not-configured');
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);
    useEffect(() => form.subscribe(() => {
        const value = form.getSnapshot().value;
        if (value !== undefined) {
            setEnabled(value.enabled ?? false);
            setEndpoint(value.endpoint ?? '');
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
            setFailed(true); });
        return () => { active = false; };
    }, [remote]);
    const check = async () => {
        setBusy(true);
        setFailed(false);
        try {
            const reply = await remote.cognee.status();
            if (!reply.ok)
                throw new Error('status unavailable');
            setStatus(reply.value.state);
        }
        catch {
            setFailed(true);
        }
        finally {
            setBusy(false);
        }
    };
    const save = async () => {
        setBusy(true);
        setFailed(false);
        try {
            const accepted = await Promise.all([form.set('enabled', enabled), form.set('endpoint', endpoint)]);
            if (accepted.some(value => !value))
                throw new Error('settings refused');
            if (token !== '') {
                const reply = await remote.credentials.set(CREDENTIAL, token);
                if (!reply.ok)
                    throw new Error('credential refused');
                setToken('');
                setTokenConfigured(true);
            }
            await check();
        }
        catch {
            setFailed(true);
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("section", { className: css.card, "aria-label": t('title'), children: [_jsxs("header", { className: css.cardHeader, children: [_jsxs("div", { className: css.cardIdentity, children: [_jsx("span", { className: css.cardIcon, "aria-hidden": "true", children: _jsx(IconDataOutlineRegular, { size: 24 }) }), _jsxs("div", { className: css.cardCopy, children: [_jsx("h3", { className: css.cardTitle, children: "Cognee" }), _jsx("p", { className: css.cardDescription, children: t('cogneeDescription') })] })] }), _jsxs("div", { className: css.enableControl, children: [_jsx("span", { className: css.enableLabel, children: t('enabled') }), _jsx(Switch, { checked: enabled, label: t('enabled'), disabled: busy, onChange: setEnabled })] })] }), _jsxs("section", { className: css.fieldGroup, "aria-labelledby": "cognee-connection-settings", children: [_jsx("h4", { className: css.fieldGroupTitle, id: "cognee-connection-settings", children: t('connectionSettings') }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('endpoint') }), _jsx("input", { value: endpoint, disabled: busy, onChange: (event) => { setEndpoint(event.currentTarget.value); } }), _jsx("small", { children: t('endpointHint') })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('token') }), _jsx("input", { type: "password", autoComplete: "new-password", value: token, disabled: busy || !tokenWritable, onChange: (event) => { setToken(event.currentTarget.value); } }), _jsx("small", { children: t(tokenConfigured ? 'tokenSet' : 'tokenUnset') })] })] }), _jsxs("footer", { className: css.cardFooter, children: [_jsxs("p", { className: css.status, role: "status", children: [_jsx("span", { children: t('status') }), _jsx("strong", { "data-state": status, children: t(`status.${status}`) })] }), _jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "primary", disabled: busy || !form.getSnapshot().writable, onClick: () => { void save(); }, children: t('save') }), _jsx(Button, { variant: "outline", disabled: busy, onClick: () => { void check(); }, children: busy ? t('checking') : t('check') })] }), failed && _jsx("p", { className: css.error, role: "alert", children: t('error') })] }));
}
//# sourceMappingURL=CogneeCard.js.map
