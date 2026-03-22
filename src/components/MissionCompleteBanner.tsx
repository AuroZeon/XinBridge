/**
 * Mission Accomplished - slide-in banner with blur and glow
 */
import { motion, AnimatePresence } from 'framer-motion'

export default function MissionCompleteBanner({
  visible,
  label,
  locale,
}: {
  visible: boolean
  label: string
  locale: 'zh' | 'en'
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-4 top-24 z-50 rounded-2xl bg-amber-500/20 backdrop-blur-xl border border-amber-400/40 px-6 py-4 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <p className="text-amber-200 font-semibold text-center">
            {locale === 'zh' ? '任务完成！' : 'Mission Accomplished!'}
          </p>
          <p className="text-amber-300/90 text-sm text-center mt-1">{label}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
