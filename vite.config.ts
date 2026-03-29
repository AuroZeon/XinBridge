// @ts-nocheck — dynamic import of .mjs server module; types live in api/chatCore.d.ts for reference
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { IncomingMessage } from 'node:http'

/**
 * Load `.env` then `.env.local` into process.env for the Vite dev server only (API middleware).
 * Later files override earlier ones — matches common Vite/dotenv expectations.
 * Does not use `import.meta.env.VITE_*` (those are for the browser bundle only).
 */
function parseEnvLines(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq <= 0) continue
    const key = t.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    let val = t.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function loadRootEnv(): void {
  try {
    const merged: Record<string, string> = {}
    for (const name of ['.env', '.env.local']) {
      const p = resolve(process.cwd(), name)
      if (!existsSync(p)) continue
      Object.assign(merged, parseEnvLines(readFileSync(p, 'utf8')))
    }
    for (const [key, val] of Object.entries(merged)) {
      process.env[key] = val
    }
  } catch {
    /* ignore */
  }
}
loadRootEnv()

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'xinbridge-api-chat-dev',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const pathname = req.url?.split('?')[0] ?? ''
          if (pathname !== '/api/chat') {
            next()
            return
          }
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-AI-Consent')
          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }
          const consent = req.headers['x-ai-consent']
          if (consent !== 'accepted') {
            res.statusCode = 403
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Consent required', code: 'CONSENT_REQUIRED' }))
            return
          }
          try {
            const raw = await readBody(req as IncomingMessage)
            const body = JSON.parse(raw || '{}') as Record<string, unknown>
            const { runChatCompletion } = await import('./api/chatCore.mjs')
            const result = await runChatCompletion(body, process.env)
            res.statusCode = result.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result.json))
          } catch (e) {
            console.error('[api/chat dev]', e)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Server error', code: 'INTERNAL' }))
          }
        })
      },
    },
  ],
  base: './',
  worker: {
    format: 'es',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
