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
      this.craftingPot.clear();
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
