export type MoodType = 'calm' | 'worried' | 'sad' | 'angry' | 'exhausted';

export interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  labelZh: string;
}

export interface MoodCheckIn {
  mood: MoodType;
  timestamp: number;
  message?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface CaregiverContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}
