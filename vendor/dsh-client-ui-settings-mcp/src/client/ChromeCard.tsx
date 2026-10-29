import { useEffect, useState } from 'react'
import { Button, IconGlobeOutlineRegular, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ChromeConnectionCheck } from '@deepseek-ai/dsh-mcp-client'
import css from './mcp-settings.module.css'

const CREDENTIAL = 'DSH_CHROME_MCP_TOKEN'
interface Config { enabled?: boolean; url?: string; origin?: string }
interface Injected { form: ConfigForm<Config>; remote: ClientContext['remote'] }

/** Configure the managed Chrome MCP endpoint and its separately stored token. */
export function ChromeCard({ form, remote, t }: Injected & PropsLocale<'settings.mcp'>) {
  const snapshot = form.getSnapshot()
  const [enabled, setEnabled] = useState(snapshot.value?.enabled ?? false)
  const [url, setUrl] = useState(snapshot.value?.url ?? '')
  const [origin, setOrigin] = useState(snapshot.value?.origin ?? '')
  const [token, setToken] = useState('')
  const [tokenConfigured, setTokenConfigured] = useState(false)
  const [tokenWritable, setTokenWritable] = useState(false)
  const [status, setStatus] = useState<ChromeConnectionCheck>({ state: 'not-configured' })
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<'save' | 'credential' | 'check'>()

  useEffect(() => form.subscribe(() => {
    const value = form.getSnapshot().value
    if (value !== undefined) { setEnabled(value.enabled ?? false); setUrl(value.url ?? ''); setOrigin(value.origin ?? '') }
  }), [form])
  useEffect(() => {
    let active = true
    void remote.credentials.describe([CREDENTIAL]).then((reply) => {
      const credential = reply.ok ? reply.value[CREDENTIAL] : undefined
      if (active && credential !== undefined) { setTokenConfigured(credential.configured); setTokenWritable(credential.writable) }
    }).catch(() => { if (active) setFailure('credential') })
    return () => { active = false }
  }, [remote])

  useEffect(() => {
    let active = true
    void remote.chromeMcp.checkChromeConnection().then((reply) => {
      if (active && reply.ok) setStatus(reply.value)
      else if (active) setFailure('check')
    }).catch(() => { if (active) setFailure('check') })
    return () => { active = false }
  }, [remote])

  const readStatus = async () => {
    try {
      const reply = await remote.chromeMcp.checkChromeConnection()
      if (!reply.ok) { setFailure('check'); return }
      setStatus(reply.value)
    } catch { setFailure('check') }
  }
  const check = async () => {
    setBusy(true); setFailure(undefined)
    try { await readStatus() } finally { setBusy(false) }
  }
  const save = async () => {
    setBusy(true); setFailure(undefined)
    try {
      const accepted = await form.mutate([
        { op: 'set', path: ['enabled'], value: enabled },
        { op: 'set', path: ['url'], value: url },
        { op: 'set', path: ['origin'], value: origin },
      ])
      if (!accepted) { setFailure('save'); return }
      if (token !== '') {
        const reply = await remote.credentials.set(CREDENTIAL, token)
        if (!reply.ok) { setFailure('credential'); return }
        setToken(''); setTokenConfigured(true)
      }
      await readStatus()
    } catch { setFailure('save') } finally { setBusy(false) }
  }
  const tokenLabel = tokenWritable ? tokenConfigured ? 'tokenSet' : 'tokenUnset' : 'credentialsUnavailable'

  return <section className={css.card} aria-label={t('chromeTitle')}>
    <header className={css.cardHeader}>
      <div className={css.cardIdentity}>
        <span className={css.cardIcon} aria-hidden="true"><IconGlobeOutlineRegular size={24} /></span>
        <div className={css.cardCopy}><h3 className={css.cardTitle}>Chrome MCP</h3><p className={css.cardDescription}>{t('chromeDescription')}</p></div>
      </div>
      <div className={css.enableControl}>
        <span className={css.enableLabel}>{t('chromeEnabled')}</span>
        <Switch checked={enabled} label={t('chromeEnabled')} disabled={busy || !form.getSnapshot().writable} onChange={setEnabled} />
      </div>
    </header>
    <section className={css.fieldGroup} aria-labelledby="chrome-connection-settings">
      <h4 className={css.fieldGroupTitle} id="chrome-connection-settings">{t('connectionSettings')}</h4>
      <label className={css.field}><span>{t('chromeEndpoint')}</span><input type="url" value={url} disabled={busy || !form.getSnapshot().writable} onChange={event => setUrl(event.currentTarget.value)} /><small>{t('chromeEndpointHint')}</small></label>
      <label className={css.field}><span>{t('chromeOrigin')}</span><input type="text" value={origin} disabled={busy || !form.getSnapshot().writable} onChange={event => setOrigin(event.currentTarget.value)} /><small>{t('chromeOriginHint')}</small></label>
      <label className={css.field}><span>{t('token')}</span><input type="password" autoComplete="new-password" value={token} disabled={busy || !tokenWritable} onChange={event => setToken(event.currentTarget.value)} /><small>{t(tokenLabel)}</small></label>
    </section>
    <footer className={css.cardFooter}>
      <p className={css.status} role="status"><span>{t('status')}</span><strong data-state={status.state}>{status.state === 'ready' && status.toolCount !== undefined ? t('chromeStatus.readyCount').replace('{count}', String(status.toolCount)) : t(`chromeStatus.${status.state}`)}</strong></p>
      <div className={css.actions}><Button variant="primary" disabled={busy || !form.getSnapshot().writable} onClick={() => { void save() }}>{t('save')}</Button><Button variant="outline" disabled={busy} onClick={() => { void check() }}>{busy ? t('checking') : t('check')}</Button></div>
      {failure !== undefined && <p className={css.error} role="alert">{t(`chromeError.${failure}`)}</p>}
    </footer>
  </section>
}
