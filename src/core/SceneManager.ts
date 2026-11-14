import { Application, Container, Graphics } from 'pixi.js';
import { StoryBackdrop } from '../components/StoryBackdrop';
import { OwlCourier } from '../components/OwlCourier';
import { ParticleSystem } from '../systems/ParticleSystem';
export class SceneManager {
  readonly app = new Application();
  readonly world = new Container();
  private backdrop = new StoryBackdrop();
  readonly wand = new Container();
  readonly spell = new Graphics();
  readonly owl = new OwlCourier();
  readonly jar = new Container();
  readonly lid = new Container();
  readonly slips = new Container();
  readonly flying = new Container();
  readonly magicGlow = new Container();
  private sheen = new Graphics();
  readonly particles = new ParticleSystem(matchMedia('(pointer: coarse)').matches ? 22 : 36);
  private elapsed = 0;
  private idle = true;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  setIdle(value: boolean) { this.idle = value; if (!value) { this.jar.rotation = 0; this.jar.y = 215; } }
  async init(host: HTMLElement) {
    await this.app.init({ width: 520, height: 600, backgroundAlpha: 0, antialias: false, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, preference: 'webgl' });
    host.appendChild(this.app.canvas);
    this.app.canvas.setAttribute('aria-hidden', 'true');
    this.app.stage.addChild(this.backdrop.view,this.world);
    this.world.y=160;
    this.build();
    this.app.ticker.maxFPS = 60;
    this.app.ticker.add(ticker => {
      if (this.reduced.matches) return;
      this.elapsed += ticker.deltaMS / 1000;
      this.backdrop.update(this.elapsed);
      this.sheen.x = -55 + ((this.elapsed * 14) % 110);
      this.sheen.alpha = Math.max(0, Math.sin(this.elapsed * 0.5)) * 0.12;
      this.particles.update(ticker.deltaMS / 1000);
      if (this.idle) {
        this.jar.y = 215 + Math.sin(this.elapsed * 1.1) * 1.4;
        this.jar.rotation = Math.sin(this.elapsed * 0.7) * 0.008;
        this.slips.children.forEach((s, i) => { s.rotation = Math.sin(i * 9) * 0.7 + Math.sin(this.elapsed * 0.7 + i) * 0.025; });
      }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.app.stop(); else this.app.start(); });
    this.reduced.addEventListener('change', () => { if (this.reduced.matches) { this.jar.rotation = 0; this.jar.y = 215; } });
    this.particles.update(0);
  }
  private build() {
    const rect = (parent: Container, x: number, y: number, w: number, h: number, color: number, alpha = 1) => { const g = new Graphics().rect(x,y,w,h).fill({color,alpha}); parent.addChild(g); return g; };
    const shadow = new Graphics().ellipse(260,379,154,18).fill({color:0x090a19,alpha:0.55}); this.world.addChild(shadow);
    rect(this.world,37,354,446,12,0x70513c);rect(this.world,32,366,456,10,0x3d2d29);rect(this.world,48,376,424,12,0x302329);
    for(let i=0;i<12;i++)rect(this.world,48+i*36,358+(i%2)*4,22,2,0xb18080,0.3);
    // Books and a little candle.
    rect(this.world,64,336,80,15,0x6e669d);rect(this.world,69,338,70,8,0xc8b4aa);rect(this.world,61,349,88,6,0x9c7c99);
    rect(this.world,76,320,62,13,0xa57988);rect(this.world,82,322,52,7,0xd6c3ab);
    rect(this.world,394,315,26,39,0xd9b695);rect(this.world,398,312,18,6,0xf2d0a4);rect(this.world,405,304,3,10,0x584052);
    const flame=new Graphics().poly([407,285,413,301,409,307,402,301]).fill(0xf7d58b);this.world.addChild(flame);
    rect(this.world,405,295,4,9,0xffefc1);
    // Lavender stems.
    for(let i=0;i<5;i++) {const x=349+i*7;rect(this.world,x,313-i*4,2,38+i*4,0x768778);for(let j=0;j<3;j++)rect(this.world,x-3,309-i*4+j*6,7,4,0x9b8dbd);}
    rect(this.world,342,341,44,14,0x534859);
    this.world.addChild(this.magicGlow);
    for(let i=0;i<12;i++)this.magicGlow.addChild(new Graphics().ellipse(260,260,135-i*6,145-i*5).fill({color:0xf7d58b,alpha:0.012}));
    this.magicGlow.alpha=0.15;
    this.world.addChild(this.jar); this.jar.position.set(260,215);
    const back = new Graphics().poly([-67,-83,-67,-62,-85,-44,-90,-27,-90,111,-81,128,-65,135,65,135,81,128,90,111,90,-27,85,-44,67,-62,67,-83]).fill({color:0x8fbbcf,alpha:0.15}).stroke({color:0x8b9fb8,width:3,alpha:0.75});
    this.jar.addChild(back);
    for(let i=0;i<9;i++) { const g = new Graphics().ellipse(0,40,75-i*6,72-i*5).fill({color:0xc4a6dd,alpha:0.018}); this.jar.addChild(g); }
    this.jar.addChild(this.slips);
    const colors=[0xe5cea5,0xd9bd8b,0xf1dfb4,0xc8b7a0,0xe3c9a4];
    for(let i=0;i<29;i++){
      const slip=new Graphics().rect(-16,-9,32,18).fill(colors[i%5]).stroke({color:0x4c405c,width:2,alpha:0.4}).moveTo(-15,-7).lineTo(0,3).lineTo(15,-7).stroke({color:0xfff0d7,width:1,alpha:0.5});
      slip.position.set(((i*37)%125)-62,25+((i*23)%86));slip.rotation=Math.sin(i*9)*0.7;this.slips.addChild(slip);
    }
    const front = new Graphics().poly([-67,-74,-67,-62,-85,-42,-90,-25,-90,111,-81,128,-65,135,65,135,81,128,90,111,90,-25,85,-42,67,-62,67,-74]).fill({color:0xc4b9eb,alpha:0.055}).stroke({color:0xbad0df,width:3,alpha:0.7});
    this.jar.addChild(front);
    this.sheen.poly([0,-20,9,-20,25,100,16,100]).fill(0xfff0d7);this.sheen.alpha=0;this.jar.addChild(this.sheen);
    rect(this.jar,-79,-23,5,100,0xd7e8ed,0.5);rect(this.jar,-72,-37,5,33,0xebebef,0.6);rect(this.jar,76,-11,3,106,0xb2b8de,0.45);rect(this.jar,-63,124,116,3,0xd4c2e3,0.35);
    rect(this.jar,-68,-66,136,8,0xc4abc1,0.6);
    // Ribbon and a hand drawn pixel heart charm.
    rect(this.jar,-76,-48,152,5,0xc48c9e);rect(this.jar,33,-47,3,38,0xd4ac92);
    const heart=new Graphics().poly([34,-13,28,-20,22,-20,18,-16,18,-9,34,5,50,-9,50,-16,46,-20,40,-20]).fill(0xeab2bc).stroke({color:0x9d6f8c,width:2});this.jar.addChild(heart);
    this.jar.addChild(this.lid);this.lid.position.set(0,-87);
    rect(this.lid,-73,-10,146,16,0x80617b);rect(this.lid,-69,-16,138,8,0xc69b9a);rect(this.lid,-64,-19,128,4,0xe7c2ae);rect(this.lid,-73,4,146,6,0x5e4b67);
    for(let i=0;i<9;i++)rect(this.lid,-62+i*15,-6,3,9,0xd2a3a1,0.5);
    this.world.addChild(this.particles.view);
    this.world.addChild(this.flying);this.flying.visible=false;
    this.world.addChild(this.owl.view);
    this.wand.addChild(new Graphics().poly([-5,50,5,50,2,-48,-2,-48]).fill(0x826041).rect(-6,26,12,26).fill(0x392a2b).rect(-5,27,10,3).fill(0xc9a66b));
    const tip=new Graphics();for(let i=0;i<5;i++)tip.circle(0,-48,13-i*2).fill({color:0xffe6aa,alpha:0.08});
    this.wand.addChild(tip);this.wand.visible=false;
    this.spell.moveTo(395,160).bezierCurveTo(360,90,205,120,260,220).stroke({color:0xf7d58b,width:2,alpha:0.8});
    for(let i=0;i<10;i++)this.spell.rect(240+(i*17)%140,112+(i*13)%95,3,3).fill(0xffeac1);
    this.spell.visible=false;this.world.addChild(this.spell,this.wand);
  }
  makeFlying(color: string) {
    this.flying.removeChildren().forEach(c=>c.destroy());
    this.flying.addChild(new Graphics().rect(-23,-14,46,28).fill(color).stroke({color:0xfff0d7,width:2}).moveTo(-22,-12).lineTo(0,3).lineTo(22,-12).stroke({color:0x82718d,width:1}).circle(0,4,4).fill(0x923d46));
    this.flying.visible=true;this.flying.position.set(260,225);this.flying.scale.set(0.6);this.flying.alpha=1;this.flying.rotation=-0.2;
  }
}
