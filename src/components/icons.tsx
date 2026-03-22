import {
  Smile,
  AlertCircle,
  Frown,
  Flame,
  Moon,
  MessageCircle,
  ClipboardList,
  HeartPulse,
  Wind,
  Users,
  BookOpen,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Globe,
  Volume2,
  type LucideIcon,
} from 'lucide-react'

export const MenuIcons: Record<string, LucideIcon> = {
  mood: Smile,
  chat: MessageCircle,
  symptoms: ClipboardList,
  doctor: HeartPulse,
  breathing: Wind,
  sleep: Moon,
  caregiver: Users,
  hope: BookOpen,
}

export const MoodIcons: Record<string, LucideIcon> = {
  calm: Smile,
  worried: AlertCircle,
  sad: Frown,
  angry: Flame,
  exhausted: Moon,
}

export { HeartHandshake, CheckCircle2, Wind, Moon, BookOpen, Volume2, ChevronRight, RefreshCw, Globe }
