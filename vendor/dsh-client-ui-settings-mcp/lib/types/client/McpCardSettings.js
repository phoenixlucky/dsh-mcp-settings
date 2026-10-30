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
    const field = (key, label) => (<label className={css.field}>
      <span>{label}</span>
      <input value={draft[key] ?? ''} disabled={!state.writable} onChange={(event) => {
            setDraft(value => ({ ...value, [key]: event.currentTarget.value }));
        }}/>
    </label>);
    const flag = (key, label) => (<label className={css.switchRow}>
      <span>{label}</span>
      <Switch checked={draft[key] ?? true} label={label} disabled={!state.writable} onChange={(value) => {
            setDraft(current => ({ ...current, [key]: value }));
        }}/>
    </label>);
    return <section className={css.card} aria-label={t('appearanceTitle')}>
    <h3>{t('appearanceTitle')}</h3>
    <div className={css.serverList} aria-label={t('serverCards')}>
      <h4>{t('serverCards')}</h4>
      {servers.length === 0 && <p role="status">{t(statusAvailable ? 'noServers' : 'statusUnavailable')}</p>}
      {servers.map((server) => {
            const appearance = saved[server.serverName] ?? {};
            return <article className={css.serverCard} key={server.id}>
          <strong>{appearance.icon && <span aria-hidden="true">{appearance.icon} </span>}{appearance.displayName || server.serverName}</strong>
          {appearance.description && <p>{appearance.description}</p>}
          {appearance.showConnectionStatus !== false && <span>{t('connectionState')}: {t(`connection.${server.state}`)}</span>}
          {appearance.showToolCount !== false && <span>{t('toolCount')}: {server.toolCount}</span>}
          {appearance.showTransport !== false && <span>{t('transport')}: {t(`transport.${server.transport}`)}</span>}
          {appearance.showSource !== false && <span>{t('source')}: {server.source}</span>}
        </article>;
        })}
    </div>
    <label className={css.field}><span>{t('serverName')}</span><input value={serverName} disabled={!state.writable} onChange={(event) => { setServerName(event.currentTarget.value); load(event.currentTarget.value); }}/><small>{t('serverNameHint')}</small></label>
    {field('displayName', t('displayName'))}{field('description', t('description'))}{field('icon', t('icon'))}
    {flag('showConnectionStatus', t('showConnectionStatus'))}{flag('showToolCount', t('showToolCount'))}{flag('showTransport', t('showTransport'))}{flag('showSource', t('showSource'))}
    <div className={css.actions}><Button variant="primary" disabled={!state.writable} onClick={() => { void save(); }}>{t('saveAppearance')}</Button><Button variant="outline" disabled={!state.writable} onClick={() => { void reset(); }}>{t('resetAppearance')}</Button></div>
    {error && <p role="alert">{t('invalidServerName')}</p>}
  </section>;
}
//# sourceMappingURL=McpCardSettings.js.map