/**
 * Contextual greetings based on time and symptom/mood history.
 */

import type { Locale } from '../i18n/locale'

export interface SymptomLog {
  date: string
  pain?: number
  fatigue?: number
}

export function getContextualGreeting(
  hour: number,
  locale: Locale,
  symptomLogs: SymptomLog[]
): { greeting: string; subtitle: string } {
  const recentLogs = symptomLogs
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
  const avgFatigue = recentLogs.length
    ? recentLogs.reduce((s, l) => s + (l.fatigue ?? 0), 0) / recentLogs.length
    : 0
  const hasLongDay = hour >= 17 && avgFatigue >= 4

  if (locale === 'zh') {
    if (hour >= 1 && hour < 5) {
      return {
        greeting: '夜深了',
        subtitle: '睡不着的话，试试「夜晚陪伴」里的助眠语音，或者和心桥聊聊。',
      }
    }
    if (hour >= 5 && hour < 9) {
      return {
        greeting: '早安',
        subtitle: '新的一天开始了。想先记录一下今天的感受吗？',
      }
    }
    if (hour >= 9 && hour < 12) {
      return {
        greeting: '上午好',
        subtitle: hasLongDay ? '辛苦了。今天感觉怎么样？需要记录症状吗？' : '心桥在这里，随时陪你。',
      }
    }
    if (hour >= 12 && hour < 17) {
      return {
        greeting: '下午好',
        subtitle: hasLongDay ? '今天好像挺累的。要不要试一个 2 分钟的放松呼吸？' : '休息一下，照顾好自己。',
      }
    }
    if (hour >= 17 && hour < 21) {
      return {
        greeting: '晚上好',
        subtitle: hasLongDay
          ? '辛苦了一天。要不要试一个 2 分钟的入睡准备呼吸？'
          : '今天过得怎么样？睡不着可以试试「夜晚陪伴」。',
      }
    }
    return {
      greeting: '夜深了',
      subtitle: '睡不着的话，试试「夜晚陪伴」或和我聊聊。',
    }
  }

  if (hour >= 1 && hour < 5) {
    return {
      greeting: 'Late night',
      subtitle: "Can't sleep? Try Night Support for sleep voice, or chat with me.",
    }
  }
  if (hour >= 5 && hour < 9) {
    return {
      greeting: 'Good morning',
      subtitle: "A new day. Want to check in with how you're feeling?",
    }
  }
  if (hour >= 9 && hour < 12) {
    return {
      greeting: 'Good morning',
      subtitle: hasLongDay ? "Rough day ahead? How are you feeling? Log your symptoms?" : "I'm here whenever you need.",
    }
  }
  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon',
      subtitle: hasLongDay ? "Long day. Would you like a 2-minute calming breath?" : "Take a moment. Care for yourself.",
    }
  }
  if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Good evening',
      subtitle: hasLongDay
        ? "It's been a long day. Would you like to try a 2-minute sleep prep?"
        : "How was your day? Can't sleep? Try Night Support.",
    }
  }
  return {
    greeting: 'Late night',
    subtitle: "Can't sleep? Try Night Support or chat with me.",
  }
}
