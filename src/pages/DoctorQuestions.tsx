import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getItem, setItem } from '../utils/storage'
import { useTranslation } from '../i18n/context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { images } from '../data/mediaAssets'

export default function DoctorQuestions() {
  const t = useTranslation()
  const doc = t.doctor as Record<string, string>
  const suggestedQuestions = (t.suggestedQuestions as string[]) ?? []
  const [questions, setQuestions] = useState<string[]>(() => getItem<string[]>('doctorQuestions', []))
  const [newQuestion, setNewQuestion] = useState('')

  useEffect(() => {
    setItem('doctorQuestions', questions)
  }, [questions])

  const addQuestion = (q: string) => {
    const trimmed = q.trim()
    if (trimmed && !questions.includes(trimmed)) {
      setQuestions([...questions, trimmed])
      setNewQuestion('')
    }
  }

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  return (
    <div className="min-h-dvh pt-safe pb-safe px-4 pb-12 relative bg-[var(--color-bg)]">
      <div className="fixed inset-0 -z-10">
        <img src={images.sunshine} alt="" className="w-full h-full object-cover opacity-[0.12]" />
        <div className="absolute inset-0 bg-[var(--color-bg)]" />
      </div>
      <header className="flex items-center justify-between gap-4 py-4">
        <Link to="/" className="text-[var(--color-primary)] text-sm">← {String(t.back)}</Link>
        <h1 className="text-xl font-semibold">{String(doc.title)}</h1>
        <LanguageSwitcher />
      </header>

      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        {String(doc.subtitle)}
      </p>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={String(doc.addPlaceholder)}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addQuestion(newQuestion)}
            className="flex-1 p-3 rounded-xl border border-gray-200 text-[var(--color-text)] placeholder:text-gray-400"
          />
          <button
            onClick={() => addQuestion(newQuestion)}
            className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium"
          >
            {String(doc.add)}
          </button>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-secondary)] mb-3">{String(doc.suggested)}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => addQuestion(q)}
            className="px-3 py-2 text-sm bg-[var(--color-card)] rounded-lg border border-gray-200 text-[var(--color-text)] hover:border-[var(--color-primary)] transition"
          >
            + {q}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {questions.length === 0 ? (
          <p className="text-center text-[var(--color-text-secondary)] py-8">{String(doc.noQuestions)}</p>
        ) : (
          questions.map((q, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[var(--color-card)] p-4 rounded-xl border border-gray-100"
            >
              <span className="text-[var(--color-primary)] font-medium">{i + 1}.</span>
              <span className="flex-1 text-[var(--color-text)]">{q}</span>
              <button
                onClick={() => removeQuestion(i)}
                className="text-red-500 text-sm px-2"
                aria-label={String(doc.delete)}
              >
                {String(doc.delete)}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
