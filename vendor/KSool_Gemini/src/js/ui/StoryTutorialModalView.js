window.KSool = window.KSool || {};

/**
 * 🎬 프롤로그 스토리 컷신 & 인게임 화면 오버레이 가이드 플레이어 (StoryTutorialModalView)
 *
 * - PROLOGUE (01~03): 웹툰/애니메이션 장면 일러스트와 하단 독백 자막으로 창업 서사를 전달합니다.
 * - GUIDE (01~04): 실제 인게임 화면(연구실 제조화면, 힌트 위치, 주점 판매화면) 위에
 *   반투명하게 겹쳐진 하이라이트 박스·화살표·콜아웃 오버레이를 띄워 직관적으로 조작법을 안내합니다.
 */
class StoryTutorialModalView {
  constructor({ modalId = 'story-tutorial-modal', contentId = 'story-tutorial-content', app, inventory, audio }) {
    this.modalId = modalId;
    this.contentId = contentId;
    this.app = app;
    this.inventory = inventory;
    this.audio = audio;

    this.slides = [];
    this.currentIndex = 0;
    this.onCompleteCallback = null;
    this.isOpen = false;
    this._boundKeyDown = this._handleKeyDown.bind(this);
  }

  static get STORY_SLIDES() {
    return [
      {
        type: 'STORY',
        stepLabel: 'PROLOGUE 01',
        speaker: '독백',
        image: './assets/story/story_scene_1.jpg?v=2',
        line1: '“텅 빈 지갑, 책상 위에 쌓여가는 고지서들…”',
        line2: '이대로 주저앉을 순 없어. 당장 내일부터라도 내 힘으로 돈을 벌어야 해!'
      },
      {
        type: 'STORY',
        stepLabel: 'PROLOGUE 02',
        speaker: '독백',
        image: './assets/story/story_scene_2.jpg?v=2',
        line1: '“할아버지가 남기신 아이스박스와『비전 음료 제조 노트』!”',
        line2: '그래… 거창한 가게가 없어도 이 레시피 노트만 있다면 당장 시작할 수 있어!'
      },
      {
        type: 'STORY',
        stepLabel: 'PROLOGUE 03',
        speaker: '독백',
        image: './assets/story/story_scene_3.jpg?v=2',
        line1: '“좋아, 첫 시작은 이 작은 길거리 노점이다!”',
        line2: '지나가는 사람들의 발길을 사로잡을 시원하고 달콤한 음료부터 하나씩 연구해서 팔아보자!'
      }
    ];
  }

  static get TUTORIAL_SLIDES() {
    return [
      {
        type: 'TUTORIAL',
        guideKey: 'LAB_CRAFT',
        stepLabel: 'GUIDE 01 · 연구실 조합',
        speaker: '조작 가이드 1/4',
        line1: '재료를 골라 담고 [🔬 조합하기]를 눌러 새 음료를 만드세요.',
        line2: '잘못 담았을 땐 [비우기]로 빼고, 수익(💰)으로 [🛒 재료상점]에서 새 재료를 살 수 있어요.'
      },
      {
        type: 'TUTORIAL',
        guideKey: 'LAB_HINT',
        stepLabel: 'GUIDE 02 · 힌트 보기',
        speaker: '조작 가이드 2/4',
        line1: '조합이 막힐 땐 문제 카드의 [힌트] 버튼을 누르세요.',
        line2: '복권 긁기와 미니게임으로 어떤 재료가 필요한지 단서를 얻을 수 있어요.'
      },
      {
        type: 'TUTORIAL',
        guideKey: 'TYCOON_SERVE',
        stepLabel: 'GUIDE 03 · 점포 판매',
        speaker: '조작 가이드 3/4',
        line1: '손님 주문대로 음료를 [⚗️조합]해 접시에 올리세요.',
        line2: '오른쪽 [🛎️ 종]을 터치하면 판매가 완료됩니다.'
      },
      {
        type: 'TUTORIAL',
        guideKey: 'TYCOON_RULES',
        stepLabel: 'GUIDE 04 · 서빙 팁',
        speaker: '조작 가이드 4/4',
        line1: '시간 안에 연속 서빙하면 [COMBO 보너스(💰)]를 받아요.',
        line2: '손님 대기시간이 다 지나기 전에 빠르게 음료를 만들어 서빙하세요!'
      }
    ];
  }

  /**
   * 최초 접속 또는 상단 [🎬] 버튼 클릭 시:
   * 1) 프롤로그 스토리(3컷) 재생
   * 2) 종료 직후 실제 인게임 화면을 이동하며 버튼을 직접 눌러보는 [실전 조작 튜토리얼] 자동 시작!
   */
  openIntroFlow(onComplete = null) {
    this._skippedByBtn = false;
    this._startSlides(StoryTutorialModalView.STORY_SLIDES, () => {
      if (this.inventory) {
        this.inventory.markIntroStorySeen();
      }
      if (this._skippedByBtn) {
        if (this.inventory) this.inventory.markIntroTutorialSeen();
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      this.startInteractiveTutorial(onComplete);
    });
  }

  /**
   * 스토리만 다시 보기 (3컷)
   */
  openStoryOnly(onComplete = null) {
    this._skippedByBtn = false;
    this._startSlides(StoryTutorialModalView.STORY_SLIDES, () => {
      if (this.inventory) this.inventory.markIntroStorySeen();
      if (typeof onComplete === 'function') onComplete();
    });
  }

  /**
   * 요약 가이드 팝업 다시 보기 (4컷 - 설정창 [📖 게임 가이드 보기] 버튼에서 호출)
   */
  openTutorialOnly(onComplete = null) {
    this._skippedByBtn = false;
    this._startSlides(StoryTutorialModalView.TUTORIAL_SLIDES, () => {
      if (this.inventory) this.inventory.markIntroTutorialSeen();
      if (typeof onComplete === 'function') onComplete();
    });
  }

  _startSlides(slides, onComplete) {
    const modal = document.getElementById(this.modalId);
    if (!modal || !slides || slides.length === 0) return;

    this.slides = slides;
    this.currentIndex = 0;
    this.onCompleteCallback = onComplete;
    this.isOpen = true;

    modal.classList.add('active');
    window.addEventListener('keydown', this._boundKeyDown);
    this.render();
  }

  close(triggerCallback = true) {
    const modal = document.getElementById(this.modalId);
    if (modal) modal.classList.remove('active');
    this.isOpen = false;
    window.removeEventListener('keydown', this._boundKeyDown);

    const cb = this.onCompleteCallback;
    this.onCompleteCallback = null;
    if (triggerCallback && typeof cb === 'function') {
      cb();
    }
  }

  _handleKeyDown(e) {
    if (!this.isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.audio?.playTap?.();
      this.close(true);
    } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prevSlide();
    }
  }

  nextSlide() {
    this.audio?.playTap?.();
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex += 1;
      this.render();
    } else {
      this.audio?.playSuccess?.();
      this.close(true);
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.audio?.playTap?.();
      this.currentIndex -= 1;
      this.render();
    }
  }

  /**
   * 실제 인게임 화면(연구실 / 힌트 팝업 / 주점 판매화면) 위에
   * 반투명 설명 레이어(하이라이트 박스 + 화살표 + 번호 콜아웃)가 겹쳐진 가이드 화면을 렌더링합니다.
   */
  _renderTutorialOverlayStage(guideKey) {
    if (guideKey === 'LAB_CRAFT') {
      return `
        <div class="guide-screen-mockup lab-mockup">
          <!-- 문제 카드 -->
          <div class="gm-quiz-box">
            <div class="gm-quiz-col-left">
              <div class="gm-quiz-icon">🫧</div>
              <div class="gm-hint-btn-mini">힌트</div>
            </div>
            <div class="gm-quiz-info">
              <div class="gm-quiz-title">탄산수 <small>◀ No.02 / 84 ▶</small></div>
              <div class="gm-quiz-desc">💡 물과 공기가 만나 톡 쏘는 탄산수가 됩니다.</div>
            </div>
          </div>

          <!-- 실제 연구실과 동일한 가마솥 4슬롯 + 하단 [🔬 조합하기 | 비우기] -->
          <div class="gm-pot-stack">
            <div class="gm-pot-slots">
              <div class="gm-slot filled">💧<span>물</span><b>1</b></div>
              <div class="gm-slot filled">💨<span>공기</span><b>1</b></div>
              <div class="gm-slot">➕<span>빈 슬롯 3</span></div>
              <div class="gm-slot">➕<span>빈 슬롯 4</span></div>
            </div>
            <div class="gm-pot-action-row">
              <div class="gm-mix-btn gm-highlight-target target-emerald">
                🔬 조합하기
                <span class="gm-badge-num badge-emerald">②</span>
              </div>
              <div class="gm-clear-btn gm-highlight-target target-rose">
                비우기
              </div>
            </div>
          </div>

          <!-- 하단 재료 카테고리 & 재료 그리드 -->
          <div class="gm-ings-section">
            <div class="gm-cat-row">
              <span class="gm-cat active">자연</span>
              <span class="gm-cat">과일</span>
              <span class="gm-cat">기타</span>
            </div>
            <div class="gm-ings-grid gm-highlight-target target-sky">
              <span class="gm-badge-num badge-sky">①</span>
              <div class="gm-ing selected">💧<span>물</span><b>1</b></div>
              <div class="gm-ing">❄️<span>눈</span></div>
              <div class="gm-ing selected">💨<span>공기</span><b>1</b></div>
              <div class="gm-ing">🍬<span>설탕</span></div>
              <div class="gm-ing">🍋<span>레몬</span></div>
            </div>
          </div>

          <!-- 버튼과 전혀 겹치지 않는 하단 번호별 요약 바 -->
          <div class="gm-nonoverlap-legend-grid">
            <div class="gm-legend-chip chip-sky">
              <b>① 재료 선택 / [비우기]</b>
              <span>하단 재료를 눌러 슬롯에 담고, 실수 시 [비우기]</span>
            </div>
            <div class="gm-legend-chip chip-emerald">
              <b>② [🔬 조합하기] 해금</b>
              <span>정답 비율이면 새 음료 해금! (점포 영업 최소 4종)</span>
            </div>
            <div class="gm-legend-chip chip-amber">
              <b>③ 하단 [🛒 재료상점] 탭</b>
              <span>영업 수익(💰)으로 새로운 재료를 구매!</span>
            </div>
          </div>
        </div>
      `;
    }

    if (guideKey === 'LAB_HINT') {
      return `
        <div class="guide-screen-mockup hint-mockup">
          <!-- 1) 먼저 연구실 문제 카드에서 [힌트] 버튼 위치 표시 -->
          <div class="gm-hint-step1-bar">
            <div class="gm-quiz-box gm-quiz-compact">
              <div class="gm-quiz-col-left">
                <div class="gm-quiz-icon locked">❓</div>
                <div class="gm-hint-btn gm-highlight-target target-amber">
                  힌트
                  <span class="gm-badge-num badge-amber">①</span>
                </div>
              </div>
              <div class="gm-quiz-info">
                <div class="gm-quiz-title">사이다 <small>◀ No.03 / 84 ▶</small></div>
                <div class="gm-locked-desc-bar">🔒 설명 힌트 잠김</div>
              </div>
            </div>
            <div class="gm-hint-arrow-banner">
              <b>① 문제 카드 왼쪽의 [힌트] 버튼 터치!</b> ➔ 아래 <b>[🕵️ 단계별 힌트 추리]</b> 팝업이 열립니다 ▼
            </div>
          </div>

          <!-- 2) [힌트] 버튼을 눌렀을 때 실제로 열리는 모달 화면 기준 설명 -->
          <div class="gm-actual-hint-modal-box">
            <div class="gm-ahm-header">
              <span>🕵️ 단계별 힌트 추리</span>
              <span class="gm-ahm-close">✕</span>
            </div>

            <!-- 은박 복권 영역 (②) -->
            <div class="gm-ahm-target-card">
              <div class="gm-ahm-target-top">
                <span class="gm-ahm-q">❓</span>
                <span class="gm-ahm-num">No.03</span>
                <span class="gm-ahm-name">사이다</span>
              </div>
              <div class="gm-ahm-foil-strip gm-highlight-target target-emerald">
                <span class="gm-badge-num badge-emerald">②</span>
                <span>🪙 은박 복권을 긁어 설명 힌트 확인</span>
                <span class="gm-ahm-foil-btn"><b>AD</b> 복권 긁기 ➔</span>
              </div>
            </div>

            <!-- STEP 1: 외형 그림 미니게임 (③) -->
            <div class="gm-ahm-step-card step-purple gm-highlight-target target-sky">
              <span class="gm-badge-num badge-sky">③</span>
              <span class="gm-ahm-step-ico">🎮</span>
              <div class="gm-ahm-step-body">
                <div class="gm-ahm-step-hdr">
                  <span class="gm-ahm-badge purple">STEP 1</span>
                  <b>외형 그림</b>
                  <span class="gm-ahm-tag">도전 ➔</span>
                </div>
                <small>벽돌깨기·땅따먹기·네모로직으로 완성 음료 아이콘 확인</small>
              </div>
            </div>

            <!-- STEP 2: 베이스볼 / 업앤다운 추리 (④) -->
            <div class="gm-ahm-step-card step-cyan gm-highlight-target target-amber">
              <span class="gm-badge-num badge-amber">④</span>
              <span class="gm-ahm-step-ico">⚾</span>
              <div class="gm-ahm-step-body">
                <div class="gm-ahm-step-hdr">
                  <span class="gm-ahm-badge cyan">STEP 2</span>
                  <b>베이스볼 추리</b>
                  <span class="gm-ahm-tag">입장 ➔</span>
                </div>
                <small>투입한 재료 종류·비율(S/B)을 추리해 정답 조합 공식 확인</small>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (guideKey === 'TYCOON_SERVE') {
      return `
        <div class="guide-screen-mockup tycoon-mockup">
          <!-- 상단 실제 주점 카운터 화면 (겹치지 않는 상단 2열 콜아웃 + 중앙 접시 위 완성 음료 + 오른쪽 서빙 종) -->
          <div class="gm-counter-scene" style="background-image: url('./assets/tycoon/bg_stage_1.jpg?v=2');">
            <div class="gm-counter-dim"></div>

            <!-- 상단 좌/우 분리형 콜아웃 (서로 절대 겹치지 않음) -->
            <div class="gm-counter-top-callouts">
              <div class="gm-callout-card callout-sky gm-static-callout">
                <b>② 중앙 접시 확인</b>
                <span>조합 완성 시 접시 위에 음료가 올라감</span>
              </div>
              <div class="gm-callout-card callout-amber gm-static-callout">
                <b>③ 오른쪽 [🛎️종] 서빙!</b>
                <span>접시에 올린 뒤 종을 터치해 판매!</span>
              </div>
            </div>

            <!-- 손님 주문 말풍선 (패러디 가짜 이름 '사이다' 사용) -->
            <div class="gm-order-bubble">
              <span class="gm-bubble-drink">🥤 사이다</span>
              <div class="gm-bubble-gauge"><div class="gm-gauge-fill" style="width:78%;"></div></div>
            </div>

            <!-- 카운터 왼쪽 메뉴판 -->
            <div class="gm-menu-board-passive">📋 메뉴판</div>

            <!-- 카운터 중앙 접시 위 완성 음료 아이콘 (사람 모양 제거, 실제 완성된 음료 '사이다' 표시) -->
            <div class="gm-plate-spot gm-highlight-target target-sky">
              <span class="gm-badge-num badge-sky">②</span>
              <div class="gm-plated-drink-icon">🥤</div>
              <span class="gm-plated-drink-name">사이다</span>
            </div>

            <!-- 카운터 오른쪽 종 (③) -->
            <div class="gm-bell-spot gm-highlight-target target-amber">
              <span class="gm-badge-num badge-amber">③</span>
              <span class="gm-bell-ring-txt">🛎️ 종 터치!</span>
            </div>
          </div>

          <!-- 하단 실제 주점 조리대 화면 (실제 인게임 UI와 동일한 4칸 정사각형 슬롯 + 우측 조합/비우기 + 카테고리 칩 + 재료 카드) -->
          <div class="gm-tycoon-bottom">
            <div class="gm-tycoon-pot-row">
              <div class="gm-mini-slots-4">
                <div class="gm-cp-slot filled">
                  <span class="gm-cp-ico">🫧</span>
                  <span class="gm-cp-nm">탄산수</span>
                  <b>1</b>
                </div>
                <div class="gm-cp-slot filled">
                  <span class="gm-cp-ico">🍬</span>
                  <span class="gm-cp-nm">설탕</span>
                  <b>1</b>
                </div>
                <div class="gm-cp-slot empty">➕</div>
                <div class="gm-cp-slot empty">➕</div>
              </div>
              <div class="gm-cp-actions-col">
                <div class="gm-cp-craft-btn gm-highlight-target target-emerald">
                  <span class="gm-badge-num badge-emerald">①</span>
                  <b>⚗️조합</b>
                  <small>🍽️사이다</small>
                </div>
                <div class="gm-cp-clear-btn">비우기</div>
              </div>
            </div>

            <div class="gm-cat-row gm-tycoon-cats">
              <span class="gm-cat active">음료</span>
              <span class="gm-cat">자연</span>
              <span class="gm-cat">과일</span>
              <span class="gm-cat">기타</span>
            </div>

            <div class="gm-tycoon-ings-row gm-highlight-target target-emerald">
              <div class="gm-mini-ing active">🫧<span>탄산수</span><b>1</b></div>
              <div class="gm-mini-ing">💧<span>물</span></div>
              <div class="gm-mini-ing">💨<span>공기</span></div>
              <div class="gm-mini-ing active">🍬<span>설탕</span><b>1</b></div>
              <div class="gm-mini-ing">🍋<span>레몬</span></div>
            </div>

            <div class="gm-callout-card callout-emerald gm-bottom-Floating-callout">
              <b>① 주문 음료(사이다) 재료 선택 & [⚗️조합] (실수 시 [비우기])</b>
              <span>하단 재료를 눌러 담고 우측 <em>[⚗️조합]</em>을 누르면 카운터 중앙 접시 위에 올라갑니다!</span>
            </div>
          </div>
        </div>
      `;
    }

    // GUIDE 04: TYCOON_RULES (메뉴판 가격 확인 · 콤보 보너스 · 제한시간/오답 주의사항)
    return `
      <div class="guide-screen-mockup tycoon-rules-mockup">
        <div class="gm-counter-scene rules-scene" style="background-image: url('./assets/tycoon/bg_stage_1.jpg?v=2');">
          <div class="gm-counter-dim"></div>

          <!-- ① 왼쪽: 메뉴판 가격 팝업 미니 프리뷰 & 메뉴판 버튼 -->
          <div class="gm-menu-popup-mini">
            <div class="gm-mp-title">📋 점포 메뉴판 (가격·조합법)</div>
            <div class="gm-mp-row"><span>No.02 탄산수</span><b>💰 10원</b></div>
            <div class="gm-mp-row"><span>No.03 사이다</span><b>💰 20원</b></div>
            <div class="gm-mp-row"><span>No.04 레몬에이드</span><b>💰 30원</b></div>
          </div>

          <div class="gm-menu-board-spot gm-highlight-target target-sky">
            <span class="gm-badge-num badge-sky">①</span>
            📋 메뉴판
          </div>

          <!-- ② 중앙: 머리 위 COMBO +3 / +23원 & 중앙 접시 위 음료 (사람 모양 제거!) -->
          <div class="gm-head-combo-popup gm-highlight-target target-emerald">
            <span class="gm-badge-num badge-emerald">②</span>
            <div class="gm-combo-txt">COMBO +3</div>
            <div class="gm-earn-txt">+23원</div>
          </div>

          <div class="gm-plate-spot">
            <div class="gm-plated-drink-icon">🥤</div>
            <span class="gm-plated-drink-name">사이다</span>
          </div>

          <!-- ③ 오른쪽: 제한시간 임박 말풍선 -->
          <div class="gm-order-bubble urgent gm-rules-bubble-right gm-highlight-target target-rose">
            <span class="gm-badge-num badge-rose">③</span>
            <span class="gm-bubble-drink">🍋 레몬에이드</span>
            <div class="gm-bubble-gauge"><div class="gm-gauge-fill danger" style="width:22%;"></div></div>
          </div>
        </div>

        <!-- 하단 3대 핵심 규칙 요약 레이어 -->
        <div class="gm-rules-summary-box">
          <div class="gm-hint-explain-item item-sky">
            <span class="gm-step-circle sky">①</span>
            <div>
              <b>음료수당 가격 & 레시피 확인 → 왼쪽 [📋 메뉴판]</b>
              <small>카운터 왼쪽 메뉴판을 누르면 해금한 음료의 판매 가격(💰)과 조합법을 언제든 볼 수 있습니다.</small>
            </div>
          </div>
          <div class="gm-hint-explain-item item-emerald">
            <span class="gm-step-circle emerald">②</span>
            <div>
              <b>연속 정답 서빙 → 머리 위 [COMBO +N] 보너스!</b>
              <small>연속으로 올바르게 서빙하면 콤보 수만큼 보너스 금액(예: 3콤보 = 사이다 20원 + 3원)을 추가로 받습니다.</small>
            </div>
          </div>
          <div class="gm-hint-explain-item item-rose">
            <span class="gm-step-circle rose">③</span>
            <div>
              <b>주의! 제한시간 초과 · 오답 서빙 시 손님 귀가 & 콤보 초기화</b>
              <small>제한시간 게이지가 다 닳거나 다른 음료를 내면 손님이 집으로 돌아가고 쌓인 콤보가 끊깁니다!</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const container = document.getElementById(this.contentId);
    if (!container) return;

    const slide = this.slides[this.currentIndex];
    if (!slide) return;

    const total = this.slides.length;
    const isLast = this.currentIndex === total - 1;
    const isTutorial = slide.type === 'TUTORIAL';

    const dotsHtml = this.slides.map((s, idx) => `
      <span class="cutscene-dot ${idx === this.currentIndex ? 'active' : ''} ${idx < this.currentIndex ? 'done' : ''}"></span>
    `).join('');

    const visualStageHtml = isTutorial
      ? `<div class="cutscene-artwork-frame guide-overlay-frame">
           ${this._renderTutorialOverlayStage(slide.guideKey)}
         </div>`
      : `<div class="cutscene-artwork-frame">
           <img src="${slide.image}" alt="${slide.stepLabel}" class="cutscene-artwork-img" draggable="false" />
           <div class="cutscene-vignette-overlay"></div>
         </div>`;

    container.innerHTML = `
      <div class="cutscene-player-stage ${isTutorial ? 'is-tutorial-mode' : 'is-story-mode'}" id="cutscene-tap-surface">
        <!-- 상단 진행 도트 & 건너뛰기 -->
        <div class="cutscene-top-bar">
          <div class="cutscene-step-pill ${isTutorial ? 'tutorial-pill' : 'story-pill'}">
            ${slide.stepLabel}
          </div>
          <div class="cutscene-dots-wrap">
            ${dotsHtml}
          </div>
          <button type="button" class="cutscene-skip-btn" id="cutscene-skip-btn" title="건너뛰기">
            건너뛰기 ✕
          </button>
        </div>

        <!-- 중앙 프레임 (프롤로그 일러스트 OR 인게임 화면 + 반투명 가이드 오버레이) -->
        ${visualStageHtml}

        <!-- 하단 자막 박스 -->
        <div class="cutscene-subtitle-box">
          <div class="cutscene-speaker-tag ${isTutorial ? 'tag-guide' : 'tag-monologue'}">
            ${slide.speaker}
          </div>
          <div class="cutscene-dialogue-lines">
            <p class="cutscene-line-primary">${slide.line1}</p>
            <p class="cutscene-line-secondary">${slide.line2}</p>
          </div>
          <div class="cutscene-Prompt-footer">
            ${this.currentIndex > 0 ? `<button type="button" class="cutscene-prev-mini" id="cutscene-prev-btn">◂ 이전</button>` : `<span></span>`}
            <button type="button" class="cutscene-next-btn ${isLast ? 'is-start' : ''}" id="cutscene-next-btn">
              ${isLast ? '시작하기 🚀' : '다음 ▸'}
            </button>
          </div>
        </div>
      </div>
    `;

    const tapSurface = container.querySelector('#cutscene-tap-surface');
    if (tapSurface) {
      tapSurface.onclick = (e) => {
        if (e.target.closest('#cutscene-skip-btn') || e.target.closest('#cutscene-prev-btn') || e.target.closest('#cutscene-next-btn')) {
          return;
        }
        this.nextSlide();
      };
    }

    const nextBtn = container.querySelector('#cutscene-next-btn');
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        this.audio?.playTap?.();
        this.nextSlide();
      };
    }

    const skipBtn = container.querySelector('#cutscene-skip-btn');
    if (skipBtn) {
      skipBtn.onclick = (e) => {
        e.stopPropagation();
        this._skippedByBtn = true;
        this.audio?.playTap?.();
        this.close(true);
      };
    }

    const prevBtn = container.querySelector('#cutscene-prev-btn');
    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        this.prevSlide();
      };
    }
  }

  // =========================================================================
  // 🎓 실제 화면 이동 & 버튼 터치 유도형 모바일 인게임 튜토리얼 (Live Coach-Mark)
  // =========================================================================

  startInteractiveTutorial(onComplete = null) {
    this.stopInteractiveTutorial(false);
    this._isLiveTutorialActive = true;
    this._liveTutorialCompleteCb = onComplete;
    this._liveStepIdx = 0;

    // 점포 로비 화면에서 시작하도록 초기 정렬
    if (this.app) {
      if (this.app.tycoonView?.engine?.session) {
        this.app.tycoonView._stopTimerLoop();
        this.app.tycoonView._isTutorialPaused = false;
        this.app.tycoonView.engine.session.status = 'LOBBY';
        this.app.tycoonView._syncGlobalTabBarVisibility(false);
      }
      this.app.switchTab('tycoon');
    }

    this._liveTutorialSteps = this._buildLiveTutorialSteps();

    const layer = document.createElement('div');
    layer.id = 'live-interactive-tutorial-layer';
    layer.className = 'live-coach-overlay';
    document.body.appendChild(layer);

    this._boundCoachResize = () => {
      if (document.getElementById('live-interactive-tutorial-layer')) {
        this._renderCurrentLiveStep(true);
      }
    };
    window.addEventListener('resize', this._boundCoachResize);

    this._runLiveStepSetupAndRender(0);
  }

  stopInteractiveTutorial(triggerCallback = true) {
    this._isLiveTutorialActive = false;
    const layer = document.getElementById('live-interactive-tutorial-layer');
    if (layer) layer.remove();

    if (this._boundCoachResize) {
      window.removeEventListener('resize', this._boundCoachResize);
      this._boundCoachResize = null;
    }

    if (this.inventory) {
      this.inventory._forceTutorialLockedHintPreview = false;
      this.inventory._forceTutorialLockedRecipe12 = false;
      // 튜토리얼에서 직접 조합한 탄산수(No.02)만 해금 유지 (얼음·사이다·레모네이드 강제 해금 제거)
      this.inventory.unlockedRecipeIds.add(12);
      const nextQuiz = this.inventory.getNextQuizRecipe();
      if (this.app && nextQuiz) {
        this.app.quizTargetRecipeId = nextQuiz.recipe_id;
      }
      this.inventory._syncStepAndIngredients?.();
      this.inventory.markIntroTutorialSeen();
      this.inventory.save();
    }

    if (this.app?.tycoonView) {
      this.app.tycoonView._isTutorialPaused = false;
    }

    if (this.app) {
      this.app.renderBrewView?.();
      this.app.tycoonView?.render?.();
    }

    const cb = this._liveTutorialCompleteCb;
    this._liveTutorialCompleteCb = null;
    if (triggerCallback && typeof cb === 'function') {
      cb();
    }
  }

  _buildLiveTutorialSteps() {
    return [
      // STEP 1: 점포 화면 -> 하단 [🔬 연구실] 탭 실제 클릭 유도
      {
        stepBadge: '1 / 12 · 연구실 이동',
        title: '🔬 연구실로 이동하기',
        desc: '음료를 판매하려면 먼저 연구실에서 만들어야 해요.<br/>아래 <b>[🔬 연구실]</b>을 눌러보세요!',
        targetSelector: '.tab-btn[data-tab-target="brew"]',
        mode: 'CLICK_TARGET',
        handLabel: '연구실 터치!',
        setup: () => {
          if (this.app) {
            this.app.switchTab('tycoon');
          }
        }
      },
      // STEP 2: 연구실 화면 -> 문제 카드 왼쪽의 [힌트] 버튼 위치 안내
      {
        stepBadge: '2 / 12 · 힌트 확인',
        title: '💡 막힐 땐 [힌트] 확인!',
        desc: '어떤 재료가 들어갈지 모를 땐 <b>[힌트]</b>를 누르면 레시피 단서를 볼 수 있어요.',
        targetSelector: '#brew-step-quiz-bar .brew-quiz-card',
        mode: 'NEXT_BTN',
        nextBtnLabel: '다음: 재료 담아보기 ▸',
        pins: [
          { selector: '#quiz-open-hint-btn', label: '💡 [힌트] 버튼 위치', color: 'amber' }
        ],
        setup: () => {
          if (!this.app || !this.inventory) return;
          this.inventory._forceTutorialLockedRecipe12 = true;
          this.inventory._forceTutorialLockedHintPreview = true;
          this.app.brewMode = 'QUIZ';
          this.app.selectedIngCategory = 'NATURE';
          this.app.quizTargetRecipeId = 12; // No.02 탄산수
          this.app.craftingPot.clear();
          this.app.renderBrewView();
        }
      },
      // STEP 3: 연구실 화면 -> 하단 재료에서 [💧 물] 선택
      {
        stepBadge: '3 / 12 · 첫 번째 재료',
        title: '💧 [물] 담기',
        desc: '탄산수를 만들기 위해 아래에서 <b>[💧 물]</b>을 터치하세요.',
        targetSelector: '#ingredients-grid [data-base-ing-id="202"]',
        mode: 'CLICK_TARGET',
        handLabel: '💧 물 터치!',
        setup: () => {
          if (!this.app || !this.inventory) return;
          this.inventory._forceTutorialLockedHintPreview = false;
          this.app.selectedIngCategory = 'NATURE';
          this.app.craftingPot.clear();
          this.app.renderBrewView();
        }
      },
      // STEP 4: 연구실 화면 -> 하단 재료에서 [💨 공기] 선택 & 비우기 안내
      {
        stepBadge: '4 / 12 · 두 번째 재료',
        title: '💨 [공기] 담기',
        desc: '이어서 옆의 <b>[💨 공기]</b>를 터치하세요.<br/>(실수했을 땐 우측 <b>[비우기]</b>로 뺄 수 있어요)',
        targetSelector: '#ingredients-grid [data-base-ing-id="205"]',
        mode: 'CLICK_TARGET',
        handLabel: '💨 공기 터치!',
        pins: [
          { selector: '#clear-pot-btn', label: '실수 시 [비우기]', color: 'rose' }
        ]
      },
      // STEP 5: 연구실 화면 -> [🔬 조합하기] 눌러 탄산수 해금
      {
        stepBadge: '5 / 12 · 조합하기',
        title: '✨ [조합하기]로 음료 해금!',
        desc: '물과 공기가 모였어요! <b>[🔬 조합하기]</b>를 눌러 탄산수를 완성하세요.',
        targetSelector: '#mix-btn',
        mode: 'CLICK_TARGET',
        handLabel: '조합하기 터치!',
        pins: [
          { selector: '.tab-btn[data-tab-target="shop"]', label: '새 재료는 [🛒재료상점]', color: 'amber' }
        ],
        beforeClick: () => {
          if (this.inventory) {
            this.inventory._forceTutorialLockedRecipe12 = false;
            this.inventory.unlockedRecipeIds.delete(12);
          }
        },
        afterClickDelayMs: 650,
        afterClick: () => {
          // 결과 모달 자동 닫기 (직접 조합한 탄산수만 해금되고 얼음·사이다·레모네이드는 강제 해금하지 않음)
          const resModal = document.getElementById('result-modal');
          if (resModal) resModal.classList.remove('active');
          if (this.inventory) {
            this.inventory.unlockedRecipeIds.add(12);
            this.inventory._syncStepAndIngredients?.();
            this.inventory.save();
          }
          this.app?.renderBrewView?.();
        }
      },
      // STEP 6: 연구실 화면 -> 하단 [🏪 점포] 탭 실제 클릭 유도
      {
        stepBadge: '6 / 12 · 점포 이동',
        title: '🏪 점포로 판매하러 가기',
        desc: '탄산수 완성! 이제 손님에게 팔아볼까요?<br/>하단의 <b>[🏪 점포]</b>를 눌러주세요.',
        targetSelector: '.tab-btn[data-tab-target="tycoon"]',
        mode: 'CLICK_TARGET',
        handLabel: '🏪 점포 터치!'
      },
      // STEP 7: 점포 로비 화면 -> [🏪 영업 시작하기] 실제 클릭 유도
      {
        stepBadge: '7 / 12 · 영업 시작',
        title: '🚀 영업 시작하기',
        desc: '<b>[영업 시작하기]</b>를 눌러 첫 손님을 맞이해보세요!',
        targetSelector: '.lobby-start-biz-btn',
        mode: 'CLICK_TARGET',
        handLabel: '영업 시작 터치!',
        setup: () => {
          if (this.app?.tycoonView) {
            this.app.tycoonView.engine.session.status = 'LOBBY';
            this.app.tycoonView.render();
          }
        },
        afterClick: () => {
          if (this.app?.tycoonView) {
            const tv = this.app.tycoonView;
            tv._isTutorialPaused = true;
            tv.selectedIngCat = 'NATURE';
            tv.engine.forceTutorialOrder(12); // 첫 손님 주문: 탄산수(물1 + 공기1)
            tv.render();
          }
        }
      },
      // STEP 8: 실제 주점 카운터 화면 -> 주문 & 제한시간 확인
      {
        stepBadge: '8 / 12 · 주문 & 대기시간',
        title: '⏱️ 손님 주문 확인하기',
        desc: '말풍선에 적힌 <b>탄산수</b>를 초록색 시간 게이지가 줄어들기 전에 만들어야 해요!',
        targetSelector: '.tycoon-counter-scene',
        mode: 'NEXT_BTN',
        nextBtnLabel: '다음: 재료 넣기 ▸',
        pins: [
          { selector: '#tycoon-counter-menu-hotspot', label: '📋 메뉴판 (가격·레시피)', color: 'sky' },
          { selector: '#tycoon-order-bubble', label: '주문 음료 & 대기시간 바', color: 'emerald' }
        ]
      },
      // STEP 9: 실제 주점 하단 조리대 -> [💧 물] 실제 클릭 유도
      {
        stepBadge: '9 / 12 · 주문 재료 (1/2)',
        title: '💧 조리대에 [물] 담기',
        desc: '주문받은 탄산수를 만들기 위해 아래에서 <b>[💧 물]</b>을 터치하세요.',
        targetSelector: '.tycoon-ings-scroll-grid [data-tycoon-base-ing="202"]',
        mode: 'CLICK_TARGET',
        handLabel: '💧 물 터치!',
        setup: () => {
          if (this.app?.tycoonView) {
            this.app.tycoonView.selectedIngCat = 'NATURE';
            this.app.tycoonView.engine.clearTycoonPot();
            this.app.tycoonView._updateBottomAreaInDom();
          }
        }
      },
      // STEP 10: 실제 주점 하단 조리대 -> [💨 공기] 실제 클릭 유도 & [비우기] 안내
      {
        stepBadge: '10 / 12 · 주문 재료 (2/2)',
        title: '💨 조리대에 [공기] 담기',
        desc: '이어서 <b>[💨 공기]</b>를 터치하세요.',
        targetSelector: '.tycoon-ings-scroll-grid [data-tycoon-base-ing="205"]',
        mode: 'CLICK_TARGET',
        handLabel: '💨 공기 터치!',
        pins: [
          { selector: '#tycoon-clear-pot-btn', label: '실수 시 [비우기]', color: 'rose' }
        ]
      },
      // STEP 11: 실제 주점 하단 조리대 -> [⚗️조합] 실제 클릭하여 접시에 올리기
      {
        stepBadge: '11 / 12 · 음료 제조',
        title: '🍽️ [조합] 눌러 접시에 올리기',
        desc: '재료가 맞으면 버튼이 활성화됩니다.<br/><b>[⚗️조합]</b>을 눌러 카운터 접시에 올려보세요.',
        targetSelector: '#tycoon-craft-stock-btn',
        mode: 'CLICK_TARGET',
        handLabel: '⚗️조합 터치!'
      },
      // STEP 12: 실제 주점 카운터 -> 오른쪽 [🛎️ 서빙 종] 실제 터치 서빙
      {
        stepBadge: '12 / 12 · 서빙 완료',
        title: '🛎️ 서빙 종 울리기',
        desc: '접시에 올린 음료를 오른쪽 <b>[🛎️ 종]</b>을 눌러 손님에게 전달하세요!',
        targetSelector: '#tycoon-service-bell-img',
        mode: 'CLICK_TARGET',
        handLabel: '🛎️ 종 터치!',
        pins: [
          { selector: '#tycoon-center-plate-btn', label: '중앙 접시 (완성 음료)', color: 'sky' }
        ],
        afterClick: () => {
          if (this.app?.tycoonView) {
            const tv = this.app.tycoonView;
            tv._isTutorialPaused = false;
            // 튜토리얼 1잔 서빙 연습 종료 후 로비로 복귀 (이후 연구실에서 나머지 음료를 직접 해금하도록 유도)
            setTimeout(() => {
              tv._stopTimerLoop();
              tv.engine.session.status = 'LOBBY';
              tv._syncGlobalTabBarVisibility(false);
              tv.render();
              this.app?.switchTab?.('brew');
              this.app?.showToast?.('🎉 튜토리얼 완료! 연구실에서 새 음료들을 조합하고 정식 영업을 시작해보세요!');
            }, 650);
          }
        }
      }
    ];
  }

  _runLiveStepSetupAndRender(stepIdx) {
    if (!this._liveTutorialSteps || stepIdx >= this._liveTutorialSteps.length) {
      this.stopInteractiveTutorial(true);
      return;
    }

    this._liveStepIdx = stepIdx;
    const step = this._liveTutorialSteps[stepIdx];
    if (typeof step.setup === 'function') {
      step.setup();
    }

    requestAnimationFrame(() => {
      this._renderCurrentLiveStep(false);
    });
  }

  _renderCurrentLiveStep(isResizeOnly = false) {
    const layer = document.getElementById('live-interactive-tutorial-layer');
    if (!layer || !this._liveTutorialSteps) return;

    const step = this._liveTutorialSteps[this._liveStepIdx];
    if (!step) {
      this.stopInteractiveTutorial(true);
      return;
    }

    const targetEl = document.querySelector(step.targetSelector);
    if (!targetEl) {
      // 타겟 요소를 아직 찾지 못한 경우 짧게 재시도
      setTimeout(() => {
        if (document.getElementById('live-interactive-tutorial-layer')) {
          this._renderCurrentLiveStep(true);
        }
      }, 120);
      return;
    }

    if (!isResizeOnly && typeof targetEl.scrollIntoView === 'function') {
      try {
        targetEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } catch (_) {}
    }

    const rect = targetEl.getBoundingClientRect();
    const viewportW = window.innerWidth || 390;
    const viewportH = window.innerHeight || 720;
    const isTabBtn = targetEl.classList.contains('tab-btn');
    const pad = isTabBtn ? 0 : 4;
    const rawLeft = Math.round(rect.left - pad);
    const rawTop = Math.round(rect.top - pad);
    const rawRight = Math.round(rect.right + pad);
    const rawBottom = Math.round(rect.bottom + pad);
    const holeLeft = Math.max(1, rawLeft);
    const holeTop = Math.max(1, rawTop);
    const holeRight = Math.min(viewportW - 1, rawRight);
    const holeBottom = Math.min(viewportH - 1, rawBottom);
    const holeWidth = Math.max(24, holeRight - holeLeft);
    const holeHeight = Math.max(24, holeBottom - holeTop);

    // 보조 핀 배지 렌더링 (실제 DOM 요소 좌표 위에 투명하게 오버랩)
    const pinsHtml = (step.pins || []).map(p => {
      const pinEl = document.querySelector(p.selector);
      if (!pinEl) return '';
      const pr = pinEl.getBoundingClientRect();
      if (pr.width === 0 && pr.height === 0) return '';
      const pLeft = Math.round(pr.left - 3);
      const pTop = Math.round(pr.top - 3);
      const pWidth = Math.round(pr.width + 6);
      const pHeight = Math.round(pr.height + 6);
      return `
        <div class="coach-pin-outline pin-${p.color || 'sky'}"
             style="left:${pLeft}px; top:${pTop}px; width:${pWidth}px; height:${pHeight}px;">
          <span class="coach-pin-tag tag-${p.color || 'sky'}">${p.label}</span>
        </div>
      `;
    }).join('');

    // 설명 카드 위치 자동 배치 (타겟이 화면 하단이면 상단에, 상단이면 하단에 배치하여 타겟을 절대 가리지 않음)
    const targetCenterY = holeTop + holeHeight / 2;
    const placeCardAtTop = targetCenterY > viewportH * 0.52;
    const cardPosStyle = placeCardAtTop
      ? `top: 16px;`
      : `bottom: 18px;`;

    const isClickMode = step.mode === 'CLICK_TARGET';
    const totalSteps = this._liveTutorialSteps.length;
    const currentStepNum = this._liveStepIdx + 1;
    const progressPercent = Math.min(100, Math.round((currentStepNum / totalSteps) * 100));
    const isLastLiveStep = this._liveStepIdx === totalSteps - 1;

    let nextBtnText = isLastLiveStep ? '완료하기 🎉' : '다음 ▸';
    if (!isClickMode && step.nextBtnLabel) {
      nextBtnText = step.nextBtnLabel;
    }

    layer.innerHTML = `
      <!-- 실제 타겟 요소를 비추는 반투명 다크 스포트라이트 홀 -->
      <div class="coach-spotlight-hole ${isClickMode ? 'is-clickable' : 'is-readonly'}"
           id="coach-spotlight-hole"
           style="left:${holeLeft}px; top:${holeTop}px; width:${holeWidth}px; height:${holeHeight}px;"
           title="${isClickMode ? '깜빡이는 영역을 터치하세요!' : ''}">
        ${isClickMode ? `
          <div class="coach-hand-pointer ${holeTop > viewportH * 0.78 ? 'point-from-top' : 'point-from-bottom'}">
            <span class="coach-hand-emoji">${holeTop > viewportH * 0.78 ? '👇' : '👆'}</span>
            <span class="coach-hand-label">${step.handLabel || '여기를 터치!'}</span>
          </div>
        ` : ''}
      </div>

      <!-- 실제 화면 위 보조 핀 하이라이트 -->
      ${pinsHtml}

      <!-- 반투명 코치마크 가이드 설명 카드 -->
      <div class="coach-message-card" style="${cardPosStyle}">
        <!-- 상단 미니 프로그레스 바 -->
        <div class="coach-progress-bar-wrap">
          <div class="coach-progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <div class="coach-card-top">
          <span class="coach-step-badge">${step.stepBadge || `${currentStepNum} / ${totalSteps}`}</span>
          <button type="button" class="coach-skip-btn" id="coach-skip-tutorial-btn">건너뛰기 ✕</button>
        </div>
        <h4 class="coach-card-title">${step.title}</h4>
        <div class="coach-card-desc">${step.desc}</div>
        <div class="coach-card-footer">
          <span class="coach-action-hint">
            ${isClickMode ? '👇 버튼을 직접 누르거나' : '💡 확인 후'}
          </span>
          <button type="button" class="coach-next-step-btn ${isLastLiveStep ? 'is-finish' : ''}" id="coach-next-step-btn">
            ${nextBtnText}
          </button>
        </div>
      </div>
    `;

    // 스킵 버튼
    const skipBtn = layer.querySelector('#coach-skip-tutorial-btn');
    if (skipBtn) {
      skipBtn.onclick = (e) => {
        e.stopPropagation();
        this.audio?.playTap?.();
        this.stopInteractiveTutorial(true);
      };
    }

    // NEXT_BTN 및 CLICK_TARGET 모드 공용 다음 버튼 (어디서든 [다음]을 눌러 직관적 진행 가능!)
    const nextBtn = layer.querySelector('#coach-next-step-btn');
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        this.audio?.playTap?.();

        if (isClickMode) {
          if (typeof step.beforeClick === 'function') {
            step.beforeClick();
          }
          if (targetEl && typeof targetEl.click === 'function') {
            targetEl.click();
          }
          const delayMs = step.afterClickDelayMs || 80;
          setTimeout(() => {
            if (typeof step.afterClick === 'function') {
              step.afterClick();
            }
            this._runLiveStepSetupAndRender(this._liveStepIdx + 1);
          }, delayMs);
        } else {
          this._runLiveStepSetupAndRender(this._liveStepIdx + 1);
        }
      };
    }

    // CLICK_TARGET 모드: 스포트라이트 홀을 누르면 실제 DOM 버튼을 클릭 실행하고 다음 스텝으로 진행!
    const holeEl = layer.querySelector('#coach-spotlight-hole');
    if (holeEl && isClickMode) {
      holeEl.onclick = (e) => {
        e.stopPropagation();
        if (typeof step.beforeClick === 'function') {
          step.beforeClick();
        }

        // 실제 화면의 타겟 버튼 클릭 실행!
        targetEl.click();

        const delayMs = step.afterClickDelayMs || 80;
        setTimeout(() => {
          if (typeof step.afterClick === 'function') {
            step.afterClick();
          }
          this._runLiveStepSetupAndRender(this._liveStepIdx + 1);
        }, delayMs);
      };
    }

    // 어두운 배경 클릭 시 스포트라이트 강조 흔들림 피드백
    layer.onclick = (e) => {
      if (e.target === layer && holeEl) {
        this.audio?.playTap?.();
        holeEl.classList.remove('coach-pulse-warn');
        void holeEl.offsetWidth;
        holeEl.classList.add('coach-pulse-warn');
      }
    };
  }
}

window.KSool.StoryTutorialModalView = StoryTutorialModalView;
