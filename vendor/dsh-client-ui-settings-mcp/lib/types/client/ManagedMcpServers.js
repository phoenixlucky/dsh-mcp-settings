import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button, IconApiOutlineRegular, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import { randomUUID } from '@deepseek-ai/dsh-util-crypto';
import css from './mcp-settings.module.css';
function emptyDraft() {
    return { id: randomUUID(), serverName: '', enabled: true, transport: 'streamable-http', url: '', command: '', args: '', cwd: '', secrets: [] };
}
function toDraft(server) {
    const secrets = server.transport === 'streamable-http' ? server.headerRefs : server.envRefs;
    return {
        id: server.id, serverName: server.serverName, enabled: server.enabled, transport: server.transport,
        url: server.transport === 'streamable-http' ? server.url : '',
        command: server.transport === 'stdio' ? server.command : '',
        args: server.transport === 'stdio' ? server.args.join('\n') : '',
        cwd: server.transport === 'stdio' ? server.cwd : '',
        secrets: Object.entries(secrets).map(([name, ref]) => ({ name, ref, value: '' })),
    };
}
/** Edit multiple host-managed MCP servers and check their connection state. */
export function ManagedMcpServers({ form, remote, t }) {
    const snapshot = useSyncExternalStore(form.subscribe.bind(form), form.getSnapshot.bind(form));
    const servers = snapshot.value?.servers ?? [];
    const [statuses, setStatuses] = useState([]);
    const [draft, setDraft] = useState(emptyDraft);
    const [activeEditorId, setActiveEditorId] = useState();
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState();
    const [checkState, setCheckState] = useState();
    useEffect(() => {
        let active = true;
        const refresh = async () => {
            try {
                const reply = await remote.mcpClientStatus.list();
                if (active && reply.ok)
                    setStatuses(reply.value);
            }
            catch (error) {
                void error;
                if (active)
                    setStatuses([]);
            }
        };
        void refresh();
        const timer = setInterval(() => { void refresh(); }, 5000);
        return () => { active = false; clearInterval(timer); };
    }, [remote]);
    const saveServers = async (next) => {
        const accepted = await form.set('servers', next);
        if (!accepted)
            throw new Error('settings refused');
        await refreshStatuses();
    };
    const refreshStatuses = async () => {
        try {
            const reply = await remote.mcpClientStatus.list();
            if (reply.ok)
                setStatuses(reply.value);
        }
        catch {
            setStatuses([]);
        }
    };
    const prepareDraft = async () => {
        const serverName = draft.serverName.trim();
        if (!/^[A-Za-z0-9_-]{1,32}$/u.test(serverName)
            || servers.some(server => server.id !== draft.id && server.serverName === serverName)
            || (draft.transport === 'streamable-http' ? !isAllowedEndpoint(draft.url) : draft.command.trim() === '')) {
            setFailure('invalid');
            return undefined;
        }
        const refs = {};
        for (const row of draft.secrets) {
            const name = row.name.trim();
            const ref = row.ref.trim();
            const validName = draft.transport === 'streamable-http'
                ? /^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name)
                : /^[A-Za-z_][A-Za-z0-9_]*$/u.test(name);
            if (!validName || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref) || Object.hasOwn(refs, name)) {
                setFailure('invalid');
                return undefined;
            }
            refs[name] = ref;
        }
        setFailure(undefined);
        try {
            for (const row of draft.secrets) {
                if (row.value === '')
                    continue;
                const reply = await remote.credentials.set(row.ref.trim(), row.value);
                if (!reply.ok) {
                    setFailure('credential');
                    return undefined;
                }
            }
        }
        catch (error) {
            void error;
            setFailure('credential');
            return undefined;
        }
        return draft.transport === 'streamable-http'
            ? { id: draft.id, serverName, enabled: draft.enabled, transport: 'streamable-http', url: draft.url.trim(), headerRefs: refs }
            : { id: draft.id, serverName, enabled: draft.enabled, transport: 'stdio', command: draft.command.trim(), args: draft.args.split(/\r?\n/u).filter(value => value.trim() !== ''), cwd: draft.cwd, envRefs: refs };
    };
    const saveDraft = async () => {
        const server = await prepareDraft();
        if (server === undefined)
            return undefined;
        const editing = servers.some(current => current.id === server.id);
        const next = editing ? servers.map(current => current.id === server.id ? server : current) : [...servers, server];
        try {
            await saveServers(next);
            setDraft(toDraft(server));
            setActiveEditorId(server.id);
            return server;
        }
        catch {
            setFailure('save');
            return undefined;
        }
    };
    const checkDraft = async () => {
        setBusy(true);
        setFailure(undefined);
        setCheckState(undefined);
        try {
            const server = await prepareDraft();
            if (server === undefined)
                return;
            const reply = await remote.mcpServerManager.check(server);
            if (!reply.ok) {
                setFailure('check');
                return;
            }
            setCheckState(managedCheckLabel(t, reply.value));
        }
        catch {
            setFailure('check');
        }
        finally {
            setBusy(false);
        }
    };
    const remove = async (id) => {
        setBusy(true);
        setFailure(undefined);
        try {
            await saveServers(servers.filter(server => server.id !== id));
            if (activeEditorId === id)
                setActiveEditorId(undefined);
        }
        catch {
            setFailure('save');
        }
        finally {
            setBusy(false);
        }
    };
    const toggle = async (server, enabled) => {
        setBusy(true);
        setFailure(undefined);
        try {
            await saveServers(servers.map(current => current.id === server.id ? { ...current, enabled } : current));
        }
        catch {
            setFailure('save');
        }
        finally {
            setBusy(false);
        }
    };
    const statusFor = (server) => statuses.find(status => status.serverName === server.serverName);
    const isEditingExisting = servers.some(server => server.id === draft.id);
    const editor = (_jsxs("section", { className: css.fieldGroup, "aria-label": t('managed.editor'), children: [_jsx("h4", { className: css.fieldGroupTitle, children: t('managed.editor') }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('serverName') }), _jsx("input", { value: draft.serverName, disabled: busy, onChange: event => setDraft({ ...draft, serverName: event.currentTarget.value }) })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('transport') }), _jsxs("select", { value: draft.transport, disabled: busy, onChange: event => setDraft({ ...draft, transport: event.currentTarget.value, secrets: [] }), children: [_jsx("option", { value: "streamable-http", children: t('transport.streamable-http') }), _jsx("option", { value: "stdio", children: t('transport.stdio') })] })] }), draft.transport === 'streamable-http'
                ? _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('managed.endpoint') }), _jsx("input", { type: "url", value: draft.url, disabled: busy, onChange: event => setDraft({ ...draft, url: event.currentTarget.value }) }), _jsx("small", { children: t('endpointHint') })] })
                : _jsxs(_Fragment, { children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('managed.command') }), _jsx("input", { value: draft.command, disabled: busy, onChange: event => setDraft({ ...draft, command: event.currentTarget.value }) })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('managed.args') }), _jsx("textarea", { rows: 3, value: draft.args, disabled: busy, onChange: event => setDraft({ ...draft, args: event.currentTarget.value }) })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('managed.cwd') }), _jsx("input", { value: draft.cwd, disabled: busy, onChange: event => setDraft({ ...draft, cwd: event.currentTarget.value }) })] })] }), _jsxs("div", { className: css.serverList, children: [_jsx("h4", { children: draft.transport === 'streamable-http' ? t('managed.headers') : t('managed.environment') }), draft.secrets.map((row, index) => _jsxs("div", { className: css.secretRow, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: draft.transport === 'streamable-http' ? t('managed.headerName') : t('managed.envName') }), _jsx("input", { value: row.name, disabled: busy, onChange: event => setDraft({ ...draft, secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? { ...item, name: event.currentTarget.value } : item) }) })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('managed.credentialRef') }), _jsx("input", { value: row.ref, disabled: busy, onChange: event => setDraft({ ...draft, secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? { ...item, ref: event.currentTarget.value } : item) }) })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('managed.secret') }), _jsx("input", { type: "password", autoComplete: "new-password", value: row.value, disabled: busy, onChange: event => setDraft({ ...draft, secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? { ...item, value: event.currentTarget.value } : item) }) })] }), _jsx(Button, { variant: "outline", disabled: busy, onClick: () => setDraft({ ...draft, secrets: draft.secrets.filter((_item, rowIndex) => rowIndex !== index) }), children: t('managed.removeSecret') })] }, index)), _jsx(Button, { variant: "outline", disabled: busy, onClick: () => setDraft({ ...draft, secrets: [...draft.secrets, { name: '', ref: '', value: '' }] }), children: t('managed.addSecret') })] }), _jsxs("footer", { className: css.cardFooter, children: [_jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "primary", disabled: busy || !snapshot.writable, onClick: () => { void saveDraft(); }, children: t('save') }), _jsx(Button, { variant: "outline", disabled: busy, onClick: () => { void checkDraft(); }, children: busy ? t('checking') : t('check') })] }), checkState !== undefined && _jsx("p", { className: css.status, role: "status", children: checkState }), failure !== undefined && _jsx("p", { className: css.error, role: "alert", children: managedFailureLabel(t, failure) })] })] }));
    return _jsxs("section", { className: css.card, "aria-label": t('managed.title'), children: [_jsxs("header", { className: css.cardHeader, children: [_jsxs("div", { className: css.cardIdentity, children: [_jsx("span", { className: css.cardIcon, "aria-hidden": "true", children: _jsx(IconApiOutlineRegular, { size: 24 }) }), _jsxs("div", { className: css.cardCopy, children: [_jsx("h3", { className: css.cardTitle, children: t('managed.title') }), _jsx("p", { className: css.cardDescription, children: t('managed.description') })] })] }), _jsx(Button, { variant: "primary", disabled: busy || !snapshot.writable, "aria-expanded": !isEditingExisting && activeEditorId === draft.id, onClick: () => {
                            if (!isEditingExisting && activeEditorId === draft.id)
                                setActiveEditorId(undefined);
                            else {
                                const next = emptyDraft();
                                setDraft(next);
                                setActiveEditorId(next.id);
                            }
                            setFailure(undefined);
                            setCheckState(undefined);
                        }, children: t('managed.add') })] }), _jsxs("div", { className: css.serverList, children: [servers.length === 0 && activeEditorId !== draft.id && _jsx("p", { children: t('managed.empty') }), servers.map((server) => {
                        const status = statusFor(server);
                        const state = !server.enabled ? 'disabled' : status?.state ?? 'disconnected';
                        return _jsxs("article", { className: `${css.serverCard} ${activeEditorId === server.id ? css.serverCardEditing : ''}`, children: [_jsxs("div", { className: css.serverHeading, children: [_jsxs("div", { className: css.serverIdentity, children: [_jsx("span", { className: css.serverIcon, "aria-hidden": "true", children: _jsx(IconApiOutlineRegular, { size: 22 }) }), _jsxs("div", { children: [_jsx("strong", { children: server.serverName }), _jsxs("p", { children: [t(server.transport === 'stdio' ? 'transport.stdio' : 'transport.streamable-http'), " \u00B7 ", _jsx("span", { className: css.serverState, "data-state": state, children: managedStateLabel(t, state) })] })] })] }), _jsxs("div", { className: css.enableControl, children: [_jsx("span", { className: css.enableLabel, children: t('managed.enabled') }), _jsx(Switch, { checked: server.enabled, label: t('managed.enabled'), disabled: busy || !snapshot.writable, onChange: (value) => { void toggle(server, value); } })] })] }), _jsxs("p", { children: [t('toolCount'), ": ", status?.toolCount ?? 0] }), _jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "outline", disabled: busy || !snapshot.writable, "aria-expanded": activeEditorId === server.id, onClick: () => {
                                                if (activeEditorId === server.id)
                                                    setActiveEditorId(undefined);
                                                else {
                                                    setDraft(toDraft(server));
                                                    setActiveEditorId(server.id);
                                                }
                                                setFailure(undefined);
                                                setCheckState(undefined);
                                            }, children: t('managed.edit') }), _jsx(Button, { variant: "outline", disabled: busy || !snapshot.writable, onClick: () => { void remove(server.id); }, children: t('managed.delete') })] }), activeEditorId === server.id && editor] }, server.id);
                    }), !isEditingExisting && activeEditorId === draft.id && _jsx("article", { className: `${css.serverCard} ${css.serverCardEditing}`, children: editor })] })] });
}
function isAllowedEndpoint(input) {
    try {
        const url = new URL(input);
        const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, '');
        const loopback = hostname === 'localhost'
            || /^127(?:\.\d{1,3}){3}$/u.test(hostname) || hostname === '::1';
        return url.username === '' && url.password === ''
            && (url.protocol === 'https:' || (url.protocol === 'http:' && loopback));
    }
    catch (error) {
        void error;
        return false;
    }
}
function managedStateLabel(t, state) {
    switch (state) {
        case 'disabled': return t('managed.state.disabled');
        case 'connecting': return t('managed.state.connecting');
        case 'connected': return t('managed.state.connected');
        case 'reconnecting': return t('managed.state.reconnecting');
        case 'disconnected': return t('managed.state.disconnected');
    }
}
function managedCheckLabel(t, result) {
    switch (result.state) {
        case 'ready': return t('managed.checkReady').replace('{count}', String(result.toolCount));
        case 'authorization-required': return t('managed.check.authorization-required');
        case 'connection-failed': return t('managed.check.connection-failed');
        case 'timed-out': return t('managed.check.timed-out');
    }
}
function managedFailureLabel(t, failure) {
    switch (failure) {
        case 'save': return t('managed.error.save');
        case 'credential': return t('managed.error.credential');
        case 'check': return t('managed.error.check');
        case 'invalid': return t('managed.error.invalid');
    }
}
//# sourceMappingURL=ManagedMcpServers.js.map