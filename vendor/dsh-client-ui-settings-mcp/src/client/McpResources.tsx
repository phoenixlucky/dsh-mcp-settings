import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { McpManagerApi } from './ManagedMcpServers.tsx'
import css from './mcp-settings.module.css'

type Translate = PropsLocale<'settings.mcp'>['t']
interface Resource { uri: string; name: string; title?: string; description?: string; mimeType?: string; size?: number }
interface ResourceTemplate { uriTemplate: string; name: string; title?: string; description?: string; mimeType?: string }
type ResourceContent = { kind: 'text'; uri: string; mimeType?: string; text: string } | { kind: 'binary'; uri: string; mimeType?: string; size: number }
type ManagedMcpServer = Parameters<McpManagerApi['check']>[0]
interface Page<T> { items: readonly T[]; cursor?: string | undefined }

function pageResult<T, K extends string>(reply: { ok: boolean; value?: unknown } | undefined, key: K): Page<T> | undefined {
  const value = reply?.ok ? reply.value : undefined
  const envelope = value as { state?: string; value?: unknown } | undefined
  if (envelope?.state !== 'ready' || envelope.value === undefined) return undefined
  const data = envelope.value as Record<string, unknown>
  const items = data[key]
  return Array.isArray(items) ? { items: items as T[], cursor: typeof data.nextCursor === 'string' ? data.nextCursor : undefined } : undefined
}

function failureKey(reply: { ok: boolean; value?: unknown } | undefined): string {
  const value = reply?.value as { state?: string } | undefined
  return reply?.ok && value?.state ? `managed.resources.${value.state}` : 'managed.resources.failed'
}

/** User initiated, transient browser for resources exposed by one connected server. */
export function McpResources({ server, managerApi, connected, statusId, connectionRevision, t }: { server: ManagedMcpServer; managerApi?: McpManagerApi | undefined; connected: boolean; statusId?: string | undefined; connectionRevision?: number | undefined; t: Translate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState({ resources: false, templates: false })
  const [problem, setProblem] = useState<string>()
  const [resources, setResources] = useState<readonly Resource[]>([])
  const [resourceCursor, setResourceCursor] = useState<string>()
  const [templates, setTemplates] = useState<readonly ResourceTemplate[]>([])
  const [templateCursor, setTemplateCursor] = useState<string>()
  const [query, setQuery] = useState('')
  const [selectedUri, setSelectedUri] = useState<string>()
  const [selectedContent, setSelectedContent] = useState<readonly ResourceContent[]>()
  const [readingUri, setReadingUri] = useState<string>()
  const requestId = useRef({ resources: 0, templates: 0, read: 0 })
  const connectionRevisionKey = `${statusId ?? ''}:${connectionRevision ?? ''}`
  const connectionRevisionRef = useRef(connectionRevisionKey)
  const filteredResources = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return resources
    return resources.filter(resource => [resource.title, resource.name, resource.uri, resource.description, resource.mimeType]
      .some(value => value?.toLocaleLowerCase().includes(needle)))
  }, [query, resources])

  useEffect(() => () => { requestId.current.resources++; requestId.current.templates++; requestId.current.read++ }, [])
  useEffect(() => {
    const changedConnection = connectionRevisionRef.current !== connectionRevisionKey
    connectionRevisionRef.current = connectionRevisionKey
    if (connected && !changedConnection) return
    setOpen(false); setResources([]); setResourceCursor(undefined); setTemplates([]); setTemplateCursor(undefined); setSelectedUri(undefined); setSelectedContent(undefined); setReadingUri(undefined); setProblem(undefined); setQuery('')
    requestId.current.resources++; requestId.current.templates++; requestId.current.read++
  }, [connected, connectionRevisionKey])

  const loadPage = async (kind: 'resources' | 'templates', cursor?: string) => {
    if (managerApi === undefined || !connected) return
    const id = ++requestId.current[kind]
    setLoading(current => ({ ...current, [kind]: true }))
    setProblem(undefined)
    try {
      if (kind === 'resources') {
        const reply = await managerApi.listResources(server.id, cursor)
        if (id !== requestId.current.resources) return
        const page = pageResult<Resource, 'resources'>(reply, 'resources')
        if (page === undefined) {
          const failure = failureKey(reply)
          setProblem(failure)
          if (failure === 'managed.resources.unavailable') { setOpen(false); setResources([]); setTemplates([]); setSelectedUri(undefined); setSelectedContent(undefined); requestId.current.resources++; requestId.current.templates++; requestId.current.read++ }
          return
        }
        setResources(current => cursor === undefined ? page.items : [...current, ...page.items])
        setResourceCursor(page.cursor)
      } else {
        const reply = await managerApi.listResourceTemplates(server.id, cursor)
        if (id !== requestId.current.templates) return
        const page = pageResult<ResourceTemplate, 'resourceTemplates'>(reply, 'resourceTemplates')
        if (page === undefined) {
          const failure = failureKey(reply)
          setProblem(failure)
          if (failure === 'managed.resources.unavailable') { setOpen(false); setResources([]); setTemplates([]); setSelectedUri(undefined); setSelectedContent(undefined); requestId.current.resources++; requestId.current.templates++; requestId.current.read++ }
          return
        }
        setTemplates(current => cursor === undefined ? page.items : [...current, ...page.items])
        setTemplateCursor(page.cursor)
      }
    } catch {
      if (id === requestId.current[kind]) setProblem('managed.resources.failed')
    } finally {
      if (id === requestId.current[kind]) setLoading(current => ({ ...current, [kind]: false }))
    }
  }

  const browse = () => {
    const next = !open
    setOpen(next)
    if (!next) { requestId.current.resources++; requestId.current.templates++; requestId.current.read++; setSelectedUri(undefined); setSelectedContent(undefined); setQuery(''); return }
    setResources([]); setResourceCursor(undefined); setTemplates([]); setTemplateCursor(undefined); setSelectedUri(undefined); setSelectedContent(undefined); setQuery('')
    if (next) { void loadPage('resources'); void loadPage('templates') }
  }

  const read = async (resource: Resource) => {
    if (managerApi === undefined) return
    const { uri } = resource
    const id = ++requestId.current.read
    setSelectedUri(uri); setSelectedContent(undefined)
    setReadingUri(uri); setProblem(undefined)
    try {
      const reply = await managerApi.readResource(server.id, uri)
      if (id !== requestId.current.read) return
      const value = reply.value
      if (reply.ok && value?.state === 'ready' && 'value' in value) setSelectedContent(value.value.contents)
      else {
        const failure = failureKey(reply)
        setProblem(failure)
        if (failure === 'managed.resources.unavailable') { setOpen(false); setResources([]); setTemplates([]); setSelectedUri(undefined); setSelectedContent(undefined); requestId.current.resources++; requestId.current.templates++; requestId.current.read++ }
      }
    } catch {
      if (id === requestId.current.read) setProblem('managed.resources.failed')
    } finally {
      if (id === requestId.current.read) setReadingUri(undefined)
    }
  }

  const refresh = () => {
    if (loading.resources || loading.templates || managerApi === undefined || !connected) return
    requestId.current.read++
    setSelectedUri(undefined); setSelectedContent(undefined); setReadingUri(undefined); setProblem(undefined)
    setResources([]); setResourceCursor(undefined); setTemplates([]); setTemplateCursor(undefined)
    void loadPage('resources')
    void loadPage('templates')
  }

  return <>
    <Button variant="ghost" size="sm" disabled={!connected || managerApi === undefined} aria-expanded={open} onClick={browse}>{t(open ? 'managed.resources.hide' : 'managed.resources.show')}</Button>
    {open && <section className={css.resourceBrowser} aria-label={`${server.serverName} ${t('managed.resources.title')}`}>
      <header className={css.resourceHeader}>
        <h4>{t('managed.resources.title')}</h4>
        <Button variant="ghost" size="sm" disabled={loading.resources || loading.templates || !connected} onClick={refresh}>{t('managed.resources.refresh')}</Button>
      </header>
      {problem !== undefined && <p className={css.statusProblem} role="status">{t(problem as 'managed.resources.unavailable' | 'managed.resources.timed-out' | 'managed.resources.failed' | 'managed.resources.too-large')}</p>}
      <label className={`${css.field} ${css.resourceSearch}`}>
        <span>{t('managed.resources.search')}</span>
        <input type="search" value={query} onChange={event => setQuery(event.currentTarget.value)} placeholder={t('managed.resources.search.placeholder')} />
      </label>
      <div className={css.resourceColumns}>
        <section className={css.resourceList} aria-label={t('managed.resources.items')}>
          <h5>{t('managed.resources.items')}</h5>
          {resources.length === 0 && !loading.resources && <p>{t('managed.resources.empty')}</p>}
          {resources.length > 0 && filteredResources.length === 0 && <p>{t(resourceCursor ? 'managed.resources.noMatchesMore' : 'managed.resources.noMatches')}</p>}
          <ul>{filteredResources.map(resource => <li key={resource.uri}>
            <button type="button" className={css.resourceSelect} aria-pressed={selectedUri === resource.uri} onClick={() => { void read(resource) }}>
              <strong>{resource.title || resource.name}</strong><code>{resource.uri}</code>
            </button>
          </li>)}</ul>
          {resourceCursor && <Button variant="outline" disabled={loading.resources} onClick={() => { void loadPage('resources', resourceCursor) }}>{t('managed.resources.more')}</Button>}
        </section>
        <section className={css.resourcePreview} aria-label={t('managed.resources.preview')} aria-busy={readingUri !== undefined}>
          <h5>{t('managed.resources.preview')}</h5>
          {selectedUri === undefined && <p>{t('managed.resources.selectPrompt')}</p>}
          {selectedUri !== undefined && (() => {
            const resource = resources.find(item => item.uri === selectedUri)
            return <>
              {resource && <div className={css.resourceMetadata}>
                <strong>{resource.title || resource.name}</strong><code>{resource.uri}</code>
                {resource.description && <p>{resource.description}</p>}
                {(resource.mimeType || resource.size !== undefined) && <small>{[resource.mimeType, resource.size !== undefined ? `${resource.size} bytes` : undefined].filter(Boolean).join(' · ')}</small>}
              </div>}
              {readingUri === selectedUri && <p role="status">{t('managed.resources.reading')}</p>}
              {selectedContent?.map((content, index) => <div className={css.resourceContent} key={`${content.uri}-${index}`}>
                {content.kind === 'text' ? <><small>{content.mimeType || t('managed.resources.text')}</small><pre>{content.text}</pre></> : <p>{t('managed.resources.binary').replace('{size}', String(content.size))}{content.mimeType ? ` · ${content.mimeType}` : ''}</p>}
              </div>)}
            </>
          })()}
        </section>
      </div>
      <details className={css.resourceTemplates}>
        <summary>{t('managed.resources.templates')} ({templates.length})</summary>
        {templates.length === 0 && !loading.templates && <p>{t('managed.resources.empty')}</p>}
        <ul>{templates.map(template => <li key={template.uriTemplate}><div><strong>{template.title || template.name}</strong><code>{template.uriTemplate}</code>{template.description && <p>{template.description}</p>}</div></li>)}</ul>
        {templateCursor && <Button variant="outline" disabled={loading.templates} onClick={() => { void loadPage('templates', templateCursor) }}>{t('managed.resources.more')}</Button>}
      </details>
      {(loading.resources || loading.templates) && <p role="status">{t('managed.resources.loading')}</p>}
    </section>}
  </>
}
