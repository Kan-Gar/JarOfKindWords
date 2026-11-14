export const categories = {
  support: { label: 'Поддержка', mood: 'Хочу поддержки', color: '#b4d9ed', symbol: '☁' },
  compliment: { label: 'Комплименты', mood: 'Хочу комплимент', color: '#f3afc8', symbol: '♡' },
  humor: { label: 'Юмор', mood: 'Хочу улыбнуться', color: '#c4dca8', symbol: '✳' },
  warmth: { label: 'Тёплые слова', mood: 'Хочу тепла', color: '#c4b5ee', symbol: '✧' },
  special: { label: 'Особенная записка', mood: 'Особенные слова', color: '#f7d58b', symbol: '✦' },
} as const;
export type Category = keyof typeof categories;
export type Mood = 'random' | Category;
export interface Note { id: string; category: Category; text: string; rarity: 'common' | 'rare' | 'special' | 'confession'; weight: number }
export interface SavedState { version: 1; soundDefaultsVersion: 2; introSeen: boolean; favorites: string[]; readNotes: string[]; soundEnabled: boolean; selectedMood: Mood; remainingNotes: Partial<Record<Mood, string[]>>; lastNoteId: string | null; }
