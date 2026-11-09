window.KSool = window.KSool || {};

class AlchemyEngine {
  constructor({ config, recipeBook, craftingPot, inventory, feedbackStrategy, audio }) {
    this.config = config;
    this.recipeBook = recipeBook;
    this.craftingPot = craftingPot;
    this.inventory = inventory;
    this.feedbackStrategy = feedbackStrategy;
    this.audio = audio;
  }

  executeCraft(preferredRecipeId = null) {
    const slots = this.craftingPot.getSlots();
    if (slots.length < 2) {
      return { ok: false, message: '재료를 최소 2종류 이상 넣어주세요.' };
    }

    const matchedRecipe = this.recipeBook.matchRecipe(
      slots,
      this.inventory.unlockedRecipeIds,
      preferredRecipeId
    );

    if (matchedRecipe) {
      const isAlreadyUnlocked = this.inventory.isRecipeUnlocked(matchedRecipe.recipe_id);
      if (isAlreadyUnlocked) {
        this.audio.playTap();
      } else {
        this.audio.playSuccess();
      }
      const unlockInfo = this.inventory.unlockRecipe(matchedRecipe.recipe_id);
      const usedSlots = [...slots];
      this.craftingPot.clear();

      // 조합에 소모된 중간 재료(Non-Leaf) 재고 차감
      for (const slot of usedSlots) {
        if (!this.recipeBook.isLeafIngredient(slot.baseId)) {
          this.inventory.consumeIngredientStock(slot.baseId, slot.count || 1);
        }
      }

      // 새로 조합 완성된 결과물이 생산하는 재료가 있다면 재고 1개 지급!
      if (matchedRecipe.unlocks_ingredient_id) {
        this.inventory.addIngredientStock(matchedRecipe.unlocks_ingredient_id, 1);
      }

      return {
        ok: true,
        isSuccess: true,
        recipe: matchedRecipe,
        isNewDiscovery: unlockInfo.isNew,
        isAlreadyCrafted: isAlreadyUnlocked,
        newlyUnlockedIngredient: unlockInfo.newlyUnlockedIngredient,
        stepUpInfo: unlockInfo.stepUpInfo || null,
        usedSlots
      };
    } else {
      this.audio.playFail();
      const optionalFeedback = this.feedbackStrategy
        ? this.feedbackStrategy.getFailFeedback(slots, this.recipeBook)
        : null;
      const usedSlots = [...slots];
      // 실패 시에는 조합 가마솥을 비우지 않고 유지하여, '다시 도전하기' 시 재료를 다시 넣지 않고 수정/재시도 가능하게 함
      return {
        ok: true,
        isSuccess: false,
        optionalFeedback,
        usedSlots
      };
    }
  }
}

window.KSool.AlchemyEngine = AlchemyEngine;
