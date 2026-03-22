/**
 * Global Pulse API – Multi-region cancer hope story search
 * Searches US, Canada, and China for survivor/recovery stories.
 * Requires SERPER_API_KEY. Without it, returns curated demo stories.
 *
 * Query params: cancer, locale (zh|en)
 * Returns: { stories: HopeStory[], fromCache?: boolean, regions?: string[] }
 */

const DEMO_STORIES = [
  {
    id: 'demo-us-1',
    title: 'Breast Cancer Survivor Celebrates 10-Year Milestone',
    excerpt: 'After completing treatment, she founded a support group for young survivors. "Every day is a gift," she says.',
    content: 'A breast cancer survivor marks a decade of remission. She credits support from family and fellow survivors.',
    category: 'Long-term',
    cancerType: 'Breast',
    yearsSince: 10,
    tags: ['Breast'],
    sourceName: 'XinBridge Hope',
    sourceUrl: 'https://www.cancer.org',
    region: 'us',
    fetchedAt: null,
  },
  {
    id: 'demo-ca-1',
    title: 'Lung Cancer Patient Returns to Running',
    excerpt: 'Six months post-surgery, he completed his first 5K. "Small wins add up," he shared.',
    content: 'A lung cancer survivor gradually regained strength and returned to running. Community support made the difference.',
    category: 'Long-term',
    cancerType: 'Lung',
    yearsSince: 2,
    tags: ['Lung'],
    sourceName: 'XinBridge Hope',
    sourceUrl: 'https://www.cancer.ca',
    region: 'ca',
    fetchedAt: null,
  },
  {
    id: 'demo-cn-1',
    title: '抗癌五年，她选择用音乐陪伴病友',
    excerpt: '确诊后坚持治疗与创作，如今用歌声为病房带去温暖。',
    content: '一位乳腺癌患者康复后投身音乐创作，用歌声陪伴正在治疗中的病友。',
    category: '心理',
    cancerType: '乳腺癌',
    yearsSince: 5,
    tags: ['乳腺癌'],
    sourceName: '心桥希望',
    sourceUrl: 'https://www.caca.org.cn',
    region: 'cn',
    fetchedAt: null,
  },
]

const REGION_QUERIES = {
  us: {
    zh: '美国 癌症 康复  survivor story',
    en: 'cancer survivor story recovery milestone patient advocacy US',
  },
  ca: {
    zh: '加拿大 癌症 康复  survivor',
    en: 'cancer survivor story Canada CBC health recovery',
  },
  cn: {
    zh: '抗癌故事 康复心得 病友分享',
    en: '抗癌故事 康复心得 China cancer recovery story',
  },
}

const BLOCKED_PATTERNS = [
  /\bclinical trial\b/i,
  /\bphase [123] trial\b/i,
  /\bpharmaceutical\b/i,
  /\bFDA (approval|approves)\b/i,
  /\b( drug | medication )\b/i,
  /\b(化疗|放疗)\s*(药物|新药)/,
  /\bmiracle cure\b/i,
  /\b(死亡|去世|不治|晚期)\s*(患者|病例)/,
  /\bfatal\b/i,
  /\bpassed away\b/i,
  /\btragically\b/i,
]

function shouldBlock(text) {
  if (!text || typeof text !== 'string') return true
  const t = text.toLowerCase()
  return BLOCKED_PATTERNS.some((p) => p.test(t))
}

function domainFromUrl(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host.includes('cancer.org')) return 'American Cancer Society'
    if (host.includes('cancer.ca')) return 'Canadian Cancer Society'
    if (host.includes('caca.org.cn')) return '中国抗癌协会'
    if (host.includes('cancer.gov')) return 'National Cancer Institute'
    if (host.includes('survivornet')) return 'SurvivorNet'
    if (host.includes('dingxiangyuan')) return '丁香园'
    return host
  } catch {
    return 'Web'
  }
}

function buildStoriesFromSerper(organic, region, cancerName, locale, cancer) {
  const stories = []
  for (let i = 0; i < Math.min(organic.length, 5); i++) {
    const item = organic[i]
    const title = item.title || ''
    const snippet = item.snippet || ''
    if (shouldBlock(title) || shouldBlock(snippet)) continue

    const id = `pulse-${region}-${Date.now()}-${i}`
    stories.push({
      id,
      title,
      excerpt: snippet.slice(0, 160) + (snippet.length > 160 ? '...' : ''),
      content: snippet + (locale === 'zh' ? '\n\n点击下方链接阅读完整故事。' : '\n\nClick the link below to read the full story.'),
      category: locale === 'zh' ? '长期' : 'Long-term',
      cancerType: cancerName,
      yearsSince: 1 + (i % 4),
      tags: [cancerName],
      sourceName: domainFromUrl(item.link || ''),
      sourceUrl: item.link || 'https://www.cancer.org',
      region,
      fetchedAt: Date.now(),
    })
  }
  return stories
}

async function searchSerper(apiKey, query, gl, hl) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5, gl, hl }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.organic || []
}

const CANCER_NAMES = {
  breast: { zh: '乳腺癌', en: 'Breast' },
  lung: { zh: '肺癌', en: 'Lung' },
  colorectal: { zh: '结直肠癌', en: 'Colorectal' },
  prostate: { zh: '前列腺癌', en: 'Prostate' },
  thyroid: { zh: '甲状腺癌', en: 'Thyroid' },
  melanoma: { zh: '黑色素瘤', en: 'Melanoma' },
  bladder: { zh: '膀胱癌', en: 'Bladder' },
  kidney: { zh: '肾癌', en: 'Kidney' },
  leukemia: { zh: '白血病', en: 'Leukemia' },
  lymphoma: { zh: '淋巴瘤', en: 'Lymphoma' },
  pancreatic: { zh: '胰腺癌', en: 'Pancreatic' },
  ovarian: { zh: '卵巢癌', en: 'Ovarian' },
  cervical: { zh: '宫颈癌', en: 'Cervical' },
  stomach: { zh: '胃癌', en: 'Stomach' },
  liver: { zh: '肝癌', en: 'Liver' },
  esophageal: { zh: '食管癌', en: 'Esophageal' },
  brain: { zh: '脑瘤', en: 'Brain' },
  headneck: { zh: '头颈癌', en: 'Head & Neck' },
  myeloma: { zh: '多发性骨髓瘤', en: 'Multiple Myeloma' },
  uterine: { zh: '子宫内膜癌', en: 'Uterine' },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const cancer = req.query.cancer || 'breast'
  const locale = (req.query.locale || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en'
  const apiKey = process.env.SERPER_API_KEY
  const cancerName = (CANCER_NAMES[cancer] || CANCER_NAMES.breast)[locale]

  if (!apiKey) {
    const demo = DEMO_STORIES.map((s) => ({
      ...s,
      fetchedAt: Date.now(),
    }))
    return res.status(200).json({
      stories: demo,
      fromCache: false,
      regions: ['us', 'ca', 'cn'],
      message: 'Using curated stories. Set SERPER_API_KEY for live search.',
    })
  }

  const seenUrls = new Set()
  const allStories = []

  try {
    const searches = [
      { region: 'us', query: REGION_QUERIES.us[locale], gl: 'us', hl: locale === 'zh' ? 'zh-cn' : 'en' },
      { region: 'ca', query: REGION_QUERIES.ca[locale], gl: 'ca', hl: locale === 'zh' ? 'zh-cn' : 'en' },
      { region: 'cn', query: REGION_QUERIES.cn[locale], gl: 'cn', hl: 'zh-cn' },
    ]

    const results = await Promise.allSettled(
      searches.map(({ region, query, gl, hl }) =>
        searchSerper(apiKey, query, gl, hl).then((organic) => ({ region, organic }))
      )
    )

    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      const { region, organic } = r.value
      const regionStories = buildStoriesFromSerper(organic, region, cancerName, locale, cancer)
      for (const s of regionStories) {
        const key = (s.sourceUrl || s.title || '').toLowerCase()
        if (key && !seenUrls.has(key)) {
          seenUrls.add(key)
          allStories.push(s)
        }
      }
    }

    const deduped = allStories.slice(0, 10)
    return res.status(200).json({
      stories: deduped,
      fromCache: false,
      regions: ['us', 'ca', 'cn'],
      count: deduped.length,
    })
  } catch (err) {
    console.error('Global Pulse error:', err)
    const demo = DEMO_STORIES.map((s) => ({ ...s, fetchedAt: Date.now() }))
    return res.status(200).json({
      stories: demo,
      fromCache: false,
      regions: ['us', 'ca', 'cn'],
      message: 'Search unavailable, showing curated stories.',
    })
  }
}
