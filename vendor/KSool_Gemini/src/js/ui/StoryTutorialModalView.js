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
        stepLabel: 'GUIDE 01 · 연구실 조합 & 해금',
        speaker: '조작 가이드 1/4',
        line1: '① [🔬 연구실]에서 재료를 골라 담고 [조합하기]를 눌러 음료를 해금하세요!',
        line2: '잘못 담은 재료는 [비우기]로 비우고, 판매 수익(💰)으로 [🛒 재료구매]에서 새 재료를 늘려갑니다.'
      },
      {
        type: 'TUTORIAL',
        guideKey: 'LAB_HINT',
        stepLabel: 'GUIDE 02 · 막힐 때 힌트 쓰는 법',
        speaker: '조작 가이드 2/4',
        line1: '② 조합이 어려울 땐 문제 카드의 3가지 힌트 위치를 활용하세요!',
        line2: '[❓아이콘]은 외형 그림, [🔒설명란]은 은박 복권 단서, [힌트] 버튼은 들어가는 재료·개수를 알려줍니다.'
      },
      {
        type: 'TUTORIAL',
        guideKey: 'TYCOON_SERVE',
        stepLabel: 'GUIDE 03 · 주점 제조 & 종(🛎️) 서빙',
        speaker: '조작 가이드 3/4',
        line1: '③ 손님 주문을 보고 하단에서 [⚗️조합]한 뒤, 오른쪽 [🛎️종]을 눌러 서빙하세요!',
        line2: '조합하면 카운터 중앙 접시에 올라갑니다. 그 상태에서 오른쪽 종을 터치하면 판매 완료!'
      },
      {
        type: 'TUTORIAL',
        guideKey: 'TYCOON_RULES',
        stepLabel: 'GUIDE 04 · 가격(메뉴판) · 콤보 · 주의사항',
        speaker: '조작 가이드 4/4',
        line1: '④ 음료 가격은 [📋메뉴판]에서 확인하고, 연속 서빙으로 [COMBO +N원] 보너스를 챙기세요!',
        line2: '제한시간 게이지가 다 닳거나 다른 음료를 서빙하면 손님이 집으로 돌아가고 콤보가 초기화됩니다!'
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
          <!-- 실제 연구실 화면 레이아웃 -->
          <div class="gm-lab-top-bar">
            <span class="gm-pill">🍋 길거리 노점</span>
            <span class="gm-gold">💰 120원</span>
          </div>

          <div class="gm-cat-row" style="margin-bottom:4px;">
            <span class="gm-cat active" style="flex:1; text-align:center;">🎯 단계별 연구 모드</span>
            <span class="gm-cat gm-shop-btn gm-highlight-target target-amber" style="flex:1; text-align:center;">
              🛒 재료 상점
              <span class="gm-badge-num badge-amber">③</span>
            </span>
          </div>

          <div class="gm-quiz-box">
            <div class="gm-quiz-icon">🥤</div>
            <div class="gm-quiz-info">
              <div class="gm-quiz-title">탄산수 <small>No.02 / 84</small></div>
              <div class="gm-quiz-desc">💡 물과 공기가 만나 톡 쏘는 탄산수가 됩니다.</div>
            </div>
          </div>

          <div class="gm-pot-area">
            <div class="gm-pot-slots">
              <div class="gm-slot filled">💧<span>물</span><b>1</b></div>
              <div class="gm-slot filled">💨<span>공기</span><b>1</b></div>
              <div class="gm-slot">➕</div>
              <div class="gm-slot">➕</div>
            </div>
            <div class="gm-pot-btns">
              <div class="gm-mix-btn gm-highlight-target target-emerald">
                🔬 조합하기
                <span class="gm-badge-num badge-emerald">②</span>
              </div>
              <div class="gm-clear-btn gm-highlight-target target-rose">
                비우기
              </div>
            </div>
          </div>

          <div class="gm-ings-section">
            <div class="gm-cat-row">
              <span class="gm-cat active">원소/자연</span>
              <span class="gm-cat">감미료</span>
              <span class="gm-cat">과일</span>
            </div>
            <div class="gm-ings-grid gm-highlight-target target-sky">
              <span class="gm-badge-num badge-sky">①</span>
              <div class="gm-ing selected">💧<span>물</span></div>
              <div class="gm-ing">❄️<span>눈</span></div>
              <div class="gm-ing selected">💨<span>공기</span></div>
              <div class="gm-ing">🍬<span>설탕</span></div>
              <div class="gm-ing">🍋<span>레몬</span></div>
            </div>
          </div>

          <!-- 반투명 오버레이 설명 카드 레이어 -->
          <div class="gm-translucent-callouts-layer">
            <div class="gm-callout-card callout-sky" style="bottom: 62px; left: 8px;">
              <b>① 재료 선택 & 비우기</b>
              <span>하단 재료를 눌러 슬롯에 담고, 잘못 담았을 땐 <em>[비우기]</em>로 초기화!</span>
            </div>
            <div class="gm-callout-card callout-emerald" style="top: 44px; right: 8px;">
              <b>② [🔬 조합하기]로 음료 해금</b>
              <span>조합이 맞으면 새 음료가 해금되어 점포에서 팔 수 있어요! (최소 3종 해금)</span>
            </div>
            <div class="gm-callout-card callout-amber" style="bottom: 118px; right: 8px;">
              <b>③ 상단 [🛒 재료 상점] 토글에서 재료 구매</b>
              <span>점포에서 번 자금으로 상점 재료를 하나씩 구매!</span>
            </div>
          </div>
        </div>
      `;
    }

    if (guideKey === 'LAB_HINT') {
      return `
        <div class="guide-screen-mockup hint-mockup">
          <!-- 실제 연구실 문제 카드 & 힌트 버튼 위치 -->
          <div class="gm-section-label">🔬 연구실 상단 문제 카드 (힌트 위치 3곳)</div>
          <div class="gm-quiz-box gm-quiz-large">
            <div class="gm-quiz-col-left">
              <div class="gm-quiz-icon locked gm-highlight-target target-sky">
                ❓
                <span class="gm-badge-num badge-sky">①</span>
              </div>
              <div class="gm-hint-btn gm-highlight-target target-amber">
                힌트
                <span class="gm-badge-num badge-amber">③</span>
              </div>
            </div>
            <div class="gm-quiz-info">
              <div class="gm-quiz-title">레모네이드 <small>No.05 / 84</small></div>
              <div class="gm-locked-desc-bar gm-highlight-target target-emerald">
                🔒 설명 힌트 잠김 (클릭하여 해금)
                <span class="gm-badge-num badge-emerald">②</span>
              </div>
            </div>
          </div>

          <!-- 힌트 팝업 미리보기 + 반투명 오버레이 -->
          <div class="gm-hint-popup-preview">
            <div class="gm-popup-hdr">💡 힌트 팝업에서 제공되는 3가지 도움말</div>
            <div class="gm-hint-explain-list">
              <div class="gm-hint-explain-item item-sky">
                <span class="gm-step-circle sky">①</span>
                <div>
                  <b>[❓ 아이콘] 터치 → 외형 그림 힌트</b>
                  <small>미니게임을 통해 완성될 음료의 생김새(아이콘)를 미리 확인합니다.</small>
                </div>
              </div>
              <div class="gm-hint-explain-item item-emerald">
                <span class="gm-step-circle emerald">②</span>
                <div>
                  <b>[🔒 설명 힌트 잠김] 터치 → 은박 복권 단서</b>
                  <small>은박지를 긁어 어떤 재료가 들어가는지 문장 힌트를 확인합니다.</small>
                </div>
              </div>
              <div class="gm-hint-explain-item item-amber">
                <span class="gm-step-circle amber">③</span>
                <div>
                  <b>[힌트] 버튼 터치 → 베이스볼 재료·비율 추리</b>
                  <small>투입한 재료 중 몇 종류가 맞았는지(S/B) 추리하여 정답 조합을 찾습니다.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (guideKey === 'TYCOON_SERVE') {
      return `
        <div class="guide-screen-mockup tycoon-mockup">
          <!-- 상단 실제 주점 카운터 화면 -->
          <div class="gm-counter-scene" style="background-image: url('./assets/tycoon/bg_stage_1.jpg?v=2');">
            <div class="gm-counter-dim"></div>

            <!-- 손님 & 주문 말풍선 -->
            <div class="gm-cust-avatar">🧑‍🌾</div>
            <div class="gm-order-bubble">
              <span class="gm-bubble-drink">🥤 칠성사이다</span>
              <div class="gm-bubble-gauge"><div class="gm-gauge-fill" style="width:78%;"></div></div>
            </div>

            <!-- 중앙 접시 (②) -->
            <div class="gm-plate-spot gm-highlight-target target-sky">
              <span class="gm-badge-num badge-sky">②</span>
              <span class="gm-plate-drink">🥤</span>
              <small>칠성사이다</small>
            </div>

            <!-- 오른쪽 종 (③) -->
            <div class="gm-bell-spot gm-highlight-target target-amber">
              <span class="gm-badge-num badge-amber">③</span>
              <span class="gm-bell-ring-txt">🛎️ 종 터치!</span>
            </div>

            <!-- 상단 카운터 반투명 오버레이 콜아웃 -->
            <div class="gm-callout-card callout-sky" style="top: 8px; left: 8px;">
              <b>② 중앙 접시 확인</b>
              <span>조합 완성 시 카운터 중앙 접시 위에 올라감</span>
            </div>
            <div class="gm-callout-card callout-amber" style="top: 8px; right: 8px;">
              <b>③ 오른쪽 [🛎️종] 서빙!</b>
              <span>접시에 올린 뒤 종을 터치하면 서빙 완료!</span>
            </div>
          </div>

          <!-- 하단 실제 주점 조리대 화면 -->
          <div class="gm-tycoon-bottom">
            <div class="gm-tycoon-pot-row">
              <div class="gm-mini-slots">
                <div class="gm-mini-slot">🥤 탄산수 <b>1</b></div>
                <div class="gm-mini-slot">🍬 설탕 <b>1</b></div>
                <div class="gm-mini-slot empty">➕</div>
              </div>
              <div class="gm-mini-actions">
                <div class="gm-mini-craft gm-highlight-target target-emerald">
                  ⚗️조합
                  <span class="gm-badge-num badge-emerald">①</span>
                </div>
                <div class="gm-mini-clear">비우기</div>
              </div>
            </div>
            <div class="gm-tycoon-ings-row gm-highlight-target target-emerald">
              <div class="gm-mini-ing">💧 물</div>
              <div class="gm-mini-ing">💨 공기</div>
              <div class="gm-mini-ing active">🥤 탄산수</div>
              <div class="gm-mini-ing active">🍬 설탕</div>
              <div class="gm-mini-ing">🍋 레몬</div>
            </div>
            <div class="gm-callout-card callout-emerald gm-bottom-Floating-callout">
              <b>① 주문 음료 재료 선택 & [⚗️조합] (실수 시 [비우기])</b>
              <span>손님 말풍선(칠성사이다)을 보고 외운 재료를 담아 <em>[⚗️조합]</em>을 누르세요!</span>
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

          <!-- 손님 머리 위 COMBO +3 / +36원 (②) -->
          <div class="gm-head-combo-popup gm-highlight-target target-emerald">
            <span class="gm-badge-num badge-emerald">②</span>
            <div class="gm-combo-txt">COMBO +3</div>
            <div class="gm-earn-txt">+36원</div>
          </div>

          <!-- 손님 & 제한시간 임박 말풍선 (③) -->
          <div class="gm-cust-avatar">🧑‍💼</div>
          <div class="gm-order-bubble urgent gm-highlight-target target-rose">
            <span class="gm-badge-num badge-rose">③</span>
            <span class="gm-bubble-drink">🍋 레모네이드</span>
            <div class="gm-bubble-gauge"><div class="gm-gauge-fill danger" style="width:22%;"></div></div>
          </div>

          <!-- 왼쪽 메뉴판 버튼 (①) -->
          <div class="gm-menu-board-spot gm-highlight-target target-sky">
            <span class="gm-badge-num badge-sky">①</span>
            📋 메뉴판
          </div>

          <!-- 메뉴판 가격 팝업 미니 프리뷰 -->
          <div class="gm-menu-popup-mini">
            <div class="gm-mp-title">📋 점포 판매 메뉴 (가격·조합법)</div>
            <div class="gm-mp-row"><span>No.02 탄산수</span><b>💰 24원</b></div>
            <div class="gm-mp-row"><span>No.03 칠성사이다</span><b>💰 33원</b></div>
            <div class="gm-mp-row"><span>No.04 레모네이드</span><b>💰 41원</b></div>
          </div>
        </div>

        <!-- 하단 3대 핵심 규칙 요약 레이어 -->
        <div class="gm-rules-summary-box">
          <div class="gm-hint-explain-item item-sky">
            <span class="gm-step-circle sky">①</span>
            <div>
              <b>음료수 가격 & 레시피 확인 → 왼쪽 [📋 메뉴판]</b>
              <small>카운터 왼쪽 메뉴판을 누르면 음료당 가격(💰)과 조합법을 확인할 수 있습니다.</small>
            </div>
          </div>
          <div class="gm-hint-explain-item item-emerald">
            <span class="gm-step-circle emerald">②</span>
            <div>
              <b>연속 서빙 성공 → 머리 위 [COMBO +N] 보너스!</b>
              <small>연속 정답 시 콤보 수만큼 보너스 금액(예: 3콤보 = 음료 가격 + 3원)을 추가로 받습니다.</small>
            </div>
          </div>
          <div class="gm-hint-explain-item item-rose">
            <span class="gm-step-circle rose">③</span>
            <div>
              <b>주의! 제한시간 초과 · 오답 서빙 시 손님 퇴장 & 콤보 초기화</b>
              <small>시간 게이지가 다 닳거나 다른 음료를 내면 손님이 집으로 돌아가고 콤보가 끊깁니다!</small>
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
            SKIP ▸▸
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
            <span class="cutscene-tap-prompt">${isLast ? '터치하여 시작하기 ▸' : '화면을 터치하여 계속 ▸'}</span>
          </div>
        </div>
      </div>
    `;

    const tapSurface = container.querySelector('#cutscene-tap-surface');
    if (tapSurface) {
      tapSurface.onclick = (e) => {
        if (e.target.closest('#cutscene-skip-btn') || e.target.closest('#cutscene-prev-btn')) {
          return;
        }
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
    const layer = document.getElementById('live-interactive-tutorial-layer');
    if (layer) layer.remove();

    if (this._boundCoachResize) {
      window.removeEventListener('resize', this._boundCoachResize);
      this._boundCoachResize = null;
    }

    if (this.inventory) {
      this.inventory._forceTutorialLockedHintPreview = false;
      this.inventory._forceTutorialLockedRecipe12 = false;
      // 튜토리얼 종료 시 기본 스타터 레시피(얼음·탄산수·사이다·레모네이드) 해금 보장
      [11, 12, 58, 14].forEach(rId => this.inventory.unlockedRecipeIds.add(rId));
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
        stepBadge: 'STEP 1 / 12 · 연구실 이동',
        title: '① 하단의 [🔬 연구실] 탭을 눌러보세요!',
        desc: '점포에서 음료를 팔려면 먼저 연구실에서 판매할 음료를 해금해야 합니다.<br/>화면 맨 아래 <b>[🔬 연구실]</b> 탭 버튼을 실제로 눌러 이동해보세요!',
        targetSelector: '.tab-btn[data-tab-target="brew"]',
        mode: 'CLICK_TARGET',
        handLabel: '연구실 터치!',
        setup: () => {
          if (this.app) {
            this.app.switchTab('tycoon');
          }
        }
      },
      // STEP 2: 연구실 화면 -> 문제 카드의 3가지 힌트 위치 스포트라이트 안내 (힌트 미니게임 진입 없이 위치만 설명)
      {
        stepBadge: 'STEP 2 / 12 · 막힐 때 힌트 쓰는 법',
        title: '② 조합이 어려울 땐 문제 카드의 3곳을 활용하세요!',
        desc: '<b>① 왼쪽 [❓ 아이콘]</b>: 완성 음료 외형 그림 힌트<br/><b>② 중앙 [🔒 설명 힌트 잠김]</b>: 은박지를 긁어 보는 재료 문장 단서<br/><b>③ 아래 [힌트] 버튼</b>: 베이스볼 추리로 재료 종류·비율 확인',
        targetSelector: '#brew-step-quiz-bar .brew-quiz-card',
        mode: 'NEXT_BTN',
        nextBtnLabel: '다음: 직접 재료 담아보기 ▸',
        pins: [
          { selector: '#quiz-mystery-icon', label: '① 외형 힌트', color: 'sky' },
          { selector: '#quiz-locked-desc-btn', label: '② 설명 복권', color: 'emerald' },
          { selector: '#quiz-open-hint-btn', label: '③ 재료·비율 힌트', color: 'amber' }
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
      // STEP 3: 연구실 화면 -> 하단 재료에서 [💧 물] 실제 클릭 유도
      {
        stepBadge: 'STEP 3 / 12 · 재료 선택 (1/2)',
        title: '③ 하단 재료에서 [💧 물] 카드를 실제로 눌러보세요!',
        desc: '문제 카드의 단서(<em>“물과 공기가 만나 톡 쏘는 탄산수가 됩니다”</em>)를 보고,<br/>하단 재료 목록에서 <b>[💧 물]</b> 카드를 터치해 슬롯에 담아보세요!',
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
      // STEP 4: 연구실 화면 -> 하단 재료에서 [💨 공기] 실제 클릭 유도 & [비우기] 위치 안내
      {
        stepBadge: 'STEP 4 / 12 · 재료 선택 (2/2) & 비우기 안내',
        title: '④ 이어서 옆의 [💨 공기] 카드를 눌러보세요!',
        desc: '물 1개가 슬롯에 담겼어요! 이제 <b>[💨 공기]</b> 카드를 실제로 터치하세요.<br/>(※ 만약 잘못된 재료를 넣었을 땐 우측 <b>[비우기]</b> 버튼으로 언제든 초기화할 수 있어요!)',
        targetSelector: '#ingredients-grid [data-base-ing-id="205"]',
        mode: 'CLICK_TARGET',
        handLabel: '💨 공기 터치!',
        pins: [
          { selector: '#clear-pot-btn', label: '실수 시 [비우기]', color: 'rose' }
        ]
      },
      // STEP 5: 연구실 화면 -> [🔬 조합하기] 실제 클릭하여 탄산수 해금!
      {
        stepBadge: 'STEP 5 / 12 · 조합하기 & 레시피 해금',
        title: '⑤ [🔬 조합하기] 버튼을 눌러 음료를 해금하세요!',
        desc: '슬롯에 <b>물 1 + 공기 1</b>이 담겼습니다! 깜빡이는 <b>[🔬 조합하기]</b> 버튼을 실제로 눌러 탄산수를 해금하세요!<br/>(※ 판매 수익을 모으면 상단 <b>[🛒 재료 상점]</b> 토글 탭에서 새 재료를 구매할 수 있어요)',
        targetSelector: '#mix-btn',
        mode: 'CLICK_TARGET',
        handLabel: '조합하기 터치!',
        pins: [
          { selector: '.brew-mode-tab-btn[data-brew-mode="SHOP"]', label: '새 재료 구매는 [🛒재료 상점]', color: 'amber' }
        ],
        beforeClick: () => {
          if (this.inventory) {
            this.inventory._forceTutorialLockedRecipe12 = false;
            this.inventory.unlockedRecipeIds.delete(12);
          }
        },
        afterClickDelayMs: 650,
        afterClick: () => {
          // 결과 모달 자동 닫기 및 첫 노점 영업용 기본 음료(얼음·탄산수·사이다·레모네이드) 준비
          const resModal = document.getElementById('result-modal');
          if (resModal) resModal.classList.remove('active');
          if (this.inventory) {
            [11, 12, 58, 14].forEach(rId => this.inventory.unlockedRecipeIds.add(rId));
            this.inventory._syncStepAndIngredients?.();
            this.inventory.save();
          }
          this.app?.renderBrewView?.();
        }
      },
      // STEP 6: 연구실 화면 -> 하단 [🏪 점포] 탭 실제 클릭 유도
      {
        stepBadge: 'STEP 6 / 12 · 점포로 이동',
        title: '⑥ 해금한 음료를 팔러 하단 [🏪 점포] 탭을 눌러보세요!',
        desc: '길거리 노점에서 판매할 기본 음료가 준비되었습니다!<br/>화면 맨 아래의 <b>[🏪 점포]</b> 탭을 실제로 터치해 가게로 이동하세요!',
        targetSelector: '.tab-btn[data-tab-target="tycoon"]',
        mode: 'CLICK_TARGET',
        handLabel: '🏪 점포 터치!'
      },
      // STEP 7: 점포 로비 화면 -> [🏪 영업 시작하기] 실제 클릭 유도
      {
        stepBadge: 'STEP 7 / 12 · 점포 영업 시작',
        title: '⑦ [🏪 영업 시작하기] 버튼을 눌러 손님을 맞이하세요!',
        desc: '점포 영업을 시작하면 목표 판매량(5잔)을 팔 때마다 일일 수익이 정산됩니다.<br/>실제 <b>[🏪 영업 시작하기]</b> 버튼을 눌러 첫 영업을 시작해보세요!',
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
      // STEP 8: 실제 주점 카운터 화면 -> [📋 메뉴판] 가격 확인 & 손님 말풍선 제한시간 안내
      {
        stepBadge: 'STEP 8 / 12 · 메뉴판 가격 & 제한시간 확인',
        title: '⑧ 카운터의 [📋 메뉴판]과 손님 주문 말풍선을 확인하세요!',
        desc: '<b>① 왼쪽 [📋 메뉴판]</b>: 음료수당 <b>판매 가격(💰)</b>과 해금한 레시피 조합법이 표시됩니다.<br/><b>② 손님 말풍선 & 초록색 바</b>: 손님이 원하는 음료(<b>탄산수</b>)와 남은 대기시간입니다. 게이지가 다 닳기 전에 서빙해야 해요!',
        targetSelector: '.tycoon-counter-scene',
        mode: 'NEXT_BTN',
        nextBtnLabel: '다음: 주문 음료 제조하기 ▸',
        pins: [
          { selector: '#tycoon-counter-menu-hotspot', label: '① 📋 메뉴판 (가격·조합법)', color: 'sky' },
          { selector: '#tycoon-order-bubble', label: '② 주문 음료 & 제한시간 바', color: 'emerald' }
        ]
      },
      // STEP 9: 실제 주점 하단 조리대 -> [💧 물] 실제 클릭 유도
      {
        stepBadge: 'STEP 9 / 12 · 주점 재료 선택 (1/2)',
        title: '⑨ 손님이 주문한 [탄산수]를 위해 [💧 물]을 터치하세요!',
        desc: '말풍선의 <b>[탄산수]</b> 주문을 보고, 하단 조리대에서 실제 <b>[💧 물]</b> 카드를 터치해 슬롯에 1개 담아보세요!',
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
        stepBadge: 'STEP 10 / 12 · 주점 재료 선택 (2/2) & 비우기 안내',
        title: '⑩ 이어서 옆의 [💨 공기] 카드를 터치하세요!',
        desc: '이제 <b>[💨 공기]</b> 카드를 실제로 눌러 물 1 + 공기 1을 맞추세요!<br/>(※ 조리 중 다른 재료를 잘못 넣었을 땐 우측 <b>[비우기]</b> 버튼으로 즉시 비울 수 있습니다)',
        targetSelector: '.tycoon-ings-scroll-grid [data-tycoon-base-ing="205"]',
        mode: 'CLICK_TARGET',
        handLabel: '💨 공기 터치!',
        pins: [
          { selector: '#tycoon-clear-pot-btn', label: '실수 시 [비우기]', color: 'rose' }
        ]
      },
      // STEP 11: 실제 주점 하단 조리대 -> [⚗️조합] 실제 클릭하여 접시에 올리기
      {
        stepBadge: 'STEP 11 / 12 · 접시 위에 올리기',
        title: '⑪ [⚗️조합] 버튼을 실제로 눌러 접시 위에 올리세요!',
        desc: '재료 비율이 맞으면 버튼에 <b>[🍽️탄산수]</b>가 표시됩니다.<br/>깜빡이는 <b>[⚗️조합]</b> 버튼을 눌러 카운터 중앙 접시 위에 완성 음료를 올려보세요!',
        targetSelector: '#tycoon-craft-stock-btn',
        mode: 'CLICK_TARGET',
        handLabel: '⚗️조합 터치!'
      },
      // STEP 12: 실제 주점 카운터 -> 오른쪽 [🛎️ 서빙 종] 실제 터치 서빙 & 콤보·주의사항 안내
      {
        stepBadge: 'STEP 12 / 12 · 종(🛎️) 서빙 & 콤보·주의사항',
        title: '⑫ 오른쪽 [🛎️ 서빙 종]을 터치해 판매를 완료하세요!',
        desc: '<b>🛎️ 서빙 방법</b>: 중앙 접시에 음료를 올린 뒤 오른쪽 <b>[🛎️ 종]</b>을 터치하면 판매됩니다!<br/><b>🔥 연속 서빙(COMBO +N)</b>: 연속으로 올바르게 서빙하면 손님 머리 위에 <b>COMBO +N</b>이 뜨며 <b>콤보 수만큼 보너스(+N원)</b>를 더 받아요!<br/><b>⚠️ 주의사항</b>: 제한시간이 지나거나 다른 음료를 내면 <b>손님이 집으로 돌아가고 콤보가 끊깁니다!</b>',
        targetSelector: '#tycoon-service-bell-img',
        mode: 'CLICK_TARGET',
        handLabel: '🛎️ 종 터치!',
        pins: [
          { selector: '#tycoon-center-plate-btn', label: '중앙 접시 (탄산수)', color: 'sky' }
        ],
        afterClick: () => {
          if (this.app?.tycoonView) {
            this.app.tycoonView._isTutorialPaused = false;
          }
          this.app?.showToast?.('🎉 실전 튜토리얼 완료! 이제 손님들에게 음료를 만들어 판매해보세요!');
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
    const pad = 5;
    const holeLeft = Math.max(4, Math.round(rect.left - pad));
    const holeTop = Math.max(4, Math.round(rect.top - pad));
    const holeWidth = Math.round(rect.width + pad * 2);
    const holeHeight = Math.round(rect.height + pad * 2);

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
    const viewportH = window.innerHeight || 720;
    const targetCenterY = holeTop + holeHeight / 2;
    const placeCardAtTop = targetCenterY > viewportH * 0.52;
    const cardPosStyle = placeCardAtTop
      ? `top: 16px;`
      : `bottom: 18px;`;

    const isClickMode = step.mode === 'CLICK_TARGET';

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
        <div class="coach-card-top">
          <span class="coach-step-badge">${step.stepBadge}</span>
          <button type="button" class="coach-skip-btn" id="coach-skip-tutorial-btn">튜토리얼 종료 ✕</button>
        </div>
        <h4 class="coach-card-title">${step.title}</h4>
        <div class="coach-card-desc">${step.desc}</div>
        <div class="coach-card-footer">
          ${isClickMode
            ? `<span class="coach-action-hint">👆 화면의 빛나는 실제 버튼을 직접 눌러보세요!</span>`
            : `<button type="button" class="coach-next-step-btn" id="coach-next-step-btn">${step.nextBtnLabel || '다음 단계로 ▸'}</button>`
          }
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

    // NEXT_BTN 모드 버튼
    const nextBtn = layer.querySelector('#coach-next-step-btn');
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        this.audio?.playTap?.();
        this._runLiveStepSetupAndRender(this._liveStepIdx + 1);
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
