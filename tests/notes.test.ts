import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data/notes.json';
import { categories, type Note } from '../src/core/types';
import { StorageManager, STORAGE_KEY } from '../src/core/StorageManager';
import { NoteManager } from '../src/systems/NoteManager';
const notes=data as Note[];
function memory(initial: unknown=null) {let value=initial===null?null:JSON.stringify(initial);return {getItem:()=>value,setItem:(_key:string,v:string)=>{value=v;}};}
test('158 unique notes including 50 additions and two locked final letters',()=>{
  assert.equal(notes.length,158);assert.equal(new Set(notes.map(n=>n.id)).size,158);
  for(const category of Object.keys(categories))assert.equal(notes.filter(n=>n.category===category).length,category==='special'?38:30);
  for(const n of notes){assert.ok(n.text.length>30);assert.ok(n.weight>0);assert.ok(['common','rare','special','confession','final'].includes(n.rarity));}
});
test('first cycle ends with two finals; later ordinary cycles remain without repeats',()=>{
 const s=new StorageManager(notes,memory()),manager=new NoteManager(notes,s);
 const first=Array.from({length:158},()=>manager.next('random'));
 assert.equal(new Set(first.map(n=>n.id)).size,158);
 assert.deepEqual(first.slice(-2).map(n=>n.id),['final_001','final_002']);
 for(let cycle=0;cycle<3;cycle++){
  const ids=Array.from({length:156},()=>manager.next('random').id);
  assert.equal(new Set(ids).size,156);assert.ok(!ids.some(id=>id.startsWith('final_')));
 }
});
test('category cycles reset independently and random progress is retained',()=>{
  const s=new StorageManager(notes,memory()),manager=new NoteManager(notes,s);
  manager.next('random');manager.next('humor');const random=[...s.state.remainingNotes.random!],humor=[...s.state.remainingNotes.humor!];
  for(let cycle=0;cycle<2;cycle++){const ids=new Set(Array.from({length:30},()=>manager.next('support').id));assert.equal(ids.size,30);}
  assert.deepEqual(s.state.remainingNotes.random,random);assert.deepEqual(s.state.remainingNotes.humor,humor);
});
test('reload retains cycle, favorites, sound, mood and history',()=>{
  const m=memory(),s=new StorageManager(notes,m),manager=new NoteManager(notes,s);
  const first=manager.next('random');s.toggleFavorite(first.id);s.state.soundEnabled=true;s.state.selectedMood='warmth';s.save();
  const restored=new StorageManager(notes,m);assert.deepEqual(restored.state,s.state);
  const remainder=Array.from({length:notes.length-1},()=>new NoteManager(notes,restored).next('random').id);assert.ok(!remainder.includes(first.id));
});
test('invalid save values, obsolete notes and malformed queues are sanitized',()=>{
  const s=new StorageManager(notes,memory({version:1,favorites:['unknown',notes[0].id,notes[0].id],selectedMood:'invalid',soundEnabled:'true',remainingNotes:{support:['humor_001','support_001']},readNotes:[notes[0].id]}));
  assert.deepEqual(s.state.favorites,[notes[0].id]);assert.equal(s.state.selectedMood,'random');assert.equal(s.state.soundEnabled,true);assert.ok(!s.state.remainingNotes.support!.includes('humor_001'));
});
test('corrupt, unavailable, quota-limited and future storage do not break drawing',()=>{
  const stores=[null,{getItem:()=>'{broken',setItem:()=>{}},{getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');}},memory({version:999}),{getItem:()=>null,setItem:()=>{throw Error('quota');}}];
  for(const store of stores){const s=new StorageManager(notes,store);assert.ok(new NoteManager(notes,s).next('random'));}
});
test('content additions are available while removed IDs are discarded',()=>{
  const m=memory(),s=new StorageManager(notes.slice(0,10),m),manager=new NoteManager(notes.slice(0,10),s);
  manager.next('random');const restored=new StorageManager(notes.slice(1,11),m);
  assert.ok(restored.state.remainingNotes.random!.includes(notes[10].id));assert.ok(!restored.state.remainingNotes.random!.includes(notes[0].id));
});
test('favorite toggle removes only the chosen ID',()=>{const s=new StorageManager(notes,memory());s.toggleFavorite(notes[0].id);s.toggleFavorite(notes[1].id);s.toggleFavorite(notes[0].id);assert.deepEqual(s.state.favorites,[notes[1].id]);});
test('zero random value and extremely small rarity weights still terminate cycles',()=>{const s=new StorageManager(notes,memory()),m=new NoteManager(notes,s,()=>0,{common:1,rare:0.000001,special:0.000001,confession:0.000001});assert.equal(new Set(Array.from({length:notes.length},()=>m.next('random').id)).size,158);});

test('retired motivation is removed from an existing save without losing favorites',()=>{
 const s=new StorageManager(notes,memory({version:1,selectedMood:'motivation',soundEnabled:false,favorites:['motivation_001','humor_001'],readNotes:['motivation_001','support_001'],remainingNotes:{random:['motivation_001','humor_001']}}));
 assert.equal(s.state.selectedMood,'random');assert.equal(s.state.soundEnabled,true);
 assert.deepEqual(s.state.favorites,['humor_001']);assert.deepEqual(s.state.readNotes,['support_001']);
 assert.ok(!s.state.remainingNotes.random!.includes('motivation_001'));
});
test('sound starts enabled but a new explicit mute survives reload',()=>{
 const m=memory(),s=new StorageManager(notes,m);assert.equal(s.state.soundEnabled,true);
 s.state.soundEnabled=false;s.save();assert.equal(new StorageManager(notes,m).state.soundEnabled,false);
});
test('personalized messages and very rare confessions are present',()=>{
 assert.equal(notes.find(n=>n.id==='humor_001')!.text,'Проверка завершена. Уровень твоей красоты превышает допустимые нормы.');
 assert.equal(notes.find(n=>n.id==='humor_010')!.text,'Обнаружен дефицит сладенького. Просьба принять меры по возможности.');
 assert.equal(notes.find(n=>n.id==='humor_013')!.text,'Баночка сообщает: сегодня ты большая умничка. Апелляции принимаются, но отклоняются.');
 assert.equal(notes.filter(n=>n.rarity==='confession').length,6);
 assert.ok(!notes.some(n=>(n.category as string)==='motivation'));
 const s=new StorageManager(notes,memory());s.state.remainingNotes.random=notes.filter(n=>n.rarity==='confession').map(n=>n.id);assert.equal(new NoteManager(notes,s,()=>0.9999999).next('random').rarity,'confession');
});

test('finals cannot be drawn through a category or tampered queue before all other notes',()=>{
 const s=new StorageManager(notes,memory()),m=new NoteManager(notes,s,()=>0.99999);
 s.state.remainingNotes.special=['final_001','final_002'];
 for(let i=0;i<80;i++)assert.notEqual(m.next('special').rarity,'final');
 assert.ok(!s.state.favorites.includes('final_001'));
});
test('global epilogue unlocks in order across moods, survives reload and saves favorites',()=>{
 const mem=memory(),s=new StorageManager(notes,mem);
 s.state.readNotes=notes.filter(n=>n.rarity!=='final').map(n=>n.id);
 const m=new NoteManager(notes,s);
 assert.equal(m.next('humor').id,'final_001');assert.ok(s.state.favorites.includes('final_001'));
 const restored=new StorageManager(notes,mem);
 assert.equal(new NoteManager(notes,restored).next('support').id,'final_002');
 assert.deepEqual(restored.state.favorites,['final_001','final_002']);
});
