window.KSool = window.KSool || {};

/**
 * ② 병뚜껑 꼬다리 치기 (미니멀 물리 타격형)
 * - 불필요한 참가자 설정, 턴 배너, 패스 버튼 전부 제거
 * - 소주 텍스트 없는 순수 초록 메탈 병뚜껑 + 2배 이상 길어진 실감 나는 알루미늄 꼬다리
 * - 피로도 퍼센티지 완전 은닉 (언제 끊어질지 모르는 극강의 긴장감)
 * - 누르고 있으면 파워가 왔다갔다(진동/스윙)하며 손을 떼는 순간 타이밍에 맞춰 [살살 톡 / 보통 딱 / 풀파워 빡!] 조절
 */
class CapFlickGame {
  constructor(hub) {
    this.hub = hub;
    this.maxFatigue = 22; // 18~28 랜덤 피로도 한계
    this.currentFatigue = 0; // 누적 피로도 (유저에게 절대 비공개)
    this.isBroken = false;
    this.showQuestionMark = false;
    this.hitCount = 0;
    this.breakTimestamp = 0;
    this.baseAngle = 0; // 최초 생성 시 병뚜껑 본체 & 꼬다리 연결 부위의 무작위 배치 각도 (0° ~ 360°)
    this.bendAngle = 0; // 꼬다리와 뚜껑 접점(100px 25px)을 축으로 한 좌우 휨 각도

    // 파워 차징 (왔다갔다 타이밍 조절 엔진)
    this.isCharging = false;
    this.chargeStartTime = 0;
    this.currentPower = 0.2; // 0.0 ~ 1.0
    this.animLoopId = null;
    this.lastHitPower = 'normal'; // 'light' | 'normal' | 'max'
    this.hitTextTimeout = null;
  }

  init() {
    this.reset();
  }

  reset() {
    if (this.animLoopId) {
      cancelAnimationFrame(this.animLoopId);
      this.animLoopId = null;
    }
    if (this.hitTextTimeout) {
      clearTimeout(this.hitTextTimeout);
      this.hitTextTimeout = null;
    }
    const oldWire = document.getElementById('cap-wire-transform-group');
    if (oldWire && oldWire.currentAnimation) {
      try { oldWire.currentAnimation.cancel(); } catch (_) {}
      oldWire.currentAnimation = null;
    }
    this.maxFatigue = Math.floor(Math.random() * 11) + 18; // 18 ~ 28회 상당 피로도
    this.currentFatigue = 0;
    this.hitCount = 0;
    this.isBroken = false;
    this.showQuestionMark = false;
    this.breakTimestamp = 0;
    this.isCharging = false;
    
    // 1. 최초 병뚜껑 본체와 꼬다리가 돌아가 있는 지점: 360도 무작위 각도로 결정
    this.baseAngle = Math.floor(Math.random() * 360);
    window.KSool = window.KSool || {};
    window.KSool.lastCapAngle = this.baseAngle;

    // 2. 꼬다리 자체의 접점 기준 휨 각도: 초기 0도 부근 자연스러운 상태
    this.bendAngle = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.floor(Math.random() * 6));
    this.lastDir = Math.random() < 0.5 ? 1 : -1;

    this.currentPower = 0.2;
    this.render();
  }

  // =========================================================================
  // 파워 차징 & 타이밍 오실레이션 엔진
  // =========================================================================

  _startCharging() {
    if (this.isBroken) {
      this.reset();
      return;
    }

    this.isCharging = true;
    this.chargeStartTime = performance.now();

    document.querySelectorAll('.flick-timing-meter').forEach(el => el.classList.add('charging'));

    const updateLoop = () => {
      if (!this.isCharging) return;

      const elapsed = performance.now() - this.chargeStartTime;
      const cycleDuration = 620; // 620ms 주기 (리드미컬하게 왔다갔다)
      const phase = (elapsed % cycleDuration) / cycleDuration;

      // 0.0 -> 1.0 -> 0.0 삼각파 핑퐁
      this.currentPower = phase < 0.5 ? (phase * 2) : (2 - phase * 2);

      this._updateMeterUI(this.currentPower);
      this.animLoopId = requestAnimationFrame(updateLoop);
    };

    this.animLoopId = requestAnimationFrame(updateLoop);
  }

  _releaseAndFlick() {
    if (!this.isCharging) return;
    this.isCharging = false;

    if (this.animLoopId) {
      cancelAnimationFrame(this.animLoopId);
      this.animLoopId = null;
    }

    document.querySelectorAll('.flick-timing-meter').forEach(el => el.classList.remove('charging'));

    const holdDuration = performance.now() - this.chargeStartTime;

    // 150ms 미만 짧은 탭은 안전한 [살살 톡]으로 기본 적용
    let powerLevel = 'normal';
    let fatigueIncrement = 2;

    if (holdDuration < 150 || this.currentPower <= 0.33) {
      powerLevel = 'light';
      fatigueIncrement = 1; // 살살 1회
    } else if (this.currentPower <= 0.72) {
      powerLevel = 'normal';
      fatigueIncrement = Math.random() < 0.5 ? 2 : 3; // 보통 2~3회
    } else {
      powerLevel = 'max';
      fatigueIncrement = Math.random() < 0.5 ? 4 : 5; // 풀파워 4~5회!
    }

    this.lastHitPower = powerLevel;
    this._executeFlickHit(fatigueIncrement, powerLevel);
  }

  _executeFlickHit(fatigueInc, powerLevel) {
    this.currentFatigue += fatigueInc;
    this.hitCount = (this.hitCount || 0) + 1;
    const countEl = document.getElementById('flick-count-val');
    if (countEl) countEl.textContent = this.hitCount;

    const startAngle = this.bendAngle || 0;

    // 1. 타격 방향(Direction) 결정:
    // 이전 방향이 있으면 75% 확률로 그 방향으로 계속 쳐서 회전시키고, 25% 확률로 반대편 강타
    if (!this.lastDir) this.lastDir = (Math.random() < 0.5 ? 1 : -1);
    const dir = Math.random() < 0.75 ? this.lastDir : -this.lastDir;
    this.lastDir = dir;

    // 2. 파워 등급별 [360도 자유 꺾임 각도]:
    // - 톡 (light): 살짝 톡 치면 16° ~ 28° 회전
    // - 딱 (normal): 보통 딱 치면 55° ~ 85° 회전
    // - 빡! (max): 풀파워로 치면 150° ~ 220° 회전! (뚜껑 본체를 가로질러 겹치고 반대편까지 팍 넘어감)
    let deltaAngle = 0;
    if (powerLevel === 'light') {
      deltaAngle = 16 + Math.floor(Math.random() * 13); // 16° ~ 28°
    } else if (powerLevel === 'normal') {
      deltaAngle = 55 + Math.floor(Math.random() * 31); // 55° ~ 85°
    } else {
      deltaAngle = 150 + Math.floor(Math.random() * 71); // 150° ~ 220° (뚜껑 돔 위를 가로지르며 완전히 겹침!)
    }

    // 접점(100px 25px) 기준 360도 전방향 제한 없이 자유롭게 누적 회전!
    this.bendAngle = Math.round(startAngle + (dir * deltaAngle));

    const strainRatio = Math.min(1, this.currentFatigue / this.maxFatigue);

    // 오디오 & 진동 피드백
    if (powerLevel === 'light') {
      this.hub.sound.playMetalHit(strainRatio * 0.6);
      this.hub.vibrateShort();
    } else if (powerLevel === 'normal') {
      this.hub.sound.playMetalHit(strainRatio);
      this.hub.vibrateShort();
    } else {
      // 풀파워 빡!
      this.hub.sound.playMetalHit(1.2);
      if (navigator.vibrate) {
        try { navigator.vibrate([30, 40, 70]); } catch (_) {}
      }
    }

    // 시각 효과: 과한 덜컹거림/바운스 없이, 치는 순간 딱 해당 각도로 절도 있게 꺾여 멈춤 (Snappy Realistic Bend)
    const wireGroup = document.getElementById('cap-wire-transform-group');
    const arena = document.getElementById('cap-flick-arena');

    if (arena) {
      arena.classList.remove('hit-light', 'hit-normal', 'hit-max');
      void arena.offsetWidth; // reflow
      arena.classList.add(`hit-${powerLevel}`);
    }

    if (wireGroup) {
      wireGroup.style.transformOrigin = '100px 25px';

      // 기존 진행 중인 애니메이션 정리
      if (wireGroup.currentAnimation) {
        try { wireGroup.currentAnimation.cancel(); } catch (_) {}
        wireGroup.currentAnimation = null;
      }

      // 덜컹거림/바운스 없이, 손가락으로 친 순간 딱 목표 각도로 0.12~0.18초 만에 휙 꺾여 안착!
      const duration = powerLevel === 'light' ? 120 : (powerLevel === 'normal' ? 150 : 180);
      const keyframes = [
        { transform: `rotate(${startAngle}deg)` },
        { transform: `rotate(${this.bendAngle}deg)` }
      ];

      wireGroup.style.setProperty('--fly-angle', `${this.bendAngle}deg`);

      try {
        const anim = wireGroup.animate(keyframes, {
          duration: duration,
          easing: 'cubic-bezier(0.1, 0.95, 0.2, 1)', // 단단하고 절도 있는 금속 꺾임 이징
          fill: 'forwards'
        });
        wireGroup.currentAnimation = anim;
        anim.onfinish = () => {
          wireGroup.style.transform = `rotate(${this.bendAngle}deg)`;
          if (wireGroup.currentAnimation === anim) {
            wireGroup.currentAnimation = null;
          }
        };
      } catch (_) {
        // Web Animations API 비지원 환경 폴백
        wireGroup.style.transform = `rotate(${this.bendAngle}deg)`;
      }
    }

    // 괄호 없이 임팩트 있는 톡, 딱!, 빡! 텍스트 (타격 강도 피드백)
    let hitWord = '';
    let hitClass = '';

    if (powerLevel === 'light') {
      hitWord = '톡';
      hitClass = 'tok';
    } else if (powerLevel === 'normal') {
      hitWord = '딱!';
      hitClass = 'ttak';
    } else {
      hitWord = '빡!';
      hitClass = 'ppak';
    }

    const hitWordEls = document.querySelectorAll('.flick-hit-word');
    hitWordEls.forEach(el => {
      el.textContent = hitWord;
      el.className = `flick-hit-word ${hitClass} show`;
      el.classList.remove('pop-anim');
      void el.offsetWidth;
      el.classList.add('pop-anim');
    });

    clearTimeout(this.hitTextTimeout);
    this.hitTextTimeout = setTimeout(() => {
      hitWordEls.forEach(el => el.classList.remove('show'));
    }, 750);

    // 부러짐 판정 체크 (피로도 한계 도달)
    if (this.currentFatigue >= this.maxFatigue) {
      this.isBroken = true;
      this.showQuestionMark = true;
      this.breakTimestamp = performance.now();
      window.KSool = window.KSool || {};
      window.KSool.lastCapAngle = this.baseAngle;

      if (wireGroup) {
        if (wireGroup.currentAnimation) {
          try { wireGroup.currentAnimation.cancel(); } catch (_) {}
          wireGroup.currentAnimation = null;
        }
        wireGroup.style.transformOrigin = '100px 25px';
        const flyAngle = this.bendAngle || 0;
        wireGroup.style.setProperty('--fly-angle', `${flyAngle}deg`);
        wireGroup.classList.add('broken-fly');
      }

      // 부러진 단면 스텀프는 접점에 그대로 표시
      const stump = document.getElementById('soju-cap-broken-stump');
      if (stump) {
        stump.style.opacity = '1';
      }

      this.hub.sound.playSnap();
      setTimeout(() => this.hub.sound.playExplosion(), 120);
      this.hub.vibratePenalty();

      hitWordEls.forEach(el => {
        el.textContent = '빡!';
        el.className = 'flick-hit-word ppak show pop-anim';
      });

      clearTimeout(this.hitTextTimeout);
      this.hitTextTimeout = setTimeout(() => {
        hitWordEls.forEach(el => el.classList.remove('show'));
      }, 900);

      // 300ms 후 병뚜껑 가운데 ? 버튼 등장 (불필요한 하단 텍스트/버튼 없이 뚜껑에만 표시)
      setTimeout(() => {
        const qBtn = document.getElementById('cap-question-btn');
        if (qBtn) qBtn.classList.add('show');
      }, 300);
    }

    this._updateMeterUI(this.currentPower);
  }

  /**
   * 병뚜껑 가운데 ? 클릭 시 Up & Down 게임으로 매끄럽게 전환
   */
  _goToUpDown() {
    this.hub.sound.playTap();
    if (this.hub.sound.playCurtainReveal) {
      try { this.hub.sound.playCurtainReveal(); } catch (_) {}
    }
    this.hub.vibrateShort();
    this.showQuestionMark = false;
    this.isBroken = false;
    this.hub.playGame('updown');
  }

  _updateMeterUI(power) {
    const cursors = document.querySelectorAll('.flick-meter-cursor');
    const fills = document.querySelectorAll('.flick-meter-fill');
    if (!cursors.length || !fills.length) return;

    const percent = Math.min(100, Math.max(0, power * 100));
    cursors.forEach(cursor => {
      cursor.style.left = `${percent}%`;
    });
    fills.forEach(fill => {
      fill.style.width = `${percent}%`;
      if (percent <= 33) {
        fill.style.background = 'linear-gradient(90deg, #10b981, #22c55e)';
      } else if (percent <= 72) {
        fill.style.background = 'linear-gradient(90deg, #22c55e, #eab308)';
      } else {
        fill.style.background = 'linear-gradient(90deg, #eab308, #ef4444)';
      }
    });
  }

  // =========================================================================
  // 미니멀 렌더링 & 이벤트 바인딩
  // =========================================================================

  _getCapSvg() {
    return `
      <svg class="soju-cap-flick-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- 뚜껑 메탈 그라데이션 -->
          <radialGradient id="cap-metal-grad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="35%" stop-color="#16a34a"/>
            <stop offset="70%" stop-color="#15803d"/>
            <stop offset="100%" stop-color="#052e16"/>
          </radialGradient>
          <linearGradient id="cap-groove-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#86efac"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
          <!-- 알루미늄 철사 그라데이션 -->
          <linearGradient id="wire-silver-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="35%" stop-color="#f8fafc"/>
            <stop offset="70%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <!-- 뚜껑 안쪽 림 그림자 (휴지 가장자리 음영) -->
          <radialGradient id="cap-rim-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="72%" stop-color="rgba(5, 46, 22, 0)"/>
            <stop offset="88%" stop-color="rgba(4, 30, 15, 0.65)"/>
            <stop offset="100%" stop-color="rgba(3, 20, 10, 0.95)"/>
          </radialGradient>
          <!-- 리얼한 휴지 종이 질감 필터 -->
          <filter id="cap-tissue-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" result="noise"/>
            <feDiffuseLighting in="noise" lighting-color="#ffffff" surfaceScale="2.5" result="light">
              <feDistantLight azimuth="45" elevation="55"/>
            </feDiffuseLighting>
            <feComponentTransfer in="light" result="paperShade">
              <feFuncR type="linear" slope="0.88" intercept="0.12"/>
              <feFuncG type="linear" slope="0.88" intercept="0.12"/>
              <feFuncB type="linear" slope="0.88" intercept="0.12"/>
            </feComponentTransfer>
            <feBlend mode="multiply" in="SourceGraphic" in2="paperShade"/>
          </filter>
          <!-- 미세 냅킨 엠보싱 텍스처 오버레이 -->
          <pattern id="cap-napkin-pattern" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
            <circle cx="1.75" cy="1.75" r="0.45" fill="#94a3b8" opacity="0.3"/>
          </pattern>
        </defs>

        <!-- 전체 캡 어셈블리 (최초에만 360도 중 랜덤 각도로 위치가 정해지고, 게임 도중에는 고정됨) -->
        <g id="soju-cap-assembly" style="transform-origin: 100px 100px; transform: rotate(${this.baseAngle || 0}deg);">
          <!-- 1. 초록 메탈 병뚜껑 (화면 정중앙 100, 100 기준) -->
          <g class="soju-cap-main-group">
            <!-- 외곽 주름 톱니 (fluted rim 28개) -->
            <circle cx="100" cy="100" r="76" fill="#14532d"/>
            <circle cx="100" cy="100" r="73" fill="#16a34a" stroke="#86efac" stroke-width="2"/>
            <!-- 캡 돔 본체 -->
            <circle cx="100" cy="100" r="68" fill="url(#cap-metal-grad)" stroke="#22c55e" stroke-width="3"/>
            <!-- 캡 내부 메탈 음각 림 -->
            <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2.5"/>
          </g>

          <!-- 1-1. 병뚜껑 안을 꽉 채운 냅킨 휴지 (숫자 은닉 디테일) -->
          <g class="soju-cap-stuffed-tissue" id="soju-cap-stuffed-tissue">
            <!-- 뚜껑 바닥 깊이감 -->
            <circle cx="100" cy="100" r="53" fill="#042010"/>

            <clipPath id="cap-tissue-clip">
              <path d="M 100 47.5
                       C 118 47, 134 52, 145 65
                       C 153 76, 154 94, 151 109
                       C 148 126, 139 141, 124 149
                       C 108 154, 91 153, 76 148
                       C 59 142, 47 127, 46 109
                       C 45 92, 53 75, 65 63
                       C 76 52, 87 48, 100 47.5 Z"/>
            </clipPath>

            <g clip-path="url(#cap-tissue-clip)">
              <!-- 기본 구겨진 종이 바탕 질감 -->
              <rect x="40" y="40" width="120" height="120" fill="#f8fafc" filter="url(#cap-tissue-filter)"/>
              <rect x="40" y="40" width="120" height="120" fill="url(#cap-napkin-pattern)" mix-blend-mode="multiply"/>

              <!-- 냅킨 겹주름 셰이프들 -->
              <path d="M 48 82 Q 74 54 112 56 Q 142 60 148 82 Q 124 76 88 80 Z" fill="#e2e8f0" opacity="0.75"/>
              <path d="M 148 82 Q 155 116 132 140 Q 118 116 128 92 Z" fill="#cbd5e1" opacity="0.65"/>
              <path d="M 132 140 Q 98 154 66 140 Q 90 124 114 128 Z" fill="#cbd5e1" opacity="0.7"/>
              <path d="M 66 140 Q 44 118 48 84 Q 68 106 78 118 Z" fill="#94a3b8" opacity="0.55"/>

              <!-- 냅킨 뭉침 볼륨 & 엄지 자국 -->
              <path d="M 62 90 Q 94 72 122 84 Q 138 106 122 126 Q 96 134 74 122 Q 58 108 62 90 Z" fill="#f1f5f9" opacity="0.9"/>
              <path d="M 80 88 Q 102 78 118 90 Q 124 108 112 120 Q 92 124 82 112 Q 76 100 80 88 Z" fill="#ffffff" opacity="0.95"/>
              <circle cx="98" cy="100" r="14" fill="#cbd5e1" opacity="0.45"/>
              <path d="M 90 94 Q 98 88 106 95 Q 110 106 102 110 Q 94 110 90 102 Z" fill="#94a3b8" opacity="0.4"/>

              <!-- 리얼한 휴지 구김 골짜기 음영선들 -->
              <path d="M 52 82 Q 76 92 94 92" stroke="#64748b" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.75"/>
              <path d="M 94 92 Q 114 86 144 76" stroke="#64748b" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.75"/>
              <path d="M 94 92 Q 102 108 114 126" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.75"/>
              <path d="M 88 104 Q 74 118 64 126" stroke="#64748b" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.75"/>
              <path d="M 104 96 Q 122 108 136 112" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
              <path d="M 76 96 Q 84 108 86 122" stroke="#64748b" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.7"/>
              <path d="M 112 60 Q 104 74 100 88" stroke="#64748b" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.65"/>

              <!-- 잔주름 디테일 -->
              <path d="M 68 70 Q 78 80 84 82" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.65"/>
              <path d="M 124 66 Q 120 78 126 86" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.65"/>
              <path d="M 134 96 Q 128 104 124 118" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.65"/>
              <path d="M 78 126 Q 88 130 98 136" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.65"/>

              <!-- 반사 하이라이트 능선선 -->
              <path d="M 54 80 Q 76 90 94 90" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <path d="M 94 90 Q 114 84 142 74" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <path d="M 96 94 Q 104 110 116 124" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <path d="M 90 102 Q 76 116 68 124" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" fill="none"/>
              <path d="M 106 94 Q 124 106 134 110" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" fill="none"/>
              <path d="M 80 84 Q 98 76 114 82" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            </g>

            <!-- 뚜껑 안쪽 림 위로 살짝 삐져나온 현실적인 냅킨 귀퉁이 플랩 -->
            <path d="M 136 60 Q 146 53 149 63 Q 142 66 136 60 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"/>
            <path d="M 54 118 Q 46 122 47 114 Q 51 114 54 118 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"/>

            <!-- 뚜껑 벽면 그림자 -->
            <circle cx="100" cy="100" r="53" fill="url(#cap-rim-shadow)" pointer-events="none"/>
            <circle cx="100" cy="100" r="53" fill="none" stroke="rgba(4, 30, 15, 0.85)" stroke-width="2"/>
          </g>

          <!-- 2. 꼬다리가 뜯겨나간 단면 스텀프 (접점 위치에 고정) -->
          <g id="soju-cap-broken-stump" 
             class="soju-cap-broken-stump" 
             style="opacity: ${this.isBroken ? 1 : 0};">
            <path d="M92 33 L108 33 L105 25 L95 25 Z" fill="#15803d" stroke="#86efac" stroke-width="1.5"/>
            <circle cx="100" cy="24" r="2.5" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
          </g>

          <!-- 3. 길고 디테일한 알루미늄 꼬다리 와이어 (회전 중심점: 병뚜껑과의 접점 100px 25px!) -->
          <g id="cap-wire-transform-group" 
             class="${this.isBroken ? 'broken-fly' : ''}" 
             style="transform-origin: 100px 25px; transform: rotate(${this.bendAngle || 0}deg); --fly-angle: ${this.bendAngle || 0}deg;">
            
            <!-- 캡과 이어지는 브래킷 조인트 -->
            <path d="M92 33 L108 33 L105 25 L95 25 Z" fill="#15803d" stroke="#86efac" stroke-width="1.5"/>
            
            <!-- 2배 길어진 꼬다리 와이어 (현실적인 꼬임 알루미늄 스트랩) -->
            <path d="M97 25 
                     C 95 -5, 105 -30, 98 -60 
                     C 93 -85, 106 -110, 100 -135 
                     C 98 -149, 110 -155, 115 -147 
                     C 118 -140, 111 -133, 106 -127
                     C 112 -105, 99 -80, 104 -55
                     C 111 -25, 101 0, 103 25 Z" 
                  fill="url(#wire-silver-grad)" 
                  stroke="#475569" 
                  stroke-width="1.5"
                  filter="drop-shadow(0 6px 12px rgba(0,0,0,0.55))"/>

            <!-- 와이어 하이라이트 반사선 -->
            <path d="M99 20 C 98 -3, 104 -27, 100 -57 C 96 -83, 105 -108, 102 -130" 
                  stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
            
            <!-- 끝부분 비틀림 컬 팁 -->
            <circle cx="112" cy="-148" r="3.5" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
          </g>
        </g>

        <!-- 4. 병뚜껑 가운데 ? 버튼 (꼬다리 끊어지면 등장하는 숫자게임 바로가기) -->
        <g id="cap-question-btn" 
           class="cap-question-btn ${this.showQuestionMark ? 'show' : ''}" 
           role="button" 
           aria-label="Up & Down 숫자 게임으로 이동"
           style="transform-origin: 100px 100px;">
          <!-- 펄스 회전 글로우 헤일로 -->
          <circle cx="100" cy="100" r="42" class="q-pulse-halo"/>
          <!-- 메인 골드 디스크 -->
          <circle cx="100" cy="100" r="32" class="q-main-disc"/>
          <!-- 내부 엠보스 림 -->
          <circle cx="100" cy="100" r="28" class="q-inner-rim"/>
          <!-- ? 텍스트 -->
          <text x="100" y="100" text-anchor="middle" dominant-baseline="central" class="q-mark-char">?</text>
        </g>
      </svg>
    `;
  }

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    const meterHtml = `
      <div class="flick-timing-meter">
        <div class="flick-meter-zones">
          <span class="m-zone green">🟢 톡 (약)</span>
          <span class="m-zone yellow">🟡 딱 (중)</span>
          <span class="m-zone red">🔴 빡! (강)</span>
        </div>
        <div class="flick-meter-track">
          <div class="flick-meter-fill" style="width: 20%;"></div>
          <div class="flick-meter-cursor" style="left: 20%;"></div>
        </div>
      </div>
    `;

    const capSvg = this._getCapSvg();

    container.innerHTML = `
      <div class="party-game-box capflick-minimal-box tabletop-symmetrical">
        <!-- 1. 상단: 대칭 타이밍 파워 게이지 (상대방 플레이어용 180도 회전) -->
        <div class="flick-power-section top-symmetrical">
          ${meterHtml}
        </div>

        <!-- 2. 상단 타격 강도 피드백 (게이지와 뚜껑 사이, 상대 180도 회전, 정중앙 세로줄) -->
        <div class="flick-hit-slot top-symmetrical">
          <div class="flick-hit-word" id="flick-hit-top"></div>
        </div>

        <!-- 3. 메인 인터랙션 아레나 (중앙 초록 병뚜껑 + 2배 길어진 꼬다리 와이어) -->
        <div class="capflick-center-stage" id="cap-flick-arena">
          ${capSvg}
        </div>

        <!-- 4. 하단 타격 강도 피드백 (뚜껑과 게이지 사이, 정방향 0도, 정중앙 세로줄) -->
        <div class="flick-hit-slot bottom-symmetrical">
          <div class="flick-hit-word" id="flick-hit-bottom"></div>
        </div>

        <!-- 5. 하단: 대칭 타이밍 파워 게이지 (내 쪽 플레이어용 정방향) -->
        <div class="flick-power-section bottom-symmetrical">
          ${meterHtml}
        </div>
      </div>
    `;

    this._bindTouchEvents();
  }

  _bindTouchEvents() {
    const stage = document.querySelector('.capflick-minimal-box') || document.getElementById('cap-flick-arena');
    if (!stage) return;

    this._cleanupEvents();

    // 텍스트 선택 및 모바일 롱프레스 '복사하기 / 오려오기' 시스템 팝업 원천 차단
    const preventCallouts = (e) => {
      if (e.cancelable) e.preventDefault();
      return false;
    };
    stage.addEventListener('contextmenu', preventCallouts, { passive: false });
    stage.addEventListener('selectstart', preventCallouts, { passive: false });
    this._preventCallouts = preventCallouts;
    this._currentStage = stage;

    let touchInProgress = false;

    // 포인터/터치 다운 (누르기 시작: 파워 차징 시작 또는 ? 버튼 처리)
    const onStart = (e) => {
      // 터치 이벤트 발생 시 중복 실행 방지
      if (e.type === 'touchstart') {
        touchInProgress = true;
      } else if (e.type === 'pointerdown' && touchInProgress) {
        if (e.pointerType === 'touch') return;
      }

      // 태블릿/모바일 더블탭 줌 및 브라우저 제스처 원천 방지
      if (e.cancelable) e.preventDefault();

      // 1. 병뚜껑 가운데 ? 버튼 클릭 시 Up & Down 화면으로 즉시 전환
      if (e.target && e.target.closest('#cap-question-btn')) {
        e.stopPropagation();
        this._goToUpDown();
        return;
      }

      // 2. ? 버튼이 떠 있는 상태에서 화면의 다른 곳을 터치하면: ? 사라지고 꼬다리 치기 계속 (리셋)
      if (this.showQuestionMark) {
        if (performance.now() - this.breakTimestamp < 350) return;
        e.stopPropagation();
        this.hub.sound.playTap();
        this.reset();
        return;
      }

      // 3. 정상 상태: 파워 차징 시작
      this._startCharging();
    };

    // 포인터/터치 업 (손 떼기: 파워 결정 및 타격)
    const onEnd = (e) => {
      // 상단 탑바(뒤로 버튼 등) 터치는 클릭이 정상 동작하도록 preventDefault/타격 처리를 건너뜀
      if (e.target && e.target.closest && e.target.closest('.party-game-top-bar')) {
        if (e.type === 'touchend' || e.type === 'touchcancel') {
          setTimeout(() => { touchInProgress = false; }, 80);
        }
        return;
      }
      if (e.cancelable) e.preventDefault();

      if (e.type === 'touchend' || e.type === 'touchcancel') {
        setTimeout(() => { touchInProgress = false; }, 80);
      } else if (e.type === 'pointerup' || e.type === 'pointercancel') {
        if (e.pointerType === 'touch' && touchInProgress) return;
      }

      if (this.showQuestionMark) return;
      this._releaseAndFlick();
    };

    // 아이패드/태블릿 사파리 더블탭 확대 방지를 위해 touchstart/touchend에 passive: false + preventDefault 필수 등록
    stage.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: false });
    window.addEventListener('touchcancel', onEnd, { passive: false });

    // PC 마우스 및 스타일러스 펜 대응용 PointerEvents
    stage.addEventListener('pointerdown', onStart, { passive: false });
    window.addEventListener('pointerup', onEnd, { passive: false });
    window.addEventListener('pointercancel', onEnd, { passive: false });

    this._onStartHandler = onStart;
    this._onEndHandler = onEnd;

    // SVG ? 버튼에 직접 클릭 이벤트도 보강
    const qBtn = document.getElementById('cap-question-btn');
    if (qBtn) {
      const handleQ = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        this._goToUpDown();
      };
      qBtn.addEventListener('click', handleQ);
      qBtn.addEventListener('touchend', handleQ, { passive: false });
      this._qBtn = qBtn;
      this._handleQ = handleQ;
    }
  }

  _cleanupEvents() {
    if (this._currentStage) {
      if (this._preventCallouts) {
        this._currentStage.removeEventListener('contextmenu', this._preventCallouts);
        this._currentStage.removeEventListener('selectstart', this._preventCallouts);
      }
      if (this._onStartHandler) {
        this._currentStage.removeEventListener('touchstart', this._onStartHandler);
        this._currentStage.removeEventListener('pointerdown', this._onStartHandler);
      }
    }
    if (this._onEndHandler) {
      window.removeEventListener('touchend', this._onEndHandler);
      window.removeEventListener('touchcancel', this._onEndHandler);
      window.removeEventListener('pointerup', this._onEndHandler);
      window.removeEventListener('pointercancel', this._onEndHandler);
    }
    if (this._qBtn && this._handleQ) {
      this._qBtn.removeEventListener('click', this._handleQ);
      this._qBtn.removeEventListener('touchend', this._handleQ);
      this._qBtn = null;
      this._handleQ = null;
    }
    this._preventCallouts = null;
    this._currentStage = null;
    this._onStartHandler = null;
    this._onEndHandler = null;
  }

  destroy() {
    if (this.animLoopId) {
      cancelAnimationFrame(this.animLoopId);
      this.animLoopId = null;
    }
    if (this.hitTextTimeout) {
      clearTimeout(this.hitTextTimeout);
      this.hitTextTimeout = null;
    }
    this.isCharging = false;
    this.showQuestionMark = false;
    this._cleanupEvents();
  }
}

window.KSool.CapFlickGame = CapFlickGame;
