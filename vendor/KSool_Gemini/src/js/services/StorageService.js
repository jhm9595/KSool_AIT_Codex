window.KSool = window.KSool || {};

class AudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('ksool_sound_muted') === 'true';
    const savedVol = localStorage.getItem('ksool_sound_volume');
    this.volume = savedVol !== null ? Math.max(0, Math.min(1, parseFloat(savedVol))) : 0.7;

    // 🏮 타이쿤 BGM 멀티트랙 시퀀서 (K-POP 비트 & 국악 퓨전 등 다양한 스타일 지원)
    this.tycoonBgmTrack = localStorage.getItem('ksool_tycoon_bgm_track') || 'kpop_dance';
    this.isBgmEnabled = true;
    this._bgmActive = false;
    this._bgmTimer = null;
    this._bgmStep = 0;
    this._bgmNextNoteTime = 0;
    this._bgmMasterGain = null;
    this._bgmWave = 1;
  }

  getAvailableBgmTracks() {
    return [
      { id: 'kpop_dance', name: '⚡ K-POP 댄스 비트', badge: '대표곡', desc: '신나고 중독적인 최신 K-POP 아이돌 댄스 팝 & 펀치 비트' },
      { id: 'kpop_synth', name: '🌆 K-POP 시티팝 & 신스', badge: '감성', desc: '서울 야경 감성의 세련된 신스웨이브 & 그루브 베이스' },
      { id: 'k_fusion', name: '🥁 조선 퓨전 K-비트', badge: '대취타', desc: '웅장한 808 트랩 비트와 한국 전통 관악 태평소의 만남' },
      { id: 'korean_tavern', name: '🏮 한국 전통 주막 풍류', badge: '국악', desc: '구수한 대금 요성과 장구 굿거리 장단의 전통 풍류' },
      { id: 'retro_8bit', name: '👾 레트로 8비트 칩튠', badge: '아케이드', desc: '톡톡 튀는 고전 오락실 아케이드 칩튠 사운드' },
      { id: 'off', name: '🔇 BGM 끄기', badge: '', desc: '배경음악 없이 게임 효과음만 출력' }
    ];
  }

  getTycoonBgmTrack() {
    return this.tycoonBgmTrack || 'kpop_dance';
  }

  setTycoonBgmTrack(trackId) {
    const valid = ['kpop_dance', 'kpop_synth', 'k_fusion', 'korean_tavern', 'retro_8bit', 'off'];
    this.tycoonBgmTrack = valid.includes(trackId) ? trackId : 'kpop_dance';
    try {
      localStorage.setItem('ksool_tycoon_bgm_track', this.tycoonBgmTrack);
    } catch (_) {}
    this._bgmStep = 0;
    if (this.ctx) {
      this._bgmNextNoteTime = this.ctx.currentTime + 0.05;
    }
    this._syncBgmMasterVolume();
    return this.tycoonBgmTrack;
  }

  previewBgmTrack(trackId) {
    const effVol = this.getEffectiveVolume();
    if (effVol <= 0 || trackId === 'off') return;
    const ctx = this._getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    try {
      if (trackId === 'kpop_dance') {
        this._playKick(now, 0.38);
        this._playHiHat(now + 0.12, 0.14, true);
        this._playSnare(now + 0.24, 0.28);
        this._playSynthLead(this._midiToFreq(81), now, 0.2, 0.28);
        this._playSynthLead(this._midiToFreq(84), now + 0.15, 0.25, 0.28);
      } else if (trackId === 'kpop_synth') {
        this._playKick(now, 0.32);
        this._playSynthPadChord([50, 53, 57, 60].map(m => this._midiToFreq(m)), now, 0.6, 0.22);
        this._playSynthLead(this._midiToFreq(74), now + 0.16, 0.3, 0.22, 'triangle');
      } else if (trackId === 'k_fusion') {
        this._playKick(now, 0.45);
        this._playSnare(now + 0.24, 0.32);
        this._playFusionLead(this._midiToFreq(74), now, 0.22, 0.30);
        this._playFusionLead(this._midiToFreq(79), now + 0.16, 0.32, 0.30, true);
      } else if (trackId === 'korean_tavern') {
        this._playJangguBuk(now, 0.32);
        this._playJangguChae(now, 0.16);
        this._playDaegeumNote(this._midiToFreq(69), now, 0.5, true);
      } else if (trackId === 'retro_8bit') {
        this._playChiptune(this._midiToFreq(72), now, 0.08, 0.22);
        this._playChiptune(this._midiToFreq(76), now + 0.08, 0.08, 0.22);
        this._playChiptune(this._midiToFreq(79), now + 0.16, 0.08, 0.22);
        this._playChiptune(this._midiToFreq(84), now + 0.24, 0.16, 0.22);
      }
    } catch (_) {}
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
    this._syncBgmMasterVolume();
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
    this._syncBgmMasterVolume();
    return this.isMuted;
  }

  setTycoonBgmWave(wave = 1) {
    this._bgmWave = Math.max(1, Number(wave) || 1);
  }

  _syncBgmMasterVolume() {
    if (this._bgmMasterGain && this.ctx) {
      const eff = this.getEffectiveVolume();
      const target = (this._bgmActive && eff > 0) ? eff * 0.45 : 0.0001;
      try {
        this._bgmMasterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06);
      } catch (_) {
        this._bgmMasterGain.gain.value = target;
      }
    }
  }

  /**
   * 🏮 한국 전통 주막 풍류 BGM (12/8 굿거리·세마치 삼분박 장단 + 대금 농현 + 거문고 저음 + 장구 '덩 기덕 쿵 더러러러')
   * - 중국풍 16분음표 고쟁 소리를 완전히 배제하고,
   *   한국 민요/풍류 특유의 3분박(점4분음표 호흡) 장단과 대금(Daegeum)의 따뜻한 숨결·요성(농현),
   *   장구 북편(쿵)과 채편(기덕/더러러) 울림으로 정겨운 한국 주막 분위기를 연출합니다.
   */
  startTycoonBgm(wave = 1) {
    this._bgmWave = Math.max(1, Number(wave) || 1);
    const ctx = this._getContext();
    if (!ctx) return;

    if (this._bgmActive) {
      this._syncBgmMasterVolume();
      return;
    }

    this._bgmActive = true;
    this._bgmStep = 0;
    this._bgmNextNoteTime = ctx.currentTime + 0.05;

    if (!this._bgmMasterGain) {
      this._bgmMasterGain = ctx.createGain();
      // 대금과 거문고의 자연스러운 한옥 마루 공간감 딜레이
      const delay = ctx.createDelay(0.6);
      delay.delayTime.value = 0.28;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.18;
      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.16;
      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.value = 1400;

      this._bgmMasterGain.connect(ctx.destination);
      this._bgmMasterGain.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(wetGain);
      wetGain.connect(ctx.destination);
      delayFilter.connect(feedback);
      feedback.connect(delay);
    }

    this._syncBgmMasterVolume();

    if (this._bgmTimer) clearInterval(this._bgmTimer);
    this._bgmTimer = setInterval(() => {
      if (!this._bgmActive || !this.ctx) return;
      while (this._bgmNextNoteTime < this.ctx.currentTime + 0.18) {
        if (this.tycoonBgmTrack !== 'off') {
          this._scheduleStepByTrack(this.tycoonBgmTrack, this._bgmStep, this._bgmNextNoteTime);
        }
        this._advanceStepByTrack(this.tycoonBgmTrack);
      }
    }, 40);
  }

  stopTycoonBgm() {
    this._bgmActive = false;
    if (this._bgmTimer) {
      clearInterval(this._bgmTimer);
      this._bgmTimer = null;
    }
    if (this._bgmMasterGain && this.ctx) {
      try {
        this._bgmMasterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      } catch (_) {}
    }
  }

  _advanceStepByTrack(track) {
    if (track === 'korean_tavern') {
      this._advanceKoreanTavernStep();
      return;
    }

    let bpm = 124;
    if (track === 'kpop_dance') {
      bpm = Math.min(142, 124 + (this._bgmWave - 1) * 2);
    } else if (track === 'kpop_synth') {
      bpm = Math.min(124, 108 + (this._bgmWave - 1) * 1.5);
    } else if (track === 'k_fusion') {
      bpm = Math.min(110, 96 + (this._bgmWave - 1) * 1.5);
    } else if (track === 'retro_8bit') {
      bpm = Math.min(150, 134 + (this._bgmWave - 1) * 2);
    } else {
      bpm = 120;
    }

    const stepSec = (60 / bpm) / 4;
    this._bgmNextNoteTime += stepSec;
    this._bgmStep = (this._bgmStep + 1) % 64;
  }

  _scheduleStepByTrack(track, step, t) {
    if (this.isMutedState() || !this._bgmMasterGain) return;
    if (track === 'korean_tavern') {
      this._scheduleKoreanTavernStep(step, t);
    } else if (track === 'kpop_dance') {
      this._scheduleKpopDanceStep(step, t);
    } else if (track === 'kpop_synth') {
      this._scheduleKpopSynthStep(step, t);
    } else if (track === 'k_fusion') {
      this._scheduleKFusionStep(step, t);
    } else if (track === 'retro_8bit') {
      this._scheduleRetro8BitStep(step, t);
    }
  }

  /**
   * ⚡ 1. K-POP 댄스 비트 (아이돌 댄스 팝: 4-on-the-floor + 펀치 킥 + 16비트 햇 + 펑키 베이스 + IV-V-iii-vi 훅)
   */
  _scheduleKpopDanceStep(step, t) {
    const bar = Math.floor(step / 16); // 0: F, 1: G, 2: Em, 3: Am
    const stepInBar = step % 16;

    // 1) 4-on-the-floor 킥 (0, 4, 8, 12 + 14박 싱코페이션)
    if (stepInBar === 0 || stepInBar === 4 || stepInBar === 8 || stepInBar === 12) {
      this._playKick(t, 0.34);
    } else if ((bar === 1 || bar === 3) && stepInBar === 14) {
      this._playKick(t, 0.28);
    }

    // 2) 백비트 스네어/클랩 (4, 12박)
    if (stepInBar === 4 || stepInBar === 12) {
      this._playSnare(t, 0.22);
    }

    // 3) 16비트 하이햇 (업비트 2, 6, 10, 14에 오픈 하이햇 "칫!")
    const isUpbeat = (stepInBar === 2 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14);
    if (isUpbeat) {
      this._playHiHat(t, 0.12, true);
    } else {
      this._playHiHat(t, 0.07, false);
    }

    // 4) 펑키 옥타브 베이스 (F - G - Em - Am)
    const baseMidiByBar = [53, 55, 52, 57];
    const root = baseMidiByBar[bar];
    const bassSteps = [0, 3, 6, 8, 10, 12, 14];
    if (bassSteps.includes(stepInBar)) {
      const isOctaveDown = (stepInBar === 3 || stepInBar === 10);
      const noteFreq = this._midiToFreq(isOctaveDown ? root - 12 : root);
      this._playSynthBass(noteFreq, t, 0.14, 0.26, true);
    }

    // 5) K-POP 멜로디 훅
    const kpopHooks = {
      0: 81, 3: 84, 6: 81, 8: 79, 10: 77, 12: 79, 14: 81,
      16: 83, 19: 86, 22: 83, 24: 81, 26: 79, 28: 81, 30: 83,
      32: 79, 35: 83, 38: 79, 40: 78, 42: 76, 44: 79, 46: 83,
      48: 84, 51: 83, 54: 81, 56: 76, 58: 81, 60: 84, 62: 83
    };
    if (kpopHooks[step] !== undefined) {
      this._playSynthLead(this._midiToFreq(kpopHooks[step]), t, 0.20, 0.20, 'sawtooth');
    }
  }

  /**
   * 🌆 2. K-POP 시티팝 & 신스웨이브 (서울 야경 감성: Dm7-G7-Cmaj7-Am7 + 그루브 슬랩 베이스 + 신스 패드)
   */
  _scheduleKpopSynthStep(step, t) {
    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    // 1) 부드러운 킥 (0, 6, 10)
    if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
      this._playKick(t, 0.30);
    }

    // 2) 리버브 스네어 (4, 12)
    if (stepInBar === 4 || stepInBar === 12) {
      this._playSnare(t, 0.20, false);
    }

    // 3) 하이햇
    if (stepInBar % 2 === 0) {
      this._playHiHat(t, 0.08, stepInBar === 10);
    }

    // 4) 신스 패드 화음 (마디 첫 박)
    if (stepInBar === 0) {
      const chords = [
        [50, 53, 57, 60], // Dm7
        [43, 53, 55, 59], // G7
        [48, 52, 55, 59], // Cmaj7
        [45, 52, 57, 60]  // Am7
      ];
      this._playSynthPadChord(chords[bar].map(m => this._midiToFreq(m)), t, 1.4, 0.16);
    }

    // 5) 시티팝 베이스 라인
    const roots = [50, 43, 48, 45];
    if (stepInBar === 0 || stepInBar === 3 || stepInBar === 8 || stepInBar === 11 || stepInBar === 14) {
      const note = stepInBar === 3 ? roots[bar] + 12 : roots[bar];
      this._playSynthBass(this._midiToFreq(note), t, 0.18, 0.24, false);
    }

    // 6) 감성 시티팝 리드
    const cityPopLead = {
      0: 72, 4: 76, 8: 77, 10: 76, 12: 74,
      16: 71, 20: 74, 24: 76, 26: 74, 28: 71,
      32: 67, 36: 72, 40: 76, 42: 79, 44: 76,
      48: 81, 52: 79, 56: 76, 58: 74, 60: 72
    };
    if (cityPopLead[step] !== undefined) {
      this._playSynthLead(this._midiToFreq(cityPopLead[step]), t, 0.30, 0.18, 'triangle');
    }
  }

  /**
   * 🥁 3. 조선 퓨전 K-비트 (대취타 트랩 비트 + 태평소 팡파르 + 808 서브 베이스)
   */
  _scheduleKFusionStep(step, t) {
    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    // 1) 808 서브 킥
    if (stepInBar === 0) {
      this._playKick(t, 0.42, 0.9);
      this._playSynthBass(this._midiToFreq(38), t, 0.45, 0.32);
    } else if (stepInBar === 6) {
      this._playKick(t, 0.35, 0.95);
    } else if (stepInBar === 10) {
      this._playKick(t, 0.38, 0.9);
      this._playSynthBass(this._midiToFreq(43), t, 0.35, 0.30);
    }

    // 2) 트랩 스네어 (8박)
    if (stepInBar === 8) {
      this._playSnare(t, 0.30, true);
    }

    // 3) 트랩 하이햇 롤 (14, 15에 빠른 롤)
    if (stepInBar === 14 || stepInBar === 15) {
      this._playHiHat(t, 0.12, false);
      this._playHiHat(t + 0.05, 0.14, false);
    } else if (stepInBar % 2 === 0) {
      this._playHiHat(t, 0.09, false);
    }

    // 4) 태평소 국악 팡파르
    const fusionFanfare = {
      0: 74, 3: 79, 6: 81,
      16: 86, 20: 83, 24: 81, 28: 79,
      32: 76, 35: 79, 38: 81, 42: 83,
      48: 86, 52: 81, 56: 79, 60: 74
    };
    if (fusionFanfare[step] !== undefined) {
      this._playFusionLead(this._midiToFreq(fusionFanfare[step]), t, 0.28, 0.26, true);
    }

    // 5) 거문고/가야금 줄 튕김
    if (stepInBar === 4 || stepInBar === 12) {
      this._playGeomungoDeepPluck(this._midiToFreq(62), t, 0.25, 0.20);
      this._playGeomungoDeepPluck(this._midiToFreq(67), t + 0.03, 0.22, 0.18);
    }
  }

  /**
   * 👾 4. 레트로 8비트 아케이드 (고전 오락실 칩튠 아르페지오 & 워킹 베이스)
   */
  _scheduleRetro8BitStep(step, t) {
    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    // 1) 칩튠 드럼
    if (stepInBar === 0 || stepInBar === 8) {
      this._playKick(t, 0.28);
    }
    if (stepInBar === 4 || stepInBar === 12) {
      this._playSnare(t, 0.18, true);
    }
    if (stepInBar % 2 === 0) {
      this._playHiHat(t, 0.06, false);
    }

    // 2) 트라이앵글 워킹 베이스
    const bassChords = [48, 52, 53, 55];
    const root = bassChords[bar];
    const bassOffsets = [0, 7, 12, 7];
    const offset = bassOffsets[Math.floor(stepInBar / 4)];
    this._playChiptune(this._midiToFreq(root + offset), t, 0.12, 0.22, 'triangle');

    // 3) 통통 튀는 스퀘어 아르페지오
    const arpNotes = [72, 76, 79, 84, 79, 76];
    const noteMidi = arpNotes[stepInBar % arpNotes.length];
    this._playChiptune(this._midiToFreq(noteMidi), t, 0.09, 0.18, 'square');
  }

  /**
   * 🎹 신디사이저 및 드럼 사운드 합성기 라이브러리
   */
  _playKick(t, vol = 0.32, punch = 1) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(155 * punch, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.085);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(this._bgmMasterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  _playSnare(t, vol = 0.22, snappy = true) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.06);
    oscGain.gain.setValueAtTime(vol * 0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this._bgmMasterGain);
    osc.start(t);
    osc.stop(t + 0.09);

    const dur = snappy ? 0.12 : 0.08;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.28));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1850;
    bp.Q.value = 1.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(vol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(this._bgmMasterGain);
    src.start(t);
  }

  _playHiHat(t, vol = 0.10, isOpen = false) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const dur = isOpen ? 0.14 : 0.038;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.35));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp);
    hp.connect(gain);
    gain.connect(this._bgmMasterGain);
    src.start(t);
  }

  _playSynthBass(freq, t, dur = 0.16, vol = 0.28, isSlap = false) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = isSlap ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 0.5, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSlap ? 1600 : 750, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + dur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this._bgmMasterGain);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + dur + 0.02);
    subOsc.stop(t + dur + 0.02);
  }

  _playSynthLead(freq, t, dur = 0.18, vol = 0.20, type = 'sawtooth') {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = type;
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.004, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, t);
    filter.frequency.exponentialRampToValueAtTime(900, t + dur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.015);
    gain.gain.setValueAtTime(vol * 0.85, t + Math.max(0.03, dur * 0.7));
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this._bgmMasterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur + 0.02);
    osc2.stop(t + dur + 0.02);
  }

  _playSynthPadChord(freqs, t, dur = 0.8, vol = 0.14) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain || !Array.isArray(freqs)) return;
    const chordGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + dur);

    chordGain.gain.setValueAtTime(0.001, t);
    chordGain.gain.linearRampToValueAtTime(vol / freqs.length, t + 0.06);
    chordGain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

    filter.connect(chordGain);
    chordGain.connect(this._bgmMasterGain);

    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    });
  }

  _playFusionLead(freq, t, dur = 0.28, vol = 0.24, vibrato = false) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq * 0.98, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.035);

    oscSub.type = 'sawtooth';
    oscSub.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);

    if (vibrato) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.8, t);
      lfoGain.gain.setValueAtTime(freq * 0.015, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.02);
    }

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

    osc.connect(filter);
    oscSub.connect(filter);
    filter.connect(gain);
    gain.connect(this._bgmMasterGain);

    osc.start(t);
    oscSub.start(t);
    osc.stop(t + dur + 0.02);
    oscSub.stop(t + dur + 0.02);
  }

  _playChiptune(freq, t, dur = 0.12, vol = 0.18, type = 'square') {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.setValueAtTime(vol * 0.8, t + dur * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this._bgmMasterGain);

    osc.start(t);
    osc.stop(t + dur + 0.01);
  }

  _advanceKoreanTavernStep() {
    // 12/8 굿거리·세마치 삼분박 장단: 1마디 = 12스텝(3분박 x 4소박)
    // 기본 점4분음표 56 BPM -> 1스텝(8분음표) 약 0.34초 (웨이브 상승 시 살짝 흥겨워짐)
    const dottedQuarterBpm = Math.min(66, 56 + (this._bgmWave - 1) * 1.5);
    const eighthSec = (60 / dottedQuarterBpm) / 3;
    const posInTriplet = this._bgmStep % 3;
    // 한국 장단 특유의 호흡(첫 박은 넉넉하고 세 번째 박은 다음 장단으로 감칠맛 나게 넘어감)
    const breathFactor = posInTriplet === 0 ? 1.06 : (posInTriplet === 1 ? 0.98 : 0.96);
    this._bgmNextNoteTime += eighthSec * breathFactor;
    this._bgmStep = (this._bgmStep + 1) % 48; // 4마디(48스텝) 한 장단 주기
  }

  _midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  _scheduleKoreanTavernStep(step, t) {
    if (this.isMutedState() || !this._bgmMasterGain) return;

    const bar = Math.floor(step / 12); // 0, 1, 2, 3 (각 마디 12/8박자)
    const stepInBar = step % 12;       // 0 ~ 11 (삼분박 4소박: [0,1,2], [3,4,5], [6,7,8], [9,10,11])

    // 1) 전통 장구(Janggu) 굿거리/타령 장단: "덩 - - 기덕 쿵 더러러러 쿵 - -"
    if (stepInBar === 0) {
      // [덩 (Deong)]: 북편(깊은 저음) + 채편(대나무 열채) 동시 타격
      this._playJangguBuk(t, 0.32, 82);
      this._playJangguChae(t, 0.14);
    } else if (stepInBar === 3) {
      // [기덕 (Gi-deok)]: 채편 겹치기 타격
      this._playJangguChae(t, 0.08);
      this._playJangguChae(t + 0.09, 0.15);
    } else if (stepInBar === 6) {
      // [쿵 (Kung)]: 북편 둥근 울림
      this._playJangguBuk(t, 0.28, 76);
    } else if (stepInBar === 8) {
      // [더러러러]: 열채 굴림 잔가락
      this._playJangguChae(t, 0.06);
      this._playJangguChae(t + 0.07, 0.07);
      this._playJangguChae(t + 0.14, 0.09);
    } else if (stepInBar === 9) {
      // [쿵 (Kung)]: 제4소박 첫머리 북편
      this._playJangguBuk(t, 0.24, 79);
    } else if (bar === 3 && stepInBar === 11) {
      // 한 장단 마무리 추임새 딱
      this._playJangguChae(t, 0.12);
    }

    // 2) 거문고(Geomungo) 깊고 묵직한 저음 줄 탄주 (마디별 4도·5도 전통 화성 받침)
    // D평조/계면조 기반: D2(38)-A2(45), G2(43)-D3(50), A2(45)-E3(52), D2(38)-A2(45)
    const geomungoPairs = [
      [[38, 45], [50, 57]], // Bar 0: 임종/태주 (D - A)
      [[43, 50], [55, 62]], // Bar 1: 중려 (G - D)
      [[45, 52], [57, 64]], // Bar 2: 임종 (A - E)
      [[38, 45], [45, 50]]  // Bar 3: 태주 본청 귀결 (D - A)
    ];
    if (stepInBar === 0) {
      const lowChord = geomungoPairs[bar][0];
      this._playGeomungoDeepPluck(this._midiToFreq(lowChord[0]), t, 0.95, 0.28);
      this._playGeomungoDeepPluck(this._midiToFreq(lowChord[1]), t + 0.03, 0.85, 0.20);
    } else if (stepInBar === 6) {
      const midChord = geomungoPairs[bar][1];
      this._playGeomungoDeepPluck(this._midiToFreq(midChord[0]), t, 0.75, 0.22);
      this._playGeomungoDeepPluck(this._midiToFreq(midChord[1]), t + 0.025, 0.65, 0.16);
    } else if (stepInBar === 9) {
      const lowRoot = geomungoPairs[bar][0][0];
      this._playGeomungoDeepPluck(this._midiToFreq(lowRoot + 12), t, 0.55, 0.18);
    }

    // 3) 대금(Daegeum) 한국 민요·풍류 선율 (3분박 장단 호흡 + 떠는음 요성 + 흘러내리는 퇴성)
    // 각 노트는 { midi, durSteps, vibrato(요성), slideDown(퇴성) }
    // 한국 전래 민요(아리랑·태평가·주막 타령)의 '장-단 / 장-단' 3분박 호흡
    const daegeumScore = {
      // Bar 0: 정겹고 유장한 도입 ("라~ 시 | 라~ 솔 | 미~ 레 | 미~~~(요성)")
      0:  { midi: 69, dur: 0.62, vibrato: true, slide: false },  // A4 (2박)
      2:  { midi: 71, dur: 0.30, vibrato: false, slide: false }, // B4 (1박)
      3:  { midi: 69, dur: 0.62, vibrato: false, slide: true },  // A4↘ (2박 퇴성)
      5:  { midi: 67, dur: 0.30, vibrato: false, slide: false }, // G4 (1박)
      6:  { midi: 64, dur: 0.62, vibrato: false, slide: false }, // E4 (2박)
      8:  { midi: 62, dur: 0.30, vibrato: false, slide: false }, // D4 (1박)
      9:  { midi: 64, dur: 0.92, vibrato: true, slide: false },  // E4 (3박 깊은 요성)

      // Bar 1: 흥겹게 솟아오르는 가락 ("솔~ 라 | 시~ 레 | 시↘ 라 | 솔~~~(요성)")
      12: { midi: 67, dur: 0.62, vibrato: false, slide: false }, // G4 (2박)
      14: { midi: 69, dur: 0.30, vibrato: false, slide: false }, // A4 (1박)
      15: { midi: 71, dur: 0.62, vibrato: false, slide: false }, // B4 (2박)
      17: { midi: 74, dur: 0.32, vibrato: false, slide: false }, // D5 (1박)
      18: { midi: 71, dur: 0.62, vibrato: false, slide: true },  // B4↘ (2박 퇴성)
      20: { midi: 69, dur: 0.30, vibrato: false, slide: false }, // A4 (1박)
      21: { midi: 67, dur: 0.92, vibrato: true, slide: false },  // G4 (3박 깊은 요성)

      // Bar 2: 시원하게 뻗는 한가락 ("레~ 미 | 레~ 시 | 라~ 솔 | 라~~~(요성)")
      24: { midi: 74, dur: 0.62, vibrato: true, slide: false },  // D5 (2박 요성)
      26: { midi: 76, dur: 0.30, vibrato: false, slide: false }, // E5 (1박)
      27: { midi: 74, dur: 0.62, vibrato: false, slide: true },  // D5↘ (2박)
      29: { midi: 71, dur: 0.30, vibrato: false, slide: false }, // B4 (1박)
      30: { midi: 69, dur: 0.62, vibrato: false, slide: false }, // A4 (2박)
      32: { midi: 67, dur: 0.30, vibrato: false, slide: false }, // G4 (1박)
      33: { midi: 69, dur: 0.92, vibrato: true, slide: false },  // A4 (3박 요성)

      // Bar 3: 구수하게 맺는 본청 귀결 ("솔~ 미 | 레~ 미 | 솔↘ 미 | 레~~~(요성)")
      36: { midi: 67, dur: 0.62, vibrato: false, slide: true },  // G4↘ (2박 퇴성)
      38: { midi: 64, dur: 0.30, vibrato: false, slide: false }, // E4 (1박)
      39: { midi: 62, dur: 0.62, vibrato: false, slide: false }, // D4 (2박)
      41: { midi: 64, dur: 0.30, vibrato: false, slide: false }, // E4 (1박)
      42: { midi: 67, dur: 0.62, vibrato: false, slide: true },  // G4↘ (2박 퇴성)
      44: { midi: 64, dur: 0.30, vibrato: false, slide: false }, // E4 (1박)
      45: { midi: 62, dur: 0.95, vibrato: true, slide: false }   // D4 (3박 본청 마무리)
    };

    const note = daegeumScore[step];
    if (note) {
      this._playDaegeumNote(this._midiToFreq(note.midi), t, note.dur, note.vibrato, note.slide);
    }
  }

  /**
   * 대금(Daegeum) 소리 합성:
   * - 따뜻한 대나무 관악 배음(Sine + Triangle) + 은은한 숨결(청 울림) + 한국 전통 농현(요성 Vibrato & 퇴성 Pitch Slide)
   */
  _playDaegeumNote(freq, t, dur = 0.6, hasVibrato = false, slideDown = false) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;

    const mainOsc = ctx.createOscillator();
    const harmOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const harmGain = ctx.createGain();

    mainOsc.type = 'sine';
    harmOsc.type = 'triangle';

    // 대금 특유의 첫 숨결 시김새(살짝 아래에서 밀어 올리는 어택) 및 퇴성(끝을 흘려 내리는 음)
    mainOsc.frequency.setValueAtTime(freq * 0.985, t);
    mainOsc.frequency.exponentialRampToValueAtTime(freq, t + 0.045);
    harmOsc.frequency.setValueAtTime(freq * 2 * 0.985, t);
    harmOsc.frequency.exponentialRampToValueAtTime(freq * 2, t + 0.045);

    if (slideDown) {
      // 퇴성: 음 후반부에 부드럽게 아래로 흘러내림
      mainOsc.frequency.setValueAtTime(freq, t + dur * 0.55);
      mainOsc.frequency.exponentialRampToValueAtTime(freq * 0.93, t + dur);
      harmOsc.frequency.setValueAtTime(freq * 2, t + dur * 0.55);
      harmOsc.frequency.exponentialRampToValueAtTime(freq * 2 * 0.93, t + dur);
    }

    // 요성(농현): 긴 음에서 깊고 여유 있게 흔들리는 한국 전통 비브라토 (5.2Hz)
    if (hasVibrato) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(5.2, t);
      lfoGain.gain.setValueAtTime(0.01, t);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.014, t + Math.min(0.28, dur * 0.45));
      lfo.connect(lfoGain);
      lfoGain.connect(mainOsc.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.04);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.2, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.055);
    gain.gain.setValueAtTime(0.22, t + Math.max(0.06, dur - 0.09));
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

    harmGain.gain.setValueAtTime(0.06, t);

    mainOsc.connect(filter);
    harmOsc.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(gain);
    gain.connect(this._bgmMasterGain);

    mainOsc.start(t);
    harmOsc.start(t);
    mainOsc.stop(t + dur + 0.04);
    harmOsc.stop(t + dur + 0.04);
  }

  /**
   * 거문고(Geomungo) 깊고 묵직한 명주실 저음 탄주 (중국 고쟁 같은 날카로운 고음을 배제한 따뜻한 울림)
   */
  _playGeomungoDeepPluck(freq, t, dur = 0.8, vol = 0.24) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;

    const osc = ctx.createOscillator();
    const bodyOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.018, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.035);

    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(680, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + dur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

    osc.connect(filter);
    bodyOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this._bgmMasterGain);

    osc.start(t);
    bodyOsc.start(t);
    osc.stop(t + dur + 0.03);
    bodyOsc.stop(t + dur + 0.03);
  }

  /**
   * 장구 북편(쿵): 따뜻하고 둥근 가죽 통울림
   */
  _playJangguBuk(t, vol = 0.28, startFreq = 82) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.16);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    osc.connect(gain);
    gain.connect(this._bgmMasterGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * 장구 채편(기덕/더러러): 대나무 열채로 가죽 가장자리를 치는 담백한 국악 타악음
   */
  _playJangguChae(t, vol = 0.12) {
    const ctx = this.ctx;
    if (!ctx || !this._bgmMasterGain) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, t);
    osc.frequency.exponentialRampToValueAtTime(290, t + 0.038);
    filter.type = 'bandpass';
    filter.frequency.value = 820;
    filter.Q.value = 1.8;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._bgmMasterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  vibrate(pattern = 15) {
    if (navigator && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(pattern); } catch (_) {}
    }
  }

  /**
   * 🛎️ 카운터 서비스 벨("땡~!") 사운드 합성:
   * 황동 데스크 벨 특유의 맑고 영롱한 배음(Inharmonic bell partials) + 짧은 타격 클릭음
   */
  playServiceBell() {
    const effVol = this.getEffectiveVolume();
    if (effVol <= 0) return;
    this.vibrate([20, 30, 40]);
    const ctx = this._getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1) 금속 핀 타격(Clapper strike) 어택 노이즈
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strikeOsc.type = 'triangle';
    strikeOsc.frequency.setValueAtTime(3400, now);
    strikeOsc.frequency.exponentialRampToValueAtTime(980, now + 0.025);
    strikeGain.gain.setValueAtTime(0.28 * effVol, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    strikeOsc.connect(strikeGain);
    strikeGain.connect(ctx.destination);
    strikeOsc.start(now);
    strikeOsc.stop(now + 0.035);

    // 2) 데스크 벨 공명 배음 (맑은 F#6/C#7 계열 황동 벨 배음)
    const partials = [
      { freq: 1480.0, amp: 0.34, dur: 0.95 },
      { freq: 2959.9, amp: 0.22, dur: 0.72 },
      { freq: 4186.0, amp: 0.14, dur: 0.48 },
      { freq: 5873.3, amp: 0.08, dur: 0.30 }
    ];

    partials.forEach(p => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(p.amp * effVol, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + p.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + p.dur + 0.03);
    });
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
    this.mode = 'TYCOON'; // 'TYCOON' | 'QUIZ' | 'HELP_FRIEND'
    this.KEY = 'ksool_alchemy_v2_state';
    this.BACKUP_KEY = 'ksool_alchemy_v2_state_bak';
    this._inMemoryState = null;
    this.lastLoadStatus = {
      hasExistingSave: false,
      isCorrupted: false,
      fromBackup: false,
      quarantined: false
    };
  }

  /**
   * 게임 모드에 따라 스토리지 키 분리:
   * - TYCOON: 기존 'ksool_alchemy_v2_state' (기존 유저의 자금/레시피/단계 100% 보존)
   * - QUIZ: 신규 'ksool_alchemy_quiz_v1_state' (순수 조합 퀴즈 전용 독립 세이브)
   * - HELP_FRIEND: 휘발성 메모리 샌드박스 (로컬스토리지에 일절 쓰지 않음)
   */
  setMode(mode = 'TYCOON') {
    this.mode = mode;
    if (mode === 'QUIZ') {
      this.KEY = 'ksool_alchemy_quiz_v1_state';
      this.BACKUP_KEY = 'ksool_alchemy_quiz_v1_state_bak';
    } else if (mode === 'HELP_FRIEND') {
      this.KEY = null;
      this.BACKUP_KEY = null;
      this._inMemoryState = null;
    } else {
      this.mode = 'TYCOON';
      this.KEY = 'ksool_alchemy_v2_state';
      this.BACKUP_KEY = 'ksool_alchemy_v2_state_bak';
    }
    this.lastLoadStatus = {
      hasExistingSave: false,
      isCorrupted: false,
      fromBackup: false,
      quarantined: false
    };
  }

  /**
   * 저장소 데이터 구조 유효성 검증 (하위 호환성을 보장하면서 파싱 가능한 손상 데이터 거정)
   */
  validateSaveStructure(stateObj) {
    if (!stateObj || typeof stateObj !== 'object' || Array.isArray(stateObj)) {
      return false;
    }
    // unlockedRecipeIds 필드가 있으면 반드시 배열이어야 함
    if ('unlockedRecipeIds' in stateObj && !Array.isArray(stateObj.unlockedRecipeIds)) {
      return false;
    }
    // purchasedIngredientIds 필드가 있으면 반드시 배열이어야 함
    if ('purchasedIngredientIds' in stateObj && !Array.isArray(stateObj.purchasedIngredientIds)) {
      return false;
    }
    // unlockedIngredientIds 필드가 있으면 반드시 배열이어야 함
    if ('unlockedIngredientIds' in stateObj && !Array.isArray(stateObj.unlockedIngredientIds)) {
      return false;
    }
    // unlockedStepId 필드가 있으면 반드시 숫자여야 함
    if ('unlockedStepId' in stateObj && typeof stateObj.unlockedStepId !== 'number') {
      return false;
    }
    // userLevel 필드가 있으면 반드시 숫자여야 함
    if ('userLevel' in stateObj && typeof stateObj.userLevel !== 'number') {
      return false;
    }
    // ingredientStock 필드가 있다면 객체(배열 아님)이어야 함
    if ('ingredientStock' in stateObj && (typeof stateObj.ingredientStock !== 'object' || Array.isArray(stateObj.ingredientStock))) {
      return false;
    }
    return true;
  }

  loadState() {
    if (this.mode === 'HELP_FRIEND') {
      return this._inMemoryState ? JSON.parse(JSON.stringify(this._inMemoryState)) : null;
    }

    if (!this.KEY) return null;

    let raw = null;
    try {
      raw = localStorage.getItem(this.KEY);
    } catch (e) {
      console.error('[StorageService] Error reading localStorage KEY:', e);
    }

    let bakRaw = null;
    try {
      bakRaw = localStorage.getItem(this.BACKUP_KEY);
    } catch (e) {}

    const hasRaw = Boolean(raw);
    const hasBak = Boolean(bakRaw);

    this.lastLoadStatus = {
      hasExistingSave: hasRaw || hasBak,
      isCorrupted: false,
      fromBackup: false,
      quarantined: false
    };

    // 1. Try parsing primary key and validating its structure
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (this.validateSaveStructure(parsed)) {
          return parsed;
        } else {
          console.warn('[StorageService] Primary save has invalid schema/structure, attempting recovery from backup...');
        }
      } catch (e) {
        console.warn('[StorageService] Primary save JSON parse failed, attempting recovery from backup...', e);
      }
    }

    // 2. Try recovering from backup
    if (bakRaw) {
      try {
        const bakParsed = JSON.parse(bakRaw);
        if (this.validateSaveStructure(bakParsed)) {
          console.info('[StorageService] Successfully recovered save from backup!');
          this.lastLoadStatus.fromBackup = true;
          // Heal primary key immediately with valid backup data
          try {
            localStorage.setItem(this.KEY, bakRaw);
          } catch (_) {}
          return bakParsed;
        } else {
          console.warn('[StorageService] Backup save also has invalid schema/structure.');
        }
      } catch (e) {
        console.warn('[StorageService] Backup save JSON parse failed:', e);
      }
    }

    // 3. Existing data existed but both primary and backup failed to parse or validate: Quarantine!
    if (hasRaw || hasBak) {
      console.error('[StorageService] Save state corrupted and unrecoverable. Quarantining to prevent overwrite.');
      this.lastLoadStatus.isCorrupted = true;
      this.lastLoadStatus.quarantined = true;
      try {
        const ts = Date.now();
        if (raw) localStorage.setItem(`ksool_alchemy_v2_corrupt_${ts}`, raw);
        if (bakRaw) localStorage.setItem(`ksool_alchemy_v2_bak_corrupt_${ts}`, bakRaw);
      } catch (_) {}
    }

    return null;
  }

  saveState(stateObj) {
    if (!stateObj) return;

    if (this.mode === 'HELP_FRIEND') {
      this._inMemoryState = JSON.parse(JSON.stringify(stateObj));
      return;
    }

    if (!this.KEY) return;

    try {
      const serialized = JSON.stringify(stateObj);
      const existing = localStorage.getItem(this.KEY);
      if (existing) {
        try {
          // Only copy to BACKUP_KEY if existing data is structurally valid!
          const parsed = JSON.parse(existing);
          if (this.validateSaveStructure(parsed)) {
            localStorage.setItem(this.BACKUP_KEY, existing);
          } else {
            console.warn('[StorageService] Existing save has invalid structure; skipping backup overwrite to protect healthy backup.');
          }
        } catch (_) {
          console.warn('[StorageService] Existing save corrupted; skipping backup overwrite to preserve healthy backup.');
        }
      }
      localStorage.setItem(this.KEY, serialized);
    } catch (e) {
      console.error('[StorageService] saveState failed:', e);
    }
  }

  clearState() {
    if (this.mode === 'HELP_FRIEND') {
      this._inMemoryState = null;
      return;
    }
    if (this.KEY) {
      try {
        localStorage.removeItem(this.KEY);
        if (this.BACKUP_KEY) localStorage.removeItem(this.BACKUP_KEY);
      } catch (e) {}
    }
  }
}

window.KSool.AudioService = AudioService;
window.KSool.StorageService = StorageService;
