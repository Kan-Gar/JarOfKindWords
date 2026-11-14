import type { Mood, Note } from '../core/types';
import { StorageManager } from '../core/StorageManager';
export class NoteManager {
  constructor(readonly notes: Note[], readonly storage: StorageManager, private random = Math.random, private rarityWeights = { common: 1, rare: 0.35, special: 0.12, confession: 0.006 }) {
    if (!notes.length || new Set(notes.map(n => n.id)).size !== notes.length) throw new Error('Набор записок пуст или содержит повторяющиеся ID');
  }
  next(mood: Mood): Note {
    const state = this.storage.state;
    const regular = this.notes.filter(n => n.rarity !== 'final');
    // Final letters are a global epilogue: category selection and old queues cannot bypass it.
    if (regular.every(n => state.readNotes.includes(n.id))) {
      const finale = this.notes.filter(n => n.rarity === 'final').sort((a,b)=>(a.unlockOrder ?? 0)-(b.unlockOrder ?? 0)).find(n=>!state.readNotes.includes(n.id));
      if (finale) { this.remember(finale); return finale; }
    }
    const allowed = regular.filter(n => mood === 'random' || n.category === mood);
    let remaining = state.remainingNotes[mood]?.filter(id=>allowed.some(n=>n.id===id));
    if (!remaining?.length) remaining = allowed.map(n=>n.id);
    if (!remaining.length) throw new Error('В этой категории пока нет записок');
    const candidates = remaining.map(id => allowed.find(n => n.id === id)!);
    const pool = candidates.length > 1 ? candidates.filter(n => n.id !== state.lastNoteId) : candidates;
    const weight = (n: Note) => Math.max(0.001, n.weight * this.rarityWeights[n.rarity as keyof typeof this.rarityWeights]);
    let cursor = this.random() * pool.reduce((sum, n) => sum + weight(n), 0);
    const note = pool.find(n => (cursor -= weight(n)) < 0) || pool[pool.length - 1];
    state.remainingNotes[mood] = remaining.filter(id => id !== note.id);
    this.remember(note);
    return note;
  }
  private remember(note: Note) {
    const state=this.storage.state;
    if (!state.readNotes.includes(note.id)) state.readNotes.push(note.id);
    if (note.rarity==='final' && !state.favorites.includes(note.id)) state.favorites.push(note.id);
    state.lastNoteId=note.id;
    this.storage.save();
  }
}
