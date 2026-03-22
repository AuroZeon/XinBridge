import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getItem, setItem } from '../utils/storage'
import { useTranslation, useLocale } from '../i18n/context'
import { CheckCircle2 } from '../components/icons'
import { images } from '../data/mediaAssets'
import { ImgWithFallback } from '../components/ImgWithFallback'
import ContactFamilyModal from '../components/ContactFamilyModal'

const PRESET_IDS = ['anxious', 'support', 'lonely', 'tired'] as const

export default function Caregiver() {
  const backTo = ((useLocation().state as { from?: string })?.from) ?? '/'
  const t = useTranslation()
  const locale = useLocale()
  const [tab, setTab] = useState<'notify' | 'notes'>('notify')
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [familyNote, setFamilyNote] = useState('')
  const [savedNotes, setSavedNotes] = useState<string[]>(() => getItem<string[]>('familyNotes', []))
  const [familyPhone, setFamilyPhone] = useState(() => getItem<string>('familyPhone', ''))
  const [sendError, setSendError] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  const cg = t.caregiver as Record<string, string>
  const presetMsgs = t.presetMessages as Record<string, string>

  useEffect(() => {
    setItem('familyNotes', savedNotes)
  }, [savedNotes])

  useEffect(() => {
    setItem('familyPhone', familyPhone)
  }, [familyPhone])

  const handleSend = () => {
    const message = customMessage.trim() || (selectedMessage ? presetMsgs[selectedMessage] : '')
    if (!message) {
      setSendError(String(cg.pleaseSelectMessage))
      return
    }
    setSendError('')
    setContactMessage(message)
    setContactModalOpen(true)
  }

  const handleSendNote = (note: string) => {
    setContactMessage(note)
    setContactModalOpen(true)
  }


  const handleSaveNote = () => {
    const trimmed = familyNote.trim()
    if (trimmed) {
      setSavedNotes([trimmed, ...savedNotes])
      setFamilyNote('')
    }
  }

  if (sent) {
    return (
      <div className="min-h-dvh pt-safe pb-safe flex flex-col items-center justify-center px-6">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-semibold mb-2">{String(cg.sent)}</h2>
        <p className="text-center text-[var(--color-text-secondary)] mb-8">{String(cg.sentMessage)}</p>
        <button onClick={() => setSent(false)} className="text-[var(--color-primary)] font-semibold py-3">
          {String(cg.sendAgain)}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-safe px-4 pb-12 relative bg-[var(--color-bg)]">
      <div className="fixed inset-0 -z-10">
        <ImgWithFallback src={images.family} alt="" className="w-full h-full object-cover opacity-[0.1]" fallbackClassName="w-full h-full object-cover opacity-[0.1]" />
        <div className="absolute inset-0 bg-[var(--color-bg)]" />
      </div>
      <header className="header-safe flex items-center justify-between gap-4 pb-4 px-1">
        <Link to={backTo} className="text-[var(--color-primary)] text-sm">{String(t.back)}</Link>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">{String(cg.title)}</h1>
        <span className="w-10" aria-hidden />
      </header>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('notify')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'notify' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-[var(--color-text-secondary)]'}`}
        >
          {String(cg.notifyTab)}
        </button>
        <button
          onClick={() => setTab('notes')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'notes' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-[var(--color-text-secondary)]'}`}
        >
          {String(cg.notesTab)}
        </button>
      </div>

      {tab === 'notify' ? (
        <>
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-primary-subtle)]/50 border border-[var(--color-primary)]/20">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">{String(cg.familyPhone)}</label>
            <input
              type="tel"
              value={familyPhone}
              onChange={(e) => setFamilyPhone(e.target.value)}
              placeholder={cg.familyPhonePlaceholder}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-gray-400"
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">{String(cg.familyPhoneHint)}</p>
          </div>
          <p className="text-[var(--color-text-secondary)] mb-6">{String(cg.notifySubtitle)}</p>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">{String(cg.quickSelect)}</p>
          <div className="space-y-2 mb-6">
            {PRESET_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedMessage(id)}
                className={`w-full text-left p-4 rounded-xl bg-[var(--color-card)] border-2 transition ${selectedMessage === id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-transparent'}`}
              >
                <span className="text-[var(--color-text)]">{String(presetMsgs[id] ?? '')}</span>
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">{String(cg.orCustom)}</p>
          <textarea
            placeholder={cg.placeholder}
            value={customMessage}
            onChange={(e) => {
              setCustomMessage(e.target.value)
              if (e.target.value) setSelectedMessage(null)
            }}
            className="w-full min-h-[80px] p-4 rounded-xl bg-[var(--color-card)] text-[var(--color-text)] placeholder:text-gray-400 resize-none mb-6"
          />
          {sendError && (
            <p className="text-sm text-red-500 mb-3">{sendError}</p>
          )}
          <button onClick={handleSend} className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-semibold text-lg">
            {String(cg.sendToFamily)}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">{String(cg.notesSubtitle)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">{String(cg.notesExample)}</p>
          <textarea
            placeholder={cg.placeholder}
            value={familyNote}
            onChange={(e) => setFamilyNote(e.target.value)}
            className="w-full min-h-[100px] p-4 rounded-xl bg-[var(--color-card)] border border-gray-200 text-[var(--color-text)] placeholder:text-gray-400 resize-none mb-4"
          />
          <button
            onClick={handleSaveNote}
            disabled={!familyNote.trim()}
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold mb-6 disabled:opacity-50"
          >
            {String(t.save)} ({locale === 'zh' ? '可发给家人' : 'can share'})
          </button>
          {savedNotes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">{String(cg.savedNotes)}</p>
              <div className="space-y-2">
                {savedNotes.map((note, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--color-card)] border border-gray-100">
                    <p className="text-[var(--color-text)]">{note}</p>
                    <button
                      onClick={() => handleSendNote(note)}
                      className="text-sm text-[var(--color-primary)] mt-2"
                    >
                      {String(cg.sendToFamilyBtn)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <ContactFamilyModal
        open={contactModalOpen}
        onClose={() => { setContactModalOpen(false); setContactMessage(''); }}
        message={contactMessage}
        familyPhoneOverride={familyPhone}
        onContactChosen={() => setSent(true)}
      />
    </div>
  )
}
