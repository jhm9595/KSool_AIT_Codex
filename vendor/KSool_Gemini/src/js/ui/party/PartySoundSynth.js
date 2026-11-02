window.KSool = window.KSool || {};

/**
 * 오프라인 술자리 소음 속에서도 귀에 쏙 꽂히는 Web Audio API 신디사이저
 * 외부 오디오 파일 없이 순수 브라우저 오디오 오실레이터로 고출력 효과음 합성
 */
class PartySoundSynth {
  constructor() {
    this.ctx = null;
    this.pourOsc = null;
    this.pourGain = null;
  }

  _getEffectiveVolume() {
    const isMuted = localStorage.getItem('ksool_sound_muted') === 'true';
    if (isMuted) return 0;
    const savedVol = localStorage.getItem('ksool_sound_volume');
    const vol = savedVol !== null ? parseFloat(savedVol) : 0.7;
    const clamped = Math.max(0, Math.min(1, vol));
    return Math.pow(clamped, 1.5);
  }

  get isMuted() {
    return this._getEffectiveVolume() <= 0;
  }

  set isMuted(val) {
    try {
      localStorage.setItem('ksool_sound_muted', String(Boolean(val)));
    } catch (_) {}
  }

  _initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTap() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.18 * effVol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playSuccess() {
    this.playUp();
  }

  playUp() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    gain.gain.setValueAtTime(0.3 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * effVol, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playDown() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
    gain.gain.setValueAtTime(0.3 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * effVol, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playMetalHit(strainRatio = 0.5) {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 고주파 메탈 핑 소리 + 피로도에 따라 음정 상승
    const baseFreq = 950 + strainRatio * 600;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.08);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.08);

    gain.gain.setValueAtTime(0.35 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + 0.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.1);
  }

  playSnap() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 철사 꼬다리 뚝 끊어지는 날카로운 소리
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    gain.gain.setValueAtTime(0.4 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  startPour() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx || this.pourOsc) return;
    const now = this.ctx.currentTime;
    this.pourOsc = this.ctx.createOscillator();
    this.pourGain = this.ctx.createGain();
    this.pourOsc.type = 'triangle';
    this.pourOsc.frequency.setValueAtTime(380, now);
    this.pourGain.gain.setValueAtTime(0.12 * effVol, now);
    this.pourOsc.connect(this.pourGain);
    this.pourGain.connect(this.ctx.destination);
    this.pourOsc.start(now);
  }

  updatePour(heightRatio) {
    if (!this.pourOsc || !this.ctx) return;
    // 잔이 찰수록 매끄럽게 음정 상승 (380Hz ~ 700Hz)
    const targetFreq = 380 + heightRatio * 320;
    this.pourOsc.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
  }

  stopPour() {
    if (this.pourOsc && this.ctx) {
      try {
        if (this.pourGain) {
          this.pourGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        }
        this.pourOsc.stop(this.ctx.currentTime + 0.05);
      } catch (_) {}
      this.pourOsc = null;
      this.pourGain = null;
    }
  }

  playPour(duration = 0.8) {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + duration);
    gain.gain.setValueAtTime(0.15 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playCurtainReveal() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 화려하게 올라가는 커튼 오픈 사운드 아르페지오 (도-미-솔-도)
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.18 * effVol, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + idx * 0.045 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.25);
    });
  }

  playHeartbeat() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 쿵... 쿵... 저주파 심장박동
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    gain.gain.setValueAtTime(0.45 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playTick() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    gain.gain.setValueAtTime(0.2 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playSpinWhir() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);
    gain.gain.setValueAtTime(0.25 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + 0.42);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.43);
  }

  playExplosion() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. 깊은 저음 폭발
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
    gain.gain.setValueAtTime(0.6 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001 * effVol, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // 2. 고주파 사이렌 비프
    const sirenOsc = this.ctx.createOscillator();
    const sirenGain = this.ctx.createGain();
    sirenOsc.type = 'square';
    sirenOsc.frequency.setValueAtTime(880, now + 0.1);
    sirenOsc.frequency.setValueAtTime(1100, now + 0.25);
    sirenOsc.frequency.setValueAtTime(880, now + 0.4);
    sirenGain.gain.setValueAtTime(0.3 * effVol, now + 0.1);
    sirenGain.gain.exponentialRampToValueAtTime(0.01 * effVol, now + 0.6);
    sirenOsc.connect(sirenGain);
    sirenGain.connect(this.ctx.destination);
    sirenOsc.start(now + 0.1);
    sirenOsc.stop(now + 0.65);
  }

  _getNoiseBuffer() {
    if (!this.ctx) return null;
    if (this._noiseBuffer) return this._noiseBuffer;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.2); // 200ms 화이트 노이즈
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this._noiseBuffer = buffer;
    return this._noiseBuffer;
  }

  /**
   * 쿵! - 펀치감 넘치는 아케이드/EDM 킥 & 무릎치기
   * 고주파 트랜지언트 클릭 + 바운시한 저음 펀치로 폰 스피커에서도 찰진 타격감 제공
   */
  playRhythmThud(isUser = false) {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    // 1. 선명한 어택 타격음 (폰 스피커 최적화 프론트 클릭)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    const clickStart = isUser ? 540 : 440;
    clickOsc.frequency.setValueAtTime(clickStart, now);
    clickOsc.frequency.exponentialRampToValueAtTime(75, now + 0.025);
    clickGain.gain.setValueAtTime((isUser ? 0.45 : 0.35) * effVol, now);
    clickGain.gain.exponentialRampToValueAtTime(minVol, now + 0.028);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.03);

    // 2. 둥둥 울리는 바운시 킥 바디 (저음 펀치)
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'sine';
    const bodyStart = isUser ? 165 : 140;
    bodyOsc.frequency.setValueAtTime(bodyStart, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    bodyGain.gain.setValueAtTime((isUser ? 0.58 : 0.5) * effVol, now);
    bodyGain.gain.exponentialRampToValueAtTime(minVol, now + 0.14);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.15);
  }

  /**
   * 짝! - 스내피 808 멀티버스트 핸드클랩 & 찰진 손뼉치기
   * 밴드패스 필터링된 화이트 노이즈 임펄스 + 토널 스냅으로 신나는 리듬감 연출
   */
  playRhythmClap(isUser = false) {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    // 1. 멀티 임펄스 화이트 노이즈 (실제 손바닥이 부딪히는 다중 충격음)
    const noiseBuf = this._getNoiseBuffer();
    if (noiseBuf) {
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isUser ? 2100 : 1850, now);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      const peakVol = (isUser ? 0.55 : 0.45) * effVol;
      // 0ms, 12ms, 24ms 3연속 마이크로 버스트 후 서스테인 감쇄
      noiseGain.gain.setValueAtTime(peakVol * 0.4, now);
      noiseGain.gain.setValueAtTime(peakVol * 0.7, now + 0.012);
      noiseGain.gain.setValueAtTime(peakVol, now + 0.024);
      noiseGain.gain.exponentialRampToValueAtTime(minVol, now + 0.12);

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseNode.start(now);
      noiseNode.stop(now + 0.13);
    }

    // 2. 통통 튀는 경쾌한 타격 바디 (하이햇 / 림 톤)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(isUser ? 960 : 840, now);
    snapOsc.frequency.exponentialRampToValueAtTime(260, now + 0.05);
    snapGain.gain.setValueAtTime((isUser ? 0.35 : 0.28) * effVol, now);
    snapGain.gain.exponentialRampToValueAtTime(minVol, now + 0.06);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.07);
  }

  /**
   * 띵! - 영롱하고 경쾌한 아케이드 마림바 / 리듬게임 PERFECT 벨 차임
   * 자기소개 4박자 외치기 또는 수비 성공 시 기분 좋은 도파민을 주는 화음 차임
   */
  playRhythmHit(isUserHit = false) {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    const chord = isUserHit
      ? [1046.5, 1318.51, 1567.98] // C6, E6, G6 (도-미-솔 아르페지오 팝)
      : [880, 1174.66];            // A5, D6 (경쾌한 2화음 팝)

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.022;
      osc.frequency.setValueAtTime(freq * 0.95, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.025);

      const hitVol = (isUserHit ? 0.35 : 0.28) * effVol;
      gain.gain.setValueAtTime(hitVol, t);
      gain.gain.exponentialRampToValueAtTime(minVol, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });

    // 반짝이는 메탈릭 탑 핑
    const pingOsc = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    pingOsc.type = 'triangle';
    pingOsc.frequency.setValueAtTime(isUserHit ? 2093 : 1760, now);
    pingGain.gain.setValueAtTime((isUserHit ? 0.28 : 0.18) * effVol, now);
    pingGain.gain.exponentialRampToValueAtTime(minVol, now + 0.04);
    pingOsc.connect(pingGain);
    pingGain.connect(this.ctx.destination);
    pingOsc.start(now);
    pingOsc.stop(now + 0.05);
  }

  /**
   * 🎯 지목! - 상대방을 지목할 때 경쾌하게 솟아오르는 신디사이저 레이저 핑
   */
  playRhythmTarget(isUser = false) {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    const freqs = isUser ? [659.25, 987.77, 1318.51] : [587.33, 880, 1174.66]; // E5-B5-E6 or D5-A5-D6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.022;
      osc.frequency.setValueAtTime(freq * 0.85, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + 0.06);

      gain.gain.setValueAtTime(0.3 * effVol, t);
      gain.gain.exponentialRampToValueAtTime(minVol, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  /**
   * 🔢 숫자 외치기! - 리드미컬하고 통통 튀는 아케이드 우드블록 / 카우벨 팝
   */
  playRhythmCount(count = 1) {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    // 숫자가 높아질수록 피치가 살짝 올라가 긴장감과 리듬감 고조
    const baseFreq = 720 + Math.min(count, 8) * 45;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.015);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.08);

    gain.gain.setValueAtTime(0.42 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(minVol, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // 청명한 공명음 벨 톤
    const ringOsc = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(baseFreq * 2.3, now);
    ringGain.gain.setValueAtTime(0.22 * effVol, now);
    ringGain.gain.exponentialRampToValueAtTime(minVol, now + 0.06);
    ringOsc.connect(ringGain);
    ringGain.connect(this.ctx.destination);
    ringOsc.start(now);
    ringOsc.stop(now + 0.07);
  }

  /**
   * ✨ 랠리 성공! - 수비에 성공했을 때 터지는 신나는 팡파르 아르페지오
   */
  playRhythmSuccess() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    // 도 - 미 - 솔 - 높은도 4음 팡파르
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.32 * effVol, t);
      gain.gain.exponentialRampToValueAtTime(minVol, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  /**
   * ⚡ 스피드 업! - BPM 상승 시 긴장감을 불어넣는 신스 글리산도
   */
  playRhythmSpeedUp() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(3600, now + 0.22);

    gain.gain.setValueAtTime(0.28 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(minVol, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * 🚨 박자 삑사리 / 탈락 - 익살스럽고 코믹한 스프링 보잉 & 피치 드롭
   */
  playRhythmMiss() {
    const effVol = this._getEffectiveVolume();
    if (effVol <= 0) return;
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const minVol = Math.max(0.0001, 0.001 * effVol);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.25);

    gain.gain.setValueAtTime(0.45 * effVol, now);
    gain.gain.exponentialRampToValueAtTime(minVol, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

window.KSool.PartySoundSynth = PartySoundSynth;
