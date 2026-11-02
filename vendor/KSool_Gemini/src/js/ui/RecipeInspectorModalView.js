window.KSool = window.KSool || {};

/**
 * RecipeInspectorModalView
 * - 추천 조합의 선행 의존성, 최소 안전 번호(minSafeNumber), 난이도/Step 분석 시각화
 * - 타겟 번호 지정 및 자동 번호 밀림(Auto Shift) 시뮬레이션
 * - 16x16 레트로 도트/32x32 HD 아이콘 실시간 프리뷰 및 SVG 에디터
 * - 미니게임 3종(벽돌깨기, 땅따먹기, 네모네모로직) 실루엣 및 단서 실시간 캔버스 렌더링 & 검증
 */
class RecipeInspectorModalView {
  constructor({ recipeBook, inventoryManager, suggestionService, brandResolver, audio, onRecipePromoted }) {
    this.recipeBook = recipeBook;
    this.inventory = inventoryManager;
    this.suggestionService = suggestionService;
    this.brandResolver = brandResolver;
    this.audio = audio;
    this.onRecipePromoted = onRecipePromoted;

    this.currentSuggestion = null;
    this.analysis = null;
    this.activeTab = 'analysis'; // 'analysis' | 'icon'
    this.currentDotSvg = '';
    this.currentTargetNumber = 1;
    this.currentRecipeName = '';

    this.modalEl = document.getElementById('recipe-inspector-modal');
    this.contentEl = document.getElementById('recipe-inspector-content');

    this._debounceTimer = null;
  }

  open(suggestion) {
    if (!suggestion || !suggestion.items) return;
    this.currentSuggestion = suggestion;
    this.activeTab = 'analysis';

    this.analysis = window.KSool.RecipeAnalysisIntegrator.analyzeCandidate(
      suggestion,
      this.recipeBook,
      this.brandResolver
    );

    this.currentTargetNumber = this.analysis.suggestedTargetNumber;
    this.currentRecipeName = this.analysis.defaultRecipeName;

    // 초기 도트 SVG 생성
    this.currentDotSvg = window.KSool.RecipeAnalysisIntegrator.generateDefaultDotSvg(
      this.analysis.candidateItems
    );

    this.render();

    if (this.modalEl) {
      this.modalEl.classList.add('active');
    }
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
    }
    if (this.contentEl) {
      this.contentEl.innerHTML = '';
    }
    this.currentSuggestion = null;
    this.analysis = null;
  }

  render() {
    if (!this.contentEl || !this.currentSuggestion || !this.analysis) return;

    const sug = this.currentSuggestion;
    const an = this.analysis;

    // 슬롯 칩 렌더링
    const slotsHtml = an.candidateItems.map(it => {
      const detailBadge = it.isDetail ? `<span class="slot-detail-tag">특산</span>` : '';
      const countBadge = it.ratio > 1 ? `<span class="slot-count-badge">${it.ratio}</span>` : '';
      return `
        <div class="pot-slot filled sug-slot-card insp-slot-card">
          ${detailBadge}
          <span class="slot-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(it.target || it, 24) : it.emoji}</span>
          <span class="slot-name">${it.name}</span>
          ${countBadge}
        </div>
      `;
    }).join('');

    this.contentEl.innerHTML = `
      <div class="modal-header insp-modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.3rem;">🔬</span>
          <div>
            <h3 class="modal-title" style="margin:0; font-size:1rem; font-weight:900;">레시피 분석 & 아이콘 검증기</h3>
            <span style="font-size:0.72rem; color:#94a3b8;">신규 조합 무결성 검증, 자동 번호 밀림, 3종 미니게임 실루엣 실시간 프리뷰</span>
          </div>
        </div>
        <button class="modal-close-btn" id="insp-close-btn">&times;</button>
      </div>

      <div class="insp-top-summary">
        <div class="insp-slots-row">${slotsHtml}</div>
        <div class="insp-votes-badge">
          <span>👍 ${sug.upvotes}</span>
          <span style="opacity:0.6;">👎 ${sug.downvotes}</span>
        </div>
      </div>

      <div class="insp-tab-nav">
        <button class="insp-tab-btn ${this.activeTab === 'analysis' ? 'active' : ''}" data-tab="analysis">
          📊 1. 선행조건 & 넘버링 분석
        </button>
        <button class="insp-tab-btn ${this.activeTab === 'icon' ? 'active' : ''}" data-tab="icon">
          🎨 2. 아이콘 & 3종 미니게임 실루엣 검증
        </button>
      </div>

      <div class="insp-tab-content">
        ${this.activeTab === 'analysis' ? this._renderAnalysisTab() : this._renderIconTab()}
      </div>

      <div class="insp-action-footer">
        <button class="insp-btn-cancel" id="insp-cancel-btn">닫기</button>
        <button class="insp-btn-promote" id="insp-promote-btn">
          🚀 정식 도감에 스마트 등록 (자동 번호 밀림 실행)
        </button>
      </div>
    `;

    this._bindEvents();

    if (this.activeTab === 'icon') {
      this._renderIconAndMinigameCanvases();
    }
  }

  _renderAnalysisTab() {
    const an = this.analysis;
    const diffColorMap = {
      EASY: '#10b981',
      NORMAL: '#38bdf8',
      HARD: '#f59e0b',
      MASTER: '#ec4899'
    };

    const diffColor = diffColorMap[an.difficulty] || '#38bdf8';
    const shiftCount = Math.max(0, an.totalRecipes - this.currentTargetNumber + 1);

    const itemsRowsHtml = an.candidateItems.map(it => {
      const typeBadge = it.isNewIngredient
        ? `<span class="insp-tag new">⚠️ 미등록 신규</span>`
        : (it.isLeaf ? `<span class="insp-tag leaf">기초 재료</span>` : `<span class="insp-tag combo">조합 산출물</span>`);

      const statusBadge = this.currentTargetNumber >= it.minRequiredNumber
        ? `<span class="insp-status-badge ok">✅ 충족 (No.${it.minRequiredNumber}↑)</span>`
        : `<span class="insp-status-badge warn">❌ 불가 (No.${it.minRequiredNumber} 필요)</span>`;

      return `
        <div class="insp-item-row">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-flex; align-items:center;">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(it.target || it, 22) : it.emoji}</span>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:0.8rem; font-weight:800; color:#f8fafc;">${it.name} (${it.ratio}개)</span>
              <span style="font-size:0.7rem; color:#94a3b8;">${it.reason}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            ${typeBadge}
            ${statusBadge}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="insp-analysis-wrap">
        <!-- 핵심 지표 카드 -->
        <div class="insp-metric-grid">
          <div class="insp-metric-card">
            <span class="insp-metric-label">최소 안전 번호</span>
            <span class="insp-metric-value" style="color:#f59e0b;">No.${String(an.minSafeNumber).padStart(2, '0')}</span>
            <span class="insp-metric-sub">이 번호 이전 배치 불가</span>
          </div>
          <div class="insp-metric-card">
            <span class="insp-metric-label">판정 난이도</span>
            <span class="insp-metric-value" style="color:${diffColor};">${an.difficulty}</span>
            <span class="insp-metric-sub">비율 합 ${an.sumRatio} (최대 ${an.maxRatio})</span>
          </div>
          <div class="insp-metric-card">
            <span class="insp-metric-label">권장 Step</span>
            <span class="insp-metric-value" style="color:#a855f7;">STEP ${an.recommendedStep}</span>
            <span class="insp-metric-sub">${an.stepConfig?.title || '성장 단계'}</span>
          </div>
          <div class="insp-metric-card">
            <span class="insp-metric-label">현재 총 레시피</span>
            <span class="insp-metric-value" style="color:#38bdf8;">${an.totalRecipes}개</span>
            <span class="insp-metric-sub">등록 시 ${an.totalRecipes + 1}개로 확장</span>
          </div>
        </div>

        <!-- 병목 제약 안내 -->
        <div class="insp-callout-box">
          <span style="font-size:0.9rem;">💡</span>
          <div style="font-size:0.75rem; color:#e2e8f0; line-height:1.4;">
            <strong>선행 조건 분석:</strong>
            ${an.bottleneckItem
              ? `[<strong>${an.bottleneckItem.name}</strong>]의 선행 해금 조건에 따라, 이 조합은 반드시 <strong>No.${String(an.minSafeNumber).padStart(2, '0')}</strong> 이후에만 배치되어야 유저 플레이 흐름이 끊기지 않습니다.`
              : '모든 재료가 기초 재료이므로 즉시 배치가 가능합니다.'}
          </div>
        </div>

        <!-- 재료별 선행 조건 리스트 -->
        <div class="insp-section-title">재료별 해금 선행조건 상세</div>
        <div class="insp-items-list">${itemsRowsHtml}</div>

        <!-- 스마트 번호 밀림 설정 -->
        <div class="insp-section-title">스마트 자동 넘버링 및 번호 밀림(Auto Shift) 설정</div>
        <div class="insp-config-box">
          <div class="insp-input-row">
            <label for="insp-recipe-name-input">공식 도감 표시 명칭:</label>
            <input type="text" id="insp-recipe-name-input" class="insp-text-input" value="${this.currentRecipeName}" placeholder="예: 레몬소사 칵테일">
          </div>

          <div class="insp-input-row">
            <label for="insp-target-num-input">배정 대상 번호:</label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="insp-target-num-input" class="insp-number-input"
                     min="${an.minSafeNumber}" max="${an.totalRecipes + 1}" value="${this.currentTargetNumber}">
              <span style="font-size:0.78rem; font-weight:800; color:#38bdf8;">
                (권장: No.${String(an.suggestedTargetNumber).padStart(2, '0')})
              </span>
            </div>
          </div>

          <div class="insp-shift-info" id="insp-shift-info-box">
            ⚡ <strong>No.${String(this.currentTargetNumber).padStart(2, '0')}</strong> 번에 삽입 시,
            기존 <strong>No.${String(this.currentTargetNumber).padStart(2, '0')} ~ No.${String(an.totalRecipes).padStart(2, '0')}</strong>
            (총 <strong>${shiftCount}</strong>개) 레시피가 뒤로 1칸씩 자동 이동합니다.
          </div>
        </div>
      </div>
    `;
  }

  _renderIconTab() {
    return `
      <div class="insp-icon-wrap">
        <!-- 상단: 16x16 도트 뷰 & SVG 에디터 -->
        <div class="insp-icon-editor-row">
          <div class="insp-icon-preview-box">
            <span class="insp-preview-label">16x16 도트 캔버스 (8x 확대)</span>
            <div class="insp-canvas-board">
              <canvas id="insp-dot-canvas" width="128" height="128" class="insp-canvas-pixelated"></canvas>
            </div>
            <button class="insp-btn-gen" id="insp-btn-auto-dot">
              🎲 재료 기반 도트 자동 생성
            </button>
          </div>

          <div class="insp-svg-editor-box">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="insp-preview-label">SVG innerSvg 태그 편집기 (16x16)</span>
              <span style="font-size:0.7rem; color:#64748b;">수정 즉시 실시간 렌더링</span>
            </div>
            <textarea id="insp-svg-textarea" class="insp-svg-code" spellcheck="false">${this.currentDotSvg}</textarea>
          </div>
        </div>

        <!-- 하단: 미니게임 3종 실시간 검증 프리뷰 -->
        <div class="insp-section-title" style="margin-top:10px;">미니게임 3종 실시간 실루엣 & 단서 검증 (Live Validation)</div>
        <div class="insp-minigame-previews">
          <!-- 1. 벽돌깨기 -->
          <div class="insp-mg-card">
            <div class="insp-mg-header">
              <span>🧱 벽돌깨기 레이아웃</span>
              <span class="insp-mg-tag" id="insp-tag-breakout">연산 중...</span>
            </div>
            <div class="insp-mg-canvas-wrap">
              <canvas id="insp-mg-breakout-canvas" width="200" height="140"></canvas>
            </div>
            <div class="insp-mg-desc">16x16 그리드 기준 블록 배치 및 강철 범퍼 위치</div>
          </div>

          <!-- 2. 땅따먹기 -->
          <div class="insp-mg-card">
            <div class="insp-mg-header">
              <span>⚡ 땅따먹기 네온 외곽선</span>
              <span class="insp-mg-tag" id="insp-tag-territory">연산 중...</span>
            </div>
            <div class="insp-mg-canvas-wrap">
              <canvas id="insp-mg-territory-canvas" width="200" height="140"></canvas>
            </div>
            <div class="insp-mg-desc">1셀 팽창 마스크 및 네온 실루엣 엣지 세그먼트</div>
          </div>

          <!-- 3. 네모네모 로직 -->
          <div class="insp-mg-card">
            <div class="insp-mg-header">
              <span>🧩 네모네모 로직 단서</span>
              <span class="insp-mg-tag" id="insp-tag-nonogram">연산 중...</span>
            </div>
            <div class="insp-mg-canvas-wrap">
              <canvas id="insp-mg-nonogram-canvas" width="200" height="140"></canvas>
            </div>
            <div class="insp-mg-desc">도트 바운딩 박스 크롭 및 행/열 런렝스 숫자 단서</div>
          </div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const closeBtn = this.contentEl.querySelector('#insp-close-btn');
    if (closeBtn) closeBtn.onclick = () => this.close();

    const cancelBtn = this.contentEl.querySelector('#insp-cancel-btn');
    if (cancelBtn) cancelBtn.onclick = () => this.close();

    // 탭 전환
    this.contentEl.querySelectorAll('.insp-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.audio.playTap();
        this.render();
      };
    });

    // 탭 1 인풋 이벤트
    const nameInput = this.contentEl.querySelector('#insp-recipe-name-input');
    if (nameInput) {
      nameInput.oninput = (e) => {
        this.currentRecipeName = e.target.value;
      };
    }

    const numInput = this.contentEl.querySelector('#insp-target-num-input');
    if (numInput) {
      numInput.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          this.currentTargetNumber = Math.max(this.analysis.minSafeNumber, val);
          const shiftBox = this.contentEl.querySelector('#insp-shift-info-box');
          if (shiftBox) {
            const shiftCount = Math.max(0, this.analysis.totalRecipes - this.currentTargetNumber + 1);
            shiftBox.innerHTML = `
              ⚡ <strong>No.${String(this.currentTargetNumber).padStart(2, '0')}</strong> 번에 삽입 시,
              기존 <strong>No.${String(this.currentTargetNumber).padStart(2, '0')} ~ No.${String(this.analysis.totalRecipes).padStart(2, '0')}</strong>
              (총 <strong>${shiftCount}</strong>개) 레시피가 뒤로 1칸씩 자동 이동합니다.
            `;
          }
        }
      };
    }

    // 탭 2 SVG 편집 & 자동 생성 이벤트
    const autoDotBtn = this.contentEl.querySelector('#insp-btn-auto-dot');
    if (autoDotBtn) {
      autoDotBtn.onclick = () => {
        this.currentDotSvg = window.KSool.RecipeAnalysisIntegrator.generateDefaultDotSvg(
          this.analysis.candidateItems
        );
        const ta = this.contentEl.querySelector('#insp-svg-textarea');
        if (ta) ta.value = this.currentDotSvg;
        this.audio.playTap();
        this._renderIconAndMinigameCanvases();
      };
    }

    const svgTextarea = this.contentEl.querySelector('#insp-svg-textarea');
    if (svgTextarea) {
      svgTextarea.oninput = (e) => {
        this.currentDotSvg = e.target.value;
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this._renderIconAndMinigameCanvases();
        }, 80);
      };
    }

    // 등록 버튼 이벤트
    const promoteBtn = this.contentEl.querySelector('#insp-promote-btn');
    if (promoteBtn) {
      promoteBtn.onclick = () => {
        this._executePromotion();
      };
    }
  }

  _renderIconAndMinigameCanvases() {
    const dotInfo = window.KSool.RecipeAnalysisIntegrator.parseDotSvg(this.currentDotSvg);

    // 1. 도트 캔버스 (128x128 확대 렌더링)
    const dotCanvas = this.contentEl.querySelector('#insp-dot-canvas');
    if (dotCanvas) {
      const ctx = dotCanvas.getContext('2d');
      ctx.clearRect(0, 0, 128, 128);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 128, 128);

      const cell = 128 / 16; // 8px
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
          const color = dotInfo.grid[r][c];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(c * cell, r * cell, cell, cell);
          } else {
            // 은은한 그리드 점
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(c * cell + 3, r * cell + 3, 2, 2);
          }
        }
      }
    }

    // 2. 미니게임 1: 벽돌깨기 프리뷰
    const bbCanvas = this.contentEl.querySelector('#insp-mg-breakout-canvas');
    const bbTag = this.contentEl.querySelector('#insp-tag-breakout');
    if (bbCanvas) {
      const bb = window.KSool.RecipeAnalysisIntegrator.calcBreakoutBlocks(dotInfo);
      if (bbTag) bbTag.textContent = `블록 ${bb.totalBreakable}개 · 강철 ${bb.steelCount}개`;

      const ctx = bbCanvas.getContext('2d');
      ctx.clearRect(0, 0, 200, 140);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 200, 140);

      const scaleX = 200 / 420;
      const scaleY = 140 / 300;

      for (const blk of bb.blocks) {
        ctx.save();
        if (blk.isSteel) {
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 1;
          ctx.strokeRect(blk.x * scaleX, blk.y * scaleY, blk.w * scaleX, blk.h * scaleY);
        } else {
          ctx.fillStyle = blk.color;
        }
        ctx.fillRect(blk.x * scaleX, blk.y * scaleY, blk.w * scaleX, blk.h * scaleY);
        ctx.restore();
      }

      // 패들 & 공 가상 표시
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(75, 130, 50, 4);
      ctx.beginPath();
      ctx.arc(100, 124, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
    }

    // 3. 미니게임 2: 땅따먹기 네온 실루엣 프리뷰
    const terCanvas = this.contentEl.querySelector('#insp-mg-territory-canvas');
    const terTag = this.contentEl.querySelector('#insp-tag-territory');
    if (terCanvas) {
      const ter = window.KSool.RecipeAnalysisIntegrator.calcTerritoryEdges(dotInfo);
      if (terTag) terTag.textContent = `셀 ${ter.totalSilhouetteCells}개 · 엣지 ${ter.edges.length}개`;

      const ctx = terCanvas.getContext('2d');
      ctx.clearRect(0, 0, 200, 140);
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, 200, 140);

      const scaleX = 200 / 420;
      const scaleY = 140 / 440;

      // 실루엣 내부 은은한 파란색
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      for (let r = 0; r < ter.rows; r++) {
        for (let c = 0; c < ter.cols; c++) {
          if (ter.dilatedMask[r][c]) {
            ctx.fillRect(c * ter.cellW * scaleX, (ter.topOffset + r * ter.cellH) * scaleY, ter.cellW * scaleX, ter.cellH * scaleY);
          }
        }
      }

      // 네온 외곽선 엣지
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (const e of ter.edges) {
        ctx.moveTo(e.x1 * scaleX, e.y1 * scaleY);
        ctx.lineTo(e.x2 * scaleX, e.y2 * scaleY);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. 미니게임 3: 네모네모 로직 프리뷰
    const nonoCanvas = this.contentEl.querySelector('#insp-mg-nonogram-canvas');
    const nonoTag = this.contentEl.querySelector('#insp-tag-nonogram');
    if (nonoCanvas) {
      const nono = window.KSool.RecipeAnalysisIntegrator.calcNonogramClues(dotInfo);
      if (nonoTag) nonoTag.textContent = `${nono.rows}x${nono.cols} 격자 · 단서 완비`;

      const ctx = nonoCanvas.getContext('2d');
      ctx.clearRect(0, 0, 200, 140);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 200, 140);

      const maxRowNums = Math.max(1, ...nono.rowClues.map(c => c.length));
      const maxColNums = Math.max(1, ...nono.colClues.map(c => c.length));

      const leftClueW = Math.max(30, maxRowNums * 9 + 4);
      const topClueH = Math.max(24, maxColNums * 9 + 4);

      const availW = 200 - leftClueW - 10;
      const availH = 140 - topClueH - 10;
      const cellW = availW / nono.cols;
      const cellH = availH / nono.rows;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // 행 단서
      for (let r = 0; r < nono.rows; r++) {
        const text = nono.rowClues[r].join(' ');
        ctx.fillText(text, leftClueW - 3, topClueH + r * cellH + cellH / 2);
      }

      // 열 단서
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      for (let c = 0; c < nono.cols; c++) {
        const clues = nono.colClues[c];
        for (let k = 0; k < clues.length; k++) {
          const num = clues[k];
          const yPos = topClueH - 2 - (clues.length - 1 - k) * 9;
          ctx.fillText(String(num), leftClueW + c * cellW + cellW / 2, yPos);
        }
      }

      // 셀 렌더링
      for (let r = 0; r < nono.rows; r++) {
        for (let c = 0; c < nono.cols; c++) {
          const x = leftClueW + c * cellW;
          const y = topClueH + r * cellH;
          const filled = nono.targetGrid[r][c];
          if (filled) {
            ctx.fillStyle = nono.targetColors[r][c] || '#f8fafc';
            ctx.fillRect(x, y, cellW - 1, cellH - 1);
          } else {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x, y, cellW - 1, cellH - 1);
          }
        }
      }
    }
  }

  _executePromotion() {
    const targetNum = parseInt(this.currentTargetNumber, 10);
    if (isNaN(targetNum) || targetNum < this.analysis.minSafeNumber) {
      alert(`배치 불가: 최소 No.${this.analysis.minSafeNumber} 이후로 설정해야 합니다.`);
      return;
    }

    const confirmMsg = `
[정식 도감 스마트 등록]
- 명칭: ${this.currentRecipeName}
- 배정 번호: No.${String(targetNum).padStart(2, '0')}
- 번호 밀림(Auto Shift): No.${String(targetNum).padStart(2, '0')} 이후의 기존 레시피들이 뒤로 1칸씩 자동 이동합니다.

정말 등록하시겠습니까?
    `.trim();

    if (!confirm(confirmMsg)) return;

    try {
      const result = window.KSool.RecipeAnalysisIntegrator.executeSmartPromotion({
        suggestion: this.currentSuggestion,
        targetNumber: targetNum,
        recipeName: this.currentRecipeName,
        customDotSvg: this.currentDotSvg,
        customHdSvg: null,
        recipeBook: this.recipeBook,
        inventoryManager: this.inventory,
        suggestionService: this.suggestionService,
        brandResolver: this.brandResolver
      });

      if (result.ok) {
        this.audio.playSuccess();
        alert(`🎉 공식 도감에 No.${String(result.targetNumber).padStart(2, '0')} [${result.recipe.display_name}]이(가) 성공적으로 편입되었습니다!\n(기존 레시피 ${result.shiftedCount}개 자동 밀림 완료)`);
        this.close();
        if (this.onRecipePromoted) {
          this.onRecipePromoted(result.recipe);
        }
      }
    } catch (err) {
      this.audio.playFail();
      alert(`등록 실패: ${err.message}`);
    }
  }
}

window.KSool.RecipeInspectorModalView = RecipeInspectorModalView;
