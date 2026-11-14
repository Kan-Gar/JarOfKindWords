import { Container, Graphics } from 'pixi.js';
export class ParticleSystem {
  readonly view = new Container();
  private dots: { shape: Graphics; x: number; y: number; phase: number; burst: number }[] = [];
  private time = 0;
  private slowFrames = 0;
  constructor(count = 32) {
    for (let i = 0; i < count; i++) {
      const shape = new Graphics().rect(-1, -1, i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2).fill(i % 4 === 0 ? 0xc1b4ff : 0xf7d58b);
      this.view.addChild(shape);
      this.dots.push({ shape, x: 50 + Math.random() * 420, y: 20 + Math.random() * 350, phase: Math.random() * 10, burst: 0 });
    }
  }
  burst() { this.dots.forEach(p => { p.burst = 1; }); }
  update(dt: number) {
    this.time += Math.min(dt, 0.05);
    if (dt > 0.025) this.slowFrames++;
    const quality = this.slowFrames > 100 ? 0.5 : 1;
    this.dots.forEach((p, i) => {
      p.shape.visible = i < this.dots.length * quality;
      p.burst = Math.max(0, p.burst - dt * 0.8);
      p.shape.position.set(p.x + Math.sin(this.time * 0.5 + p.phase) * (8 + p.burst * 30), p.y + Math.cos(this.time * 0.4 + p.phase) * 9 - p.burst * 35);
      p.shape.alpha = 0.15 + (Math.sin(this.time + p.phase) + 1) * 0.25 + p.burst * 0.2;
    });
  }
}
