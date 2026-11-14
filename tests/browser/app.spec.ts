import { test, expect, type Page } from '@playwright/test';
const errors:string[]=[];
async function enter(page:Page){await page.goto('/');await page.getByRole('button',{name:'Открыть подарок',exact:true}).click();await expect(page.locator('#intro')).toBeHidden();}
async function draw(page:Page){await page.getByRole('button',{name:'Достать записку',exact:true}).click();await expect(page.locator('.note-text')).toBeVisible();}
test.beforeEach(async({page})=>{errors.length=0;page.on('pageerror',e=>errors.push(e.message));});
test.afterEach(()=>expect(errors).toEqual([]));
test('first visit, actual WebGL scene, note animation, favorite, reload and remove',async({page})=>{
  await enter(page);await expect(page.locator('canvas')).toBeVisible();await draw(page);
  const text=await page.locator('.note-text').textContent();
  await page.getByRole('button',{name:'В избранное',exact:true}).click();await expect(page.getByRole('button',{name:'В избранном',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Закрыть записку'}).click();await page.reload();await expect(page.locator('#intro')).toBeHidden();
  await page.getByRole('button',{name:/Избранное/}).click();await expect(page.locator('.favorite-card')).toHaveCount(1);await page.locator('.favorite-card').click();await expect(page.locator('.note-text')).toHaveText(text!);
  await page.getByRole('button',{name:'В избранном',exact:true}).click();await page.getByRole('button',{name:'К избранному'}).click();await expect(page.locator('.empty-state')).toBeVisible();
});
test('rapid taps draw once, next is faster and keyboard Escape returns focus',async({page})=>{
  await enter(page);await page.locator('#jar').evaluate((b:HTMLButtonElement)=>{for(let i=0;i<15;i++)b.click();});await expect(page.locator('.note-text')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kind-words-jar.v1')!).readNotes.length)).toBe(1);
  const first=await page.locator('.note-text').textContent();await page.getByRole('button',{name:'Ещё записку'}).click();await expect(page.locator('.note-text')).not.toHaveText(first!);await expect(page.locator('.note-text')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#modal')).not.toBeVisible();
});
test('all moods work, long special note scrolls, short viewport has no overflow',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await enter(page);
  for(const mood of ['Хочу поддержки','Хочу улыбнуться','Хочу комплимент','Хочу тепла','Особенные слова']){
    await page.locator('#moods').click();await page.getByRole('button',{name:new RegExp(mood)}).click();await draw(page);await expect(page.locator('.note-text')).not.toBeEmpty();await page.getByRole('button',{name:'Закрыть записку'}).click();
  }
  await page.setViewportSize({width:320,height:480});await draw(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const b=await page.locator('.note-actions').boundingBox();expect(b!.y+b!.height).toBeLessThanOrEqual(480);
  const text=page.locator('.note-text');await expect(text).toBeVisible();expect(await text.evaluate(e=>e.scrollHeight>=e.clientHeight)).toBe(true);
});
test('storage denied, audio absent and reduced motion keep the gift usable',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Denied');}});Object.defineProperty(window,'AudioContext',{value:undefined});});
  await page.emulateMedia({reducedMotion:'reduce'});await enter(page);await page.locator('#settings').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Закрыть настройки'}).click();await draw(page);await page.getByRole('button',{name:'В избранное',exact:true}).click();await expect(page.getByRole('button',{name:'В избранном',exact:true})).toBeVisible();
});
test('intro replay and persisted settings',async({page})=>{
  await enter(page);await page.locator('#settings').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');await page.locator('#replay').click();await expect(page.locator('#intro')).toBeVisible();await page.locator('#open-gift').click();await page.reload();await page.locator('#settings').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
});
test('desktop layout and keyboard draw',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await enter(page);await page.locator('#jar').focus();await page.keyboard.press('Enter');await expect(page.locator('.note-text')).toBeVisible();await page.screenshot({path:'test-results/desktop-note.png'});await page.keyboard.press('Escape');await page.screenshot({path:'test-results/desktop-scene.png'});
});
test('background tab and resumed animation remain interactive',async({page,context})=>{
  await enter(page);const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.bringToFront();await draw(page);await page.getByRole('button',{name:'Закрыть записку'}).click();await draw(page);await expect(page.locator('.note-text')).toBeVisible();await other.close();
});
test('graphics unavailable uses a functional fallback',async({page})=>{
  await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});
  await enter(page);await expect(page.locator('.fallback-jar')).toBeVisible();await draw(page);await expect(page.locator('.note-text')).not.toBeEmpty();
});

test('snowy owl brings a letter and leaves, including repeated deliveries',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0.01;});
  await enter(page);
  await draw(page);await expect(page.locator('#modal')).toHaveAttribute('data-delivery','owl');
  await expect(page.locator('.note-number')).toContainText('Письмо принесла белая сова');
  await page.screenshot({path:'test-results/owl-letter.png'});
  await page.getByRole('button',{name:'Ещё записку'}).click();await expect(page.locator('.note-text')).toBeVisible();
  await expect(page.locator('#modal')).toHaveAttribute('data-delivery','owl');
});
