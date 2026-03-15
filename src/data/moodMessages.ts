import type { MoodType } from '../types'
import type { Locale } from '../i18n/locale'

const messages: Record<MoodType, { message: Record<Locale, string>; activity: Record<Locale, string> }> = {
  calm: {
    message: { zh: '能感到平静很好。享受这一刻的安宁。', en: "It's okay to feel calm. Enjoy this moment of peace." },
    activity: { zh: '做一次轻柔的伸展', en: 'Take a gentle stretch' },
  },
  worried: {
    message: { zh: '担忧是自然的。你并不孤单。', en: "Worry is natural. You're not alone in this." },
    activity: { zh: '我们一起做三次深呼吸', en: 'Three slow breaths together' },
  },
  sad: {
    message: { zh: '今天可能有些沉重。我们一起做三次深呼吸。', en: "Today might feel heavy. Let's take three slow breaths together." },
    activity: { zh: '听一段舒缓的音乐', en: 'Listen to calming music' },
  },
  angry: {
    message: { zh: '愤怒常常是恐惧的伪装。我们一起暂停10秒。', en: "Anger is often fear in disguise. Let's pause together for 10 seconds." },
    activity: { zh: '冷静呼吸练习', en: 'Cool-down breathing' },
  },
  exhausted: {
    message: { zh: '你的身体在努力。休息也是一种疗愈。', en: "Your body is working hard. Rest is also healing." },
    activity: { zh: '引导式放松', en: 'Guided relaxation' },
  },
}

export function getMoodMessage(mood: MoodType, locale: Locale) {
  const m = messages[mood]
  return { message: m.message[locale], activity: m.activity[locale] }
}
