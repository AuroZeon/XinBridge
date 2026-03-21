/**
 * Smart Quick Reply suggestions based on AI response context.
 */

export interface SuggestionChip {
  label: string
  labelZh: string
  text: string
  textZh: string
  /** When set, chip navigates instead of filling input */
  href?: string
}

const ALL_CHIPS: SuggestionChip[] = [
  { label: 'Need a distraction?', labelZh: '想分散一下注意力', text: 'I need a distraction', textZh: '我想分散一下注意力' },
  { label: 'Tell me a sleep story', labelZh: '讲个助眠故事', text: 'I can\'t sleep, tell me something calming', textZh: '睡不着，想听点助眠的', href: '/sleep' },
  { label: 'Start breathing exercise', labelZh: '开始呼吸练习', text: 'I want to try breathing', textZh: '我想试试呼吸练习', href: '/breathing' },
  { label: 'Go to Night Support', labelZh: '去夜晚陪伴', text: 'Take me to Night Support', textZh: '带我去夜晚陪伴', href: '/sleep' },
  { label: 'Log my symptoms', labelZh: '记一下症状', text: 'I want to log symptoms', textZh: '我想记一下今天的症状', href: '/symptoms' },
  { label: 'Questions for my doctor', labelZh: '想问医生的话', text: 'I need to write questions for the doctor', textZh: '我想记下要问医生的问题', href: '/doctor' },
  { label: 'Contact my family', labelZh: '联系家人', text: 'I want to let my family know', textZh: '我想让家人知道', href: '/caregiver' },
  { label: 'Read a hope story', labelZh: '看一个康复故事', text: 'Tell me a recovery story', textZh: '想听一个病友康复的故事', href: '/hope' },
  { label: 'Still can\'t sleep', labelZh: '还是睡不着', text: 'I still can\'t sleep', textZh: '我还是睡不着', href: '/sleep' },
  { label: 'Try cool-down breathing', labelZh: '试试冷静呼吸', text: 'I\'m upset, help me calm down', textZh: '我有点烦躁，想冷静一下', href: '/breathing/cool' },
  { label: 'What helps with fatigue?', labelZh: '累的时候怎么办', text: 'I\'m really tired, what helps?', textZh: '我很累，有什么办法' },
]

const sleepKeywords = ['sleep', '失眠', '睡不着', '睡不好', '呼吸', 'breathing', '4-7-8', '夜晚', 'night']
const breathingKeywords = ['呼吸', 'breathing', '深呼吸', '放松']
const storyKeywords = ['故事', 'story', '康复', 'recovery', '病友']
const symptomKeywords = ['症状', 'symptom', '记录', 'log']
const doctorKeywords = ['医生', 'doctor', '复诊', '问']
const familyKeywords = ['家人', 'family', '联系', 'contact']
const angryKeywords = ['愤怒', 'angry', '冷静', 'calm', '烦躁']

function scoreChip(chip: SuggestionChip, text: string, locale: 'zh' | 'en'): number {
  const lower = text.toLowerCase()
  const label = locale === 'zh' ? chip.labelZh : chip.label

  if (label.toLowerCase().includes('sleep') || chip.labelZh.includes('睡眠')) {
    if (sleepKeywords.some((k) => lower.includes(k))) return 10
  }
  if (label.toLowerCase().includes('breathing') || chip.labelZh.includes('呼吸')) {
    if (breathingKeywords.some((k) => lower.includes(k))) return 10
    if (angryKeywords.some((k) => lower.includes(k))) return 8
  }
  if (chip.labelZh.includes('冷静') || label.toLowerCase().includes('cool-down')) {
    if (angryKeywords.some((k) => lower.includes(k))) return 10
  }
  if (chip.labelZh.includes('故事') || label.toLowerCase().includes('story')) {
    if (storyKeywords.some((k) => lower.includes(k))) return 9
    if (sleepKeywords.some((k) => lower.includes(k))) return 8
  }
  if (chip.labelZh.includes('症状') || label.toLowerCase().includes('symptom')) {
    if (symptomKeywords.some((k) => lower.includes(k))) return 10
    if (lower.includes('tired') || lower.includes('累')) return 7
  }
  if (chip.labelZh.includes('医生') || label.toLowerCase().includes('doctor')) {
    if (doctorKeywords.some((k) => lower.includes(k))) return 10
  }
  if (chip.labelZh.includes('家人') || label.toLowerCase().includes('family')) {
    if (familyKeywords.some((k) => lower.includes(k))) return 10
  }
  if (chip.labelZh.includes('夜晚') || label.toLowerCase().includes('night')) {
    if (sleepKeywords.some((k) => lower.includes(k))) return 9
  }

  return 0
}

const SOS_CHIPS: SuggestionChip[] = [
  { label: 'Quick SOS', labelZh: '快速 SOS', text: '', textZh: '', href: '/sos' },
  { label: 'Family Contact', labelZh: '家人联系', text: '', textZh: '', href: '/caregiver' },
]

const DEFAULT_CHIPS = [
  ALL_CHIPS[0], // sleep story
  ALL_CHIPS[1], // breathing
  ALL_CHIPS[5], // contact family
]

const sosKeywords = ['快速 sos', 'quick sos', '家人联系', 'family contact']

/** When forceSOS is true (e.g. user said SOS), always show Quick SOS + Family Contact first. */
export function getSuggestions(aiText: string, locale: 'zh' | 'en', count = 3, forceSOS?: boolean): SuggestionChip[] {
  const lower = aiText.toLowerCase()
  if (forceSOS || sosKeywords.some((k) => lower.includes(k) || aiText.includes(k))) {
    return [...SOS_CHIPS, ...ALL_CHIPS.slice(0, 1)]
  }
  const scored = ALL_CHIPS.map((chip) => ({
    chip,
    score: scoreChip(chip, aiText, locale),
  }))
  scored.sort((a, b) => b.score - a.score)
  const top = scored.filter((s) => s.score > 0).slice(0, count).map((s) => s.chip)
  if (top.length >= count) return top
  const used = new Set(top.map((c) => c.label))
  for (const { chip } of scored) {
    if (used.has(chip.label)) continue
    top.push(chip)
    used.add(chip.label)
    if (top.length >= count) break
  }
  while (top.length < count) {
    const fallback = DEFAULT_CHIPS.find((c) => !used.has(c.label))
    if (fallback) {
      top.push(fallback)
      used.add(fallback.label)
    } else break
  }
  return top.slice(0, count)
}
