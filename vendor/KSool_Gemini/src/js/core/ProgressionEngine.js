window.KSool = window.KSool || {};

/**
 * K-술 단계별 넘버링(No.01 ~ No.N) 및 점진적 해금(기초재료·비율상한·특산재료) 엔진
 *
 * [향후 신규 조합법 추가 가이드]
 * 1. data/recipes.json 및 data/recipe_ingredients.json에 새 레시피를 추가하기만 하면,
 *    ProgressionEngine이 재료 개수, 비율(1:1 vs 비율조합), 특산 상세재료 포함 여부, 하위 재료 의존성(DAG)을
 *    자동 분석하여 적합한 난이도(EASY/NORMAL/MASTER), 단계(step_id: 1~7), 넘버링(No.XX)을 자동 부여합니다.
 * 2. 특정 단계나 순서를 직접 지정하고 싶다면 레시피 객체에 선택적으로
 *    "step_id": 1~7, "step_order": 숫자 를 기입하면 해당 위치에 우선 배치됩니다.
 * 3. 새로운 기초(Leaf) 재료를 ingredients_base.json에 추가한 경우에도,
 *    해당 재료가 사용되는 가장 빠른 레시피의 단계(step_id)에서 자동으로 함께 해금됩니다.
 */
class ProgressionEngine {
  constructor() {
    /**
     * 7단계 점진적 성장(Step) 마스터 설정
     * - Step 1 ~ 4: 1:1 및 1:1:1 기초 조합 단계 (비율 고정: 재료당 최대 1개)
     * - Step 5: 황금비율 입문 (비율 해금: 재료당 최대 2개)
     * - Step 6: 중급 황금비율 (비율 확장: 재료당 최대 3개)
     * - Step 7: 마스터 황금비율 & 특산 명주 (비율 최대 10개 + 특산 상세재료 해금)
     */
    this.steps = [
      {
        step_id: 1,
        code: 'STEP 1',
        title: '태초의 원소와 첫 술',
        subtitle: '2가지 기초 재료를 1:1로 합쳐 소주·맥주·소맥을 탄생시키세요',
        maxCountPerSlot: 1,
        maxTotalCount: 4,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 1:1 기초조합 (재료당 최대 1개)',
        ruleNotice: '현재 단계에서는 비율 없이 재료를 1개씩(1:1)만 조합합니다.',
        unlockLeafIds: [202, 203, 205, 206, 501, 607], // 물, 불, 공기, 눈, 맥(보리), 콜라
        canonicalRecipeOrder: [5, 11, 12, 4, 1, 18] // No.01 ~ No.06
      },
      {
        step_id: 2,
        code: 'STEP 2',
        title: '과일청과 달콤한 과실주',
        subtitle: '설탕·우유·과일이 해금되었습니다! 달콤한 과실주와 우유, 사이다를 빚어보세요',
        maxCountPerSlot: 1,
        maxTotalCount: 4,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 1:1 기초조합 (재료당 최대 1개)',
        ruleNotice: '신규 과일·우유·설탕 기초 재료가 추가되었습니다! (1:1 조합)',
        unlockLeafIds: [701, 401, 303, 304, 312, 307, 310, 311], // 설탕, 우유, 망고, 매실, 깔라만시, 딸기, 바나나, 유자
        canonicalRecipeOrder: [16, 20, 19, 53, 54, 34, 35, 36, 37, 58] // No.07 ~ No.16
      },
      {
        step_id: 3,
        code: 'STEP 3',
        title: '3재료 에이드 & 아이스크림 연금술',
        subtitle: '3가지 재료를 1:1:1로 조합해 에이드와 아이스크림, 아아, 과일주를 만드세요',
        maxCountPerSlot: 1,
        maxTotalCount: 4,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 1:1:1 3재료 조합 (재료당 최대 1개)',
        ruleNotice: '이제 3가지 재료를 1개씩(1:1:1) 조합하는 레시피가 등장합니다!',
        unlockLeafIds: [301, 601, 302, 306, 309, 314, 504, 315, 505], // 레몬, 홍차, 멜론, 사과, 배, 석류, 커피콩, 오렌지, 팥
        canonicalRecipeOrder: [13, 14, 52, 15, 9, 59, 3, 23, 32, 66, 63, 84, 65, 85, 67, 73, 78, 80, 81, 83] // No.17 ~ No.36
      },
      {
        step_id: 4,
        code: 'STEP 4',
        title: '연쇄 연금술과 주막 막걸리 하우스',
        subtitle: '직접 빚은 막걸리에 과일·음료를 1:1로 섞은 달콤한 과일 막걸리 7종과 식초·홍초·태극주를 완성하세요',
        maxCountPerSlot: 1,
        maxTotalCount: 4,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 연쇄 1:1 조합 (재료당 최대 1개)',
        ruleNotice: '조합으로 얻은 재료를 다시 재료로 활용하는 연쇄 연금술 단계입니다!',
        unlockLeafIds: [308, 305, 313, 502, 616, 613, 615], // 카카오, 토마토, 복분자, 쌀, 요구르트, 복숭아음료, 파인애플주스
        canonicalRecipeOrder: [28, 29, 30, 22, 21, 57, 25, 26, 38, 44, 46, 60, 42, 48, 45, 47, 62, 64, 77]
      },
      {
        step_id: 5,
        code: 'STEP 5',
        title: '황금비율 입문 (최대 2개 해금!)',
        subtitle: '이제 재료를 2번까지 탭하여 [2:1] 황금비율 소맥과 고진감래주, 에너자이저주에 도전하세요!',
        maxCountPerSlot: 2,
        maxTotalCount: 6,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 비율 해금: 재료당 최대 2개',
        ruleNotice: '비율 시스템이 해금되었습니다! 같은 재료를 두 번 눌러 최대 2개까지 투입해보세요.',
        unlockLeafIds: [602, 603], // 에너지드링크, 이온음료
        canonicalRecipeOrder: [6, 27, 10, 75, 76, 8, 79, 82]
      },
      {
        step_id: 6,
        code: 'STEP 6',
        title: '인기 편의점주 & 시그니처 칵테일 (최대 3개 해금!)',
        subtitle: '빙과류와 토닉워터, 맥주를 활용한 2:1~3:2 황금비율 시그니처 폭탄주와 기범주에 도전하세요',
        maxCountPerSlot: 3,
        maxTotalCount: 8,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 비율 확장: 재료당 최대 3개',
        ruleNotice: '이제 한 재료를 최대 3개까지 투입하여 2:1, 3:2, 3:2:1 황금비율을 빚을 수 있습니다!',
        unlockLeafIds: [],
        canonicalRecipeOrder: [24, 33, 17, 51, 74, 7]
      },
      {
        step_id: 7,
        code: 'STEP 7',
        title: '전설의 황금비율 & 특산 명주 (최대 10개 해금!)',
        subtitle: '비율 해제 및 신규 재료(꿀), 전설의 브랜드 소맥(테슬라·테진아·카스처럼)과 특산 명주가 열렸습니다!',
        maxCountPerSlot: 10,
        maxTotalCount: 10,
        allowDetailPicker: true,
        ruleBadge: '👑 마스터 비율: 최대 10개 + 특산재료',
        ruleNotice: '모든 비율 제한(총합 10개)과 특산 상세재료, 신규 꿀이 해금되었습니다!',
        unlockLeafIds: [705], // 꿀
        canonicalRecipeOrder: [61, 43, 49, 31, 50, 40, 41, 2, 39, 68, 69, 70, 71, 72, 55, 56]
      }
    ];
  }

  getStepConfig(stepId) {
    const id = Math.max(1, Math.min(this.steps.length, Number(stepId) || 1));
    return this.steps.find(s => s.step_id === id) || this.steps[0];
  }

  getAllSteps() {
    return this.steps;
  }

  /**
   * 레시피북이 로드될 때 전체 레시피에 대해
   * 난이도(difficulty), 소속 단계(step_id), 도감/퀴즈 넘버링(recipe_number: 1~N, formatted_number: No.01~No.N)을
   * 데이터 기반으로 자동 계산·부여합니다.
   * 향후 새 레시피가 추가되더라도 코드 수정 없이 자동으로 적절한 넘버링과 단계가 배정됩니다.
   */
  applyProgressionToRecipeBook(recipeBook) {
    if (!recipeBook) return;

    // 1. 기본 리프 재료의 해금 단계 매핑 구축
    const leafUnlockStepByIngId = new Map();
    for (const step of this.steps) {
      for (const ingId of step.unlockLeafIds) {
        leafUnlockStepByIngId.set(Number(ingId), step.step_id);
      }
    }

    // 정식 시드 레시피의 기본 step_id 및 내부 순서 매핑
    const canonicalStepByRecipeId = new Map();
    const canonicalOrderByRecipeId = new Map();
    for (const step of this.steps) {
      step.canonicalRecipeOrder.forEach((rId, idx) => {
        canonicalStepByRecipeId.set(Number(rId), step.step_id);
        canonicalOrderByRecipeId.set(Number(rId), idx + 1);
      });
    }

    const allRecipes = recipeBook.getAllRecipes();

    // 2. 각 레시피의 난이도(difficulty) 및 1차 단계(step_id) 자동 판별
    for (const rec of allRecipes) {
      const rId = Number(rec.recipe_id);
      const items = recipeBook.getRecipeItems(rId);
      const maxRatio = items.length > 0 ? Math.max(...items.map(i => Number(i.ratio) || 1)) : 1;
      const sumRatio = items.reduce((acc, i) => acc + (Number(i.ratio) || 1), 0);
      const hasDetail = Boolean(
        rec.requires_detail_ingredient || items.some(i => Boolean(i.detail_ingredient_id))
      );

      rec.max_ratio = maxRatio;
      rec.sum_ratio = sumRatio;
      rec.item_count = items.length;
      if (!rec.unlock_hint) {
        rec.unlock_hint = `${rec.category || '특별'} 계열의 조합입니다. 어울리는 재료들을 추리해 조합해보세요.`;
      }

      // 난이도 자동 보정 (명시된 값이 없거나 새 레시피인 경우 자동 산출)
      if (hasDetail) {
        rec.difficulty = 'MASTER';
        rec.requires_detail_ingredient = true;
      } else if (maxRatio === 1) {
        rec.difficulty = 'EASY';
      } else {
        rec.difficulty = 'NORMAL';
      }

      // step_id 결정:
      // (a) canonical 매핑에 있으면 우선 사용
      // (b) 레시피 데이터에 명시적 step_id(1~7)가 있으면 사용
      // (c) 신규 추가 레시피라면 비율/재료수/특산여부로 자동 배정
      if (canonicalStepByRecipeId.has(rId)) {
        rec.step_id = canonicalStepByRecipeId.get(rId);
        rec.step_order = canonicalOrderByRecipeId.get(rId);
      } else if (rec.step_id && Number(rec.step_id) >= 1 && Number(rec.step_id) <= this.steps.length) {
        rec.step_id = Number(rec.step_id);
        rec.step_order = Number(rec.step_order) || 999;
      } else {
        rec.step_id = this._inferStepForNewRecipe(rec, items, leafUnlockStepByIngId);
        rec.step_order = Number(rec.step_order) || 500 + rId;
      }

      // 만약 새 레시피에 아직 어느 Step에도 등록되지 않은 신규 리프(기초) 재료가 쓰였다면
      // 해당 레시피의 Step에 자동으로 해금 등록
      for (const it of items) {
        const ingId = Number(it.ingredient_id);
        if (recipeBook.isLeafIngredient(ingId) && !leafUnlockStepByIngId.has(ingId)) {
          leafUnlockStepByIngId.set(ingId, rec.step_id);
          const targetStep = this.getStepConfig(rec.step_id);
          if (!targetStep.unlockLeafIds.includes(ingId)) {
            targetStep.unlockLeafIds.push(ingId);
          }
        }
      }
    }

    // 3. 재료 중 아직 어떤 레시피에도 안 쓰인 신규 리프 재료가 있다면 기본 Step 4에 등록
    for (const [ingId] of recipeBook.baseIngredients.entries()) {
      if (recipeBook.isLeafIngredient(ingId) && !leafUnlockStepByIngId.has(Number(ingId))) {
        leafUnlockStepByIngId.set(Number(ingId), 4);
        this.getStepConfig(4).unlockLeafIds.push(Number(ingId));
      }
    }

    // 4. 의존성(DAG) 기반 step_id 하한 보정:
    //    하위 재료(기초 재료 또는 선행 조합 재료)가 해금되는 Step보다 빠른 Step에 배정될 수 없도록 보장
    let changed = true;
    let guard = 0;
    while (changed && guard < 20) {
      changed = false;
      guard++;
      for (const rec of allRecipes) {
        const items = recipeBook.getRecipeItems(rec.recipe_id);
        let minRequiredStep = 1;
        for (const it of items) {
          const ingId = Number(it.ingredient_id);
          if (recipeBook.isLeafIngredient(ingId)) {
            minRequiredStep = Math.max(minRequiredStep, leafUnlockStepByIngId.get(ingId) || 1);
          } else {
            const producers = recipeBook.producerRecipesByIngId.get(ingId) || [];
            if (producers.length > 0) {
              const prodSteps = producers
                .map(pId => recipeBook.getRecipe(pId))
                .filter(Boolean)
                .map(pRec => pRec.step_id || 1);
              if (prodSteps.length > 0) {
                minRequiredStep = Math.max(minRequiredStep, Math.min(...prodSteps));
              }
            }
          }
        }
        if (rec.step_id < minRequiredStep) {
          rec.step_id = minRequiredStep;
          changed = true;
        }
      }
    }

    // 5. 전체 레시피 정렬 및 연속 넘버링(No.01 ~ No.N) 부여
    const sorted = [...allRecipes].sort((a, b) => {
      if (a.step_id !== b.step_id) return a.step_id - b.step_id;
      if ((a.step_order || 999) !== (b.step_order || 999)) {
        return (a.step_order || 999) - (b.step_order || 999);
      }
      if (a.item_count !== b.item_count) return a.item_count - b.item_count;
      if (a.max_ratio !== b.max_ratio) return a.max_ratio - b.max_ratio;
      if (a.sum_ratio !== b.sum_ratio) return a.sum_ratio - b.sum_ratio;
      return a.recipe_id - b.recipe_id;
    });

    sorted.forEach((rec, idx) => {
      rec.recipe_number = idx + 1;
      rec.formatted_number = `No.${String(idx + 1).padStart(2, '0')}`;
    });

    // 각 Step의 시작 번호 ~ 끝 번호 메타데이터 갱신
    for (const step of this.steps) {
      const stepRecipes = sorted.filter(r => r.step_id === step.step_id);
      if (stepRecipes.length > 0) {
        step.startNumber = stepRecipes[0].recipe_number;
        step.endNumber = stepRecipes[stepRecipes.length - 1].recipe_number;
        step.recipeCount = stepRecipes.length;
      } else {
        step.startNumber = 0;
        step.endNumber = 0;
        step.recipeCount = 0;
      }
    }

    this.leafUnlockStepByIngId = leafUnlockStepByIngId;
  }

  _inferStepForNewRecipe(rec, items, leafUnlockStepByIngId) {
    const maxRatio = rec.max_ratio || 1;
    const hasDetail = Boolean(rec.requires_detail_ingredient);
    if (hasDetail || maxRatio >= 4) return 7;
    if (maxRatio === 3) return 6;
    if (maxRatio === 2) return 5;

    // 1:1 조합인 경우 재료 구성에 따라 Step 1~4 자동 배정
    let maxLeafStep = 1;
    for (const it of items) {
      const s = leafUnlockStepByIngId.get(Number(it.ingredient_id)) || 1;
      if (s > maxLeafStep) maxLeafStep = s;
    }
    if (items.length >= 3) {
      return Math.max(3, Math.min(4, maxLeafStep));
    }
    return Math.max(1, Math.min(4, maxLeafStep));
  }

  /**
   * 한글 문자열의 초성(예: "소주" -> "ㅅ ㅈ")을 추출합니다. (단계별 퀴즈 단서용)
   */
  extractChosungHint(text) {
    if (!text) return '';
    const CHOSUNG = [
      'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
      'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ];
    const chars = [];
    for (const ch of text) {
      const code = ch.charCodeAt(0) - 0xac00;
      if (code >= 0 && code < 11172) {
        const choIdx = Math.floor(code / 588);
        chars.push(CHOSUNG[choIdx]);
      } else if (ch === ' ') {
        chars.push(' ');
      } else {
        chars.push(ch);
      }
    }
    return chars.join('');
  }

  /**
   * 퀴즈 카드에서 정답 술 이름이 설명에 노출되지 않도록 마스킹합니다.
   */
  maskDescriptionForQuiz(recipe, resolvedName) {
    if (!recipe || !recipe.description) return '';
    let desc = recipe.description;
    const targets = [recipe.display_name, recipe.real_name, resolvedName].filter(Boolean);
    for (const t of targets) {
      if (t.length >= 2) {
        desc = desc.split(t).join('❓❓');
      }
    }
    return desc;
  }
}

window.KSool.ProgressionEngine = ProgressionEngine;
