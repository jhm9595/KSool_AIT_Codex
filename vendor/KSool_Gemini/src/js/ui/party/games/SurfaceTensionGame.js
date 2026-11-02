window.KSool = window.KSool || {};

/**
 * ③ 표면장력 소주잔 채우기 (랜덤 잔 높이 & 미스터리 가림막 서바이벌)
 * - 판마다 잔의 높이와 형태가 무작위로 변경 (롱 텀블러, 소주잔, 온더락, 미니 숏잔)
 * - 초반에는 상단 가림막(Blind Cover)으로 잔의 실제 높이와 입구를 완벽히 은폐!
 * - 90% 수위를 넘겨 손을 떼면 '가림막 오픈!' 사운드와 함께 잔의 진짜 입구가 전격 공개!
 * - [핵심 룰]: 손을 뗐을 때 표면장력 한계를 넘었으면 즉시 탈락(넘침! 원샷!)
 */
class SurfaceTensionGame {
  constructor(hub) {
    this.hub = hub;

    // 4가지 개성적인 잔 프로필 (롱 텀블러 ~ 미니 숏 샷잔)
    this.glassProfiles = [
      { name: '롱 텀블러', type: 'TALL', topY: 45, widthTop: 195, widthBottom: 140 },
      { name: '스탠다드 소주잔', type: 'CLASSIC', topY: 80, widthTop: 220, widthBottom: 150 },
      { name: '와이드 온더락잔', type: 'WIDE', topY: 115, widthTop: 245, widthBottom: 175 },
      { name: '미니 숏 샷잔', type: 'SHORT', topY: 150, widthTop: 210, widthBottom: 145 }
    ];

    this.glassTypeName = '스탠다드 소주잔';
    this.glassType = 'CLASSIC';
    this.glassTopY = 80;
    this.glassBottomY = 340;
    this.glassHeight = 260;
    this.glassWidthTop = 220;
    this.glassWidthBottom = 150;

    this.currentLevel = 15; // 0 ~ 100% (표면장력 돌파 시 100% 초과)
    this.overflowLimit = 100; // 100.0% ~ 105.5% 사이 표면장력 한계치
    this.revealThreshold = 90; // 90% 초과 도달 시 손을 뗐을 때 가림막 해제
    this.isBlindLifted = false;

    this.isPouring = false;
    this.isOverflowed = false;
    this.animId = null;
    this.wavePhase = 0;
    this.pourInterval = null;
    this.heartbeatTimer = null;
    this.toastTimer = null;
  }

  init() {
    this.reset();
  }

  reset() {
    // 1. 잔의 높이와 형태를 무작위로 선택
    const profile = this.glassProfiles[Math.floor(Math.random() * this.glassProfiles.length)];
    this.glassTypeName = profile.name;
    this.glassType = profile.type;
    this.glassTopY = profile.topY;
    this.glassBottomY = 340;
    this.glassHeight = this.glassBottomY - this.glassTopY;
    this.glassWidthTop = profile.widthTop;
    this.glassWidthBottom = profile.widthBottom;

    // 2. 가림막 및 수위 초기화 (12~19% 시작, 90% 넘었을 때 가림막 오픈)
    this.currentLevel = Math.floor(Math.random() * 8) + 12;
    this.overflowLimit = 100 + Math.random() * 5.5; // 100.0% ~ 105.5%
    this.revealThreshold = 90;
    this.isBlindLifted = false;

    this.isPouring = false;
    this.isOverflowed = false;

    if (this.pourInterval) clearInterval(this.pourInterval);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
    if (this.toastTimer) clearTimeout(this.toastTimer);

    this.hub.sound.stopPour();
    this.render();
  }

  startPour() {
    if (this.isOverflowed) {
      this.reset();
      return;
    }

    // 다음 사람이 손을 대고 붓기 시작하면 심장박동 루프 일시 정지
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.isPouring = true;
    this.hub.sound.startPour();
    this.hub.vibrateShort();

    const stageBox = document.getElementById('surface-screen-touch-area');
    if (stageBox) stageBox.classList.add('pouring');

    this.pourInterval = setInterval(() => {
      if (!this.isPouring || this.isOverflowed) return;

      // 가림막 하단 경계 수위 계산 (캔버스 높이 390px 중 상단 52% 가림막: 202.8px)
      const blindBottomY = 390 * 0.52;
      const blindThreshold = ((this.glassBottomY - blindBottomY) / this.glassHeight) * 100;

      // 가림막에 닿기 전에는 약 2배 빠른 속도(0.70), 가림막 영역 진입 후에는 쫄깃한 심리전을 위해 기본 속도(0.35)
      const fillStep = (this.currentLevel < blindThreshold) ? 0.70 : 0.35;
      this.currentLevel += fillStep;
      this.hub.sound.updatePour(this.currentLevel / 100);

      // 무한정 계속 누르고 있어서 표면장력 한계를 10% 이상 극단적으로 초과하면 즉시 폭발 넘침
      if (this.currentLevel >= this.overflowLimit + 10) {
        this.triggerOverflow();
      }
    }, 40);
  }

  liftBlind() {
    this.isBlindLifted = true;
    this.hub.sound.playCurtainReveal();
    this.hub.vibrateShort();

    const blindEl = document.getElementById('surface-blind-cover');
    if (blindEl) blindEl.classList.add('lifted');
  }

  stopPour() {
    if (!this.isPouring) return;
    this.isPouring = false;
    if (this.pourInterval) clearInterval(this.pourInterval);
    this.hub.sound.stopPour();

    const stageBox = document.getElementById('surface-screen-touch-area');
    if (stageBox) stageBox.classList.remove('pouring');

    // [핵심 룰 1]: 손을 뗐을 때 표면장력 한계치를 넘었으면 즉시 탈락(넘침! 원샷!)
    if (this.currentLevel > this.overflowLimit) {
      this.triggerOverflow();
      return;
    }

    // [핵심 룰 2]: 손을 뗐을 때 90% 이상 채웠다면 가림막을 전격 오픈!
    if (this.currentLevel >= this.revealThreshold && !this.isBlindLifted) {
      this.liftBlind();
    }

    // [심장박동 소리 조건]: 손을 뗀 후 위험 수위(85% 이상)에 도달해 있다면
    // 손을 뗀 직후부터 다음 턴까지 긴장감 넘치는 심장박동 사운드가 울림!
    if (this.currentLevel >= 85) {
      this.hub.vibratePenalty(); // 짜릿한 한계 도달 햅틱
      this.hub.sound.playHeartbeat();
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (!this.isPouring && !this.isOverflowed && this.currentLevel >= 85) {
          this.hub.sound.playHeartbeat();
        } else {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = null;
        }
      }, 550);
    } else {
      this.hub.vibrateShort();
    }
  }

  triggerOverflow() {
    this.isOverflowed = true;
    this.isPouring = false;
    if (this.pourInterval) clearInterval(this.pourInterval);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
    this.hub.sound.stopPour();

    // 혹시 가림막이 닫혀 있던 경우에도 결과를 볼 수 있게 즉시 해제
    const blindEl = document.getElementById('surface-blind-cover');
    if (blindEl) blindEl.classList.add('lifted');

    const stageBox = document.getElementById('surface-screen-touch-area');
    if (stageBox) stageBox.classList.remove('pouring');

    this.hub.sound.playExplosion();
    this.hub.triggerPenalty({
      title: '넘침! 원샷!',
      subtitle: `${this.glassTypeName} 표면장력 한계 돌파`,
      accentColor: '#38bdf8',
      icon: '🌊'
    });
  }

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    container.innerHTML = `
      <div class="party-game-box surface-minimal-box" id="surface-screen-touch-area">
        <!-- 화면 정중앙 캔버스 소주잔 (글자/설명 일체 없이 화면 전체가 직관적인 터치 영역) -->
        <div class="glass-canvas-wrap">
          <canvas id="tension-canvas" width="310" height="390"></canvas>

          <!-- 상단 미스터리 잔 높이 가림막 (손을 뗐을 때 90% 이상이면 해제, 딱 자물쇠만 표시) -->
          <div id="surface-blind-cover" class="surface-blind-cover ${this.isBlindLifted ? 'lifted' : ''}">
            <div class="blind-content">
              <span class="blind-icon">🔒</span>
            </div>
            <div class="blind-caution-stripe"></div>
          </div>

          <div class="tension-spill-fx ${this.isOverflowed ? 'active' : ''}"></div>
        </div>
      </div>
    `;

    this._bindEvents();
    this._startCanvasLoop();
  }

  _bindEvents() {
    const stage = document.getElementById('surface-screen-touch-area');
    if (!stage) return;

    const onDown = (e) => {
      e.preventDefault();
      if (this.isOverflowed) {
        this.reset();
        return;
      }
      this.startPour();
    };

    const onUp = (e) => {
      e.preventDefault();
      this.stopPour();
    };

    if (window.PointerEvent) {
      stage.onpointerdown = onDown;
      window.onpointerup = onUp;
      window.onpointercancel = onUp;
    } else {
      stage.ontouchstart = onDown;
      window.ontouchend = onUp;
      window.ontouchcancel = onUp;
      stage.onmousedown = onDown;
      window.onmouseup = onUp;
    }
  }

  _startCanvasLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const canvas = document.getElementById('tension-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const renderFrame = () => {
      this.wavePhase += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const glassTopY = this.glassTopY;
      const glassBottomY = this.glassBottomY;
      const glassHeight = this.glassHeight;
      const glassWidthTop = this.glassWidthTop;
      const glassWidthBottom = this.glassWidthBottom;
      const cx = canvas.width / 2;

      // 1. 유리잔 배경 윤곽 그리기 (랜덤 잔 프로필 반영)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 4;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';

      ctx.beginPath();
      ctx.moveTo(cx - glassWidthTop / 2, glassTopY);
      ctx.lineTo(cx - glassWidthBottom / 2, glassBottomY);
      ctx.lineTo(cx + glassWidthBottom / 2, glassBottomY);
      ctx.lineTo(cx + glassWidthTop / 2, glassTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. 소주 액체 채우기
      const fillRatio = Math.min(1.08, this.currentLevel / 100);
      const currentLiquidY = glassBottomY - glassHeight * Math.min(1, fillRatio);

      ctx.beginPath();
      // 잔 내부 클리핑 마스크
      ctx.moveTo(cx - glassWidthBottom / 2 + 3, glassBottomY - 2);
      ctx.lineTo(cx - glassWidthTop / 2 + 3, glassTopY);
      ctx.lineTo(cx + glassWidthTop / 2 - 3, glassTopY);
      ctx.lineTo(cx + glassWidthBottom / 2 - 3, glassBottomY - 2);
      ctx.closePath();
      ctx.clip();

      // 액체 그라데이션 (청량한 소주빛 에메랄드/하늘색)
      const grad = ctx.createLinearGradient(0, currentLiquidY, 0, glassBottomY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.88)');
      grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.75)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0.9)');
      ctx.fillStyle = grad;

      ctx.beginPath();
      const waveAmp = this.isPouring ? 4.5 : 1.5;

      // 수위 높이에 따른 잔의 너비 선형 보간
      const heightProgress = Math.min(1, Math.max(0, (glassBottomY - currentLiquidY) / glassHeight));
      const currentSpan = glassWidthBottom + (glassWidthTop - glassWidthBottom) * heightProgress;
      const leftX = cx - currentSpan / 2;
      const rightX = cx + currentSpan / 2;

      ctx.moveTo(leftX, glassBottomY);
      // 수면 곡선 (표면장력일 때 볼록해지는 돔 효과)
      const meniscusBulge = fillRatio > 0.94 ? (fillRatio - 0.94) * 75 : 0;

      for (let x = leftX; x <= rightX; x += 5) {
        const norm = (x - cx) / (currentSpan / 2);
        const dome = (1 - norm * norm) * meniscusBulge;
        const wave = Math.sin(this.wavePhase + (x / 20)) * waveAmp;
        const y = currentLiquidY - dome + wave;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(rightX, glassBottomY);
      ctx.closePath();
      ctx.fill();

      // 표면장력 골드 하이라이트 림 (92% 이상 채워졌을 때 금빛 긴장감 발광)
      if (fillRatio > 0.92) {
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        for (let x = leftX; x <= rightX; x += 5) {
          const norm = (x - cx) / (currentSpan / 2);
          const dome = (1 - norm * norm) * meniscusBulge;
          const y = currentLiquidY - dome;
          if (x === leftX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();

      // 3. 유리잔 외곽선 및 바닥 유리 반사광
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - glassWidthTop / 2, glassTopY);
      ctx.lineTo(cx - glassWidthBottom / 2, glassBottomY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + glassWidthTop / 2, glassTopY);
      ctx.lineTo(cx + glassWidthBottom / 2, glassBottomY);
      ctx.stroke();

      // 잔 바닥 두꺼운 유리
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(cx - glassWidthBottom / 2, glassBottomY - 8, glassWidthBottom, 8);

      ctx.restore();

      if (!this.isOverflowed) {
        this.animId = requestAnimationFrame(renderFrame);
      }
    };

    this.animId = requestAnimationFrame(renderFrame);
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.pourInterval) clearInterval(this.pourInterval);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.hub.sound.stopPour();
    this.isPouring = false;
  }
}

window.KSool.SurfaceTensionGame = SurfaceTensionGame;
