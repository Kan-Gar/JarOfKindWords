import { Container, Graphics } from 'pixi.js';

/** Original snowy owl illustration, assembled once and reused for every delivery. */
export class OwlCourier {
  readonly view = new Container();
  readonly leftWing = new Graphics();
  readonly rightWing = new Graphics();
  readonly letter = new Graphics();
  constructor() {
    this.leftWing.poly([0,0,-18,-13,-58,-25,-48,-5,-37,9,-23,18,0,12]).fill(0xd9d9d1).stroke({color:0x8f91a5,width:2});
    this.rightWing.poly([0,0,18,-13,58,-25,48,-5,37,9,23,18,0,12]).fill(0xeeeae0).stroke({color:0x8f91a5,width:2});
    this.leftWing.position.set(-12,7);this.rightWing.position.set(12,7);
    this.view.addChild(this.leftWing,this.rightWing);
    const body = new Graphics()
      .poly([-17,7,-22,28,-13,44,0,51,13,44,22,28,17,7]).fill(0xe6e4da)
      .poly([-10,41,-16,57,0,51,16,57,10,41]).fill(0xb6b9c4)
      .poly([-24,-22,-16,-29,0,-26,16,-29,24,-22,25,0,17,17,-17,17,-25,0]).fill(0xf5f0e4)
      .ellipse(-11,-6,11,13).fill(0xd4d2cd).ellipse(11,-6,11,13).fill(0xd4d2cd)
      .circle(-10,-7,6).fill(0xf7d58b).circle(10,-7,6).fill(0xf7d58b)
      .circle(-9,-7,3).fill(0x262435).circle(9,-7,3).fill(0x262435)
      .rect(-11,-10,2,2).fill(0xffffff).rect(9,-10,2,2).fill(0xffffff)
      .poly([-4,1,4,1,0,9]).fill(0x8b7761);
    for(let i=0;i<8;i++)body.rect(-11+(i%3)*9,21+Math.floor(i/3)*8,3,2).fill(0x999eae);
    this.view.addChild(body);
    this.letter.rect(-21,48,42,27).fill(0xf0d9a5).stroke({color:0x9b794a,width:2}).moveTo(-20,49).lineTo(0,64).lineTo(20,49).stroke({color:0x9b794a,width:1}).circle(0,63,4).fill(0x923d46);
    this.view.addChild(this.letter);
    this.view.visible=false;
  }
  reset() {this.view.visible=true;this.view.alpha=1;this.view.position.set(-90,100);this.view.scale.set(0.8);this.letter.visible=true;this.leftWing.rotation=0;this.rightWing.rotation=0;}
}
