export class AudioManager {
  private context?: AudioContext;
  enabled = false;
  async unlock() {
    try { this.context ??= new AudioContext(); await this.context.resume(); } catch { /* Audio is optional. */ }
  }
  play(kind: 'glass' | 'paper' | 'magic' | 'favorite') {
    if (!this.enabled || !this.context || this.context.state !== 'running') return;
    try {
      const ctx = this.context;
      if (kind === 'paper') {
        const length = Math.floor(ctx.sampleRate * 0.24), buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * Math.sin(i / length * Math.PI);
        const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
        source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = 1800; gain.gain.value = 0.035;
        source.connect(filter); filter.connect(gain); gain.connect(ctx.destination); source.start(); return;
      }
      const frequencies = { glass: [880, 1320], paper: [260, 390], magic: [523.25, 659.25, 783.99], favorite: [659.25, 987.77] }[kind];
      frequencies.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        const t = ctx.currentTime + i * 0.045;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.5);
      });
    } catch { /* Continue silently if the device loses its audio context. */ }
  }
}
