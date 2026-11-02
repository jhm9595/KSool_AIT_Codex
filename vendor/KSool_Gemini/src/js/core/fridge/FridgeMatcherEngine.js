window.KSool = window.KSool || {};

/**
 * 7) 내 냉장고 술 조합 추천기 & 랜덤 추첨 엔진 (FridgeMatcherEngine)
 * - 재료를 만드는 기초합성 레시피(소주, 맥주, 얼음, 탄산수, 누룩, 음료 등)는 완전히 제외하고,
 *   오직 '완성된 술 조합(주류 재료가 포함된 칵테일/꿀조합)'만을 기준으로 추천합니다.
 * - 유저가 이미 해금한 재료 및 해금한 술 조합 레시피만 대상으로 작동합니다.
 */
class FridgeMatcherEngine {
  constructor(recipeBook, inventoryManager, suggestionService = null) {
    this.recipeBook = recipeBook;
    this.inventory = inventoryManager;
    this.suggestionService = suggestionService;
    this.STORAGE_KEY = 'ksool_alchemy_v2_my_fridge';
    this.selectedFridgeIngIds = new Set();
  }

  isOnline() {
    return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  }

  init() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach(id => {
            if (this.inventory.isIngredientAvailable(Number(id))) {
              this.selectedFridgeIngIds.add(Number(id));
            }
          });
        }
      }
    } catch (_) {}
  }

  /**
   * 해당 레시피가 '재료를 만드는 기초합성'이 아니라
   * 실제로 마시는 '완성된 술 조합(주류 포함)'인지 판별합니다.
   */
  isRealAlcoholDrinkRecipe(recipe) {
    if (!recipe) return false;
    // 재료를 해금시키는 중간 합성 레시피나 기초합성 카테고리는 제외
    if (recipe.category === '기초합성' || recipe.unlocks_ingredient_id) {
      return false;
    }
    const reqItems = this.recipeBook.getRecipeItems(recipe.recipe_id);
    // 구성 재료 중 실제 주류(ALCOHOL: 소주, 맥주, 막걸리, 복분자주, 매실주 등)가 포함된 조합만 인정
    return reqItems.some(it => {
      const base = this.recipeBook.getBaseIngredient(it.ingredient_id);
      return base && base.category_id === 'ALCOHOL';
    });
  }

  /**
   * 실제 술 조합 및 온라인 조합추천에 사용되는 재료들 중 유저가 해금한 재료 목록만 반환합니다.
   */
  getEligibleFridgeIngredients() {
    const usedInDrinkIds = new Set();
    for (const recipe of this.recipeBook.getAllRecipes()) {
      if (!this.isRealAlcoholDrinkRecipe(recipe)) continue;
      const items = this.recipeBook.getRecipeItems(recipe.recipe_id);
      items.forEach(it => usedInDrinkIds.add(Number(it.ingredient_id)));
    }

    // 도감 100% 달성으로 [조합추천] 탭이 열린 상태일 때만 조합추천 재료도 함께 포함
    if (this.isOnline() && this.suggestionService && this.inventory.isSuggestionTabUnlocked()) {
      for (const sug of this.suggestionService.getActiveSuggestions()) {
        (sug.items || []).forEach(it => usedInDrinkIds.add(Number(it.ingredient_id)));
      }
    }

    return Array.from(this.recipeBook.baseIngredients.values()).filter(
      ing => usedInDrinkIds.has(Number(ing.ingredient_id)) && this.inventory.isIngredientAvailable(ing.ingredient_id)
    );
  }

  toggleIngredient(ingredientId) {
    const id = Number(ingredientId);
    if (!this.inventory.isIngredientAvailable(id)) return false;

    if (this.selectedFridgeIngIds.has(id)) {
      this.selectedFridgeIngIds.delete(id);
    } else {
      this.selectedFridgeIngIds.add(id);
    }
    this._save();
    return true;
  }

  selectAllUnlocked() {
    this.getEligibleFridgeIngredients().forEach(ing => {
      this.selectedFridgeIngIds.add(Number(ing.ingredient_id));
    });
    this._save();
  }

  clearAll() {
    this.selectedFridgeIngIds.clear();
    this._save();
  }

  isSelected(ingredientId) {
    const id = Number(ingredientId);
    return this.inventory.isIngredientAvailable(id) && this.selectedFridgeIngIds.has(id);
  }

  /**
   * 선택한 냉장고 재료가 들어간 '해금된 공식 술 조합' 및 (온라인 연결 시) '조합추천' 목록을
   * 최대한 재료가 많이 맞아 있는 순서(matchedCount 내림차순 -> 일치율 내림차순)로 반환합니다.
   */
  findCraftableFromFridge() {
    if (this.selectedFridgeIngIds.size === 0) return [];

    const results = [];

    // 1. 유저가 해금한 정식 술 조합 레시피 중 선택한 냉장고 재료가 포함된 항목 (전체 해금 모드 시 모든 레시피 매칭)
    const candidateRecipeIds = this.inventory.unlockAllSandboxMode
      ? this.recipeBook.getAllRecipes().map(r => r.recipe_id)
      : Array.from(this.inventory.unlockedRecipeIds);

    for (const rId of candidateRecipeIds) {
      const recipe = this.recipeBook.getRecipe(rId);
      if (!this.isRealAlcoholDrinkRecipe(recipe)) continue;

      const reqItems = this.recipeBook.getRecipeItems(recipe.recipe_id);
      if (reqItems.length === 0) continue;

      const matchedCount = reqItems.filter(item => this.isSelected(item.ingredient_id)).length;
      if (matchedCount > 0) {
        const totalCount = reqItems.length;
        results.push({
          entryType: 'OFFICIAL',
          entryKey: `REC_${recipe.recipe_id}`,
          recipe,
          items: reqItems,
          matchedCount,
          totalCount,
          isFullMatch: matchedCount === totalCount,
          matchRatio: matchedCount / totalCount
        });
      }
    }

    // 2. 도감 100% 해금으로 [조합추천] 탭이 열렸고 온라인 상태일 때만 조합추천 항목 함께 노출
    if (this.isOnline() && this.suggestionService && this.inventory.isSuggestionTabUnlocked()) {
      const activeSuggestions = this.suggestionService.getActiveSuggestions();
      for (const sug of activeSuggestions) {
        if (!sug.items || sug.items.length === 0) continue;
        const matchedCount = sug.items.filter(it => this.isSelected(it.ingredient_id)).length;
        if (matchedCount > 0) {
          const totalCount = sug.items.length;
          results.push({
            entryType: 'SUGGESTION',
            entryKey: `SUG_${sug.suggestion_key}`,
            suggestion: sug,
            items: sug.items.map((it, idx) => ({
              slot_order: idx + 1,
              ingredient_id: Number(it.ingredient_id),
              detail_ingredient_id: it.detail_id ? Number(it.detail_id) : null,
              ratio: Number(it.ratio)
            })),
            matchedCount,
            totalCount,
            isFullMatch: matchedCount === totalCount,
            matchRatio: matchedCount / totalCount
          });
        }
      }
    }

    // 3. 최대한 재료가 많이 맞아 있는 순서대로 정렬 (isFullMatch 우선 -> matchedCount 내림차순 -> 일치율 내림차순)
    results.sort((a, b) => {
      if (a.isFullMatch !== b.isFullMatch) {
        return a.isFullMatch ? -1 : 1;
      }
      if (b.matchedCount !== a.matchedCount) {
        return b.matchedCount - a.matchedCount;
      }
      if (b.matchRatio !== a.matchRatio) {
        return b.matchRatio - a.matchRatio;
      }
      if (a.entryType !== b.entryType) {
        return a.entryType === 'OFFICIAL' ? -1 : 1;
      }
      return 0;
    });

    return results;
  }

  /**
   * 가능한 해금 술 조합 목록 중에서 무작위로 1개를 뽑아줍니다.
   */
  pickRandomRecipe(candidates) {
    if (!candidates || candidates.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  _save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.selectedFridgeIngIds)));
    } catch (_) {}
  }
}

window.KSool.FridgeMatcherEngine = FridgeMatcherEngine;
