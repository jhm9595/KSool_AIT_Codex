window.KSool = window.KSool || {};

/**
 * 5-1) 3단계 순차 재료 숫자야구 엔진 (BaseballHintEngine)
 * - Stage 1 (첫 번째 네모박스): 재료 유형 (Category)
 * - Stage 2 (두 번째 네모박스): 대표 재료 (Base Ingredient)
 * - Stage 3 (세 번째 네모박스): 상세 재료 (Detail Ingredient)
 * * 대표 재료에서 끝나는 조합(requires_detail_ingredient === false)은
 *   2번째 체크박스까지만 진행되고 즉시 '모든 재료 추리 완료' 처리됩니다.
 */
class BaseballHintEngine {
  constructor(recipeBook, inventoryManager) {
    this.recipeBook = recipeBook;
    this.inventory = inventoryManager;
  }

  getMaxStageForRecipe(recipe) {
    return recipe && recipe.requires_detail_ingredient ? 3 : 2;
  }

  getCurrentActiveStage(recipeId) {
    const recipe = this.recipeBook.getRecipe(recipeId);
    const maxStage = this.getMaxStageForRecipe(recipe);
    const state = this.inventory.getHintState(recipeId);

    if (!state.stageCleared[0]) return 1;
    if (!state.stageCleared[1]) return 2;
    if (maxStage === 3 && !state.stageCleared[2]) return 3;
    return maxStage + 1; // 모든 단계 클리어 완료
  }

  isAllStagesCleared(recipeId) {
    const recipe = this.recipeBook.getRecipe(recipeId);
    const maxStage = this.getMaxStageForRecipe(recipe);
    const state = this.inventory.getHintState(recipeId);
    if (maxStage === 2) {
      return Boolean(state.stageCleared[0] && state.stageCleared[1]);
    }
    return Boolean(state.stageCleared[0] && state.stageCleared[1] && state.stageCleared[2]);
  }

  /**
   * 현재 Stage의 정답 토큰 배열 반환 (야구게임 규칙에 따라 중복 토큰은 제거하여 1개씩만 선택하도록 제어)
   * - 예: 주류 + 주류 + 과일 조합이라면 1단계(재료 유형) 정답 토큰은 ['ALCOHOL', 'FRUIT'] 2개가 되어
   *   주류 + 과일을 하나씩만 선택하면 2 Strike로 1단계를 통과하고, 2단계에서 3개의 상세 대표 재료를 맞추게 됩니다.
   */
  getAnswerTokens(recipeId, stage) {
    const items = this.recipeBook.getRecipeItems(recipeId);
    const rawTokens = items.map(item => {
      const baseIng = this.recipeBook.getBaseIngredient(item.ingredient_id);
      if (stage === 1) {
        return baseIng ? baseIng.category_id : 'UNKNOWN';
      }
      if (stage === 2) {
        return String(item.ingredient_id);
      }
      // Stage 3: 상세 재료가 지정된 슬롯은 detail_ingredient_id, 일반 슬롯은 base_id 유지
      return item.detail_ingredient_id
        ? `D:${item.detail_ingredient_id}`
        : `B:${item.ingredient_id}`;
    });

    // 중복을 허용하지 않는 야구게임 규칙에 따라 순서 유지 중복 제거
    return Array.from(new Set(rawTokens));
  }

  /**
   * 유저가 제출한 추측 배열(guessTokens)에 대해 Strike / Ball / Out 판정
   * - 일반 레시피(recipe.requires_order === false):
   *   소주+맥주나 맥주+소주나 동일하게 조합되므로 순서와 무관하게 정답에 포함되면 무조건 Strike, 아니면 Out (Ball 없음!)
   * - 순서 중요 레시피(recipe.requires_order === true, 예: HARD 모드 층 분리/플로팅 칵테일 등):
   *   위치까지 정확히 일치하면 Strike, 정답에 포함되나 순서(위치)가 다르면 Ball, 포함되지 않으면 Out!
   */
  evaluateGuess(recipeId, stage, guessTokens, guessLabels) {
    const recipe = this.recipeBook.getRecipe(recipeId);
    const isOrderSensitive = Boolean(recipe && recipe.requires_order);
    const answerTokens = this.getAnswerTokens(recipeId, stage);
    const n = answerTokens.length;

    // 중복 선택 방어 검증
    const uniqueGuesses = Array.from(new Set(guessTokens.map(t => String(t))));

    let strikes = 0;
    let balls = 0;
    let outs = 0;

    for (let i = 0; i < n; i++) {
      const g = String( uniqueGuesses[i] || '' );
      const a = String(answerTokens[i]);

      if (isOrderSensitive) {
        if (g === a) {
          strikes++;
        } else if (answerTokens.includes(g)) {
          balls++;
        } else {
          outs++;
        }
      } else {
        if (answerTokens.includes(g)) {
          strikes++;
        } else {
          outs++;
        }
      }
    }

    const isStageCleared = strikes === n;
    const state = this.inventory.getHintState(recipeId);

    if (isStageCleared) {
      state.stageCleared[stage - 1] = true;
      state.history = [];
    } else {
      const record = {
        stage,
        guessLabels,
        strikes,
        balls,
        outs,
        isStageCleared
      };
      // 누적(append)하지 않고 매번 최신 판정 결과 1건만 유지
      state.history = [record];
    }
    this.inventory.save();

    const allCompleted = this.isAllStagesCleared(recipeId);
    return {
      strikes,
      balls,
      outs,
      isStageCleared,
      allCompleted
    };
  }
}

window.KSool.BaseballHintEngine = BaseballHintEngine;
