/**
 * 睡眠支持 - 夜晚难熬时的陪伴内容（支持中英文）
 */
import type { Locale } from '../i18n/locale'

export interface SleepTip {
  title: string
  content: string
}

const sleepTipsZh: SleepTip[] = [
  { title: '如果睡不着', content: '睡不着也没关系。闭眼休息也是一种恢复。不要强迫自己入睡，那样反而更焦虑。' },
  { title: '夜晚的思绪', content: '深夜容易想很多。试着把担心的事写下来，告诉自己「明天再想」。现在，先放松。' },
  { title: '身体在休息', content: '即使醒着，你的身体也在利用这段时间修复。躺着、放松，就是在帮助自己。' },
]

const sleepTipsEn: SleepTip[] = [
  { title: "Can't sleep", content: "It's okay if you can't sleep. Resting with your eyes closed is also recovery. Don't force yourself to sleep—that can make you more anxious." },
  { title: 'Night thoughts', content: "It's easy to overthink at night. Try writing down your worries and tell yourself 'I'll think about it tomorrow.' For now, just relax." },
  { title: 'Your body is resting', content: "Even when awake, your body is using this time to heal. Lying down and relaxing is already helping yourself." },
]

const calmingPromptsZh = [
  '想象一个让你感到安全的地方',
  '回想一个温暖的拥抱',
  '听听窗外的声音，让思绪飘远',
  '感受床的支撑，你被托住了',
]

const calmingPromptsEn = [
  'Imagine a place where you feel safe',
  'Recall a warm embrace',
  'Listen to sounds outside the window, let your thoughts drift',
  'Feel the bed supporting you—you are held',
]

export function getSleepTips(locale: Locale): SleepTip[] {
  return locale === 'zh' ? sleepTipsZh : sleepTipsEn
}

export function getCalmingPrompts(locale: Locale): string[] {
  return locale === 'zh' ? calmingPromptsZh : calmingPromptsEn
}
