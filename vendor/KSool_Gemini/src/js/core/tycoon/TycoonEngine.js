window.KSool = window.KSool || {};

/**
 * 🏮 주막 타이쿤 (Tycoon Main Game) - 6단계 점포 성장(GROWTH) & 최종 무한모드(INFINITE) 핵심 엔진
 *
 * [핵심 게임 루프]
 * 1. [🔬 연구실]에서 보유 재료로 새 음료/주류 레시피(No.01 ~ No.84)를 연구·해금합니다.
 * 2. [🏪 점포]에서 영업(GROWTH)을 시작하면 내가 연구실에서 해금한 음료만 손님이 주문합니다.
 * 3. 하단 조리대에서 레시피를 기억해 조합하면 중앙 접시 위에 올라가고, 오른쪽 종(🛎️)을 터치해 서빙하며 돈을 법니다.
 * 4. 번 돈으로 [🛒 재료 상점]에서 해당 점포의 신규 재료를 하나씩 구매하고, 그 재료로 나머지 조합법을 모두 해금합니다.
 * 5. [현재 점포 재료 전체 구매 + 현재 점포 조합법 100% 해금 + 개업 자금 지불] 3가지 조건을 달성하면 다음 점포로 이전합니다!
 * 6. 6단계 [사이버펑크 미래도시 바]까지 모든 음료를 해금하면, 목숨 3개(❤️×3)로 최고 기록을 겨루는 [♾️ 무한모드]가 오픈됩니다!
 */
class TycoonEngine {
  constructor({ config, recipeBook, inventory, brandResolver, audio }) {
    this.config = config;
    this.recipeBook = recipeBook;
    this.inventory = inventory;
    this.brandResolver = brandResolver;
    this.audio = audio;

    this.customerPool = new window.KSool.TycoonCustomerPool(recipeBook, brandResolver);
    this.leaderboard = new window.KSool.TycoonLeaderboardService();

    this.PERSIST_KEY = 'ksool_tycoon_persistent_v1';
    this.MIN_ORDERABLE_TO_START = 3; // 영업 시작을 위해 필요한 최소 해금 판매 음료 수 (탄산수·사이다·레모네이드 3종)
    this.GROWTH_QUOTA_COUNT = 5; // 일반 성장 영업(GROWTH) 1회당 목표 판매 잔수 (5잔 완판 시 일일 정산)

    this.MAP_STAGES = [
      {
        id: 'stage_1',
        stageNum: 1,
        icon: '🍋',
        name: '길거리 노점',
        subtitle: '햇살 가득한 골목길 무알콜 음료 & 에이드 노점',
        bgImage: './assets/tycoon/bg_stage_1.jpg?v=2',
        bellLeftPct: 66.8,
        bellBottomPct: 16.4,
        plateLeftPct: 50.8,
        plateBottomPct: 16.0,
        plateWidthPct: 20.8,
        plateHeightPct: 14.3,
        barTopBottomPct: 26.2,
        unlockCost: 0,
        priceMultiplier: 1.0,
        maxRecipeStep: 1,
        extraRecipeIds: [],
        menuSummary: '탄산수·사이다·레몬에이드·밀키스·과일우유 등 무알콜 전용 (No.01~No.18)'
      },
      {
        id: 'stage_2',
        stageNum: 2,
        icon: '⛺',
        name: '이모네 포장마차',
        subtitle: '정겨운 밤거리 주황 천막 포차 (기초 주류 입문)',
        bgImage: './assets/tycoon/bg_stage_2.jpg?v=2',
        bellLeftPct: 72.9,
        bellBottomPct: 9.5,
        plateLeftPct: 50.1,
        plateBottomPct: 10.5,
        plateWidthPct: 23.6,
        plateHeightPct: 12.7,
        barTopBottomPct: 18.6,
        unlockCost: 300,
        priceMultiplier: 1.20,
        maxRecipeStep: 2,
        extraRecipeIds: [],
        menuSummary: '소주·맥주·소맥·매화수·레몬소주·아메리카노 등 포차 메뉴 (No.19~No.37)'
      },
      {
        id: 'stage_3',
        stageNum: 3,
        icon: '🏮',
        name: '동네 목조 주막',
        subtitle: '따뜻한 조명과 나무 향기가 가득한 전통 주막',
        bgImage: './assets/tycoon/bg_stage_3.jpg?v=2',
        bellLeftPct: 72.9,
        bellBottomPct: 9.5,
        plateLeftPct: 50.1,
        plateBottomPct: 10.5,
        plateWidthPct: 23.6,
        plateHeightPct: 12.7,
        barTopBottomPct: 18.6,
        unlockCost: 800,
        priceMultiplier: 1.40,
        maxRecipeStep: 3,
        extraRecipeIds: [],
        menuSummary: '전통 막걸리·식혜·과일막걸리·복분자주·홍초·태극주 (No.38~No.55)'
      },
      {
        id: 'stage_4',
        stageNum: 4,
        icon: '🍺',
        name: '크래프트 비어 펍',
        subtitle: '네온사인과 브루어리 탱크가 빛나는 수제맥주 펍',
        bgImage: './assets/tycoon/bg_stage_4.jpg?v=2',
        bellLeftPct: 72.9,
        bellBottomPct: 9.5,
        plateLeftPct: 50.1,
        plateBottomPct: 10.5,
        plateWidthPct: 23.6,
        plateHeightPct: 12.7,
        barTopBottomPct: 18.6,
        unlockCost: 1800,
        priceMultiplier: 1.65,
        maxRecipeStep: 4,
        extraRecipeIds: [],
        menuSummary: '[2:1 비율 해금] 홍차주·막사·복소사·고진감래주·에너지주 (No.56~No.67)'
      },
      {
        id: 'stage_5',
        stageNum: 5,
        icon: '🥂',
        name: '스카이라인 라운지 바',
        subtitle: '도심 야경이 내려다보이는 럭셔리 호텔 라운지',
        bgImage: './assets/tycoon/bg_stage_5.jpg?v=2',
        bellLeftPct: 68.2,
        bellBottomPct: 10.5,
        plateLeftPct: 50.5,
        plateBottomPct: 13.6,
        plateWidthPct: 19.6,
        plateHeightPct: 10.5,
        barTopBottomPct: 22.3,
        unlockCost: 3500,
        priceMultiplier: 1.95,
        maxRecipeStep: 5,
        extraRecipeIds: [],
        menuSummary: '[고급 황금비율] 소토닉·기범주·황금소맥(3:7)·꿀주·프리미엄 막걸리 (No.68~No.77)'
      },
      {
        id: 'stage_6',
        stageNum: 6,
        icon: '🚀',
        name: '사이버펑크 미래도시 바',
        subtitle: '홀로그램 메뉴와 비행선이 오가는 미래도시 주막',
        bgImage: './assets/tycoon/bg_stage_6.jpg?v=2',
        bellLeftPct: 68.2,
        bellBottomPct: 10.5,
        plateLeftPct: 49.8,
        plateBottomPct: 11.8,
        plateWidthPct: 20.7,
        plateHeightPct: 8.4,
        barTopBottomPct: 19.3,
        unlockCost: 6500,
        priceMultiplier: 2.35,
        maxRecipeStep: 6,
        extraRecipeIds: [],
        menuSummary: '[특산·브랜드 마스터] 테슬라·테진아·카스처럼·특산 명주 완결 (No.78~No.84)'
      }
    ];

    this.persistentWallet = 0;
    this.unlockedMapStageIds = new Set(['stage_1']);
    this.selectedMapStageId = 'stage_1';
    this.persistentBestTimeAttack = { servedCount: 0, totalEarnings: 0, maxCombo: 0 };
    this.persistentBestInfinite = { servedCount: 0, totalEarnings: 0, maxCombo: 0, maxWave: 1 };
    this.knownRegularIds = new Set();

    this._loadPersistentData();
    this._syncInventoryStepWithStages();

    this.resetSession('GROWTH');
  }

  _syncInventoryStepWithStages() {
    if (!this.inventory) return;
    let maxStageNum = 1;
    for (const st of this.MAP_STAGES) {
      if (this.unlockedMapStageIds.has(st.id) && st.stageNum > maxStageNum) {
        maxStageNum = st.stageNum;
      }
    }
    if (this.inventory.unlockedStepId > maxStageNum) {
      for (const st of this.MAP_STAGES) {
        if (st.stageNum <= this.inventory.unlockedStepId) {
          this.unlockedMapStageIds.add(st.id);
        }
      }
    } else if (maxStageNum > this.inventory.unlockedStepId) {
      this.inventory.setUnlockedStepId(maxStageNum);
    }
  }

  _loadPersistentData() {
    try {
      const raw = localStorage.getItem(this.PERSIST_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.persistentWallet === 'number') this.persistentWallet = parsed.persistentWallet;
      if (parsed.persistentBestTimeAttack) this.persistentBestTimeAttack = parsed.persistentBestTimeAttack;
      if (parsed.persistentBestInfinite) this.persistentBestInfinite = parsed.persistentBestInfinite;
      if (Array.isArray(parsed.knownRegularIds)) {
        parsed.knownRegularIds.forEach(id => this.knownRegularIds.add(id));
      }
      if (Array.isArray(parsed.unlockedMapStageIds)) {
        parsed.unlockedMapStageIds.forEach(id => this.unlockedMapStageIds.add(id));
      }
      this.unlockedMapStageIds.add('stage_1');
      if (parsed.selectedMapStageId && this.unlockedMapStageIds.has(parsed.selectedMapStageId)) {
        this.selectedMapStageId = parsed.selectedMapStageId;
      }
    } catch (_) {}
  }

  savePersistentData() {
    try {
      localStorage.setItem(this.PERSIST_KEY, JSON.stringify({
        persistentWallet: this.persistentWallet,
        unlockedMapStageIds: Array.from(this.unlockedMapStageIds),
        selectedMapStageId: this.selectedMapStageId,
        persistentBestTimeAttack: this.persistentBestTimeAttack,
        persistentBestInfinite: this.persistentBestInfinite,
        knownRegularIds: Array.from(this.knownRegularIds)
      }));
    } catch (_) {}
  }

  // =========================================================================
  // 6단계 점포 배경(맵) 조회 · 해금 조건 검증 · 선택
  // =========================================================================

  getCurrentMapStage() {
    return this.MAP_STAGES.find(m => m.id === this.selectedMapStageId) || this.MAP_STAGES[0];
  }

  /**
   * 손님이 주문 가능한 품목인지 판별합니다.
   * - 기준: [주류(ALCOHOL)], [음료(DRINK)], [최종조합(!unlocks_ingredient_id)] 3가지에 해당하는 레시피만 주문 가능
   * - 얼음(NATURE), 청/농축액/누룩/식초(ETC), 원두/미숫가루(GRAIN), 아이스크림/초콜릿/단팥죽(DESSERT) 등
   *   중간 부재료는 조합은 가능하되 손님이 직접 주문하지 않습니다.
   */
  isOrderableRecipe(rec) {
    if (!rec) return false;
    if (!rec.unlocks_ingredient_id) return true;
    const unlockedIng = this.recipeBook?.getBaseIngredient?.(rec.unlocks_ingredient_id);
    if (!unlockedIng) return false;
    return unlockedIng.category_id === 'ALCOHOL' || unlockedIng.category_id === 'DRINK';
  }

  /**
   * 특정 점포(stageId)의 최대 단계까지 존재하는 전체 주문 가능 메뉴 목록
   */
  getStageAllowedRecipes(stageId = this.selectedMapStageId) {
    const stage = this.MAP_STAGES.find(m => m.id === stageId) || this.MAP_STAGES[0];
    const allRecipes = this.recipeBook ? this.recipeBook.getAllRecipes() : [];
    const extraSet = new Set(stage.extraRecipeIds || []);
    return allRecipes.filter(r => {
      if (!this.isOrderableRecipe(r)) return false;
      const step = Number(r.step_id) || 1;
      return step <= stage.maxRecipeStep || extraSet.has(Number(r.recipe_id));
    });
  }

  /**
   * 특정 점포(stageId)에서 플레이어가 [🔬 연구실]을 통해 '이미 해금 완료한' 판매 가능 메뉴 목록!
   * 손님은 오직 이 목록에 있는 메뉴만 주문합니다.
   */
  getStageOrderableUnlockedRecipes(stageId = this.selectedMapStageId) {
    const allowed = this.getStageAllowedRecipes(stageId);
    if (!this.inventory || this.inventory.unlockAllSandboxMode) return allowed;
    return allowed.filter(r => this.inventory.isRecipeUnlocked(r.recipe_id));
  }

  getMapStagesWithStatus() {
    this._syncInventoryStepWithStages();
    return this.MAP_STAGES.map(stage => {
      const unlocked = Boolean(this.inventory?.unlockAllSandboxMode || this.unlockedMapStageIds.has(stage.id));
      const selected = this.selectedMapStageId === stage.id;
      const allowedRecipes = this.getStageAllowedRecipes(stage.id);
      const unlockedOrderable = this.getStageOrderableUnlockedRecipes(stage.id);
      const completion = this.inventory ? this.inventory.getStageCompletionStatus(stage.stageNum) : null;
      const prevStageCompletion = (stage.stageNum > 1 && this.inventory)
        ? this.inventory.getStageCompletionStatus(stage.stageNum - 1)
        : null;
      const prevStageUnlocked = stage.stageNum === 1 || this.unlockedMapStageIds.has(`stage_${stage.stageNum - 1}`);

      return {
        ...stage,
        stepId: stage.stageNum,
        formattedRange: completion?.formattedRange || '',
        unlocked,
        selected,
        allowedRecipeCount: allowedRecipes.length,
        unlockedOrderableCount: unlockedOrderable.length,
        orderableUnlockedCount: unlockedOrderable.length,
        completion,
        prevStageCompletion,
        prevStageUnlocked
      };
    });
  }

  /**
   * 다음 점포 해금:
   * 1) 이전 점포가 해금되어 있어야 함
   * 2) 이전 점포의 모든 상점 재료(🛒)를 구매 완료해야 함
   * 3) 이전 점포의 모든 레시피(🔬)를 연구 해금 완료해야 함
   * 4) 개업 비용(💰 unlockCost)을 보유하고 있어야 함
   */
  unlockMapStage(stageId) {
    const stage = this.MAP_STAGES.find(m => m.id === stageId);
    if (!stage) return { ok: false, message: '존재하지 않는 점포입니다.' };
    if (this.unlockedMapStageIds.has(stageId)) {
      this.selectedMapStageId = stageId;
      this.savePersistentData();
      return { ok: true, alreadyUnlocked: true, stage };
    }

    if (stage.stageNum > 1) {
      const prevStageId = `stage_${stage.stageNum - 1}`;
      const prevStage = this.MAP_STAGES.find(m => m.id === prevStageId);
      if (!this.unlockedMapStageIds.has(prevStageId)) {
        this.audio?.playFail?.();
        return {
          ok: false,
          message: `이전 점포 [${prevStage ? prevStage.name : '이전 단계'}]를 먼저 해금해야 합니다!`
        };
      }

      if (this.inventory && !this.inventory.unlockAllSandboxMode) {
        const prevComp = this.inventory.getStageCompletionStatus(stage.stageNum - 1);
        if (!prevComp.allIngredientsPurchased) {
          this.audio?.playFail?.();
          return {
            ok: false,
            needsIngredients: true,
            message: `[${prevComp.title}]의 상점 재료를 모두 구매해야 다음 점포를 열 수 있습니다! (${prevComp.shopPurchasedCount}/${prevComp.shopTotalCount}종 구매 완료)`
          };
        }
        if (!prevComp.allRecipesUnlocked) {
          this.audio?.playFail?.();
          return {
            ok: false,
            needsRecipes: true,
            message: `[${prevComp.title}]의 모든 조합법을 [🔬연구실]에서 해금해야 다음 점포를 열 수 있습니다! (${prevComp.recipeUnlockedCount}/${prevComp.recipeTotalCount}종 해금 완료)`
          };
        }
      }
    }

    if (this.persistentWallet < stage.unlockCost) {
      this.audio?.playFail?.();
      return {
        ok: false,
        message: `개업 자금이 부족합니다! (필요: ${stage.unlockCost.toLocaleString()}원 / 보유: ${this.persistentWallet.toLocaleString()}원)`
      };
    }

    this.persistentWallet -= stage.unlockCost;
    this.unlockedMapStageIds.add(stageId);
    this.selectedMapStageId = stageId;
    if (this.inventory) {
      this.inventory.setUnlockedStepId(stage.stageNum);
    }
    this.savePersistentData();
    this.audio?.playSuccess?.();

    return {
      ok: true,
      stage,
      remainingWallet: this.persistentWallet
    };
  }

  selectMapStage(stageId) {
    const stage = this.MAP_STAGES.find(m => m.id === stageId);
    if (!stage) return { ok: false, message: '존재하지 않는 점포입니다.' };
    if (!this.unlockedMapStageIds.has(stageId) && !this.inventory?.unlockAllSandboxMode) {
      return { ok: false, message: '아직 해금되지 않은 점포입니다.' };
    }
    this.selectedMapStageId = stageId;
    this.savePersistentData();
    return { ok: true, stage };
  }

  buildStockKey(recipeId) {
    const rId = Number(recipeId);
    return `rec_${rId}`;
  }

  parseStockKey(stockKey) {
    if (!stockKey || !stockKey.startsWith('rec_')) return null;
    const parts = stockKey.split('_omit_');
    const recipeId = Number(parts[0].replace('rec_', ''));
    return {
      stockKey: `rec_${recipeId}`,
      recipeId
    };
  }

  calculateOrderPrice(recipeId, orderType = 'NORMAL', combo = 0, wave = 1) {
    const rec = this.recipeBook.getRecipe(recipeId);
    const items = this.recipeBook.getRecipeItems(recipeId);
    if (!rec || !items) return 15;

    const sumRatio = items.reduce((acc, it) => acc + (Number(it.ratio) || 1), 0);
    const slotCount = items.length;

    let craftedSubIngCount = 0;
    for (const it of items) {
      if (!this.recipeBook.isLeafIngredient(it.ingredient_id)) {
        craftedSubIngCount += 1;
      }
    }

    const baseMaterialValue = (sumRatio * 7) + (slotCount * 5) + (craftedSubIngCount * 9);

    let diffMultiplier = 1.0;
    if (rec.difficulty === 'NORMAL') diffMultiplier = 1.38;
    else if (rec.difficulty === 'MASTER') diffMultiplier = 1.85;
    else if (slotCount >= 3) diffMultiplier = 1.22;

    let orderTypeMultiplier = 1.0;
    let specialFlatBonus = 0;
    if (orderType === 'MEMORY') {
      orderTypeMultiplier = 1.55;
      specialFlatBonus = 23;
    }

    const stage = this.getCurrentMapStage();
    const stageMultiplier = stage ? (stage.priceMultiplier || 1.0) : 1.0;

    // 기본 음료/주류 가격은 웨이브·콤보 뻥튀기 없이 점포 배율만 적용 (콤보 보너스는 서빙 시 +콤보수 만큼 별도 합산)
    const rawPrice = ((baseMaterialValue * diffMultiplier * orderTypeMultiplier) + specialFlatBonus) * stageMultiplier;
    return Math.max(12, Math.round(rawPrice));
  }

  /**
   * 새로운 타이쿤 게임 세션 초기화
   * @param {'GROWTH' | 'INFINITE'} mode
   */
  resetSession(mode = 'GROWTH') {
    this.session = {
      mode, // 'GROWTH' (일반 점포 성장 영업 - 목표 판매 갯수 완판제) | 'INFINITE' (전 메뉴 마스터 후 열리는 목숨 3개 서바이벌)
      status: 'LOBBY', // 'LOBBY' | 'PLAYING' | 'GAMEOVER'
      mapStageId: this.selectedMapStageId,
      lives: 3,
      maxLives: 3,
      timeLeftSec: 0,
      elapsedSec: 0,
      servedCount: 0,
      targetServeCount: mode === 'GROWTH' ? (this.GROWTH_QUOTA_COUNT || 5) : 0,
      isQuotaCleared: false,
      totalEarnings: 0,
      combo: 0,
      maxCombo: 0,
      wave: 1,
      activeCustomer: null,
      activeOrder: null,
      platedStockKey: null,
      potSlots: [],
      sessionCustomerVisits: new Map(),
      customerSessionRecipeMap: new Map(),
      lastLogMessage: '🏮 카운터 영업 준비가 완료되었습니다! 조합해서 접시에 올리고 종을 울려 서빙하세요!'
    };
    return this.session;
  }

  startGame(mode = 'GROWTH') {
    if (mode === 'INFINITE' && this.inventory && !this.inventory.isInfiniteModeUnlocked()) {
      return {
        ok: false,
        lockedInfinite: true,
        message: '모든 점포(6단계)와 전체 음료·주류 도감(No.01~No.84)을 모두 해금하면 [♾️ 무한모드]가 열립니다!'
      };
    }

    const stage = this.getCurrentMapStage();
    const unlockedOrderable = this.getStageOrderableUnlockedRecipes(stage.id);
    const minReq = this.MIN_ORDERABLE_TO_START || 3;
    if (unlockedOrderable.length < minReq) {
      return {
        ok: false,
        needsResearch: true,
        unlockedCount: unlockedOrderable.length,
        minRequired: minReq,
        message: `점포 영업을 시작하려면 최소 ${minReq}종의 판매 음료를 [🔬 연구실]에서 해금해야 합니다! (현재 ${unlockedOrderable.length}/${minReq}종 해금 — 탄산수·사이다·레모네이드 3종을 먼저 연구해보세요!)`
      };
    }

    this.resetSession(mode);
    this.session.status = 'PLAYING';
    this.session.mapStageId = this.selectedMapStageId;
    this.session.lastLogMessage = `${stage.icon} [${stage.name}] 영업 시작! 오늘의 목표(${this.session.targetServeCount || '무제한'}잔)를 조합해 서빙하세요!`;

    this._spawnCounterCustomer();
    return { ok: true, mode, stage };
  }

  getDifficultyProfile() {
    const sc = this.session ? this.session.servedCount : 0;
    const wave = Math.floor(sc / 3) + 1;
    if (this.session) {
      this.session.wave = Math.max(this.session.wave, wave);
    }

    const stage = this.getCurrentMapStage();
    const stageCeiling = stage ? stage.maxRecipeStep : 1;

    // 단골주문(MEMORY)은 오직 무한모드('INFINITE')에서만 발생하도록 제한
    const isInfiniteMode = Boolean(this.session && this.session.mode === 'INFINITE');
    if (!isInfiniteMode) {
      return {
        wave,
        maxRecipeStep: stageCeiling,
        probMemory: 0.0
      };
    }

    if (wave === 1) {
      return {
        wave: 1,
        maxRecipeStep: stageCeiling,
        probMemory: 0.0
      };
    } else if (wave === 2) {
      return {
        wave: 2,
        maxRecipeStep: stageCeiling,
        probMemory: 0.20
      };
    } else if (wave === 3) {
      return {
        wave: 3,
        maxRecipeStep: stageCeiling,
        probMemory: 0.30
      };
    } else {
      const extra = Math.min(0.20, (wave - 4) * 0.05);
      return {
        wave,
        maxRecipeStep: stageCeiling,
        probMemory: Math.min(0.55, 0.35 + extra)
      };
    }
  }

  /**
   * 카운터에 찾아올 손님 1명과 주문(x1) 생성
   * - 손님은 오직 플레이어가 [🔬 연구실]에서 이미 해금한 판매 가능 음료/주류만 주문합니다!
   */
  _spawnCounterCustomer() {
    if (!this.session) return null;

    const profile = this.getDifficultyProfile();
    const stage = this.getCurrentMapStage();
    const unlockedOrderable = this.getStageOrderableUnlockedRecipes(stage.id);
    const recipePool = unlockedOrderable.length > 0
      ? unlockedOrderable
      : this.getStageAllowedRecipes(stage.id);
    const stageAllowedIds = new Set(recipePool.map(r => Number(r.recipe_id)));

    const allCustomers = this.customerPool.getAllCustomers();
    const prevCustId = this.session.activeCustomer?.id || null;
    const candidates = allCustomers.filter(c => c.id !== prevCustId);
    const availableCustomers = candidates.length > 0 ? candidates : allCustomers;

    const visitedCandidates = availableCustomers.filter(
      c => (this.session.sessionCustomerVisits.get(c.id) || 0) >= 1 &&
           this.session.customerSessionRecipeMap.has(c.id) &&
           stageAllowedIds.has(Number(this.session.customerSessionRecipeMap.get(c.id)))
    );

    let chosenCustomer = null;
    let chosenRecipeId = null;
    let orderType = 'NORMAL';

    const isInfiniteMode = Boolean(this.session && this.session.mode === 'INFINITE');
    const roll = Math.random();
    if (isInfiniteMode && visitedCandidates.length > 0 && roll < profile.probMemory) {
      chosenCustomer = visitedCandidates[Math.floor(Math.random() * visitedCandidates.length)];
      chosenRecipeId = this.session.customerSessionRecipeMap.get(chosenCustomer.id);
      orderType = 'MEMORY';
    } else {
      const stageMatchedCusts = availableCustomers.filter(c => stageAllowedIds.has(Number(c.preferredRecipeId)));
      const custPool = (stageMatchedCusts.length > 0 && Math.random() < 0.7) ? stageMatchedCusts : availableCustomers;
      chosenCustomer = custPool[Math.floor(Math.random() * custPool.length)];

      const prevSessionRecId = this.session.customerSessionRecipeMap.get(chosenCustomer.id);
      if (prevSessionRecId && stageAllowedIds.has(Number(prevSessionRecId)) && Math.random() < 0.4) {
        chosenRecipeId = Number(prevSessionRecId);
      } else if (stageAllowedIds.has(Number(chosenCustomer.preferredRecipeId)) && Math.random() < 0.65) {
        chosenRecipeId = Number(chosenCustomer.preferredRecipeId);
      } else if (recipePool.length > 0) {
        const pickedRec = recipePool[Math.floor(Math.random() * recipePool.length)];
        chosenRecipeId = Number(pickedRec.recipe_id);
      } else {
        chosenRecipeId = 12; // 탄산수 폴백
      }

      this.session.customerSessionRecipeMap.set(chosenCustomer.id, chosenRecipeId);
      orderType = 'NORMAL';
    }

    const order = this._createOrderForCustomer(chosenCustomer, chosenRecipeId, orderType, profile.wave);
    this.session.activeCustomer = chosenCustomer;
    this.session.activeOrder = order;

    this.knownRegularIds.add(chosenCustomer.id);
    this.savePersistentData();

    return { customer: chosenCustomer, order };
  }

  _createOrderForCustomer(customer, recipeId, orderType, wave) {
    let rId = Number(recipeId) || Number(customer.preferredRecipeId) || 12;
    let rec = this.recipeBook.getRecipe(rId);
    if (!this.isOrderableRecipe(rec)) {
      rId = 12;
      rec = this.recipeBook.getRecipe(12);
    }
    const recipeName = rec ? this.brandResolver.resolveName(rec) : '탄산수';
    const requiredStockKey = this.buildStockKey(rId);
    const price = this.calculateOrderPrice(rId, orderType, this.session.combo, wave);

    const maxPatienceSec = Math.max(24, 44 - (wave - 1) * 2);

    return {
      orderId: 'ord_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      orderType,
      quantity: 1,
      recipeId: rId,
      recipeName,
      requiredStockKey,
      price,
      maxPatienceSec,
      patienceSec: maxPatienceSec
    };
  }

  autoSeatAvailableTables() {
    if (!this.session || this.session.status !== 'PLAYING') return;
    if (!this.session.activeCustomer || !this.session.activeOrder) {
      this._spawnCounterCustomer();
    }
  }

  forceTutorialOrder(recipeId = 12) {
    if (!this.session || !this.session.activeCustomer) return;
    const order = this._createOrderForCustomer(this.session.activeCustomer, recipeId, 'NORMAL', 1);
    this.session.activeOrder = order;
  }

  /**
   * 카운터 손님의 대기시간(Patience) 실시간 감소 및 타임아웃 처리
   * - INFINITE(무한모드): 목숨 1개 차감, 0개가 되면 GAMEOVER
   * - GROWTH(일반 성장 영업): 목숨 차감 없이 콤보만 초기화되고 다음 손님 입장
   */
  tickPatience(dtSec = 1) {
    if (!this.session || this.session.status !== 'PLAYING') return { expiredCount: 0, isGameOver: false };
    const cust = this.session.activeCustomer;
    const ord = this.session.activeOrder;
    if (!cust || !ord) return { expiredCount: 0, isGameOver: false };

    ord.patienceSec = Math.max(0, (ord.patienceSec || 0) - dtSec);
    if (ord.patienceSec > 0) {
      return { expiredCount: 0, isGameOver: false };
    }

    const custName = cust.name;
    this.session.combo = 0;
    this.audio?.playFail?.();

    if (this.session.mode === 'INFINITE') {
      this.session.lives -= 1;
      this.session.lastLogMessage = `⏰ [${custName}] 손님이 기다리다 돌아갔습니다! (남은 목숨: ${'❤️'.repeat(Math.max(0, this.session.lives))})`;
      if (this.session.lives <= 0) {
        this.session.status = 'GAMEOVER';
        return { expiredCount: 1, isGameOver: true };
      }
    } else {
      this.session.lastLogMessage = `⏰ [${custName}] 손님이 기다리다 돌아갔습니다! 다음 손님을 맞이합니다.`;
    }

    this._spawnCounterCustomer();
    return { expiredCount: 1, isGameOver: false };
  }

  // =========================================================================
  // 타이쿤 전용 주조 가마솥 & 중앙 접시(Plate) <-> [📦 재고] 연동
  // =========================================================================

  tapIngredientInTycoonPot(baseId, detailId = null) {
    if (!this.session) return { ok: false };
    const bId = Number(baseId);
    const dId = detailId ? Number(detailId) : null;
    const pot = this.session.potSlots;

    const existing = pot.find(s => s.baseId === bId && (s.detailId || null) === dId);
    const totalCount = pot.reduce((acc, s) => acc + s.count, 0);

    const stepCfg = this.inventory ? this.inventory.getCurrentStepConfig() : null;
    const maxPerSlot = stepCfg ? stepCfg.maxCountPerSlot : 10;
    const maxTotal = stepCfg ? Math.max(6, stepCfg.maxTotalCount) : 12;

    if (existing) {
      if (existing.count >= maxPerSlot || totalCount >= maxTotal) {
        return { ok: false, message: `현재 점포 단계에서는 한 재료를 최대 ${maxPerSlot}개까지 넣을 수 있습니다.` };
      }
      existing.count += 1;
      return { ok: true, slot: existing };
    }

    if (pot.length >= 6) {
      return { ok: false, message: '한 번에 최대 6종류 재료까지 올릴 수 있습니다.' };
    }

    const newSlot = {
      baseId: bId,
      detailId: dId,
      count: 1
    };
    pot.push(newSlot);
    return { ok: true, slot: newSlot };
  }

  decrementTycoonPotSlot(slotIdx) {
    if (!this.session) return;
    const pot = this.session.potSlots;
    if (slotIdx < 0 || slotIdx >= pot.length) return;
    pot[slotIdx].count -= 1;
    if (pot[slotIdx].count <= 0) {
      pot.splice(slotIdx, 1);
    }
  }

  clearTycoonPot() {
    if (!this.session) return;
    this.session.potSlots = [];
  }

  previewTycoonPotMatch() {
    if (!this.session || this.session.potSlots.length < 2) return null;
    const slots = this.session.potSlots;

    const preferredRecipeId = this.session.activeOrder?.recipeId || null;

    const matchedRecipe = this.recipeBook.matchRecipe(
      slots,
      this.inventory ? this.inventory.unlockedRecipeIds : new Set(),
      preferredRecipeId
    );
    if (!matchedRecipe) return null;

    // 연구실에서 아직 해금하지 않은 레시피는 타이쿤에서 미리 조합 불가 (연구실 해금 필수!)
    if (this.inventory && !this.inventory.unlockAllSandboxMode && !this.inventory.isRecipeUnlocked(matchedRecipe.recipe_id)) {
      return null;
    }

    const stockKey = this.buildStockKey(matchedRecipe.recipe_id);

    return {
      recipe: matchedRecipe,
      recipeName: this.brandResolver.resolveName(matchedRecipe),
      stockKey,
      unlockedIng: this.recipeBook.getUnlockedIngredientByRecipe(matchedRecipe.recipe_id)
    };
  }

  craftToPlate() {
    const preview = this.previewTycoonPotMatch();
    if (!preview) {
      this.audio?.playFail?.();
      return {
        ok: false,
        message: '일치하는 해금 레시피가 없습니다! [🔬연구실]에서 해금한 재료와 비율을 확인해주세요.'
      };
    }

    this.session.platedStockKey = preview.stockKey;
    this.savePersistentData();
    this.clearTycoonPot();
    this.audio?.playSuccess?.();

    const label = preview.recipeName;
    this.session.lastLogMessage = `🍽️ [${label}] 완성! 중앙 접시 위에 올려졌습니다. 오른쪽 종(🛎️)을 눌러 서빙하세요!`;

    return {
      ok: true,
      crafted: preview,
      platedStockKey: preview.stockKey,
      label
    };
  }

  craftToStockpile() {
    return this.craftToPlate();
  }

  ringBellToServe() {
    if (!this.session || this.session.status !== 'PLAYING') {
      return { ok: false, message: '현재 영업 중이 아닙니다.' };
    }

    if (!this.session.platedStockKey) {
      return {
        ok: false,
        emptyPlate: true,
        message: '접시가 비어 있습니다! 재료를 조합해 접시 위에 먼저 올려주세요.'
      };
    }

    const cust = this.session.activeCustomer;
    const order = this.session.activeOrder;
    if (!cust || !order) {
      return { ok: false, message: '현재 주문 대기 중인 손님이 없습니다!' };
    }

    const servedStockKey = this.session.platedStockKey;
    this.session.platedStockKey = null;

    const isCorrect = (servedStockKey === order.requiredStockKey);

    if (isCorrect) {
      this.session.servedCount += 1;
      this.session.combo += 1;
      if (this.session.combo > this.session.maxCombo) {
        this.session.maxCombo = this.session.combo;
      }

      const basePrice = order.price;
      const comboBonus = this.session.combo >= 2 ? this.session.combo : 0;
      const earned = basePrice + comboBonus;
      this.session.totalEarnings += earned;
      this.persistentWallet += earned;

      const prevVisits = this.session.sessionCustomerVisits.get(cust.id) || 0;
      this.session.sessionCustomerVisits.set(cust.id, prevVisits + 1);
      this.knownRegularIds.add(cust.id);

      if (this.session.mode === 'INFINITE') {
        if (
          this.session.servedCount > this.persistentBestInfinite.servedCount ||
          (this.session.servedCount === this.persistentBestInfinite.servedCount &&
           this.session.totalEarnings > this.persistentBestInfinite.totalEarnings)
        ) {
          this.persistentBestInfinite = {
            servedCount: this.session.servedCount,
            totalEarnings: this.session.totalEarnings,
            maxCombo: this.session.maxCombo,
            maxWave: this.session.wave
          };
        }
      }

      this.savePersistentData();

      const servedLabel = order.recipeName;

      // 일반 성장 영업(GROWTH): 목표 판매 잔수(5잔) 달성 시 오늘 영업 완판 종료 -> 일일 정산 화면으로 이동!
      if (
        this.session.mode === 'GROWTH' &&
        this.session.targetServeCount > 0 &&
        this.session.servedCount >= this.session.targetServeCount
      ) {
        this.session.status = 'GAMEOVER';
        this.session.isQuotaCleared = true;
        this.session.activeCustomer = null;
        this.session.activeOrder = null;
        this.session.lastLogMessage = `🎉 오늘의 목표 판매량(${this.session.servedCount}/${this.session.targetServeCount}잔) 완판 달성! 정산서에서 새 재료를 구매하거나 연구실로 이동하세요!`;

        return {
          ok: true,
          isCorrect: true,
          isGameOver: true,
          isQuotaCleared: true,
          basePrice,
          comboBonus,
          combo: this.session.combo,
          earned,
          customer: cust,
          order,
          servedStockKey
        };
      }

      this.session.lastLogMessage = `🛎️ [${cust.name}] 손님에게 [${servedLabel}] 서빙 성공! +${earned.toLocaleString()}원 (${this.session.combo}🔥)`;

      this._spawnCounterCustomer();

      return {
        ok: true,
        isCorrect: true,
        isGameOver: false,
        isQuotaCleared: false,
        basePrice,
        comboBonus,
        combo: this.session.combo,
        earned,
        customer: cust,
        order,
        servedStockKey
      };
    } else {
      this.session.combo = 0;
      const expectedLabel = order.recipeName;

      if (this.session.mode === 'INFINITE') {
        this.session.lives -= 1;
        this.session.lastLogMessage = `💔 [주문 실수!] ${cust.name} 손님이 원한 건 [${expectedLabel}]였습니다! (남은 목숨: ${'❤️'.repeat(Math.max(0, this.session.lives))})`;

        if (this.session.lives <= 0) {
          this.session.status = 'GAMEOVER';
          return {
            ok: true,
            isCorrect: false,
            isGameOver: true,
            expectedLabel,
            customer: cust,
            order
          };
        }
      } else {
        this.session.lastLogMessage = `⚠️ [주문 불일치!] ${cust.name} 손님이 원한 건 [${expectedLabel}]였습니다!`;
      }

      this._spawnCounterCustomer();

      return {
        ok: true,
        isCorrect: false,
        noLifePenalty: this.session.mode !== 'INFINITE',
        isGameOver: this.session.status === 'GAMEOVER',
        expectedLabel,
        customer: cust,
        order
      };
    }
  }

  getStockItemDisplayMeta(stockKey) {
    const parsed = this.parseStockKey(stockKey);
    if (!parsed) return null;
    const rec = this.recipeBook.getRecipe(parsed.recipeId);
    if (!rec) return null;

    const recipeName = this.brandResolver.resolveName(rec);
    const estPrice = this.calculateOrderPrice(
      parsed.recipeId,
      'NORMAL',
      this.session ? this.session.combo : 0,
      this.session ? this.session.wave : 1
    );

    return {
      stockKey,
      recipe: rec,
      recipeName,
      fullLabel: recipeName,
      estPrice,
      iconHtml: window.KSool?.pixelIcon ? window.KSool.pixelIcon(rec, 28) : (rec.emoji || '🍶')
    };
  }
}

window.KSool.TycoonEngine = TycoonEngine;
