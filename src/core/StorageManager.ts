import { categories, type SavedState, type Note, type Mood } from './types';
export const STORAGE_KEY = 'kind-words-jar.v1';
export class StorageManager {
  state: SavedState;
  available = true;
  constructor(notes: Note[], private storage: Pick<Storage, 'getItem' | 'setItem'> | null = (() => { try { return localStorage; } catch { return null; } })()) {
    const defaults: SavedState = { version: 1, soundDefaultsVersion: 2, introSeen: false, favorites: [], readNotes: [], soundEnabled: true, selectedMood: 'random', remainingNotes: {}, lastNoteId: null };
    this.state = defaults;
    const ids = new Set(notes.map(n => n.id));
    const validIds = (a: unknown): string[] => Array.isArray(a) ? [...new Set(a.filter((id): id is string => typeof id === 'string' && ids.has(id)))] : [];
    try {
      if (!storage) { this.available = false; return; }
      const raw = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
      if (!raw || raw.version !== 1) return;
      const moods = ['random', ...Object.keys(categories)];
      this.state = { ...defaults, introSeen: raw.introSeen === true, soundEnabled: raw.soundDefaultsVersion === 2 ? raw.soundEnabled !== false : true,
        selectedMood: moods.includes(raw.selectedMood) ? raw.selectedMood : 'random', favorites: validIds(raw.favorites), readNotes: validIds(raw.readNotes), lastNoteId: ids.has(raw.lastNoteId) ? raw.lastNoteId : null };
      for (const mood of moods as Mood[]) {
        if (Array.isArray(raw.remainingNotes?.[mood])) {
          this.state.remainingNotes[mood] = validIds(raw.remainingNotes[mood]).filter(id => notes.find(n => n.id === id)?.rarity !== 'final' && (mood === 'random' || notes.find(n => n.id === id)?.category === mood));
          // A content update adds new notes without restoring already consumed ones.
          const newIds = notes.filter(n => n.rarity !== 'final' && (mood === 'random' || n.category === mood) && !this.state.readNotes.includes(n.id) && !this.state.remainingNotes[mood]!.includes(n.id)).map(n => n.id);
          this.state.remainingNotes[mood]!.push(...newIds);
        }
      }
    } catch (error) { if (!(error instanceof SyntaxError)) this.available = false; /* A damaged save must never prevent opening the gift. */ }
  }
  save() { try { if (!this.storage) throw new Error('Storage unavailable'); this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch { this.available = false; } }
  toggleFavorite(id: string) { const a = this.state.favorites; this.state.favorites = a.includes(id) ? a.filter(x => x !== id) : [...a, id]; this.save(); }
}
