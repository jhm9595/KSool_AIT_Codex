window.KSool = window.KSool || {};

/**
 * ⑨ 시장에 가면 (주조실 재료 기억력 릴레이 술게임)
 * - 한국 전통 술자리 기억력 게임: "시장에 가면~ 소주도 있고! 맥주도 있고!"
 * - 위쪽 영역: 재료가 스네이크/지그재그(L->R, R->L)로 계속 append되며, 다음 사람 차례에는 가려졌다가 하나씩 복기
 * - 아래쪽 영역: 주조실에서 해금된 재료들을 선택하는 카테고리 탭 & 재료 그리드
 * - 시작 전 훈민정음처럼 재료 1개당 선택 제한시간(3초, 5초, 7초, 10초, 무제한) 설정 가능
 * - 도감 50% 이상 해금 시 오픈
 */
class MarketMemoryGame {
  constructor(hub) {
    this.hub = hub;
    this.recipeBook = hub.recipeBook || window.ksoolApp?.recipeBook || window.app?.recipeBook;
    this.inventory = hub.inventory || window.ksoolApp?.inventory || window.app?.inventory;
    this.brandResolver = hub.brandResolver || window.ksoolApp?.brandResolver || window.app?.brandResolver;

    // 게임 상태: 'setup' (타이머 설정) | 'playing' (진행)
    this.gameState = 'setup';

    // 타이머 옵션
    this.timeLimitSetting = 5.0; // 3, 5, 7, 10, 'unlimited'
    this.remainingTime = 5.0;
    this.timerId = null;

    // 기억 체인: [{ id, name, emoji, category_id }]
    this.chain = [];
    // 이번 턴에서 현재 맞춰야 할 인덱스
    this.recallIndex = 0;
    // 턴 상태: 'recalling' (이전 재료들 맞추기) | 'adding' (새 재료 1개 추가) | 'turn_done' (턴 완료, 다음 사람 대기)
    this.turnState = 'adding';

    // 선택된 재료 카테고리
    this.selectedCategory = 'ALCOHOL';
    this.ITEMS_PER_ROW = 4; // 스네이크 1줄당 4개
  }

  init() {
    this.reset();
  }

  reset() {
    this._clearTimer();
    this.gameState = 'setup';
    this.chain = [];
    this.recallIndex = 0;
    this.turnState = 'adding';
    this.remainingTime = this.timeLimitSetting === 'unlimited' ? Infinity : this.timeLimitSetting;
    this.render();
  }

  _clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  _startItemTimer() {
    this._clearTimer();
    if (this.timeLimitSetting === 'unlimited') return;

    this.remainingTime = this.timeLimitSetting;
    this._updateTimerBarUI();

    this.timerId = setInterval(() => {
      this.remainingTime -= 0.1;
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this._clearTimer();
        this._triggerTimeoutFail();
      } else {
        if (Math.round(this.remainingTime * 10) % 5 === 0) {
          this.hub.sound.playTick();
        }
        this._updateTimerBarUI();
      }
    }, 100);
  }

  _updateTimerBarUI() {
    const fillEl = document.getElementById('market-timer-fill');
    if (!fillEl || !fillEl.style || this.timeLimitSetting === 'unlimited') return;

    const pct = Math.max(0, Math.min(100, (this.remainingTime / this.timeLimitSetting) * 100));
    fillEl.style.width = `${pct}%`;
    if (fillEl.classList) {
      if (this.remainingTime <= 1.5) {
        fillEl.classList.add('danger');
      } else {
        fillEl.classList.remove('danger');
      }
    }
  }

  _getIngName(ing) {
    if (!ing) return '';
    if (this.brandResolver && typeof this.brandResolver.resolveName === 'function') {
      return this.brandResolver.resolveName(ing);
    }
    const resolver = this.hub?.brandResolver || window.ksoolApp?.brandResolver || window.app?.brandResolver;
    if (resolver && typeof resolver.resolveName === 'function') {
      return resolver.resolveName(ing);
    }
    return ing.display_name || ing.name || ing.real_name || (ing.ingredient_id ? `재료 #${ing.ingredient_id}` : '');
  }

  _triggerTimeoutFail() {
    this.hub.sound.playExplosion();
    const expected = this.chain[this.recallIndex];
    const expectedName = expected ? (expected.name || this._getIngName(expected.raw)) : '';
    const hint = expectedName ? `정답: [ ${expectedName} ]` : '시간 초과!';
    this.hub.triggerPenalty({
      title: '시간 초과! 원샷!',
      subtitle: `제한시간 안에 기억해내지 못했습니다! (${hint})`,
      accentColor: '#ef4444',
      icon: '⏱️'
    });
    this.turnState = 'turn_done';
    this.render();
  }

  _triggerWrongItemFail(selectedIng) {
    this._clearTimer();
    this.hub.sound.playExplosion();
    const expected = this.chain[this.recallIndex];
    const selectedName = this._getIngName(selectedIng);
    const expectedName = expected ? (expected.name || this._getIngName(expected.raw)) : '?';
    this.hub.triggerPenalty({
      title: '땡! 순서가 틀렸습니다!',
      subtitle: `누른 재료: ${selectedName} ❌ (정답: ${expectedName})`,
      accentColor: '#ef4444',
      icon: '🚨'
    });
    this.turnState = 'turn_done';
    this.render();
  }

  startGame() {
    this._clearTimer();
    this.gameState = 'playing';
    this.chain = [];
    this.recallIndex = 0;
    this.turnState = 'adding'; // 최초 턴은 첫 재료 등록부터 시작
    this.hub.sound.playTap();
    this.render();
    this._scrollChainToActiveRow(true);
    this._startItemTimer();
  }

  startNextTurn() {
    this._clearTimer();
    this.recallIndex = 0;
    this.turnState = 'recalling'; // 다음 사람은 처음부터 복기해야 함
    this.hub.sound.playTap();
    this.render();
    this._scrollChainToActiveRow(true);
    this._startItemTimer();
  }

  /**
   * 아래 주조실 재료 영역에서 재료 클릭 시 처리
   */
  handleIngredientClick(ing) {
    if (this.gameState !== 'playing') return;
    if (this.turnState === 'turn_done') return;

    // 1. 복기 모드 ('recalling'): 이전 순서의 재료가 맞는지 검증
    if (this.turnState === 'recalling') {
      const target = this.chain[this.recallIndex];
      if (!target) return;

      if (ing.ingredient_id === target.id) {
        // 정답!
        this.recallIndex += 1;
        this.hub.sound.playUp();
        this.hub.vibrateShort();

        // 모든 이전 재료를 다 맞췄다면 -> 이제 이번 사람의 새 재료 추가 모드로 전환!
        if (this.recallIndex >= this.chain.length) {
          this.turnState = 'adding';
          this.hub.sound.playFanfare?.() || this.hub.sound.playTap();
        }

        // 다음 재료를 위한 타이머 리셋 및 재시작
        this._startItemTimer();
        this.render();
      } else {
        // 오답! 탈락!
        this._triggerWrongItemFail(ing);
      }
      return;
    }

    // 2. 새 재료 추가 모드 ('adding'): 체인 맨 뒤에 추가
    if (this.turnState === 'adding') {
      const ingName = this._getIngName(ing);
      const ingEmoji = ing.emoji || '🍶';

      this.chain.push({
        id: ing.ingredient_id,
        name: ingName,
        emoji: ingEmoji,
        category_id: ing.category_id,
        raw: ing
      });

      this._clearTimer();
      this.turnState = 'turn_done';
      this.hub.sound.playChime?.() || this.hub.sound.playUp();
      this.hub.vibrateShort();
      this.render();
    }
  }

  // =========================================================================
  // 렌더링
  // =========================================================================

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    if (this.gameState === 'setup') {
      this._renderSetupStage(container);
    } else {
      this._renderPlayingStage(container);
    }
  }

  _renderSetupStage(container) {
    const timeOptions = [
      { val: 3, label: '⚡ 3초 (극악)' },
      { val: 5, label: '⏱️ 5초 (스릴)' },
      { val: 7, label: '☕ 7초 (기본)' },
      { val: 10, label: '🐢 10초 (여유)' },
      { val: 'unlimited', label: '∞ 무제한' }
    ];

    container.innerHTML = `
      <div class="party-game-box market-setup-stage">
        <div class="market-setup-card">
          <div class="market-setup-header">
            <span class="market-setup-badge">RULE SETUP</span>
            <h3 class="market-setup-title">🧺 시장에 가면 시간 설정</h3>
            <p class="market-setup-desc">재료 하나를 기억해낼 제한시간을 선택하세요.</p>
          </div>

          <div class="market-setup-section">
            <div class="market-pills-grid">
              ${timeOptions.map(opt => `
                <button type="button" 
                        class="market-pill ${this.timeLimitSetting === opt.val ? 'active' : ''}" 
                        data-market-time="${opt.val}">
                  ${opt.label}
                </button>
              `).join('')}
            </div>
          </div>

          <button type="button" class="market-start-btn" id="btn-market-start">
            🔥 게임 시작하기
          </button>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-market-time]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const raw = btn.getAttribute('data-market-time');
        this.timeLimitSetting = raw === 'unlimited' ? 'unlimited' : Number(raw);
        this.hub.sound.playTap();
        this.render();
      };
    });

    const startBtn = container.querySelector('#btn-market-start');
    if (startBtn) {
      startBtn.onclick = (e) => {
        e.stopPropagation();
        this.startGame();
      };
    }
  }

  _renderPlayingStage(container) {
    const unlockedBase = this._getUnlockedIngredients();
    const categories = this._getCategories(unlockedBase);

    // 필터링된 재료 목록
    const filteredIngs = unlockedBase.filter(i => i.category_id === this.selectedCategory);

    // 스네이크 체인 HTML 생성 (L->R then R->L)
    const snakeRowsHtml = this._buildSnakeRowsHtml();

    // 상단 힌트 라벨
    let statusText = '';
    let statusClass = '';
    if (this.turnState === 'recalling') {
      const curNum = this.recallIndex + 1;
      const totalRecall = this.chain.length;
      statusText = `🔍 이전 재료를 순서대로 누르세요! (${curNum} / ${totalRecall})`;
      statusClass = 'recalling';
    } else if (this.turnState === 'adding') {
      const nextNum = this.chain.length + 1;
      statusText = `✨ 새로운 ${nextNum}번째 재료를 하나 골라주세요!`;
      statusClass = 'adding';
    } else if (this.turnState === 'turn_done') {
      statusText = `✅ 등록 완료! 다음 사람에게 폰을 넘기세요!`;
      statusClass = 'done';
    }

    const isUnlimited = this.timeLimitSetting === 'unlimited';
    const timePct = isUnlimited ? 100 : Math.max(0, Math.min(100, (this.remainingTime / this.timeLimitSetting) * 100));

    container.innerHTML = `
      <div class="party-game-box market-stage">
        <!-- 1. 상단 미니 헤더: 타이머 & 조작 버튼 -->
        <div class="market-top-bar">
          <div class="market-timer-wrap ${isUnlimited ? 'unlimited' : ''}">
            <div class="market-timer-track">
              <div class="market-timer-fill ${this.remainingTime <= 1.5 ? 'danger' : ''}" 
                   id="market-timer-fill" 
                   style="width: ${timePct}%;"></div>
            </div>
            <span class="market-timer-text">
              ${isUnlimited ? '∞ 무제한' : `⏱️ ${this.remainingTime.toFixed(1)}s`}
            </span>
          </div>

          <div class="market-top-actions">
            <button type="button" class="market-icon-btn" id="btn-market-setup" title="시간 설정 변경">
              ⚙️
            </button>
            <button type="button" class="market-icon-btn" id="btn-market-reset" title="새 게임 시작">
              🔄
            </button>
          </div>
        </div>

        <!-- 2. 위쪽 공간: 스네이크(L->R, R->L) 기억 체인 뷰포트 (2줄 가시 영역 자동 트래킹) -->
        <div class="market-chain-section">
          <div class="market-chain-status ${statusClass}">
            ${statusText}
          </div>
          <div class="market-chain-viewport" id="market-chain-viewport">
            ${snakeRowsHtml}
          </div>
        </div>

        <!-- 3. 중간 턴 액션 바 (턴 완료 시 다음 사람 시작 버튼 노출) -->
        ${this.turnState === 'turn_done' ? `
          <div class="market-turn-pass-banner">
            <button type="button" class="market-pass-btn" id="btn-market-pass">
              👉 다음 사람 차례 시작하기
            </button>
          </div>
        ` : ''}

        <!-- 4. 아래쪽 공간: 주조실 재료 선택 영역 -->
        <div class="market-picker-section ${this.turnState === 'turn_done' ? 'disabled' : ''}">
          <!-- 카테고리 칩 -->
          <div class="market-cat-chips-row">
            ${categories.map(c => `
              <button type="button" 
                      class="market-cat-chip ${this.selectedCategory === c.id ? 'active' : ''}" 
                      data-market-cat="${c.id}">
                ${c.name}
              </button>
            `).join('')}
          </div>

          <!-- 재료 선택 그리드 -->
          <div class="market-ings-grid">
            ${filteredIngs.map(ing => {
              const name = this._getIngName(ing);
              const iconHtml = window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 32) : ing.emoji;
              return `
                <button type="button" 
                        class="market-ing-card" 
                        data-ing-id="${ing.ingredient_id}"
                        title="${name}">
                  <span class="m-ing-icon">${iconHtml}</span>
                  <span class="m-ing-name">${name}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this._bindPlayingEvents();
    this._scrollChainToActiveRow(false);
  }

  /**
   * 스네이크/지그재그 체인 HTML 생성 (Row당 4칸 고정 그리드, 짝수행 L->R, 홀수행 R->L)
   * - 4칸 폭을 고정 유지하고 빈 칸은 ghost 슬롯으로 채워 새 재료 추가 시 위치가 튀지 않음
   * - 홀수행(RTL)은 윗줄 끝(Col 3) 바로 아래에서 왼쪽으로 순차 누적
   */
  _buildSnakeRowsHtml() {
    const displaySlots = [];

    this.chain.forEach((item, idx) => {
      let isRevealed = true;
      if (this.turnState === 'recalling') {
        // 복기 턴: 이미 맞춘 인덱스만 공개, 아직 못 맞춘 것은 물음표
        isRevealed = idx < this.recallIndex;
      }

      displaySlots.push({
        idx: idx,
        isNewPlaceholder: false,
        isRevealed: isRevealed,
        item: item,
        isActiveTarget: this.turnState === 'recalling' && idx === this.recallIndex
      });
    });

    // 새 재료를 추가하는 중일 때만 맨 끝에 들어갈 자리 [+] 표시
    if (this.turnState === 'adding') {
      displaySlots.push({
        idx: this.chain.length,
        isNewPlaceholder: true,
        isRevealed: false,
        item: null,
        isActiveTarget: true
      });
    }

    if (displaySlots.length === 0) {
      return `
        <div class="market-empty-chain">
          아래에서 첫 번째 재료를 선택하세요!
        </div>
      `;
    }

    const totalSlots = displaySlots.length;
    const numRows = Math.ceil(totalSlots / this.ITEMS_PER_ROW);
    let rowsHtml = '';

    for (let r = 0; r < numRows; r++) {
      const isEvenRow = r % 2 === 0;
      const hasNextRow = (r + 1) * this.ITEMS_PER_ROW < totalSlots;
      const arrowSymbol = isEvenRow ? '›' : '‹';

      let cellsHtml = '';

      for (let col = 0; col < this.ITEMS_PER_ROW; col++) {
        // 짝수행 (LTR): Col 0 -> Col 1 -> Col 2 -> Col 3
        // 홀수행 (RTL): Col 0 <- Col 1 <- Col 2 <- Col 3
        // DOM은 시각적 왼쪽에서 오른쪽으로 [Col 0, Col 1, Col 2, Col 3] 고정 배치하되,
        // RTL 행은 Col 3(우측)이 r*4+0(윗줄 끝 바로 아래)이고 Col 0(좌측)이 r*4+3이 됨.
        const slotIdx = isEvenRow 
          ? (r * this.ITEMS_PER_ROW + col) 
          : (r * this.ITEMS_PER_ROW + (this.ITEMS_PER_ROW - 1 - col));
        const isLastCol = col === this.ITEMS_PER_ROW - 1;

        let slotHtml = '';

        if (slotIdx < totalSlots) {
          const slot = displaySlots[slotIdx];

          // 코너 꺾임 화살표 (↓):
          // 짝수행은 우측 끝(Col 3) 아래, 홀수행은 좌측 끝(Col 0) 아래에 슬롯 중심 정렬로 배치
          let cornerHtml = '';
          if (hasNextRow) {
            if (isEvenRow && col === this.ITEMS_PER_ROW - 1) {
              cornerHtml = '<div class="market-corner-turn turn-right">↓</div>';
            } else if (!isEvenRow && col === 0) {
              cornerHtml = '<div class="market-corner-turn turn-left">↓</div>';
            }
          }

          if (slot.isNewPlaceholder) {
            slotHtml = `
              <div class="market-pot-slot placeholder ${slot.isActiveTarget ? 'active-target' : ''}" data-slot-idx="${slot.idx}">
                <span class="m-slot-plus">➕</span>
                <span class="m-slot-label">새 재료</span>
                ${cornerHtml}
              </div>
            `;
          } else if (!slot.isRevealed) {
            slotHtml = `
              <div class="market-pot-slot blind ${slot.isActiveTarget ? 'active-target' : ''}" data-slot-idx="${slot.idx}">
                <span class="m-slot-q">❓</span>
                <span class="m-slot-idx">#${slot.idx + 1}</span>
                ${cornerHtml}
              </div>
            `;
          } else {
            const iconHtml = window.KSool?.pixelIcon 
              ? window.KSool.pixelIcon(slot.item.raw || slot.item, 28) 
              : slot.item.emoji;
            slotHtml = `
              <div class="market-pot-slot filled pop-anim" data-slot-idx="${slot.idx}">
                <span class="m-slot-idx-badge">${slot.idx + 1}</span>
                <span class="m-slot-emoji">${iconHtml}</span>
                <span class="m-slot-name">${slot.item.name}</span>
                ${cornerHtml}
              </div>
            `;
          }
        } else {
          // 4칸 고정 그리드 폭 유지를 위한 투명 슬롯
          slotHtml = '<div class="market-pot-slot ghost" aria-hidden="true"></div>';
        }

        // 인라인 화살표 표시 여부
        let showArrow = false;
        if (!isLastCol) {
          if (isEvenRow) {
            // LTR: Col 0 -> Col 1 -> Col 2 -> Col 3
            showArrow = (slotIdx + 1) < totalSlots;
          } else {
            // RTL: Col 3 -> Col 2 -> Col 1 -> Col 0
            // 현재 컬럼(col)과 다음 컬럼(col + 1) 사이 화살표는 slotIdx(col 슬롯)가 존재할 때 표시
            showArrow = slotIdx < totalSlots;
          }
        }

        const arrowHtml = (!isLastCol)
          ? `<span class="market-snake-arrow ${showArrow ? '' : 'hidden'}">${arrowSymbol}</span>`
          : '';

        cellsHtml += slotHtml + arrowHtml;
      }

      rowsHtml += `
        <div class="market-snake-row ${isEvenRow ? 'ltr' : 'rtl'}" data-row-idx="${r}">
          ${cellsHtml}
        </div>
      `;
    }

    return rowsHtml;
  }

  /**
   * 뷰포트 스마트 2줄 트래킹 스크롤
   * - 턴 시작(startNextTurn): 맨 위(scrollTop = 0)로 즉시 리셋하여 1번부터 보이게 보장
   * - 복기/추가 진행 중: 현재 눌러야 할 라인(activeRowIdx)과 그 바로 윗줄(activeRowIdx - 1) 2줄만 화면에 보이도록
   *   Row (activeRowIdx - 1)을 뷰포트 맨 위에 오도록 프레이밍 스크롤!
   *   (미도달된 아래쪽 행들은 뷰포트 밖으로 숨김)
   */
  _scrollChainToActiveRow(immediate = false) {
    const doScroll = () => {
      const vp = document.getElementById('market-chain-viewport');
      if (!vp) return;

      let targetIdx = 0;
      if (this.turnState === 'recalling') {
        targetIdx = this.recallIndex;
      } else if (this.turnState === 'adding') {
        targetIdx = this.chain.length;
      } else {
        targetIdx = Math.max(0, this.chain.length - 1);
      }

      const activeRowIdx = Math.floor(targetIdx / this.ITEMS_PER_ROW);

      if (activeRowIdx <= 0) {
        if (immediate) {
          vp.scrollTop = 0;
        } else {
          vp.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      // activeRowIdx >= 1: 내가 누를 차례인 라인 바로 윗줄(activeRowIdx - 1)이 상단에 오도록 정렬
      const prevRowIdx = activeRowIdx - 1;
      const prevRowEl = vp.querySelector(`[data-row-idx="${prevRowIdx}"]`);
      if (prevRowEl) {
        const vpRect = vp.getBoundingClientRect();
        const rowRect = prevRowEl.getBoundingClientRect();
        const computedStyle = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(vp) : null;
        const padTop = computedStyle ? (parseFloat(computedStyle.paddingTop) || 8) : 8;
        const targetScrollTop = vp.scrollTop + (rowRect.top - vpRect.top) - padTop;
        const clampedScrollTop = Math.max(0, targetScrollTop);

        if (immediate) {
          vp.scrollTop = clampedScrollTop;
        } else {
          vp.scrollTo({ top: clampedScrollTop, behavior: 'smooth' });
        }
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(doScroll);
    } else if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(doScroll);
    } else {
      setTimeout(doScroll, 0);
    }
  }

  _getUnlockedIngredients() {
    if (!this.recipeBook) return [];
    const inv = this.hub._ensureInventory?.() || this.inventory;

    return Array.from(this.recipeBook.baseIngredients.values()).filter(ing => {
      if (!inv) return true;
      if (inv.unlockAllSandboxMode) return true;
      return inv.isIngredientAvailable(ing.ingredient_id);
    }).sort((a, b) => a.ingredient_id - b.ingredient_id);
  }

  _getCategories(unlockedBase) {
    if (!this.recipeBook) {
      return [{ id: 'ALCOHOL', name: '주류' }];
    }
    const catMap = {
      ALCOHOL: '주류',
      BEVERAGE: '음료/주스',
      MIXER: '탄산/시럽',
      DAIRY: '유제품',
      FRUIT: '과일',
      DESSERT: '디저트',
      ETC: '기타'
    };

    const presentCats = new Set(unlockedBase.map(i => i.category_id));
    const result = [];

    // 주류 항상 맨 앞
    if (presentCats.has('ALCOHOL')) {
      result.push({ id: 'ALCOHOL', name: '🍶 주류' });
    }

    this.recipeBook.categories.forEach(c => {
      if (c.category_id !== 'ALCOHOL' && presentCats.has(c.category_id)) {
        result.push({ id: c.category_id, name: c.name });
      }
    });

    if (result.length === 0) {
      result.push({ id: 'ALCOHOL', name: '주류' });
    }

    // 만약 현재 선택된 카테고리가 결과에 없다면 첫 번째로 지정
    if (!result.some(c => c.id === this.selectedCategory)) {
      this.selectedCategory = result[0].id;
    }

    return result;
  }

  _bindPlayingEvents() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    // 카테고리 칩 클릭
    container.querySelectorAll('[data-market-cat]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.selectedCategory = btn.getAttribute('data-market-cat');
        this.hub.sound.playTap();
        this.render();
      };
    });

    // 재료 카드 클릭
    container.querySelectorAll('[data-ing-id]').forEach(card => {
      card.onclick = (e) => {
        e.stopPropagation();
        const ingId = Number(card.getAttribute('data-ing-id'));
        const ing = this.recipeBook?.getBaseIngredient?.(ingId);
        if (ing) {
          this.handleIngredientClick(ing);
        }
      };
    });

    // 다음 사람 차례 시작 버튼
    const passBtn = container.querySelector('#btn-market-pass');
    if (passBtn) {
      passBtn.onclick = (e) => {
        e.stopPropagation();
        this.startNextTurn();
      };
    }

    // 설정 변경 버튼
    const setupBtn = container.querySelector('#btn-market-setup');
    if (setupBtn) {
      setupBtn.onclick = (e) => {
        e.stopPropagation();
        this._clearTimer();
        this.gameState = 'setup';
        this.hub.sound.playTap();
        this.render();
      };
    }

    // 새 게임 리셋 버튼
    const resetBtn = container.querySelector('#btn-market-reset');
    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        this.hub.sound.playTap();
        this.reset();
      };
    }
  }

  destroy() {
    this._clearTimer();
  }
}

window.KSool.MarketMemoryGame = MarketMemoryGame;
