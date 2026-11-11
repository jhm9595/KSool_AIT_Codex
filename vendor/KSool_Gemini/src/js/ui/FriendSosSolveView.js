window.KSool = window.KSool || {};

/**
 * 🤝 FriendSosSolveView
 * 친구가 공유한 링크(?help=...)로 접속했을 때 실행되는 100% 독립 SOS 풀이 전용 뷰
 * - 연구실(brew) 탭을 if-else로 쪼개 쓰지 않고, 오직 해당 문제 풀이에만 집중할 수 있는 전용 페이지
 * - 하단 탭바(.tab-bar)와 본게임 헤더를 완전히 숨겨 깔끔하고 몰입도 높은 풀이 환경 제공
 * - "나도 이 게임 도전하기" 액션 시 PlatformBridge를 통해 모드 선택 첫 화면(#view-portal) 또는 앱 다운로드/앱인토스로 확장 가능
 */
class FriendSosSolveView {
  constructor({ viewId = 'view-sos', recipeBook, alchemyEngine, brandResolver, audio, platformBridge, app }) {
    this.viewId = viewId;
    this.recipeBook = recipeBook;
    this.alchemyEngine = alchemyEngine;
    this.brandResolver = brandResolver;
    this.audio = audio;
    this.platformBridge = platformBridge;
    this.app = app;

    this.payload = null;
    this.targetRecipe = null;
    this.availableBaseIngs = [];
    this.slots = []; // [{ baseId, detailId, count }]
    this.selectedCat = 'ALL';
  }

  open(payload) {
    this.payload = payload;
    const rId = Number(payload.recipeId);
    this.targetRecipe = this.recipeBook.getRecipe(rId);

    // 질문자가 가진 기초 재료 목록 필터
    const leafSet = new Set((payload.leafIngIds || []).map(Number));
    const allBase = typeof this.recipeBook.getAllBaseIngredients === 'function'
      ? this.recipeBook.getAllBaseIngredients()
      : Array.from(this.recipeBook.baseIngredients ? this.recipeBook.baseIngredients.values() : []);
    this.availableBaseIngs = allBase.filter(b => leafSet.has(b.ingredient_id));

    this.slots = [];
    this.selectedCat = 'ALL';

    if (this.app) {
      this.app.switchTab('sos');
    } else {
      this.render();
    }
  }

  render() {
    const container = document.getElementById(this.viewId);
    if (!container || !this.targetRecipe) return;

    const sharer = this.payload?.sharerName || '친구';
    const rec = this.targetRecipe;
    const recName = this.brandResolver.resolveName(rec);

    // 1. 카테고리 칩 렌더링
    const categories = [
      { id: 'ALL', name: '전체' },
      { id: 'ALCOHOL', name: '주류' },
      { id: 'BEVERAGE', name: '음료' },
      { id: 'FRUIT', name: '과일' },
      { id: 'GRAIN', name: '곡물' },
      { id: 'ETC', name: '기타' }
    ];

    const catChipsHtml = categories.map(cat => `
      <button type="button" class="sos-cat-chip ${this.selectedCat === cat.id ? 'active' : ''}" data-sos-cat="${cat.id}">
        ${cat.name}
      </button>
    `).join('');

    // 2. 가마솥 슬롯 렌더링
    const totalSlotCount = this.slots.reduce((sum, s) => sum + s.count, 0);
    const slotsHtml = this.slots.length === 0
      ? `<div class="sos-pot-empty-guide">👇 아래 재료를 터치하여 가마솥에 담아보세요! (여러 번 터치 시 비율 증가)</div>`
      : this.slots.map((s, idx) => {
          const ing = this.recipeBook.getBaseIngredient(s.baseId);
          const icon = window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 22) : (ing?.emoji || '🍶');
          const name = ing ? this.brandResolver.resolveName(ing) : '재료';
          return `
            <div class="sos-pot-slot-pill" data-slot-index="${idx}">
              <span class="slot-pill-icon">${icon}</span>
              <span class="slot-pill-name">${name}</span>
              <span class="slot-pill-count">${s.count}개</span>
              <button type="button" class="slot-pill-remove-btn" data-remove-slot="${idx}" title="제거">✕</button>
            </div>
          `;
        }).join('');

    // 3. 재료 그리드 렌더링
    let filteredIngs = this.availableBaseIngs;
    if (this.selectedCat !== 'ALL') {
      filteredIngs = filteredIngs.filter(ing => ing.category_id === this.selectedCat);
    }

    const gridHtml = filteredIngs.length === 0
      ? `<div class="sos-empty-ings">해당 카테고리의 재료가 없습니다.</div>`
      : filteredIngs.map(ing => {
          const inPot = this.slots.find(s => s.baseId === ing.ingredient_id);
          const count = inPot ? inPot.count : 0;
          const icon = window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 28) : (ing.emoji || '🍶');
          const name = this.brandResolver.resolveName(ing);
          return `
            <button type="button" class="sos-ing-card ${count > 0 ? 'in-pot' : ''}" data-sos-ing-id="${ing.ingredient_id}">
              ${count > 0 ? `<span class="sos-ing-count-badge">${count}</span>` : ''}
              <span class="sos-ing-emoji">${icon}</span>
              <span class="sos-ing-name">${name}</span>
            </button>
          `;
        }).join('');

    container.innerHTML = `
      <div class="sos-solve-page">
        <!-- 상단 헤더: 질문자 SOS 정보 -->
        <header class="sos-solve-header">
          <div class="sos-header-top">
            <span class="sos-pulse-tag">🆘 친구의 도움 요청</span>
            <button type="button" class="sos-exit-link" id="sos-header-home-btn" title="모드 선택 첫 화면으로">
              🏠 첫 화면으로
            </button>
          </div>
          <div class="sos-sharer-banner">
            <span class="sos-sharer-avatar">🤝</span>
            <div class="sos-sharer-text-col">
              <strong class="sos-sharer-title">[${sharer}]님이 도움을 요청했습니다!</strong>
              <span class="sos-sharer-sub">친구가 모은 재료로 이 술의 황금 조합법을 밝혀주세요!</span>
            </div>
          </div>
        </header>

        <!-- 목표 레시피 카드 -->
        <section class="sos-target-card">
          <div class="sos-target-left">
            <div class="sos-target-mystery-box">❓</div>
          </div>
          <div class="sos-target-main">
            <div class="sos-target-number-row">
              <span class="sos-target-num-badge">${rec.formatted_number || `No.${rec.recipe_number}`}</span>
              <h2 class="sos-target-name">${recName}</h2>
            </div>
            <div class="sos-target-hint">
              ${rec.unlock_hint ? `<span class="bulb">💡</span> ${rec.unlock_hint}` : '❓ 조합 비율과 재료를 찾아주세요!'}
            </div>
          </div>
        </section>

        <!-- 조주 가마솥 영역 -->
        <section class="sos-pot-section">
          <div class="sos-pot-header">
            <span class="sos-pot-label">🧪 조주 가마솥 (비율: ${totalSlotCount})</span>
            ${this.slots.length > 0 ? `<button type="button" class="sos-pot-clear-btn" id="sos-clear-pot-btn">🗑️ 비우기</button>` : ''}
          </div>
          <div class="sos-pot-slots-row">
            ${slotsHtml}
          </div>
        </section>

        <!-- 재료 선택 영역 -->
        <section class="sos-ingredients-section">
          <div class="sos-cat-bar">
            ${catChipsHtml}
          </div>
          <div class="sos-ings-grid">
            ${gridHtml}
          </div>
        </section>

        <!-- 하단 액션 버튼 바 -->
        <footer class="sos-action-bar">
          <button type="button" class="sos-mix-btn" id="sos-submit-mix-btn" ${this.slots.length < 2 ? 'disabled' : ''}>
            🍶 조합 판정하기 (${totalSlotCount}개)
          </button>
          <button type="button" class="sos-play-my-game-btn" id="sos-start-my-game-bottom-btn">
            🎮 나도 K-술 연금술사 도전하기
          </button>
        </footer>
      </div>
    `;

    this._bindEvents(container);
  }

  _bindEvents(container) {
    // 1. 카테고리 칩 클릭
    container.querySelectorAll('[data-sos-cat]').forEach(chip => {
      chip.onclick = () => {
        this.audio?.playTap?.();
        this.selectedCat = chip.getAttribute('data-sos-cat');
        this.render();
      };
    });

    // 2. 재료 카드 터치 (가마솥에 담기 및 비율 증가)
    container.querySelectorAll('[data-sos-ing-id]').forEach(btn => {
      btn.onclick = () => {
        const baseId = Number(btn.getAttribute('data-sos-ing-id'));
        this.audio?.playTap?.();
        this._addIngredient(baseId);
      };
    });

    // 3. 슬롯에서 개별 제거
    container.querySelectorAll('[data-remove-slot]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.audio?.playTap?.();
        const idx = Number(btn.getAttribute('data-remove-slot'));
        this._removeSlot(idx);
      };
    });

    // 슬롯 자체를 탭하면 수량 증가
    container.querySelectorAll('.sos-pot-slot-pill').forEach(slotEl => {
      slotEl.onclick = () => {
        const idx = Number(slotEl.getAttribute('data-slot-index'));
        if (this.slots[idx]) {
          this.audio?.playTap?.();
          this.slots[idx].count += 1;
          this.render();
        }
      };
    });

    // 4. 솥 비우기
    const clearBtn = container.querySelector('#sos-clear-pot-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        this.audio?.playTap?.();
        this.slots = [];
        this.render();
      };
    }

    // 5. 조합 판정
    const mixBtn = container.querySelector('#sos-submit-mix-btn');
    if (mixBtn) {
      mixBtn.onclick = () => {
        this._evaluateCraft();
      };
    }

    // 6. 나도 이 게임 도전하기 (상단 및 하단 버튼)
    const triggerPlayMyGame = () => {
      this.audio?.playTap?.();
      if (this.platformBridge) {
        this.platformBridge.handlePlayMyGameAction(this.app);
      } else if (this.app) {
        this.app.switchTab('portal');
      }
    };

    const headerHomeBtn = container.querySelector('#sos-header-home-btn');
    if (headerHomeBtn) headerHomeBtn.onclick = triggerPlayMyGame;

    const bottomHomeBtn = container.querySelector('#sos-start-my-game-bottom-btn');
    if (bottomHomeBtn) bottomHomeBtn.onclick = triggerPlayMyGame;
  }

  _addIngredient(baseId) {
    const existing = this.slots.find(s => s.baseId === baseId);
    if (existing) {
      existing.count += 1;
    } else {
      if (this.slots.length >= 6) {
        this.audio?.playFail?.();
        this.app?.showToast?.('⚠️ 가마솥에는 최대 6종류의 재료까지 넣을 수 있습니다.');
        return;
      }
      this.slots.push({ baseId, detailId: null, count: 1 });
    }
    this.render();
  }

  _removeSlot(index) {
    if (this.slots[index]) {
      this.slots.splice(index, 1);
      this.render();
    }
  }

  _evaluateCraft() {
    if (this.slots.length < 2) {
      this.audio?.playFail?.();
      this.app?.showToast?.('재료를 2가지 이상 조합해주세요!');
      return;
    }

    const matchedRecipe = this.recipeBook.matchRecipe(
      this.slots,
      new Set(),
      this.targetRecipe?.recipe_id
    );
    if (matchedRecipe && matchedRecipe.recipe_id === this.targetRecipe.recipe_id) {
      // 정답 맞춤!
      this.audio?.playSuccess?.();
      this._showSuccessModal(matchedRecipe);
    } else {
      // 오답
      this.audio?.playFail?.();
      this.app?.showToast?.('🧪 비율이나 재료 조합이 맞지 않습니다! 다른 조합을 시도해보세요.');
    }
  }

  _showSuccessModal(matchedRecipe) {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    if (!modal || !content) return;

    const sharer = this.payload?.sharerName || '친구';
    const recName = this.brandResolver.resolveName(matchedRecipe);
    const formulaStr = this.slots.map(s => {
      const ing = this.recipeBook.getBaseIngredient(s.baseId);
      const name = ing ? this.brandResolver.resolveName(ing) : '재료';
      return `${name} ${s.count}개`;
    }).join(' + ');

    content.innerHTML = `
      <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px;">
        <div style="background:rgba(16,185,129,0.2); border:1.5px solid #10b981; border-radius:12px; padding:10px 18px; color:#34d399; font-weight:900; font-size:1.1rem; box-shadow:0 0 16px rgba(16,185,129,0.35);">
          🎉 [${sharer}]님의 SOS 문제 해결 성공!
        </div>
        <div class="craft-result-info-card">
          <div class="craft-result-left">
            <div class="craft-result-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(matchedRecipe, 48) : matchedRecipe.emoji}</div>
            <div class="craft-result-name">${recName}</div>
          </div>
          <div class="craft-result-desc">
            ${matchedRecipe.description || '한국 전통과 현대의 맛이 어우러진 비전의 술!'}
          </div>
        </div>
        <div style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:10px; padding:10px; font-size:0.86rem; color:#fcd34d; font-weight:800;">
          ✨ 발견한 황금 조합: <b>${formulaStr}</b>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; width:100%; margin-top:6px;">
          <button class="mix-btn" id="sos-modal-copy-btn" style="background:linear-gradient(135deg, #10b981, #059669); border-color:#34d399; font-weight:900; font-size:0.95rem; padding:12px;">
            📋 정답 복사해서 친구에게 알려주기
          </button>
          <button class="clear-pot-btn" id="sos-modal-challenge-btn" style="background:linear-gradient(135deg, #3b82f6, #2563eb); border:1px solid #60a5fa; color:#ffffff; font-size:0.92rem; font-weight:800; padding:12px;">
            🎮 나도 K-술 연금술사 도전하기
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const copyBtn = content.querySelector('#sos-modal-copy-btn');
    if (copyBtn) {
      copyBtn.onclick = async () => {
        this.audio?.playTap?.();
        const gameUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
        const ansText = `[K-술 연금술사 SOS 정답]\n내가 '${recName}' 황금 조합을 찾았어!\n👉 조합: ${formulaStr}\n얼른 조합해서 해금해봐! 🍶✨\n\n🎮 나도 K-술 연금술사 도전하기:\n${gameUrl}`;
        if (navigator?.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(ansText);
            this.app?.showToast?.('📋 정답이 클립보드에 복사되었습니다!\n친구에게 메신저로 전송해주세요.');
            return;
          } catch (_) {}
        }
        this.app?.showToast?.(`정답: ${formulaStr}`);
      };
    }

    const challengeBtn = content.querySelector('#sos-modal-challenge-btn');
    if (challengeBtn) {
      challengeBtn.onclick = () => {
        modal.classList.remove('active');
        this.audio?.playTap?.();
        if (this.platformBridge) {
          this.platformBridge.handlePlayMyGameAction(this.app);
        } else if (this.app) {
          this.app.switchTab('portal');
        }
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
  }
}

window.KSool.FriendSosSolveView = FriendSosSolveView;
