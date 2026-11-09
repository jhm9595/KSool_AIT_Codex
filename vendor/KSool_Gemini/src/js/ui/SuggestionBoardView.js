window.KSool = window.KSool || {};

/**
 * 6) 초간단 조합 추천 & 관리자 '딸깍' 및 '🔬스마트 분석' 뷰 (SuggestionBoardView)
 * - 이름/설명 없이 오직 [재료 아이콘 + 비율] 및 👍 / 👎 버튼만 표시
 * - 관리자 모드가 켜져 있으면 우측에 [🔬분석] 및 [⚡적용] 버튼 노출
 * - [🔬분석] 클릭 시: 선행 의존성, 최소 안전 번호(minSafeNumber), 3종 미니게임 실루엣 실시간 검증 모달 오픈
 */
class SuggestionBoardView {
  constructor({ config, recipeBook, craftingPot, suggestionService, brandResolver, audio, showToast, onRecipePromoted, onOpenInspector }) {
    this.config = config;
    this.recipeBook = recipeBook;
    this.craftingPot = craftingPot;
    this.suggestionService = suggestionService;
    this.brandResolver = brandResolver;
    this.audio = audio;
    this.showToast = showToast;
    this.onRecipePromoted = onRecipePromoted;
    this.onOpenInspector = onOpenInspector;
  }

  render() {
    const container = document.getElementById('view-suggestions');
    if (!container) return;

    const potSlots = this.craftingPot.getSlots();
    const canSubmitPot = potSlots.length >= 2;

    const potPreviewHtml = canSubmitPot
      ? potSlots.map(s => {
          const det = this.recipeBook.getDetailIngredient(s.detailId);
          const base = this.recipeBook.getBaseIngredient(s.baseId);
          const target = det || base;
          const detailBadge = det ? `<span class="slot-detail-tag">특산</span>` : '';
          const countBadge = s.count > 1 ? `<span class="slot-count-badge">${s.count}</span>` : '';
          return `
            <div class="pot-slot filled sug-slot-card">
              ${detailBadge}
              <span class="slot-emoji">${target ? (window.KSool?.pixelIcon ? window.KSool.pixelIcon(target, 28) : target.emoji) : '🍶'}</span>
              <span class="slot-name">${this.brandResolver.resolveName(target)}</span>
              ${countBadge}
            </div>
          `;
        }).join('')
      : '<span style="font-size:0.76rem; color:#94a3b8;">연구실 가마솥에 재료를 2종류 이상 담으면 그대로 추천에 올릴 수 있습니다.</span>';

    const list = this.suggestionService.getActiveSuggestions();
    const rowsHtml = list.length === 0
      ? '<div style="text-align:center; padding:30px; color:#64748b; font-size:0.82rem;">대기 중인 추천 조합이 없습니다.</div>'
      : list.map(sug => {
          const slotsHtml = sug.items.map(it => {
            const det = this.recipeBook.getDetailIngredient(it.detail_id);
            const base = this.recipeBook.getBaseIngredient(it.ingredient_id);
            const target = det || base;
            const name = target ? this.brandResolver.resolveName(target) : `재료#${it.ingredient_id}`;
            const emoji = target ? target.emoji : '🍶';
            const detailBadge = det ? `<span class="slot-detail-tag">특산</span>` : '';
            const ratioBadge = Number(it.ratio) > 1 ? `<span class="slot-count-badge">${it.ratio}</span>` : '';
            return `
              <div class="pot-slot filled sug-slot-card">
                ${detailBadge}
                <span class="slot-emoji">${target ? (window.KSool?.pixelIcon ? window.KSool.pixelIcon(target, 28) : (emoji || '🍶')) : '🍶'}</span>
                <span class="slot-name">${name}</span>
                ${ratioBadge}
              </div>
            `;
          }).join('');

          const myVote = this.suggestionService.userVotes[sug.suggestion_key];
          const adminBtnHtml = this.config.isAdminMode
            ? `
              <button class="admin-inspect-btn" data-admin-inspect="${sug.suggestion_key}" title="의존성/난이도 분석 및 3종 미니게임 실루엣 실시간 검증">🔬분석</button>
              <button class="admin-apply-btn" data-admin-apply="${sug.suggestion_key}" title="정식 도감에 즉시 반영하고 목록에서 제거">⚡적용</button>
            `
            : '';

          return `
            <div class="suggestion-row-card">
              <div class="suggestion-items-wrap">${slotsHtml}</div>
              <div class="suggestion-actions-wrap">
                <button class="vote-btn up ${myVote === 'UP' ? 'voted' : ''}" data-vote-up="${sug.suggestion_key}">
                  👍 ${sug.upvotes}
                </button>
                <button class="vote-btn down ${myVote === 'DOWN' ? 'voted' : ''}" data-vote-down="${sug.suggestion_key}">
                  👎 ${sug.downvotes}
                </button>
                ${adminBtnHtml}
              </div>
            </div>
          `;
        }).join('');

    container.innerHTML = `
      <div class="suggestion-view-container">
        <div class="suggestion-top-bar">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.8rem; font-weight:800; color:#f8fafc;">현재 가마솥 조합 바로 올리기</span>
            <button class="toolbar-toggle ${this.config.isAdminMode ? 'active' : ''}" id="toggle-admin-mode-btn">
              👑 관리자 딸깍 모드: ${this.config.isAdminMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <div class="suggestion-pot-preview">
            <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center; flex:1;">
              ${potPreviewHtml}
            </div>
            <button class="suggest-submit-btn" id="submit-pot-suggestion-btn" ${canSubmitPot ? '' : 'disabled'}>
              + 추천 등록
            </button>
          </div>
        </div>

        <div class="suggestion-list">
          ${rowsHtml}
        </div>
      </div>
    `;

    this._bindEvents(container);
  }

  _bindEvents(container) {
    const adminToggle = container.querySelector('#toggle-admin-mode-btn');
    if (adminToggle) {
      adminToggle.onclick = () => {
        this.config.isAdminMode = !this.config.isAdminMode;
        this.audio.playTap();
        this.render();
      };
    }

    const submitBtn = container.querySelector('#submit-pot-suggestion-btn');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const res = this.suggestionService.submitFromPot(this.craftingPot.getSlots());
        if (res.ok) this.audio.playSuccess();
        else this.audio.playFail();
        const toast = this.showToast || window.ksoolApp?.showToast || window.kSoolApp?.showToast || window.app?.showToast;
        if (typeof toast === 'function') {
          toast(res.message);
        } else {
          alert(res.message);
        }
        this.render();
      };
    }

    container.querySelectorAll('[data-vote-up]').forEach(btn => {
      btn.onclick = () => {
        const key = btn.getAttribute('data-vote-up');
        this.suggestionService.vote(key, 'UP');
        this.audio.playTap();
        this.render();
      };
    });

    container.querySelectorAll('[data-vote-down]').forEach(btn => {
      btn.onclick = () => {
        const key = btn.getAttribute('data-vote-down');
        this.suggestionService.vote(key, 'DOWN');
        this.audio.playTap();
        this.render();
      };
    });

    // 🔬 관리자 스마트 분석 & 검증 모달 열기
    container.querySelectorAll('[data-admin-inspect]').forEach(btn => {
      btn.onclick = () => {
        const key = btn.getAttribute('data-admin-inspect');
        const sug = this.suggestionService.suggestions.find(s => s.suggestion_key === key);
        if (sug && this.onOpenInspector) {
          this.audio.playTap();
          this.onOpenInspector(sug);
        }
      };
    });

    // ⚡ 관리자 초간단 딸깍 즉시 편입
    container.querySelectorAll('[data-admin-apply]').forEach(btn => {
      btn.onclick = () => {
        const key = btn.getAttribute('data-admin-apply');
        const newRecipe = this.suggestionService.applySuggestionByAdmin(key);
        if (newRecipe) {
          this.audio.playSuccess();
          if (this.onRecipePromoted) this.onRecipePromoted(newRecipe);
          this.render();
        }
      };
    });
  }
}

window.KSool.SuggestionBoardView = SuggestionBoardView;
