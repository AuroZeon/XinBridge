import { Phone, MessageSquare } from 'lucide-react'
import { useTranslation } from '../i18n/context'
import { getItem } from '../utils/storage'

export interface ContactFamilyModalProps {
  open: boolean
  onClose: () => void
  /** Pre-filled message for SMS (e.g. "I need support") */
  message?: string
  /** Override family phone (e.g. from parent state) - otherwise reads from storage */
  familyPhoneOverride?: string
  /** Called when user picks a contact option (call/sms/wechat/whatsapp) */
  onContactChosen?: () => void
}

/** WeChat icon - simple chat bubbles */
function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.5 6C5.46 6 3 8.24 3 11c0 1.92 1.02 3.6 2.5 4.6V18l2.5-1.4c.67.2 1.38.3 2.12.3 3.04 0 5.5-2.24 5.5-5s-2.46-5-5.5-5zm0 8.5c-.83 0-1.5-.67-1.5-1.5S7.67 11.5 8.5 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-8.5c-.83 0-1.5.67-1.5 1.5S11.67 9.5 12.5 9.5s1.5-.67 1.5-1.5S13.33 6.5 12.5 6.5z" />
      <path d="M20.5 12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c.74 0 1.45-.1 2.12-.3l2.5 1.4v-2.4c1.48-1 2.5-2.68 2.5-4.6zm-5 3.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

/** WhatsApp icon */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function ContactFamilyModal({ open, onClose, message = '', familyPhoneOverride, onContactChosen }: ContactFamilyModalProps) {
  const t = useTranslation()
  const ct = (t.caregiver || t) as Record<string, string>
  const familyPhone = familyPhoneOverride ?? getItem<string>('familyPhone', '')

  const defaultMessage = message || 'I\'m having a hard moment and may need support.'
  const smsBody = encodeURIComponent(defaultMessage)

  const closeAndNotify = () => {
    onContactChosen?.()
    onClose()
  }

  const handleCall = () => {
    if (familyPhone) {
      window.location.href = `tel:${familyPhone.replace(/\D/g, '')}`
    } else {
      window.location.href = 'tel:'
    }
    closeAndNotify()
  }

  const handleSms = () => {
    if (familyPhone) {
      window.location.href = `sms:${familyPhone.replace(/\D/g, '')}?body=${smsBody}`
    } else {
      window.location.href = `sms:?body=${smsBody}`
    }
    closeAndNotify()
  }

  const handleWeChat = () => {
    window.location.href = 'weixin://'
    closeAndNotify()
  }

  const handleWhatsApp = () => {
    if (familyPhone) {
      const num = familyPhone.replace(/\D/g, '')
      window.location.href = `https://wa.me/${num}?text=${smsBody}`
    } else {
      window.location.href = 'https://wa.me/'
    }
    closeAndNotify()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-sm bg-[var(--color-bg-elevated)] rounded-t-3xl sm:rounded-2xl shadow-xl p-6 pb-safe animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-family-title"
      >
        <h2 id="contact-family-title" className="text-lg font-semibold text-[var(--color-text)] mb-1">
          {ct.contactOptions ?? 'How would you like to reach them?'}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          {familyPhone ? (ct.contactWithNumber ?? 'Contact {phone}').replace('{phone}', familyPhone) : (ct.contactChooseApp ?? 'Choose an app to open')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCall}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            <Phone className="w-8 h-8" strokeWidth={2} />
            <span className="text-sm font-medium">{ct.contactCall ?? 'Call'}</span>
          </button>
          <button
            onClick={handleSms}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            <MessageSquare className="w-8 h-8" strokeWidth={2} />
            <span className="text-sm font-medium">{ct.contactSms ?? 'Text'}</span>
          </button>
          <button
            onClick={handleWeChat}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            <WeChatIcon className="w-8 h-8" />
            <span className="text-sm font-medium">{ct.contactWechat ?? 'WeChat'}</span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            <WhatsAppIcon className="w-8 h-8" />
            <span className="text-sm font-medium">{ct.contactWhatsapp ?? 'WhatsApp'}</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 text-[var(--color-text-secondary)] text-sm hover:text-[var(--color-text)] transition-colors"
        >
          {ct.contactCancel ?? 'Cancel'}
        </button>
      </div>
    </div>
  )
}
