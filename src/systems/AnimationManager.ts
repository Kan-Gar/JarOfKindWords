import type { Delivery } from './DeliveryManager';
import { gsap } from 'gsap';
import { SceneManager } from '../core/SceneManager';
import { AudioManager } from './AudioManager';
export class AnimationManager {
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  constructor(private scene: SceneManager, private audio: AudioManager) { document.addEventListener('visibilitychange',()=>gsap.globalTimeline.paused(document.hidden)); }
  async extract(color: string, quick: boolean, special = false, delivery: Delivery = 'jar') {
    const s = this.scene;
    s.setIdle(false); s.particles.burst(); this.audio.play('glass');
    if(this.reduced.matches) { await new Promise(r=>setTimeout(r,100)); s.setIdle(true); return; }
    if (delivery === 'wand') { await this.deliverByWand(color, quick); s.setIdle(true); this.audio.play('magic'); return; }
    if (delivery === 'owl') { await this.deliverByOwl(color, quick); s.setIdle(true); this.audio.play('magic'); return; }
    s.makeFlying(color);
    s.flying.visible=false;
    await new Promise<void>(resolve=> {
      const tl=gsap.timeline({onComplete:resolve});
      tl.timeScale(quick?1.8:1);
      tl.to(s.magicGlow,{alpha:special?1:0.4,duration:0.45},0).to(s.magicGlow,{alpha:0.15,duration:0.5},1.1);
      tl.to(s.slips,{x:4,duration:0.08,yoyo:true,repeat:5},0.1);
      tl.to(s.jar.scale,{y:0.95,x:1.04,duration:0.15}).to(s.jar.scale,{x:1,y:1,duration:0.25,ease:'back.out(3)'})
        .to(s.jar,{rotation:0.035,duration:0.08,yoyo:true,repeat:3},0.1)
        .to(s.lid,{y:-124,rotation:-0.16,x:-18,duration:0.35,ease:'power2.out'},0.45)
        .call(()=>{s.flying.visible=true;this.audio.play('paper');},[],0.65);
      // Quadratic Bezier path, evaluated on a scalar progress tween.
      const path={t:0};
      tl.to(path,{t:1,duration:0.8,ease:'power2.inOut',onUpdate:()=>{const t=path.t,u=1-t;s.flying.position.set(u*u*260+2*u*t*330+t*t*260,u*u*225+2*u*t*35+t*t*90);s.flying.rotation=-0.2+t*0.35;s.flying.scale.set(0.6+t*1.9);}},0.65)
        .to(s.lid,{y:-87,x:0,rotation:0,duration:0.35,ease:'power2.inOut'},1.2)
        .to(s.flying,{alpha:0,duration:0.22},1.4)
        .to(s.jar,{rotation:0,duration:0.15},1.4);
    });
    s.flying.visible=false;s.setIdle(true);this.audio.play('magic');
  }
  private async deliverByWand(color: string, quick: boolean) {
    const s=this.scene;
    s.makeFlying(color);s.flying.visible=false;
    s.wand.visible=true;s.wand.alpha=1;s.wand.position.set(440,270);s.wand.rotation=0.8;
    s.spell.visible=true;s.spell.alpha=0;
    await new Promise<void>(resolve=>{
      const tl=gsap.timeline({onComplete:resolve});tl.timeScale(quick?1.4:1);
      tl.to(s.wand,{x:370,y:200,rotation:-0.5,duration:0.5,ease:'power2.out'})
        .to(s.wand,{rotation:0.2,duration:0.3,ease:'power2.inOut'})
        .to(s.spell,{alpha:1,duration:0.25},0.5)
        .call(()=>{s.flying.visible=true;s.particles.burst();this.audio.play('magic');},[],0.8)
        .to(s.lid,{y:-120,rotation:-0.12,duration:0.3},0.7)
        .to(s.flying.position,{x:260,y:90,duration:0.65,ease:'power2.inOut'},0.8)
        .to(s.flying.scale,{x:2.4,y:2.4,duration:0.65},0.8)
        .to(s.flying,{rotation:0.15,duration:0.65},0.8)
        .to(s.spell,{alpha:0,duration:0.4},1)
        .to(s.lid,{y:-87,rotation:0,duration:0.3},1.25)
        .to(s.wand,{x:510,y:320,alpha:0,duration:0.4},1.25)
        .to(s.flying,{alpha:0,duration:0.2},1.5);
    });
    s.wand.visible=false;s.spell.visible=false;s.flying.visible=false;
  }
  private async deliverByOwl(color: string, quick: boolean) {
    const s = this.scene, owl = s.owl;
    owl.reset();s.makeFlying(color);s.flying.visible=false;
    await new Promise<void>(resolve=>{
      const tl=gsap.timeline({onComplete:resolve});
      tl.timeScale(quick ? 1.35 : 1);
      tl.to(owl.view,{x:260,y:70,duration:0.95,ease:'power2.out',onUpdate:()=>{
        owl.leftWing.rotation=Math.sin(tl.time()*19)*0.55;
        owl.rightWing.rotation=-owl.leftWing.rotation;
      }}).to(owl.view,{y:78,duration:0.22,yoyo:true,repeat:1})
        .call(()=>{owl.letter.visible=false;s.flying.visible=true;s.flying.position.set(260,125);s.flying.scale.set(0.9);this.audio.play('paper');})
        .to(s.flying.position,{y:145,duration:0.45,ease:'power2.out'},1.39)
        .to(s.flying.scale,{x:2.4,y:2.4,duration:0.45},1.39)
        .to(owl.view,{x:610,y:-30,duration:0.75,ease:'power2.in',onUpdate:()=>{
          owl.leftWing.rotation=Math.sin(tl.time()*19)*0.55;owl.rightWing.rotation=-owl.leftWing.rotation;
        }},1.44)
        .to(s.flying,{alpha:0,duration:0.2},1.85);
    });
    owl.view.visible=false;s.flying.visible=false;s.particles.burst();
  }
  reveal(element: HTMLElement) {
    gsap.fromTo(element,{opacity:0,y:this.reduced.matches?0:24,rotateX:this.reduced.matches?0:-35,scale:this.reduced.matches?1:0.85},{opacity:1,y:0,rotateX:0,scale:1,duration:this.reduced.matches?0.15:0.55,ease:'back.out(1.2)',clearProps:'transform'});
  }
  async close(element: HTMLElement) {
    await gsap.to(element,{opacity:0,y:this.reduced.matches?0:12,scale:this.reduced.matches?1:0.96,duration:0.18});
    gsap.set(element,{clearProps:'all'});
  }
}
