import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getHopeStories, getStoryCategories, getCancerTypes } from '../data/hopeStories'
import type { HopeStory } from '../data/hopeStories'
import { useTranslation, useLocale } from '../i18n/context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { RefreshCw } from '../components/icons'
import { images } from '../data/mediaAssets'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function HopeLibrary() {
  const t = useTranslation()
  const locale = useLocale()
  const hope = t.hope as Record<string, string>
  const [filter, setFilter] = useState('all')
  const [cancerFilter, setCancerFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [refreshedStories, setRefreshedStories] = useState<HopeStory[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const hopeStories = useMemo(() => getHopeStories(locale, new Date()), [locale])
  const storyCategories = getStoryCategories(locale)
  const cancerTypes = getCancerTypes(locale)

  const allStories = useMemo(() => {
    if (refreshedStories.length === 0) return hopeStories
    const baseIds = new Set(hopeStories.map((s) => s.id))
    const newOnes = refreshedStories.filter((s) => !baseIds.has(s.id))
    return [...newOnes, ...hopeStories]
  }, [hopeStories, refreshedStories])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setRefreshError(null)
    const cancer = cancerFilter === 'all' ? 'breast' : cancerFilter
    const url = `${API_BASE}/api/refresh-stories?cancer=${encodeURIComponent(cancer)}&locale=${locale}`
    try {
      const res = await fetch(url)
      const text = await res.text()
      let data: { stories?: HopeStory[]; error?: string; message?: string }
      try {
        data = JSON.parse(text)
      } catch {
        setRefreshError(String(hope.refreshApiNotReady))
        return
      }
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Refresh failed')
      }
      const stories = data.stories || []
      setRefreshedStories((prev) => {
        const seen = new Set(prev.map((s) => s.id))
        const added = stories.filter((s: HopeStory) => !seen.has(s.id))
        return [...added, ...prev]
      })
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : 'Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }, [cancerFilter, locale])

  const filtered = useMemo(() => {
    let list = allStories
    if (filter !== 'all') list = list.filter((s) => s.category === filter)
    if (cancerFilter !== 'all') {
      const name = cancerTypes.find((c) => c.id === cancerFilter)?.name
      if (name) list = list.filter((s) => s.cancerType === name)
    }
    return list
  }, [allStories, filter, cancerFilter, cancerTypes])

  const yearsText = (n: number) => locale === 'zh' ? `${n}年前` : `${n} years ago`

  return (
    <div className="min-h-dvh pt-safe pb-safe pb-12 bg-[var(--color-bg)]">
      <div className="relative -mx-4 mb-6 h-32 overflow-hidden rounded-b-2xl">
        <img src={images.flowers} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-xl font-semibold text-white animate-fade-in-up">{String(hope.title)}</h1>
          <p className="text-sm text-white/90 mt-0.5 animate-fade-in-up stagger-1">{String(hope.subtitle)}</p>
        </div>
      </div>
      <div className="px-4">
      <header className="flex items-center justify-between gap-4 py-3 mb-4">
        <Link to="/" className="text-[var(--color-primary)] text-sm font-medium">← {String(t.back)}</Link>
        <LanguageSwitcher />
      </header>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? String(hope.refreshing) : String(hope.refresh)}
        </button>
        {refreshError && (
          <span className="text-xs text-red-600">{refreshError}</span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {storyCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === c.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mt-2 mb-3">
        {locale === 'zh' ? '按癌症类型筛选：' : 'Filter by cancer type:'}
      </p>
      <div className="flex flex-wrap gap-2 pb-4">
        {cancerTypes.map((c) => (
          <button
            key={c.id}
            onClick={() => setCancerFilter(cancerFilter === c.id ? 'all' : c.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              cancerFilter === c.id
                ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]'
                : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
            }`}
          >
            {c.name}
          </button>
        ))}
        <button
          onClick={() => setCancerFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            cancerFilter === 'all'
              ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
              : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)]'
          }`}
        >
          {locale === 'zh' ? '全部' : 'All'}
        </button>
      </div>

      <div className="space-y-4 mt-2">
        {filtered.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            expanded={expanded === story.id}
            onToggle={() => setExpanded(expanded === story.id ? null : story.id)}
            readLabel={String(hope.read)}
            collapseLabel={String(hope.collapse)}
            yearsText={yearsText}
            sourceLabel={locale === 'zh' ? '来源' : 'Source'}
          />
        ))}
      </div>
      <p className="mt-6 text-[10px] text-[var(--color-text-secondary)]/70 text-center">
        Photos by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
      </p>
      </div>
    </div>
  )
}

function StoryCard({
  story,
  expanded,
  onToggle,
  readLabel,
  collapseLabel,
  yearsText,
  sourceLabel,
}: {
  story: HopeStory
  expanded: boolean
  onToggle: () => void
  readLabel: string
  collapseLabel: string
  yearsText: (n: number) => string
  sourceLabel: string
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[var(--color-border-subtle)] overflow-hidden card-interactive"
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-1">{story.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{story.excerpt}</p>
          </div>
          <span className="text-[var(--color-primary)] shrink-0 text-sm font-medium">
            {expanded ? collapseLabel : readLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 bg-[var(--color-primary-subtle)] text-[var(--color-primary)] rounded">
            {story.cancerType}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-[var(--color-text-secondary)]">
            {story.category}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {yearsText(story.yearsSince)}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[var(--color-border-subtle)]">
          <p className="text-[var(--color-text)] leading-7 whitespace-pre-wrap">{story.content}</p>
          <a
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-xs text-[var(--color-primary)] hover:underline"
          >
            {sourceLabel}: {story.sourceName}
          </a>
        </div>
      )}
    </div>
  )
}
