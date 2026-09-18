export class SoundEngine {
  private ctx: AudioContext | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private motorFilter: BiquadFilterNode | null = null;
  
  private trackGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;

  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // 1. Electric Traction Motor Sound
    try {
      this.motorOsc = this.ctx.createOscillator();
      this.motorOsc.type = 'sawtooth';
      this.motorOsc.frequency.setValueAtTime(40, this.ctx.currentTime);

      this.motorFilter = this.ctx.createBiquadFilter();
      this.motorFilter.type = 'lowpass';
      this.motorFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.motorGain = this.ctx.createGain();
      this.motorGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      this.motorOsc.connect(this.motorFilter);
      this.motorFilter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start();
    } catch (e) {
      console.warn('Motor audio init warning', e);
    }

    // 2. Track Clatter / Rail Texture (White noise bandpassed)
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.12;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const trackFilter = this.ctx.createBiquadFilter();
      trackFilter.type = 'bandpass';
      trackFilter.frequency.setValueAtTime(360, this.ctx.currentTime);
      trackFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.trackGain = this.ctx.createGain();
      this.trackGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      noiseSource.connect(trackFilter);
      trackFilter.connect(this.trackGain);
      this.trackGain.connect(this.ctx.destination);
      noiseSource.start();
    } catch (e) {
      console.warn('Track audio init warning', e);
    }

    // 3. Ambient High Wind Sound
    try {
      const windBufferSize = this.ctx.sampleRate * 3;
      const windBuffer = this.ctx.createBuffer(1, windBufferSize, this.ctx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      for (let i = 0; i < windBufferSize; i++) {
        windData[i] = (Math.random() * 2 - 1) * 0.08;
      }

      const windSource = this.ctx.createBufferSource();
      windSource.buffer = windBuffer;
      windSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'lowpass';
      this.windFilter.frequency.setValueAtTime(240, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.005, this.ctx.currentTime);

      windSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);
      windSource.start();
    } catch (e) {
      console.warn('Wind audio init warning', e);
    }
  }

  public update(speed: number, altitude: number, crosswind: number, audioEnabled: boolean) {
    if (!this.ctx || !audioEnabled) {
      if (this.motorGain && this.ctx) this.motorGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      if (this.trackGain && this.ctx) this.trackGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      if (this.windGain && this.ctx) this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      return;
    }

    const t = this.ctx.currentTime;
    const normSpeed = Math.min(Math.max(speed / 60, 0), 1.2);

    // Motor Pitch & Volume
    if (this.motorOsc && this.motorGain && this.motorFilter) {
      this.motorOsc.frequency.setTargetAtTime(32 + normSpeed * 110, t, 0.1);
      this.motorFilter.frequency.setTargetAtTime(140 + normSpeed * 280, t, 0.1);
      this.motorGain.gain.setTargetAtTime(normSpeed > 0.02 ? normSpeed * 0.09 : 0.0001, t, 0.1);
    }

    // Track Rattle
    if (this.trackGain) {
      this.trackGain.gain.setTargetAtTime(normSpeed > 0.05 ? normSpeed * 0.06 : 0.0001, t, 0.1);
    }

    // Wind Dynamics on Bridges
    if (this.windGain && this.windFilter) {
      const windIntensity = Math.min(0.04, 0.008 + (altitude / 1000) * 0.025 + Math.abs(crosswind) * 0.02);
      this.windGain.gain.setTargetAtTime(windIntensity, t, 0.2);
      this.windFilter.frequency.setTargetAtTime(180 + Math.abs(crosswind) * 350, t, 0.2);
    }
  }

  public playBell(audioEnabled: boolean) {
    if (!this.ctx || !audioEnabled) return;
    const now = this.ctx.currentTime;

    // Dual-tone classic tram bell
    const freqs = [880, 1046.5]; // A5 & C6
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      const offset = i * 0.14;
      osc.frequency.setValueAtTime(freq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + offset + 0.06);

      gain.gain.setValueAtTime(0.24, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 1.15);
    });
  }

  public playWhistle(audioEnabled: boolean) {
    if (!this.ctx || !audioEnabled) return;
    const now = this.ctx.currentTime;

    // Steam dual-harmonic chord whistle (F5 & A5)
    [698.46, 880, 1396.9].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 0.4);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(idx === 2 ? 0.08 : 0.18, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  public playArrivalChime(audioEnabled: boolean) {
    if (!this.ctx || !audioEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = this.ctx!.currentTime + idx * 0.16;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 1.25);
    });
  }

  public playCoinSound(audioEnabled: boolean) {
    if (!this.ctx || !audioEnabled) return;
    const now = this.ctx.currentTime;
    [987.77, 1318.5, 1760].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  public playUpgradeDing(audioEnabled: boolean) {
    if (!this.ctx || !audioEnabled) return;
    const now = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880]; // A major
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 1.45);
    });
  }

  public startLoFiMusic(audioEnabled: boolean) {
    if (this.isMusicPlaying || !this.ctx) return;
    this.isMusicPlaying = true;

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];

    let chordIdx = 0;
    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !audioEnabled) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((note, noteIdx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const t = this.ctx.currentTime + noteIdx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, t);

        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 2.85);
      });
    }, 3800);
  }

  public stopLoFiMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
