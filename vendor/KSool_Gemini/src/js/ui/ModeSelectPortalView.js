window.KSool = window.KSool || {};

/**
 * 🌟 ModeSelectPortalView
 * 첫 방문 및 상단 [🏠 모드 선택] 클릭 시 전환되는 전체 화면 SPA 게이트웨이 화면
 * - 팝업 모달이 아닌 뷰(SPA View: #view-portal)로 동작하여 100% 몰입감과 안정적인 렌더링 제공
 * 1. 🔬 [K-술 조합 퀴즈 모드]: 순차 레시피 풀이, 단계 돌파 무료 재료 자동 지급, 친구 SOS
 * 2. 🏪 [주점 타이쿤 모드]: 실시간 손님 주문 조리, 재료상점 구매, 일일 매출 정산, K-POP BGM
 */
class ModeSelectPortalView {
  constructor(viewId = 'view-portal', options = {}) {
    this.viewId = viewId;
    this.app = options.app || null;
    this.audio = options.audio || null;
  }

  open(onSelectCallback = null) {
    this._onSelectCallback = onSelectCallback;
    if (this.app) {
      this.app.switchTab('portal');
    } else {
      this.render();
    }
  }

  close() {
    if (this.app) {
      const target = this.app.currentMode === 'QUIZ' ? 'brew' : 'tycoon';
      this.app.switchTab(target);
    }
  }

  render() {
    const container = document.getElementById(this.viewId);
    if (!container) return;

    const currentMode = this.app?.currentMode || (typeof localStorage !== 'undefined' ? localStorage.getItem('ksool_active_mode') : '') || '';
    const hasActiveSession = Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('ksool_active_mode'));

    container.innerHTML = `
      <div class="portal-spa-container">
        <div class="portal-spa-header">
          <span class="portal-spa-kicker">GAME MODE</span>
          <h2 class="portal-spa-title">게임 모드 선택</h2>
          <p class="portal-spa-subtitle">플레이할 게임 모드를 선택해 주세요</p>
        </div>

        <div class="portal-spa-grid">
          <!-- 1. K-술 조합 퀴즈 모드 -->
          <button type="button" class="portal-mode-card quiz ${currentMode === 'QUIZ' ? 'is-active-mode' : ''}" id="mode-choice-quiz">
            <div class="portal-card-top">
              <div class="portal-card-badges-wrap">
                <span class="portal-card-badge quiz">조합 퀴즈</span>
                <span class="portal-card-diff-tag easy">쉬움</span>
              </div>
              ${currentMode === 'QUIZ' ? '<span class="portal-card-current-tag">현재 모드</span>' : ''}
            </div>
            <div class="portal-card-main">
              <div class="portal-card-icon-box quiz">
                <span>🔬</span>
              </div>
              <div class="portal-card-text">
                <h3 class="portal-card-title">K-술 조합 퀴즈</h3>
                <p class="portal-card-desc">순서대로 전통주 조합 맞히기</p>
              </div>
            </div>
            <div class="portal-card-action quiz">
              <span>입장하기</span>
              <span class="portal-card-arrow">▸</span>
            </div>
          </button>

          <!-- 2. 주점 타이쿤 모드 -->
          <button type="button" class="portal-mode-card tycoon ${currentMode === 'TYCOON' ? 'is-active-mode' : ''}" id="mode-choice-tycoon">
            <div class="portal-card-top">
              <div class="portal-card-badges-wrap">
                <span class="portal-card-badge tycoon">주점 경영</span>
                <span class="portal-card-diff-tag hard">어려움</span>
              </div>
              ${currentMode === 'TYCOON' ? '<span class="portal-card-current-tag">현재 모드</span>' : ''}
            </div>
            <div class="portal-card-main">
              <div class="portal-card-icon-box tycoon">
                <span>🏪</span>
              </div>
              <div class="portal-card-text">
                <h3 class="portal-card-title">주점 타이쿤</h3>
                <p class="portal-card-desc">손님 주문 조리 & 주점 운영</p>
              </div>
            </div>
            <div class="portal-card-action tycoon">
              <span>입장하기</span>
              <span class="portal-card-arrow">▸</span>
            </div>
          </button>

          <!-- 3. 술 미니게임 모드 -->
          <button type="button" class="portal-mode-card party" id="mode-choice-party">
            <div class="portal-card-top">
              <span class="portal-card-badge party">미니게임</span>
            </div>
            <div class="portal-card-main">
              <div class="portal-card-icon-box party">
                <span>🍻</span>
              </div>
              <div class="portal-card-text">
                <h3 class="portal-card-title">술 미니게임</h3>
                <p class="portal-card-desc">술자리 게임 & 패스앤플레이 모음</p>
              </div>
            </div>
            <div class="portal-card-action party">
              <span>입장하기</span>
              <span class="portal-card-arrow">▸</span>
            </div>
          </button>
        </div>

        <div class="portal-spa-footer">
          ${hasActiveSession ? `
            <button type="button" class="portal-return-btn" id="portal-return-game-btn">
              ◀ 현재 게임 계속하기 (${currentMode === 'QUIZ' ? '퀴즈' : '타이쿤'})
            </button>
          ` : ''}
          <p class="portal-spa-notice">
            🔒 두 모드의 진행 데이터는 독립되어 각각 안전하게 보관됩니다.
          </p>
        </div>
      </div>
    `;

    this._bindEvents(container);
  }

  _bindEvents(container) {
    const quizBtn = container.querySelector('#mode-choice-quiz');
    const tycoonBtn = container.querySelector('#mode-choice-tycoon');
    const partyBtn = container.querySelector('#mode-choice-party');
    const returnBtn = container.querySelector('#portal-return-game-btn');

    const attachAction = (btn, mode) => {
      if (!btn) return;
      let isBusy = false;
      const doAction = (e) => {
        if (e) {
          if (e.cancelable && e.type !== 'pointerdown') e.preventDefault();
          e.stopPropagation();
        }
        if (isBusy) return;
        isBusy = true;
        setTimeout(() => { isBusy = false; }, 350);

        this.audio?.playTap?.();
        if (typeof this._onSelectCallback === 'function') {
          this._onSelectCallback(mode);
        } else if (this.app) {
          this.app.selectGameMode(mode, true);
        }
      };

      btn.addEventListener('click', doAction);
      btn.addEventListener('touchend', doAction, { passive: false });
    };

    attachAction(quizBtn, 'QUIZ');
    attachAction(tycoonBtn, 'TYCOON');

    if (partyBtn) {
      let isPartyBusy = false;
      const doPartyAction = (e) => {
        if (e) {
          if (e.cancelable && e.type !== 'pointerdown') e.preventDefault();
          e.stopPropagation();
        }
        if (isPartyBusy) return;
        isPartyBusy = true;
        setTimeout(() => { isPartyBusy = false; }, 350);

        this.audio?.playTap?.();
        if (this.app) {
          this.app.switchTab('party');
        }
      };
      partyBtn.addEventListener('click', doPartyAction);
      partyBtn.addEventListener('touchend', doPartyAction, { passive: false });
    }

    if (returnBtn) {
      returnBtn.onclick = (e) => {
        if (e) e.stopPropagation();
        this.audio?.playTap?.();
        this.close();
      };
    }
  }
}

window.KSool.ModeSelectPortalView = ModeSelectPortalView;
