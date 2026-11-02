window.KSool = window.KSool || {};

class KSoolApp {
  constructor() {
    this.config = new window.KSool.GameConfig();
    this.brandResolver = new window.KSool.BrandResolver(this.config);
    this.audio = new window.KSool.AudioService();
    this.storage = new window.KSool.StorageService();
    this.recipeBook = new window.KSool.RecipeBook();
    this.craftingPot = new window.KSool.CraftingPot(this.config);
    this.inventory = new window.KSool.InventoryManager(this.recipeBook, this.storage);
    this.feedbackStrategy = new window.KSool.NullFeedbackStrategy();

    this.baseballEngine = new window.KSool.BaseballHintEngine(this.recipeBook, this.inventory);
    this.ratioProvider = new window.KSool.UpDownRatioGameProvider(this.recipeBook, this.inventory);
    this.pickerRegistry = new window.KSool.DetailPickerRegistry(this.brandResolver, this.inventory, this.audio);
    this.suggestionService = new window.KSool.SuggestionService(this.recipeBook, this.inventory, this.brandResolver);
    this.fridgeEngine = new window.KSool.FridgeMatcherEngine(this.recipeBook, this.inventory, this.suggestionService);

    this.alchemyEngine = new window.KSool.AlchemyEngine({
      config: this.config,
      recipeBook: this.recipeBook,
      craftingPot: this.craftingPot,
      inventory: this.inventory,
      feedbackStrategy: this.feedbackStrategy,
      audio: this.audio
    });

    this.hintModalView = new window.KSool.HintModalView({
      recipeBook: this.recipeBook,
      inventory: this.inventory,
      baseballEngine: this.baseballEngine,
      ratioProvider: this.ratioProvider,
      brandResolver: this.brandResolver,
      audio: this.audio,
      app: this,
      onImageUnlocked: () => {
        this.renderBrewView();
        this.renderCollectionView();
      },
      onDescUnlocked: () => {
        this.renderBrewView();
        this.renderCollectionView();
      },
      onAutoSetupBrew: (recipeId) => {
        this.autoSetupPotFromRecipe(recipeId);
      }
    });

    this.recipeInspectorModalView = new window.KSool.RecipeInspectorModalView({
      recipeBook: this.recipeBook,
      inventory: this.inventory,
      suggestionService: this.suggestionService,
      brandResolver: this.brandResolver,
      audio: this.audio,
      onRecipePromoted: (newRecipe) => {
        this.renderHeader();
        this.renderCollectionView();
        this.suggestionBoardView.render();
        this.fridgeRecommenderView.render();
        this.showCraftResultModal({
          isSuccess: true,
          recipe: newRecipe,
          isNewDiscovery: true,
          newlyUnlockedIngredient: null
        });
      }
    });

    this.suggestionBoardView = new window.KSool.SuggestionBoardView({
      config: this.config,
      recipeBook: this.recipeBook,
      craftingPot: this.craftingPot,
      suggestionService: this.suggestionService,
      brandResolver: this.brandResolver,
      audio: this.audio,
      onOpenInspector: (suggestion) => {
        this.recipeInspectorModalView.open(suggestion);
      },
      onRecipePromoted: (newRecipe) => {
        this.renderHeader();
        this.renderCollectionView();
        this.fridgeRecommenderView.render();
        this.showCraftResultModal({
          isSuccess: true,
          recipe: newRecipe,
          isNewDiscovery: true,
          newlyUnlockedIngredient: null
        });
      }
    });

    this.fridgeRecommenderView = new window.KSool.FridgeRecommenderView({
      recipeBook: this.recipeBook,
      inventory: this.inventory,
      fridgeEngine: this.fridgeEngine,
      brandResolver: this.brandResolver,
      audio: this.audio,
      onShowRecipeDetail: (recipe) => {
        this.showCraftResultModal({
          isSuccess: true,
          recipe,
          isNewDiscovery: false,
          newlyUnlockedIngredient: null
        });
      }
    });

    this.partyGameHubView = new window.KSool.PartyGameHubView('view-party', {
      recipeBook: this.recipeBook,
      inventory: this.inventory,
      fridgeEngine: this.fridgeEngine,
      brandResolver: this.brandResolver,
      audio: this.audio
    });

    if (window.KSool?.SettingsModalView) {
      this.settingsModalView = new window.KSool.SettingsModalView('settings-modal', 'settings-modal-content', this);
    }

    this.currentTab = 'brew';
    this.brewMode = 'QUIZ'; // 'QUIZ' (단계별 넘버링 추리 퀴즈) | 'FREE' (자유 주조)
    this.quizTargetRecipeId = null;
    this.quizHintRevealed = false;
    this.selectedIngCategory = 'NATURE';
    this.selectedRecipeCategory = '전체';
    this.pendingTabIntroQueue = [];
  }

  async init() {
    const bundleData = await this._loadHybridData();
    // 1. 먼저 RecipeBook에 마스터 데이터를 로드해야 단계(Step) 및 넘버링을 계산할 수 있음
    this.recipeBook.load(bundleData, []);
    // 2. InventoryManager 초기화 (현재 Step 이하의 기초 재료 및 해금 재료 동기화)
    this.inventory.init();
    if (this.inventory.promotedCustomRecipes.length > 0) {
      this.recipeBook.load(bundleData, this.inventory.promotedCustomRecipes);
      this.inventory._syncStepAndIngredients();
    }
    this.inventory.save();
    this.suggestionService.init();
    this.suggestionService.onSuggestionsUpdated = () => this.suggestionBoardView?.render();
    this.fridgeEngine.init();

    const nextQuiz = this.inventory.getNextQuizRecipe();
    this.quizTargetRecipeId = nextQuiz ? nextQuiz.recipe_id : 5;

    this._bindGlobalEvents();

    // iOS 사파리 고무줄 바운스(Overscroll Rubber-banding) 원천 차단
    document.addEventListener('touchmove', (e) => {
      const scrollable = e.target.closest('.view, .recipe-list, .pot-scroll-inner, .inventory-scroll, .modal-body, .minigame-canvas, .party-view-body, .lobby-grid, .settings-modal-body, .settings-modal-card, input[type="range"]');
      if (!scrollable) {
        e.preventDefault();
      }
    }, { passive: false });


    this.renderAll();

    // 초기 로딩/새로고침 시에는 해금 탭 상태만 동기화하고, 팝업 큐는 실행하지 않습니다.
    // (안내 모달 팝업은 새로고침이 아니라 실제 플레이 진행 중에만 발생해야 함)
    this._checkProgressiveTabUnlocks(false);
  }

  /**
   * 온라인/웹서버일 경우 data/*.json을 비동기 로드하고,
   * 오프라인이나 file:// 직접 실행 시 내장 SeedDataBundle로 즉시 폴백합니다.
   */
  async _loadHybridData() {
    if (window.location.protocol === 'file:') {
      return window.KSool.SeedDataBundle;
    }
    try {
      const [categories, ingredients_base, ingredients_detail, recipes, recipe_ingredients, external_hints] =
        await Promise.all([
          fetch('./data/categories.json?v=20261101_27').then(r => r.json()),
          fetch('./data/ingredients_base.json?v=20261101_26').then(r => r.json()),
          fetch('./data/ingredients_detail.json?v=20261101_25').then(r => r.json()),
          fetch('./data/recipes.json?v=20261101_28').then(r => r.json()),
          fetch('./data/recipe_ingredients.json?v=20261101_28').then(r => r.json()),
          fetch('./data/external_hints.json?v=20261101_25').then(r => r.json())
        ]);
      return { categories, ingredients_base, ingredients_detail, recipes, recipe_ingredients, external_hints };
    } catch (_) {
      return window.KSool.SeedDataBundle;
    }
  }

  renderAll() {
    this.renderTabBar();
    this.renderHeader();
    this.renderBrewView();
    this.renderCollectionView();
    this.fridgeRecommenderView.render();
    this.suggestionBoardView.render();
    if (this.currentTab === 'party') {
      this.partyGameHubView.render();
    }
  }

  switchTab(target) {
    if (target === 'fridge') {
      this.switchTab('party');
      this.partyGameHubView.playGame('fridge');
      return;
    }

    if (!this.inventory.isTabUnlocked(target)) return;
    if (this.currentTab === 'party' && target !== 'party') {
      this.partyGameHubView.onLeavePartyTab();
    }
    this.currentTab = target;
    document.querySelectorAll('[data-tab-target]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab-target') === target);
    });
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === `view-${target}`);
    });
    this.renderAll();
  }

  renderTabBar() {
    if (this.currentTab === 'fridge' || !this.inventory.isTabUnlocked(this.currentTab)) {
      this.currentTab = 'brew';
    }

    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      const isVisible = target !== 'fridge' && this.inventory.isTabUnlocked(target);
      btn.style.display = isVisible ? '' : 'none';
      btn.classList.toggle('active', target === this.currentTab);
    });

    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === `view-${this.currentTab}`);
    });
  }

  _checkProgressiveTabUnlocks(shouldQueue = true) {
    if (this.inventory.unlockAllSandboxMode) return;

    if (!this.inventory.shownTabIntros.collection && this.inventory.craftFailCount >= 1) {
      this.inventory.shownTabIntros.collection = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('collection');
    }

    if (!this.inventory.shownTabIntros.detailPicker && this.inventory.isDetailPickerUnlocked()) {
      this.inventory.shownTabIntros.detailPicker = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('detailPicker');
    }

    if (!this.inventory.shownTabIntros.fridge && this.inventory.getUnlockProgressRatio() >= 0.5) {
      this.inventory.shownTabIntros.fridge = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('fridge');
    }

    const totalRecipes = this.recipeBook.getAllRecipes().length;
    if (
      !this.inventory.shownTabIntros.suggestions &&
      totalRecipes > 0 &&
      this.inventory.unlockedRecipeIds.size >= totalRecipes
    ) {
      this.inventory.shownTabIntros.suggestions = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('suggestions');
    }

    // [튜토리얼 혜택 종료 안내 1] No.03 완료 시 외형 그림 무료 제공 종료 안내
    const isNo3Done = this.inventory.isRecipeUnlocked(3) || this.inventory.unlockedRecipeIds.size >= 3;
    if (!this.inventory.shownTabIntros.noticeNo3 && isNo3Done) {
      this.inventory.shownTabIntros.noticeNo3 = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('noticeNo3');
    }

    // [튜토리얼 혜택 종료 안내 2] No.06 완료 시 설명 힌트 무료 제공 종료 안내
    const isNo6Done = this.inventory.isRecipeUnlocked(6) || this.inventory.unlockedRecipeIds.size >= 6;
    if (!this.inventory.shownTabIntros.noticeNo6 && isNo6Done) {
      this.inventory.shownTabIntros.noticeNo6 = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('noticeNo6');
    }
  }

  _showNextPendingTabIntro() {
    if (this.pendingTabIntroQueue.length === 0) return;
    const tabKey = this.pendingTabIntroQueue.shift();
    const modal = document.getElementById('tab-intro-modal');
    const content = document.getElementById('tab-intro-content');
    if (!modal || !content) return;

    const introMeta = {
      collection: {
        emoji: '📜',
        badge: '신규 탭 해금',
        title: '[도감·힌트] 탭이 열렸습니다!',
        desc: '황금비율 조합이 만만치 않으시죠? 이제 하단의 <b>[📜 도감·힌트]</b> 탭에서 지금 당장 해금할 수 있는 미해금 비전서 목록을 확인하고, <b>⚾ 베이스볼 추리</b>와 <b>🎮 그림 해금 미니게임</b>에 도전해보세요!',
        btnLabel: '📜 도감·힌트 보러가기'
      },
      fridge: {
        emoji: '🧊',
        badge: '신규 탭 해금 (도감 50% 달성)',
        title: '[냉장고를 부탁해] 탭이 열렸습니다!',
        desc: '도감의 50% 이상을 정복하셨군요! 이제 <b>[🧊 냉장고를 부탁해]</b> 탭에서 내 냉장고 속 재료를 선택하면, 내가 해금한 술 조합 중 재료가 가장 많이 일치하는 꿀조합을 추천받고 <b>🎲 랜덤 추첨</b>도 돌릴 수 있습니다!',
        btnLabel: '🧊 냉장고를 부탁해 가기'
      },
      detailPicker: {
        emoji: '🗺️',
        badge: '특산·브랜드 재료 해금',
        title: '대표재료의 상세 재료가 해금되었습니다!',
        desc: `
          <div style="font-size:0.95rem; color:#fde047; font-weight:800; margin-bottom:8px;">
            ✨ 상세 재료 등장!
          </div>
          <div class="detail-guide-demo-box">
            <div class="demo-ing-card-preview">
              <button type="button" class="demo-picker-live-btn">🗺️팔도지도 ▾</button>
              <span class="demo-ing-emoji">🌾</span>
              <span class="demo-ing-name">쌀</span>
            </div>
            <div class="demo-callout-arrow-wrap">
              <span class="demo-arrow">👉</span>
              <div class="demo-arrow-text">
                재료 카드 <b>오른쪽 위 버튼</b>을 누르면<br/>
                상세 재료를 고를 수 있습니다!
              </div>
            </div>
          </div>
          <div style="text-align:left; font-size:0.75rem; color:#cbd5e1; line-height:1.6; margin-top:8px; background:rgba(15,23,42,0.7); border:1px solid #334155; padding:8px 10px; border-radius:8px;">
            • <b>카드 중앙 터치</b>: 일반 기본 대표재료(일반 쌀, 소주 등) 투입<br/>
            • <b>우측 상단 버튼 터치</b>: [🗺️팔도지도], [🍾브랜드] 등 전용 상세 선택창 오픈!
          </div>
        `,
        btnLabel: '⚗️ 주조실에서 상세 재료 확인하기'
      },
      suggestions: {
        emoji: '👍',
        badge: '최종 탭 해금 (도감 100% 마스터)',
        title: '[조합추천] 탭이 열렸습니다!',
        desc: '모든 공식 레시피(100%)를 마스터하셨습니다! 이제 이 게임에 아직 없는 나만의 비법 레시피를 <b>[👍 조합추천]</b> 탭에 등록해 투표를 나누고, <b>[🧊 냉장고를 부탁해]</b>에서도 유저들의 조합추천 레시피를 함께 만나보세요!',
        btnLabel: '👍 조합추천 보러가기'
      },
      noticeNo3: {
        emoji: '🎨',
        badge: '튜토리얼 혜택 안내',
        title: '외형 그림 기본 제공 종료',
        desc: 'No.03 레시피를 완료하셨습니다!<br/><br/>이제부터(No.04~)는 <b>외형 그림 힌트</b>가 기본 제공되지 않으며, <b>벽돌깨기 · 땅따먹기 · 네모로직</b> 미니게임을 직접 클리어하여 해금해야 합니다.<br/><br/><span style="color:#fde047; font-weight:700;">※ 설명 힌트는 No.06까지 계속 무료로 제공됩니다.</span>',
        btnLabel: '확인 및 계속하기'
      },
      noticeNo6: {
        emoji: '📜',
        badge: '튜토리얼 혜택 안내',
        title: '설명 힌트 기본 제공 종료',
        desc: 'No.06 레시피를 완료하셨습니다!<br/><br/>이제부터(No.07~)는 <b>설명 힌트</b>도 기본 제공되지 않으며, <b>은박 복권 긁기(AD)</b>를 통해 직접 힌트를 해금해야 합니다.<br/><br/><span style="color:#38bdf8; font-weight:700;">※ 힌트 센터에서 미니게임과 은박 복권을 활용해 다음 레시피를 추리해보세요!</span>',
        btnLabel: '확인 및 계속하기'
      }
    }[tabKey];

    if (!introMeta) return;

    content.innerHTML = `
      <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
        <span class="diff-badge diff-NORMAL" style="position:static; font-size:0.7rem; padding:3px 10px;">
          🎉 ${introMeta.badge}
        </span>
        <div style="font-size:3.3rem;">${introMeta.emoji}</div>
        <div style="font-size:1.18rem; font-weight:900; color:#f8fafc;">
          ${introMeta.title}
        </div>
        <div style="font-size:0.8rem; color:#cbd5e1; line-height:1.55; background:#0f172a; border:1px solid #334155; border-radius:12px; padding:12px;">
          ${introMeta.desc}
        </div>
        <div style="display:flex; gap:8px; width:100%; margin-top:4px;">
          <button class="mix-btn" id="tab-intro-go-btn" style="flex:1;">${introMeta.btnLabel}</button>
          <button class="clear-pot-btn" id="tab-intro-close-btn">닫기</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    this.audio.playSuccess();

    const goBtn = content.querySelector('#tab-intro-go-btn');
    if (goBtn) {
      goBtn.onclick = () => {
        modal.classList.remove('active');
        this.audio.playTap();
        if (tabKey === 'detailPicker') {
          this.switchTab('brew');
        } else if (tabKey === 'noticeNo3' || tabKey === 'noticeNo6') {
          // 알림 팝업 확인 시 현재 탭 유지
        } else {
          this.switchTab(tabKey);
        }
        this._showNextPendingTabIntro();
      };
    }

    const closeBtn = content.querySelector('#tab-intro-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove('active');
        this.audio.playTap();
        this._showNextPendingTabIntro();
      };
    }
  }

  /**
   * 베이스볼 & 비율 추리 완료 후 [주조실로 가기] 클릭 시
   * 주조실 슬롯에 해당 레시피의 재료와 비율을 자동으로 세팅하고 주조실 탭으로 이동합니다.
   */
  autoSetupPotFromRecipe(recipeId) {
    const items = this.recipeBook.getRecipeItems(recipeId);
    if (!items || items.length === 0) return;

    if (items.length > this.config.maxUniqueSlots) {
      this.config.unlimitedSlotsMode = true;
    }

    this.craftingPot.clear();
    const fullLimits = { maxCountPerSlot: 10, maxTotalCount: 10 };
    items.forEach(it => {
      const ratio = Math.max(1, Number(it.ratio) || 1);
      const detId = it.detail_ingredient_id ? Number(it.detail_ingredient_id) : null;
      for (let i = 0; i < ratio; i++) {
        this.craftingPot.tapIngredient(Number(it.ingredient_id), detId, fullLimits);
      }
    });

    this.currentTab = 'brew';
    document.querySelectorAll('[data-tab-target]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab-target') === 'brew');
    });
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === 'view-brew');
    });

    this.renderAll();
  }

  renderHeader() {
    const totalRecipes = this.recipeBook.getAllRecipes().length;
    const unlockedCount = this.inventory.unlockedRecipeIds.size;

    const unlockedEl = document.getElementById('unlocked-count');
    if (unlockedEl) {
      unlockedEl.textContent = `${unlockedCount} / ${totalRecipes}`;
    }

    const iconThemeBtn = document.getElementById('toggle-icon-theme-btn');
    if (iconThemeBtn) {
      const theme = window.KSool?.PixelIconRegistry?.getTheme() || 'hd';
      const meta = window.KSool?.PixelIconRegistry?.getThemeMeta(theme);
      iconThemeBtn.classList.toggle('active', theme !== 'emoji');
      iconThemeBtn.textContent = `${meta.icon} ${meta.label}`;
      iconThemeBtn.title = `아이콘 스타일 전환 (현재: ${meta.label} - ${meta.title})\n클릭 시 💎고급 ➔ 👾도트 ➔ ✨이모지 순환`;
    }

    const licenseBtn = document.getElementById('toggle-license-btn');
    if (licenseBtn) {
      licenseBtn.classList.toggle('active', this.config.globalLicenseOverride);
      licenseBtn.textContent = this.config.globalLicenseOverride
        ? '🏷️ 실제명(제휴)'
        : '🎭 패러디명';
    }

    const slotBtn = document.getElementById('toggle-slots-btn');
    if (slotBtn) {
      slotBtn.classList.toggle('active', this.config.unlimitedSlotsMode);
      slotBtn.textContent = this.config.unlimitedSlotsMode
        ? '♾️ 무제한슬롯'
        : `📦 슬롯:${this.config.maxUniqueSlots}칸`;
    }

    const sandboxBtn = document.getElementById('toggle-sandbox-btn');
    if (sandboxBtn) {
      sandboxBtn.classList.toggle('active', this.inventory.unlockAllSandboxMode);
      sandboxBtn.textContent = this.inventory.unlockAllSandboxMode
        ? '🔓 전체해금중'
        : '🌱 연쇄해금';
    }
  }

  renderBrewView() {
    this._renderBrewStepQuizBar();
    this._renderPotSlots();
    this._renderIngredientCategoryChips();
    this._renderIngredientsGrid();
  }

  /**
   * 주조실 상단: [🎯 단계별 퀴즈 모드 / ⚗️ 자유 주조 모드] 전환 및 간결한 문제 카드 렌더링
   */
  _renderBrewStepQuizBar() {
    const container = document.getElementById('brew-step-quiz-bar');
    if (!container) return;

    const allRecipes = this.recipeBook.getAllRecipes();
    const totalCount = allRecipes.length;
    const nextUnsolved = this.inventory.getNextQuizRecipe();

    const navigableRecipes = allRecipes.filter(
      r => this.inventory.isRecipeUnlocked(r.recipe_id) || this.inventory.isRecipeChallengeable(r)
    );
    if (navigableRecipes.length === 0 && allRecipes.length > 0) {
      navigableRecipes.push(allRecipes[0]);
    }

    let targetRec = this.recipeBook.getRecipe(this.quizTargetRecipeId);
    if (!targetRec || !navigableRecipes.some(r => r.recipe_id === targetRec.recipe_id)) {
      targetRec = nextUnsolved || navigableRecipes[0];
      if (targetRec) this.quizTargetRecipeId = targetRec.recipe_id;
    }

    const modeTabsHtml = `
      <div class="brew-mode-tabs">
        <button type="button" class="brew-mode-tab-btn ${this.brewMode === 'QUIZ' ? 'active' : ''}" data-brew-mode="QUIZ">
          🎯 단계별 퀴즈 모드
        </button>
        <button type="button" class="brew-mode-tab-btn ${this.brewMode === 'FREE' ? 'active' : ''}" data-brew-mode="FREE">
          ⚗️ 자유 주조 모드
        </button>
      </div>
    `;

    if (this.brewMode === 'FREE' || !targetRec) {
      container.innerHTML = modeTabsHtml;
      this._bindBrewQuizEvents(container, navigableRecipes, targetRec);
      return;
    }

    const navIdx = navigableRecipes.findIndex(r => r.recipe_id === targetRec.recipe_id);
    const hasPrev = navIdx > 0;
    const hasNext = navIdx >= 0 && navIdx < navigableRecipes.length - 1;
    const isUnlocked = this.inventory.isRecipeUnlocked(targetRec.recipe_id);
    const isImageUnlocked = this.inventory.isRecipeImageUnlocked(targetRec.recipe_id);
    const isDescUnlocked = this.inventory.isRecipeDescUnlocked(targetRec.recipe_id);
    const isImageAvailable = isUnlocked || isImageUnlocked;
    const resolvedName = this.brandResolver.resolveName(targetRec);
    const isCollectionUnlocked = this.inventory.isTabUnlocked('collection');
    const showHintBtn = !isUnlocked && isCollectionUnlocked;

    container.innerHTML = `
      ${modeTabsHtml}
      <div class="brew-quiz-card">
        <div class="quiz-question-row">
          <div class="quiz-icon-col">
            <div class="quiz-mystery-icon ${isImageAvailable ? 'is-unlocked' : 'is-locked'} ${showHintBtn && !isImageAvailable ? 'is-clickable' : ''}"
                 id="quiz-mystery-icon"
                 ${isImageAvailable ? '' : (showHintBtn ? 'title="❓ 클릭하여 그림 해금 미니게임 도전"' : 'title="도감·힌트 기능 해금 후 그림 미니게임이 열립니다"')}>
              ${isImageAvailable ? (window.KSool?.pixelIcon ? window.KSool.pixelIcon(targetRec, 36) : targetRec.emoji) : '❓'}
            </div>
            ${showHintBtn ? `<button type="button" class="quiz-infer-btn" id="quiz-open-hint-btn">힌트</button>` : ''}
          </div>
          <div class="quiz-question-body">
            <div class="quiz-header-inline">
              <div class="quiz-title-group">
                <span class="quiz-target-title">${resolvedName}</span>
              </div>
              <div class="quiz-nav-right">
                <button type="button" class="quiz-nav-btn" id="quiz-prev-btn" ${hasPrev ? '' : 'disabled'} title="이전 번호">◀</button>
                <span class="quiz-num-badge">${targetRec.formatted_number} <span class="quiz-num-total">/ ${totalCount}</span></span>
                <button type="button" class="quiz-nav-btn" id="quiz-next-btn" ${hasNext ? '' : 'disabled'} title="다음 번호">▶</button>
              </div>
            </div>
            <div class="quiz-desc-text">
              ${isUnlocked
                ? targetRec.description
                : (isDescUnlocked
                    ? `<span class="hint-bulb">💡</span> ${targetRec.unlock_hint || ''}`
                    : `<div class="quiz-desc-locked" id="quiz-locked-desc-btn" title="클릭하여 설명 힌트 해금 (단계별 힌트)">
                         <span class="quiz-lock-icon">🔒</span>
                         <span class="quiz-lock-label">설명 힌트 잠김</span>
                       </div>`
                  )
              }
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindBrewQuizEvents(container, navigableRecipes, targetRec);
  }

  _bindBrewQuizEvents(container, navigableRecipes, targetRec) {
    container.querySelectorAll('[data-brew-mode]').forEach(btn => {
      btn.onclick = () => {
        this.brewMode = btn.getAttribute('data-brew-mode');
        this.audio.playTap();
        this._renderBrewStepQuizBar();
      };
    });

    const prevBtn = container.querySelector('#quiz-prev-btn');
    if (prevBtn && targetRec) {
      prevBtn.onclick = () => {
        const idx = navigableRecipes.findIndex(r => r.recipe_id === targetRec.recipe_id);
        if (idx > 0) {
          this.quizTargetRecipeId = navigableRecipes[idx - 1].recipe_id;
          this.audio.playTap();
          this._renderBrewStepQuizBar();
        }
      };
    }

    const nextBtn = container.querySelector('#quiz-next-btn');
    if (nextBtn && targetRec) {
      nextBtn.onclick = () => {
        const idx = navigableRecipes.findIndex(r => r.recipe_id === targetRec.recipe_id);
        if (idx >= 0 && idx < navigableRecipes.length - 1) {
          this.quizTargetRecipeId = navigableRecipes[idx + 1].recipe_id;
          this.audio.playTap();
          this._renderBrewStepQuizBar();
        }
      };
    }

    const hintBtn = container.querySelector('#quiz-open-hint-btn');
    if (hintBtn && targetRec) {
      hintBtn.onclick = () => {
        this.audio.playTap();
        this.hintModalView.open(targetRec.recipe_id);
      };
    }

    const lockedDescBtn = container.querySelector('#quiz-locked-desc-btn');
    if (lockedDescBtn && targetRec) {
      lockedDescBtn.onclick = (e) => {
        e.stopPropagation();
        this.audio.playTap();
        this.hintModalView.open(targetRec.recipe_id);
      };
    }

    const mysteryIcon = container.querySelector('#quiz-mystery-icon');
    if (mysteryIcon && targetRec) {
      const isImageAvailable = this.inventory.isRecipeUnlocked(targetRec.recipe_id) || this.inventory.isRecipeImageUnlocked(targetRec.recipe_id);
      const isCollectionUnlocked = this.inventory.isTabUnlocked('collection');
      const showHintBtn = !this.inventory.isRecipeUnlocked(targetRec.recipe_id) && isCollectionUnlocked;

      // 힌트 버튼이 열리는 시점(showHintBtn)과 동일하게 그림 미니게임 기능 오픈!
      if (!isImageAvailable && showHintBtn) {
        mysteryIcon.style.cursor = 'pointer';
        mysteryIcon.onclick = () => {
          this.audio.playTap();
          this.hintModalView.open(targetRec.recipe_id, 'MINIGAME_SELECT');
        };
      } else {
        mysteryIcon.style.cursor = 'default';
        mysteryIcon.removeAttribute('title');
        mysteryIcon.onclick = null;
      }
    }
  }

  _clearMixBtnAlert() {
    if (this._mixBtnAlertTimer) {
      clearTimeout(this._mixBtnAlertTimer);
      this._mixBtnAlertTimer = null;
    }
    const mixBtn = document.getElementById('mix-btn');
    if (mixBtn) {
      mixBtn.textContent = '⚗️ 조합하기';
      mixBtn.classList.remove('already-crafted-alert');
    }
  }

  _renderPotSlots() {
    const slotsGrid = document.getElementById('pot-slots-grid');
    const mixBtn = document.getElementById('mix-btn');
    if (!slotsGrid) return;

    const slots = this.craftingPot.getSlots();
    slotsGrid.classList.toggle('has-items', slots.length > 0);
    mixBtn.disabled = slots.length < 2;

    if (slots.length < 2) {
      this._clearMixBtnAlert();
    } else if (!this._mixBtnAlertTimer) {
      mixBtn.textContent = '⚗️ 조합하기';
      mixBtn.classList.remove('already-crafted-alert');
    }

    const noticeEl = document.getElementById('pot-match-notice');
    if (noticeEl) noticeEl.innerHTML = '';

    // 기본적으로 최소 4칸을 보여주되, 4칸 이상 담기면 동적으로 계속 늘어남
    const displaySlotCount = Math.max(this.config.maxUniqueSlots, slots.length + (this.config.unlimitedSlotsMode ? 1 : 0));

    const html = [];
    for (let i = 0; i < displaySlotCount; i++) {
      const slot = slots[i];
      if (slot) {
        const baseIng = this.recipeBook.getBaseIngredient(slot.baseId);
        const detIng = this.recipeBook.getDetailIngredient(slot.detailId);
        const target = detIng || baseIng;
        const name = this.brandResolver.resolveName(target);
        const detailBadge = detIng ? `<span class="slot-detail-tag">특산</span>` : '';

        const countBadge = slot.count > 1 ? `<span class="slot-count-badge">${slot.count}</span>` : '';

        html.push(`
          <div class="pot-slot filled" data-pot-slot-idx="${i}" title="클릭하면 개수가 1 줄어듭니다">
            ${detailBadge}
            <span class="slot-emoji">${target ? (window.KSool?.pixelIcon ? window.KSool.pixelIcon(target, 28) : target.emoji) : '🍶'}</span>
            <span class="slot-name">${name}</span>
            ${countBadge}
          </div>
        `);
      } else {
        html.push(`
          <div class="pot-slot empty">
            <span style="font-size:1.1rem; opacity:0.35;">➕</span>
            <span style="font-size:0.62rem;">빈 슬롯 ${i + 1}</span>
          </div>
        `);
      }
    }

    slotsGrid.innerHTML = html.join('');

    slotsGrid.querySelectorAll('[data-pot-slot-idx]').forEach(el => {
      el.onclick = () => {
        this._clearMixBtnAlert();
        const idx = Number(el.getAttribute('data-pot-slot-idx'));
        this.craftingPot.decrementSlot(idx);
        this.audio.playTap();
        this._renderPotSlots();
        this._renderIngredientsGrid();
        this.suggestionBoardView.render();
      };
    });
  }

  _renderIngredientCategoryChips() {
    const bar = document.getElementById('ing-cat-bar');
    if (!bar) return;

    const allBase = Array.from(this.recipeBook.baseIngredients.values());

    // 해금된 재료가 1개 이상 존재하는 재료 유형(Category)만 노출 (미해금 재료 유형 탭 자체 숨김)
    const visibleCategories = this.recipeBook.categories.filter(c =>
      allBase.some(ing => ing.category_id === c.category_id && this.inventory.isIngredientAvailable(ing.ingredient_id))
    );

    if (
      !visibleCategories.some(c => c.category_id === this.selectedIngCategory) &&
      visibleCategories.length > 0
    ) {
      this.selectedIngCategory = visibleCategories[0].category_id;
    }

    const catChips = visibleCategories.map(c => `
      <button class="cat-chip ${this.selectedIngCategory === c.category_id ? 'active' : ''}" data-ing-cat="${c.category_id}">
        ${c.name}
      </button>
    `).join('');

    bar.innerHTML = catChips;
    bar.querySelectorAll('[data-ing-cat]').forEach(btn => {
      btn.onclick = () => {
        this.selectedIngCategory = btn.getAttribute('data-ing-cat');
        this.audio.playTap();
        this._renderIngredientCategoryChips();
        this._renderIngredientsGrid();
      };
    });
  }

  _createIngredientCardHtml(ing, potSlots = []) {
    const inPotCount = potSlots
      .filter(s => s.baseId === ing.ingredient_id)
      .reduce((acc, s) => acc + s.count, 0);
    const details = this.recipeBook.getDetailsForBase(ing.ingredient_id);
    const hasCustomPicker =
      this.inventory.isDetailPickerUnlocked() &&
      details.length > 0 &&
      ing.picker_component &&
      ing.picker_component !== 'NONE';

    let pickerLabel = '';
    if (hasCustomPicker) {
      if (ing.picker_component === 'KOREA_MAP_PICKER') pickerLabel = '🗺️팔도지도';
      else if (ing.picker_component === 'SOJU_BRAND_PICKER') pickerLabel = '🍾브랜드';
      else if (ing.picker_component === 'BEER_TAP_PICKER') pickerLabel = '🍺브루어리';
      else pickerLabel = '✨상세';
    }

    const name = this.brandResolver.resolveName(ing);

    return `
        <div class="ing-card ${inPotCount > 0 ? 'in-pot' : ''} ${hasCustomPicker ? 'has-picker' : ''}"
             data-base-ing-id="${ing.ingredient_id}"
             title="클릭하여 가마솥에 담기">
          ${pickerLabel ? `<button type="button" class="ing-picker-btn" data-open-detail-picker="${ing.ingredient_id}" title="상세 재료 선택 팝업 열기">${pickerLabel} ▾</button>` : ''}
          <span class="ing-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 32) : ing.emoji}</span>
          <span class="ing-name">${name}</span>
          ${inPotCount > 1 ? `<span class="slot-count-badge">${inPotCount}</span>` : ''}
        </div>
      `;
  }

  _renderIngredientsGrid() {
    const grid = document.getElementById('ingredients-grid');
    if (!grid) return;

    // 미해금된 재료는 화면에 아예 보이지 않도록 필터링
    const unlockedBase = Array.from(this.recipeBook.baseIngredients.values()).filter(ing =>
      this.inventory.isIngredientAvailable(ing.ingredient_id)
    );

    const potSlots = this.craftingPot.getSlots();

    const filtered = unlockedBase.filter(i => i.category_id === this.selectedIngCategory);
    filtered.sort((a, b) => a.ingredient_id - b.ingredient_id);
    grid.innerHTML = filtered.map(ing => this._createIngredientCardHtml(ing, potSlots)).join('');

    // 상세재료 버튼(브랜드/브루어리/팔도지도) 클릭 시에만 상세 선택 모달 오픈
    grid.querySelectorAll('[data-open-detail-picker]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const baseId = Number(btn.getAttribute('data-open-detail-picker'));
        const baseIng = this.recipeBook.getBaseIngredient(baseId);
        const details = this.recipeBook.getDetailsForBase(baseId);
        this.audio.playTap();
        this.openDetailPickerModal(baseIng, details);
      };
    });

    // 대표 재료 카드(아이콘/영역) 클릭 시 즉시 기본 재료로 가마솥에 투입
    grid.querySelectorAll('[data-base-ing-id]').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('[data-open-detail-picker]')) return;
        const baseId = Number(card.getAttribute('data-base-ing-id'));
        this._addIngredientToPot(baseId, null);
      };
    });
  }

  _addIngredientToPot(baseId, detailId = null) {
    this._clearMixBtnAlert();
    const stepConfig = this.inventory.getCurrentStepConfig();
    const res = this.craftingPot.tapIngredient(baseId, detailId, stepConfig);
    if (!res.ok) {
      this.audio.playFail();
      alert(res.message);
      return;
    }
    this.audio.playTap();
    this._renderPotSlots();
    this._renderIngredientsGrid();
    this.suggestionBoardView.render();
  }

  /**
   * 대표 재료 클릭 시 전용 상세 선택 모달 오픈 (팔도 지도 / 소주 쇼케이스 등)
   */
  openDetailPickerModal(baseIng, details) {
    const modal = document.getElementById('detail-picker-modal');
    const content = document.getElementById('detail-picker-content');
    const picker = this.pickerRegistry.getPicker(baseIng.picker_component);

    content.innerHTML = picker.render(baseIng, details);
    modal.classList.add('active');

    const closeBtn = content.querySelector('#picker-close-btn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    const defaultBtn = content.querySelector('#picker-select-default');
    if (defaultBtn) {
      defaultBtn.onclick = () => {
        modal.classList.remove('active');
        this._addIngredientToPot(baseIng.ingredient_id, null);
      };
    }

    content.querySelectorAll('[data-detail-id]').forEach(el => {
      el.onclick = () => {
        const detId = Number(el.getAttribute('data-detail-id'));
        modal.classList.remove('active');
        this._addIngredientToPot(baseIng.ingredient_id, detId);
      };
    });
  }

  renderCollectionView() {
    const filterBar = document.getElementById('recipe-cat-bar');
    const grid = document.getElementById('sool-grid');
    if (!filterBar || !grid) return;

    const allRecipes = this.recipeBook.getAllRecipes();
    // 주조실과 동일하게 이미 해금했거나 지금 당장 해금 가능한(하위 재료가 모두 해금된) 레시피만 도감에 노출
    // 전체 해금 모드(unlockAllSandboxMode)일 때는 도감 100% 모든 레시피 즉시 노출
    const visibleRecipes = this.inventory.unlockAllSandboxMode
      ? allRecipes
      : allRecipes.filter(rec =>
          this.inventory.isRecipeUnlocked(rec.recipe_id) || this.inventory.isRecipeChallengeable(rec)
        );

    const baseCategories = ['기초합성', '소맥/폭탄주', '과일/편의점주', '막걸리꿀조합', '특산명주', '유저추천꿀조합'];
    const availableCats = baseCategories.filter(cat => visibleRecipes.some(r => r.category === cat));
    const categories = [...availableCats, '전체'];

    if (this.selectedRecipeCategory !== '전체' && !availableCats.includes(this.selectedRecipeCategory)) {
      this.selectedRecipeCategory = availableCats[0] || '전체';
    }

    filterBar.innerHTML = categories.map(cat => `
      <button class="cat-chip ${this.selectedRecipeCategory === cat ? 'active' : ''}" data-rec-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    filterBar.querySelectorAll('[data-rec-cat]').forEach(btn => {
      btn.onclick = () => {
        this.selectedRecipeCategory = btn.getAttribute('data-rec-cat');
        this.audio.playTap();
        this.renderCollectionView();
      };
    });

    const filtered = this.selectedRecipeCategory === '전체'
      ? visibleRecipes
      : visibleRecipes.filter(r => r.category === this.selectedRecipeCategory);

    grid.innerHTML = filtered.map(rec => {
      const isUnlocked = this.inventory.isRecipeUnlocked(rec.recipe_id);
      const isImageUnlocked = this.inventory.isRecipeImageUnlocked(rec.recipe_id);
      const hintState = this.inventory.getHintState(rec.recipe_id);
      const clearedCount = hintState.stageCleared.filter(Boolean).length;

      let cardStateClass = 'unlocked';
      let statusLabel = '';
      if (!isUnlocked) {
        if (this.inventory.unlockAllSandboxMode) {
          cardStateClass = 'challengeable image-unlocked';
          statusLabel = '✨ 힌트 전체 해금';
        } else {
          cardStateClass = isImageUnlocked ? 'challengeable image-unlocked' : 'challengeable';
          if (isImageUnlocked && clearedCount > 0) {
            statusLabel = `🖼️ 그림 · ⚾ ${clearedCount}단계 성공`;
          } else if (isImageUnlocked) {
            statusLabel = `🖼️ 그림 해금 · ⚾ 추리 가능`;
          } else if (clearedCount > 0) {
            statusLabel = `⚾ 힌트 ${clearedCount}단계 성공`;
          } else {
            statusLabel = `🕵️ 힌트 추리 가능`;
          }
        }
      }

      const rawName = this.brandResolver.resolveName(rec);
      let displayName = rawName;
      if (rawName === '아이스 아메리카노' || rawName === '아이스아메리카노') {
        displayName = '아이스<br>아메리카노';
      }

      const displayEmoji = (isUnlocked || isImageUnlocked)
        ? (window.KSool?.pixelIcon ? window.KSool.pixelIcon(rec, 34) : rec.emoji)
        : '❓';

      const numBadge = `<span class="sool-num-badge">${rec.formatted_number || `No.${rec.recipe_id}`}</span>`;

      return `
        <div class="sool-card ${cardStateClass}" data-recipe-card="${rec.recipe_id}">
          ${numBadge}
          <span class="diff-badge diff-${rec.difficulty}">${rec.difficulty}</span>
          <span class="sool-emoji">${displayEmoji}</span>
          <span class="sool-name">${displayName}</span>
          ${statusLabel ? `<span class="sool-hint-status">${statusLabel}</span>` : ''}
        </div>
      `;
    }).join('');

    grid.querySelectorAll('[data-recipe-card]').forEach(card => {
      card.onclick = () => {
        const rId = Number(card.getAttribute('data-recipe-card'));
        const rec = this.recipeBook.getRecipe(rId);
        const isUnlocked = this.inventory.isRecipeUnlocked(rId);

        // 전체 해금 모드(unlockAllSandboxMode)일 때는 언제든지 힌트 모달을 열어 모든 힌트와 자동세팅 확인 가능
        if (isUnlocked && !this.inventory.unlockAllSandboxMode) {
          this.audio.playTap();
          this.showCraftResultModal({ isSuccess: true, recipe: rec, isNewDiscovery: false });
        } else {
          this.audio.playTap();
          this.hintModalView.open(rId);
        }
      };
    });
  }

  showCraftResultModal(result) {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    if (!modal || !content) return;

    if (result.isSuccess && result.recipe) {
      const rec = result.recipe;
      const isNew = Boolean(result.isNewDiscovery);
      const items = this.recipeBook.getRecipeItems(rec.recipe_id);
      const recipeFormula = items.map(it => {
        const det = this.recipeBook.getDetailIngredient(it.detail_ingredient_id);
        const base = this.recipeBook.getBaseIngredient(it.ingredient_id);
        const target = det || base;
        const icon = window.KSool?.pixelIcon ? window.KSool.pixelIcon(target, 22) : target.emoji;
        return `<span style="display:inline-flex; align-items:center; gap:4px; vertical-align:middle;">${icon}<span>${this.brandResolver.resolveName(target)}(${it.ratio})</span></span>`;
      }).join(' <span style="color:#64748b; font-weight:400; margin:0 4px;">+</span> ');

      if (!isNew) {
        // [도감/힌트 탭에서 레시피 열람] 기존 방식대로 깔끔한 레시피 정보 카드 표시
        content.innerHTML = `
          <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="diff-badge diff-${rec.difficulty}" style="position:static; font-size:0.7rem; padding:3px 9px;">
                ${rec.formatted_number || ''} · ${rec.category} · ${rec.difficulty}
              </span>
            </div>

            <div class="craft-result-info-card">
              <div class="craft-result-left">
                <div class="craft-result-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(rec, 48) : rec.emoji}</div>
                <div class="craft-result-name">${this.brandResolver.resolveName(rec)}</div>
              </div>
              <div class="craft-result-desc">
                ${rec.description}
              </div>
            </div>

            <div style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:10px; padding:10px; font-size:0.8rem; color:#fcd34d; font-weight:800;">
              ${recipeFormula}
            </div>

            <button class="mix-btn" id="result-close-btn" style="width:100%; margin-top:4px;">확인</button>
          </div>
        `;

        modal.classList.add('active');
        const closeBtn = content.querySelector('#result-close-btn');
        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        return;
      }

      // [CASE B] 완전히 새로운 K-술 최초 발견 (화려한 축하 연출)
      let unifiedUnlockBanner = '';
      const hasChainUnlock = Boolean(result.newlyUnlockedIngredient);
      const hasStepUp = Boolean(result.stepUpInfo && result.stepUpInfo.newStepConfig);

      if (hasChainUnlock || hasStepUp) {
        const groupsHtml = [];

        // 1. [재료 해금] 연쇄 크래프팅 해금 재료 (에메랄드 녹색 테마)
        if (hasChainUnlock) {
          const newIng = result.newlyUnlockedIngredient;
          const cat = this.recipeBook.categories.find(c => c.category_id === newIng.category_id);
          const catLabel = cat ? cat.name : '기타';
          const ingName = this.brandResolver.resolveName(newIng);

          groupsHtml.push(`
            <div class="craft-unlock-group">
              <div class="craft-unlock-group-header">
                <span class="cat-chip active" style="font-size:0.68rem; padding:2px 8px; cursor:default; pointer-events:none;">
                  ${catLabel}
                </span>
                <span class="craft-badge-chain">
                  🔓 재료 해금
                </span>
              </div>
              <div class="craft-unlock-items-box chain-box">
                <span class="bb-option-btn picked craft-unlock-chip-chain">
                  <span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(newIng, 24) : newIng.emoji}</span>
                  <span>${ingName}</span>
                </span>
              </div>
            </div>
          `);
        }

        // 2. [신규 추가] 단계 진급으로 추가된 기초 재료들 (골드/호박색 테마)
        if (hasStepUp && result.stepUpInfo.newlyUnlockedLeafIngredients) {
          const leafIngs = result.stepUpInfo.newlyUnlockedLeafIngredients;
          if (leafIngs.length > 0) {
            const byCat = new Map();
            for (const ing of leafIngs) {
              const cId = ing.category_id || 'ETC';
              if (!byCat.has(cId)) byCat.set(cId, []);
              byCat.get(cId).push(ing);
            }

            for (const [cId, ings] of byCat.entries()) {
              const cat = this.recipeBook.categories.find(c => c.category_id === cId);
              const catLabel = cat ? cat.name : '기타';

              groupsHtml.push(`
                <div class="craft-unlock-group">
                  <div class="craft-unlock-group-header">
                    <span class="cat-chip active" style="font-size:0.68rem; padding:2px 8px; cursor:default; pointer-events:none;">
                      ${catLabel}
                    </span>
                    <span class="craft-badge-leaf">
                      🎁 신규 추가
                    </span>
                  </div>
                  <div class="craft-unlock-items-box leaf-box">
                    ${ings.map(ing => `
                      <span class="bb-option-btn picked craft-unlock-chip-leaf">
                        <span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 24) : ing.emoji}</span>
                        <span>${this.brandResolver.resolveName(ing)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              `);
            }
          }
        }

        if (groupsHtml.length > 0) {
          unifiedUnlockBanner = `
            <div class="craft-unified-unlock-card">
              ${groupsHtml.join('')}
            </div>
          `;
        }
      }

      content.innerHTML = `
        <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="diff-badge diff-${rec.difficulty}" style="position:static; font-size:0.7rem; padding:3px 9px;">
              ${rec.formatted_number || ''} · ${rec.category} · ${rec.difficulty}
            </span>
            <span style="background:rgba(245,158,11,0.22); border:1px solid #f59e0b; color:#fde047; font-size:0.68rem; font-weight:900; padding:2px 7px; border-radius:6px;">NEW</span>
          </div>
          <div class="craft-result-info-card">
            <div class="craft-result-left">
              <div class="craft-result-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(rec, 48) : rec.emoji}</div>
              <div class="craft-result-name">${this.brandResolver.resolveName(rec)}</div>
            </div>
            <div class="craft-result-desc">
              ${rec.description}
            </div>
          </div>
          <div style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:10px; padding:10px; font-size:0.8rem; color:#fcd34d; font-weight:800;">
            ${recipeFormula}
          </div>
          ${unifiedUnlockBanner}
          <button class="mix-btn" id="result-close-btn" style="width:100%; margin-top:4px;">확인</button>
        </div>
      `;
    } else {
      const triedStr = (result.usedSlots || []).map(s => {
        const det = this.recipeBook.getDetailIngredient(s.detailId);
        const base = this.recipeBook.getBaseIngredient(s.baseId);
        const target = det || base;
        const icon = window.KSool?.pixelIcon ? window.KSool.pixelIcon(target, 20) : target.emoji;
        return `<span style="display:inline-flex; align-items:center; gap:4px; vertical-align:middle;">${icon}<span>${this.brandResolver.resolveName(target)}(${s.count})</span></span>`;
      }).join(' <span style="color:#64748b; margin:0 4px;">+</span> ');

      const failGuideText = '비율이나 재료 조합이 맞지 않습니다! [도감·힌트] 탭이나 퀴즈 카드의 [힌트] 버튼을 눌러 힌트를 확인해보세요.';

      content.innerHTML = `
        <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
          <div class="craft-result-info-card" style="border-color:#7f1d1d; background:rgba(69,10,10,0.25);">
            <div class="craft-result-left">
              <div class="craft-result-emoji">🧪</div>
              <div class="craft-result-name" style="color:#fca5a5;">괴식 폭탄주</div>
            </div>
            <div class="craft-result-desc" style="border-color:#7f1d1d; color:#cbd5e1;">
              ${failGuideText}
            </div>
          </div>
          <div style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:10px; padding:10px; font-size:0.75rem; color:#cbd5e1;">
            시도한 조합: ${triedStr}
          </div>
          <button class="mix-btn" id="result-close-btn" style="width:100%;">다시 도전하기</button>
        </div>
      `;
    }

    modal.classList.add('active');
    const closeBtn = content.querySelector('#result-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove('active');
        this._showNextPendingTabIntro();
      };
    }
  }

  _bindGlobalEvents() {
    // [iOS / iPad Safari 더블탭 줌 및 핀치 제스처 원천 차단]
    // 패드/모바일 환경에서 빠르게 연타(예: 병뚜껑 꼬다리 치기)하거나 멀티터치 시 브라우저 화면이 확대되는 현상 방지
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('gesturechange', (e) => {
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('gestureend', (e) => {
      e.preventDefault();
    }, { passive: false });

    let lastGlobalTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = performance.now();
      const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
      if (!isInput && now - lastGlobalTouchEnd <= 320) {
        if (e.cancelable) e.preventDefault();
      }
      lastGlobalTouchEnd = now;
    }, { passive: false });

    // [관리자/개발자 툴바 제어] 일반 테스터/유저에게는 기본 숨김 (?admin URL 파라미터나 로고 5회 탭 시 토글)
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminParam = urlParams.has('admin') || urlParams.has('dev') || urlParams.has('debug');
    if (hasAdminParam || localStorage.getItem('ksool_admin_mode') === 'true') {
      document.body.classList.add('admin-mode');
    }

    const brandLogo = document.querySelector('.brand-title-row') || document.querySelector('.brand-badge');
    let tapCount = 0;
    let tapTimer = null;
    if (brandLogo) {
      brandLogo.style.cursor = 'pointer';
      brandLogo.addEventListener('click', () => {
        tapCount++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { tapCount = 0; }, 1500);
        if (tapCount >= 5) {
          tapCount = 0;
          const isNowAdmin = document.body.classList.toggle('admin-mode');
          localStorage.setItem('ksool_admin_mode', isNowAdmin ? 'true' : 'false');
          if (this.audio) this.audio.playSuccess();
        }
      });
    }
    // 탭 전환
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-tab-target');
        this.audio.playTap();
        this.switchTab(target);
      };
    });

    // 술 빚기 실행
    const mixBtn = document.getElementById('mix-btn');
    if (mixBtn) {
      mixBtn.onclick = () => {
        const slots = this.craftingPot.getSlots();
        if (slots.length < 2) return;

        const preferredId = this.brewMode === 'QUIZ' ? this.quizTargetRecipeId : null;
        const matched = this.recipeBook.matchRecipe(slots, this.inventory.unlockedRecipeIds, preferredId);

        // [이미 제조했던 조합을 다시 조합하려 한 경우 -> 팝업 없이 버튼에 3초간 안내 후 복귀]
        if (matched && this.inventory.isRecipeUnlocked(matched.recipe_id)) {
          this.audio.playTap();
          if (this._mixBtnAlertTimer) {
            clearTimeout(this._mixBtnAlertTimer);
          }
          mixBtn.textContent = '이미 제조했던 조합입니다.';
          mixBtn.classList.add('already-crafted-alert');

          this._mixBtnAlertTimer = setTimeout(() => {
            mixBtn.textContent = '⚗️ 조합하기';
            mixBtn.classList.remove('already-crafted-alert');
            this._mixBtnAlertTimer = null;
          }, 3000);
          return;
        }

        this._clearMixBtnAlert();
        const res = this.alchemyEngine.executeCraft(preferredId);
        if (!res.ok) {
          alert(res.message);
          return;
        }
        if (res.isSuccess && res.recipe) {
          if (
            res.isNewDiscovery &&
            this.brewMode === 'QUIZ' &&
            Number(res.recipe.recipe_id) === Number(this.quizTargetRecipeId)
          ) {
            res.isQuizClear = true;
          }
          // 현재 퀴즈 타겟이 해금되었다면 자동으로 다음 미해금 번호(No.XX)로 포커스 이동
          if (this.inventory.isRecipeUnlocked(this.quizTargetRecipeId)) {
            const nextQuiz = this.inventory.getNextQuizRecipe();
            if (nextQuiz) {
              this.quizTargetRecipeId = nextQuiz.recipe_id;
              this.quizHintRevealed = false;
            }
          }
        } else if (!res.isSuccess) {
          this.inventory.recordCraftFailure();
        }
        this._checkProgressiveTabUnlocks();
        this.renderAll();
        this.showCraftResultModal(res);
      };
    }

    // 조합칸 비우기
    const clearBtn = document.getElementById('clear-pot-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        this._clearMixBtnAlert();
        this.craftingPot.clear();
        this.audio.playTap();
        this.renderBrewView();
        this.suggestionBoardView.render();
      };
    }

    // 상단 토글 0: 💎고급 ➔ 👾도트 ➔ ✨이모지 3단계 순환 아이콘 테마 전환
    const iconThemeBtn = document.getElementById('toggle-icon-theme-btn');
    if (iconThemeBtn) {
      iconThemeBtn.onclick = () => {
        if (window.KSool?.PixelIconRegistry) {
          window.KSool.PixelIconRegistry.toggleTheme();
          this.audio.playTap();
          this.renderAll();
        }
      };
    }

    // 우측 상단 ⚙️ 설정 버튼
    const openSettingsBtn = document.getElementById('open-settings-btn');
    if (openSettingsBtn) {
      openSettingsBtn.onclick = () => {
        this.audio.playTap();
        if (this.settingsModalView) {
          this.settingsModalView.open();
        }
      };
    }

    // 상단 토글 1: 패러디 가짜명 <-> 실제 상표명 전환
    const licenseBtn = document.getElementById('toggle-license-btn');
    if (licenseBtn) {
      licenseBtn.onclick = () => {
        this.config.globalLicenseOverride = !this.config.globalLicenseOverride;
        this.audio.playTap();
        this.renderAll();
      };
    }

    // 상단 토글 2: 슬롯 4칸 <-> 무제한 확장
    const slotBtn = document.getElementById('toggle-slots-btn');
    if (slotBtn) {
      slotBtn.onclick = () => {
        this.config.unlimitedSlotsMode = !this.config.unlimitedSlotsMode;
        this.audio.playTap();
        this.renderAll();
      };
    }

    // 상단 토글 3: 연쇄 해금 <-> 전체 재료 열기
    const sandboxBtn = document.getElementById('toggle-sandbox-btn');
    if (sandboxBtn) {
      sandboxBtn.onclick = () => {
        this.inventory.unlockAllSandboxMode = !this.inventory.unlockAllSandboxMode;
        this.audio.playTap();
        this.renderAll();
      };
    }

    // 상단 4: 진행도 초기화 버튼
    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('모든 해금 기록을 초기 상태로 리셋할까요?')) {
          this.storage.clearState();
          this.craftingPot.clear();
          this.inventory.unlockAllSandboxMode = false;
          this.inventory.userLevel = 1;
          this.inventory.craftFailCount = 0;
          this.inventory.shownTabIntros = { collection: false, fridge: false, suggestions: false, detailPicker: false };
          this.pendingTabIntroQueue = [];
          this.inventory.unlockedImageRecipeIds.clear();
          this.inventory.hintProgressByRecipe = {};
          this.inventory.promotedCustomRecipes = [];
          this.inventory.init();
          this.inventory.save();
          const nextQuiz = this.inventory.getNextQuizRecipe();
          this.quizTargetRecipeId = nextQuiz ? nextQuiz.recipe_id : 5;
          this.quizHintRevealed = false;
          this.brewMode = 'QUIZ';
          this.fridgeEngine.clearAll();
          this.selectedIngCategory = 'NATURE';
          this.audio.playTap();
          this.renderAll();
        }
      };
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new KSoolApp();
  window.ksoolApp = app;
  window.app = app;
  app.init();
});
