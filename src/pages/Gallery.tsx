/**
 * Gallery of Hope - Unlocked stars, treasures, completed shapes
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/context'
import { getItem } from '../utils/storage'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Shapes } from 'lucide-react'

const GALLERY_KEY = 'zen_gallery'

interface GalleryItem {
  id: string
  type: 'star' | 'treasure' | 'shape'
  name: string
  nameZh: string
  unlockedAt: string
}

export default function Gallery() {
  const navigate = useNavigate()
  const backTo = ((useLocation().state as { from?: string })?.from) ?? '/'
  const locale = useLocale()
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const sparks = getItem<number>('zen_sparks', 0)

  useEffect(() => {
    setGallery(getItem<GalleryItem[]>(GALLERY_KEY, []))
  }, [])

  const handleExit = useCallback(() => navigate(backTo), [navigate, backTo])

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (info.offset.y > 80 || info.velocity.y > 200) handleExit()
    },
    [handleExit]
  )

  return (
    <motion.div
      className="min-h-dvh bg-[#0a0a0c] pb-safe"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
    >
      <header className="header-safe flex items-center justify-between gap-4 px-4 py-4">
        <h1 className="text-lg font-semibold text-white/95">
          {locale === 'zh' ? '希望画廊' : 'Gallery of Hope'}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-400/90 text-sm">
            <Star className="w-4 h-4" strokeWidth={2} />
            <span>{sparks}</span>
          </div>
          <button
            type="button"
            onClick={handleExit}
            className="px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium hover:bg-white/15"
            aria-label={locale === 'zh' ? '退出' : 'Exit'}
          >
            ← {locale === 'zh' ? '退出' : 'Exit'}
          </button>
        </div>
      </header>

      <p className="text-sm text-white/60 px-4 pb-2 text-center">
        {locale === 'zh'
          ? '完成游戏任务获得星火与收藏'
          : 'Complete missions to earn Sparks and collectibles'}
      </p>
      <p className="text-xs text-white/40 px-4 pb-4 text-center">
        {locale === 'zh' ? '点击右上角退出' : 'Tap Exit (top-right) to leave'}
      </p>

      <div className="px-4 space-y-4">
        {gallery.length === 0 ? (
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/50 text-sm">
              {locale === 'zh' ? '暂无收藏，去完成禅趣游戏任务吧' : 'No collectibles yet. Complete Zen game missions!'}
            </p>
            <Link
              to="/games"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-lavender-500/30 text-lavender-300 text-sm font-medium"
            >
              {locale === 'zh' ? '去玩游戏' : 'Play games'}
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((item, i) => (
              <motion.div
                key={item.id}
                className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {item.type === 'star' && <Star className="w-8 h-8 text-amber-400" strokeWidth={1.5} />}
                {item.type === 'treasure' && <Heart className="w-8 h-8 text-rose-400" strokeWidth={1.5} />}
                {item.type === 'shape' && <Shapes className="w-8 h-8 text-lavender-400" strokeWidth={1.5} />}
                <span className="text-white/90 text-sm font-medium">
                  {locale === 'zh' ? item.nameZh : item.name}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
