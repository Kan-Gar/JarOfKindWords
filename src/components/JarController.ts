import { DeliveryManager } from '../systems/DeliveryManager';
import { AnimationManager } from '../systems/AnimationManager';
import { NoteManager } from '../systems/NoteManager';
import { AudioManager } from '../systems/AudioManager';
import { UIManager } from './UIManager';
import { categories, type Note } from '../core/types';
export class JarController {
  private locked=false;
  private opened=false;
  private deliveries = new DeliveryManager();
  constructor(private ui: UIManager,private notes: NoteManager,private audio: AudioManager,private animation?: AnimationManager) {}
  async draw() {
    if(this.locked)return;
    this.locked=true;this.ui.busy(true);
    try {
      const note=this.notes.next(this.notes.storage.state.selectedMood);
      const delivery=this.deliveries.next();
      this.ui.dialog.dataset.delivery=delivery;
      await this.audio.unlock();
      if(this.animation)await this.animation.extract(categories[note.category].color,this.opened,note.rarity!=='common',delivery);
      this.opened=true;this.show(note);this.ui.refresh();
      if(!this.notes.storage.available)this.ui.toast('Хранилище недоступно: записки сохраняются только на время сеанса.');
    } catch { this.ui.toast('Не получилось достать записку. Попробуй ещё раз.'); }
    finally {this.locked=false;this.ui.busy(false);}
  }
  show(note: Note, fromFavorites=false, focusFavorite=false) {
    this.ui.note(note,()=>{if(fromFavorites)this.favorites();else void this.again();},()=>{
      this.notes.storage.toggleFavorite(note.id);this.audio.play('favorite');this.ui.refresh();this.show(note,fromFavorites,true);
    },fromFavorites);
    if(focusFavorite)document.querySelector<HTMLButtonElement>('#save-note')!.focus();
    else { this.animation?.reveal(this.ui.dialog.querySelector('.note-card')!); }
  }
  private async again() {
    if(this.locked)return;
    this.locked=true;
    await this.animation?.close(this.ui.dialog.querySelector('.note-card')!);
    this.ui.dialog.close();this.locked=false;await this.draw();
  }
  previewFinal(note: Note) {
    if(this.locked)return;
    // Preview saves the gift, but deliberately does not mark it read or advance the epilogue.
    if(!this.notes.storage.state.favorites.includes(note.id))this.notes.storage.toggleFavorite(note.id);
    this.ui.dialog.dataset.delivery='preview';this.show(note,true);this.ui.refresh();
  }
  favorites() {this.ui.dialog.dataset.delivery='archive';this.ui.favorites(this.notes.notes,n=>this.show(n,true));}
}
