/**
 * XinBridge AI chat — server calls OpenAI (ChatGPT API) or configured China-compatible API.
 * Requires header: X-AI-Consent: accepted
 */
import { runChatCompletion } from './chatCore.mjs'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-AI-Consent')
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const consent = req.headers['x-ai-consent']
  if (consent !== 'accepted') {
    return res.status(403).json({ error: 'Consent required', code: 'CONSENT_REQUIRED' })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const result = await runChatCompletion(body, process.env)
  return res.status(result.status).json(result.json)
}
