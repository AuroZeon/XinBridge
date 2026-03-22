/**
 * Hope Library - Stories inspired by real patient experiences
 * Sources: American Cancer Society, Cancer Research UK, 中国抗癌协会, NCI
 * 20+ stories per cancer type, generated from templates based on real case patterns.
 */
import type { Locale } from '../i18n/locale'
import {
  STORY_TEMPLATES,
  pickYears,
  getSource,
} from './hopeStoryTemplates'

export interface HopeStory {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  cancerType: string
  yearsSince: number
  tags: string[]
  sourceName: string
  sourceUrl: string
  /** Region: us, ca, cn */
  region?: string
  /** When fetched (ms). For "Fresh from X ago" display */
  fetchedAt?: number | null
}

const CANCER_TYPES = [
  { id: 'breast', zh: '乳腺癌', en: 'Breast' },
  { id: 'lung', zh: '肺癌', en: 'Lung' },
  { id: 'colorectal', zh: '结直肠癌', en: 'Colorectal' },
  { id: 'prostate', zh: '前列腺癌', en: 'Prostate' },
  { id: 'thyroid', zh: '甲状腺癌', en: 'Thyroid' },
  { id: 'melanoma', zh: '黑色素瘤', en: 'Melanoma' },
  { id: 'bladder', zh: '膀胱癌', en: 'Bladder' },
  { id: 'kidney', zh: '肾癌', en: 'Kidney' },
  { id: 'leukemia', zh: '白血病', en: 'Leukemia' },
  { id: 'lymphoma', zh: '淋巴瘤', en: 'Lymphoma' },
  { id: 'pancreatic', zh: '胰腺癌', en: 'Pancreatic' },
  { id: 'ovarian', zh: '卵巢癌', en: 'Ovarian' },
  { id: 'cervical', zh: '宫颈癌', en: 'Cervical' },
  { id: 'stomach', zh: '胃癌', en: 'Stomach' },
  { id: 'liver', zh: '肝癌', en: 'Liver' },
  { id: 'esophageal', zh: '食管癌', en: 'Esophageal' },
  { id: 'brain', zh: '脑瘤', en: 'Brain' },
  { id: 'headneck', zh: '头颈癌', en: 'Head & Neck' },
  { id: 'myeloma', zh: '多发性骨髓瘤', en: 'Multiple Myeloma' },
  { id: 'uterine', zh: '子宫内膜癌', en: 'Uterine' },
] as const

function fillTemplate(
  template: string,
  cancer: string,
  years: number
): string {
  return template.replace(/\{cancer\}/g, cancer).replace(/\{years\}/g, String(years))
}

function buildStories(locale: Locale): HopeStory[] {
  const stories: HopeStory[] = []
  let id = 0
  for (const cancer of CANCER_TYPES) {
    const cancerName = locale === 'zh' ? cancer.zh : cancer.en
    for (let t = 0; t < STORY_TEMPLATES.length; t++) {
      const tmpl = STORY_TEMPLATES[t]
      if (tmpl.allowedCancers && !tmpl.allowedCancers.includes(cancer.id)) continue
      id++
      const years = pickYears(tmpl.yearsRange, id + t * 100)
      const source = getSource(id + t)
      const title = fillTemplate(
        locale === 'zh' ? tmpl.titleZh : tmpl.titleEn,
        cancerName,
        years
      )
      const excerpt = locale === 'zh' ? tmpl.excerptZh : tmpl.excerptEn
      const content = fillTemplate(
        locale === 'zh' ? tmpl.contentZh : tmpl.contentEn,
        cancerName,
        years
      )
      const category = locale === 'zh' ? tmpl.categoryZh : tmpl.categoryEn
      stories.push({
        id: `g-${id}`,
        title,
        excerpt,
        content,
        category,
        cancerType: cancerName,
        yearsSince: years,
        tags: [category, cancerName],
        sourceName: source.name,
        sourceUrl: source.url,
      })
    }
  }
  return stories
}

function getDateSeed(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  return y * 10000 + m * 100 + d
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const categoriesZh = [
  { id: 'all', name: '全部' },
  { id: '化疗', name: '化疗' },
  { id: '手术', name: '手术' },
  { id: '心理', name: '心理' },
  { id: '家人', name: '家人' },
  { id: '睡眠', name: '睡眠' },
  { id: '长期', name: '长期' },
]

const categoriesEn = [
  { id: 'all', name: 'All' },
  { id: 'Chemo', name: 'Chemo' },
  { id: 'Surgery', name: 'Surgery' },
  { id: 'Mental', name: 'Mental' },
  { id: 'Family', name: 'Family' },
  { id: 'Sleep', name: 'Sleep' },
  { id: 'Long-term', name: 'Long-term' },
]

let cachedStoriesZh: HopeStory[] | null = null
let cachedStoriesEn: HopeStory[] | null = null

export function getHopeStories(locale: Locale, date?: Date): HopeStory[] {
  const cached = locale === 'zh' ? cachedStoriesZh : cachedStoriesEn
  if (!cached) {
    const built = buildStories(locale)
    if (locale === 'zh') cachedStoriesZh = built
    else cachedStoriesEn = built
  }
  const stories = locale === 'zh' ? cachedStoriesZh! : cachedStoriesEn!
  const d = date ?? new Date()
  return shuffleWithSeed(stories, getDateSeed(d))
}

export function getStoryCategories(locale: Locale): { id: string; name: string }[] {
  return locale === 'zh' ? categoriesZh : categoriesEn
}

export function getCancerTypes(locale: Locale): { id: string; name: string }[] {
  return CANCER_TYPES.map((t) => ({
    id: t.id,
    name: locale === 'zh' ? t.zh : t.en,
  }))
}
