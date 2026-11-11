window.KSool = window.KSool || {};

class RecipeBook {
  constructor() {
    this.categories = [];
    this.baseIngredients = new Map();
    this.detailIngredients = new Map();
    this.detailsByBaseId = new Map();
    this.recipes = new Map();
    this.recipeItemsByRecipeId = new Map();
    this.externalHintsByRecipeId = new Map();
    // 데이터 기반 레시피 의존성 그래프 (DAG): 하드코딩 없이 리프(기초) 재료 자동 판별용
    this.producerRecipesByIngId = new Map();
    this.unlockedIngIdByRecipeId = new Map();
    this.progression = new window.KSool.ProgressionEngine();
  }

  load(bundleData, customPromotedRecipes = []) {
    this.categories = [...(bundleData.categories || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    this.baseIngredients.clear();
    this.detailIngredients.clear();
    this.detailsByBaseId.clear();
    this.recipes.clear();
    this.recipeItemsByRecipeId.clear();
    this.externalHintsByRecipeId.clear();
    this.producerRecipesByIngId.clear();
    this.unlockedIngIdByRecipeId.clear();

    (bundleData.ingredients_base || bundleData.base_ingredients || []).forEach(ing => {
      this.baseIngredients.set(Number(ing.ingredient_id), ing);
    });

    (bundleData.ingredients_detail || bundleData.detail_ingredients || []).forEach(det => {
      const dId = Number(det.detail_id);
      const bId = Number(det.base_ingredient_id);
      this.detailIngredients.set(dId, det);
      if (!this.detailsByBaseId.has(bId)) this.detailsByBaseId.set(bId, []);
      this.detailsByBaseId.get(bId).push(det);
    });

    (bundleData.recipes || []).forEach(rec => {
      this.recipes.set(Number(rec.recipe_id), rec);
    });

    (bundleData.recipe_ingredients || bundleData.recipe_items || []).forEach(item => {
      const rId = Number(item.recipe_id);
      if (!this.recipeItemsByRecipeId.has(rId)) this.recipeItemsByRecipeId.set(rId, []);
      this.recipeItemsByRecipeId.get(rId).push(item);
    });

    // 유저 추천에서 관리자가 '딸깍' 및 '스마트 분석' 승인하여 추가된 정식 레시피 병합
    (customPromotedRecipes || []).forEach(entry => {
      if (entry && entry.recipe && Array.isArray(entry.items)) {
        const rId = Number(entry.recipe.recipe_id);
        this.recipes.set(rId, entry.recipe);
        this.recipeItemsByRecipeId.set(rId, entry.items);
        if (entry.dotInnerSvg && window.KSool?.PixelIconRegistry?.registerCustomSprite) {
          window.KSool.PixelIconRegistry.registerCustomSprite({
            key: 'rec_' + rId,
            name: entry.recipe.display_name,
            dotInnerSvg: entry.dotInnerSvg,
            hdInnerSvg: entry.hdInnerSvg || null,
            aliases: [rId, entry.recipe.display_name]
          });
        }
      }
    });

    // 각 레시피의 재료들을 slot_order 오름차순 정렬
    for (const [rId, items] of this.recipeItemsByRecipeId.entries()) {
      items.sort((a, b) => (a.slot_order || 1) - (b.slot_order || 1));
    }

    (bundleData.external_hints || []).forEach(h => {
      const rId = Number(h.recipe_id);
      if (!this.externalHintsByRecipeId.has(rId)) this.externalHintsByRecipeId.set(rId, []);
      this.externalHintsByRecipeId.get(rId).push(h);
    });

    this._buildIngredientDependencyGraph();
    this.progression.applyProgressionToRecipeBook(this);
  }

  /**
   * 하드코딩된 플래그(is_starter 등)에 의존하지 않고,
   * 전체 레시피와 재료 데이터를 교차 분석하여 어떤 레시피로 만들어지는 재료(Non-Leaf)인지,
   * 아니면 어떤 레시피의 결과물도 아닌 순수 기초 리프 재료(Leaf Starter)인지 동적으로 계산합니다.
   */
  _buildIngredientDependencyGraph() {
    this.producerRecipesByIngId.clear();
    this.unlockedIngIdByRecipeId.clear();

    for (const [ingId, ing] of this.baseIngredients.entries()) {
      const producers = [];
      for (const [rId, rec] of this.recipes.entries()) {
        const matchesExplicitId = Number(rec.unlocks_ingredient_id) === Number(ingId);
        const matchesName =
          rec.display_name === ing.display_name ||
          rec.real_name === ing.real_name ||
          rec.display_name === ing.real_name ||
          rec.real_name === ing.display_name;

        if (matchesExplicitId || matchesName) {
          producers.push(Number(rId));
          this.unlockedIngIdByRecipeId.set(Number(rId), Number(ingId));
          rec.unlocks_ingredient_id = Number(ingId);
        }
      }
      this.producerRecipesByIngId.set(Number(ingId), producers);
    }
  }

  /**
   * 해당 대표 재료가 어떤 레시피로도 조합되지 않는 '순수 리프(기초) 재료'인지 데이터 기반으로 반환합니다.
   */
  isLeafIngredient(ingredientId) {
    const producers = this.producerRecipesByIngId.get(Number(ingredientId));
    return !producers || producers.length === 0;
  }

  /**
   * 특정 레시피를 완성했을 때 해금되는 대표 재료가 있다면 반환합니다.
   */
  getUnlockedIngredientByRecipe(recipeId) {
    const ingId = this.unlockedIngIdByRecipeId.get(Number(recipeId));
    return ingId ? this.getBaseIngredient(ingId) : null;
  }

  getBaseIngredient(id) {
    return this.baseIngredients.get(Number(id)) || null;
  }

  getAllBaseIngredients() {
    return Array.from(this.baseIngredients.values());
  }

  getDetailIngredient(detailId) {
    if (!detailId) return null;
    return this.detailIngredients.get(Number(detailId)) || null;
  }

  getDetailsForBase(baseId) {
    return this.detailsByBaseId.get(Number(baseId)) || [];
  }

  getRecipe(recipeId) {
    return this.recipes.get(Number(recipeId)) || null;
  }

  getAllRecipes() {
    return Array.from(this.recipes.values()).sort(
      (a, b) => (a.recipe_number || a.recipe_id) - (b.recipe_number || b.recipe_id)
    );
  }

  getRecipeByNumber(recipeNumber) {
    const num = Number(recipeNumber);
    for (const rec of this.recipes.values()) {
      if (rec.recipe_number === num) return rec;
    }
    return null;
  }

  getRecipeItems(recipeId) {
    return this.recipeItemsByRecipeId.get(Number(recipeId)) || [];
  }

  getIngredientsForRecipe(recipeId) {
    return this.getRecipeItems(recipeId);
  }

  getExternalHints(recipeId) {
    return this.externalHintsByRecipeId.get(Number(recipeId)) || [];
  }

  _gcd(a, b) {
    return b === 0 ? a : this._gcd(b, a % b);
  }

  _normalizeCounts(counts) {
    if (counts.length === 0) return [];
    const divisor = counts.reduce((acc, val) => this._gcd(acc, val), counts[0]);
    return counts.map(c => Math.round(c / (divisor || 1)));
  }

  /**
   * 가마솥 슬롯 배열과 일치하는 레시피를 탐색합니다.
   * - EASY 레시피(1:1 동등 비율)는 기약비가 1:1이면 매칭
   * - NORMAL/MASTER 레시피는 정확한 투입 개수 또는 기약 황금비율 일치 시 매칭
   * - 상세 재료 필수(requires_detail_ingredient) 레시피를 우선 검사합니다.
   * - preferredRecipeId(퀴즈 모드 현재 타겟)가 후보군에 있으면 최우선 반환합니다.
   */
  matchRecipe(potSlots, unlockedRecipeIds = new Set(), preferredRecipeId = null) {
    if (!potSlots || potSlots.length < 2) return null;

    // 같은 대표 재료끼리 합산이 필요한 일반 레시피 대비 및 상세 재료 구분
    const allRecipes = this.getAllRecipes().sort((a, b) => {
      // 상세 재료 필수 레시피 우선 판정
      if (a.requires_detail_ingredient !== b.requires_detail_ingredient) {
        return a.requires_detail_ingredient ? -1 : 1;
      }
      return (a.recipe_number || a.recipe_id) - (b.recipe_number || b.recipe_id);
    });

    const candidates = [];

    for (const recipe of allRecipes) {
      const reqItems = this.getRecipeItems(recipe.recipe_id);
      if (reqItems.length !== potSlots.length) continue;

      const isOrderSensitive = Boolean(recipe.requires_order);

      if (recipe.requires_detail_ingredient) {
        // 상세 재료까지 정확히 일치해야 함 (requires_order가 true면 투입 순서까지 일치해야 함)
        const reqList = reqItems.map(i => `${i.ingredient_id}:${i.detail_ingredient_id || 0}@${i.ratio}`);
        const potList = potSlots.map(s => `${s.baseId}:${s.detailId || 0}@${s.count}`);
        const reqKey = (isOrderSensitive ? reqList : [...reqList].sort()).join('+');
        const potKey = (isOrderSensitive ? potList : [...potList].sort()).join('+');
        if (reqKey === potKey) {
          candidates.push(recipe);
        }
      } else {
        // 대표 재료 기준 비교 (requires_order가 true면 투입 순서 유지, false면 순서 무관 정렬 비교)
        const reqTarget = isOrderSensitive
          ? [...reqItems]
          : [...reqItems].sort((a, b) => a.ingredient_id - b.ingredient_id);
        const potTarget = isOrderSensitive
          ? [...potSlots]
          : [...potSlots].sort((a, b) => a.baseId - b.baseId);

        const sameBaseIds = reqTarget.every((r, idx) => Number(r.ingredient_id) === Number(potTarget[idx].baseId));
        if (!sameBaseIds) continue;

        const exactRatioMatch = reqTarget.every((r, idx) => Number(r.ratio) === Number(potTarget[idx].count));
        const normReq = this._normalizeCounts(reqTarget.map(r => Number(r.ratio)));
        const normPot = this._normalizeCounts(potTarget.map(p => Number(p.count)));
        const normRatioMatch = normReq.every((val, idx) => val === normPot[idx]);

        if (exactRatioMatch || (recipe.difficulty === 'EASY' && normRatioMatch)) {
          candidates.push(recipe);
        }
      }
    }

    if (candidates.length === 0) return null;
    // 퀴즈 모드에서 현재 타겟으로 지정된 레시피가 후보군에 있다면 최우선 매칭
    if (preferredRecipeId) {
      const preferred = candidates.find(c => Number(c.recipe_id) === Number(preferredRecipeId));
      if (preferred) return preferred;
    }
    // 아직 해금되지 않은 레시피가 있다면 넘버링 순서대로 우선 반환 (예: 레모네이드 No.17 vs 토닉워터 No.18 동일 조합 대응)
    const unDiscovered = candidates.find(c => !unlockedRecipeIds.has(c.recipe_id));
    return unDiscovered || candidates[0];
  }

  /**
   * 관리자 '딸깍' 승인 시 추천 조합을 즉시 정식 레시피로 편입
   */
  promoteSuggestionToOfficialRecipe(suggestion, brandResolver) {
    const newId = Math.max(0, ...Array.from(this.recipes.keys())) + 1;
    const itemNames = suggestion.items.map(it => {
      const det = this.getDetailIngredient(it.detail_id);
      const base = this.getBaseIngredient(it.ingredient_id);
      return brandResolver.resolveName(det || base);
    });
    const isAllOne = suggestion.items.every(it => Number(it.ratio) === 1);
    const hasDetail = suggestion.items.some(it => Boolean(it.detail_id));

    const newRecipe = {
      recipe_id: newId,
      display_name: `${itemNames.slice(0, 2).join('·')} 특제조합`,
      real_name: `${itemNames.slice(0, 2).join('·')} 특제조합`,
      is_licensed: false,
      difficulty: hasDetail ? 'MASTER' : (isAllOne ? 'EASY' : 'NORMAL'),
      required_level: 1,
      requires_detail_ingredient: hasDetail,
      emoji: '🥂',
      category: '유저추천꿀조합',
      unlocks_ingredient_id: null,
      description: `유저 추천(👍 ${suggestion.upvotes})에서 관리자 원클릭 승인된 공식 편입 꿀조합!`
    };

    const newItems = suggestion.items.map((it, idx) => ({
      id: Date.now() + idx,
      recipe_id: newId,
      slot_order: idx + 1,
      ingredient_id: Number(it.ingredient_id),
      detail_ingredient_id: it.detail_id ? Number(it.detail_id) : null,
      ratio: Number(it.ratio)
    }));

    this.recipes.set(newId, newRecipe);
    this.recipeItemsByRecipeId.set(newId, newItems);
    this._buildIngredientDependencyGraph();
    this.progression.applyProgressionToRecipeBook(this);

    return { recipe: newRecipe, items: newItems };
  }
}

window.KSool.RecipeBook = RecipeBook;
