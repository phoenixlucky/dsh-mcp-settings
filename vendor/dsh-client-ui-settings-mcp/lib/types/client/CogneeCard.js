import { useEffect, useState } from 'react';
import { Button, IconDataOutlineRegular, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './mcp-settings.module.css';
const CREDENTIAL = 'DSH_COGNEE_MCP_TOKEN';
/** Settings screen for VISION-LIAO's endpoint, separate credential, and readiness. */
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
    return (<section className={css.card} aria-label={t('cogneeTitle')}>
      <header className={css.cardHeader}>
        <div className={css.cardIdentity}>
          <span className={css.cardIcon} aria-hidden="true"><IconDataOutlineRegular size={24}/></span>
          <div className={css.cardCopy}><h3 className={css.cardTitle}>{t('cogneeTitle')}</h3><p className={css.cardDescription}>{t('cogneeDescription')}</p></div>
        </div>
        <div className={css.enableControl}>
          <span className={css.enableLabel}>{t('enabled')}</span>
          <Switch checked={enabled} label={t('enabled')} disabled={busy} onChange={setEnabled}/>
        </div>
      </header>
      <section className={css.fieldGroup} aria-labelledby="vision-liao-connection-settings">
        <h4 className={css.fieldGroupTitle} id="vision-liao-connection-settings">{t('connectionSettings')}</h4>
        <label className={css.field}><span>{t('endpoint')}</span><input value={endpoint} disabled={busy} onChange={(event) => { setEndpoint(event.currentTarget.value); }}/><small>{t('endpointHint')}</small></label>
        <label className={css.field}><span>{t('token')}</span><input type="password" autoComplete="new-password" value={token} disabled={busy || !tokenWritable} onChange={(event) => { setToken(event.currentTarget.value); }}/><small>{t(tokenConfigured ? 'tokenSet' : 'tokenUnset')}</small></label>
      </section>
      <footer className={css.cardFooter}>
        <p className={css.status} role="status"><span>{t('status')}</span><strong data-state={status}>{t(`status.${status}`)}</strong></p>
        <div className={css.actions}><Button variant="primary" disabled={busy || !form.getSnapshot().writable} onClick={() => { void save(); }}>{t('save')}</Button><Button variant="outline" disabled={busy} onClick={() => { void check(); }}>{busy ? t('checking') : t('check')}</Button></div>
        {failed && <p className={css.error} role="alert">{t('error')}</p>}
      </footer>
    </section>);
}
//# sourceMappingURL=CogneeCard.js.map