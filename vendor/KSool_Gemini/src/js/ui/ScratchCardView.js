/**
 * ScratchCardView - Interactive Lottery Scratch Card Component
 *
 * Renders an interactive metallic scratch layer over a hidden text.
 * Players can scratch with mouse or touch, or tap quick-reveal.
 */
(function() {
  window.KSool = window.KSool || {};

  class ScratchCardView {
    constructor(options = {}) {
      this.containerId = options.containerId || 'hint-desc-card';
      this.secretText = options.secretText || '';
      this.onComplete = options.onComplete || (() => {});
      this.audio = options.audio || null;
      this.isCompleted = false;
      this.canvas = null;
      this.ctx = null;
      this.isDrawing = false;
      this.lastPoint = null;
      this.moveCount = 0;
      this.scratchRatioThreshold = options.threshold || 0.80; // 80% 이상 충분히 긁었을 때 자동 공개
    }

    /**
     * 기존 카드 요소(#hint-desc-card) 내부의 캔버스를 초기화 (크기 불일치 없는 완벽한 일체형)
     */
    init(cardEl) {
      if (!cardEl) return;
      this.isCompleted = false;
      this.canvas = cardEl.querySelector('.scratch-overlay-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      requestAnimationFrame(() => {
        this._initCanvas(cardEl);
        this._bindPointerEvents();
      });
    }

    /**
     * 레거시 부모 요소 마운트 지원
     */
    render(parentEl) {
      if (!parentEl) return;
      this.isCompleted = false;

      if (parentEl.classList?.contains('hint-desc-card') || parentEl.querySelector('.scratch-overlay-canvas')) {
        const card = parentEl.classList?.contains('hint-desc-card') ? parentEl : (parentEl.querySelector('.hint-desc-card') || parentEl);
        this.init(card);
        return;
      }

      parentEl.innerHTML = `
        <div class="hint-desc-card" id="${this.containerId}">
          <div class="hint-desc-underlayer">
            <span class="hint-bulb">💡</span>
            <span class="hint-desc-text">${this.secretText}</span>
          </div>
          <canvas class="scratch-overlay-canvas"></canvas>
        </div>
      `;

      const box = parentEl.querySelector('.hint-desc-card') || parentEl;
      this.init(box);
    }

    _initCanvas(box) {
      if (!this.canvas || !box) return;
      const rect = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(Math.floor(box.clientWidth || rect.width || 280), 200);
      const height = Math.max(Math.floor(box.clientHeight || rect.height || 54), 48);

      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';

      const ctx = this.ctx;
      ctx.scale(dpr, dpr);

      // 고급 실버 복권 그라데이션 코팅 (pre-scratch 은박지와 동일한 메탈릭 실버)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#475569');
      grad.addColorStop(0.3, '#94a3b8');
      grad.addColorStop(0.5, '#cbd5e1');
      grad.addColorStop(0.7, '#94a3b8');
      grad.addColorStop(1, '#334155');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 미세 펄 & 별빛 스크래치 패턴
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      for (let i = 0; i < 45; i++) {
        const x = (Math.sin(i * 99) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 77) * 0.5 + 0.5) * height;
        const r = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 테두리 스티치 라인 (pre-scratch 은박지와 동일한 3px 내부 점선)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(3, 3, width - 6, height - 6);
      ctx.setLineDash([]);

      // 스크래치 안내 문구 및 동전 아이콘
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪙 손가락이나 마우스로 긁어보세요!', width / 2, height / 2);
    }

    _bindPointerEvents() {
      if (!this.canvas) return;

      const getPoint = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      };

      const startScratch = (e) => {
        if (this.isCompleted) return;
        this.isDrawing = true;
        this.canvas.setPointerCapture?.(e.pointerId);
        this.lastPoint = getPoint(e);
        this._scratchCircle(this.lastPoint.x, this.lastPoint.y);
      };

      const moveScratch = (e) => {
        if (!this.isDrawing || this.isCompleted) return;
        const pt = getPoint(e);
        this._scratchLine(this.lastPoint, pt);
        this.lastPoint = pt;

        this.moveCount++;
        const nowTs = performance.now();
        if (!this._lastScratchSound || nowTs - this._lastScratchSound > 60) {
          this._lastScratchSound = nowTs;
          if (this.audio?.playScratch) this.audio.playScratch(1);
          else this.audio?.playTap?.();
        }
        if (this.moveCount % 10 === 0) {
          this._checkProgress();
        }
      };

      const stopScratch = (e) => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.canvas.releasePointerCapture?.(e.pointerId);
        this._checkProgress();
      };

      this.canvas.onpointerdown = startScratch;
      this.canvas.onpointermove = moveScratch;
      this.canvas.onpointerup = stopScratch;
      this.canvas.onpointercancel = stopScratch;
    }

    _scratchCircle(x, y) {
      if (!this.ctx) return;
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 14, 0, Math.PI * 2);
      this.ctx.fill();
    }

    _scratchLine(p1, p2) {
      if (!this.ctx || !p1 || !p2) return;
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = 26;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    }

    _checkProgress() {
      if (this.isCompleted || !this.ctx || !this.canvas) return;
      const w = this.canvas.width;
      const h = this.canvas.height;
      if (w === 0 || h === 0) return;

      // 16픽셀 간격 샘플링으로 초고속 진행도 계산
      const imgData = this.ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      let transparent = 0;
      let total = 0;

      for (let i = 3; i < data.length; i += 4 * 16) {
        total++;
        if (data[i] < 128) {
          transparent++;
        }
      }

      const ratio = transparent / total;
      if (ratio >= this.scratchRatioThreshold) {
        this.revealAll();
      }
    }

    revealAll() {
      if (this.isCompleted) return;
      this.isCompleted = true;

      if (this.canvas) {
        // 은박지가 서서히 옅어지며 뒤쪽 설명이 투명하게 드러나는 페이드아웃 애니메이션
        this.canvas.style.transition = 'opacity 0.65s cubic-bezier(0.25, 0.1, 0.25, 1)';
        this.canvas.style.opacity = '0';
        this.canvas.style.pointerEvents = 'none';
        setTimeout(() => {
          if (this.canvas && this.canvas.parentElement) {
            this.canvas.remove();
          }
        }, 680);
      }

      if (this.audio?.playScratch) this.audio.playScratch(1.6);
      else this.audio?.playTap?.();
      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }
  }

  window.KSool.ScratchCardView = ScratchCardView;
})();
