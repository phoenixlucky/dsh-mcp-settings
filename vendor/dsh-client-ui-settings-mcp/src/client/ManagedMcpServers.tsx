import { useEffect, useState, useSyncExternalStore } from 'react'
import { Button, IconApiOutlineRegular, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { randomUUID } from '@deepseek-ai/dsh-util-crypto'
import type { ManagedMcpCheck, ManagedMcpServer, McpServerStatus } from '@deepseek-ai/dsh-mcp-client'
import css from './mcp-settings.module.css'

type Remote = ClientContext['remote']
interface Injected { form: ConfigForm<{ servers?: ManagedMcpServer[] }>; remote: Remote }
interface SecretRow { name: string; ref: string; value: string }
interface HeaderRow { name: string; value: string }
interface Draft {
  id: string
  serverName: string
  enabled: boolean
  purpose: 'model-tools' | 'project-memory'
  transport: 'streamable-http' | 'stdio'
  url: string
  headers: HeaderRow[]
  command: string
  args: string
  cwd: string
  secrets: SecretRow[]
}

function emptyDraft(): Draft {
  return { id: randomUUID(), serverName: '', enabled: true, purpose: 'model-tools', transport: 'streamable-http', url: '', headers: [], command: '', args: '', cwd: '', secrets: [] }
}

function toDraft(server: ManagedMcpServer): Draft {
  const secrets = server.transport === 'streamable-http' ? server.headerRefs : server.envRefs
  return {
    id: server.id, serverName: server.serverName, enabled: server.enabled, purpose: server.purpose ?? 'model-tools', transport: server.transport,
    url: server.transport === 'streamable-http' ? server.url : '',
    headers: server.transport === 'streamable-http' ? Object.entries(server.headers ?? {}).map(([name, value]) => ({ name, value })) : [],
    command: server.transport === 'stdio' ? server.command : '',
    args: server.transport === 'stdio' ? server.args.join('\n') : '',
    cwd: server.transport === 'stdio' ? server.cwd : '',
    secrets: Object.entries(secrets).map(([name, ref]) => ({ name, ref, value: '' })),
  }
}

/** Edit multiple host-managed MCP servers and check their connection state. */
export function ManagedMcpServers({ form, remote, t }: Injected & PropsLocale<'settings.mcp'>) {
  const snapshot = useSyncExternalStore(form.subscribe.bind(form), form.getSnapshot.bind(form))
  const servers = snapshot.value?.servers ?? []
  const [statuses, setStatuses] = useState<readonly McpServerStatus[]>([])
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [activeEditorId, setActiveEditorId] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<'save' | 'credential' | 'check' | 'invalid' | 'import-invalid'>()
  const [checkState, setCheckState] = useState<string>()
  const [importMode, setImportMode] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importState, setImportState] = useState<string>()

  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const reply = await remote.mcpClientStatus.list()
        if (active && reply.ok) setStatuses(reply.value)
      } catch (error) {
        void error
        if (active) setStatuses([])
      }
    }
    void refresh()
    const timer = setInterval(() => { void refresh() }, 5000)
    return () => { active = false; clearInterval(timer) }
  }, [remote])

  const saveServers = async (next: ManagedMcpServer[]) => {
    const accepted = await form.set('servers', next)
    if (!accepted) throw new Error('settings refused')
    await refreshStatuses()
  }
  const refreshStatuses = async () => {
    try {
      const reply = await remote.mcpClientStatus.list()
      if (reply.ok) setStatuses(reply.value)
    } catch { setStatuses([]) }
  }
  const prepareDraft = async (): Promise<ManagedMcpServer | undefined> => {
    const serverName = draft.serverName.trim()
    if (!/^[A-Za-z0-9_-]{1,32}$/u.test(serverName)
      || servers.some(server => server.id !== draft.id && server.serverName === serverName)
      || (draft.transport === 'streamable-http' ? !isAllowedEndpoint(draft.url) : draft.command.trim() === '')) {
      setFailure('invalid')
      return undefined
    }
    const refs: Record<string, string> = {}
    const headers: Record<string, string> = {}
    const headerNames = new Set<string>()
    for (const row of draft.headers) {
      const name = row.name.trim()
      const value = row.value
      const normalized = name.toLowerCase()
      if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || /[\r\n]/u.test(value)
        || /^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name) || headerNames.has(normalized)) {
        setFailure('invalid')
        return undefined
      }
      headerNames.add(normalized)
      headers[name] = value
    }
    for (const row of draft.secrets) {
      const name = row.name.trim()
      const ref = row.ref.trim()
      const validName = draft.transport === 'streamable-http'
        ? /^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name)
        : /^[A-Za-z_][A-Za-z0-9_]*$/u.test(name)
      const normalized = name.toLowerCase()
      if (!validName || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref) || headerNames.has(normalized)) {
        setFailure('invalid')
        return undefined
      }
      headerNames.add(normalized)
      refs[name] = ref
    }
    setFailure(undefined)
    try {
      for (const row of draft.secrets) {
        if (row.value === '') continue
        const reply = await remote.credentials.set(row.ref.trim(), row.value)
        if (!reply.ok) { setFailure('credential'); return undefined }
      }
    } catch (error) {
      void error
      setFailure('credential')
      return undefined
    }
    if (draft.purpose === 'project-memory' && draft.transport !== 'streamable-http') {
      setFailure('invalid')
      return undefined
    }
    return draft.transport === 'streamable-http'
      ? { id: draft.id, serverName, enabled: draft.enabled, purpose: draft.purpose, transport: 'streamable-http', url: draft.url.trim(), headers, headerRefs: refs }
      : { id: draft.id, serverName, enabled: draft.enabled, purpose: draft.purpose, transport: 'stdio', command: draft.command.trim(), args: draft.args.split(/\r?\n/u).filter(value => value.trim() !== ''), cwd: draft.cwd, envRefs: refs }
  }
  const saveDraft = async (): Promise<ManagedMcpServer | undefined> => {
    const server = await prepareDraft()
    if (server === undefined) return undefined
    const editing = servers.some(current => current.id === server.id)
    const next = editing ? servers.map(current => current.id === server.id ? server : current) : [...servers, server]
    try {
      await saveServers(next)
      setDraft(toDraft(server))
      setActiveEditorId(server.id)
      return server
    } catch {
      setFailure('save')
      return undefined
    }
  }
  const checkDraft = async () => {
    setBusy(true); setFailure(undefined); setCheckState(undefined)
    try {
      const server = await prepareDraft()
      if (server === undefined) return
      const reply = await remote.mcpServerManager.check(server)
      if (!reply.ok) { setFailure('check'); return }
      setCheckState(managedCheckLabel(t, reply.value))
    } catch { setFailure('check') } finally { setBusy(false) }
  }
  const remove = async (id: string) => {
    setBusy(true); setFailure(undefined)
    try {
      await saveServers(servers.filter(server => server.id !== id))
      if (activeEditorId === id) setActiveEditorId(undefined)
    }
    catch { setFailure('save') } finally { setBusy(false) }
  }
  const toggle = async (server: ManagedMcpServer, enabled: boolean) => {
    setBusy(true); setFailure(undefined)
    try { await saveServers(servers.map(current => current.id === server.id ? { ...current, enabled } : current)) }
    catch { setFailure('save') } finally { setBusy(false) }
  }
  const importServers = async () => {
    setBusy(true); setFailure(undefined); setImportState(undefined)
    try {
      const parsed: unknown = JSON.parse(importJson)
      if (!isRecord(parsed) || !isRecord(parsed.mcpServers)) throw new Error('invalid')
      const existingNames = new Set(servers.map(server => server.serverName.toLowerCase()))
      const importedNames = new Set<string>()
      const candidates: { serverName: string; url: string; headers: Record<string, string>; secrets: Record<string, string> }[] = []
      let skipped = 0
      for (const [serverName, raw] of Object.entries(parsed.mcpServers)) {
        if (existingNames.has(serverName.toLowerCase()) || importedNames.has(serverName.toLowerCase())) { skipped++; continue }
        if (!/^[A-Za-z0-9_-]{1,32}$/u.test(serverName) || !isRecord(raw)
          || raw.type !== 'streamable-http' || typeof raw.url !== 'string' || !isAllowedEndpoint(raw.url)
          || (raw.headers !== undefined && !isRecord(raw.headers))) throw new Error('invalid')
        const headers = Object.create(null) as Record<string, string>
        const secrets = Object.create(null) as Record<string, string>
        const headerNames = new Set<string>()
        for (const [name, value] of Object.entries(raw.headers ?? {})) {
          const normalized = name.toLowerCase()
          if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || typeof value !== 'string'
            || /[\r\n]/u.test(value) || headerNames.has(normalized)) throw new Error('invalid')
          headerNames.add(normalized)
          if (/^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name)) {
            secrets[name] = value
          } else headers[name] = value
        }
        importedNames.add(serverName.toLowerCase())
        candidates.push({ serverName, url: raw.url, headers, secrets })
      }
      if (candidates.length === 0) {
        if (skipped === 0) throw new Error('invalid')
      }
      const next: ManagedMcpServer[] = []
      for (const candidate of candidates) {
        const headerRefs = Object.create(null) as Record<string, string>
        for (const [name, value] of Object.entries(candidate.secrets)) {
          const ref = `MCP_IMPORT_${randomUUID().replaceAll('-', '')}`
          try {
            const reply = await remote.credentials.set(ref, value)
            if (!reply.ok) { setFailure('credential'); return }
          } catch {
            setFailure('credential')
            return
          }
          headerRefs[name] = ref
        }
        next.push({ id: randomUUID(), serverName: candidate.serverName, enabled: true, purpose: 'model-tools', transport: 'streamable-http', url: candidate.url, headers: candidate.headers, headerRefs })
      }
      try { if (next.length > 0) await saveServers([...servers, ...next]) }
      catch { setFailure('save'); return }
      setImportJson('')
      setImportState(t('managed.import.complete').replace('{imported}', String(next.length)).replace('{skipped}', String(skipped)))
    } catch {
      setImportState(undefined)
      setFailure('import-invalid')
    } finally { setBusy(false) }
  }
  const statusFor = (server: ManagedMcpServer) => statuses.find(status => status.serverName === server.serverName)
  const isEditingExisting = servers.some(server => server.id === draft.id)
  const editor = (
    <section className={css.fieldGroup} aria-label={t('managed.editor')}>
      <h4 className={css.fieldGroupTitle}>{t('managed.editor')}</h4>
      <div className={css.formGrid}>
        <label className={css.field}><span>{t('serverName')}</span><input value={draft.serverName} disabled={busy} onChange={event => setDraft({ ...draft, serverName: event.currentTarget.value })} /></label>
        <label className={css.field}><span>{t('managed.purpose')}</span><select value={draft.purpose} disabled={busy} onChange={event => {
          const purpose = event.currentTarget.value as Draft['purpose']
          setDraft({ ...draft, purpose, transport: purpose === 'project-memory' ? 'streamable-http' : draft.transport })
        }}><option value="model-tools">{t('managed.purpose.model-tools')}</option><option value="project-memory">{t('managed.purpose.project-memory')}</option></select></label>
        <label className={css.field}><span>{t('transport')}</span><select value={draft.transport} disabled={busy} onChange={event => setDraft({ ...draft, transport: event.currentTarget.value as Draft['transport'], secrets: [] })}>
          <option value="streamable-http">{t('transport.streamable-http')}</option><option value="stdio">{t('transport.stdio')}</option>
        </select></label>
      </div>
      {draft.transport === 'streamable-http'
        ? <label className={css.field}><span>{t('managed.endpoint')}</span><input type="url" value={draft.url} disabled={busy} onChange={event => setDraft({ ...draft, url: event.currentTarget.value })} /><small>{t('endpointHint')}</small></label>
        : <>
          <label className={css.field}><span>{t('managed.command')}</span><input value={draft.command} disabled={busy} onChange={event => setDraft({ ...draft, command: event.currentTarget.value })} /></label>
          <label className={css.field}><span>{t('managed.args')}</span><textarea rows={3} value={draft.args} disabled={busy} onChange={event => setDraft({ ...draft, args: event.currentTarget.value })} /></label>
          <label className={css.field}><span>{t('managed.cwd')}</span><input value={draft.cwd} disabled={busy} onChange={event => setDraft({ ...draft, cwd: event.currentTarget.value })} /></label>
        </>}
      <div className={css.serverList}>
        {draft.transport === 'streamable-http' && <>
          <h4>{t('managed.headers')}</h4>
          <small>{t('managed.headersHint')}</small>
          {draft.headers.map((row, index) => <div className={css.secretRow} key={`header-${index}`}>
            <label className={css.field}><span>{t('managed.headerName')}</span><input value={row.name} disabled={busy} onChange={event => setDraft({ ...draft, headers: draft.headers.map((item, rowIndex) => rowIndex === index ? { ...item, name: event.currentTarget.value } : item) })} /></label>
            <label className={css.field}><span>{t('managed.headerValue')}</span><input value={row.value} disabled={busy} onChange={event => setDraft({ ...draft, headers: draft.headers.map((item, rowIndex) => rowIndex === index ? { ...item, value: event.currentTarget.value } : item) })} /></label>
            <Button variant="outline" disabled={busy} onClick={() => setDraft({ ...draft, headers: draft.headers.filter((_item, rowIndex) => rowIndex !== index) })}>{t('managed.removeHeader')}</Button>
          </div>)}
          <Button variant="outline" disabled={busy} onClick={() => setDraft({ ...draft, headers: [...draft.headers, { name: '', value: '' }] })}>{t('managed.addHeader')}</Button>
        </>}
        <h4>{draft.transport === 'streamable-http' ? t('managed.credentials') : t('managed.environment')}</h4>
        {draft.transport === 'streamable-http' && <small>{t('managed.credentialsHint')}</small>}
        {draft.secrets.map((row, index) => <div className={css.secretRow} key={index}>
          <label className={css.field}><span>{draft.transport === 'streamable-http' ? t('managed.headerName') : t('managed.envName')}</span><input value={row.name} disabled={busy} onChange={event => setDraft({ ...draft, secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? { ...item, name: event.currentTarget.value } : item) })} /></label>
          <label className={css.field}><span>{t('managed.credentialRef')}</span><input value={row.ref} disabled={busy} onChange={event => setDraft({ ...draft, secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? { ...item, ref: event.currentTarget.value } : item) })} /></label>
          <label className={css.field}><span>{t('managed.secret')}</span><input type="password" autoComplete="new-password" value={row.value} disabled={busy} onChange={event => setDraft({ ...draft, secrets: draft.secrets.map((item, rowIndex) => rowIndex === index ? { ...item, value: event.currentTarget.value } : item) })} /></label>
          <Button variant="outline" disabled={busy} onClick={() => setDraft({ ...draft, secrets: draft.secrets.filter((_item, rowIndex) => rowIndex !== index) })}>{t('managed.removeSecret')}</Button>
        </div>)}
        <Button variant="outline" disabled={busy} onClick={() => setDraft({ ...draft, secrets: [...draft.secrets, { name: '', ref: '', value: '' }] })}>{t('managed.addSecret')}</Button>
      </div>
      <footer className={css.cardFooter}>
        <div className={css.actions}>
          <Button variant="primary" disabled={busy || !snapshot.writable} onClick={() => { void saveDraft() }}>{t('save')}</Button>
          <Button variant="outline" disabled={busy} onClick={() => { void checkDraft() }}>{busy ? t('checking') : t('check')}</Button>
        </div>
        {checkState !== undefined && <p className={css.status} role="status">{checkState}</p>}
        {failure !== undefined && <p className={css.error} role="alert">{managedFailureLabel(t, failure)}</p>}
      </footer>
    </section>
  )

  return <section className={css.card} aria-label={t('managed.title')}>
    <header className={css.cardHeader}>
      <div className={css.cardIdentity}>
        <span className={css.cardIcon} aria-hidden="true"><IconApiOutlineRegular size={24} /></span>
        <div className={css.cardCopy}><h3 className={css.cardTitle}>{t('managed.title')}</h3><p className={css.cardDescription}>{t('managed.description')}</p></div>
      </div>
      <div className={css.actions}>
      <Button variant="outline" disabled={busy || !snapshot.writable} aria-expanded={importMode} onClick={() => {
        setImportMode(!importMode)
        setActiveEditorId(undefined)
        setImportState(undefined)
        setFailure(undefined)
      }}>{t('managed.import')}</Button>
      <Button variant="primary" disabled={busy || !snapshot.writable} aria-expanded={!isEditingExisting && activeEditorId === draft.id} onClick={() => {
        setImportMode(false)
        if (!isEditingExisting && activeEditorId === draft.id) setActiveEditorId(undefined)
        else {
          const next = emptyDraft()
          setDraft(next)
          setActiveEditorId(next.id)
        }
        setFailure(undefined)
        setCheckState(undefined)
      }}>{t('managed.add')}</Button>
      </div>
    </header>
    {importMode && <section className={css.fieldGroup} aria-label={t('managed.import')}>
      <label className={css.field}><span>{t('managed.import')}</span><textarea rows={8} value={importJson} disabled={busy} onChange={event => setImportJson(event.currentTarget.value)} placeholder={t('managed.import.placeholder')} /></label>
      <small>{t('managed.import.hint')}</small>
      <div className={css.actions}><Button variant="primary" disabled={busy || !snapshot.writable || importJson.trim() === ''} onClick={() => { void importServers() }}>{busy ? t('checking') : t('managed.import.action')}</Button></div>
      {importState !== undefined && <p className={css.status} role="status">{importState}</p>}
      {failure !== undefined && <p className={css.error} role="alert">{managedFailureLabel(t, failure)}</p>}
    </section>}
    <div className={css.serverList}>
      {servers.length === 0 && activeEditorId !== draft.id && <p>{t('managed.empty')}</p>}
      {servers.map((server) => {
        const status = statusFor(server)
        const state = !server.enabled ? 'disabled' : status?.state ?? 'disconnected'
        return <article className={`${css.serverCard} ${activeEditorId === server.id ? css.serverCardEditing : ''}`} key={server.id}>
          <div className={css.serverHeading}>
            <div className={css.serverIdentity}>
              <span className={css.serverIcon} aria-hidden="true"><IconApiOutlineRegular size={22} /></span>
              <div><strong>{server.serverName}</strong><p>{t(server.transport === 'stdio' ? 'transport.stdio' : 'transport.streamable-http')} · <span className={css.serverState} data-state={state}>{managedStateLabel(t, state)}</span></p></div>
            </div>
            <div className={css.enableControl}>
              <span className={css.enableLabel}>{t('managed.enabled')}</span>
              <Switch checked={server.enabled} label={t('managed.enabled')} disabled={busy || !snapshot.writable} onChange={(value) => { void toggle(server, value) }} />
            </div>
          </div>
          <p className={css.toolCount}>{t('toolCount')}: {status?.toolCount ?? 0}</p>
          <div className={css.actions}>
            <Button variant="outline" disabled={busy || !snapshot.writable} aria-expanded={activeEditorId === server.id} onClick={() => {
              if (activeEditorId === server.id) setActiveEditorId(undefined)
              else {
                setDraft(toDraft(server))
                setActiveEditorId(server.id)
              }
              setFailure(undefined)
              setCheckState(undefined)
            }}>{t('managed.edit')}</Button>
            <Button variant="outline" disabled={busy || !snapshot.writable} onClick={() => { void remove(server.id) }}>{t('managed.delete')}</Button>
          </div>
          {activeEditorId === server.id && editor}
        </article>
      })}
      {!isEditingExisting && activeEditorId === draft.id && <article className={`${css.serverCard} ${css.serverCardEditing}`}>{editor}</article>}
    </div>
  </section>
}

function isAllowedEndpoint(input: string): boolean {
  try {
    const url = new URL(input)
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, '')
    const loopback = hostname === 'localhost'
      || /^127(?:\.\d{1,3}){3}$/u.test(hostname) || hostname === '::1'
    return url.username === '' && url.password === ''
      && (url.protocol === 'https:' || (url.protocol === 'http:' && loopback))
  } catch (error) {
    void error
    return false
  }
}

function managedStateLabel(
  t: PropsLocale<'settings.mcp'>['t'],
  state: 'disabled' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected',
): string {
  switch (state) {
    case 'disabled': return t('managed.state.disabled')
    case 'connecting': return t('managed.state.connecting')
    case 'connected': return t('managed.state.connected')
    case 'reconnecting': return t('managed.state.reconnecting')
    case 'disconnected': return t('managed.state.disconnected')
  }
}

function managedCheckLabel(
  t: PropsLocale<'settings.mcp'>['t'],
  result: ManagedMcpCheck,
): string {
  switch (result.state) {
    case 'ready': return t('managed.checkReady').replace('{count}', String(result.toolCount))
    case 'authorization-required': return t('managed.check.authorization-required')
    case 'connection-failed': return t('managed.check.connection-failed')
    case 'timed-out': return t('managed.check.timed-out')
  }
}

function managedFailureLabel(
  t: PropsLocale<'settings.mcp'>['t'],
  failure: 'save' | 'credential' | 'check' | 'invalid' | 'import-invalid',
): string {
  switch (failure) {
    case 'save': return t('managed.error.save')
    case 'credential': return t('managed.error.credential')
    case 'check': return t('managed.error.check')
    case 'invalid': return t('managed.error.invalid')
    case 'import-invalid': return t('managed.import.invalid')
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
