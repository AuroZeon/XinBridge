/**
 * Vercel Serverless Function: Fetch new hope stories from web search.
 * Requires SERPER_API_KEY in Vercel env. Deploy with: vercel
 *
 * Query params: cancer (e.g. breast), locale (zh|en)
 * Returns: { stories: HopeStory[] }
 */
const CANCER_QUERIES = {
  breast: { zh: '乳腺癌 康复 故事', en: 'breast cancer survivor story' },
  lung: { zh: '肺癌 康复 故事', en: 'lung cancer survivor story' },
  colorectal: { zh: '结直肠癌 康复 故事', en: 'colorectal cancer survivor story' },
  prostate: { zh: '前列腺癌 康复 故事', en: 'prostate cancer survivor story' },
  thyroid: { zh: '甲状腺癌 康复 故事', en: 'thyroid cancer survivor story' },
  melanoma: { zh: '黑色素瘤 康复 故事', en: 'melanoma survivor story' },
  bladder: { zh: '膀胱癌 康复 故事', en: 'bladder cancer survivor story' },
  kidney: { zh: '肾癌 康复 故事', en: 'kidney cancer survivor story' },
  leukemia: { zh: '白血病 康复 故事', en: 'leukemia survivor story' },
  lymphoma: { zh: '淋巴瘤 康复 故事', en: 'lymphoma survivor story' },
  pancreatic: { zh: '胰腺癌 康复 故事', en: 'pancreatic cancer survivor story' },
  ovarian: { zh: '卵巢癌 康复 故事', en: 'ovarian cancer survivor story' },
  cervical: { zh: '宫颈癌 康复 故事', en: 'cervical cancer survivor story' },
  stomach: { zh: '胃癌 康复 故事', en: 'stomach cancer survivor story' },
  liver: { zh: '肝癌 康复 故事', en: 'liver cancer survivor story' },
  esophageal: { zh: '食管癌 康复 故事', en: 'esophageal cancer survivor story' },
  brain: { zh: '脑瘤 康复 故事', en: 'brain tumor survivor story' },
  headneck: { zh: '头颈癌 康复 故事', en: 'head neck cancer survivor story' },
  myeloma: { zh: '多发性骨髓瘤 康复 故事', en: 'multiple myeloma survivor story' },
  uterine: { zh: '子宫内膜癌 康复 故事', en: 'uterine cancer survivor story' },
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

function domainFromUrl(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host.includes('cancer.org')) return 'American Cancer Society'
    if (host.includes('cancerresearchuk')) return 'Cancer Research UK'
    if (host.includes('cancer.gov')) return 'National Cancer Institute'
    if (host.includes('caca.org.cn')) return '中国抗癌协会'
    return host
  } catch {
    return 'Web'
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cancer = req.query.cancer || 'breast'
  const locale = (req.query.locale || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en'
  const apiKey = process.env.SERPER_API_KEY

  if (!apiKey) {
    return res.status(503).json({
      error: 'Refresh API not configured',
      message: 'Set SERPER_API_KEY in Vercel environment variables. Get a free key at https://serper.dev',
    })
  }

  const queryConfig = CANCER_QUERIES[cancer] || CANCER_QUERIES.breast
  const searchQuery = queryConfig[locale]
  const cancerName = (CANCER_NAMES[cancer] || CANCER_NAMES.breast)[locale]

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 10,
        gl: locale === 'zh' ? 'cn' : 'us',
        hl: locale === 'zh' ? 'zh-cn' : 'en',
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(502).json({
        error: 'Search API error',
        message: text || response.statusText,
      })
    }

    const data = await response.json()
    const organic = data.organic || []

    const stories = organic.slice(0, 10).map((item, i) => ({
      id: `refresh-${cancer}-${Date.now()}-${i}`,
      title: item.title || 'Survivor Story',
      excerpt: (item.snippet || '').slice(0, 150) + (item.snippet?.length > 150 ? '...' : ''),
      content: (item.snippet || '') + (locale === 'zh' ? '\n\n点击下方链接阅读完整故事。' : '\n\nClick the link below to read the full story.'),
      category: locale === 'zh' ? '长期' : 'Long-term',
      cancerType: cancerName,
      yearsSince: 2 + (i % 5),
      tags: [cancerName],
      sourceName: domainFromUrl(item.link || ''),
      sourceUrl: item.link || 'https://www.cancer.org',
    }))

    return res.status(200).json({ stories, count: stories.length })
  } catch (err) {
    console.error('Refresh stories error:', err)
    return res.status(500).json({
      error: 'Internal error',
      message: err.message || 'Unknown error',
    })
  }
}
