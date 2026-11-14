import { Container, Graphics } from 'pixi.js';

/** Layered original scenery: stone observatory, lake, castle and floating candlelight. */
export class StoryBackdrop {
  readonly view=new Container();
  private lights: Graphics[]=[];
  constructor() {
    const g=new Graphics();this.view.addChild(g);
    g.roundRect(26,5,468,531,95).fill(0x181c30);
    // Distant mountains and the mirror lake.
    g.poly([36,227,78,166,113,204,161,151,209,218,265,176,320,211,376,160,439,212,486,175,486,399,36,399]).fill(0x28283f);
    g.poly([36,270,106,233,175,256,244,225,326,252,410,226,486,260,486,416,36,416]).fill(0x202c3a);
    g.rect(38,282,446,140).fill(0x1c2935);
    for(let i=0;i<35;i++)g.rect(45+(i*47)%414,293+(i*19)%107,10+(i%5)*7,1).fill({color:i%3?0x758394:0xddc992,alpha:0.18});
    // The castle sits on a rocky island, with bridges and uneven roof lines.
    g.poly([99,280,133,249,203,255,260,229,332,250,399,262,424,284]).fill(0x3e3b49);
    g.rect(125,213,272,53).fill(0x38394b);
    const towers=[[124,158,26,104],[160,179,31,83],[199,124,32,138],[245,155,37,107],[295,102,33,160],[347,151,27,111],[383,183,23,79]];
    for(const [x,y,w,h] of towers){
      g.rect(x,y,w,h).fill(0x414256).rect(x+w-5,y,5,h).fill(0x303346);
      g.poly([x-5,y,x+w/2,y-31,x+w+5,y]).fill(0x626074);
      g.moveTo(x+w/2,y-31).lineTo(x+w/2,y-42).stroke({color:0xa89c79,width:1});
      g.poly([x+w/2,y-42,x+w/2+14,y-39,x+w/2,y-35]).fill(0x8c6265);
      for(let row=0;row<Math.floor(h/22);row++)for(let col=0;col<2;col++){
        g.roundRect(x+6+col*(w-14),y+10+row*21,4,8,2).fill({color:0xf1cf85,alpha:0.5+((row+col)%2)*0.3});
      }
      for(let row=0;row<Math.floor(h/12);row++)g.rect(x+3+(row%2)*7,y+row*12,w-10,1).fill({color:0xb5a58b,alpha:0.09});
    }
    // Lit great hall and a clock face.
    g.poly([222,211,260,177,298,211]).fill(0x5b5365).rect(227,211,66,47).fill(0x4a4151);
    for(let i=0;i<5;i++)g.roundRect(233+i*11,218,5,24,2).fill(0xdfb974);
    g.circle(311,130,10).fill(0xdac394).circle(311,130,8).fill(0x565061).moveTo(311,130).lineTo(311,124).moveTo(311,130).lineTo(316,132).stroke({color:0xeed7aa,width:1});
    // Moon, sparse constellations and a tiny shooting star.
    g.circle(405,64,26).fill(0xf0dfaf).circle(414,57,25).fill(0x181c30);
    for(let i=0;i<54;i++){const x=58+(i*79)%401,y=26+(i*37)%145;g.rect(x,y,i%7?1:2,i%7?1:2).fill({color:0xf5e0ad,alpha:0.25+(i%4)*0.15});}
    g.moveTo(94,55).lineTo(137,78).lineTo(172,51).stroke({color:0xb2a6d3,alpha:0.18,width:1});
    g.moveTo(285,47).lineTo(310,39).stroke({color:0xdcc9a2,alpha:0.4,width:1});
    // Stone surround, pointed arch, brass leading and etched diamond glass.
    const frame=new Graphics().moveTo(27,519).lineTo(27,130).quadraticCurveTo(27,40,260,6).quadraticCurveTo(493,40,493,130).lineTo(493,519).stroke({color:0x625666,width:19});
    this.view.addChild(frame);
    const trim=new Graphics().moveTo(42,519).lineTo(42,130).quadraticCurveTo(42,51,260,23).quadraticCurveTo(478,51,478,130).lineTo(478,519).stroke({color:0xb2976a,width:3});
    trim.moveTo(260,23).lineTo(260,300).moveTo(42,284).lineTo(478,284).stroke({color:0xa38a64,width:3,alpha:0.6});
    for(let i=0;i<6;i++)trim.moveTo(54+i*75,155).lineTo(89+i*75,190).lineTo(54+i*75,225).stroke({color:0xb2b9cd,width:1,alpha:0.12});
    for(let side=0;side<2;side++)for(let i=0;i<16;i++)trim.rect(side?486:20,141+i*24,15,2).fill({color:0xb09a85,alpha:0.22});
    this.view.addChild(trim);
    // Ivy, brass ornaments and floating candles near the sides of the window.
    for(let side=0;side<2;side++){
      const x=side?487:32;
      g.moveTo(x,85).bezierCurveTo(x-18,143,x+15,192,x-5,257).stroke({color:0x526751,width:2});
      for(let i=0;i<12;i++){const y=96+i*12,dx=i%2?-12:9;g.poly([x,y,x+dx,y-7,x+dx+4,y+7]).fill(i%3?0x53634f:0x6c7756);}
      g.circle(side?476:44,324,11).fill(0x88704d).circle(side?476:44,324,7).fill(0x383342);
    }
    for(const [x,y] of [[75,115],[438,170],[98,287],[423,354],[62,398]]){
      const glow=new Graphics();
      for(let i=0;i<5;i++)glow.circle(x,y,18-i*3).fill({color:0xf5c778,alpha:0.025});
      this.view.addChild(glow);this.lights.push(glow);
      g.rect(x-3,y+5,7,24).fill(0xd3bb92).rect(x-4,y+5,9,3).fill(0xeee0b9).poly([x,y-8,x+4,y+1,x,y+6,x-3,y+1]).fill(0xf7d58b);
    }
    g.rect(16,515,488,9).fill(0x6e5961).rect(12,524,496,12).fill(0x413645);
  }
  update(time: number){this.lights.forEach((light,i)=>light.alpha=0.65+Math.sin(time*1.3+i*2)*0.3);}
}
