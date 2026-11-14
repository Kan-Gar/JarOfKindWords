/** Independent from note rarity: an owl can bring an ordinary letter too. */
export class DeliveryManager {
  private jarDeliveries = 0;
  constructor(private random = Math.random) {}
  next(): boolean {
    const owl = this.jarDeliveries >= 6 || this.random() < 0.18;
    this.jarDeliveries = owl ? 0 : this.jarDeliveries + 1;
    return owl;
  }
}
