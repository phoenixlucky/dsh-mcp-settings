import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Button, IconApiOutlineRegular, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { randomUUID } from '@deepseek-ai/dsh-util-crypto'
import type { ManagedMcpCheck, ManagedMcpServer } from '@deepseek-ai/dsh-mcp-client'
import css from './mcp-settings.module.css'

type Remote = ClientContext['remote']
type Transport = ManagedMcpServer['transport']
type ServerState = 'disabled' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unknown'
type StatusFilter = 'all' | ServerState
type TransportFilter = 'all' | Transport
interface StatusRow {
  serverName: string
  transport: Transport
  state: Exclude<ServerState, 'disabled' | 'unknown'>
  toolCount: number
  tools?: readonly { name: string, description: string }[]
}
/** One bounded, user-initiated tool inventory probe for a connected row. */
interface ToolProbe {
  state: 'loading' | 'ready' | 'failed'
  tools?: readonly { name: string, description: string }[]
  toolCount?: number
}
/** One Remote call result as the Client facade returns it. */
interface RemoteReply<T> { ok: boolean; value?: T; error?: { message?: string } }
/** `remote.mcpClientStatus` facade mounted by this plugin. */
export interface McpStatusApi { list(): Promise<RemoteReply<readonly StatusRow[]>> }
/** `remote.mcpServerManager` facade mounted by this plugin. */
export interface McpManagerApi {
  check(server: ManagedMcpServer): Promise<RemoteReply<ManagedMcpCheck>>
  revealSecret?(ref: string): Promise<RemoteReply<{ value?: string }>>
}
interface Injected {
  form: ConfigForm<{ servers?: ManagedMcpServer[] }>
  remote: Remote
  statusApi?: McpStatusApi
  managerApi?: McpManagerApi
}
interface SecretRow { id: string; name: string; ref: string; value: string; visible: boolean }
interface HeaderRow { name: string; value: string }
interface ImportCandidate { server: Omit<ManagedMcpServer, 'id'>; secrets: Record<string, string>; secretRefs: Record<string, string> }
interface ImportPreview { candidates: ImportCandidate[]; skipped: number; secretCount: number; revision: number | undefined }
interface Draft {
  id: string
  serverName: string
  enabled: boolean
  transport: Transport
  url: string
  headers: HeaderRow[]
  command: string
  args: string
  cwd: string
  secrets: SecretRow[]
}

function emptyDraft(): Draft {
  return { id: randomUUID(), serverName: '', enabled: true, transport: 'streamable-http', url: '', headers: [], command: '', args: '', cwd: '', secrets: [] }
}

function toDraft(server: ManagedMcpServer): Draft {
  const secrets = server.transport === 'streamable-http' ? server.headerRefs : server.envRefs
  return {
    id: server.id, serverName: server.serverName, enabled: server.enabled, transport: server.transport,
    url: server.transport === 'streamable-http' ? server.url : '',
    headers: server.transport === 'streamable-http' ? Object.entries(server.headers ?? {}).map(([name, value]) => ({ name, value })) : [],
    command: server.transport === 'stdio' ? server.command : '',
    args: server.transport === 'stdio' ? server.args.join('\n') : '',
    cwd: server.transport === 'stdio' ? server.cwd : '',
    secrets: Object.entries(secrets).map(([name, ref]) => ({ id: randomUUID(), name, ref, value: '', visible: false })),
  }
}

/** Read live connection rows from the status Remote this plugin mounted. */
async function readStatusRows(statusApi: McpStatusApi | undefined): Promise<{ rows: readonly StatusRow[], problem?: string }> {
  if (statusApi === undefined) return { rows: [], problem: 'status-namespace-unmounted' }
  try {
    const reply = await statusApi.list()
    if (reply?.ok === true) return { rows: reply.value ?? [] }
    return { rows: [], problem: `status-rejected ${reply?.error?.message ?? ''}`.trim() }
  } catch (error) {
    return { rows: [], problem: `status-failed ${error instanceof Error ? error.message : 'unknown'}` }
  }
}

/** Probe each enabled server through the manager's bounded connection check. */
async function probeServers(managerApi: McpManagerApi | undefined, servers: readonly ManagedMcpServer[]): Promise<readonly StatusRow[]> {
  if (managerApi === undefined) return []
  const rows: StatusRow[] = []
  for (const server of servers) {
    if (!server.enabled) continue
    try {
      const reply = await managerApi.check(server)
      if (!reply.ok) continue
      const result = reply.value
      if (result?.state === 'ready') {
        rows.push({ serverName: server.serverName, transport: server.transport, state: 'connected', toolCount: result.toolCount, tools: result.tools })
      }
    } catch {
      // A failed probe leaves the row unknown rather than claiming a disconnect.
    }
  }
  return rows
}

/** Edit multiple host-managed MCP servers and check their connection state. */
export function ManagedMcpServers({ form, remote, statusApi, managerApi, t }: Injected & PropsLocale<'settings.mcp'>) {
  const snapshot = useSyncExternalStore(form.subscribe.bind(form), form.getSnapshot.bind(form))
  const servers = snapshot.value?.servers ?? []
  const [statuses, setStatuses] = useState<readonly StatusRow[]>([])
  const [probed, setProbed] = useState<readonly StatusRow[]>([])
  const [statusProblem, setStatusProblem] = useState<string>()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [activeEditorId, setActiveEditorId] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<'save' | 'credential' | 'check' | 'invalid' | 'import-invalid'>()
  const [importFailure, setImportFailure] = useState<'save' | 'credential' | 'import-invalid'>()
  const [checkState, setCheckState] = useState<string>()
  const [importJson, setImportJson] = useState('')
  const [importState, setImportState] = useState<string>()
  const [importPreview, setImportPreview] = useState<ImportPreview>()
  const [importOpen, setImportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<StatusFilter>('all')
  const [transportFilter, setTransportFilter] = useState<TransportFilter>('all')
  const [expandedToolIds, setExpandedToolIds] = useState<ReadonlySet<string>>(() => new Set())
  const [toolProbes, setToolProbes] = useState<Readonly<Record<string, ToolProbe>>>({})
  const statusRequestId = useRef(0)
  const checkSignature = useRef('')
  const draftRef = useRef(draft)
  draftRef.current = draft

  useEffect(() => {
    let active = true
    const refresh = async (deep: boolean) => {
      const requestId = ++statusRequestId.current
      const result = await readStatusRows(statusApi)
      if (!active || requestId !== statusRequestId.current) return
      setStatuses(result.rows)
      setStatusProblem(result.problem !== undefined && result.rows.length === 0 ? result.problem : undefined)
      if (result.rows.length > 0) { setProbed([]); return }
      if (!deep) return
      const current = form.getSnapshot().value?.servers ?? []
      const measured = await probeServers(managerApi, current)
      if (!active || requestId !== statusRequestId.current) return
      setProbed(measured)
    }
    void refresh(true)
    const timer = setInterval(() => { void refresh(false) }, 5000)
    return () => { active = false; clearInterval(timer) }
    // `t` only localizes the same fixed message, so the poll follows the mounted facades alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusApi, managerApi])

  const refreshStatuses = async (deep = true) => {
    const requestId = ++statusRequestId.current
    const result = await readStatusRows(statusApi)
    if (requestId !== statusRequestId.current) return
    setStatuses(result.rows)
    setStatusProblem(result.problem !== undefined && result.rows.length === 0 ? result.problem : undefined)
    if (result.rows.length > 0) { setProbed([]); return }
    if (!deep) return
    const measured = await probeServers(managerApi, form.getSnapshot().value?.servers ?? [])
    if (requestId !== statusRequestId.current) return
    setProbed(measured)
  }
  const saveServers = async (next: ManagedMcpServer[]) => {
    const accepted = await form.set('servers', next)
    if (!accepted) throw new Error('settings refused')
    await refreshStatuses()
  }
  const closeEditor = () => {
    setActiveEditorId(undefined)
    setDraft(emptyDraft())
    setFailure(undefined)
    setCheckState(undefined)
  }
  /** Reveal one secret row: stored values are fetched from the Host, typed values just toggle. */
  const toggleSecret = async (rowId: string) => {
    const row = draft.secrets.find(item => item.id === rowId)
    if (row === undefined) return
    const reveal = (value?: string) => setDraft(current => ({
      ...current,
      secrets: current.secrets.map(item => item.id === rowId ? { ...item, visible: true, ...(value === undefined ? {} : { value }) } : item),
    }))
    if (row.visible) {
      setDraft(current => ({ ...current, secrets: current.secrets.map(item => item.id === rowId ? { ...item, visible: false } : item) }))
      return
    }
    if (row.value !== '' || row.ref.trim() === '' || managerApi?.revealSecret === undefined) {
      reveal()
      return
    }
    setBusy(true)
    try {
      const reply = await managerApi.revealSecret(row.ref.trim())
      reveal(reply.ok ? reply.value?.value ?? '' : '')
    } catch {
      reveal()
    } finally {
      setBusy(false)
    }
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
    return draft.transport === 'streamable-http'
      ? { id: draft.id, serverName, enabled: draft.enabled, purpose: 'model-tools', transport: 'streamable-http', url: draft.url.trim(), headers, headerRefs: refs }
      : { id: draft.id, serverName, enabled: draft.enabled, purpose: 'model-tools', transport: 'stdio', command: draft.command.trim(), args: draft.args.split(/\r?\n/u).filter(value => value.trim() !== ''), cwd: draft.cwd, envRefs: refs }
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
    if (busy) return
    const signature = JSON.stringify(draft)
    checkSignature.current = signature
    setBusy(true); setFailure(undefined); setCheckState(undefined)
    try {
      if (managerApi === undefined) { setFailure('check'); return }
      const server = await prepareDraft()
      if (server === undefined) return
      const reply = await managerApi.check(server)
      // Drop a late result when the user edited the draft while the check ran.
      if (checkSignature.current !== signature || signature !== JSON.stringify(draftRef.current)) return
      if (!reply.ok || reply.value === undefined) { setFailure('check'); return }
      setCheckState(managedCheckLabel(t, reply.value))
    } catch { setFailure('check') } finally { setBusy(false) }
  }
  const remove = async (id: string) => {    setBusy(true); setFailure(undefined)
    try {
      await saveServers(servers.filter(server => server.id !== id))
      if (activeEditorId === id) closeEditor()
    }
    catch { setFailure('save') } finally { setBusy(false) }
  }
  const toggle = async (server: ManagedMcpServer, enabled: boolean) => {
    setBusy(true); setFailure(undefined)
    try { await saveServers(servers.map(current => current.id === server.id ? { ...current, enabled } : current)) }
    catch { setFailure('save') } finally { setBusy(false) }
  }
  const exportServers = () => {
    const exportableServers = servers.map(server => {
      const common = { id: server.id, serverName: server.serverName, enabled: server.enabled, purpose: server.purpose }
      if (server.transport === 'streamable-http') {
        const headers = Object.fromEntries(Object.entries(server.headers ?? {}).filter(([name]) => !/^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name)))
        return { ...common, transport: server.transport, url: server.url, ...(Object.keys(headers).length > 0 ? { headers } : {}), headerRefs: { ...server.headerRefs } }
      }
      return { ...common, transport: server.transport, command: server.command, args: [...server.args], cwd: server.cwd, envRefs: { ...server.envRefs } }
    })
    const url = URL.createObjectURL(new Blob([JSON.stringify({ servers: exportableServers }, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'mcp-servers.json'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const previewImport = () => {
    setImportFailure(undefined); setImportState(undefined); setImportPreview(undefined)
    try {
      const parsed: unknown = JSON.parse(importJson)
      if (!isRecord(parsed) || (parsed.mcpServers !== undefined && parsed.servers !== undefined)) throw new Error('invalid')
      const existingNames = new Set(servers.map(server => server.serverName.toLowerCase()))
      const importedNames = new Set<string>()
      const candidates: ImportCandidate[] = []
      let skipped = 0
      const append = (serverName: string, server: Omit<ManagedMcpServer, 'id'>, secrets: Record<string, string>) => {
        if (!/^[A-Za-z0-9_-]{1,32}$/u.test(serverName)) throw new Error('invalid')
        if (existingNames.has(serverName.toLowerCase()) || importedNames.has(serverName.toLowerCase())) { skipped++; return }
        importedNames.add(serverName.toLowerCase())
        const secretRefs = Object.fromEntries(Object.keys(secrets).map(name => [name, `MCP_IMPORT_${randomUUID().replaceAll('-', '')}`]))
        candidates.push({ server, secrets, secretRefs })
      }
      if (isRecord(parsed.mcpServers)) {
        for (const [serverName, raw] of Object.entries(parsed.mcpServers)) {
          if (existingNames.has(serverName.toLowerCase()) || importedNames.has(serverName.toLowerCase())) { skipped++; continue }
          if (!isRecord(raw) || raw.type !== 'streamable-http' || typeof raw.url !== 'string' || !isAllowedEndpoint(raw.url)
            || (raw.headers !== undefined && !isRecord(raw.headers))) throw new Error('invalid')
          const headers = Object.create(null) as Record<string, string>
          const secrets = Object.create(null) as Record<string, string>
          const headerNames = new Set<string>()
          for (const [name, value] of Object.entries(raw.headers ?? {})) {
            const normalized = name.toLowerCase()
            if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || typeof value !== 'string'
              || /[\r\n]/u.test(value) || headerNames.has(normalized)) throw new Error('invalid')
            headerNames.add(normalized)
            if (/^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name)) secrets[name] = value
            else headers[name] = value
          }
          append(serverName, { serverName, enabled: true, purpose: 'model-tools', transport: 'streamable-http', url: raw.url, headers, headerRefs: {} }, secrets)
        }
      } else if (Array.isArray(parsed.servers)) {
        for (const raw of parsed.servers) {
          if (!isRecord(raw) || typeof raw.serverName !== 'string') throw new Error('invalid')
          const serverName = raw.serverName
          if (existingNames.has(serverName.toLowerCase()) || importedNames.has(serverName.toLowerCase())) { skipped++; continue }
          if (typeof raw.enabled !== 'boolean' || (raw.purpose !== undefined && raw.purpose !== 'model-tools' && raw.purpose !== 'project-memory')) throw new Error('invalid')
          const purpose = raw.purpose ?? 'model-tools'
          if (raw.transport === 'streamable-http' && typeof raw.url === 'string' && isAllowedEndpoint(raw.url)
            && (raw.headers === undefined || isRecord(raw.headers)) && (raw.headerRefs === undefined || isRecord(raw.headerRefs))) {
            const headers = Object.create(null) as Record<string, string>
            const headerRefs = Object.create(null) as Record<string, string>
            const secrets = Object.create(null) as Record<string, string>
            const headerNames = new Set<string>()
            for (const [name, value] of Object.entries(raw.headers ?? {})) {
              const normalized = name.toLowerCase()
              if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || typeof value !== 'string'
                || /[\r\n]/u.test(value) || headerNames.has(normalized)) throw new Error('invalid')
              headerNames.add(normalized)
              if (/^(authorization|cookie|proxy-authorization|x-api-key)$/iu.test(name)) secrets[name] = value
              else headers[name] = value
            }
            for (const [name, ref] of Object.entries(raw.headerRefs ?? {})) {
              const normalized = name.toLowerCase()
              if (!/^[!#$%&'*+\-.^_\x60|~0-9A-Za-z]+$/u.test(name) || typeof ref !== 'string'
                || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref) || headerNames.has(normalized)) throw new Error('invalid')
              headerNames.add(normalized)
              headerRefs[name] = ref
            }
            append(serverName, { serverName, enabled: raw.enabled, purpose, transport: 'streamable-http', url: raw.url, headers, headerRefs }, secrets)
          } else if (raw.transport === 'stdio' && typeof raw.command === 'string' && raw.command.trim() !== ''
            && Array.isArray(raw.args) && raw.args.every(value => typeof value === 'string') && typeof raw.cwd === 'string'
            && (raw.envRefs === undefined || isRecord(raw.envRefs))) {
            const envRefs = Object.create(null) as Record<string, string>
            for (const [name, ref] of Object.entries(raw.envRefs ?? {})) {
              if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(name) || typeof ref !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref)) throw new Error('invalid')
              envRefs[name] = ref
            }
            append(serverName, { serverName, enabled: raw.enabled, purpose, transport: 'stdio', command: raw.command.trim(), args: raw.args as string[], cwd: raw.cwd, envRefs }, {})
          } else throw new Error('invalid')
        }
      } else throw new Error('invalid')
      if (candidates.length === 0 && skipped === 0) throw new Error('invalid')
      setImportPreview({
        candidates,
        skipped,
        secretCount: candidates.reduce((count, candidate) => count + Object.keys(candidate.secrets).length, 0),
        revision: snapshot.revision,
      })
    } catch {
      setImportState(undefined)
      setImportFailure('import-invalid')
    }
  }
  const confirmImport = async () => {
    if (importPreview === undefined) return
    const currentSnapshot = form.getSnapshot()
    if (currentSnapshot.revision !== importPreview.revision) {
      setImportPreview(undefined)
      setImportState(t('managed.import.previewStale'))
      return
    }
    const { candidates, skipped } = importPreview
    setBusy(true); setImportFailure(undefined); setImportState(undefined)
    try {
      const next: ManagedMcpServer[] = []
      for (const candidate of candidates) {
        const server = candidate.server
        const refs = server.transport === 'streamable-http' ? { ...server.headerRefs } : { ...server.envRefs }
        for (const [name, value] of Object.entries(candidate.secrets)) {
          const ref = candidate.secretRefs[name]
          try {
            const reply = await remote.credentials.set(ref, value)
            if (!reply.ok) { setImportFailure('credential'); return }
          } catch {
            setImportFailure('credential')
            return
          }
          refs[name] = ref
        }
        next.push(server.transport === 'streamable-http'
          ? { ...server, id: randomUUID(), headerRefs: refs }
          : { ...server, id: randomUUID(), envRefs: refs })
      }
      try {
        if (next.length > 0) {
          const accepted = await form.mutate([{ op: 'set', path: ['servers'], value: [...(currentSnapshot.value?.servers ?? []), ...next] }], importPreview.revision)
          if (!accepted) {
            const recoveredSnapshot = form.getSnapshot()
            if (recoveredSnapshot.revision !== importPreview.revision) {
              setImportPreview(undefined)
              setImportState(t('managed.import.previewStale'))
            } else {
              setImportFailure('save')
            }
            return
          }
          await refreshStatuses()
        }
      }
      catch { setImportFailure('save'); return }
      setImportJson('')
      setImportPreview(undefined)
      setImportOpen(false)
      setImportState(t('managed.import.complete').replace('{imported}', String(next.length)).replace('{skipped}', String(skipped)))
    } catch {
      setImportFailure('save')
    } finally { setBusy(false) }
  }
  const statusFor = (server: ManagedMcpServer) => statuses.find(status => status.serverName === server.serverName)
    ?? probed.find(status => status.serverName === server.serverName)
  /** Read one connected row's tool list on demand when live status carries no inventory. */
  const probeTools = async (server: ManagedMcpServer) => {
    if (managerApi === undefined) return
    if (toolProbes[server.id]?.state === 'loading' || toolProbes[server.id]?.state === 'ready') return
    setToolProbes(current => ({ ...current, [server.id]: { state: 'loading' } }))
    try {
      const reply = await managerApi.check(server)
      const value = reply.ok ? reply.value : undefined
      setToolProbes(current => ({ ...current, [server.id]: value?.state === 'ready'
        ? { state: 'ready', tools: value.tools, toolCount: value.toolCount }
        : { state: 'failed' } }))
    } catch {
      setToolProbes(current => ({ ...current, [server.id]: { state: 'failed' } }))
    }
  }
  const stateFor = (server: ManagedMcpServer): ServerState => {
    if (!server.enabled) return 'disabled'
    return statusFor(server)?.state ?? 'unknown'
  }
  const query = searchQuery.trim().toLocaleLowerCase()
  const matchingServers = servers.filter(server => {
    const nameMatches = query === '' || server.serverName.toLocaleLowerCase().includes(query)
    const stateMatches = stateFilter === 'all' || stateFor(server) === stateFilter
    const transportMatches = transportFilter === 'all' || server.transport === transportFilter
    return nameMatches && stateMatches && transportMatches
  })
  const displayedServers = servers.filter(server => matchingServers.includes(server) || server.id === activeEditorId)
  const hasFilters = searchQuery !== '' || stateFilter !== 'all' || transportFilter !== 'all'
  const isEditingExisting = servers.some(server => server.id === draft.id)
  const connectedCount = servers.filter(server => stateFor(server) === 'connected').length
  const editor = (
    <section className={css.fieldGroup} aria-label={t('managed.editor')}>
      <h4 className={css.fieldGroupTitle}>{t('managed.editor')}</h4>
      <div className={css.formGrid}>
        <label className={css.field}><span>{t('serverName')}</span><input value={draft.serverName} disabled={busy} onChange={event => setDraft({ ...draft, serverName: event.currentTarget.value })} /></label>
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
        {draft.secrets.map(row => <div className={css.secretRow} key={row.id}>
          <label className={css.field}><span>{draft.transport === 'streamable-http' ? t('managed.headerName') : t('managed.envName')}</span><input value={row.name} disabled={busy} onChange={event => setDraft({ ...draft, secrets: draft.secrets.map(item => item.id === row.id ? { ...item, name: event.currentTarget.value } : item) })} /></label>
          <label className={css.field}><span>{t('managed.credentialRef')}</span><input value={row.ref} disabled={busy} onChange={event => setDraft({ ...draft, secrets: draft.secrets.map(item => item.id === row.id ? { ...item, ref: event.currentTarget.value } : item) })} /></label>
          <label className={css.field}><span>{t('managed.secret')}</span><div className={css.secretInput}>
            {row.visible
              ? <input
                type="text"
                autoComplete="new-password"
                value={row.value}
                placeholder={t('managed.secret.placeholder')}
                disabled={busy}
                onChange={event => setDraft({ ...draft, secrets: draft.secrets.map(item => item.id === row.id ? { ...item, value: event.currentTarget.value } : item) })}
              />
              : <input
                className={css.secretMask}
                type="text"
                readOnly
                value={'*'.repeat(22)}
                title={t('managed.secret.hidden')}
                aria-label={t('managed.secret.hidden')}
                disabled={busy}
              />}
            <Button variant="outline" size="sm" className={css.secretVisibilityButton} aria-label={t(row.visible ? 'managed.secret.hide' : 'managed.secret.show')} aria-pressed={row.visible} disabled={busy} onClick={() => { void toggleSecret(row.id) }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {row.visible
                  ? <><path d="M2.5 12s3.25-6 9.5-6 9.5 6 9.5 6-3.25 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /><path d="m4 4 16 16" /></>
                  : <><path d="M2.5 12s3.25-6 9.5-6 9.5 6 9.5 6-3.25 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>}
              </svg>
            </Button>
          </div><small>{row.visible ? t('managed.secret.placeholder') : t('managed.secret.hint')}</small></label>
          <Button variant="outline" disabled={busy} onClick={() => setDraft({ ...draft, secrets: draft.secrets.filter(item => item.id !== row.id) })}>{t('managed.removeSecret')}</Button>
        </div>)}
        <Button variant="outline" disabled={busy} onClick={() => setDraft({ ...draft, secrets: [...draft.secrets, { id: randomUUID(), name: '', ref: '', value: '', visible: false }] })}>{t('managed.addSecret')}</Button>
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

  return <section className={css.connections} aria-label={t('managed.title')}>
    <header className={css.pageHeader}>
      <div className={css.pageCopy}>
        <h2 className={css.pageTitle}>{t('managed.title')}</h2>
        <p className={css.pageDescription}>{servers.length === 0
          ? t('managed.description')
          : t('managed.summary').replace('{connected}', String(connectedCount)).replace('{total}', String(servers.length))}</p>
      </div>
      <div className={css.actions}>
        <Button variant="outline" disabled={servers.length === 0} onClick={exportServers}>{t('managed.export')}</Button>
        <Button variant="primary" disabled={busy || !snapshot.writable} aria-expanded={!isEditingExisting && activeEditorId === draft.id} onClick={() => {
          if (!isEditingExisting && activeEditorId === draft.id) closeEditor()
          else {
            const next = emptyDraft()
            setDraft(next)
            setActiveEditorId(next.id)
            setImportOpen(false)
          }
          setFailure(undefined)
          setCheckState(undefined)
        }}>{t('managed.add')}</Button>
      </div>
    </header>

    <div className={css.toolbar}>
      <label className={`${css.field} ${css.searchField}`}>
        <span className={css.srOnly}>{t('managed.search')}</span>
        <input type="search" value={searchQuery} onChange={event => setSearchQuery(event.currentTarget.value)} placeholder={t('managed.search.placeholder')} />
      </label>
      <label className={`${css.field} ${css.filterField}`}>
        <span className={css.srOnly}>{t('managed.filter.state')}</span>
        <select value={stateFilter} onChange={event => setStateFilter(event.currentTarget.value as StatusFilter)}>
          <option value="all">{t('managed.filter.allStates')}</option>
          <option value="connected">{t('managed.state.connected')}</option>
          <option value="connecting">{t('managed.state.connecting')}</option>
          <option value="reconnecting">{t('managed.state.reconnecting')}</option>
          <option value="disconnected">{t('managed.state.disconnected')}</option>
          <option value="unknown">{t('managed.state.unknown')}</option>
          <option value="disabled">{t('managed.state.disabled')}</option>
        </select>
      </label>
      <label className={`${css.field} ${css.filterField}`}>
        <span className={css.srOnly}>{t('managed.filter.transport')}</span>
        <select value={transportFilter} onChange={event => setTransportFilter(event.currentTarget.value as TransportFilter)}>
          <option value="all">{t('managed.filter.allTransports')}</option>
          <option value="streamable-http">{t('transport.streamable-http')}</option>
          <option value="stdio">{t('transport.stdio')}</option>
        </select>
      </label>
      <div className={css.toolbarEnd}>
        {hasFilters && <Button variant="ghost" onClick={() => { setSearchQuery(''); setStateFilter('all'); setTransportFilter('all') }}>{t('managed.filter.clear')}</Button>}
        <Button variant="ghost" disabled={busy} onClick={() => { void refreshStatuses() }}>{t('managed.refresh')}</Button>
        <Button variant="outline" aria-expanded={importOpen} onClick={() => { setImportOpen(!importOpen); setImportPreview(undefined) }}>{t('managed.import')}</Button>
      </div>
    </div>

    {statusProblem !== undefined && probed.length === 0 && <p className={css.statusProblem} role="status" title={statusProblem}>{t('managed.status.unavailable')}</p>}

    {importOpen && <section className={css.importPanel} aria-label={t('managed.import')}>
      <h4 className={css.fieldGroupTitle}>{t('managed.import')}</h4>
      {importPreview === undefined && <>
        <label className={css.field}>
          <span className={css.srOnly}>{t('managed.import')}</span>
          <textarea rows={6} value={importJson} disabled={busy} onChange={event => {
            setImportJson(event.currentTarget.value)
            setImportPreview(undefined); setImportState(undefined); setImportFailure(undefined)
          }} placeholder={t('managed.import.placeholder')} />
        </label>
        <small>{t('managed.import.hint')}</small>
        <div className={css.actions}>
          <Button variant="outline" disabled={busy || !snapshot.writable || importJson.trim() === ''} onClick={previewImport}>{t('managed.import.previewAction')}</Button>
        </div>
      </>}
      {importState !== undefined && <p className={css.status} role="status">{importState}</p>}
      {importFailure !== undefined && <p className={css.error} role="alert">{managedFailureLabel(t, importFailure)}</p>}
      {importPreview !== undefined && <section className={css.importPreview} aria-label={t('managed.import.previewTitle')}>
        <h4>{t('managed.import.previewTitle')}</h4>
        <p>{t('managed.import.previewSummary').replace('{count}', String(importPreview.candidates.length)).replace('{skipped}', String(importPreview.skipped))}</p>
        {importPreview.candidates.length > 0 && <ul>{importPreview.candidates.map(candidate => <li key={candidate.server.serverName}>
          <strong>{candidate.server.serverName}</strong> 璺?{t(candidate.server.transport === 'stdio' ? 'transport.stdio' : 'transport.streamable-http')} 璺?{t(candidate.server.purpose === 'project-memory' ? 'managed.purpose.project-memory' : 'managed.purpose.model-tools')}
        </li>)}</ul>}
        {importPreview.secretCount > 0 && <p>{t('managed.import.credentialsNotice').replace('{count}', String(importPreview.secretCount))}</p>}
        <div className={css.actions}>
          <Button variant="primary" disabled={busy || !snapshot.writable} onClick={() => { void confirmImport() }}>{t('managed.import.confirm')}</Button>
          <Button variant="outline" disabled={busy} onClick={() => setImportPreview(undefined)}>{t('managed.import.cancel')}</Button>
        </div>
      </section>}
    </section>}

    <div className={css.serverList}>
      {servers.length === 0 && !(activeEditorId === draft.id) && <p className={css.empty}>{t('managed.empty')}</p>}
      {hasFilters && matchingServers.length === 0 && <p className={css.empty} role="status">{t('managed.filter.noResults')}</p>}
      {displayedServers.map((server) => {
        const status = statusFor(server)
        const state = stateFor(server)
        const toolsExpanded = expandedToolIds.has(server.id)
        const probe = toolProbes[server.id]
        const liveTools = status?.tools !== undefined && (status.tools.length > 0 || status.toolCount === 0)
          ? status.tools
          : undefined
        const inventory = liveTools ?? (probe?.state === 'ready' ? probe.tools : undefined)
        return <article className={`${css.serverCard} ${activeEditorId === server.id ? css.serverCardEditing : ''}`} key={server.id}>
          <div className={css.serverMain}>
            <span className={css.stateDot} data-state={state} aria-hidden="true" />
            <span className={css.serverIcon} aria-hidden="true"><IconApiOutlineRegular size={18} /></span>
            <div className={css.serverIdentity}>
              <div className={css.serverNameRow}>
                <strong className={css.serverName}>{server.serverName}</strong>
                <span className={css.statePill} data-state={state}>{managedStateLabel(t, state)}</span>
              </div>
              <p className={css.serverMeta}>
                {t(server.transport === 'stdio' ? 'transport.stdio' : 'transport.streamable-http')}
                <span className={css.separator} aria-hidden="true">·</span>
                {t('managed.toolCountInline').replace('{count}', String(status?.toolCount ?? 0))}
              </p>
            </div>
          </div>
          <div className={css.serverActions}>
            <Button variant="ghost" size="sm" disabled={busy || status === undefined || state !== 'connected'} aria-expanded={toolsExpanded} onClick={() => {
              const next = new Set(expandedToolIds)
              if (next.has(server.id)) next.delete(server.id)
              else {
                next.add(server.id)
                if (inventory === undefined) void probeTools(server)
              }
              setExpandedToolIds(next)
            }}>{t(toolsExpanded ? 'managed.tools.hide' : 'managed.tools.show')}</Button>
            <Button variant="outline" size="sm" disabled={busy || !snapshot.writable} aria-expanded={activeEditorId === server.id} onClick={() => {
              if (activeEditorId === server.id) closeEditor()
              else {
                setDraft(toDraft(server))
                setActiveEditorId(server.id)
              }
              setFailure(undefined)
              setCheckState(undefined)
            }}>{t('managed.edit')}</Button>
            <Button variant="ghost" size="sm" disabled={busy || !snapshot.writable} onClick={() => { void remove(server.id) }}>{t('managed.delete')}</Button>
            <Switch checked={server.enabled} label={t('managed.enabled')} disabled={busy || !snapshot.writable} onChange={(value) => { void toggle(server, value) }} />
          </div>
          {toolsExpanded && <section className={css.toolInventory} aria-label={`${server.serverName} ${t('managed.tools.title')}`}>
            {inventory !== undefined
              ? inventory.length === 0
                ? <p>{t('managed.tools.empty')}</p>
                : <ul>{inventory.map(tool => <li key={tool.name}><strong>{tool.name}</strong>{tool.description !== '' && <p>{tool.description}</p>}</li>)}</ul>
              : <p>{state !== 'connected'
                ? t('managed.tools.unavailable')
                : probe?.state === 'loading'
                  ? t('managed.tools.loading')
                  : t('managed.tools.unknown')}</p>}
          </section>}
          {activeEditorId === server.id && editor}
        </article>
      })}
      {!isEditingExisting && activeEditorId === draft.id && <article className={`${css.serverCard} ${css.serverCardEditing}`}>{editor}</article>}
    </div>

    {servers.length > 0 && <p className={css.exportHint}>{t('managed.export.notice')}</p>}
  </section>
}

function isAllowedEndpoint(input: string): boolean {
  try {
    const url = new URL(input)
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, '')
    const loopback = hostname === 'localhost'
      || /^127(?:\.\d{1,3}){3}$/u.test(hostname) || hostname === '::1'
    const privateIpv4 = /^10(?:\.\d{1,3}){3}$/u.test(hostname)
      || /^192\.168(?:\.\d{1,3}){2}$/u.test(hostname)
      || /^172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}$/u.test(hostname)
    return url.username === '' && url.password === ''
      && (url.protocol === 'https:' || (url.protocol === 'http:' && (loopback || privateIpv4)))
  } catch (error) {
    void error
    return false
  }
}

function managedStateLabel(
  t: PropsLocale<'settings.mcp'>['t'],
  state: ServerState,
): string {
  switch (state) {
    case 'disabled': return t('managed.state.disabled')
    case 'connecting': return t('managed.state.connecting')
    case 'connected': return t('managed.state.connected')
    case 'reconnecting': return t('managed.state.reconnecting')
    case 'disconnected': return t('managed.state.disconnected')
    case 'unknown': return t('managed.state.unknown')
  }
}

function managedCheckLabel(
  t: PropsLocale<'settings.mcp'>['t'],
  result: ManagedMcpCheck,
): string {
  switch (result.state) {
    case 'ready': return t('managed.checkReady').replace('{count}', String(result.toolCount))
    case 'invalid': return t('managed.check.invalid')
    case 'authorization-required': return `${t('managed.check.authorization-required')} — ${t('managed.check.advice.authorization-required')}`
    case 'connection-failed': return `${t('managed.check.connection-failed')} — ${t('managed.check.advice.connection-failed')}`
    case 'timed-out': return `${t('managed.check.timed-out')} — ${t('managed.check.advice.timed-out')}`
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
