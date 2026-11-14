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
      showToast: (msg) => this.showToast(msg),
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

    if (window.KSool?.TycoonView) {
      this.tycoonView = new window.KSool.TycoonView('view-tycoon', {
        app: this,
        config: this.config,
        recipeBook: this.recipeBook,
        inventory: this.inventory,
        brandResolver: this.brandResolver,
        pickerRegistry: this.pickerRegistry,
        audio: this.audio
      });
    }

    if (window.KSool?.SettingsModalView) {
      this.settingsModalView = new window.KSool.SettingsModalView('settings-modal', 'settings-modal-content', this);
    }

    if (window.KSool?.StoryTutorialModalView) {
      this.storyTutorialModalView = new window.KSool.StoryTutorialModalView({
        modalId: 'story-tutorial-modal',
        contentId: 'story-tutorial-content',
        app: this,
        inventory: this.inventory,
        audio: this.audio
      });
    }

    this.currentMode = (typeof localStorage !== 'undefined' ? localStorage.getItem('ksool_active_mode') : null) || 'TYCOON';
    this.friendHelpPayload = null;
    this.friendHelpService = window.KSool?.FriendHelpService ? new window.KSool.FriendHelpService() : null;
    this.platformBridge = window.KSool?.PlatformBridge ? new window.KSool.PlatformBridge() : null;

    if (window.KSool?.FriendSosSolveView) {
      this.friendSosSolveView = new window.KSool.FriendSosSolveView({
        viewId: 'view-sos',
        recipeBook: this.recipeBook,
        alchemyEngine: this.alchemyEngine,
        brandResolver: this.brandResolver,
        audio: this.audio,
        platformBridge: this.platformBridge,
        app: this
      });
    }

    if (window.KSool?.ModeSelectPortalView) {
      this.modeSelectPortalView = new window.KSool.ModeSelectPortalView('view-portal', {
        app: this,
        audio: this.audio
      });
    }

    this.currentTab = 'tycoon';
    this.brewMode = 'QUIZ'; // 'QUIZ' (단계별 연구 모드) | 'SHOP' (재료 상점)
    this.quizTargetRecipeId = null;
    this.quizHintRevealed = false;
    this.selectedIngCategory = 'NATURE';
    this.selectedRecipeCategory = '전체';
    this.pendingTabIntroQueue = [];
  }

  async init() {
    const bundleData = await this._loadHybridData();
    this._cachedBundleData = bundleData;
    // 1. 먼저 RecipeBook에 마스터 데이터를 로드해야 단계(Step) 및 넘버링을 계산할 수 있음
    this.recipeBook.load(bundleData, []);

    this._bindGlobalEvents();

    // iOS 사파리 고무줄 바운스(Overscroll Rubber-banding) 원천 차단
    document.addEventListener('touchmove', (e) => {
      const scrollable = e.target.closest('.view, .recipe-list, .pot-scroll-inner, .inventory-scroll, .modal-body, .modal-card, .bb-options-pool, .bb-cat-pane, .cat-filter-bar, .minigame-canvas, .party-view-body, .lobby-grid, .settings-modal-body, .settings-modal-card, .tycoon-scroll-body, .tycoon-lobby-body, .tycoon-ings-scroll-grid, .shelf-chips-scroll, .tycoon-rank-list, .notebook-cust-list, .stockpile-shelf-grid, .shop-scroll-list, input[type="range"]');
      if (!scrollable) {
        e.preventDefault();
      }
    }, { passive: false });

    // URL 해시(#party/updown, #tycoon 등) 딥링크 이벤트 리스너 등록
    const hasHashRoute = Boolean(window.location.hash && window.location.hash !== '#' && window.location.hash !== '#/');
    window.addEventListener('hashchange', () => this._handleHashRouting());

    // 2. 친구에게 도움요청 (?help=...) 딥링크 확인
    let isFriendHelp = false;
    if (typeof window !== 'undefined' && window.location && window.location.search && this.friendHelpService) {
      const urlParams = new URLSearchParams(window.location.search);
      const helpParam = urlParams.get('help');
      if (helpParam) {
        const payload = this.friendHelpService.decodeHelpPayload(helpParam);
        if (payload) {
          isFriendHelp = true;
          this._initFriendHelpMode(payload);
        }
      }
    }

    // 3. 일반 접속: 첫 진입자에게 모드 선택 포털 화면 오픈, 기존 유저는 이전 모드 및 보던 화면(포털/미니게임 등) 복원
    if (!isFriendHelp) {
      const savedMode = typeof localStorage !== 'undefined' ? localStorage.getItem('ksool_active_mode') : null;
      const savedTab = typeof localStorage !== 'undefined' ? localStorage.getItem('ksool_active_tab') : null;

      if (!savedMode || savedTab === 'portal') {
        // 첫 진입이거나 모드 선택 화면에서 새로고침한 경우: 포털 화면 상태 그대로 유지!
        const effectiveMode = savedMode || 'TYCOON';
        this.currentMode = effectiveMode;
        this.storage.setMode(effectiveMode);
        this.inventory.isQuizMode = (effectiveMode === 'QUIZ');
        this.inventory.init();
        this._updateTabBarForMode(effectiveMode);
        this.switchTab('portal');
      } else {
        this.selectGameMode(savedMode, false);
        // 이전에 보던 탭(예: party 미니게임 허브, shop, collection 등)이 있다면 해당 탭 복원
        if (savedTab && savedTab !== this.currentTab && this.canAccessTab(savedTab)) {
          this.switchTab(savedTab);
        }
      }

      if (hasHashRoute) {
        this._handleHashRouting();
      }
    }

    this.suggestionService.init();
    this.suggestionService.onSuggestionsUpdated = () => this.suggestionBoardView?.render();
    this.fridgeEngine.init();
  }

  /**
   * 🌟 게임 모드 전환 (K-술 조합 퀴즈 모드 <-> 주점 타이쿤 모드)
   * - 두 모드의 로컬스토리지 데이터는 완전히 분리되어 상호 간섭이 없습니다!
   */
  selectGameMode(mode, fromUserClick = false) {
    if (mode !== 'QUIZ' && mode !== 'TYCOON') mode = 'TYCOON';
    this.currentMode = mode;
    try {
      localStorage.setItem('ksool_active_mode', mode);
    } catch (_) {}

    // 1. 스토리지 키 분리 적용
    this.storage.setMode(mode);

    // 2. 해당 모드의 독립 세이브 데이터로 인벤토리 재동기화
    this.inventory.isQuizMode = (mode === 'QUIZ');
    this.inventory.init();
    if (this._cachedBundleData && this.inventory.promotedCustomRecipes.length > 0) {
      this.recipeBook.load(this._cachedBundleData, this.inventory.promotedCustomRecipes);
      this.inventory._syncStepAndIngredients();
    }

    // 3. 모드별 UI 및 탭바 동기화
    if (mode === 'QUIZ') {
      this.inventory.syncQuizModeStageIngredients();
      this._updateTabBarForMode('QUIZ');
      const nextQuiz = this.inventory.getNextQuizRecipe();
      this.quizTargetRecipeId = nextQuiz ? nextQuiz.recipe_id : 11;
      this.switchTab('brew');
    } else {
      if (this.tycoonView && this.tycoonView.engine) {
        this.tycoonView.engine._syncInventoryStepWithStages();
      }
      this._updateTabBarForMode('TYCOON');
      this.switchTab('tycoon');

      if (fromUserClick && !this.inventory.hasSeenIntroStory && this.storyTutorialModalView) {
        setTimeout(() => {
          this.storyTutorialModalView.openIntroFlow();
        }, 120);
      }
    }

    this.renderAll();
  }

  /**
   * 단일 탭 접근 정책
   * - 퀴즈 모드 및 친구 도움 모드: tycoon(점포), shop(재료상점) 접근 불가
   * - 인벤토리의 isTabUnlocked(target) 조건 만족 여부 검사
   */
  canAccessTab(target, mode = this.currentMode) {
    if (target === 'portal' || target === 'sos') return true;
    if (target === 'party') return true; // 모드 선택 창 및 딥링크 등에서 접근 가능
    if (target === 'fridge') return false; // fridge는 party 내부 게임

    const isQuizOrHelp = (mode === 'QUIZ' || mode === 'HELP_FRIEND');
    if (isQuizOrHelp) {
      if (target === 'tycoon' || target === 'shop') {
        return false;
      }
    }

    return this.inventory ? Boolean(this.inventory.isTabUnlocked(target)) : true;
  }

  getDefaultTabForMode(mode = this.currentMode) {
    if (mode === 'HELP_FRIEND') {
      return 'sos';
    }
    if (mode === 'QUIZ') {
      return 'brew';
    }
    return 'tycoon';
  }

  /**
   * 탭바 네비게이션을 현재 모드에 맞게 제어
   * - 하단 탭바에서 미니게임(party)은 제거되어 상단 모드 선택 화면을 통해 진입
   * - 퀴즈 모드: 점포(타이쿤) 및 재료상점 탭 숨김 처리 (조합 퀴즈 연구실 + 도감·힌트 노출)
   * - 타이쿤 모드: 점포, 연구실, 재료상점, 도감 노출
   */
  _updateTabBarForMode(mode) {
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      if (target === 'party') {
        btn.style.display = 'none';
        return;
      }
      const isVisible = this.canAccessTab(target, mode);
      btn.style.display = isVisible ? '' : 'none';
    });
  }

  /**
   * 🤝 친구 도움요청 SOS 샌드박스 세션 초기화
   * - 친구의 로컬스토리지 데이터를 전혀 건드리지 않고 휘발성 메모리 샌드박스로 실행
   * - 기존 연구실(brew)을 쪼개 쓰지 않고, 100% 독립된 전용 풀이 뷰(FriendSosSolveView)로 진입!
   */
  _initFriendHelpMode(payload) {
    this.currentMode = 'HELP_FRIEND';
    this.friendHelpPayload = payload;
    this.storage.setMode('HELP_FRIEND');

    this.inventory.isQuizMode = true;
    this.inventory.init();

    if (this.friendSosSolveView) {
      this.friendSosSolveView.open(payload);
    } else {
      this.switchTab('sos');
    }

    this.showToast(`🤝 [${payload.sharerName}]님의 SOS 도착!\n친구가 가진 재료로 문제를 풀어주세요!`);
  }

  /**
   * URL 해시 라우팅 지원 (예: #party/updown, #party, #tycoon, #collection 등)
   */
  _handleHashRouting() {
    const hash = window.location.hash || '';
    if (!hash || hash === '#' || hash === '#/') return;

    if (hash.startsWith('#party')) {
      const parts = hash.split('/');
      const gameKey = parts[1];
      this.switchTab('party');
      if (gameKey && this.partyGameHubView && this.partyGameHubView.games?.[gameKey]) {
        // 이미 해당 게임이 실행 중이 아니라면 실행
        if (this.partyGameHubView.activeGameKey !== gameKey || this.partyGameHubView.mode !== 'game') {
          this.partyGameHubView.playGame(gameKey);
        }
      }
    } else if (hash.startsWith('#tycoon')) {
      if (this.canAccessTab('tycoon')) {
        this.switchTab('tycoon');
      } else {
        this.switchTab(this.getDefaultTabForMode());
      }
    } else if (hash.startsWith('#collection')) {
      this.switchTab('collection');
    } else if (hash.startsWith('#suggestions')) {
      this.switchTab('suggestions');
    } else if (hash.startsWith('#fridge')) {
      this.switchTab('party');
      this.partyGameHubView?.playGame?.('fridge');
    } else if (hash.startsWith('#brew')) {
      this.switchTab('brew');
    }
  }

  /**
   * 온라인/웹서버일 경우 data/*.json을 비동기 로드하고,
   * 오프라인이나 file:// 직접 실행 시 내장 SeedDataBundle로 즉시 폴백합니다.
   */
  async _loadHybridData() {
    // 0ms 즉시 시작: SeedDataBundle이 이미 메모리에 로드되어 있다면 네트워크 지연/실패 없이 즉시 사용
    if (window.KSool?.SeedDataBundle) {
      return window.KSool.SeedDataBundle;
    }
    if (window.location.protocol === 'file:') {
      return window.KSool?.SeedDataBundle;
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
    if (this.currentTab === 'portal') {
      this.modeSelectPortalView?.render?.();
      return;
    }
    if (this.currentTab === 'sos') {
      this.friendSosSolveView?.render?.();
      return;
    }
    this.renderBrewView();
    this.renderShopView();
    this.renderCollectionView();
    this.fridgeRecommenderView.render();
    this.suggestionBoardView.render();
    if (this.currentTab === 'party') {
      this.partyGameHubView.render();
    }
    if (this.currentTab === 'tycoon' && this.tycoonView) {
      this.tycoonView.render();
    }
  }

  switchTab(target) {
    if (target === 'fridge') {
      this.switchTab('party');
      this.partyGameHubView.playGame('fridge');
      return;
    }

    if (!this.canAccessTab(target)) {
      const defTab = this.getDefaultTabForMode();
      if (this.currentTab !== defTab && this.canAccessTab(defTab)) {
        this.switchTab(defTab);
      }
      return;
    }
    if (this.currentTab === 'party' && target !== 'party') {
      this.partyGameHubView.onLeavePartyTab();
    }
    if (this.currentTab === 'tycoon' && target !== 'tycoon' && this.tycoonView) {
      this.tycoonView.onLeaveTab();
    }
    this.currentTab = target;
    try {
      localStorage.setItem('ksool_active_tab', target);
    } catch (_) {}
    document.querySelectorAll('[data-tab-target]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab-target') === target);
    });
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === `view-${target}`);
    });
    this.renderAll();
  }

  renderTabBar() {
    const isFullScreen = (this.currentTab === 'portal' || this.currentTab === 'sos' || this.currentTab === 'party');
    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) {
      tabBar.style.display = isFullScreen ? 'none' : '';
    }

    // 상단 🏠 모드 선택 버튼: 모드 선택 포털 및 SOS 화면에서만 숨기고,
    // 퀴즈 모드, 타이쿤 모드, 미니게임 모드 등 모든 모드에서 상단 우측 동일한 위치에 일관되게 제공
    const hidePortalBtn = (this.currentTab === 'portal' || this.currentTab === 'sos');
    const modePortalBtn = document.getElementById('mode-select-portal-btn');
    if (modePortalBtn) {
      modePortalBtn.style.display = hidePortalBtn ? 'none' : '';
    }

    if (!isFullScreen && (this.currentTab === 'fridge' || !this.canAccessTab(this.currentTab))) {
      this.currentTab = this.getDefaultTabForMode();
    }

    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      if (target === 'party') {
        btn.style.display = 'none';
        return;
      }
      const isVisible = this.canAccessTab(target);
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

    if (
      !this.inventory.shownTabIntros.tycoon &&
      totalRecipes > 0 &&
      this.inventory.unlockedRecipeIds.size >= totalRecipes
    ) {
      this.inventory.shownTabIntros.tycoon = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('tycoon');
    }

    // [STAGE 2 진입 안내] 이모네 포장마차(STAGE 2) 해금 시 외형 그림 기본 제공 종료 안내
    const isStage2Unlocked = this.inventory.unlockedStepId >= 2;
    if (!this.inventory.shownTabIntros.noticeStage2 && isStage2Unlocked) {
      this.inventory.shownTabIntros.noticeStage2 = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('noticeStage2');
    }

    // [STAGE 3 진입 안내] 골목 전통 주점(STAGE 3) 해금 시 설명 힌트 기본 제공 종료 안내
    const isStage3Unlocked = this.inventory.unlockedStepId >= 3;
    if (!this.inventory.shownTabIntros.noticeStage3 && isStage3Unlocked) {
      this.inventory.shownTabIntros.noticeStage3 = true;
      this.inventory.save();
      if (shouldQueue) this.pendingTabIntroQueue.push('noticeStage3');
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
        btnLabel: '⚗️ 연구실에서 상세 재료 확인하기'
      },
      suggestions: {
        emoji: '👍',
        badge: '최종 탭 해금 (도감 100% 마스터)',
        title: '[조합추천] 탭이 열렸습니다!',
        desc: '모든 공식 레시피(100%)를 마스터하셨습니다! 이제 이 게임에 아직 없는 나만의 비법 레시피를 <b>[👍 조합추천]</b> 탭에 등록해 투표를 나누고, <b>[🧊 냉장고를 부탁해]</b>에서도 유저들의 조합추천 레시피를 함께 만나보세요!',
        btnLabel: '👍 조합추천 보러가기'
      },
      tycoon: {
        emoji: '🏪',
        badge: '본게임 해금 (도감 100% 마스터)',
        title: '[주점 타이쿤] 본게임 탭이 열렸습니다!',
        desc: '축하합니다! 도감 100%를 달성한 전설의 마스터에게만 허락된 새로운 본게임 <b>[🏪 타이쿤]</b>이 해금되었습니다!<br/><br/>찾아오는 손님들의 주문을 외워서 조합해 서빙하세요! (<b>♾️ 무한모드</b> 지원)',
        btnLabel: '🏪 주점 타이쿤 영업하러 가기'
      },
      noticeStage2: {
        emoji: '🎨',
        badge: 'STAGE 2 안내',
        title: '외형 그림 잠김 안내',
        visualHtml: `
          <div style="display:flex; align-items:center; justify-content:center; gap:14px; margin:4px 0 6px;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
              <div class="quiz-mystery-icon is-unlocked" style="width:48px; height:48px; border:1.5px solid #10b981; box-shadow:0 0 12px rgba(16,185,129,0.3); background:#0f172a;">
                ${window.KSool?.pixelIcon ? window.KSool.pixelIcon(this.recipeBook?.getRecipe?.(14) || { recipe_id: 14, emoji: '🍋' }, 32) : '🍋'}
              </div>
              <span style="font-size:0.7rem; color:#6ee7b7; font-weight:700;">외형 공개</span>
            </div>
            <span style="font-size:1.3rem; color:#94a3b8; font-weight:900;">➔</span>
            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
              <div class="quiz-mystery-icon is-locked" style="width:48px; height:48px; font-size:1.5rem; border:1.5px dashed #f59e0b; color:#fde047; box-shadow:0 0 12px rgba(245,158,11,0.25);">
                ❓
              </div>
              <span style="font-size:0.7rem; color:#fde047; font-weight:700;">물음표 가림</span>
            </div>
          </div>
        `,
        desc: `
          <div style="text-align:left; display:flex; flex-direction:column; gap:8px; font-size:0.82rem; line-height:1.5;">
            <div style="color:#f8fafc; font-weight:700;">
              🎉 <b>STAGE 1</b>을 마스터하고 <b style="color:#38bdf8;">STAGE 2 (이모네 포장마차)</b>에 진입하셨습니다!
            </div>
            <div style="background:rgba(30,41,59,0.75); border-left:3px solid #f59e0b; padding:8px 10px; border-radius:6px; color:#e2e8f0;">
              📌 <b>No.19</b>부터는 음료 외형이 기본 제공되지 않고 <b style="color:#fde047;">❓ 물음표 상자</b>로 가려집니다.
            </div>
            <div style="color:#cbd5e1;">
              🎮 힌트 버튼의 <b style="color:#38bdf8;">벽돌깨기 · 땅따먹기 · 네모로직</b> 미니게임을 직접 클리어하여 음료 그림을 해금해보세요!
            </div>
          </div>
        `,
        btnLabel: '확인 및 계속하기'
      },
      noticeStage3: {
        emoji: '📜',
        badge: 'STAGE 3 안내',
        title: '설명 힌트 잠김 안내',
        visualHtml: `
          <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin:4px 0 6px; width:100%; max-width:280px;">
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px;">
              <div style="width:100%; height:40px; border-radius:10px; background:rgba(56,189,248,0.12); border:1.5px solid #38bdf8; display:flex; align-items:center; justify-content:center; gap:5px; color:#f8fafc; font-size:0.78rem; font-weight:700; box-shadow:0 0 10px rgba(56,189,248,0.25);">
                <span style="font-size:1rem;">💡</span>
                <span style="color:#7dd3fc;">설명 공개</span>
              </div>
              <span style="font-size:0.7rem; color:#7dd3fc; font-weight:700;">힌트 제공</span>
            </div>
            <span style="font-size:1.2rem; color:#94a3b8; font-weight:900;">➔</span>
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px;">
              <div class="quiz-desc-locked" style="width:100%; height:40px; border-radius:10px; border:1.5px dashed #f43f5e; background:rgba(244,63,94,0.14); color:#fda4af; box-shadow:0 0 10px rgba(244,63,94,0.25);">
                <span class="quiz-lock-icon" style="font-size:0.95rem;">🔒</span>
                <span class="quiz-lock-label" style="color:#fda4af; font-weight:800; font-size:0.78rem;">설명 잠김</span>
              </div>
              <span style="font-size:0.7rem; color:#fda4af; font-weight:700;">자물쇠 잠김</span>
            </div>
          </div>
        `,
        desc: `
          <div style="text-align:left; display:flex; flex-direction:column; gap:8px; font-size:0.82rem; line-height:1.5;">
            <div style="color:#f8fafc; font-weight:700;">
              🎉 <b>STAGE 2</b>를 마스터하고 <b style="color:#c084fc;">STAGE 3 (골목 전통 주점)</b>에 진입하셨습니다!
            </div>
            <div style="background:rgba(30,41,59,0.75); border-left:3px solid #f43f5e; padding:8px 10px; border-radius:6px; color:#e2e8f0;">
              📌 <b>No.38</b>부터는 음료 외형뿐만 아니라 <b style="color:#f87171;">💡 설명 힌트도 🔒 잠긴 상태</b>로 시작됩니다.
            </div>
            <div style="color:#cbd5e1;">
              🎫 힌트 버튼에서 <b style="color:#38bdf8;">은박 복권 긁기</b>나 단계별 힌트를 열어 비밀 레시피를 추리해보세요!
            </div>
          </div>
        `,
        btnLabel: '확인 및 계속하기'
      }
    }[tabKey];

    if (!introMeta) return;

    const visualHtml = introMeta.visualHtml || `<div style="font-size:3.3rem;">${introMeta.emoji}</div>`;

    content.innerHTML = `
      <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
        <span class="diff-badge diff-NORMAL" style="position:static; font-size:0.7rem; padding:3px 10px;">
          🎉 ${introMeta.badge}
        </span>
        ${visualHtml}
        <div style="font-size:1.18rem; font-weight:900; color:#f8fafc;">
          ${introMeta.title}
        </div>
        <div style="font-size:0.8rem; color:#cbd5e1; line-height:1.55; background:#0f172a; border:1px solid #334155; border-radius:12px; padding:12px; width:100%; box-sizing:border-box;">
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
        } else if (tabKey === 'noticeStage2' || tabKey === 'noticeStage3') {
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
   * 베이스볼 & 비율 추리 완료 후 [연구실로 가기] 클릭 시
   * 연구실 슬롯에 해당 레시피의 재료와 비율을 자동으로 세팅하고 연구실 탭으로 이동합니다.
   * 단, 아직 구매하지 않은 상점 재료가 포함되어 있다면 재료 상점 탭으로 안내합니다.
   */
  autoSetupPotFromRecipe(recipeId) {
    const items = this.recipeBook.getRecipeItems(recipeId);
    if (!items || items.length === 0) return;

    // 상세 진단 실행: 조합 미해금, 재고 부족, 상점 미구매를 구분
    const missingDiag = this.inventory.getRecipeMissingRequirements(recipeId);
    if (!missingDiag.isReady) {
      if (missingDiag.missingCrafted.length > 0) {
        const item = missingDiag.missingCrafted[0];
        const ingName = item.ingredient ? this.brandResolver.resolveName(item.ingredient) : '재료';
        const producerRec = item.producerRecipe;
        this.audio.playFail();
        if (producerRec) {
          const prodName = this.brandResolver.resolveName(producerRec);
          this.showToast(`🧪 선행 조합 재료인 '${ingName}'을(를) 먼저 [No.${String(producerRec.recipe_number).padStart(2, '0')} ${prodName}]에서 조합해주세요!`);
          this.quizTargetRecipeId = producerRec.recipe_id;
          this.currentTab = 'brew';
          this.renderAll();
        } else {
          this.showToast(`🧪 선행 조합 재료인 '${ingName}'의 레시피를 먼저 연구실에서 조합해주세요!`);
        }
        return;
      }

      if (missingDiag.outOfStockCrafted.length > 0) {
        const item = missingDiag.outOfStockCrafted[0];
        const ingName = item.ingredient ? this.brandResolver.resolveName(item.ingredient) : '재료';
        const producerRec = item.producerRecipe;
        this.audio.playFail();
        if (producerRec) {
          const prodName = this.brandResolver.resolveName(producerRec);
          this.showToast(`⚠️ '${ingName}'의 재고가 부족합니다! (필요: ${item.requiredCount}개 / 보유: ${item.stock}개)\n[No.${String(producerRec.recipe_number).padStart(2, '0')} ${prodName}]에서 먼저 조합해주세요!`);
          this.quizTargetRecipeId = producerRec.recipe_id;
          this.currentTab = 'brew';
          this.renderAll();
        } else {
          this.showToast(`⚠️ '${ingName}'의 재고가 부족합니다! 연구실에서 먼저 조합해주세요.`);
        }
        return;
      }

      if (missingDiag.missingShop.length > 0) {
        const item = missingDiag.missingShop[0];
        const ingName = item.ingredient ? this.brandResolver.resolveName(item.ingredient) : '재료';
        this.switchTab('shop');
        this.showToast(`🛒 아직 보유하지 않은 재료 '${ingName}'이(가) 포함되어 있습니다! [🛒 재료상점] 탭에서 먼저 준비해주세요.`);
        return;
      }
    }

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
    this.brewMode = 'QUIZ';
    this._renderBrewStepQuizBar();
    this._renderPotSlots();
    this._renderIngredientCategoryChips();
    this._renderIngredientsGrid();
  }

  /**
   * 연구실 상단: 단계별 문제 카드 렌더링 (점포·자금 배너 및 상점 토글 탭 제거)
   */
  _renderBrewStepQuizBar() {
    const container = document.getElementById('brew-step-quiz-bar');
    if (!container) return;

    const allRecipes = this.recipeBook.getAllRecipes();
    const totalCount = allRecipes.length;
    const nextUnsolved = this.inventory.getNextQuizRecipe();

    let navigableRecipes;
    if (this.currentMode === 'HELP_FRIEND') {
      const fixedRec = this.recipeBook.getRecipe(this.quizTargetRecipeId);
      navigableRecipes = fixedRec ? [fixedRec] : [];
    } else {
      navigableRecipes = allRecipes.filter(
        r =>
          this.inventory.isRecipeUnlocked(r.recipe_id) ||
          this.inventory.isRecipeChallengeable(r) ||
          Number(r.step_id) <= this.inventory.unlockedStepId
      );
      if (navigableRecipes.length === 0 && allRecipes.length > 0) {
        navigableRecipes.push(allRecipes[0]);
      }
    }

    let targetRec = this.recipeBook.getRecipe(this.quizTargetRecipeId);
    if (!targetRec || !navigableRecipes.some(r => r.recipe_id === targetRec.recipe_id)) {
      targetRec = nextUnsolved || navigableRecipes[0];
      if (targetRec) this.quizTargetRecipeId = targetRec.recipe_id;
    }

    if (!targetRec) {
      container.innerHTML = '';
      return;
    }

    const navIdx = navigableRecipes.findIndex(r => r.recipe_id === targetRec.recipe_id);
    const hasPrev = navIdx > 0;
    const hasNext = navIdx >= 0 && navIdx < navigableRecipes.length - 1;
    const isUnlocked = this.inventory.isRecipeUnlocked(targetRec.recipe_id);
    const isChallengeable = this.inventory.isRecipeChallengeable(targetRec);
    const isImageUnlocked = this.inventory.isRecipeImageUnlocked(targetRec.recipe_id);
    const isDescUnlocked = this.inventory.isRecipeDescUnlocked(targetRec.recipe_id);
    const isImageAvailable = isUnlocked || isImageUnlocked;
    const resolvedName = this.brandResolver.resolveName(targetRec);
    const isCollectionUnlocked = this.inventory.isTabUnlocked('collection');
    const showHintBtn = !isUnlocked && isCollectionUnlocked;
    const needsShopMaterials = !isUnlocked && !isChallengeable;

    const missingDiag = !isUnlocked ? this.inventory.getRecipeMissingRequirements(targetRec.recipe_id) : null;
    let descAreaHtml = '';
    if (needsShopMaterials) {
      if (missingDiag && missingDiag.missingCrafted.length > 0) {
        const item = missingDiag.missingCrafted[0];
        const prodRec = item.producerRecipe;
        const isQuiz = (this.currentMode === 'QUIZ');
        if (isQuiz) {
          descAreaHtml = `
            <div class="quiz-shop-needed-banner is-static" style="border-color:#38bdf8; background:rgba(14,165,233,0.12); color:#38bdf8;">
              <span>🧪 이전 번호의 음료 연구가 먼저 완료되어야 합니다!</span>
            </div>
          `;
        } else {
          descAreaHtml = `
            <button type="button" class="quiz-shop-needed-banner" id="quiz-go-producer-btn" data-jump-recipe-id="${prodRec ? prodRec.recipe_id : ''}" title="클릭하여 선행 조합 레시피로 이동" style="border-color:#38bdf8; background:rgba(14,165,233,0.12); color:#38bdf8;">
              <span>🧪 선행 조합 재료인 '${item.ingredient ? this.brandResolver.resolveName(item.ingredient) : '재료'}'을(를) 먼저 조합해야 합니다!</span>
              <b>선행 연구로 이동 ▸</b>
            </button>
          `;
        }
      } else if (missingDiag && missingDiag.outOfStockCrafted.length > 0) {
        const item = missingDiag.outOfStockCrafted[0];
        const ingName = item.ingredient ? this.brandResolver.resolveName(item.ingredient) : '재료';
        const prodRec = item.producerRecipe;
        descAreaHtml = `
          <button type="button" class="quiz-shop-needed-banner" id="quiz-go-producer-btn" data-jump-recipe-id="${prodRec ? prodRec.recipe_id : ''}" title="클릭하여 선행 조합 레시피로 이동" style="border-color:#fbbf24; background:rgba(245,158,11,0.12); color:#fbbf24;">
            <span>⚠️ '${ingName}'의 재고가 부족합니다! (필요: ${item.requiredCount}개 / 보유: ${item.stock}개)</span>
            <b>재료 조합하러 가기 ▸</b>
          </button>
        `;
      } else {
        const isQuiz = (this.currentMode === 'QUIZ');
        if (isQuiz) {
          descAreaHtml = `
            <div class="quiz-shop-needed-banner is-static" style="border-color:#64748b; background:rgba(51,65,85,0.25); color:#94a3b8;">
              <span>🔒 이전 단계(스테이지)의 음료들을 먼저 완성해주세요!</span>
            </div>
          `;
        } else {
          descAreaHtml = `
            <button type="button" class="quiz-shop-needed-banner" id="quiz-go-shop-chip-btn" title="클릭하여 재료상점으로 이동">
              <span>🛒 아직 보유하지 않은 재료(상점 구매 필요)가 포함되어 있습니다!</span>
              <b>재료상점 탭 보기 ▸</b>
            </button>
          `;
        }
      }
    } else {
      descAreaHtml = `
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
      `;
    }

    let mysteryIconClass = 'quiz-mystery-icon';
    let mysteryIconTitle = '';
    if (isUnlocked) {
      mysteryIconClass += ' is-unlocked is-clickable';
      mysteryIconTitle = '클릭하여 레시피 상세 정보 보기';
    } else if (needsShopMaterials) {
      mysteryIconClass += ' is-locked is-disabled';
      mysteryIconTitle = '필요한 재료를 먼저 획득해야 힌트와 연구가 가능합니다';
    } else if (isImageAvailable) {
      mysteryIconClass += ' is-unlocked';
      mysteryIconTitle = '';
    } else if (showHintBtn) {
      mysteryIconClass += ' is-locked is-clickable';
      mysteryIconTitle = '❓ 클릭하여 그림 해금 미니게임 도전';
    } else {
      mysteryIconClass += ' is-locked';
      mysteryIconTitle = '도감·힌트 기능 해금 후 그림 미니게임이 열립니다';
    }

    let leftActionBtnHtml = '';
    if (isUnlocked) {
      leftActionBtnHtml = `<button type="button" class="quiz-infer-btn is-completed" id="quiz-completed-info-btn" title="클릭하여 레시피 상세 정보 보기">완료</button>`;
    } else if (needsShopMaterials) {
      leftActionBtnHtml = `<button type="button" class="quiz-infer-btn is-disabled" id="quiz-open-hint-btn" disabled title="필요한 재료를 먼저 획득해야 힌트를 이용할 수 있습니다">힌트</button>`;
    } else if (showHintBtn) {
      leftActionBtnHtml = `<button type="button" class="quiz-infer-btn" id="quiz-open-hint-btn">힌트</button>`;
    }

    const titleGroupHtml = `<span class="quiz-target-title">${resolvedName}</span>`;
    const navRightHtml = `
      <div class="quiz-nav-right">
        <button type="button" class="quiz-nav-btn" id="quiz-prev-btn" ${hasPrev ? '' : 'disabled'} title="이전 번호">◀</button>
        <button type="button" class="quiz-num-badge" id="quiz-jump-btn" title="클릭하여 원하는 번호나 단계로 바로 이동" style="cursor:pointer; background:rgba(30,41,59,0.9); border:1px solid #475569; border-radius:6px; padding:3px 7px; color:#e2e8f0; font-weight:700;">
          ${targetRec.formatted_number} <span class="quiz-num-total" style="font-size:0.75rem; color:#94a3b8;">/ ${totalCount} ▾</span>
        </button>
        <button type="button" class="quiz-nav-btn" id="quiz-next-btn" ${hasNext ? '' : 'disabled'} title="다음 번호">▶</button>
      </div>
    `;

    const recipeItems = (typeof this.recipeBook.getRecipeItems === 'function'
      ? this.recipeBook.getRecipeItems(targetRec.recipe_id)
      : (this.recipeBook.getIngredientsForRecipe ? this.recipeBook.getIngredientsForRecipe(targetRec.recipe_id) : [])) || [];
    const hasMultipleRatio = recipeItems.some(it => Number(it.ratio) > 1);
    const isStep4OrAbove = Number(targetRec.step_id) >= 4;

    let ratioTipHtml = '';
    if (!isUnlocked && (hasMultipleRatio || isStep4OrAbove)) {
      ratioTipHtml = `
        <div class="quiz-ratio-tip-badge" style="font-size:0.71rem; color:#fde047; background:rgba(245,158,11,0.14); border:1px solid rgba(245,158,11,0.35); border-radius:6px; padding:3px 7px; margin-top:2px; display:inline-flex; align-items:center; gap:4px; line-height:1.25;">
          <span>⚖️</span> <span><b>황금비율 TIP:</b> 재료 카드를 <b>여러 번 터치</b>하면 개수(비율)가 올라갑니다!</span>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="brew-quiz-card">
        <div class="quiz-question-row">
          <div class="quiz-icon-col">
            <div class="${mysteryIconClass}"
                 id="quiz-mystery-icon"
                 title="${mysteryIconTitle}">
              ${isImageAvailable ? (window.KSool?.pixelIcon ? window.KSool.pixelIcon(targetRec, 36) : targetRec.emoji) : '❓'}
            </div>
            ${leftActionBtnHtml}
          </div>
          <div class="quiz-question-body">
            <div class="quiz-header-inline">
              <div class="quiz-title-group">
                ${titleGroupHtml}
              </div>
              ${navRightHtml}
            </div>
            ${descAreaHtml}
            ${ratioTipHtml}
          </div>
        </div>
      </div>
    `;

    this._bindBrewQuizEvents(container, navigableRecipes, targetRec);
  }

  _bindBrewQuizEvents(container, navigableRecipes, targetRec) {
    const jumpBtn = container.querySelector('#quiz-jump-btn');
    if (jumpBtn) {
      jumpBtn.onclick = () => {
        this.audio.playTap();
        this._openRecipeJumpModal(navigableRecipes, targetRec);
      };
    }

    const quizShopBannerBtn = container.querySelector('#quiz-go-shop-chip-btn');
    if (quizShopBannerBtn) {
      quizShopBannerBtn.onclick = () => {
        this.audio.playTap();
        this.switchTab('shop');
      };
    }

    const quizProducerBannerBtn = container.querySelector('#quiz-go-producer-btn');
    if (quizProducerBannerBtn) {
      quizProducerBannerBtn.onclick = () => {
        const jumpId = Number(quizProducerBannerBtn.getAttribute('data-jump-recipe-id'));
        this.audio.playTap();
        if (jumpId) {
          this.quizTargetRecipeId = jumpId;
          this._renderBrewStepQuizBar();
        }
      };
    }

    const quizJumpPrevStageBtn = container.querySelector('#quiz-jump-prev-stage-btn');
    if (quizJumpPrevStageBtn) {
      quizJumpPrevStageBtn.onclick = () => {
        const nextQuiz = this.inventory.getNextQuizRecipe();
        this.audio.playTap();
        if (nextQuiz) {
          this.quizTargetRecipeId = nextQuiz.recipe_id;
          this._renderBrewStepQuizBar();
        }
      };
    }

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

    const completedBtn = container.querySelector('#quiz-completed-info-btn');
    if (completedBtn && targetRec) {
      completedBtn.onclick = () => {
        this.audio.playTap();
        this.showCraftResultModal({ isSuccess: true, recipe: targetRec, isNewDiscovery: false });
      };
    }

    const hintBtn = container.querySelector('#quiz-open-hint-btn');
    if (hintBtn && targetRec) {
      if (!hintBtn.disabled) {
        hintBtn.onclick = () => {
          this.audio.playTap();
          this.hintModalView.open(targetRec.recipe_id);
        };
      } else {
        hintBtn.onclick = null;
      }
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
      const isUnlocked = this.inventory.isRecipeUnlocked(targetRec.recipe_id);
      const isChallengeable = this.inventory.isRecipeChallengeable(targetRec);
      const isImageAvailable = isUnlocked || this.inventory.isRecipeImageUnlocked(targetRec.recipe_id);
      const isCollectionUnlocked = this.inventory.isTabUnlocked('collection');
      const showHintBtn = !isUnlocked && isCollectionUnlocked;
      const needsShopMaterials = !isUnlocked && !isChallengeable;

      if (isUnlocked) {
        mysteryIcon.style.cursor = 'pointer';
        mysteryIcon.title = '클릭하여 레시피 상세 정보 보기';
        mysteryIcon.onclick = () => {
          this.audio.playTap();
          this.showCraftResultModal({ isSuccess: true, recipe: targetRec, isNewDiscovery: false });
        };
      } else if (needsShopMaterials) {
        mysteryIcon.style.cursor = 'not-allowed';
        mysteryIcon.title = '필요한 재료를 먼저 획득해야 힌트와 연구가 가능합니다';
        mysteryIcon.onclick = null;
      } else if (!isImageAvailable && showHintBtn) {
        mysteryIcon.style.cursor = 'pointer';
        mysteryIcon.title = '❓ 클릭하여 그림 해금 미니게임 도전';
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

  _openRecipeJumpModal(navigableRecipes, targetRec) {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    if (!modal || !content) return;

    const stages = [
      { step: 1, name: '1단계: 길거리 노점 (No.01~18)' },
      { step: 2, name: '2단계: 포장마차 (No.19~37)' },
      { step: 3, name: '3단계: 전통 주점 (No.38~55)' },
      { step: 4, name: '4단계: 비어 펍 (No.56~67)' },
      { step: 5, name: '5단계: 라운지 바 (No.68~77)' },
      { step: 6, name: '6단계: 미래도시 바 (No.78~84)' }
    ];

    let currentStepId = targetRec ? (targetRec.step_id || 1) : 1;

    const renderStageTabs = (activeStep) => stages.map(st => `
      <button type="button" class="stage-jump-tab-btn" data-jump-step="${st.step}" style="padding:7px 4px; border-radius:8px; font-size:0.78rem; font-weight:700; cursor:pointer; background:${st.step === activeStep ? '#2563eb' : '#1e293b'}; color:${st.step === activeStep ? '#ffffff' : '#94a3b8'}; border:1px solid ${st.step === activeStep ? '#60a5fa' : '#334155'}; transition:all 0.15s ease; text-align:center;">
        ${st.step}단계
      </button>
    `).join('');

    const renderListForStep = (step) => {
      const recs = navigableRecipes.filter(r => (r.step_id || 1) === step);
      if (recs.length === 0) {
        return `<div style="text-align:center; padding:24px; color:#64748b; font-size:0.85rem;">해당 단계의 연구 대상 레시피가 없습니다.</div>`;
      }
      return recs.map(r => {
        const isCurrent = targetRec && r.recipe_id === targetRec.recipe_id;
        const isUnlocked = this.inventory.isRecipeUnlocked(r.recipe_id);
        const name = this.brandResolver.resolveName(r);
        const icon = window.KSool?.pixelIcon ? window.KSool.pixelIcon(r, 22) : (r.emoji || '🍶');

        let statusBadge = '';
        if (isUnlocked) {
          statusBadge = `<span style="color:#10b981; font-size:0.72rem; font-weight:700; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:2px 6px; border-radius:4px;">완료 ✅</span>`;
        } else {
          const missing = this.inventory.getRecipeMissingRequirements(r.recipe_id);
          if (missing.missingCrafted.length > 0) {
            statusBadge = `<span style="color:#38bdf8; font-size:0.7rem; font-weight:700; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); padding:2px 6px; border-radius:4px;">하위조합 필요 🧪</span>`;
          } else if (missing.missingShop.length > 0) {
            statusBadge = `<span style="color:#fbbf24; font-size:0.7rem; font-weight:700; background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.3); padding:2px 6px; border-radius:4px;">재료구매 필요 🛒</span>`;
          } else if (missing.outOfStockCrafted.length > 0) {
            statusBadge = `<span style="color:#fb923c; font-size:0.7rem; font-weight:700; background:rgba(251,146,60,0.15); border:1px solid rgba(251,146,60,0.3); padding:2px 6px; border-radius:4px;">재료부족 ⚠️</span>`;
          } else {
            statusBadge = `<span style="color:#34d399; font-size:0.7rem; font-weight:700; background:rgba(52,211,153,0.15); border:1px solid rgba(52,211,153,0.3); padding:2px 6px; border-radius:4px;">연구 가능 🧪</span>`;
          }
        }

        return `
          <button type="button" class="recipe-jump-item-btn" data-jump-recipe-id="${r.recipe_id}" style="display:flex; align-items:center; justify-content:space-between; width:100%; padding:9px 12px; background:${isCurrent ? '#1e3a8a' : '#0f172a'}; border:1px solid ${isCurrent ? '#3b82f6' : '#334155'}; border-radius:8px; cursor:pointer; color:#e2e8f0; text-align:left; transition:all 0.15s ease;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.75rem; font-weight:800; color:#38bdf8; min-width:44px;">${r.formatted_number}</span>
              <span style="display:inline-flex; align-items:center; justify-content:center;">${icon}</span>
              <span style="font-weight:700; font-size:0.84rem;">${name}</span>
            </div>
            ${statusBadge}
          </button>
        `;
      }).join('');
    };

    content.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; max-height:80vh; overflow:hidden;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #334155; padding-bottom:8px;">
          <h3 style="margin:0; font-size:1rem; color:#f8fafc; font-weight:800;">📍 연구 대상 번호 바로가기</h3>
          <button type="button" class="modal-close-x" id="jump-modal-close-btn" style="background:none; border:none; font-size:1.2rem; color:#94a3b8; cursor:pointer;">✕</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;" id="jump-stage-tabs-row">
          ${renderStageTabs(currentStepId)}
        </div>

        <div style="overflow-y:auto; display:flex; flex-direction:column; gap:6px; max-height:55vh; padding-right:4px;" id="jump-recipes-list-container">
          ${renderListForStep(currentStepId)}
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeBtn = content.querySelector('#jump-modal-close-btn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };

    const bindItemClicks = () => {
      content.querySelectorAll('[data-jump-recipe-id]').forEach(itemBtn => {
        itemBtn.onclick = () => {
          const rId = Number(itemBtn.getAttribute('data-jump-recipe-id'));
          this.audio.playTap();
          this.quizTargetRecipeId = rId;
          modal.classList.remove('active');
          this._renderBrewStepQuizBar();
        };
      });
    };

    const attachTabEvents = () => {
      content.querySelectorAll('[data-jump-step]').forEach(tabBtn => {
        tabBtn.onclick = () => {
          const step = Number(tabBtn.getAttribute('data-jump-step'));
          this.audio.playTap();
          currentStepId = step;
          const tabsRow = content.querySelector('#jump-stage-tabs-row');
          if (tabsRow) {
            tabsRow.innerHTML = renderStageTabs(step);
            attachTabEvents();
          }
          const listContainer = content.querySelector('#jump-recipes-list-container');
          if (listContainer) {
            listContainer.innerHTML = renderListForStep(step);
            bindItemClicks();
          }
        };
      });
    };

    attachTabEvents();
    bindItemClicks();
  }

  _clearMixBtnAlert() {
    if (this._mixBtnAlertTimer) {
      clearTimeout(this._mixBtnAlertTimer);
      this._mixBtnAlertTimer = null;
    }
    const mixBtn = document.getElementById('mix-btn');
    if (mixBtn) {
      mixBtn.textContent = '🔬 조합하기';
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
      mixBtn.textContent = '🔬 조합하기';
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
        const countBadge = slot.count > 1 ? `<span class="slot-count-badge" title="가마솥 투입 수량">${slot.count}</span>` : '';

        html.push(`
          <div class="pot-slot filled" data-pot-slot-idx="${i}" title="${name} (수량: ${slot.count}개 · 클릭하면 개수가 1 줄어듭니다)">
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

    // 슬롯 카드 전체 클릭: 수량 1 감소 (0개 되면 슬롯 제거)
    slotsGrid.querySelectorAll('[data-pot-slot-idx]').forEach(el => {
      el.onclick = () => {
        this._clearMixBtnAlert();
        const idx = Number(el.getAttribute('data-pot-slot-idx'));
        this.craftingPot.decrementSlot(idx);
        this.audio.playTap();
        this._renderPotSlots();
        this._updateIngredientsPotBadges();
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
             title="${name} (클릭하여 가마솥에 담기)">
          ${pickerLabel ? `<button type="button" class="ing-picker-btn" data-open-detail-picker="${ing.ingredient_id}" title="상세 재료 선택 팝업 열기">${pickerLabel} ▾</button>` : ''}
          ${inPotCount > 1 ? `<span class="slot-count-badge" title="가마솥 투입 비율">${inPotCount}</span>` : ''}
          <span class="ing-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 32) : ing.emoji}</span>
          <span class="ing-name">${name}</span>
        </div>
      `;
  }

  _bindIngredientsGridEvents() {
    const grid = document.getElementById('ingredients-grid');
    if (!grid || grid._hasBoundEvents) return;
    grid._hasBoundEvents = true;

    // 이벤트 위임(Event Delegation)으로 카드 파괴/재생성 시에도 리스너 유실 없이 연속 빠른 탭 100% 포착
    grid.addEventListener('click', (e) => {
      const shopCard = e.target.closest('[data-buy-lab-ing-id]');
      if (shopCard) {
        e.stopPropagation();
        const buyId = Number(shopCard.getAttribute('data-buy-lab-ing-id'));
        const res = this.inventory.purchaseBaseIngredient(buyId, this.tycoonView?.engine);
        if (!res.ok) {
          this.audio.playFail();
          this.showToast(`⚠️ ${res.message}`);
        } else {
          this.audio.playSuccess();
          this.showToast(`🎉 ${res.message}`);
          this.renderBrewView();
          this.renderCollectionView();
          this.tycoonView?.render?.();
        }
        return;
      }

      const pickerBtn = e.target.closest('[data-open-detail-picker]');
      if (pickerBtn) {
        e.stopPropagation();
        const baseId = Number(pickerBtn.getAttribute('data-open-detail-picker'));
        const baseIng = this.recipeBook.getBaseIngredient(baseId);
        const details = this.recipeBook.getDetailsForBase(baseId);
        this.audio.playTap();
        this.openDetailPickerModal(baseIng, details);
        return;
      }

      const card = e.target.closest('[data-base-ing-id]');
      if (card) {
        const baseId = Number(card.getAttribute('data-base-ing-id'));
        this._addIngredientToPot(baseId, null);
      }
    });
  }

  _updateIngredientsPotBadges() {
    const grid = document.getElementById('ingredients-grid');
    if (!grid) return;
    const potSlots = this.craftingPot.getSlots();
    const countMap = new Map();
    for (const s of potSlots) {
      countMap.set(s.baseId, (countMap.get(s.baseId) || 0) + s.count);
    }

    // DOM 노드를 파괴하지 않고 기존 카드들의 뱃지와 in-pot 상태만 실시간 갱신하여 연속 터치 씹힘 원천 방지
    grid.querySelectorAll('[data-base-ing-id]').forEach(card => {
      const id = Number(card.getAttribute('data-base-ing-id'));
      const inPotCount = countMap.get(id) || 0;
      card.classList.toggle('in-pot', inPotCount > 0);

      let countBadge = card.querySelector('.slot-count-badge');
      if (inPotCount > 1) {
        if (!countBadge) {
          countBadge = document.createElement('span');
          countBadge.className = 'slot-count-badge';
          countBadge.title = '가마솥 투입 비율';
          card.appendChild(countBadge);
        }
        countBadge.textContent = inPotCount;
      } else if (countBadge) {
        countBadge.remove();
      }
    });
  }

  _renderIngredientsGrid() {
    const grid = document.getElementById('ingredients-grid');
    if (!grid) return;

    const prevScroll = grid.scrollTop || 0;
    this._bindIngredientsGridEvents();
    grid.classList.remove('is-shop-mode');

    // 미해금된 재료는 화면에 아예 보이지 않도록 필터링
    const unlockedBase = Array.from(this.recipeBook.baseIngredients.values()).filter(ing =>
      this.inventory.isIngredientAvailable(ing.ingredient_id)
    );

    const potSlots = this.craftingPot.getSlots();

    const filtered = unlockedBase.filter(i => i.category_id === this.selectedIngCategory);
    filtered.sort((a, b) => a.ingredient_id - b.ingredient_id);
    grid.innerHTML = filtered.map(ing => this._createIngredientCardHtml(ing, potSlots)).join('');
    if (prevScroll > 0) {
      grid.scrollTop = prevScroll;
    }
  }

  /**
   * [탭 2.5] 재료 상점 (Ingredient Shop View) 독립 탭 렌더링
   * - 상단: 현재 보유 자금(💰 n원)을 한눈에 인지할 수 있는 큼직하고 직관적인 지갑 대시보드 카드
   * - 하단: 해금된 스테이지별 상점 재료 목록 및 원터치 구매 카드
   */
  renderShopView() {
    const container = document.getElementById('shop-view-container');
    if (!container) return;

    const prevScrollEl = container.querySelector('.shop-scroll-body');
    const prevScrollTop = prevScrollEl ? prevScrollEl.scrollTop : 0;

    const wallet = this.tycoonView?.engine ? this.tycoonView.engine.persistentWallet : 0;
    const maxStep = this.inventory.unlockedStepId || 1;
    const stageSectionsHtml = [];

    let totalShopCount = 0;
    let totalPurchasedCount = 0;

    for (let sId = 1; sId <= maxStep; sId++) {
      const stepCfg = this.recipeBook.progression.getStepConfig(sId);
      const shopItems = stepCfg.shopIngredients || [];
      if (shopItems.length === 0) continue;

      const purchasedCount = shopItems.filter(it => this.inventory.isBaseIngredientPurchased(it.id)).length;
      totalShopCount += shopItems.length;
      totalPurchasedCount += purchasedCount;

      const itemCards = [];
      for (const item of shopItems) {
        const baseIng = this.recipeBook.getBaseIngredient(item.id);
        if (!baseIng) continue;
        const isOwned = this.inventory.isBaseIngredientPurchased(item.id);
        const canAfford = !isOwned && wallet >= item.price;
        const name = this.brandResolver.resolveName(baseIng);
        const icon = window.KSool?.pixelIcon ? window.KSool.pixelIcon(baseIng, 30) : baseIng.emoji;

        if (isOwned) {
          itemCards.push(`
            <div class="lab-shop-row-card is-owned">
              <div class="lab-shop-row-left">
                <span class="lab-shop-row-icon">${icon}</span>
                <div class="lab-shop-row-meta">
                  <div class="lab-shop-row-name">${name}</div>
                  <div class="lab-shop-row-hint">${item.unlocksHint || ''}</div>
                </div>
              </div>
              <span class="lab-shop-buy-pill owned">✅ 보유중</span>
            </div>
          `);
        } else {
          itemCards.push(`
            <button type="button" class="lab-shop-row-card ${canAfford ? 'can-buy' : 'locked-funds'}"
                    data-buy-shop-tab-ing="${baseIng.ingredient_id}">
              <div class="lab-shop-row-left">
                <span class="lab-shop-row-icon">${icon}</span>
                <div class="lab-shop-row-meta">
                  <div class="lab-shop-row-name">${name}</div>
                  <div class="lab-shop-row-hint">${item.unlocksHint || ''}</div>
                </div>
              </div>
              <span class="lab-shop-buy-pill ${canAfford ? 'buyable' : 'disabled'}">
                💰 ${item.price.toLocaleString()}원
                <small>${canAfford ? '구매하기' : '자금부족'}</small>
              </span>
            </button>
          `);
        }
      }

      stageSectionsHtml.push(`
        <div class="lab-shop-stage-group">
          <div class="lab-shop-stage-header">
            <span>${stepCfg.badge || `STAGE ${sId}`} · ${stepCfg.title}</span>
            <b>구매 ${purchasedCount} / ${shopItems.length}종</b>
          </div>
          <div class="lab-shop-stage-list">
            ${itemCards.join('')}
          </div>
        </div>
      `);
    }

    container.innerHTML = `
      <div class="shop-wallet-hero-card">
        <div class="shop-wallet-hero-left">
          <div class="shop-wallet-coin-emblem">💰</div>
          <div class="shop-wallet-hero-text">
            <span class="shop-wallet-label">현재 사용 가능한 보유 자금</span>
            <div class="shop-wallet-amount-row">
              <strong class="shop-wallet-amount">${wallet.toLocaleString()}</strong>
              <span class="shop-wallet-unit">원</span>
            </div>
          </div>
        </div>
        <div class="shop-wallet-hero-right">
          <span class="shop-owned-summary-pill">보유 재료 <b>${totalPurchasedCount}/${totalShopCount}</b></span>
        </div>
      </div>

      <div class="shop-scroll-body">
        ${stageSectionsHtml.join('')}
      </div>
    `;

    if (prevScrollTop > 0) {
      const newScrollEl = container.querySelector('.shop-scroll-body');
      if (newScrollEl) newScrollEl.scrollTop = prevScrollTop;
    }

    container.querySelectorAll('[data-buy-shop-tab-ing]').forEach(btn => {
      btn.onclick = () => {
        const buyId = Number(btn.getAttribute('data-buy-shop-tab-ing'));
        const res = this.inventory.purchaseBaseIngredient(buyId, this.tycoonView?.engine);
        if (!res.ok) {
          this.audio.playFail();
          this.showToast(`⚠️ ${res.message}`);
        } else {
          this.audio.playSuccess();
          this.showToast(`🎉 ${res.message}`);
          this.renderShopView();
          this.renderBrewView();
          this.renderCollectionView();
          this.tycoonView?.render?.();
        }
      };
    });
  }

  _addIngredientToPot(baseId, detailId = null, isExplicit = false) {
    this._clearMixBtnAlert();
    const bId = Number(baseId);
    if (!this.inventory.isIngredientAvailable(bId)) {
      this.audio.playFail();
      const ing = this.recipeBook.getBaseIngredient(bId);
      const name = ing ? this.brandResolver.resolveName(ing) : '재료';
      if (this.inventory.isCraftedIngredient(bId)) {
        this.showToast(`🧪 '${name}'은(는) 직접 조합하여 먼저 해금해야 하는 재료입니다!`);
      } else {
        this.showToast(`🛒 '${name}'은(는) 아직 보유하지 않은 재료입니다!`);
      }
      return;
    }
    const stepConfig = this.inventory.getCurrentStepConfig();
    let effectiveDetailId = detailId;

    if (!isExplicit) {
      // 재료 그리드 카드를 직접 탭한 경우: 가마솥에 이미 존재하는 해당 재료의 슬롯을 증량
      const matchingSlots = this.craftingPot.getSlots().filter(s => s.baseId === Number(baseId));
      if (matchingSlots.length === 1) {
        effectiveDetailId = matchingSlots[0].detailId;
      } else if (matchingSlots.length > 1) {
        effectiveDetailId = matchingSlots[matchingSlots.length - 1].detailId;
      } else {
        effectiveDetailId = null;
      }
    }

    const res = this.craftingPot.tapIngredient(baseId, effectiveDetailId, stepConfig);
    if (!res.ok) {
      this.audio.playFail();
      this.showToast(res.message);
      return;
    }
    this.audio.playTap();
    this._renderPotSlots();
    // 전체 DOM 재생성 대신 뱃지만 업데이트하여 연타 시 터치 씹힘 완벽 방지
    this._updateIngredientsPotBadges();
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
        this._addIngredientToPot(baseIng.ingredient_id, null, true);
      };
    }

    content.querySelectorAll('[data-detail-id]').forEach(el => {
      el.onclick = () => {
        const detId = Number(el.getAttribute('data-detail-id'));
        modal.classList.remove('active');
        this._addIngredientToPot(baseIng.ingredient_id, detId, true);
      };
    });
  }

  renderCollectionView() {
    const filterBar = document.getElementById('recipe-cat-bar');
    const grid = document.getElementById('sool-grid');
    if (!filterBar || !grid) return;

    const allRecipes = this.recipeBook.getAllRecipes();
    // 연구실과 동일하게 이미 해금했거나 지금 당장 해금 가능한(하위 재료가 모두 해금된) 레시피만 도감에 노출
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

            <div style="display:flex; gap:8px; width:100%; margin-top:6px;">
              <button class="mix-btn" id="result-go-lab-btn" style="flex:1.4; background:linear-gradient(135deg, #0284c7, #2563eb); border:1px solid #38bdf8; font-size:0.88rem; padding:10px 6px;">
                🔬 연구실에서 조합하기
              </button>
              <button class="mix-btn" id="result-close-btn" style="flex:1; background:#334155; border:1px solid #475569; font-size:0.88rem; padding:10px 6px;">
                확인
              </button>
            </div>
          </div>
        `;

        modal.classList.add('active');
        const goLabBtn = content.querySelector('#result-go-lab-btn');
        if (goLabBtn) {
          goLabBtn.onclick = () => {
            modal.classList.remove('active');
            this.audio.playTap();
            this.quizTargetRecipeId = rec.recipe_id;
            this.switchTab('brew');
            this._renderBrewStepQuizBar();
          };
        }
        const closeBtn = content.querySelector('#result-close-btn');
        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        modal.onclick = (e) => {
          if (e.target === modal) modal.classList.remove('active');
        };
        return;
      }

      // [친구 SOS 풀이 모드] 정답 발견 시 축하 및 정답 복사 / 본게임 시작
      if (this.currentMode === 'HELP_FRIEND') {
        const plainFormula = items.map(it => {
          const det = this.recipeBook.getDetailIngredient(it.detail_ingredient_id);
          const base = this.recipeBook.getBaseIngredient(it.ingredient_id);
          const target = det || base;
          return `${this.brandResolver.resolveName(target)} ${it.ratio || 1}개`;
        }).join(' + ');

        content.innerHTML = `
          <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px;">
            <div style="background:rgba(16,185,129,0.2); border:1px solid #10b981; border-radius:12px; padding:8px 16px; color:#34d399; font-weight:800; font-size:1.05rem;">
              🎉 친구의 SOS 문제 해결 성공!
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
            <div style="width:100%; background:#0f172a; border:1px solid #334155; border-radius:10px; padding:10px; font-size:0.85rem; color:#fcd34d; font-weight:800;">
              ✨ 발견한 정답 조합: ${recipeFormula}
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; width:100%; margin-top:6px;">
              <button class="mix-btn" id="sos-copy-answer-btn" style="background:linear-gradient(135deg, #10b981, #059669); border-color:#34d399; font-weight:800; font-size:0.92rem; padding:12px;">
                📋 정답 복사해서 친구에게 알려주기
              </button>
              <button class="clear-pot-btn" id="sos-play-my-game-btn" style="background:#1e293b; border:1px solid #475569; color:#e2e8f0; font-size:0.88rem; padding:10px;">
                🎮 나도 K-술 연금술사 본게임 시작하기
              </button>
            </div>
          </div>
        `;

        modal.classList.add('active');
        const copyAnsBtn = content.querySelector('#sos-copy-answer-btn');
        if (copyAnsBtn) {
          copyAnsBtn.onclick = async () => {
            this.audio?.playTap?.();
            const recName = this.brandResolver.resolveName(rec);
            const gameLink = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
            const ansText = `[K-술 연금술사 SOS 정답]\n내가 '${recName}' 황금 조합을 찾았어!\n👉 조합: ${plainFormula}\n얼른 조합해서 해금해봐! 🍶✨\n\n🎮 나도 K-술 연금술사 도전하기:\n${gameLink}`;
            if (navigator?.clipboard?.writeText) {
              try {
                await navigator.clipboard.writeText(ansText);
                this.showToast('📋 정답이 클립보드에 복사되었습니다!\n친구에게 메신저로 보내주세요.');
                return;
              } catch (_) {}
            }
            this.showToast(`정답: ${plainFormula}`);
          };
        }
        const playMyGameBtn = content.querySelector('#sos-play-my-game-btn');
        if (playMyGameBtn) {
          playMyGameBtn.onclick = () => {
            modal.classList.remove('active');
            this.audio?.playTap?.();
            if (this.platformBridge) {
              this.platformBridge.handlePlayMyGameAction(this);
            } else {
              this.switchTab('portal');
            }
          };
        }
        modal.onclick = (e) => {
          if (e.target === modal) modal.classList.remove('active');
        };
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

      const isTycoonMode = (this.currentMode === 'TYCOON');
      const eng = this.tycoonView?.engine;
      const isOrderableInTycoon = isTycoonMode && Boolean(eng?.isOrderableRecipe(rec));
      const curStage = eng?.getCurrentMapStage?.();
      const unlockedOrderableList = (isTycoonMode && eng) ? eng.getStageOrderableUnlockedRecipes(curStage?.id) : [];
      const unlockedOrderableCount = unlockedOrderableList.length;
      const minOrderableReq = eng?.MIN_ORDERABLE_TO_START || 4;
      const canStartStoreNow = isTycoonMode && isOrderableInTycoon && unlockedOrderableCount >= minOrderableReq;

      let modeNoticeHtml = '';
      let secondaryActionBtnHtml = '';

      if (isTycoonMode) {
        if (isOrderableInTycoon) {
          if (canStartStoreNow) {
            modeNoticeHtml = `
              <div style="width:100%; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.45); border-radius:10px; padding:8px 10px; font-size:0.74rem; color:#6ee7b7; font-weight:700;">
                🏪 판매 음료 ${unlockedOrderableCount}종 준비 완료! 이제 <b>[점포]</b>에서 <b>${this.brandResolver.resolveName(rec)}</b> 등을 판매하여 자금을 모을 수 있습니다!
              </div>
            `;
          } else {
            const remainDrinkCount = Math.max(1, minOrderableReq - unlockedOrderableCount);
            modeNoticeHtml = `
              <div style="width:100%; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.4); border-radius:10px; padding:8px 10px; font-size:0.74rem; color:#7dd3fc; font-weight:700;">
                🥤 판매 음료 해금 (<b>${unlockedOrderableCount} / ${minOrderableReq}종</b>) — 점포 영업을 시작하려면 음료·주류를 <b>${remainDrinkCount}종</b> 더 연구하세요!
              </div>
            `;
          }
        }
        if (canStartStoreNow) {
          secondaryActionBtnHtml = `<button class="clear-pot-btn" id="result-go-tycoon-btn" style="flex:1; background:linear-gradient(135deg,#059669,#10b981); color:#fff; border-color:#34d399; font-weight:800;">🏪 점포 가기</button>`;
        }
      } else {
        // 퀴즈 모드: 경영 안내는 일절 배제하고 다음 퀴즈 목표 제시
        const nextQuizRec = this.inventory.getNextQuizRecipe();
        if (nextQuizRec) {
          const nextName = this.brandResolver.resolveName(nextQuizRec);
          modeNoticeHtml = `
            <div style="width:100%; background:rgba(99,102,241,0.14); border:1px solid rgba(99,102,241,0.45); border-radius:10px; padding:8px 10px; font-size:0.75rem; color:#c7d2fe; font-weight:700;">
              🎯 다음 퀴즈 목표: <b>[No.${nextQuizRec.recipe_number} ${nextName}]</b> 도전 가능!
            </div>
          `;
          secondaryActionBtnHtml = `<button class="mix-btn" id="result-go-next-quiz-btn" style="width:100%; background:linear-gradient(135deg,#4f46e5,#6366f1); color:#fff; border-color:#818cf8; font-weight:800;">🎯 다음 퀴즈 풀기</button>`;
        } else {
          modeNoticeHtml = `
            <div style="width:100%; background:rgba(16,185,129,0.14); border:1px solid rgba(16,185,129,0.45); border-radius:10px; padding:8px 10px; font-size:0.75rem; color:#a7f3d0; font-weight:700;">
              🎉 축하합니다! 모든 K-술 조합 퀴즈를 전부 정복하셨습니다!
            </div>
          `;
          secondaryActionBtnHtml = `<button class="mix-btn" id="result-close-btn" style="width:100%;">닫기</button>`;
        }
      }

      const isQuizMode = (this.currentMode === 'QUIZ');
      const actionButtonsHtml = isQuizMode
        ? secondaryActionBtnHtml
        : `
          <div style="display:flex; gap:8px; width:100%; margin-top:4px;">
            <button class="mix-btn" id="result-close-btn" style="flex:1;">🔬 계속 연구하기</button>
            ${secondaryActionBtnHtml}
          </div>
        `;

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
          ${modeNoticeHtml}
          ${actionButtonsHtml}
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
    const goTycoonBtn = content.querySelector('#result-go-tycoon-btn');
    if (goTycoonBtn) {
      goTycoonBtn.onclick = () => {
        modal.classList.remove('active');
        this.audio.playTap();
        this.switchTab('tycoon');
        this._showNextPendingTabIntro();
      };
    }
    const goNextQuizBtn = content.querySelector('#result-go-next-quiz-btn');
    if (goNextQuizBtn) {
      goNextQuizBtn.onclick = () => {
        modal.classList.remove('active');
        this.audio.playTap();
        const nextQuiz = this.inventory.getNextQuizRecipe();
        if (nextQuiz) {
          this.quizTargetRecipeId = nextQuiz.recipe_id;
          this.switchTab('brew');
          this._renderBrewStepQuizBar();
        }
        this._showNextPendingTabIntro();
      };
    }
  }

  showToast(message) {
    if (message === undefined || message === null) return;
    const strMsg = String(message).trim();
    if (!strMsg || strMsg === 'undefined' || strMsg === '📦 undefined' || strMsg === '⚠️ undefined' || strMsg === '🛎️ undefined') return;

    let toast = document.getElementById('ksool-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ksool-toast';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-12px);
        background: rgba(15, 23, 42, 0.94);
        color: #f8fafc;
        border: 1px solid rgba(56, 189, 248, 0.4);
        border-left: 4px solid #38bdf8;
        padding: 10px 18px;
        border-radius: 10px;
        font-size: 0.86rem;
        font-weight: 700;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.75), 0 0 16px rgba(56, 189, 248, 0.2);
        z-index: 99999;
        pointer-events: none;
        transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 0;
        text-align: center;
        max-width: min(90vw, 420px);
        word-break: keep-all;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-12px)';
    }, 2400);
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
      // 버튼, 재료 카드, 슬롯 등 인터랙티브 요소는 탭 간격과 무관하게 항상 클릭 허용 (빠른 재료 연타 씹힘 원천 방지)
      const isInteractive = e.target && Boolean(
        e.target.closest('button, [role="button"], .ing-card, [data-base-ing-id], [data-pot-slot-idx], .tab-btn, .toolbar-toggle, .arcade-action-btn, .modal-card, a, input, textarea, select, label')
      );
      if (!isInteractive && now - lastGlobalTouchEnd <= 320) {
        if (e.cancelable) e.preventDefault();
      }
      lastGlobalTouchEnd = now;
    }, { passive: false });

    // [비밀 설정 변경창 / 관리자 툴바 제어]
    // ?admin URL 파라미터나 상단(로고/헤더/상단 탭) 5회 연속 탭 시 토글
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminParam = urlParams.has('admin') || urlParams.has('dev') || urlParams.has('debug');
    const isStoredAdmin = localStorage.getItem('ksool_admin_mode') === 'true';
    if (hasAdminParam || isStoredAdmin) {
      document.body.classList.add('admin-mode');
      if (this.config) this.config.isAdminMode = true;
    }

    let secretTapCount = 0;
    let secretTapTimer = null;
    let lastSecretTapTime = 0;

    const toggleSecretSettingsToolbar = () => {
      const isNowAdmin = document.body.classList.toggle('admin-mode');
      localStorage.setItem('ksool_admin_mode', isNowAdmin ? 'true' : 'false');
      if (this.config) {
        this.config.isAdminMode = isNowAdmin;
      }
      if (this.audio) {
        this.audio.playSuccess();
      }
      this.renderHeader();
      this.suggestionBoardView?.render?.();
      this.showToast(isNowAdmin ? '🛠️ 비밀 설정 변경창이 활성화되었습니다!' : '🔒 비밀 설정 변경창이 비활성화되었습니다.');
    };

    const handleSecretTap = (e) => {
      // ⚙️ 일반 설정 버튼은 제외
      if (e && e.target && e.target.closest('#open-settings-btn')) return;

      const now = performance.now();
      // 터치/마우스 중복 이벤트 방지 (80ms 디바운스)
      if (now - lastSecretTapTime < 80) return;
      lastSecretTapTime = now;

      secretTapCount++;
      clearTimeout(secretTapTimer);
      // 5회 탭 시 3초 동안 타이머 유지
      secretTapTimer = setTimeout(() => {
        secretTapCount = 0;
      }, 3000);

      this.audio?.playTap?.();

      if (secretTapCount >= 5) {
        secretTapCount = 0;
        clearTimeout(secretTapTimer);
        toggleSecretSettingsToolbar();
      }
    };

    // 1) 상단 로고 및 헤더 영역 5회 탭 (pointerdown으로 터치/클릭 즉시 감지)
    const headerTargets = [
      document.querySelector('.brand'),
      document.querySelector('.header-top'),
      document.querySelector('.brand-title-row'),
      document.querySelector('.k-emblem')
    ].filter(Boolean);

    headerTargets.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('pointerdown', handleSecretTap);
    });

    // 2) 혹시 탭 버튼('주조' 등 상단 탭)을 연속 5번 눌렀을 때도 비밀 설정창 토글 지원
    let tabTapCount = 0;
    let tabTapTimer = null;
    let lastTabTarget = null;
    let lastTabTimestamp = 0;

    // 탭 전환
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-tab-target');
        const now = performance.now();
        if (now - lastTabTimestamp > 80) {
          lastTabTimestamp = now;
          if (lastTabTarget === target) {
            tabTapCount++;
            clearTimeout(tabTapTimer);
            tabTapTimer = setTimeout(() => { tabTapCount = 0; }, 3000);
            if (tabTapCount >= 5) {
              tabTapCount = 0;
              clearTimeout(tabTapTimer);
              toggleSecretSettingsToolbar();
            }
          } else {
            lastTabTarget = target;
            tabTapCount = 1;
            clearTimeout(tabTapTimer);
            tabTapTimer = setTimeout(() => { tabTapCount = 0; }, 3000);
          }
        }

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

        // [이미 해금했던 레시피를 다시 조합하려 한 경우 안내]
        if (matched && this.inventory.isRecipeUnlocked(matched.recipe_id)) {
          this.audio.playTap();
          if (this._mixBtnAlertTimer) {
            clearTimeout(this._mixBtnAlertTimer);
          }
          const recName = this.brandResolver.resolveName(matched);
          mixBtn.textContent = `✅ [${recName}] 이미 해금된 레시피입니다.`;
          mixBtn.classList.add('already-crafted-alert');

          this._mixBtnAlertTimer = setTimeout(() => {
            mixBtn.textContent = '🔬 조합하기';
            mixBtn.classList.remove('already-crafted-alert');
            this._mixBtnAlertTimer = null;
          }, 3000);
          return;
        }

        this._clearMixBtnAlert();
        const res = this.alchemyEngine.executeCraft(preferredId);
        if (!res.ok) {
          this.showToast(res.message);
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

    // 상단 🏠 모드 선택 버튼 -> 전체 화면 SPA 모드 선택 뷰로 전환
    const modeSelectPortalBtn = document.getElementById('mode-select-portal-btn');
    if (modeSelectPortalBtn) {
      modeSelectPortalBtn.onclick = () => {
        this.audio?.playTap?.();
        this.switchTab('portal');
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
        if (confirm('모든 해금 기록과 점포 자금을 초기 상태로 리셋할까요?')) {
          this.resetAllGameProgress();
        }
      };
    }
  }

  resetAllGameProgress() {
    this.storage.clearState();
    try {
      localStorage.removeItem('ksool_tycoon_persist_v2');
    } catch (_) {}
    this.craftingPot.clear();
    this.inventory.isLoadCorrupted = false;
    this.inventory.saveBlockedDueToCorruption = false;
    this.inventory.unlockAllSandboxMode = false;
    this.inventory.userLevel = 1;
    this.inventory.craftFailCount = 0;
    this.inventory.shownTabIntros = { collection: true, fridge: true, suggestions: false, tycoon: true, detailPicker: false };
    this.pendingTabIntroQueue = [];
    this.inventory.unlockedImageRecipeIds.clear();
    this.inventory.unlockedDescRecipeIds?.clear();
    this.inventory.purchasedIngredientIds.clear();
    this.inventory.hintProgressByRecipe = {};
    this.inventory.promotedCustomRecipes = [];
    this.inventory.init();
    this.inventory.save();

    if (this.tycoonView && this.tycoonView.engine) {
      const eng = this.tycoonView.engine;
      eng.persistentWallet = 0;
      eng.unlockedMapStageIds = new Set(['stage_1']);
      eng.selectedMapStageId = 'stage_1';
      eng.knownRegularIds.clear();
      eng.resetSession('GROWTH');
      eng.savePersistentData();
    }

    const nextQuiz = this.inventory.getNextQuizRecipe();
    this.quizTargetRecipeId = nextQuiz ? nextQuiz.recipe_id : 11;
    this.quizHintRevealed = false;
    this.brewMode = 'QUIZ';
    this.fridgeEngine.clearAll();
    this.selectedIngCategory = 'NATURE';
    this.currentTab = 'tycoon';
    this.audio.playTap();
    this.renderAll();

    if (this.storyTutorialModalView) {
      this.storyTutorialModalView.openIntroFlow(() => {
        this.switchTab('brew');
        this.showToast('🔬 연구실에서 기본 재료로 첫 판매 음료(No.01 얼음)를 조합해보세요!');
      });
    }
  }

  /**
   * iOS WKWebView / Android WebView / 앱인토스(Toss WebView) 및 모바일 브라우저 전역에서
   * 더블탭·더블클릭 확대, 핀치 줌, 롱프레스 메뉴, 텍스트 선택·복사·오려두기·드래그를 원천 차단합니다.
   */
  _installGlobalWebViewGuards() {
    if (this._webViewGuardsInstalled) return;
    this._webViewGuardsInstalled = true;

    // 1. 더블클릭 / 더블탭 확대 방지
    document.addEventListener('dblclick', (e) => {
      e.preventDefault();
    }, { passive: false });

    // 2. iOS WKWebView / Safari 핀치·제스처 확대 방지
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((evtName) => {
      document.addEventListener(evtName, (e) => {
        e.preventDefault();
      }, { passive: false });
    });

    // 3. 멀티터치(2손가락 이상) 핀치 줌 방지
    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // 4. PC/트랙패드 Ctrl + 휠 확대 방지
    document.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });

    // 5. 롱프레스 컨텍스트 메뉴(우클릭/길게 누르기 팝업), 복사(copy), 오려두기(cut), 선택(selectstart), 이미지 드래그(dragstart) 전면 차단
    ['contextmenu', 'copy', 'cut', 'selectstart', 'dragstart'].forEach((evtName) => {
      document.addEventListener(evtName, (e) => {
        e.preventDefault();
      }, { passive: false });
    });
  }
}

function bootKSoolApp() {
  if (window._ksoolAppBooted) return;
  window._ksoolAppBooted = true;
  const app = new KSoolApp();
  app._installGlobalWebViewGuards();
  window.KSoolApp = KSoolApp;
  if (window.KSool) window.KSool.KSoolApp = KSoolApp;
  window.ksoolApp = app;
  window.kSoolApp = app;
  window.app = app;
  app.init();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootKSoolApp);
  } else {
    // DOM이 이미 로드 완료(interactive/complete)된 경우 이벤트 대기 없이 즉시 부팅
    bootKSoolApp();
  }
}
