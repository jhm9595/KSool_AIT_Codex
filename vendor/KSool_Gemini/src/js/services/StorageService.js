window.KSool = window.KSool || {};

class AudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('ksool_sound_muted') === 'true';
    const savedVol = localStorage.getItem('ksool_sound_volume');
    this.volume = savedVol !== null ? Math.max(0, Math.min(1, parseFloat(savedVol))) : 0.7;

    // 🏮 타이쿤 국악 풍류(굿거리/세마치 장단) BGM 시퀀서 상태 (우측 상단 설정창 음량/음소거와 100% 연동)
    this.isBgmEnabled = true;
    this._bgmActive = false;
    this._bgmTimer = null;
    this._bgmStep = 0;
    this._bgmNextNoteTime = 0;
    this._bgmMasterGain = null;
    this._bgmWave = 1;
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
        this._scheduleKoreanTavernStep(this._bgmStep, this._bgmNextNoteTime);
        this._advanceKoreanTavernStep();
      }
    }, 45);
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
    this.KEY = 'ksool_alchemy_v2_state';
    this.BACKUP_KEY = 'ksool_alchemy_v2_state_bak';
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
    try {
      localStorage.removeItem(this.KEY);
      localStorage.removeItem(this.BACKUP_KEY);
    } catch (e) {}
  }
}

window.KSool.AudioService = AudioService;
window.KSool.StorageService = StorageService;
