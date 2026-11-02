window.KSool = window.KSool || {};

/**
 * ④ 소주병 돌리기 & 손가락 랜덤 지목 (테이블 중앙 거치형)
 * 테이블 한가운데 폰을 눕혀두고 진행하는 진실게임, 흑기사 지목, 러시안룰렛용 도구.
 * - 모드 A: 소주병 돌리기 (손가락 드래그 회전 물리 + 관성 감속)
 * - 모드 B: 손가락 멀티터치 룰렛 (모바일 동시 5인 터치 + PC 마우스 클릭 시뮬레이션 완벽 지원)
 */
class BottleSpinGame {
  constructor(hub) {
    this.hub = hub;
    this.mode = 'bottle'; // 'bottle' | 'finger'

    // --- 소주병 물리 엔진 상태 ---
    this.bottleAngle = 0;
    this.angularVelocity = 0;
    this.friction = 0.982;
    this.isSpinning = false;
    this.animId = null;

    // 드래그 제스처 상태
    this.isDragging = false;
    this.dragStartAngle = 0;
    this.lastTouchAngle = 0;
    this.lastTouchTime = 0;
    this.dragMovedTotal = 0;

    // --- 손가락 룰렛 상태 ---
    // identifier -> { id, x, y, color, isMouse }
    this.touchPoints = new Map();
    this.fingerCountdownTimer = null;
    this.countdownSeconds = 3;
    this.isFingerChoosing = false;
    this.chosenFingerId = null;
    this.colors = ['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  }

  init() {
    this.reset();
  }

  reset() {
    // 소주병 초기화
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isSpinning = false;
    this.isDragging = false;
    this.angularVelocity = 0;

    // 손가락 룰렛 초기화
    if (this.fingerCountdownTimer) {
      clearInterval(this.fingerCountdownTimer);
      this.fingerCountdownTimer = null;
    }
    this.touchPoints.clear();
    this.isFingerChoosing = false;
    this.chosenFingerId = null;
    this.countdownSeconds = 3;

    this.render();
  }

  setMode(m) {
    if (this.mode === m) return;
    this.mode = m;
    this.hub.sound.playTap();
    this.reset();
  }

  // =========================================================================
  // 모드 A: 소주병 돌리기 (손가락 드래그 360도 각속도 물리)
  // =========================================================================

  _startSpinInertia(initialVelocity = null) {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.isSpinning = true;

    if (initialVelocity !== null && Math.abs(initialVelocity) > 2) {
      // 드래그 속도에 비례 (방향 포함: 시계방향 양수, 반시계방향 음수)
      this.angularVelocity = Math.max(-45, Math.min(45, initialVelocity));
    } else {
      // 가벼운 탭인 경우 랜덤 시계방향 강한 회전 (25 ~ 38 deg/frame)
      const dir = Math.random() < 0.5 ? 1 : -1;
      this.angularVelocity = dir * (Math.random() * 15 + 24);
    }

    this.hub.sound.playSpinWhir();
    this.hub.vibrateShort();

    const bottleEl = document.getElementById('soju-spinning-bottle');

    const step = () => {
      this.bottleAngle = (this.bottleAngle + this.angularVelocity) % 360;
      if (this.bottleAngle < 0) this.bottleAngle += 360;

      if (bottleEl) {
        bottleEl.style.transform = `rotate(${this.bottleAngle}deg)`;
      }

      this.angularVelocity *= this.friction;

      if (Math.abs(this.angularVelocity) > 0.18) {
        this.animId = requestAnimationFrame(step);
      } else {
        // 회전 종료: 팝업 없이 가리키는 방향 그대로 자연스럽게 정지
        this.isSpinning = false;
        this.angularVelocity = 0;
        this.hub.vibrateShort();
      }
    };

    this.animId = requestAnimationFrame(step);
  }

  _renderBottleStage(container) {
    container.innerHTML = `
      <div class="bottle-arena-wrapper">
        <!-- 360도 테이블탑 원형 나침반 링 및 소주병 -->
        <div class="bottle-arena" id="bottle-touch-arena">
          <div class="bottle-compass-ring">
            <span class="compass-marker north">▲</span>
            <span class="compass-marker east">▶</span>
            <span class="compass-marker south">▼</span>
            <span class="compass-marker west">◀</span>
          </div>

          <!-- 회전하는 브랜드 무관 초록 소주병 -->
          <div class="soju-bottle-wrapper" id="soju-spinning-bottle" style="transform: rotate(${this.bottleAngle}deg);">
            <svg class="soju-bottle-svg" viewBox="0 0 70 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 병목 & 초록 뚜껑 -->
              <rect x="25" y="4" width="20" height="14" rx="3" fill="#15803D" stroke="#86EFAC" stroke-width="2"/>
              <rect x="27" y="18" width="16" height="4" rx="1" fill="#14532D"/>

              <!-- 초록 소주병 본체 (실감 나는 굴곡 & 입체감) -->
              <path d="M27 22 L27 52 Q27 74 12 96 L12 200 Q12 210 22 210 L48 210 Q58 210 58 200 L58 96 Q43 74 43 52 L43 22 Z" 
                    fill="url(#soju-glass-grad)" stroke="#4ADE80" stroke-width="2.5"/>

              <!-- 병 옆면 유리 반사 하이라이트 -->
              <path d="M16 102 L16 196" stroke="#BBF7D0" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>

              <!-- 브랜드 없는 깔끔한 클래식 소주 라벨 -->
              <rect x="17" y="104" width="36" height="66" rx="4" fill="#FFFFFF" opacity="0.94"/>
              <rect x="19" y="106" width="32" height="62" rx="3" fill="none" stroke="#22C55E" stroke-width="1" opacity="0.7"/>
              <!-- 물방울 심볼 마크 (브랜드 텍스트 없음) -->
              <path d="M35 124 C35 124 27 136 27 143 C27 148 30.5 152 35 152 C39.5 152 43 148 43 143 C43 136 35 124 35 124 Z" 
                    fill="#0EA5E9" opacity="0.85"/>
              <path d="M33 138 C33 138 30 143 30 146 C30 148 31 149 33 149" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>

              <!-- 그라데이션 정의 -->
              <defs>
                <linearGradient id="soju-glass-grad" x1="0" y1="0" x2="70" y2="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#22C55E"/>
                  <stop offset="40%" stop-color="#16A34A"/>
                  <stop offset="80%" stop-color="#15803D"/>
                  <stop offset="100%" stop-color="#052E16"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    `;

    this._bindBottleDragPhysics();
  }

  _bindBottleDragPhysics() {
    const arena = document.getElementById('bottle-touch-arena');
    const bottleEl = document.getElementById('soju-spinning-bottle');
    if (!arena || !bottleEl) return;

    const getCenter = () => {
      const rect = arena.getBoundingClientRect();
      return {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2
      };
    };

    const getAngleFromEvent = (e) => {
      const { cx, cy } = getCenter();
      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const dx = clientX - cx;
      const dy = clientY - cy;
      return Math.atan2(dy, dx) * (180 / Math.PI);
    };

    const onPointerDown = (e) => {
      e.preventDefault();
      if (this.isSpinning) {
        // 이미 돌고 있는 병을 잡으면 정지
        if (this.animId) cancelAnimationFrame(this.animId);
        this.isSpinning = false;
      }

      this.isDragging = true;
      this.dragMovedTotal = 0;
      const angle = getAngleFromEvent(e);
      this.dragStartAngle = angle;
      this.lastTouchAngle = angle;
      this.lastTouchTime = performance.now();
      this.angularVelocity = 0;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();

      const currentAngle = getAngleFromEvent(e);
      let delta = currentAngle - this.lastTouchAngle;

      // -180 ~ +180 도 wrap-around 방어
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const now = performance.now();
      const dt = Math.max(1, now - this.lastTouchTime);

      // 프레임당 각속도 계산 (정규화)
      this.angularVelocity = (delta / dt) * 16.666;

      this.bottleAngle = (this.bottleAngle + delta) % 360;
      if (this.bottleAngle < 0) this.bottleAngle += 360;
      this.dragMovedTotal += Math.abs(delta);

      bottleEl.style.transform = `rotate(${this.bottleAngle}deg)`;

      this.lastTouchAngle = currentAngle;
      this.lastTouchTime = now;
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // 유저가 손을 뗐을 때:
      // 1) 의미 있는 각속도로 회전시키며 뗐다면 그 속도로 관성 회전
      // 2) 거의 움직이지 않고 탭만 했다면 시원하게 랜덤 회전
      if (this.dragMovedTotal > 12 && Math.abs(this.angularVelocity) > 2.2) {
        this._startSpinInertia(this.angularVelocity);
      } else {
        this._startSpinInertia(null);
      }
    };

    // 모바일 터치 + PC 마우스 이벤트 등록 (PointerEvent API)
    if (window.PointerEvent) {
      arena.onpointerdown = onPointerDown;
      window.onpointermove = onPointerMove;
      window.onpointerup = onPointerUp;
      window.onpointercancel = onPointerUp;
    } else {
      arena.ontouchstart = onPointerDown;
      window.ontouchmove = onPointerMove;
      window.ontouchend = onPointerUp;
      window.ontouchcancel = onPointerUp;
      arena.onmousedown = onPointerDown;
      window.onmousemove = onPointerMove;
      window.onmouseup = onPointerUp;
    }
  }

  // =========================================================================
  // 모드 B: 손가락 멀티터치 룰렛 (안정적인 DOM 레이어 + PC 마우스 테스트 완벽 지원)
  // =========================================================================

  _renderFingerStage(container) {
    container.innerHTML = `
      <div class="finger-arena-wrapper">
        <div class="finger-touch-arena" id="finger-multi-arena">
          <!-- 동적 손가락 스팟 렌더링 레이어 (아레나 재성성 없이 스팟만 갱신) -->
          <div id="finger-spots-layer" class="finger-spots-layer"></div>

          <!-- 중앙 안내 및 카운트다운 가이드 -->
          <div class="finger-center-guide" id="finger-center-guide">
            <div class="finger-guide-emoji">🖐️</div>
            <div class="finger-guide-main" id="finger-guide-main">
              참가자 모두 화면에 손가락을 대세요!
            </div>
            <div class="finger-guide-sub" id="finger-guide-sub">
              (2명 이상 동시에 대고 있으면 3초 뒤 당첨자 지목!)
            </div>
            <!-- PC 마우스 전용 룰렛 시작 버튼 -->
            <div id="pc-mouse-controls" class="pc-mouse-controls" style="display:none;">
              <button type="button" class="pc-start-spin-btn" id="btn-pc-start-roulette">
                🎲 룰렛 시작하기 (3초 카운트다운)
              </button>
              <button type="button" class="pc-reset-btn" id="btn-pc-reset-spots">초기화</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindFingerEvents();
    this._updateFingerUI();
  }

  _bindFingerEvents() {
    const arena = document.getElementById('finger-multi-arena');
    if (!arena) return;

    // 모바일 터치 이벤트 (동시 다중 접점 추적)
    arena.ontouchstart = (e) => {
      e.preventDefault();
      if (this.chosenFingerId !== null) {
        this.reset();
        return;
      }

      const rect = arena.getBoundingClientRect();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const color = this.colors[this.touchPoints.size % this.colors.length];
        this.touchPoints.set(String(t.identifier), {
          id: String(t.identifier),
          x: t.clientX - rect.left,
          y: t.clientY - rect.top,
          color,
          isMouse: false
        });
      }

      this.hub.sound.playTap();
      this._updateFingerUI();
      this._checkStartCountdown();
    };

    // 롱프레스 시 모바일 브라우저 돋보기 및 컨텍스트 메뉴 차단
    arena.addEventListener('contextmenu', (e) => {
      if (e.cancelable) e.preventDefault();
      return false;
    }, { passive: false });

    arena.ontouchmove = (e) => {
      e.preventDefault();
      if (this.chosenFingerId !== null) return;
      const rect = arena.getBoundingClientRect();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const id = String(t.identifier);
        if (this.touchPoints.has(id)) {
          const pt = this.touchPoints.get(id);
          pt.x = t.clientX - rect.left;
          pt.y = t.clientY - rect.top;
        }
      }
      this._updateFingerUI();
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      // 지목이 이미 완료된 상태라면, 손가락을 떼도 화면의 당첨 위치 표시를 유지
      if (this.chosenFingerId !== null) {
        return;
      }

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        this.touchPoints.delete(String(t.identifier));
      }

      // 지목 완료 전 손가락을 떼면 카운트다운 취소
      if (this.touchPoints.size < 2 && this.isFingerChoosing && this.chosenFingerId === null) {
        if (this.fingerCountdownTimer) {
          clearInterval(this.fingerCountdownTimer);
          this.fingerCountdownTimer = null;
        }
        this.isFingerChoosing = false;
        this.countdownSeconds = 3;
      }

      this._updateFingerUI();
    };

    arena.ontouchend = handleTouchEnd;
    arena.ontouchcancel = handleTouchEnd;

    // PC 마우스 클릭 시뮬레이션 지원 (마우스 클릭마다 참가자 스팟 추가)
    arena.onmousedown = (e) => {
      // 터치 이벤트 발생 직후의 마우스 에뮬레이션은 무시
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;

      if (this.chosenFingerId !== null) {
        this.reset();
        return;
      }

      const rect = arena.getBoundingClientRect();
      const mockId = 'mouse-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
      const color = this.colors[this.touchPoints.size % this.colors.length];

      this.touchPoints.set(mockId, {
        id: mockId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        color,
        isMouse: true
      });

      this.hub.sound.playTap();
      this._updateFingerUI();
    };

    // PC 룰렛 시작 버튼
    const pcStartBtn = document.getElementById('btn-pc-start-roulette');
    if (pcStartBtn) {
      pcStartBtn.onclick = (e) => {
        e.stopPropagation();
        if (this.touchPoints.size >= 2 && !this.isFingerChoosing) {
          this._startCountdownProcess();
        }
      };
    }

    const pcResetBtn = document.getElementById('btn-pc-reset-spots');
    if (pcResetBtn) {
      pcResetBtn.onclick = (e) => {
        e.stopPropagation();
        this.reset();
      };
    }
  }

  _checkStartCountdown() {
    if (this.touchPoints.size >= 2 && !this.isFingerChoosing && this.chosenFingerId === null) {
      this._startCountdownProcess();
    }
  }

  _startCountdownProcess() {
    this.isFingerChoosing = true;
    this.countdownSeconds = 3;
    this._updateFingerUI();

    if (this.fingerCountdownTimer) clearInterval(this.fingerCountdownTimer);

    this.fingerCountdownTimer = setInterval(() => {
      this.countdownSeconds--;
      this.hub.sound.playTick();
      this.hub.vibrateShort();

      if (this.countdownSeconds <= 0) {
        clearInterval(this.fingerCountdownTimer);
        this.fingerCountdownTimer = null;
        this._pickWinner();
      } else {
        this._updateFingerUI();
      }
    }, 1000);
  }

  _pickWinner() {
    const ids = Array.from(this.touchPoints.keys());
    if (ids.length === 0) {
      this.reset();
      return;
    }

    const winnerIdx = Math.floor(Math.random() * ids.length);
    this.chosenFingerId = ids[winnerIdx];
    this.isFingerChoosing = false;

    this.hub.sound.playExplosion();
    if (typeof this.hub.vibratePenalty === 'function') {
      this.hub.vibratePenalty();
    } else {
      this.hub.vibrateShort();
    }

    // 화면 전체를 덮는 팝업 대신 집었던 위치에 직접 대형 당첨 이펙트 표시!
    this._updateFingerUI();
  }

  _updateFingerUI() {
    const spotsLayer = document.getElementById('finger-spots-layer');
    const guideMain = document.getElementById('finger-guide-main');
    const guideSub = document.getElementById('finger-guide-sub');
    const pcControls = document.getElementById('pc-mouse-controls');
    if (!spotsLayer) return;

    // 1. 스팟 DOM 동적 렌더링 (아레나 재생성 없이 내부만 패치)
    let spotsHtml = '';
    this.touchPoints.forEach((pt, id) => {
      const isWinner = this.chosenFingerId === id;
      const isSafe = this.chosenFingerId !== null && !isWinner;
      const isNearTop = pt.y < 85;

      if (isWinner) {
        spotsHtml += `
          <div class="finger-touch-spot target-winner" 
               style="left:${pt.x}px; top:${pt.y}px;">
            <div class="target-shockwave"></div>
            <div class="target-shockwave delay"></div>
            <div class="finger-inner-ripple winner"></div>
            <div class="target-center-crosshair">🎯</div>
            <div class="target-pointer-badge ${isNearTop ? 'below' : 'above'}">
              <span class="badge-arrow">${isNearTop ? '👆' : '👇'}</span>
              <span class="badge-text">당첨! 원샷!</span>
            </div>
          </div>
        `;
      } else if (isSafe) {
        spotsHtml += `
          <div class="finger-touch-spot target-safe" 
               style="left:${pt.x}px; top:${pt.y}px; border-color:${pt.color};">
            <div class="finger-inner-ripple" style="background:${pt.color};"></div>
            <div class="target-safe-badge">✓ 통과</div>
          </div>
        `;
      } else {
        // 일반 상태 (대기 중 또는 카운트다운 중)
        spotsHtml += `
          <div class="finger-touch-spot" 
               style="left:${pt.x}px; top:${pt.y}px; border-color:${pt.color};">
            <div class="finger-outer-halo" style="border-color:${pt.color};"></div>
            <div class="finger-inner-ripple" style="background:${pt.color};"></div>
          </div>
        `;
      }
    });
    spotsLayer.innerHTML = spotsHtml;

    // 2. 가이드 메시지 갱신
    const count = this.touchPoints.size;
    const hasMouse = Array.from(this.touchPoints.values()).some(p => p.isMouse);

    if (this.chosenFingerId !== null) {
      if (guideMain) guideMain.innerHTML = '🎯 <b style="color: #f87171;">벌칙자 지목 완료!</b>';
      if (guideSub) guideSub.innerHTML = '🎯 <b>표시된 위치</b>의 플레이어가 벌칙주 당첨! <br><span style="color:#94a3b8; font-size:0.8rem;">(화면을 아무 곳이나 터치하면 다시 시작)</span>';
      if (pcControls) pcControls.style.display = 'none';
    } else if (this.isFingerChoosing) {
      if (guideMain) guideMain.innerHTML = `<span class="countdown-highlight">⏳ ${this.countdownSeconds}초 뒤 지목!</span>`;
      if (guideSub) guideSub.textContent = '손가락을 떼지 마세요!';
      if (pcControls) pcControls.style.display = 'none';
    } else if (count >= 2) {
      if (guideMain) guideMain.innerHTML = `🖐️ <b>${count}명 참가 중!</b>`;
      if (guideSub) guideSub.textContent = hasMouse ? '아래 [룰렛 시작하기]를 누르세요!' : '3초 카운트다운 시작!';
      if (pcControls && hasMouse) pcControls.style.display = 'flex';
    } else {
      if (guideMain) guideMain.innerHTML = '참가자 모두 화면에 손가락을 대세요!';
      if (guideSub) guideSub.innerHTML = `(현재 <b>${count}명</b> 대기 중 · 2명 이상 필요)`;
      if (pcControls) pcControls.style.display = 'none';
    }
  }

  // =========================================================================
  // 공통 렌더 및 클린업
  // =========================================================================

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    container.innerHTML = `
      <div class="party-game-box bottle-box">
        <!-- 상단 모드 전환 탭 (소주병 돌리기 <-> 손가락 룰렛) -->
        <div class="bottle-mode-tabs">
          <button type="button" class="bottle-tab-pill ${this.mode === 'bottle' ? 'active' : ''}" data-mode="bottle">
            🍾 소주병 돌리기
          </button>
          <button type="button" class="bottle-tab-pill ${this.mode === 'finger' ? 'active' : ''}" data-mode="finger">
            🖐️ 손가락 룰렛 지목
          </button>
        </div>

        <!-- 서브스테이지 (소주병 or 손가락 룰렛) -->
        <div id="bottle-game-substage" class="bottle-substage"></div>
      </div>
    `;

    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.onclick = (e) => {
        this.setMode(e.currentTarget.getAttribute('data-mode'));
      };
    });

    const substage = document.getElementById('bottle-game-substage');
    if (substage) {
      if (this.mode === 'bottle') {
        this._renderBottleStage(substage);
      } else {
        this._renderFingerStage(substage);
      }
    }
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.fingerCountdownTimer) {
      clearInterval(this.fingerCountdownTimer);
      this.fingerCountdownTimer = null;
    }
    this.isSpinning = false;
    this.isDragging = false;
  }
}

window.KSool.BottleSpinGame = BottleSpinGame;
