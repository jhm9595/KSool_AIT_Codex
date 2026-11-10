window.KSool = window.KSool || {};

class InventoryManager {
  constructor(recipeBook, storageService) {
    this.recipeBook = recipeBook;
    this.storage = storageService;

    this.userLevel = 1;
    this.unlockedStepId = 1; // 현재 해금된 점포 단계 (STAGE 1 ~ STAGE 6)
    this.unlockedRecipeIds = new Set();
    this.purchasedIngredientIds = new Set(); // 상점에서 돈 주고 구매한 기초(Leaf) 재료 ID 집합
    this.unlockedIngredientIds = new Set(); // 현재 사용 가능한 전체 재료 (무료 기초 4종 + 구매한 기초 재료 + 조합 해금 재료)
    this.ingredientStock = {}; // 조합으로 만들어진 중간 재료들의 보유 재고 맵 { [ingredientId]: count }
    this.unlockedImageRecipeIds = new Set(); // 미니게임 클리어로 그림(아이콘)만 선해금된 레시피 ID 집합
    this.unlockedDescRecipeIds = new Set(); // 복권 긁기 완료로 설명 힌트만 선해금된 레시피 ID 집합
    this.hintProgressByRecipe = {};
    this.promotedCustomRecipes = [];
    this.craftFailCount = 0;
    this.hasSeenIntroStory = false;
    this.hasSeenIntroTutorial = false;
    this.isQuizMode = false; // 🔬 퀴즈 모드 여부 (단계 돌파 시 재료 무료 자동 지급)
    this.shownTabIntros = {
      collection: true,
      fridge: true,
      suggestions: false,
      tycoon: true,
      detailPicker: false,
      noticeStage2: false,
      noticeStage3: false
    };
    this.unlockAllSandboxMode = false;
    this.isInitialized = false;
    this.isLoadCorrupted = false;
    this.saveBlockedDueToCorruption = false;
  }

  init() {
    this.isLoadCorrupted = false;
    this.saveBlockedDueToCorruption = false;
    this.unlockedRecipeIds.clear();
    this.purchasedIngredientIds.clear();
    this.unlockedIngredientIds.clear();
    this.ingredientStock = {};
    this.unlockedImageRecipeIds.clear();
    this.unlockedDescRecipeIds.clear();
    this.unlockedStepId = 1;
    this.craftFailCount = 0;
    this.hasSeenIntroStory = false;
    this.hasSeenIntroTutorial = false;
    this.isQuizMode = false; // 🔬 퀴즈 모드 여부 (단계 돌파 시 재료 무료 자동 지급)
    this.shownTabIntros = {
      collection: true,
      fridge: true,
      suggestions: false,
      tycoon: true,
      detailPicker: false,
      noticeStage2: false,
      noticeStage3: false
    };

    const saved = this.storage.loadState();
    const loadStatus = this.storage.lastLoadStatus || {};
    this.isLoadCorrupted = Boolean(loadStatus.isCorrupted);
    if (this.isLoadCorrupted) {
      this.saveBlockedDueToCorruption = true;
      console.error('[InventoryManager] Save data corruption detected. Auto-save disabled to protect quarantine.');
    }
    if (saved) {
      if (typeof saved.userLevel === 'number') this.userLevel = saved.userLevel;
      if (typeof saved.unlockedStepId === 'number') {
        this.unlockedStepId = Math.max(1, Math.min(6, saved.unlockedStepId));
      }
      if (Array.isArray(saved.unlockedRecipeIds)) {
        saved.unlockedRecipeIds.forEach(id => this.unlockedRecipeIds.add(Number(id)));
      }
      if (Array.isArray(saved.purchasedIngredientIds)) {
        saved.purchasedIngredientIds.forEach(id => this.purchasedIngredientIds.add(Number(id)));
      } else if (this.unlockedRecipeIds.size > 0 && !('ingredientStock' in saved)) {
        // 기존 세이브 호환: 이미 해금한 레시피에 사용된 리프 재료는 구매 완료 처리
        for (const rId of this.unlockedRecipeIds) {
          const items = this.recipeBook.getRecipeItems(rId) || [];
          for (const it of items) {
            if (this.recipeBook.isLeafIngredient(it.ingredient_id)) {
              this.purchasedIngredientIds.add(Number(it.ingredient_id));
            }
          }
        }
      }
      if (Array.isArray(saved.unlockedImageRecipeIds)) {
        saved.unlockedImageRecipeIds.forEach(id => this.unlockedImageRecipeIds.add(Number(id)));
      }
      if (Array.isArray(saved.unlockedDescRecipeIds)) {
        saved.unlockedDescRecipeIds.forEach(id => this.unlockedDescRecipeIds.add(Number(id)));
      }
      if (saved.hintProgressByRecipe && typeof saved.hintProgressByRecipe === 'object') {
        this.hintProgressByRecipe = saved.hintProgressByRecipe;
      }
      if (Array.isArray(saved.promotedCustomRecipes)) {
        this.promotedCustomRecipes = saved.promotedCustomRecipes;
      }
      if (typeof saved.craftFailCount === 'number') {
        this.craftFailCount = saved.craftFailCount;
      }
      if (typeof saved.hasSeenIntroStory === 'boolean') {
        this.hasSeenIntroStory = saved.hasSeenIntroStory;
      }
      if (typeof saved.hasSeenIntroTutorial === 'boolean') {
        this.hasSeenIntroTutorial = saved.hasSeenIntroTutorial;
      }
      if (saved.shownTabIntros && typeof saved.shownTabIntros === 'object') {
        this.shownTabIntros = {
          ...this.shownTabIntros,
          ...saved.shownTabIntros
        };
      }
      if (saved.ingredientStock && typeof saved.ingredientStock === 'object' && !Array.isArray(saved.ingredientStock)) {
        this.ingredientStock = { ...saved.ingredientStock };
      } else if (this.unlockedRecipeIds.size > 0) {
        // 기존 세이브 호환: 이미 해금된 조합 재료들은 기본 재고 1개씩 부여하여 잠김 방지
        for (const rId of this.unlockedRecipeIds) {
          const unlockedIng = this.recipeBook.getUnlockedIngredientByRecipe(rId);
          if (unlockedIng) {
            this.ingredientStock[Number(unlockedIng.ingredient_id)] = 1;
          }
        }
      }
    }

    this._syncStepAndIngredients();
    this._recalculateLevel();
    this.isInitialized = true;
  }

  /**
   * 무료 시작 재료(5종: 물·눈·공기·설탕·레몬) + 상점에서 구매한 기초 재료 + 조합으로 해금된 중간 재료를 동기화합니다.
   */
  _syncStepAndIngredients() {
    const progression = this.recipeBook.progression;
    const freeIds = progression.freeStarterLeafIds || [202, 206, 205, 701, 301];

    this.unlockedIngredientIds.clear();

    // 1. 무료 시작 재료 5종 기본 지급
    for (const id of freeIds) {
      this.unlockedIngredientIds.add(Number(id));
    }

    // 2. 상점에서 구매한 기초 재료 활성화
    for (const id of this.purchasedIngredientIds) {
      this.unlockedIngredientIds.add(Number(id));
    }

    // 3. 연구실에서 조합 성공한 레시피가 해금하는 중간 재료(얼음, 탄산수, 소주, 맥주, 막걸리 등) 등록
    for (const rId of this.unlockedRecipeIds) {
      const unlockedIng = this.recipeBook.getUnlockedIngredientByRecipe(rId);
      if (unlockedIng) {
        this.unlockedIngredientIds.add(Number(unlockedIng.ingredient_id));
      }
    }
  }

  /**
   * 특정 기초 재료가 무료 제공이거나 이미 구매되었는지 확인
   */
  isBaseIngredientPurchased(ingredientId) {
    if (this.unlockAllSandboxMode) return true;
    const id = Number(ingredientId);
    const freeIds = this.recipeBook?.progression?.freeStarterLeafIds || [202, 206, 205, 701, 301];
    if (freeIds.includes(id)) return true;
    return this.purchasedIngredientIds.has(id);
  }

  /**
   * 타이쿤 영업 수익(persistentWallet)으로 기초 재료를 하나씩 구매합니다.
   */
  purchaseBaseIngredient(ingredientId, tycoonEngine) {
    const id = Number(ingredientId);
    if (this.isBaseIngredientPurchased(id)) {
      return { ok: false, alreadyPurchased: true, message: '이미 보유 중인 재료입니다.' };
    }

    const shopMap = this.recipeBook.progression.getAllShopIngredientsMap();
    const shopMeta = shopMap.get(id);
    if (!shopMeta) {
      return { ok: false, message: '상점에서 판매하지 않는 재료입니다.' };
    }

    if (shopMeta.step_id > this.unlockedStepId) {
      const reqStep = this.recipeBook.progression.getStepConfig(shopMeta.step_id);
      return {
        ok: false,
        message: `[${reqStep.title}] 점포를 먼저 해금해야 구매할 수 있습니다.`
      };
    }

    const wallet = tycoonEngine ? tycoonEngine.persistentWallet : 0;
    if (wallet < shopMeta.price) {
      return {
        ok: false,
        message: `자금이 부족합니다! (필요: ${shopMeta.price.toLocaleString()}원 / 보유: ${wallet.toLocaleString()}원)`
      };
    }

    if (tycoonEngine) {
      tycoonEngine.persistentWallet -= shopMeta.price;
      tycoonEngine.savePersistentData();
    }

    this.purchasedIngredientIds.add(id);
    this._syncStepAndIngredients();
    this.save();

    const baseIng = this.recipeBook.getBaseIngredient(id);
    const ingLabel = baseIng ? (baseIng.display_name || baseIng.name || '새 재료') : '새 재료';
    return {
      ok: true,
      ingredient: baseIng,
      price: shopMeta.price,
      unlocksHint: shopMeta.unlocksHint,
      remainingWallet: tycoonEngine ? tycoonEngine.persistentWallet : 0,
      message: `[${ingLabel}] 구매 완료! 이제 연구실과 점포에서 사용할 수 있습니다.`
    };
  }

  /**
   * 특정 점포 단계(stepId: 1~6)의 재료 구매 현황 및 레시피 연구 현황을 반환합니다.
   * 다음 점포(stepId + 1)를 해금하려면 현재 점포(stepId)의 모든 상점 재료 구매 + 모든 레시피 해금이 필수입니다!
   */
  getStageCompletionStatus(stepId) {
    const progression = this.recipeBook.progression;
    const stepCfg = progression.getStepConfig(stepId);
    const shopItems = stepCfg.shopIngredients || [];
    const purchasedShopItems = shopItems.filter(it => this.isBaseIngredientPurchased(it.id));
    const unpurchasedShopItems = shopItems.filter(it => !this.isBaseIngredientPurchased(it.id));

    const allRecipes = this.recipeBook.getAllRecipes();
    const stageRecipes = allRecipes.filter(r => Number(r.step_id) === Number(stepId));
    const unlockedStageRecipes = stageRecipes.filter(r => this.isRecipeUnlocked(r.recipe_id));

    // 해당 점포에서 손님에게 판매 가능한 음료/주류 중 이미 해금된 레시피 목록
    const orderableUnlockedRecipes = unlockedStageRecipes.filter(r => {
      if (!r.unlocks_ingredient_id) return true;
      const ing = this.recipeBook.getBaseIngredient(r.unlocks_ingredient_id);
      return Boolean(ing && (ing.category_id === 'ALCOHOL' || ing.category_id === 'DRINK'));
    });

    const allIngredientsPurchased = purchasedShopItems.length >= shopItems.length;
    const allRecipesUnlocked = stageRecipes.length > 0 && unlockedStageRecipes.length >= stageRecipes.length;

    const firstNum = stageRecipes[0]?.formatted_number || 'No.01';
    const lastNum = stageRecipes[stageRecipes.length - 1]?.formatted_number || firstNum;
    const formattedRange = `${firstNum}~${lastNum}`;

    return {
      stepId: stepCfg.step_id,
      stageId: stepCfg.stageId,
      title: stepCfg.title,
      formattedRange,
      shopTotalCount: shopItems.length,
      shopPurchasedCount: purchasedShopItems.length,
      totalShopCount: shopItems.length,
      purchasedShopCount: purchasedShopItems.length,
      unpurchasedShopList: unpurchasedShopItems,
      allIngredientsPurchased,
      isAllShopPurchased: allIngredientsPurchased,
      recipeTotalCount: stageRecipes.length,
      recipeUnlockedCount: unlockedStageRecipes.length,
      totalRecipeCount: stageRecipes.length,
      unlockedRecipeCount: unlockedStageRecipes.length,
      orderableUnlockedCount: orderableUnlockedRecipes.length,
      allRecipesUnlocked,
      isAllRecipesUnlocked: allRecipesUnlocked,
      isStageMastered: allIngredientsPurchased && allRecipesUnlocked
    };
  }

  /**
   * 모든 6단계 점포 및 전 레시피(84종)가 100% 해금되어 '무한모드(목숨 3개 서바이벌)'가 열렸는지 여부
   */
  isInfiniteModeUnlocked() {
    if (this.unlockAllSandboxMode) return true;
    const allRecipes = this.recipeBook.getAllRecipes();
    return allRecipes.length > 0 && this.unlockedRecipeIds.size >= allRecipes.length;
  }

  setUnlockedStepId(stepId, shouldSave = true) {
    const num = Math.max(1, Math.min(6, Number(stepId) || 1));
    if (num > this.unlockedStepId) {
      this.unlockedStepId = num;
    }
    this._syncStepAndIngredients();
    if (shouldSave && this.isInitialized) {
      this.save();
    }
  }

  _recalculateLevel() {
    const count = this.unlockedRecipeIds.size;
    const computedLevel = Math.max(1, Math.min(6, Math.floor(count / 12) + 1));
    if (computedLevel > this.userLevel) {
      this.userLevel = computedLevel;
    }
  }

  getCurrentStepConfig() {
    const progression = this.recipeBook.progression;
    if (this.unlockAllSandboxMode) {
      return progression.getStepConfig(progression.getAllSteps().length);
    }
    return progression.getStepConfig(this.unlockedStepId);
  }

  isDetailPickerUnlocked() {
    return Boolean(this.getCurrentStepConfig().allowDetailPicker);
  }

  isIngredientAvailable(ingredientId) {
    if (this.unlockAllSandboxMode) return true;
    return this.unlockedIngredientIds.has(Number(ingredientId));
  }

  /**
   * 해당 재료가 조합을 통해 생산되는 중간 조합 재료인지 확인 (Leaf 기초 재료가 아님)
   */
  isCraftedIngredient(ingredientId) {
    if (!this.recipeBook) return false;
    return !this.recipeBook.isLeafIngredient(ingredientId);
  }

  /**
   * 해당 재료의 연구실 가용 재고 반환:
   * 연구실에서는 해금된 모든 재료를 무제한(Infinity)으로 자유롭게 연구/조합할 수 있습니다.
   * (재고 제약은 타이쿤 점포 영업 세션에만 적용)
   */
  getIngredientStock(ingredientId) {
    const id = Number(ingredientId);
    if (!this.unlockedIngredientIds.has(id)) return 0;
    return Infinity;
  }

  /**
   * 조합 성공 시 생산된 중간 재료 재고 1개 추가
   */
  addIngredientStock(ingredientId, amount = 1) {
    const id = Number(ingredientId);
    if (!this.isCraftedIngredient(id)) return;
    this.ingredientStock[id] = (this.ingredientStock[id] || 0) + Math.max(1, Number(amount) || 1);
    this.save();
  }

  /**
   * 다음 레시피 조합 시 소모된 중간 재료 재고 차감
   */
  consumeIngredientStock(ingredientId, amount = 1) {
    const id = Number(ingredientId);
    if (!this.isCraftedIngredient(id)) return;
    const current = this.ingredientStock[id] || 0;
    this.ingredientStock[id] = Math.max(0, current - (Number(amount) || 1));
    this.save();
  }

  _getRecipeNumber(recipeId) {
    const rId = Number(recipeId);
    if (this.recipeBook) {
      const rec = this.recipeBook.getRecipe(rId);
      if (rec) {
        if (typeof rec.recipe_number === 'number') return rec.recipe_number;
        if (rec.formatted_number) {
          const m = rec.formatted_number.match(/\d+/);
          if (m) return parseInt(m[0], 10);
        }
      }
    }
    return 999;
  }

  _getRecipeStepId(recipeId) {
    const rId = Number(recipeId);
    if (this.recipeBook) {
      const rec = this.recipeBook.getRecipe(rId);
      if (rec && typeof rec.step_id === 'number') {
        return rec.step_id;
      }
    }
    return 999;
  }

  isRecipeUnlocked(recipeId) {
    if (this._forceTutorialLockedRecipe12 && Number(recipeId) === 12) return false;
    if (this.unlockAllSandboxMode) return true;
    return this.unlockedRecipeIds.has(Number(recipeId));
  }

  isRecipeImageUnlocked(recipeId) {
    if (this._forceTutorialLockedHintPreview && Number(recipeId) === 12) return false;
    if (this.unlockAllSandboxMode) return true;
    const rId = Number(recipeId);
    // STAGE 1 (길거리 노점, step_id === 1, No.01 ~ No.18) 레시피는 외형 그림 기본 공개
    // STAGE 2 (이모네 포장마차, step_id >= 2)부터는 미니게임을 클리어해야 외형 그림 확인 가능!
    if (this._getRecipeStepId(rId) <= 1) return true;
    return this.unlockedRecipeIds.has(rId) || this.unlockedImageRecipeIds.has(rId);
  }

  unlockRecipeImage(recipeId) {
    const rId = Number(recipeId);
    const isNew = !this.unlockedImageRecipeIds.has(rId);
    this.unlockedImageRecipeIds.add(rId);
    this.save();
    return isNew;
  }

  isRecipeDescUnlocked(recipeId) {
    if (this._forceTutorialLockedHintPreview && Number(recipeId) === 12) return false;
    if (this.unlockAllSandboxMode) return true;
    const rId = Number(recipeId);
    // STAGE 1 ~ STAGE 2 (길거리 노점·이모네 포장마차, step_id <= 2, No.01 ~ No.37)까지는 설명 힌트 기본 공개
    // STAGE 3 (동네 목조 주막, step_id >= 3, No.38~)부터는 은박지 복권을 긁어야 설명 힌트 확인 가능!
    if (this._getRecipeStepId(rId) <= 2) return true;
    return this.unlockedRecipeIds.has(rId) || this.unlockedDescRecipeIds.has(rId);
  }

  unlockRecipeDesc(recipeId) {
    const rId = Number(recipeId);
    const isNew = !this.unlockedDescRecipeIds.has(rId);
    this.unlockedDescRecipeIds.add(rId);
    this.save();
    return isNew;
  }

  /**
   * 해당 레시피를 만들기 위해 필요한 재료들의 상태를 진단합니다.
   * - missingCrafted: 아직 한 번도 조합하지 않은 선행 조합 재료 목록
   * - outOfStockCrafted: 조합은 해금되었으나 현재 가용 재고가 부족한 조합 재료 목록
   * - missingShop: 아직 상점에서 구매하지 않은 재료 목록
   */
  getRecipeMissingRequirements(recipeId) {
    const res = {
      isReady: true,
      missingCrafted: [],
      outOfStockCrafted: [],
      missingShop: []
    };
    if (!this.recipeBook) return res;
    const items = this.recipeBook.getRecipeItems(recipeId);
    if (!items || items.length === 0) return res;

    for (const it of items) {
      const ingId = Number(it.ingredient_id);
      const baseIng = this.recipeBook.getBaseIngredient(ingId);
      const reqCount = Number(it.ratio) || 1;
      const isCrafted = this.isCraftedIngredient(ingId);

      if (isCrafted) {
        if (!this.unlockedIngredientIds.has(ingId)) {
          const producers = this.recipeBook.producerRecipesByIngId.get(ingId) || [];
          const producerRecipe = producers.length > 0 ? this.recipeBook.getRecipe(producers[0]) : null;
          res.missingCrafted.push({ ingredient: baseIng, producerRecipe, requiredCount: reqCount });
          res.isReady = false;
        }
      } else {
        if (!this.isIngredientAvailable(ingId)) {
          res.missingShop.push({ ingredient: baseIng, requiredCount: reqCount });
          res.isReady = false;
        }
      }
    }

    return res;
  }

  isRecipeChallengeable(recipe) {
    if (!recipe) return false;
    if (this.unlockAllSandboxMode) return true;
    if (Number(recipe.step_id) > this.unlockedStepId) return false;

    const reqItems = this.recipeBook.getRecipeItems(recipe.recipe_id);
    if (!reqItems || reqItems.length === 0) return false;

    const allIngsAvailable = reqItems.every(it => this.isIngredientAvailable(it.ingredient_id));
    if (!allIngsAvailable) return false;

    const stepConfig = this.getCurrentStepConfig();
    const maxRatio = recipe.max_ratio || Math.max(...reqItems.map(i => Number(i.ratio) || 1));
    const sumRatio = recipe.sum_ratio || reqItems.reduce((s, i) => s + (Number(i.ratio) || 1), 0);

    if (maxRatio > stepConfig.maxCountPerSlot) return false;
    if (sumRatio > stepConfig.maxTotalCount) return false;
    if (recipe.requires_detail_ingredient && !stepConfig.allowDetailPicker) return false;

    return true;
  }

  /**
   * 현재 보유(무료+상점 구매+조합 해금)한 재료들로 지금 당장 조합해 해금할 수 있는 미해금 레시피 목록을 반환합니다.
   * @param {boolean} onlyPurchasedShopIngs 상점에서 돈 주고 구매한 재료(purchasedIngredientIds)가 포함된 미해금 레시피만 우선 체크할지 여부
   */
  getChallengeableLockedRecipes(onlyPurchasedShopIngs = false) {
    if (!this.recipeBook || this.unlockAllSandboxMode) return [];
    const all = this.recipeBook.getAllRecipes();
    const challengeableLocked = all.filter(
      r => !this.isRecipeUnlocked(r.recipe_id) && this.isRecipeChallengeable(r)
    );
    if (!onlyPurchasedShopIngs) return challengeableLocked;

    return challengeableLocked.filter(r => {
      const reqItems = this.recipeBook.getRecipeItems(r.recipe_id) || [];
      return reqItems.some(it => this.purchasedIngredientIds.has(Number(it.ingredient_id)));
    });
  }

  /**
   * 연구실 퀴즈 모드에서 다음으로 도전할 미해금 레시피(가장 빠른 No.XX)를 반환합니다.
   */
  getNextQuizRecipe() {
    const all = this.recipeBook.getAllRecipes();
    // 1순위: 현재 보유한 재료로 지금 당장 조합 가능하면서 미해금된 가장 빠른 번호
    const challengeableNext = all.find(
      r => !this.isRecipeUnlocked(r.recipe_id) && this.isRecipeChallengeable(r)
    );
    if (challengeableNext) return challengeableNext;

    // 2순위: 현재 점포 단계(unlockedStepId) 내에서 미해금된 가장 빠른 번호 (재료 구매 유도)
    const currentStepNext = all.find(
      r => Number(r.step_id) <= this.unlockedStepId && !this.isRecipeUnlocked(r.recipe_id)
    );
    if (currentStepNext) return currentStepNext;

    // 3순위: 전체 중 미해금된 가장 빠른 번호
    const anyUnlockedNext = all.find(r => !this.isRecipeUnlocked(r.recipe_id));
    return anyUnlockedNext || all[all.length - 1] || null;
  }

  unlockRecipe(recipeId) {
    const rId = Number(recipeId);
    const isNew = !this.unlockedRecipeIds.has(rId);
    const prevIngIds = new Set(this.unlockedIngredientIds);

    this.unlockedRecipeIds.add(rId);

    const unlockedIng = this.recipeBook.getUnlockedIngredientByRecipe(rId);
    let newlyUnlockedIngredient = null;
    if (unlockedIng && !prevIngIds.has(Number(unlockedIng.ingredient_id))) {
      newlyUnlockedIngredient = unlockedIng;
    }

    let stageAutoUnlockedIngredients = [];
    let advancedStageCfg = null;
    if (this.isQuizMode && this.recipeBook?.progression) {
      const stageRecipes = this.recipeBook.getAllRecipes().filter(r => Number(r.step_id) === this.unlockedStepId);
      const allStageUnlocked = stageRecipes.length > 0 && stageRecipes.every(r => this.unlockedRecipeIds.has(r.recipe_id));

      if (allStageUnlocked && this.unlockedStepId < 6) {
        this.unlockedStepId += 1;
        advancedStageCfg = this.recipeBook.progression.getStepConfig(this.unlockedStepId);
        const newShopItems = this.recipeBook.progression.getShopIngredientsForStep(this.unlockedStepId) || [];
        for (const item of newShopItems) {
          this.purchasedIngredientIds.add(Number(item.id));
          const base = this.recipeBook.getBaseIngredient(item.id);
          if (base) stageAutoUnlockedIngredients.push(base);
        }
      }
    }

    this._syncStepAndIngredients();
    this._recalculateLevel();
    this.save();

    return {
      isNew,
      newlyUnlockedIngredient,
      stepUpInfo: null,
      stageAutoUnlockedIngredients,
      advancedStageCfg
    };
  }

  /**
   * 🔬 K-술 조합 퀴즈 모드 전용: 현재 단계까지 필요한 모든 기초 재료를 상점 결제 없이 100% 무료 자동 지급
   */
  syncQuizModeStageIngredients() {
    this.isQuizMode = true;
    if (!this.recipeBook?.progression) return;
    const progression = this.recipeBook.progression;
    for (let s = 1; s <= this.unlockedStepId; s++) {
      const shopItems = progression.getShopIngredientsForStep(s) || [];
      for (const item of shopItems) {
        this.purchasedIngredientIds.add(Number(item.id));
      }
    }
    this._syncStepAndIngredients();
    this.save();
  }

  getHintState(recipeId) {
    const rId = Number(recipeId);
    if (this.unlockAllSandboxMode) {
      let items = this.recipeBook ? (this.recipeBook.getRecipeItems(rId) || []) : [];
      const solvedRatios = {};
      items.forEach(it => {
        solvedRatios[String(it.slot_order)] = Number(it.ratio) || 1;
      });
      return {
        stageCleared: [true, true, true],
        solvedRatios,
        history: []
      };
    }

    const key = String(rId);
    if (!this.hintProgressByRecipe[key]) {
      this.hintProgressByRecipe[key] = {
        stageCleared: [false, false, false],
        solvedRatios: {},
        history: []
      };
    }
    return this.hintProgressByRecipe[key];
  }

  recordCraftFailure() {
    this.craftFailCount = (this.craftFailCount || 0) + 1;
    this.save();
    return this.craftFailCount;
  }

  getUnlockProgressRatio() {
    const total = this.recipeBook.getAllRecipes().length;
    if (total === 0) return 0;
    return this.unlockedRecipeIds.size / total;
  }

  isCollectionTabUnlocked() {
    return true;
  }

  isFridgeTabUnlocked() {
    return true;
  }

  isSuggestionTabUnlocked() {
    const total = this.recipeBook.getAllRecipes().length;
    return Boolean(
      this.unlockAllSandboxMode ||
      (total > 0 && this.unlockedRecipeIds.size >= total) ||
      this.shownTabIntros.suggestions
    );
  }

  isTycoonTabUnlocked() {
    return true;
  }

  isTabUnlocked(tabKey) {
    if (tabKey === 'tycoon') return true;
    if (tabKey === 'brew') return true;
    if (tabKey === 'shop') return true;
    if (tabKey === 'collection') return true;
    if (tabKey === 'party') return true;
    if (tabKey === 'fridge') return true;
    if (tabKey === 'suggestions') return this.isSuggestionTabUnlocked();
    return false;
  }

  markIntroStorySeen() {
    this.hasSeenIntroStory = true;
    this.save();
  }

  markIntroTutorialSeen() {
    this.hasSeenIntroTutorial = true;
    this.save();
  }

  save() {
    if (!this.isInitialized) {
      console.warn('[InventoryManager] save() blocked: inventory not yet initialized.');
      return;
    }
    if (this.saveBlockedDueToCorruption) {
      console.warn('[InventoryManager] save() blocked: previous save was corrupted and quarantined.');
      return;
    }
    this.storage.saveState({
      userLevel: this.userLevel,
      unlockedStepId: this.unlockedStepId,
      unlockedRecipeIds: Array.from(this.unlockedRecipeIds),
      purchasedIngredientIds: Array.from(this.purchasedIngredientIds),
      unlockedIngredientIds: Array.from(this.unlockedIngredientIds),
      unlockedImageRecipeIds: Array.from(this.unlockedImageRecipeIds),
      unlockedDescRecipeIds: Array.from(this.unlockedDescRecipeIds),
      hintProgressByRecipe: this.hintProgressByRecipe,
      promotedCustomRecipes: this.promotedCustomRecipes,
      ingredientStock: { ...this.ingredientStock },
      craftFailCount: this.craftFailCount,
      hasSeenIntroStory: this.hasSeenIntroStory,
      hasSeenIntroTutorial: this.hasSeenIntroTutorial,
      shownTabIntros: this.shownTabIntros
    });
  }
}

window.KSool.InventoryManager = InventoryManager;
