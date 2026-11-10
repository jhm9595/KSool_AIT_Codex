window.KSool = window.KSool || {};

/**
 * 🌟 ModeSelectPortalView
 * 첫 방문 및 상단 [🏠 모드 선택] 클릭 시 표시되는 2대 모드 선택 포털 화면
 * 1. 🔬 [K-술 조합 퀴즈 모드]: 순차 레시피 풀이, 단계 돌파 무료 재료 자동 지급, 친구 SOS
 * 2. 🏪 [주점 타이쿤 모드]: 실시간 손님 주문 조리, 재료상점 구매, 일일 매출 정산, K-POP BGM
 */
class ModeSelectPortalView {
  constructor(modalId = 'mode-portal-modal', options = {}) {
    this.modalId = modalId;
    this.app = options.app || null;
    this.audio = options.audio || null;
    this.isOpen = false;
  }

  open(onSelectCallback = null) {
    this._onSelectCallback = onSelectCallback;
    let modal = document.getElementById(this.modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = this.modalId;
      modal.className = 'modal-overlay mode-portal-overlay';
      document.body.appendChild(modal);
    }
    this.isOpen = true;
    modal.classList.add('active');
    this.render();
  }

  close() {
    this.isOpen = false;
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  render() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    const currentMode = this.app?.currentMode || localStorage.getItem('ksool_active_mode') || '';

    modal.innerHTML = `
      <div class="mode-portal-card" role="dialog" aria-modal="true" aria-labelledby="mode-portal-title">
        <div class="mode-portal-header">
          <div class="portal-emblem">🍶</div>
          <h2 class="mode-portal-title" id="mode-portal-title">대한민국 주류 백과사전 K-술</h2>
          <p class="mode-portal-subtitle">즐기고 싶은 게임 모드를 선택하세요! 언제든 상단 [🏠 모드 선택]으로 자유롭게 변경할 수 있습니다.</p>
        </div>

        <div class="mode-portal-grid">
          <!-- 1. K-술 조합 퀴즈 모드 -->
          <div class="mode-choice-card ${currentMode === 'QUIZ' ? 'is-active-mode' : ''}" id="mode-choice-quiz" role="button" tabindex="0">
            <div class="mode-card-badge quiz">정통 퍼즐 & 퀴즈</div>
            <div class="mode-card-icon-area">
              <span class="mode-card-emoji">🔬</span>
              <span class="mode-card-arrow">➔</span>
              <span class="mode-card-emoji">🍶</span>
            </div>
            <h3 class="mode-card-title">K-술 조합 퀴즈 모드</h3>
            <p class="mode-card-desc">No.01부터 84개 술 조합 퍼즐을 순서대로 풀어보세요! 상점 구매 없이 단계를 클리어할 때마다 재료가 무료로 자동 지급됩니다.</p>
            <ul class="mode-feature-list">
              <li><span>🧩</span> <strong>순차 넘버링 퀴즈:</strong> 힌트를 보며 레시피 추리</li>
              <li><span>🎁</span> <strong>자동 재료 해금:</strong> 단계 돌파 시 다음 재료 무료 지급</li>
              <li><span>🤝</span> <strong>친구 SOS 공유:</strong> 막히는 문제 친구와 함께 풀기</li>
            </ul>
            <button type="button" class="mode-card-btn quiz-btn" id="portal-start-quiz-btn">
              ${currentMode === 'QUIZ' ? '계속 이어하기 ▸' : '🔬 퀴즈 모드 시작 ▸'}
            </button>
          </div>

          <!-- 2. 주점 타이쿤 모드 -->
          <div class="mode-choice-card ${currentMode === 'TYCOON' ? 'is-active-mode' : ''}" id="mode-choice-tycoon" role="button" tabindex="0">
            <div class="mode-card-badge tycoon">실시간 경영 시뮬레이션</div>
            <div class="mode-card-icon-area">
              <span class="mode-card-emoji">🏮</span>
              <span class="mode-card-arrow">➔</span>
              <span class="mode-card-emoji">💰</span>
            </div>
            <h3 class="mode-card-title">주점 타이쿤 모드</h3>
            <p class="mode-card-desc">손님들의 주문을 실시간으로 조리·서빙하여 주막을 번창시키세요! 재료상점에서 재료를 구매하고 일일 매출을 정산합니다.</p>
            <ul class="mode-feature-list">
              <li><span>🍶</span> <strong>실시간 주문 서빙:</strong> 콤보 판매와 손님 만족도 관리</li>
              <li><span>🛒</span> <strong>재료상점 경영:</strong> 영업 수익으로 새 재료와 점포 확장</li>
              <li><span>🎵</span> <strong>K-POP BGM:</strong> 신나는 K-POP 댄스 & 시티팝 음악</li>
            </ul>
            <button type="button" class="mode-card-btn tycoon-btn" id="portal-start-tycoon-btn">
              ${currentMode === 'TYCOON' ? '계속 이어하기 ▸' : '🏪 타이쿤 모드 시작 ▸'}
            </button>
          </div>
        </div>

        <div class="mode-portal-footer">
          <span class="portal-safe-badge">🔒 두 모드의 세이브 데이터는 분리되어 안전하게 보관됩니다.</span>
          ${currentMode ? `<button type="button" class="portal-cancel-btn" id="portal-close-x-btn">현재 게임 계속하기 ✕</button>` : ''}
        </div>
      </div>
    `;

    this._bindEvents(modal);
  }

  _bindEvents(container) {
    const quizCard = container.querySelector('#mode-choice-quiz');
    const quizBtn = container.querySelector('#portal-start-quiz-btn');
    const tycoonCard = container.querySelector('#mode-choice-tycoon');
    const tycoonBtn = container.querySelector('#portal-start-tycoon-btn');
    const closeBtn = container.querySelector('#portal-close-x-btn');

    const handleSelectQuiz = () => {
      this.audio?.playTap?.();
      this.close();
      if (typeof this._onSelectCallback === 'function') {
        this._onSelectCallback('QUIZ');
      } else if (this.app) {
        this.app.selectGameMode('QUIZ', true);
      }
    };

    const handleSelectTycoon = () => {
      this.audio?.playTap?.();
      this.close();
      if (typeof this._onSelectCallback === 'function') {
        this._onSelectCallback('TYCOON');
      } else if (this.app) {
        this.app.selectGameMode('TYCOON', true);
      }
    };

    if (quizBtn) quizBtn.onclick = handleSelectQuiz;
    if (quizCard) {
      quizCard.onclick = (e) => {
        if (e.target !== quizBtn) handleSelectQuiz();
      };
      quizCard.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectQuiz();
        }
      };
    }

    if (tycoonBtn) tycoonBtn.onclick = handleSelectTycoon;
    if (tycoonCard) {
      tycoonCard.onclick = (e) => {
        if (e.target !== tycoonBtn) handleSelectTycoon();
      };
      tycoonCard.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectTycoon();
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        this.audio?.playTap?.();
        this.close();
      };
    }
  }
}

window.KSool.ModeSelectPortalView = ModeSelectPortalView;
