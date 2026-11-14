import './styles/main.css';
import rawNotes from './data/notes.json';
import { StorageManager } from './core/StorageManager';
import { SceneManager } from './core/SceneManager';
import { NoteManager } from './systems/NoteManager';
import { AnimationManager } from './systems/AnimationManager';
import { AudioManager } from './systems/AudioManager';
import { UIManager } from './components/UIManager';
import { JarController } from './components/JarController';
import type { Note } from './core/types';
async function boot() {
  const notes=rawNotes as Note[], storage=new StorageManager(notes),ui=new UIManager(storage),audio=new AudioManager();
  audio.enabled=storage.state.soundEnabled;
  const scene=new SceneManager();let animation: AnimationManager|undefined;
  try {await scene.init(ui.stage);animation=new AnimationManager(scene,audio);}
  catch {ui.stage.innerHTML='<div class="fallback-jar" aria-hidden="true"><span>✧</span><i></i><i></i><i></i><i></i><i></i></div>';ui.toast('Упрощённая графика: все записки и избранное доступны.');}
  const controller=new JarController(ui,new NoteManager(notes,storage),audio,animation);
  ui.on('jar',()=>void controller.draw());ui.on('draw',()=>void controller.draw());
  ui.on('favorites',()=>controller.favorites());
  ui.on('moods',()=>ui.moods(mood=>{storage.state.selectedMood=mood;storage.save();ui.refresh();ui.dialog.close();}));
  const settings=()=>ui.settings(()=>{storage.state.soundEnabled=!storage.state.soundEnabled;audio.enabled=storage.state.soundEnabled;storage.save();void audio.unlock().then(()=>audio.play('favorite'));settings();document.querySelector<HTMLButtonElement>('#sound')?.focus();},()=>{ui.dialog.close();ui.showIntro();});
  ui.on('settings',settings);
  ui.on('open-gift',()=>{storage.state.introSeen=true;storage.save();ui.hideIntro();});
  if(!storage.state.introSeen)ui.showIntro();
  document.querySelector('footer')!.lastChild!.textContent=` / ${notes.length} записок`;
}
void boot().catch(()=>{document.querySelector('#app')!.innerHTML='<main class="fatal"><h1>Не удалось открыть подарок</h1><p>Обнови страницу. Если проблема повторяется, попробуй открыть ссылку в Safari.</p><button onclick="location.reload()">Попробовать снова</button></main>';});
