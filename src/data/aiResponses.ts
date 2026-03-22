import type { Locale } from '../i18n/locale'

const patterns: Record<string, { zh: string; en: string }> = {
  scared: {
    zh: '感到害怕是完全正常的。很多人在治疗前都会紧张，你并不奇怪。这种恐惧说明你在认真面对这件事。\n\n建议：可以试试本应用的「呼吸练习」，做几次深呼吸能帮助身体放松。也可以把担心的事写下来，下次复诊时问问医生，心里有数会好一些。\n\n你随时可以在这里倾诉，我都在。',
    en: "Feeling scared is completely normal. Many people feel nervous before treatment—you're not alone. This fear shows you're taking it seriously.\n\nSuggestion: Try the Breathing exercise in this app; a few deep breaths can help you relax. You can also write down your worries and ask your doctor at your next visit. Knowing what to expect can help.\n\nI'm here whenever you want to talk.",
  },
  treatment: {
    zh: '感到不确定很正常。治疗过程中有起伏是常见的，一天一天来会好一些。\n\n建议：把想问医生的问题记在「想问医生的话」里，复诊时不会忘。如果今天特别难受，可以试试呼吸练习，或者用「家人联系」让家人知道你需要陪伴。\n\n想聊聊你心里在想什么吗？',
    en: "Feeling uncertain is normal. Ups and downs during treatment are common; taking it one day at a time helps.\n\nSuggestion: Write questions in 'Questions for Doctor' so you don't forget at your next visit. If you're struggling today, try breathing exercises or use Family Contact to let your family know you need support.\n\nWant to talk about what's on your mind?",
  },
  alone: {
    zh: '你并不孤单。即使有时感觉如此，也有人关心你。夜晚或独处时最难熬，这很正常。\n\n建议：可以用「家人联系」发一条消息给家人，哪怕只是「想听听你的声音」。一个简短的电话有时能带来很大安慰。你也可以继续在这里说，我一直在。',
    en: "You're not alone. Even when it feels that way, people care. Nights and being alone are often the hardest—that's normal.\n\nSuggestion: Use Family Contact to send a message, even just 'I'd like to hear your voice.' A short call can bring real comfort. You can also keep talking here; I'm listening.",
  },
  tired: {
    zh: '你的身体在做重要的工作，疲惫是康复过程的一部分。需要休息就休息——这不是软弱，是疗愈。\n\n建议：量力而行，少做几件事也没关系。如果持续很累，可以在「症状记录」里记下来，复诊时给医生看。照顾好自己，一天一天来。',
    en: "Your body is doing important work; fatigue is part of recovery. Rest when you need it—that's not weakness, it's healing.\n\nSuggestion: Pace yourself; it's okay to do less. If you're consistently tired, log it in Symptom Log to show your doctor. Take care of yourself, one day at a time.",
  },
  nausea: {
    zh: '恶心确实很难受，治疗期间很多人都会经历。\n\n建议：少食多餐、多喝水，避免油腻和刺激性食物。如果恶心明显，可以和医生说说，是否有止吐药或其他办法。也可以在「症状记录」里记下程度，方便医生调整方案。',
    en: "Nausea is really tough; many people experience it during treatment.\n\nSuggestion: Eat small, frequent meals, stay hydrated, and avoid greasy or spicy foods. If it's significant, talk to your doctor about anti-nausea options. You can also log the severity in Symptom Log.",
  },
  pain: {
    zh: '疼痛不要忍着。持续或加重的疼痛需要让医生知道，以便调整方案。\n\n建议：在「症状记录」里记下疼痛程度（0-10），复诊时给医生看。在等待就医期间，可以试试本应用的「呼吸练习」，缓慢呼吸有时能帮助缓解一些不适。',
    en: "Don't tough out pain. Persistent or worsening pain should be shared with your doctor so they can adjust your plan.\n\nSuggestion: Log pain level (0-10) in Symptom Log for your next visit. Meanwhile, try the Breathing exercise; slow breaths can sometimes ease discomfort.",
  },
  sleep: {
    zh: '治疗期间很多人会失眠，睡不着的时候特别难熬。\n\n建议：可以试试本应用「夜晚陪伴」里的助眠呼吸（4-7-8 呼吸法）。睡不着也没关系，闭眼休息也是一种恢复。不要强迫自己入睡，那样反而更焦虑。如果失眠持续，可以告诉医生。',
    en: "Many people have trouble sleeping during treatment; sleepless nights are especially hard.\n\nSuggestion: Try the sleep breathing in Night Support (4-7-8 method). It's okay if you can't sleep—resting with your eyes closed still helps. Don't force it; that can increase anxiety. If it persists, tell your doctor.",
  },
  angry: {
    zh: '这种憋屈、想发泄的感觉很正常。生病让人无力，很多事情控制不了，愤怒常常是恐惧和委屈的另一种表达。\n\n建议：先试试本应用的「呼吸练习」— 选择愤怒时会进入冷静模式，一起做几次深呼吸。也可以把此刻的感受写下来，或者找个安静的地方待一会儿。你随时可以在这里说，我都在听。',
    en: "That pent-up, want-to-lash-out feeling is normal. Illness can make you feel powerless; anger is often fear and frustration in disguise.\n\nSuggestion: Try the Breathing exercise—selecting anger enters cool-down mode. A few deep breaths together can help. You can also write down how you feel or find a quiet spot. I'm here whenever you want to talk.",
  },
  sos: {
    zh: '我在这里。深呼吸。\n\n请立即：\n• 打开「快速 SOS」开始呼吸或联系家人\n• 打开「家人联系」让家人知道你需要陪伴\n\n你并不孤单。',
    en: "I'm here. Take a breath.\n\nRight now:\n• Open Quick SOS to breathe or contact family\n• Open Family Contact to let family know you need support\n\nYou're not alone.",
  },
  /** Professional therapeutic response for distress/crisis—validating, warm, supportive. Not punitive. */
  crisisSupport: {
    zh: `谢谢你愿意说出来。能把这些感受讲出来，本身就是一种勇气。

很多人在治疗中都会经历非常难熬的时刻，会有「撑不下去」的念头。这种感受是可以被理解的，不代表你做错了什么。

此时此刻，如果可以，试着做一次深呼吸。你并不孤单。

如果你愿意，可以：
• 打开「快速 SOS」——用 5-4-3-2-1 练习稳住当下
• 打开「家人联系」——让在乎你的人知道你需要陪伴
• 或继续在这里说——我会一直听着

你值得被支持。我们在这里陪着你。`,
    en: `Thank you for sharing that. It takes courage to put these feelings into words.

Many people going through treatment have moments when everything feels too heavy—when "I can't keep going" crosses the mind. That feeling is understandable. It doesn't mean you've done anything wrong.

Right now, if you can, try one slow breath. You're not alone.

If you'd like:
• Open Quick SOS — use the 5-4-3-2-1 exercise to steady yourself
• Open Family Contact — let someone who cares know you need them
• Or keep talking here — I'm listening

You deserve support. We're here with you.`,
  },
  /** Formal policy template—only for clearly out-of-scope content (e.g. sexual/explicit). */
  unsafe: {
    zh: `感谢你的信任。心桥专门为癌症患者提供情绪陪伴，我们在这里倾听、支持、陪伴。

根据我们的使用范围，心桥无法回应此类话题，但我们非常重视你的感受。你正在经历的每一点情绪都是真实的，值得被认真对待。

如果你此刻需要支持，请优先使用：
• 「快速 SOS」— 5-4-3-2-1  grounding 练习，帮助你稳住当下
• 「家人联系」— 让家人知道你需要的陪伴
• 「呼吸练习」— 缓慢呼吸有助于平复心绪

心桥的使命是不让任何癌症患者在夜晚感到孤单。我们鼓励你继续在这里倾诉治疗中的疲惫、担忧、孤独或任何情绪，我们都会认真倾听并陪伴你。

如需了解更多关于心桥支持范围与社区准则，请参阅应用内说明。你并不孤单。`,
    en: `Thank you for reaching out. XinBridge is designed specifically to provide emotional companionship for cancer patients—we're here to listen, support, and be present with you.

Within our support scope, XinBridge cannot engage with this type of topic, but we care deeply about how you're feeling. Whatever you're experiencing is valid and worthy of attention.

If you need support right now, please use:
• Quick SOS — 5-4-3-2-1 grounding to help you steady in the moment
• Family Contact — let your loved ones know you need them
• Breathing Exercise — slow breaths can help bring calm

XinBridge's mission is that no cancer patient should feel alone at night. We encourage you to keep sharing—your fatigue, worry, loneliness, or any emotion during treatment. We're here to listen and accompany you.

For more about our support scope and community guidelines, see the in-app information. You're not alone.`,
  },
  default: {
    zh: '我听到了。你的感受都是真实的，无论是什么。\n\n建议：如果想放松一下，可以试试「呼吸练习」或「夜晚陪伴」。如果需要家人知道，可以用「家人联系」。也可以继续在这里说，我都在听。',
    en: "I hear you. Whatever you're feeling is valid.\n\nSuggestion: To relax, try Breathing or Night Support. To let family know, use Family Contact. Or keep talking here—I'm listening.",
  },
}

const keywordPatterns = [
  { keywords: ['sos', 'i give up', '救命', '放弃', '受不了了', '撑不住了'], key: 'sos' },
  { keywords: ['打人', '想打', '愤怒', '生气', '烦躁', '憋屈', '想发泄', '受不了'], key: 'angry' },
  { keywords: ['scared', 'afraid', 'nervous', '害怕', '紧张', '恐惧'], key: 'scared' },
  { keywords: ['treatment', 'chemo', 'therapy', '治疗', '化疗', '放疗', '复查'], key: 'treatment' },
  { keywords: ['alone', 'lonely', '孤单', '孤独'], key: 'alone' },
  { keywords: ['tired', 'exhausted', '累', '疲惫', '没力气'], key: 'tired' },
  { keywords: ['nausea', '恶心', '想吐', '呕吐'], key: 'nausea' },
  { keywords: ['pain', '疼', '痛', '疼痛'], key: 'pain' },
  { keywords: ['sleep', '失眠', '睡不着', '睡不好'], key: 'sleep' },
]

export function getAIResponse(userMessage: string, locale: Locale = 'zh', forceKey?: string): string {
  if (forceKey && forceKey in patterns) return (patterns as Record<string, { zh: string; en: string }>)[forceKey][locale]
  const lower = userMessage.toLowerCase()
  for (const { keywords, key } of keywordPatterns) {
    if (keywords.some((k) => lower.includes(k))) {
      return patterns[key][locale]
    }
  }
  return patterns.default[locale]
}
