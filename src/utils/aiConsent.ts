const STORAGE_KEY = 'xinbridge_ai_consent_v1'

export type AiConsentChoice = 'pending' | 'accepted' | 'declined'


type Stored = {
  choice: 'accepted' | 'declined'
  at: number
}

export function getAiConsentChoice(): AiConsentChoice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 'pending'
    const d = JSON.parse(raw) as Stored & { accepted?: boolean }
    if (d?.choice === 'accepted' || d?.choice === 'declined') return d.choice
    if (d?.accepted === true) return 'accepted'
  } catch {
    /* ignore */
  }
  return 'pending'
}

export function setAiConsentAccepted(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: 'accepted', at: Date.now() } satisfies Stored))
  } catch {
    /* ignore */
  }
}

export function setAiConsentDeclined(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: 'declined', at: Date.now() } satisfies Stored))
  } catch {
    /* ignore */
  }
}
