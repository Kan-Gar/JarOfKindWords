import { categories, type Mood, type Note } from '../core/types';
import { StorageManager } from '../core/StorageManager';
const arrow = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
const gear = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 1 3h4l1-3 3-1 2-3-2-2 1-3-3-2-1-3Z"/><circle cx="10.5" cy="11.5" r="3"/></svg>';
export class UIManager {
  readonly dialog: HTMLDialogElement;
  readonly intro: HTMLElement;
  readonly stage: HTMLElement;
  readonly jarButton: HTMLButtonElement;
  private previousFocus: HTMLElement | null = null;
  constructor(readonly storage: StorageManager) {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <main class="gift">
        <header class="topbar"><a class="wordmark" href="./" aria-label="Баночка хороших слов, главная"><span class="tiny-star">✦</span> МАЛЕНЬКОЕ ВОЛШЕБСТВО</a><button class="icon-button" id="settings" aria-label="Настройки">${gear}</button></header>
        <section class="heading"><p class="eyebrow">СОВИНАЯ ПОЧТА · ТОЛЬКО ДЛЯ ТЕБЯ</p><h1>Баночка<br><em>хороших слов</em></h1><p class="subtitle">Для тебя, на любой случай <span>♡</span></p></section>
        <section class="scene-section" aria-label="Волшебная баночка">
          <div class="scene-halo"></div><div id="scene"></div><button id="jar" class="jar-hit" aria-label="Достать записку из баночки"></button>
          <span class="scene-caption">письма из твоего маленького Хогвартса</span>
        </section>
        <section class="invitation"><button id="draw" class="draw-button"><span>Достать записку</span><span aria-hidden="true">${arrow}</span></button><p id="hint" aria-live="polite">Нажми на баночку — она кое-что для тебя хранит</p></section>
        <nav class="bottom-nav" aria-label="Разделы"><button id="favorites"><span aria-hidden="true">♡</span> Избранное <small id="favorite-count">0</small></button><span class="nav-divider"></span><button id="moods"><span aria-hidden="true">✧</span><span id="mood-label">Выбрать настроение</span></button></nav>
        <footer>Пусть сегодня станет чуточку теплее <span>·</span> <span id="read-count">0</span> записок</footer>
      </main>
      <section id="intro" class="intro" aria-label="Твой подарок" hidden><div class="intro-stars" aria-hidden="true">✧ &nbsp; ✦ &nbsp; ✧</div><p class="eyebrow">КОЕ-ЧТО ЛИЧНОЕ</p><h2>Я приготовил для тебя<br><em>кое-что маленькое…</em></h2><p class="intro-copy">Здесь спрятаны слова, которые, надеюсь,<br>иногда будут делать твой день чуточку лучше.</p><button class="draw-button" id="open-gift">Открыть подарок <span aria-hidden="true">${arrow}</span></button><p class="intro-foot">Можно заглядывать, когда захочется</p></section>
      <dialog id="modal" aria-label="Записки и настройки"><div id="dialog-content"></div></dialog><p id="toast" class="toast" role="status" hidden></p>`;
    this.dialog = document.querySelector('#modal')!;
    this.intro = document.querySelector('#intro')!;
    this.stage = document.querySelector('#scene')!;
    this.jarButton = document.querySelector('#jar')!;
    this.dialog.addEventListener('click', e => {if(e.target === this.dialog) this.dialog.close();});
    this.dialog.addEventListener('close', () => { this.previousFocus?.focus(); });
    this.refresh();
  }
  on(id: string, action: () => void) { document.getElementById(id)!.addEventListener('click', action); }
  showIntro() { this.intro.hidden=false; document.querySelector<HTMLElement>('.gift')!.inert=true; document.querySelector<HTMLButtonElement>('#open-gift')!.focus(); }
  hideIntro() { this.intro.hidden=true;document.querySelector<HTMLElement>('.gift')!.inert=false;this.jarButton.focus(); }
  refresh() {
    document.querySelector('#favorite-count')!.textContent=String(this.storage.state.favorites.length);
    document.querySelector('#read-count')!.textContent=String(this.storage.state.readNotes.length);
    document.querySelector('#mood-label')!.textContent=this.storage.state.selectedMood==='random'?'Выбрать настроение':categories[this.storage.state.selectedMood].mood;
  }
  busy(busy: boolean) {
    this.jarButton.disabled=busy;document.querySelector<HTMLButtonElement>('#draw')!.disabled=busy;
    document.querySelector('#hint')!.textContent=busy?'Выбираем слова именно для этого момента…':'Нажми на баночку — она кое-что для тебя хранит';
    document.querySelector('.scene-section')!.setAttribute('aria-busy',String(busy));
  }
  modal(content: string, label: string, paper=false) {
    if(!this.dialog.open) this.previousFocus=document.activeElement as HTMLElement;
    this.dialog.className=paper?'paper-dialog':'panel-dialog';
    this.dialog.setAttribute('aria-label',label);
    document.querySelector('#dialog-content')!.innerHTML=content;
    if(!this.dialog.open)this.dialog.showModal();
    this.dialog.querySelector('[data-close]')?.addEventListener('click',()=>this.dialog.close());
  }
  note(note: Note, next: () => void, favorite: () => void, fromFavorites=false) {
    const category=categories[note.category],saved=this.storage.state.favorites.includes(note.id);
    this.modal(`<article class="note-card ${note.rarity==='confession'?'rare confession':note.rarity!=='common'?'rare':''}" style="--note-color:${category.color}"><div class="note-top"><span class="note-category">${category.symbol} &nbsp;${category.label}</span><button class="paper-icon" data-close aria-label="Закрыть записку">×</button></div><div class="note-ornament wax-seal" aria-hidden="true">${note.rarity==='confession'?'♡':'H'}</div><p class="note-text" tabindex="0"></p><p class="note-signature">твой человек по эту сторону волшебства</p><div class="note-actions"><button id="save-note" class="save-note" aria-pressed="${saved}"><span aria-hidden="true">${saved?'♥':'♡'}</span> ${saved?'В избранном':'В избранное'}</button><button id="next-note" class="next-note">${fromFavorites?'К избранному':'Ещё записку'} <span aria-hidden="true">${arrow}</span></button></div><p class="note-number">${this.dialog.dataset.delivery==='owl'?'Письмо принесла белая сова':'Из личной совиной почты'} · № ${note.id.split('_')[1]}</p></article>`, 'Записка: '+category.label,true);
    this.dialog.querySelector('.note-text')!.textContent=note.text;
    this.on('next-note',next);this.on('save-note',favorite);
  }
  favorites(notes: Note[], open: (note: Note) => void) {
    this.modal(`<section class="panel"><div class="panel-heading"><div><p class="eyebrow">СОХРАНЁННОЕ ТЕПЛО</p><h2>Твоё избранное</h2></div><button class="icon-button" data-close aria-label="Закрыть избранное">×</button></div><p class="panel-subtitle">Слова, к которым хочется вернуться.</p><div class="favorites-list"></div><p class="storage-notice">Хранится только в этом браузере. Очистка данных удалит избранное; Safari и Telegram могут хранить его отдельно.</p></section>`,'Избранные записки');
    const list=this.dialog.querySelector('.favorites-list')!;
    const favorites=notes.filter(n=>this.storage.state.favorites.includes(n.id));
    if(!favorites.length)list.innerHTML='<div class="empty-state"><span>♡</span><h3>Здесь пока тихо</h3><p>Сохрани записку с помощью сердечка,<br>и она останется здесь.</p></div>';
    favorites.forEach(note=> {
      const button=document.createElement('button');button.className='favorite-card';button.style.setProperty('--note-color',categories[note.category].color);
      const label=document.createElement('span');label.className='favorite-category';label.textContent=categories[note.category].label;
      const text=document.createElement('p');text.textContent=note.text;
      button.append(label,text);button.addEventListener('click',()=>open(note));list.appendChild(button);
    });
  }
  moods(select: (mood: Mood) => void) {
    this.modal(`<section class="panel"><div class="panel-heading"><div><p class="eyebrow">ПРИСЛУШАЙСЯ К СЕБЕ</p><h2>Как ты сейчас?</h2></div><button class="icon-button" data-close aria-label="Закрыть выбор настроения">×</button></div><p class="panel-subtitle">Баночка подберёт нужные слова.</p><div class="mood-list"></div></section>`,'Выбор настроения');
    const moods: Mood[]=['random','support','humor','compliment','warmth','special'];
    moods.forEach(mood=>{
      const b=document.createElement('button');b.className='mood-option';b.setAttribute('aria-pressed',String(this.storage.state.selectedMood===mood));
      b.innerHTML=`<span class="mood-symbol">${mood==='random'?'✦':categories[mood].symbol}</span><span>${mood==='random'?'Удиви меня':categories[mood].mood}</span><span class="check">${mood===this.storage.state.selectedMood?'✓':arrow}</span>`;
      b.addEventListener('click',()=>select(mood));this.dialog.querySelector('.mood-list')!.append(b);
    });
  }
  settings(sound: () => void, intro: () => void) {
    this.modal(`<section class="panel"><div class="panel-heading"><div><p class="eyebrow">ПУСТЬ БУДЕТ УЮТНО</p><h2>Маленькие настройки</h2></div><button class="icon-button" data-close aria-label="Закрыть настройки">×</button></div><button id="sound" class="setting-row" aria-pressed="${this.storage.state.soundEnabled}"><span>Тихие звуки<small>Стекло, бумага и немного магии</small></span><span class="switch ${this.storage.state.soundEnabled?'on':''}"></span></button><button id="replay" class="setting-row"><span>Открыть подарок заново<small>Ещё раз посмотреть приветствие</small></span><span>${arrow}</span></button><p class="storage-notice">${this.storage.available?'Избранное и прочитанные записки сохраняются на этом устройстве.':'Хранилище недоступно. Приложение работает, но данные могут исчезнуть после закрытия страницы.'}</p><p class="storage-notice">Уменьшение движения учитывает системную настройку устройства. Звук необязателен и может быть недоступен в браузере.</p></section>`,'Настройки');
    this.on('sound',sound);this.on('replay',intro);
  }
  toast(message: string) { const e=document.querySelector<HTMLElement>('#toast')!;e.textContent=message;e.hidden=false;setTimeout(()=>e.hidden=true,2800); }
}
