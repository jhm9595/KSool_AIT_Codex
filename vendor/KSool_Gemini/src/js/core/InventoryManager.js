window.KSool = window.KSool || {};

class InventoryManager {
  constructor(recipeBook, storageService) {
    this.recipeBook = recipeBook;
    this.storage = storageService;

    this.userLevel = 1;
    this.unlockedStepId = 1; // 점진적 단계 (STEP 1 ~ STEP 7)
    this.unlockedRecipeIds = new Set();
    this.unlockedIngredientIds = new Set();
    this.unlockedImageRecipeIds = new Set(); // 미니게임 클리어로 그림(아이콘)만 선해금된 레시피 ID 집합
    this.unlockedDescRecipeIds = new Set(); // 복권 긁기 완료로 설명 힌트만 선해금된 레시피 ID 집합
    this.hintProgressByRecipe = {}; // recipeId -> { stageCleared: [bool, bool, bool], solvedRatios: { ingId: ratio } }
    this.promotedCustomRecipes = [];
    this.craftFailCount = 0; // 주조실 조합 실패 횟수 (10회 이상 시 도감·힌트 탭 오픈)
    this.shownTabIntros = {
      collection: false,
      fridge: false,
      suggestions: false,
      detailPicker: false,
      noticeNo3: false,
      noticeNo6: false
    };
    this.unlockAllSandboxMode = false; // 모든 재료/단계 즉시 실험해보기 토글용
  }

  init() {
    this.unlockedRecipeIds.clear();
    this.unlockedIngredientIds.clear();
    this.unlockedImageRecipeIds.clear();
    this.unlockedDescRecipeIds.clear();
    this.unlockedStepId = 1;
    this.craftFailCount = 0;
    this.shownTabIntros = {
      collection: false,
      fridge: false,
      suggestions: false,
      detailPicker: false,
      noticeNo3: false,
      noticeNo6: false
    };

    // 1. 저장된 상태 복원 (해금한 레시피 목록 기준)
    const saved = this.storage.loadState();
    if (saved) {
      if (typeof saved.userLevel === 'number') this.userLevel = saved.userLevel;
      if (typeof saved.unlockedStepId === 'number') {
        this.unlockedStepId = Math.max(1, saved.unlockedStepId);
      }
      if (Array.isArray(saved.unlockedRecipeIds)) {
        saved.unlockedRecipeIds.forEach(id => this.unlockedRecipeIds.add(Number(id)));
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
      if (saved.shownTabIntros && typeof saved.shownTabIntros === 'object') {
        this.shownTabIntros = {
          collection: Boolean(saved.shownTabIntros.collection),
          fridge: Boolean(saved.shownTabIntros.fridge),
          suggestions: Boolean(saved.shownTabIntros.suggestions),
          detailPicker: Boolean(saved.shownTabIntros.detailPicker),
          noticeNo3: Boolean(saved.shownTabIntros.noticeNo3),
          noticeNo6: Boolean(saved.shownTabIntros.noticeNo6)
        };
      }
    }

    // 2. 현재 해금된 레시피 진행도에 맞춰 Step(1~7) 및 단계별 기초 재료·조합 재료 동기화
    this._syncStepAndIngredients();
    this._recalculateLevel();

    // 하위 호환성: 이미 해금된 기능/탭인데 저장 데이터의 플래그가 누락되어 있던 경우 플래그 동기화
    // (새로고침 시 팝업이 반복해서 뜨지 않도록 이미 해금된 항목은 플래그를 true로 맞춤)
    if (this.craftFailCount >= 1) this.shownTabIntros.collection = true;
    if (this.isDetailPickerUnlocked()) this.shownTabIntros.detailPicker = true;
    if (this.getUnlockProgressRatio() >= 0.5) this.shownTabIntros.fridge = true;
    const totalRecs = this.recipeBook.getAllRecipes().length;
    if (totalRecs > 0 && this.unlockedRecipeIds.size >= totalRecs) this.shownTabIntros.suggestions = true;
  }

  /**
   * 현재 해금된 레시피를 기준으로 도달한 Step(1~7)을 계산하고,
   * 해당 Step까지 허용된 기초(Leaf) 재료 + 조합 완성으로 해금된 재료만 인벤토리에 활성화합니다.
   */
  _syncStepAndIngredients() {
    const progression = this.recipeBook.progression;
    const allRecipes = this.recipeBook.getAllRecipes();
    const steps = progression.getAllSteps();

    let computedStep = 1;
    for (const step of steps) {
      if (step.step_id === 1) continue;
      const prevStepRecipes = allRecipes.filter(r => r.step_id < step.step_id);
      if (prevStepRecipes.length === 0) continue;

      const allPrevCleared = prevStepRecipes.every(r => this.unlockedRecipeIds.has(Number(r.recipe_id)));
      const countReached = this.unlockedRecipeIds.size >= prevStepRecipes.length;
      if (allPrevCleared || countReached) {
        computedStep = step.step_id;
      } else {
        break;
      }
    }

    if (computedStep > this.unlockedStepId) {
      this.unlockedStepId = computedStep;
    }

    this.unlockedIngredientIds.clear();

    // (a) 현재 도달한 Step 이하의 기초(Leaf) 재료만 순차 해금
    for (const step of steps) {
      if (step.step_id <= this.unlockedStepId) {
        for (const ingId of step.unlockLeafIds) {
          this.unlockedIngredientIds.add(Number(ingId));
        }
      }
    }

    // (b) 실제로 조합 성공한 레시피(unlockedRecipeIds)가 해금하는 결과물 재료 등록
    for (const rId of this.unlockedRecipeIds) {
      const unlockedIng = this.recipeBook.getUnlockedIngredientByRecipe(rId);
      if (unlockedIng) {
        this.unlockedIngredientIds.add(Number(unlockedIng.ingredient_id));
      }
    }
  }

  _recalculateLevel() {
    const count = this.unlockedRecipeIds.size;
    const computedLevel = Math.max(1, Math.min(5, Math.floor(count / 5) + 1));
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

  _getRecipeNumber(recipeId) {
    const rId = Number(recipeId);
    if (this.recipeBook) {
      const rec = this.recipeBook.getRecipe(rId);
      if (rec) {
        if (rec.formatted_number) {
          const m = rec.formatted_number.match(/\d+/);
          if (m) return parseInt(m[0], 10);
        }
        if (typeof rec.recipe_number === 'number') return rec.recipe_number;
      }
    }
    if (window.KSool?.SeedDataBundle?.recipes) {
      const rec = window.KSool.SeedDataBundle.recipes.find(r => r.recipe_id === rId);
      if (rec && rec.formatted_number) {
        const m = rec.formatted_number.match(/\d+/);
        if (m) return parseInt(m[0], 10);
      }
    }
    return 999;
  }

  isRecipeUnlocked(recipeId) {
    return this.unlockedRecipeIds.has(Number(recipeId));
  }

  isRecipeImageUnlocked(recipeId) {
    if (this.unlockAllSandboxMode) return true;
    const rId = Number(recipeId);
    // [온보딩 튜토리얼 룰] No.01 ~ No.03은 외형 그림 기본 해금 (무료 공개)
    if (this._getRecipeNumber(rId) <= 3) return true;
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
    if (this.unlockAllSandboxMode) return true;
    const rId = Number(recipeId);
    // [온보딩 튜토리얼 룰] No.01 ~ No.06은 설명 힌트 기본 해금 (무료 공개)
    if (this._getRecipeNumber(rId) <= 6) return true;
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
   * 해당 레시피가 '현재 단계'에서 지금 당장 조합/힌트 도전 가능한지 판별합니다.
   * 1) 하위 재료가 모두 해금되어 있어야 함
   * 2) 레시피의 최대 비율이 현재 Step의 재료당 최대 개수(maxCountPerSlot) 이하여야 함
   * 3) 특산 상세재료 필수 레시피라면 특산 선택기가 해금된 Step이어야 함
   */
  isRecipeChallengeable(recipe) {
    if (!recipe) return false;
    if (this.unlockAllSandboxMode) return true;
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
   * 넘버링 퀴즈 모드에서 다음으로 도전할 미해금 레시피(가장 빠른 No.XX)를 반환합니다.
   */
  getNextQuizRecipe() {
    const all = this.recipeBook.getAllRecipes();
    // 1순위: 현재 단계에서 즉시 조합 가능하면서 아직 미해금된 가장 빠른 번호
    const challengeableNext = all.find(
      r => !this.isRecipeUnlocked(r.recipe_id) && this.isRecipeChallengeable(r)
    );
    if (challengeableNext) return challengeableNext;

    // 2순위: 아직 미해금된 가장 빠른 번호
    const anyUnlockedNext = all.find(r => !this.isRecipeUnlocked(r.recipe_id));
    return anyUnlockedNext || all[all.length - 1] || null;
  }

  unlockRecipe(recipeId) {
    const rId = Number(recipeId);
    const isNew = !this.unlockedRecipeIds.has(rId);
    const prevStepId = this.unlockedStepId;
    const prevIngIds = new Set(this.unlockedIngredientIds);

    this.unlockedRecipeIds.add(rId);

    const unlockedIng = this.recipeBook.getUnlockedIngredientByRecipe(rId);
    let newlyUnlockedIngredient = null;
    if (unlockedIng && !prevIngIds.has(Number(unlockedIng.ingredient_id))) {
      newlyUnlockedIngredient = unlockedIng;
    }

    this._syncStepAndIngredients();

    let stepUpInfo = null;
    if (this.unlockedStepId > prevStepId) {
      const newStepConfig = this.recipeBook.progression.getStepConfig(this.unlockedStepId);
      const newlyUnlockedLeafIngredients = [];
      for (const ingId of this.unlockedIngredientIds) {
        if (!prevIngIds.has(ingId) && this.recipeBook.isLeafIngredient(ingId)) {
          const baseIng = this.recipeBook.getBaseIngredient(ingId);
          if (baseIng) newlyUnlockedLeafIngredients.push(baseIng);
        }
      }
      stepUpInfo = {
        prevStepId,
        newStepId: this.unlockedStepId,
        newStepConfig,
        newlyUnlockedLeafIngredients
      };
    }

    this._recalculateLevel();
    this.save();

    return { isNew, newlyUnlockedIngredient, stepUpInfo };
  }

  getHintState(recipeId) {
    const rId = Number(recipeId);
    const recNum = this._getRecipeNumber(rId);

    // 전체 해금 샌드박스 모드일 때만 베이스볼 & 황금비율 정답 100% 기본 공개 (일반 플레이 시 항상 직접 추리)
    if (this.unlockAllSandboxMode) {
      let items = this.recipeBook ? (this.recipeBook.getRecipeItems(rId) || []) : [];
      if (items.length === 0 && window.KSool?.SeedDataBundle?.recipe_ingredients) {
        items = window.KSool.SeedDataBundle.recipe_ingredients.filter(it => it.recipe_id === rId);
      }
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
    return Boolean(this.unlockAllSandboxMode || this.craftFailCount >= 1 || this.shownTabIntros.collection);
  }

  isFridgeTabUnlocked() {
    return Boolean(this.unlockAllSandboxMode || this.getUnlockProgressRatio() >= 0.5 || this.shownTabIntros.fridge);
  }

  isSuggestionTabUnlocked() {
    const total = this.recipeBook.getAllRecipes().length;
    return Boolean(
      this.unlockAllSandboxMode ||
      (total > 0 && this.unlockedRecipeIds.size >= total) ||
      this.shownTabIntros.suggestions
    );
  }

  isTabUnlocked(tabKey) {
    if (tabKey === 'brew') return true;
    if (tabKey === 'collection') return this.isCollectionTabUnlocked();
    if (tabKey === 'fridge') return this.isFridgeTabUnlocked();
    if (tabKey === 'suggestions') return this.isSuggestionTabUnlocked();
    if (tabKey === 'party') return true; // 오프라인 술자리 미니게임 탭은 언제든지 바로 플레이 가능
    return false;
  }

  save() {
    this.storage.saveState({
      userLevel: this.userLevel,
      unlockedStepId: this.unlockedStepId,
      unlockedRecipeIds: Array.from(this.unlockedRecipeIds),
      unlockedIngredientIds: Array.from(this.unlockedIngredientIds),
      unlockedImageRecipeIds: Array.from(this.unlockedImageRecipeIds),
      unlockedDescRecipeIds: Array.from(this.unlockedDescRecipeIds),
      hintProgressByRecipe: this.hintProgressByRecipe,
      promotedCustomRecipes: this.promotedCustomRecipes,
      craftFailCount: this.craftFailCount,
      shownTabIntros: this.shownTabIntros
    });
  }
}

window.KSool.InventoryManager = InventoryManager;
