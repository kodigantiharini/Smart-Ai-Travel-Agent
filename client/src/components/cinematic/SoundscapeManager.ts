// Procedural Web Audio API soundscape generator for luxury ambient atmosphere
class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isPlaying) return;

      this.isPlaying = true;
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.linearRampToValueAtTime(0.12, now + 1.8);

      // Deep celestial drone (D2, A2, D3)
      const frequencies = [73.42, 110.0, 146.83, 220.0, 293.66];
      this.oscillators = frequencies.map((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const panner = this.ctx!.createStereoPanner ? this.ctx!.createStereoPanner() : null;

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + i * 80, now);

        if (panner) {
          panner.pan.setValueAtTime((i - 2) * 0.35, now);
          osc.connect(filter);
          filter.connect(panner);
          panner.connect(this.masterGain!);
        } else {
          osc.connect(filter);
          filter.connect(this.masterGain!);
        }

        osc.start(now);
        return osc;
      });

      // Periodic ethereal high shimmer chime
      this.playShimmerChimes();
    } catch (e) {
      console.warn('AudioContext not allowed or supported:', e);
    }
  }

  private playShimmerChimes() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const chimeFreqs = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    chimeFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.25);

      gain.gain.setValueAtTime(0.001, now + idx * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.04, now + idx * 0.25 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.25 + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.25);
      osc.stop(now + idx * 0.25 + 1.8);
    });
  }

  public stop() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        this.oscillators = [];
        this.isPlaying = false;
      }, 850);
    } catch {}
  }
}

export const soundscape = new SoundscapeEngine();
