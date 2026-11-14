export type Delivery = 'jar' | 'owl' | 'wand';
/** Delivery is independent from note rarity. A courier arrives at least every seventh draw. */
export class DeliveryManager {
  private sinceOwl = 0;
  constructor(private random = Math.random) {}
  next(): Delivery {
    const roll=this.random();
    if (this.sinceOwl>=6 || roll<0.18) {this.sinceOwl=0;return 'owl';}
    this.sinceOwl++;
    return roll<0.48 ? 'wand' : 'jar';
  }
}
