import { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getHopeStories, getStoryCategories, getCancerTypes } from '../data/hopeStories'
import type { HopeStory } from '../data/hopeStories'
import { useTranslation, useLocale } from '../i18n/context'
import { useGlobalPulse } from '../hooks/useGlobalPulse'
import { RefreshCw, Globe } from '../components/icons'
import { images, logo } from '../data/mediaAssets'
import { ImgWithFallback } from '../components/ImgWithFallback'

export default function HopeLibrary() {
  const backTo = ((useLocation().state as { from?: string })?.from) ?? '/'
  const navigate = useNavigate()
  const t = useTranslation()
  const locale = useLocale()
  const hope = t.hope as Record<string, unknown>
  const [filter, setFilter] = useState('all')
  const [cancerFilter, setCancerFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const {
    refreshedStories,
    refreshing,
    refreshError,
    lastFetchedAt,
    isOffline,
    handleRefresh,
  } = useGlobalPulse(cancerFilter, locale)

  const hopeStories = useMemo(() => getHopeStories(locale, new Date()), [locale])
  const storyCategories = getStoryCategories(locale)
  const cancerTypes = getCancerTypes(locale)

  const allStories = useMemo(() => {
    if (refreshedStories.length === 0) return hopeStories
    const baseIds = new Set(hopeStories.map((s) => s.id))
    const newOnes = refreshedStories.filter((s) => !baseIds.has(s.id))
    return [...newOnes, ...hopeStories]
  }, [hopeStories, refreshedStories])

  const filtered = useMemo(() => {
    let list = allStories
    if (filter !== 'all') list = list.filter((s) => s.category === filter)
    if (cancerFilter !== 'all') {
      const name = cancerTypes.find((c) => c.id === cancerFilter)?.name
      if (name) list = list.filter((s) => s.cancerType === name)
    }
    return list
  }, [allStories, filter, cancerFilter, cancerTypes])

  const yearsText = (n: number) => (locale === 'zh' ? `${n}年前` : `${n} years ago`)

  const freshAgo = (fetchedAt: number | null | undefined) => {
    if (!fetchedAt) return null
    const mins = Math.floor((Date.now() - fetchedAt) / 60000)
    const fn = hope.freshAgo as ((m: number) => string) | undefined
    return fn ? fn(mins) : (mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} hr ago`)
  }

  const regionLabel = (r?: string) => {
    if (!r) return null
    if (r === 'us') return String(hope.regionUs ?? '🇺🇸')
    if (r === 'ca') return String(hope.regionCa ?? '🇨🇦')
    if (r === 'cn') return String(hope.regionCn ?? '🇨🇳')
    return r
  }

  const handleRelate = (story: HopeStory) => {
    const prompt = locale === 'zh'
      ? `我刚读了这篇康复故事：「${story.title}」。请用简短的话告诉我，这样的故事对我正在经历的癌症治疗有什么启发或安慰？`
      : `I just read this recovery story: "${story.title}". In 1–2 sentences, why might this story matter to me as someone going through cancer treatment?`
    navigate('/chat', { state: { from: '/hope', relatePrompt: prompt } })
  }

  return (
    <div className="min-h-dvh pt-safe pb-safe pb-12 bg-[var(--color-bg)]">
      <div className="relative -mx-4 mb-6 h-36 overflow-hidden rounded-b-2xl">
        <ImgWithFallback src={images.flowers} alt="" className="w-full h-full object-cover" fallbackClassName="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-center gap-4">
          <img src={logo} alt="XinBridge" className="w-12 h-12 rounded-full object-contain bg-white/20 shrink-0" />
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>{String(hope.title)}</h1>
            <p className="text-sm text-white/90 mt-1 animate-fade-in-up stagger-1">{String(hope.subtitle)}</p>
          </div>
        </div>
      </div>
      <div className="px-4">
      <header className="header-safe flex items-center justify-between gap-4 py-4 mb-4">
        <Link to={backTo} className="text-[var(--color-primary)] text-sm font-medium">← {String(t.back)}</Link>
      </header>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRefresh()}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
              {refreshing ? (
                <Globe className="w-5 h-5 animate-pulse-radar text-[var(--color-primary)]" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0" />
              )}
            </span>
            {refreshing ? String(hope.globalScan ?? hope.refreshing) : String(hope.refresh)}
          </button>
          {refreshError && (
            <span className="text-xs text-red-600">{refreshError}</span>
          )}
        </div>
        {(isOffline && refreshedStories.length > 0) && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {String(hope.offlineCached)}
          </p>
        )}
        {lastFetchedAt && refreshedStories.length > 0 && !refreshing && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {String(hope.lastUpdated)}: {freshAgo(lastFetchedAt)}
          </p>
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
          <PulseStoryCard
            key={story.id}
            story={story}
            expanded={expanded === story.id}
            onToggle={() => setExpanded(expanded === story.id ? null : story.id)}
            readLabel={String(hope.read)}
            collapseLabel={String(hope.collapse)}
            yearsText={yearsText}
            sourceLabel={locale === 'zh' ? '来源' : 'Source'}
            freshAgoText={freshAgo(story.fetchedAt)}
            regionLabel={regionLabel(story.region)}
            relateLabel={String(hope.relate)}
            onRelate={() => handleRelate(story)}
          />
        ))}
      </div>
      </div>
    </div>
  )
}

function PulseStoryCard({
  story,
  expanded,
  onToggle,
  readLabel,
  collapseLabel,
  yearsText,
  sourceLabel,
  freshAgoText,
  regionLabel,
  relateLabel,
  onRelate,
  locale,
}: {
  story: HopeStory
  expanded: boolean
  onToggle: () => void
  readLabel: string
  collapseLabel: string
  yearsText: (n: number) => string
  sourceLabel: string
  freshAgoText: string | null
  regionLabel: string | null
  relateLabel: string
  onRelate: () => void
  locale: 'zh' | 'en'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
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
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <span className="text-xs px-2 py-0.5 bg-[var(--color-primary-subtle)] text-[var(--color-primary)] rounded">
            {story.cancerType}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-[var(--color-text-secondary)]">
            {story.category}
          </span>
          {regionLabel && (
            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 rounded">
              {regionLabel}
            </span>
          )}
          <span className="text-xs text-[var(--color-text-muted)]">
            {freshAgoText || yearsText(story.yearsSince)}
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
          <div className="mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); onRelate() }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              {relateLabel}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
