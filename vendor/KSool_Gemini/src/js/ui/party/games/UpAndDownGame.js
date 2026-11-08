window.KSool = window.KSool || {};

/**
 * ① 소주 뚜껑 숫자 Up & Down (오프라인 술자리 낙장불입 버전)
 * - 상단 영역 박스 제거 -> 큼지막한 두 줄 [10 UP] [40 DOWN] 타이포그래피
 * - 3x4 12칸 스마트폰 다이얼 패드 (0 좌측: 새게임, 우측: 확인)
 * - 키보드 입력 차단 순수 터치 디스플레이
 * - 1~50 고정 (1~100 제거)
 * - 가운데 뚜껑 크기 대폭 확대 및 설명 문구 제거
 * - [낙장불입 규칙]: 범위 밖의 숫자나 범위에 올 수 없는 숫자로 시작하면 즉시 탈락(걸림) 처리!
 */
class UpAndDownGame {
  constructor(hub) {
    this.hub = hub;
    this.maxNumber = 50; // 기본 50 (설정 가능)
    this.secretNumber = 0;
    this.minRange = 1;
    this.maxRange = 50;
    this.lastUpVal = 0;
    this.lastDownVal = 51;
    this.inputVal = '';
    this.isFinished = false;
    this.lastResult = null; // 'UP' | 'DOWN' | 'BOMB'
    this.hasStarted = false; // 첫 guess 제출 여부 (false면 MAX 표시, true면 UP/DOWN 표시)
    this.hasDownUpdated = false; // DOWN 방향이 실제로 갱신되었는지 여부
    this.isEditingMax = false; // MAX 숫자 설정 모드 여부
    this.animatingResult = null; // 화살표 애니메이션 중인 결과 ('UP' | 'DOWN' | null)
    this.animTimer = null;
  }

  init() {
    this.reset();
  }

  reset() {
    clearTimeout(this.animTimer);
    this.secretNumber = Math.floor(Math.random() * this.maxNumber) + 1;
    this.minRange = 1;
    this.maxRange = this.maxNumber;
    this.lastUpVal = 0;
    this.lastDownVal = this.maxNumber + 1;
    this.inputVal = '';
    this.isFinished = false;
    this.lastResult = null;
    this.hasStarted = false; // 초기 상태: 노란색 MAX 표시
    this.hasDownUpdated = false;
    this.isEditingMax = false;
    this.animatingResult = null;
    this.render();
  }

  // =========================================================================
  // 낙장불입 유효성 검사 엔진
  // =========================================================================

  /**
   * 입력된 접두사(prefix)가 현재 유효 범위 [minRange, maxRange] 내의 숫자를 만들 수 있는지 검사
   */
  _canPrefixBeValid(prefix) {
    if (!prefix) return true;
    const n = Number(prefix);
    if (isNaN(n) || n === 0) return false;

    // 1) 입력한 숫자 자체가 이미 [minRange, maxRange] 범위 안에 있는 경우
    if (n >= this.minRange && n <= this.maxRange) {
      return true;
    }

    // 2) 자릿수를 1자리 이상 더 붙여서 범위 내 숫자를 완성할 수 있는지 검사
    let minVal = n;
    let maxVal = n;
    while (minVal <= this.maxRange) {
      minVal = minVal * 10;
      maxVal = maxVal * 10 + 9;
      const low = Math.max(minVal, this.minRange);
      const high = Math.min(maxVal, this.maxRange);
      if (low <= high) {
        return true;
      }
    }

    return false; // 절대 범위 내 숫자를 완성할 수 없음 -> 낙장불입 탈락!
  }

  handleDigitPress(digit) {
    if (digit === null || digit === undefined || !/^\d$/.test(String(digit))) return;
    if (this.isFinished) {
      this.reset();
      return;
    }

    // 1) MAX 숫자 설정 모드인 경우
    if (this.isEditingMax) {
      if (this.inputVal === '' && digit === '0') return; // 첫자리 0 방지
      if (this.inputVal.length >= 3) return; // 최대 3자리 (999)
      this.inputVal = this.inputVal + String(digit);
      this.hub.sound.playTap();
      this.hub.vibrateShort();
      this._updateDisplayOnly();
      return;
    }

    // 2) 일반 게임 숫자 입력 모드인 경우
    const candidate = this.inputVal + String(digit);

    // 낙장불입 검사: 입력한 순간 사이에 올 수 없는 숫자라면 즉시 탈락!
    if (!this._canPrefixBeValid(candidate)) {
      this.inputVal = candidate;
      this._triggerOutOfRangeFail(candidate);
      return;
    }

    this.inputVal = candidate;
    this.hub.sound.playTap();
    this.hub.vibrateShort();
    this._updateDisplayOnly();
  }

  submitGuess() {
    if (this.isFinished) {
      this.reset();
      return;
    }

    // 1) MAX 숫자 설정 모드에서 확인 누른 경우
    if (this.isEditingMax) {
      const newMax = Number(this.inputVal);
      if (newMax >= 2 && newMax <= 999) {
        this.maxNumber = newMax;
      } else {
        this.maxNumber = 50;
      }
      this.secretNumber = Math.floor(Math.random() * this.maxNumber) + 1;
      this.minRange = 1;
      this.maxRange = this.maxNumber;
      this.lastUpVal = 0;
      this.lastDownVal = this.maxNumber + 1;
      this.inputVal = '';
      this.isEditingMax = false; // 확인 후 자동으로 focus out!
      this.hasStarted = false; // 아직 게임 시작 전(MAX 표시 상태 유지)
      this.hub.sound.playTap();
      this.render();
      return;
    }

    // 2) 일반 게임 제출 모드
    if (!this.inputVal) return;

    const val = Number(this.inputVal);

    // 범위 미달/초과인 경우
    if (val < this.minRange || val > this.maxRange) {
      this._triggerOutOfRangeFail(this.inputVal);
      return;
    }

    // 정답 당첨!
    if (val === this.secretNumber) {
      this.isFinished = true;
      this.lastResult = 'BOMB';
      this.hub.sound.playExplosion();
      this.hub.triggerPenalty({
        title: '당첨! 원샷!',
        subtitle: `정답 [ ${this.secretNumber} ]`,
        accentColor: '#10b981',
        icon: '💥'
      });
      this.render();
      return;
    }

    // UP 또는 DOWN 진행 -> 이제 MAX 표시는 사라지고 UP/DOWN 모드로 전환
    this.hasStarted = true;
    const isUp = val < this.secretNumber;

    if (isUp) {
      this.minRange = val + 1;
      this.lastUpVal = val;
      this.lastResult = 'UP';
      this.animatingResult = 'UP';
      this.hub.sound.playUp();
    } else {
      this.maxRange = val - 1;
      this.lastDownVal = val;
      this.hasDownUpdated = true;
      this.lastResult = 'DOWN';
      this.animatingResult = 'DOWN';
      this.hub.sound.playDown();
    }

    this.hub.vibrateShort();
    this.inputVal = '';
    clearTimeout(this.animTimer);

    // 1단계: n UP, n DOWN 자리에 화살표 UP/DOWN 배너를 즉시 표시!
    this.render();
    this._triggerVignetteOnly(this.lastResult);

    // 2단계: 0.75초 후 화살표 배너가 사라지면서 갱신된 n UP, n DOWN 표시로 복귀
    this.animTimer = setTimeout(() => {
      this.animatingResult = null;
      this.render();
    }, 750);
  }

  _triggerVignetteOnly(type) {
    const box = document.querySelector('.updown-box');
    if (!box) return;

    box.querySelectorAll('.updown-flash-vignette').forEach(el => el.remove());

    const isUp = type === 'UP';
    const typeClass = isUp ? 'up' : 'down';

    const vignette = document.createElement('div');
    vignette.className = `updown-flash-vignette ${typeClass}`;
    box.appendChild(vignette);

    setTimeout(() => {
      vignette.remove();
    }, 650);
  }

  _triggerOutOfRangeFail(wrongNum) {
    this.isFinished = true;
    this.lastResult = 'BOMB';
    this.hub.sound.playExplosion();
    this.hub.triggerPenalty({
      title: '탈락! 원샷!',
      subtitle: `[ ${wrongNum} ] 범위 이탈`,
      accentColor: '#ef4444',
      icon: '🚨'
    });
    this.render();
  }

  _updateDisplayOnly() {
    const displays = document.querySelectorAll('.party-number-display');
    displays.forEach(displayEl => {
      if (this.isEditingMax) {
        displayEl.classList.add('editing-max');
      } else {
        displayEl.classList.remove('editing-max');
      }

      if (this.inputVal) {
        displayEl.textContent = this.inputVal;
        displayEl.classList.remove('placeholder');
      } else {
        displayEl.textContent = this.isEditingMax ? 'MAX ?' : '· ·';
        displayEl.classList.add('placeholder');
      }
    });
  }

  // =========================================================================
  // 렌더링 & 이벤트 바인딩
  // =========================================================================

  _renderStationStatus() {
    // 1) 아직 게임 시작 전: 노란색 [maxNumber] MAX 표시
    if (!this.hasStarted) {
      return `
        <div class="updown-status-max ${this.isEditingMax ? 'editing' : ''}">
          <button type="button" class="updown-max-num-btn ${this.isEditingMax ? 'focused' : ''}" title="최대 숫자 변경 (클릭 후 키패드로 입력)">
            ${this.maxNumber}
          </button>
          <span class="max-label">MAX</span>
        </div>
      `;
    }

    // 2) 숫자를 누르고 확인을 눌러 UP/DOWN 판정이 난 직후 (애니메이션 진행 중):
    //    기존 n UP, n DOWN 자리에 큼직한 화살표 UP/DOWN 배너 표시!
    if (this.animatingResult) {
      const isUp = this.animatingResult === 'UP';
      return `
        <div class="updown-status-anim-banner ${isUp ? 'up' : 'down'}">
          <span class="anim-arrow">${isUp ? '▲' : '▼'}</span>
          <span class="anim-text">${isUp ? 'UP' : 'DOWN'}</span>
        </div>
      `;
    }

    // 3) 애니메이션이 끝난 후 또는 게임 진행 중: 갱신된 n UP 및 DOWN / MAX 표시
    const downClass = this.hasDownUpdated ? 'down' : 'max';
    const downNum = this.hasDownUpdated ? this.lastDownVal : this.maxNumber;
    const downLabel = this.hasDownUpdated ? 'DOWN' : 'MAX';

    return `
      <div class="updown-status-grid">
        <div class="updown-status-row up">
          <span class="status-num">${this.lastUpVal}</span>
          <span class="status-label">UP</span>
        </div>
        <div class="updown-status-row ${downClass}">
          <span class="status-num">${downNum}</span>
          <span class="status-label">${downLabel}</span>
        </div>
      </div>
    `;
  }

  _getBottleCapSvg() {
    const isExploded = this.isFinished;

    return `
      <svg class="soju-cap-svg-realistic" viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- 뚜껑 메탈 그라데이션 (CapFlick과 100% 동일한 소주 캡 래커) -->
          <radialGradient id="cap-metal-grad-updown" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="35%" stop-color="#16a34a"/>
            <stop offset="70%" stop-color="#15803d"/>
            <stop offset="100%" stop-color="#052e16"/>
          </radialGradient>
          <radialGradient id="cap-exploded-grad-updown" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#fca5a5"/>
            <stop offset="30%" stop-color="#ef4444"/>
            <stop offset="70%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#450a0a"/>
          </radialGradient>
        </defs>

        <!-- 1. 초록 메탈 병뚜껑 (CapFlick과 1:1 완벽 동일한 정중앙 100, 100 원형) -->
        <g class="soju-cap-main-group">
          <!-- 외곽 주름 톱니 (fluted rim 28개 엣지) -->
          <circle cx="100" cy="100" r="76" fill="#14532d"/>
          <circle cx="100" cy="100" r="73" fill="#16a34a" stroke="#86efac" stroke-width="2"/>
          <!-- 캡 돔 본체 -->
          <circle cx="100" cy="100" r="68" fill="${isExploded ? 'url(#cap-exploded-grad-updown)' : 'url(#cap-metal-grad-updown)'}" stroke="#22c55e" stroke-width="3"/>
          <!-- 캡 내부 메탈 음각 링 2겹 -->
          <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2.5"/>
          <circle cx="100" cy="100" r="38" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
          <circle cx="100" cy="100" r="24" fill="rgba(21,128,61,0.5)" stroke="rgba(134,239,172,0.4)" stroke-width="1.5"/>
        </g>

        <!-- 2. 꼬다리가 뜯겨나간 자국 (CapFlick에서 꼬다리가 뚝 끊어진 브래킷 조인트 스텀프 - lastCapAngle과 1:1 회전 동기화) -->
        <g class="soju-cap-broken-stump" style="transform-origin: 100px 100px; transform: rotate(${window.KSool?.lastCapAngle || 0}deg);">
          <path d="M92 33 L108 33 L105 25 L95 25 Z" fill="#15803d" stroke="#86efac" stroke-width="1.5"/>
          <!-- 끊어진 알루미늄 단면 은색 팁 -->
          <circle cx="100" cy="24" r="2.5" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
        </g>

        <!-- 3. 병뚜껑 중심 숫자 / 물음표 -->
        <g class="soju-cap-center-content">
          <text x="100" y="100" text-anchor="middle" dominant-baseline="central" class="soju-cap-center-num">
            ${this.isFinished ? this.secretNumber : '?'}
          </text>
        </g>
      </svg>
    `;
  }

  _renderStation(isTop = false) {
    const flipClass = isTop ? 'top-station' : 'bottom-station';
    const placeholderText = this.isEditingMax ? 'MAX ?' : '· ·';
    return `
      <div class="updown-player-station ${flipClass}">
        <!-- 1. 병뚜껑 쪽 인접: MAX 또는 UP / DOWN 대칭 표시 (세로 중앙축 맞춤 대형 타이포) -->
        <div class="updown-station-status-slot">
          ${this._renderStationStatus()}
        </div>

        <!-- 2. 입력된 숫자 디스플레이 -->
        <div class="party-number-display ${this.isEditingMax ? 'editing-max' : ''} ${!this.inputVal ? 'placeholder' : ''}">
          ${this.inputVal || placeholderText}
        </div>

        <!-- 3. 3x4 스마트폰 다이얼 패드 -->
        <div class="party-numpad-grid compact">
          <button type="button" class="party-num-key" data-digit="1">1</button>
          <button type="button" class="party-num-key" data-digit="2">2</button>
          <button type="button" class="party-num-key" data-digit="3">3</button>

          <button type="button" class="party-num-key" data-digit="4">4</button>
          <button type="button" class="party-num-key" data-digit="5">5</button>
          <button type="button" class="party-num-key" data-digit="6">6</button>

          <button type="button" class="party-num-key" data-digit="7">7</button>
          <button type="button" class="party-num-key" data-digit="8">8</button>
          <button type="button" class="party-num-key" data-digit="9">9</button>

          <button type="button" class="party-num-key party-key-action btn-updown-restart" title="처음부터 다시">↺</button>
          <button type="button" class="party-num-key" data-digit="0">0</button>
          <button type="button" class="party-num-key party-key-action btn-updown-submit" title="${this.isEditingMax ? 'MAX 설정 완료' : '입력 완료'}">↵</button>
        </div>
      </div>
    `;
  }

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    container.innerHTML = `
      <div class="party-game-box updown-box tabletop-symmetrical">
        <!-- 1. 상단: 상대방 플레이어 스테이션 (180도 회전 대칭) -->
        ${this._renderStation(true)}

        <!-- 2. 중앙: 극사실적 3D 소주 병뚜껑 (CapFlick과 1:1 완벽 동일한 정중앙 위치 및 크기) -->
        <div class="updown-center-cap-wrap">
          <div class="realistic-cap-container ${this.isFinished ? 'exploded' : ''}">
            ${this._getBottleCapSvg()}
          </div>
        </div>

        <!-- 3. 하단: 내 쪽 플레이어 스테이션 (정방향 0도) -->
        ${this._renderStation(false)}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // MAX 숫자 버튼 클릭 -> 편집 모드 진입
    document.querySelectorAll('.updown-max-num-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (this.isFinished || this.hasStarted) return;
        this.isEditingMax = true;
        this.inputVal = '';
        this.hub.sound.playTap();
        this.render();
      };
    });

    document.querySelectorAll('.btn-updown-submit').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.submitGuess();
      };
    });

    document.querySelectorAll('.btn-updown-restart').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.hub.sound.playTap();
        this.reset();
      };
    });

    // 숫자 키만 바인딩 (↺ / ↵ 액션 키도 party-num-key 클래스를 공유하므로 data-digit 보유 키로 한정)
    document.querySelectorAll('.party-num-key[data-digit]').forEach(key => {
      key.onclick = (e) => {
        e.stopPropagation();
        const d = e.currentTarget.getAttribute('data-digit');
        this.handleDigitPress(d);
      };
    });
  }

  destroy() {
    clearTimeout(this.animTimer);
  }
}

window.KSool.UpAndDownGame = UpAndDownGame;
