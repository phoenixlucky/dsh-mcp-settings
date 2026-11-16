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

/**
 * User initiated, transient browser for the resources one connected server exposes.
 *
 * It is a full-width section of the server card and is mounted only while its
 * disclosure is open, so closing it discards every transient list, cursor, and
 * preview. It must stay a direct child of the card grid: container-type gives the
 * panel no intrinsic width, and inside the card's flex action row that collapsed
 * the whole panel to its padding.
 */
export function McpResourcesPanel({ server, managerApi, connected, panelId, onClose, t }: {
  server: ManagedMcpServer
  managerApi?: McpManagerApi | undefined
  connected: boolean
  panelId: string
  onClose: () => void
  t: Translate
}) {
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
  const filteredResources = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return resources
    return resources.filter(resource => [resource.title, resource.name, resource.uri, resource.description, resource.mimeType]
      .some(value => value?.toLocaleLowerCase().includes(needle)))
  }, [query, resources])

  useEffect(() => () => { requestId.current.resources++; requestId.current.templates++; requestId.current.read++ }, [])

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
          if (failure === 'managed.resources.unavailable') onClose()
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
          if (failure === 'managed.resources.unavailable') onClose()
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

  const loadFirstPages = () => {
    if (managerApi === undefined || !connected) return
    requestId.current.read++
    setSelectedUri(undefined); setSelectedContent(undefined); setReadingUri(undefined); setProblem(undefined)
    setResources([]); setResourceCursor(undefined); setTemplates([]); setTemplateCursor(undefined)
    void loadPage('resources')
    void loadPage('templates')
  }

  // Opening the disclosure is the only trigger for the first list/template page.
  useEffect(() => { loadFirstPages() }, [])

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
        if (failure === 'managed.resources.unavailable') onClose()
      }
    } catch {
      if (id === requestId.current.read) setProblem('managed.resources.failed')
    } finally {
      if (id === requestId.current.read) setReadingUri(undefined)
    }
  }

  return <section className={css.resourceBrowser} id={panelId} aria-label={`${server.serverName} ${t('managed.resources.title')}`}>
    <header className={css.resourceHeader}>
      <h4>{t('managed.resources.title')}</h4>
      <Button variant="ghost" size="sm" disabled={loading.resources || loading.templates || !connected} onClick={loadFirstPages}>{t('managed.resources.refresh')}</Button>
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
  </section>
}
