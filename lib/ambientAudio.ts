// Web Audio Ambient Soundscapes Synthesizer
// Provides procedural audio for Rain, Fireplace, Warm Vinyl, Night Crickets, and Coffeehouse

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private cleanupFns: (() => void)[] = [];
  private masterGain: GainNode | null = null;

  public isPlaying(type?: string): boolean {
    if (!this.ctx || this.ctx.state === 'closed') return false;
    if (type) return this.currentType === type;
    return Boolean(this.currentType && this.currentType !== 'none');
  }

  public getCurrentType(): string | null {
    return this.currentType;
  }

  public start(type: string, volume = 0.22) {
    this.stop();
    if (!type || type === 'none') return;

    try {
      const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      this.ctx = ctx;
      this.currentType = type;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.35);
      masterGain.connect(ctx.destination);
      this.masterGain = masterGain;

      if (type === 'rain') {
        // Continuous steady rainfall using pink noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.075;
          b6 = white * 0.115926;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start(0);

        // Water droplet bursts
        const dropInterval = setInterval(() => {
          if (!this.ctx || this.ctx.state === 'closed') {
            clearInterval(dropInterval);
            return;
          }
          try {
            const osc = ctx.createOscillator();
            const dropGain = ctx.createGain();
            osc.type = 'sine';
            const freq = 1100 + Math.random() * 900;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.45, ctx.currentTime + 0.07);
            dropGain.gain.setValueAtTime(0.025 + Math.random() * 0.03, ctx.currentTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
            osc.connect(dropGain);
            dropGain.connect(masterGain);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
          } catch {}
        }, 160);

        this.cleanupFns.push(() => {
          clearInterval(dropInterval);
          try { noiseSource.stop(); } catch {}
        });

      } else if (type === 'fireplace') {
        // Low warm ambient roar
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.1;
          output[i] = (b0 + b1) * 0.065;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start(0);

        // Crackling wood embers
        const crackleInterval = setInterval(() => {
          if (!this.ctx || this.ctx.state === 'closed') {
            clearInterval(crackleInterval);
            return;
          }
          if (Math.random() > 0.3) {
            try {
              const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
              const data = buffer.getChannelData(0);
              for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
              }
              const pop = ctx.createBufferSource();
              pop.buffer = buffer;
              const popFilter = ctx.createBiquadFilter();
              popFilter.type = 'bandpass';
              popFilter.frequency.setValueAtTime(1400 + Math.random() * 2200, ctx.currentTime);
              popFilter.Q.setValueAtTime(2.5, ctx.currentTime);

              const popGain = ctx.createGain();
              popGain.gain.setValueAtTime(0.08 + Math.random() * 0.14, ctx.currentTime);

              pop.connect(popFilter);
              popFilter.connect(popGain);
              popGain.connect(masterGain);
              pop.start(ctx.currentTime);
            } catch {}
          }
        }, 110);

        this.cleanupFns.push(() => {
          clearInterval(crackleInterval);
          try { noiseSource.stop(); } catch {}
        });

      } else if (type === 'vinyl') {
        // Surface dust noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.038;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, ctx.currentTime);
        filter.Q.setValueAtTime(0.9, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start(0);

        // 60Hz warm ground hum
        const hum = ctx.createOscillator();
        const humGain = ctx.createGain();
        hum.type = 'sine';
        hum.frequency.setValueAtTime(60, ctx.currentTime);
        humGain.gain.setValueAtTime(0.035, ctx.currentTime);
        hum.connect(humGain);
        humGain.connect(masterGain);
        hum.start(0);

        // Vinyl needle pops
        const popInterval = setInterval(() => {
          if (!this.ctx || this.ctx.state === 'closed') {
            clearInterval(popInterval);
            return;
          }
          if (Math.random() > 0.45) {
            try {
              const osc = ctx.createOscillator();
              const pGain = ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(2400 + Math.random() * 1600, ctx.currentTime);
              pGain.gain.setValueAtTime(0.04 + Math.random() * 0.05, ctx.currentTime);
              pGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
              osc.connect(pGain);
              pGain.connect(masterGain);
              osc.start(ctx.currentTime);
              osc.stop(ctx.currentTime + 0.025);
            } catch {}
          }
        }, 280);

        this.cleanupFns.push(() => {
          clearInterval(popInterval);
          try { noiseSource.stop(); hum.stop(); } catch {}
        });

      } else if (type === 'crickets') {
        // Soothing night crickets rhythm
        const chirpInterval = setInterval(() => {
          if (!this.ctx || this.ctx.state === 'closed') {
            clearInterval(chirpInterval);
            return;
          }
          try {
            const numPulses = 3 + Math.floor(Math.random() * 2);
            for (let p = 0; p < numPulses; p++) {
              const startTime = ctx.currentTime + p * 0.032;
              const osc = ctx.createOscillator();
              const cGain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(4700 + Math.random() * 250, startTime);
              cGain.gain.setValueAtTime(0.05, startTime);
              cGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.022);
              osc.connect(cGain);
              cGain.connect(masterGain);
              osc.start(startTime);
              osc.stop(startTime + 0.025);
            }
          } catch {}
        }, 600);

        this.cleanupFns.push(() => {
          clearInterval(chirpInterval);
        });

      } else if (type === 'coffeehouse') {
        // Warm cafe murmur
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.98 * b0 + white * 0.05;
          b1 = 0.92 * b1 + white * 0.08;
          output[i] = (b0 + b1) * 0.055;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start(0);

        // Distant coffee cup clink
        const cupInterval = setInterval(() => {
          if (!this.ctx || this.ctx.state === 'closed') {
            clearInterval(cupInterval);
            return;
          }
          if (Math.random() > 0.55) {
            try {
              const osc = ctx.createOscillator();
              const cGain = ctx.createGain();
              osc.type = 'sine';
              const freq = 2100 + Math.random() * 700;
              osc.frequency.setValueAtTime(freq, ctx.currentTime);
              cGain.gain.setValueAtTime(0.025 + Math.random() * 0.025, ctx.currentTime);
              cGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
              osc.connect(cGain);
              cGain.connect(masterGain);
              osc.start(ctx.currentTime);
              osc.stop(ctx.currentTime + 0.23);
            } catch {}
          }
        }, 1600);

        this.cleanupFns.push(() => {
          clearInterval(cupInterval);
          try { noiseSource.stop(); } catch {}
        });
      }

    } catch (e) {
      console.error('Ambient soundscape start error', e);
    }
  }

  public stop() {
    this.cleanupFns.forEach(fn => {
      try { fn(); } catch {}
    });
    this.cleanupFns = [];

    if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
      try {
        this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      } catch {}
    }

    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
    this.currentType = null;
  }
}

export const ambientEngine = new AmbientAudioEngine();
