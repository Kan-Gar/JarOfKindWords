import type { Mood, Note } from '../core/types';
import { StorageManager } from '../core/StorageManager';
export class NoteManager {
  constructor(readonly notes: Note[], readonly storage: StorageManager, private random = Math.random, private rarityWeights = { common: 1, rare: 0.35, special: 0.12 }) {
    if (!notes.length || new Set(notes.map(n => n.id)).size !== notes.length) throw new Error('Набор записок пуст или содержит повторяющиеся ID');
  }
  next(mood: Mood): Note {
    const state = this.storage.state;
    let remaining = state.remainingNotes[mood];
    if (!remaining?.length) remaining = this.notes.filter(n => mood === 'random' || n.category === mood).map(n => n.id);
    if (!remaining.length) throw new Error('В этой категории пока нет записок');
    // Weighted sampling without replacement: even the rarest note is guaranteed in a full cycle.
    const candidates = remaining.map(id => this.notes.find(n => n.id === id)!).filter(Boolean);
    const pool = candidates.length > 1 ? candidates.filter(n => n.id !== state.lastNoteId) : candidates;
    const weight = (n: Note) => Math.max(0.001, n.weight * this.rarityWeights[n.rarity]);
    let cursor = this.random() * pool.reduce((sum, n) => sum + weight(n), 0);
    const note = pool.find(n => (cursor -= weight(n)) < 0) || pool[pool.length - 1];
    state.remainingNotes[mood] = remaining.filter(id => id !== note.id);
    if (!state.readNotes.includes(note.id)) state.readNotes.push(note.id);
    state.lastNoteId = note.id;
    this.storage.save();
    return note;
  }
}
