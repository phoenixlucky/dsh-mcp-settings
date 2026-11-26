import { useEffect, useRef, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { McpManagerApi } from './ManagedMcpServers.tsx'
import css from './mcp-settings.module.css'

type Translate = PropsLocale<'settings.mcp'>['t']
type ManagedMcpServer = Parameters<McpManagerApi['check']>[0]
interface Skill { name: string; uri?: string; description: string }
interface Page { items: readonly Skill[]; cursor?: string | undefined }

/** Read the `ready` page out of one Remote envelope, or nothing when it carries a failure. */
function pageResult(reply: { ok: boolean; value?: unknown } | undefined): Page | undefined {
  const value = reply?.ok ? reply.value : undefined
  const envelope = value as { state?: string; value?: unknown } | undefined
  if (envelope?.state !== 'ready' || envelope.value === undefined) return undefined
  const data = envelope.value as Record<string, unknown>
  const items = data.skills
  return Array.isArray(items) ? { items: items as Skill[], cursor: typeof data.nextCursor === 'string' ? data.nextCursor : undefined } : undefined
}

/** Map a failure envelope onto the locale key that explains it. */
function failureKey(reply: { ok: boolean; value?: unknown } | undefined): string {
  const value = reply?.value as { state?: string } | undefined
  return reply?.ok && value?.state ? `managed.skills.${value.state}` : 'managed.skills.failed'
}

/**
 * User initiated, transient list of the skills one connected server publishes.
 *
 * Progressive disclosure has two halves and this panel is the first: it reads names and
 * descriptions so the operator can choose, and never fetches a skill body. Nothing is cached
 * between openings — closing the disclosure throws the pages away.
 */
export function McpSkillsPanel({ server, managerApi, connected, declared, panelId, onClose, t }: {
  server: ManagedMcpServer
  managerApi?: McpManagerApi | undefined
  connected: boolean
  /** Whether the server declared the skills extension; the panel states the gate rather than guessing. */
  declared: boolean
  panelId: string
  onClose: () => void
  t: Translate
}) {
  const [loading, setLoading] = useState(false)
  const [problem, setProblem] = useState<string>()
  const [skills, setSkills] = useState<readonly Skill[]>([])
  const [cursor, setCursor] = useState<string>()
  const [loaded, setLoaded] = useState(false)
  const requestId = useRef(0)

  useEffect(() => () => { requestId.current++ }, [])

  const loadPage = async (next?: string) => {
    if (managerApi === undefined || !connected || !declared) return
    const id = ++requestId.current
    setLoading(true)
    setProblem(undefined)
    try {
      const reply = await managerApi.listSkills(server.id, next)
      if (id !== requestId.current) return
      const page = pageResult(reply)
      if (page === undefined) {
        const failure = failureKey(reply)
        setProblem(failure)
        if (failure === 'managed.skills.unavailable') onClose()
        return
      }
      setLoaded(true)
      setSkills(current => next === undefined ? page.items : [...current, ...page.items])
      setCursor(page.cursor)
    } catch {
      if (id === requestId.current) setProblem('managed.skills.failed')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  // Opening the disclosure is the only trigger for the first page.
  useEffect(() => { void loadPage() }, [])

  return <section className={css.resourceBrowser} id={panelId} aria-label={`${server.serverName} ${t('managed.skills.title')}`}>
    <header className={css.resourceHeader}>
      <h4>{t('managed.skills.title')}</h4>
      <Button variant="ghost" size="sm" disabled={loading || !connected || !declared} onClick={() => { setSkills([]); setCursor(undefined); void loadPage() }}>{t('managed.skills.refresh')}</Button>
    </header>
    {!declared && <p>{t('managed.skills.undeclared')}</p>}
    {declared && !connected && <p>{t('managed.skills.unsupported')}</p>}
    {declared && <p className={css.skillHint}>{t('managed.skills.namesHint')}</p>}
    {problem !== undefined && <p className={css.statusProblem} role="status">{t(problem as 'managed.skills.unavailable' | 'managed.skills.timed-out' | 'managed.skills.failed' | 'managed.skills.too-large')}</p>}
    {declared && loaded && skills.length === 0 && <p>{t('managed.skills.empty')}</p>}
    {skills.length > 0 && <ul className={css.skillList}>{skills.map(skill => <li key={skill.name}>
      <strong>{skill.name}</strong>
      {skill.uri !== undefined && <code>{skill.uri}</code>}
      {skill.description !== '' && <p>{skill.description}</p>}
    </li>)}</ul>}
    {declared && cursor !== undefined && <Button variant="outline" disabled={loading} onClick={() => { void loadPage(cursor) }}>{t('managed.skills.more')}</Button>}
    {loading && <p role="status">{t('managed.skills.loading')}</p>}
  </section>
}
