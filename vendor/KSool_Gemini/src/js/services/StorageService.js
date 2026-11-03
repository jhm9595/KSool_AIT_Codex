window.KSool = window.KSool || {};

class AudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('ksool_sound_muted') === 'true';
    const savedVol = localStorage.getItem('ksool_sound_volume');
    this.volume = savedVol !== null ? Math.max(0, Math.min(1, parseFloat(savedVol))) : 0.7;
  }

  _getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  getVolume() {
    return this.volume;
  }

  getVolumePercent() {
    return Math.round(this.volume * 100);
  }

  isMutedState() {
    return this.isMuted || this.volume <= 0;
  }

  getEffectiveVolume() {
    if (this.isMutedState()) return 0;
    // 인체 청각 인지(Logarithmic) 특성에 맞춘 볼륨 보정 커브
    return Math.pow(this.volume, 1.5);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, Number(vol)));
    if (this.volume === 0) {
      this.isMuted = true;
    } else if (this.isMuted && this.volume > 0) {
      this.isMuted = false;
    }
    try {
      localStorage.setItem('ksool_sound_volume', String(this.volume));
      localStorage.setItem('ksool_sound_muted', String(this.isMuted));
    } catch (_) {}
    return this.volume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && this.volume === 0) {
      this.volume = 0.5;
      try {
        localStorage.setItem('ksool_sound_volume', '0.5');
      } catch (_) {}
    }
    try {
      localStorage.setItem('ksool_sound_muted', String(this.isMuted));
    } catch (_) {}
    return this.isMuted;
  }

  vibrate(pattern = 15) {
    if (navigator && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(pattern); } catch (_) {}
    }
  }

  /**
   * 은박지(복권) 긁는 소리: 짧은 고주파 노이즈 + 불규칙한 바스락 스파이크
   */
  playScratch(intensity = 1) {
    const effVol = this.getEffectiveVolume();
    if (effVol <= 0) return;
    const ctx = this._getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.07 + Math.random() * 0.06;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin(Math.PI * i / len);
      const crackle = Math.random() < 0.14 ? 1 : 0.32;
      data[i] = (Math.random() * 2 - 1) * env * crackle;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2600 + Math.random() * 1400;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 5200 + Math.random() * 2800;
    bp.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.26 * effVol * intensity;
    src.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  }

  playTap() {
    const effVol = this.getEffectiveVolume();
    if (effVol <= 0) return;
    this.vibrate(10);
    const ctx = this._getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.06);
    gain.gain.setValueAtTime(0.12 * effVol, now);
    gain.gain.linearRampToValueAtTime(0.01 * effVol, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playSuccess() {
    const effVol = this.getEffectiveVolume();
    if (effVol <= 0) return;
    this.vibrate([30, 50, 60]);
    const ctx = this._getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.18 * effVol, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }

  playFail() {
    const effVol = this.getEffectiveVolume();
    if (effVol <= 0) return;
    this.vibrate([40, 40, 40]);
    const ctx = this._getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.15 * effVol, now);
    gain.gain.linearRampToValueAtTime(0.01 * effVol, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

class StorageService {
  constructor() {
    this.KEY = 'ksool_alchemy_v2_state';
  }

  loadState() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  saveState(stateObj) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(stateObj));
    } catch (e) {}
  }

  clearState() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {}
  }
}

window.KSool.AudioService = AudioService;
window.KSool.StorageService = StorageService;
