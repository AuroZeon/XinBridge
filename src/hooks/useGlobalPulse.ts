/**
 * Global Pulse – fetches hope stories from multi-region search, caches to localStorage.
 */
import { useState, useCallback, useEffect } from 'react'
import { getItem, setItem } from '../utils/storage'
import type { HopeStory } from '../data/hopeStories'

const CACHE_KEY = 'pulse_stories'
const MAX_CACHED = 10
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

interface CachedPulse {
  stories: HopeStory[]
  fetchedAt: number
}

function getCached(): CachedPulse | null {
  const raw = getItem<CachedPulse | null>(CACHE_KEY, null)
  if (!raw?.stories?.length) return null
  const cutoff = Date.now() - WEEK_MS
  const valid = raw.stories.filter((s) => (s.fetchedAt ?? 0) > cutoff)
  if (valid.length === 0) return null
  return { stories: valid.slice(0, MAX_CACHED), fetchedAt: raw.fetchedAt }
}

function saveCache(stories: HopeStory[]) {
  const withTime = stories.map((s) => ({ ...s, fetchedAt: s.fetchedAt ?? Date.now() }))
  setItem(CACHE_KEY, {
    stories: withTime.slice(0, MAX_CACHED),
    fetchedAt: Date.now(),
  })
}

export function useGlobalPulse(cancerFilter: string, locale: 'zh' | 'en') {
  const [refreshedStories, setRefreshedStories] = useState<HopeStory[]>(() => {
    const cached = getCached()
    return cached?.stories ?? []
  })
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(() => getCached()?.fetchedAt ?? null)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)

  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setRefreshError(null)
    const cancer = cancerFilter === 'all' ? 'breast' : cancerFilter
    const API_BASE = import.meta.env.VITE_API_URL ?? ''
    const url = `${API_BASE}/api/refresh-stories?cancer=${encodeURIComponent(cancer)}&locale=${locale}`

    try {
      const res = await fetch(url)
      const text = await res.text()
      let data: { stories?: HopeStory[]; error?: string; message?: string }
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Invalid response')
      }
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Request failed')
      }
      const stories = (data.stories || []).map((s) => ({
        ...s,
        fetchedAt: s.fetchedAt ?? Date.now(),
      }))
      setRefreshedStories((prev) => {
        const seen = new Set(prev.map((x) => x.id))
        const added = stories.filter((s) => !seen.has(s.id))
        const merged = [...added, ...prev].slice(0, MAX_CACHED)
        saveCache(merged)
        return merged
      })
      setLastFetchedAt(Date.now())
    } catch (err) {
      const cached = getCached()
      if (cached?.stories?.length) {
        setRefreshedStories(cached.stories)
        setLastFetchedAt(cached.fetchedAt)
      }
      setRefreshError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setRefreshing(false)
      setIsOffline(!navigator.onLine)
    }
  }, [cancerFilter, locale])

  return {
    refreshedStories,
    refreshing,
    refreshError,
    lastFetchedAt,
    isOffline,
    handleRefresh,
  }
}
