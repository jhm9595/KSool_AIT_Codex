window.KSool = window.KSool || {};

/**
 * K-술 6단계 점포(Map Stage 1~6) 1:1 연동 넘버링(No.01 ~ No.N), 재료 상점(Shop), 및 DAG 선후관계 엔진
 *
 * [핵심 설계]
 * - Stage 1 (길거리 노점): 100% 무알콜 음료·청·빙과류 전용 (술 0종! No.01 ~ No.18)
 *   - 무료 기본 제공 재료(5종): 물(202), 눈(206), 공기(205), 설탕(701), 레몬(301) -> 얼음(중간재료) + 탄산수·사이다·레모네이드·토닉워터(판매음료 4종) 즉시 연구 가능
 *   - 이후 재료는 점포에서 음료를 팔아 번 수익으로 하나씩 구매!
 * - Stage 2 (이모네 포장마차): 소주·맥주·소맥·포차 과일소주/아이스바소주 해금 (No.19 ~ No.37)
 * - Stage 3 (골목 전통 주점): 전통 누룩·막걸리·식혜·과일막걸리·복분자주·홍초/태극주 해금 (No.38 ~ No.55)
 * - Stage 4 (크래프트 비어 펍): [비율 해금: 재료당 최대 2개] 2:1 황금비율 & 비어/에너지 칵테일 (No.56 ~ No.67)
 * - Stage 5 (스카이라인 라운지 바): [고급 황금비율: 최대 10개] 소토닉·만능열쇠 홍차주·황금소맥(3:7)·꿀주·프리미엄 막걸리 (No.68 ~ No.77)
 * - Stage 6 (사이버펑크 미래도시 바): [브랜드·특산 선택기 해금] 테스형라·테진아·카아스처럼·특산 명주 (No.78 ~ No.84)
 */
class ProgressionEngine {
  constructor() {
    this.freeStarterLeafIds = [202, 206, 205, 701, 301]; // 물, 눈, 공기, 설탕, 레몬 (기본 판매 음료 4종: 탄산수·사이다·레모네이드·토닉워터 즉시 연구 가능)

    this.steps = [
      {
        step_id: 1,
        stageId: 'stage_1',
        code: 'STAGE 1',
        title: '길거리 무알콜 노점',
        subtitle: '기초 무알콜 음료(탄산수·사이다·레모네이드·과일우유)를 연구해 첫 창업 자금을 모으세요!',
        maxCountPerSlot: 1,
        maxTotalCount: 4,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 1:1 / 1:1:1 무알콜 기초조합 (재료당 1개)',
        ruleNotice: '길거리 노점에서는 술을 팔지 않습니다. 무알콜 음료와 빙과·청을 연구하고 판매하세요!',
        freeLeafIds: [202, 206, 205, 701, 301],
        shopIngredients: [
          { id: 401, price: 50, unlocksHint: '밀크소다 · 과일우유 · 아이스크림 연구 가능' },
          { id: 307, price: 60, unlocksHint: '딸기우유 · 배배꼬인바 · 상어바 연구 가능' },
          { id: 310, price: 60, unlocksHint: '바나나우유 연구 가능' },
          { id: 309, price: 70, unlocksHint: '배음료 · 배즙보이 연구 가능' },
          { id: 311, price: 70, unlocksHint: '유자청 연구 가능' },
          { id: 304, price: 70, unlocksHint: '매실청 연구 가능' },
          { id: 302, price: 80, unlocksHint: '올때메론바 연구 가능' },
          { id: 306, price: 80, unlocksHint: '배배꼬인바 연구 가능' },
          { id: 315, price: 80, unlocksHint: '상어바 연구 가능' },
          { id: 308, price: 90, unlocksHint: '초콜릿 · 초코우유 연구 가능' },
          { id: 305, price: 90, unlocksHint: '토마토주스 연구 가능' }
        ],
        unlockLeafIds: [202, 206, 205, 701, 301, 401, 307, 310, 309, 311, 304, 302, 306, 315, 308, 305],
        canonicalRecipeOrder: [11, 12, 58, 14, 52, 15, 34, 35, 59, 32, 36, 37, 3, 23, 66, 28, 29, 22] // No.01 ~ No.18 (무알콜 18종)
      },
      {
        step_id: 2,
        stageId: 'stage_2',
        code: 'STAGE 2',
        title: '이모네 포장마차',
        subtitle: '증류용 불(🔥)과 보리(🌾)를 구매해 소주·맥주·소맥과 달콤한 포차 과일소주를 개발하세요!',
        maxCountPerSlot: 1,
        maxTotalCount: 4,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 1:1 / 1:1:1 포차 주류 입문 (재료당 1개)',
        ruleNotice: '드디어 포장마차 개업! 소주와 맥주를 빚어 본격적인 주류 메뉴를 판매할 수 있습니다.',
        freeLeafIds: [],
        shopIngredients: [
          { id: 203, price: 100, unlocksHint: '소주 · 매실주 · 링거주 · 과일/아이스바 소주 연구 가능' },
          { id: 501, price: 110, unlocksHint: '맥주 · 소맥 · 밀크소다주 · 맥사토 연구 가능' },
          { id: 607, price: 120, unlocksHint: '소콜 연구 가능' },
          { id: 312, price: 130, unlocksHint: '깔라만시 원액 · 깔라만시주 연구 가능' },
          { id: 504, price: 140, unlocksHint: '원두 · 아이스 아메리카노 · 소원주 · 조선 깔루아 밀크 연구 가능' },
          { id: 303, price: 150, unlocksHint: '망고비어 연구 가능' }
        ],
        unlockLeafIds: [203, 501, 607, 312, 504, 303],
        canonicalRecipeOrder: [5, 20, 19, 9, 80, 81, 30, 4, 1, 73, 21, 18, 53, 54, 84, 65, 78, 83, 16] // No.19 ~ No.37 (19종)
      },
      {
        step_id: 3,
        stageId: 'stage_3',
        code: 'STAGE 3',
        title: '골목 전통 주점',
        subtitle: '쌀과 누룩으로 전통 막걸리와 식혜를 빚고, 과일 막걸리와 복분자주·태극주를 완성하세요!',
        maxCountPerSlot: 1,
        maxTotalCount: 4,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 1:1 연쇄 전통주 & 막걸리 조합',
        ruleNotice: '조합으로 얻은 막걸리·식초·농축액을 다시 재료로 활용하는 전통 주점 단계입니다!',
        freeLeafIds: [],
        shopIngredients: [
          { id: 502, price: 180, unlocksHint: '누룩 · 막걸리 · 식혜 · 과일막걸리 연구 가능' },
          { id: 616, price: 190, unlocksHint: '요구르트 막걸리 연구 가능' },
          { id: 613, price: 200, unlocksHint: '복숭아 막걸리 연구 가능' },
          { id: 615, price: 200, unlocksHint: '파인애플 막걸리 연구 가능' },
          { id: 313, price: 220, unlocksHint: '복분자주 연구 가능' },
          { id: 314, price: 220, unlocksHint: '석류농축액 · 홍초 · 태극주 연구 가능' },
          { id: 505, price: 240, unlocksHint: '단팥죽 · 단팥바 연구 가능' }
        ],
        unlockLeafIds: [502, 616, 613, 615, 313, 314, 505],
        canonicalRecipeOrder: [25, 26, 60, 42, 38, 44, 46, 62, 61, 48, 45, 47, 57, 63, 64, 77, 85, 67] // No.38 ~ No.55 (18종)
      },
      {
        step_id: 4,
        stageId: 'stage_4',
        code: 'STAGE 4',
        title: '크래프트 비어 펍',
        subtitle: '비율 시스템 해금(재료당 최대 2개)! 2:1 황금비율 폭탄주와 에너지·비어 칵테일을 연구하세요!',
        maxCountPerSlot: 2,
        maxTotalCount: 6,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 비율 해금: 재료당 최대 2개',
        ruleNotice: '이제 같은 재료를 두 번 눌러 [2:1] 황금비율 주류를 조합할 수 있습니다!',
        freeLeafIds: [],
        shopIngredients: [
          { id: 601, price: 280, unlocksHint: '홍차주 · 막사 · 복소사 · 고진감래주 등 2:1 비율 주류 연구 가능' },
          { id: 603, price: 300, unlocksHint: '뽕가리스웨트 연구 가능' },
          { id: 602, price: 320, unlocksHint: '에너자이저주 · 에너지주 연구 가능' }
        ],
        unlockLeafIds: [601, 603, 602],
        canonicalRecipeOrder: [75, 76, 6, 27, 79, 10, 82, 24, 33, 8, 17, 74] // No.56 ~ No.67 (12종)
      },
      {
        step_id: 5,
        stageId: 'stage_5',
        code: 'STAGE 5',
        title: '스카이라인 라운지 바',
        subtitle: '고급 황금비율(최대 10개) 해금! 소토닉·만능열쇠 홍차주·황금소맥(3:7)·꿀주와 라운지 칵테일을 완성하세요!',
        maxCountPerSlot: 10,
        maxTotalCount: 10,
        allowDetailPicker: false,
        ruleBadge: '⚖️ 고급 황금비율: 최대 10개',
        ruleNotice: '최대 10개 비율 조절이 해금되었습니다! 3:7 황금소맥, 9:1 꿀주 등 정교한 비율에 도전하세요.',
        freeLeafIds: [],
        shopIngredients: [
          { id: 705, price: 450, unlocksHint: '꿀 막걸리 · 꿀 미숫가루 막걸리 및 고급 비율 칵테일 연구 가능' }
        ],
        unlockLeafIds: [705],
        canonicalRecipeOrder: [51, 7, 31, 2, 39, 43, 49, 50, 40, 41] // No.68 ~ No.77 (10종)
      },
      {
        step_id: 6,
        stageId: 'stage_6',
        code: 'STAGE 6',
        title: '사이버펑크 미래도시 바',
        subtitle: '브랜드·특산 상세재료 해금! 테스형라·테진아·카아스처럼과 전국 특산 명주를 모두 마스터하세요!',
        maxCountPerSlot: 10,
        maxTotalCount: 10,
        allowDetailPicker: true,
        ruleBadge: '👑 마스터: 브랜드·특산 상세재료 해금',
        ruleNotice: '재료를 길게(또는 상세버튼으로) 눌러 특정 브랜드·특산 재료를 지정하는 최종 단계입니다!',
        freeLeafIds: [],
        shopIngredients: [],
        unlockLeafIds: [],
        canonicalRecipeOrder: [68, 69, 70, 71, 72, 55, 56] // No.78 ~ No.84 (7종)
      }
    ];
  }

  static getShopIngredientsForStage(stepId) {
    const inst = new ProgressionEngine();
    return inst.getShopIngredientsForStep(stepId);
  }

  getStepConfig(stepId) {
    const id = Math.max(1, Math.min(this.steps.length, Number(stepId) || 1));
    return this.steps.find(s => s.step_id === id) || this.steps[0];
  }

  getStepConfigByStageId(stageId) {
    return this.steps.find(s => s.stageId === stageId) || this.steps[0];
  }

  getAllSteps() {
    return this.steps;
  }

  /**
   * 모든 상점 판매 재료 메타데이터 조회 (id -> { id, price, unlocksHint, step_id, stageId })
   */
  getAllShopIngredientsMap() {
    const map = new Map();
    for (const step of this.steps) {
      for (const item of (step.shopIngredients || [])) {
        map.set(Number(item.id), {
          ...item,
          id: Number(item.id),
          step_id: step.step_id,
          stageId: step.stageId
        });
      }
    }
    return map;
  }

  /**
   * 특정 단계(step_id)에서 구매해야 하는 상점 재료 목록 반환
   */
  getShopIngredientsForStep(stepId) {
    const cfg = this.getStepConfig(stepId);
    return cfg ? (cfg.shopIngredients || []) : [];
  }

  /**
   * 레시피북이 로드될 때 전체 레시피에 대해
   * 난이도(difficulty), 소속 단계(step_id: 1~6), 도감/연구 넘버링(recipe_number: 1~N, formatted_number: No.01~No.N)을
   * 데이터 및 DAG 의존성 기반으로 자동 계산·부여합니다.
   */
  applyProgressionToRecipeBook(recipeBook) {
    if (!recipeBook) return;

    const leafUnlockStepByIngId = new Map();
    for (const step of this.steps) {
      for (const ingId of step.unlockLeafIds) {
        leafUnlockStepByIngId.set(Number(ingId), step.step_id);
      }
    }

    const canonicalStepByRecipeId = new Map();
    const canonicalOrderByRecipeId = new Map();
    for (const step of this.steps) {
      step.canonicalRecipeOrder.forEach((rId, idx) => {
        canonicalStepByRecipeId.set(Number(rId), step.step_id);
        canonicalOrderByRecipeId.set(Number(rId), idx + 1);
      });
    }

    const allRecipes = recipeBook.getAllRecipes();

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

      if (hasDetail) {
        rec.difficulty = 'MASTER';
        rec.requires_detail_ingredient = true;
      } else if (maxRatio === 1) {
        rec.difficulty = 'EASY';
      } else {
        rec.difficulty = 'NORMAL';
      }

      if (canonicalStepByRecipeId.has(rId)) {
        rec.step_id = canonicalStepByRecipeId.get(rId);
        rec.step_order = canonicalOrderByRecipeId.get(rId);
      } else if (rec.step_id && Number(rec.step_id) >= 1 && Number(rec.step_id) <= this.steps.length) {
        rec.step_id = Number(rec.step_id);
        rec.step_order = Number(rec.step_order) || 999;
      } else {
        rec.step_id = this._inferStepForNewRecipe(rec, items, leafUnlockStepByIngId, recipeBook);
        rec.step_order = Number(rec.step_order) || 500 + rId;
      }

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

    for (const [ingId] of recipeBook.baseIngredients.entries()) {
      if (recipeBook.isLeafIngredient(ingId) && !leafUnlockStepByIngId.has(Number(ingId))) {
        leafUnlockStepByIngId.set(Number(ingId), 3);
        this.getStepConfig(3).unlockLeafIds.push(Number(ingId));
      }
    }

    // 의존성(DAG) 기반 step_id 하한 보정:
    // 하위 재료(기초 재료 또는 선행 조합 재료)가 해금되는 Step보다 빠른 Step에 배정될 수 없도록 보장
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

    // 동일 Step 내부에서도 선행 조합 재료(producer)가 반드시 앞 번호(No.XX)를 받도록 위상 정렬 보정
    const sorted = [];
    for (const step of this.steps) {
      const stepRecs = allRecipes
        .filter(r => r.step_id === step.step_id)
        .sort((a, b) => {
          if ((a.step_order || 999) !== (b.step_order || 999)) {
            return (a.step_order || 999) - (b.step_order || 999);
          }
          if (a.item_count !== b.item_count) return a.item_count - b.item_count;
          if (a.max_ratio !== b.max_ratio) return a.max_ratio - b.max_ratio;
          return a.recipe_id - b.recipe_id;
        });

      const placedIds = new Set(sorted.map(r => Number(r.recipe_id)));
      const remaining = [...stepRecs];
      let loopGuard = 0;
      while (remaining.length > 0 && loopGuard < 200) {
        loopGuard++;
        let pickedIdx = remaining.findIndex(cand => {
          const items = recipeBook.getRecipeItems(cand.recipe_id);
          return items.every(it => {
            const ingId = Number(it.ingredient_id);
            if (recipeBook.isLeafIngredient(ingId)) return true;
            const producers = recipeBook.producerRecipesByIngId.get(ingId) || [];
            return producers.length === 0 || producers.some(pId => placedIds.has(Number(pId)));
          });
        });
        if (pickedIdx === -1) pickedIdx = 0;
        const [picked] = remaining.splice(pickedIdx, 1);
        sorted.push(picked);
        placedIds.add(Number(picked.recipe_id));
      }
    }

    sorted.forEach((rec, idx) => {
      rec.recipe_number = idx + 1;
      rec.formatted_number = `No.${String(idx + 1).padStart(2, '0')}`;
    });

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

  /**
   * 신규 레시피가 추가되었을 때 알코올 포함 여부·재료 해금 단계·비율·특산 재료 여부에 따라
   * 가장 적합한 Stage(1~6)를 자동 산출합니다.
   */
  _inferStepForNewRecipe(rec, items, leafUnlockStepByIngId, recipeBook = null) {
    const maxRatio = rec.max_ratio || 1;
    const hasDetail = Boolean(rec.requires_detail_ingredient || items.some(i => Boolean(i.detail_ingredient_id)));

    // 1. 브랜드/특산 상세재료 사용 시 무조건 Stage 6 (미래도시 바)
    if (hasDetail) return 6;
    // 2. 비율이 3 이상이면 Stage 5 (스카이라인 라운지 바)
    if (maxRatio >= 3) return 5;
    // 3. 비율이 2이면 Stage 4 (크래프트 비어 펍)
    if (maxRatio === 2) return 4;

    // 4. 1:1 / 1:1:1 조합인 경우: 알코올/불 포함 여부 및 하위 재료 단계 확인
    let maxDepStep = 1;
    let usesAlcoholOrFire = false;
    let usesMakgeolliOrRice = false;

    for (const it of items) {
      const ingId = Number(it.ingredient_id);
      if (ingId === 203 || ingId === 101 || ingId === 102 || ingId === 103 || ingId === 104 || ingId === 105) {
        usesAlcoholOrFire = true;
      }
      if (ingId === 502 || ingId === 702 || ingId === 105 || ingId === 103) {
        usesMakgeolliOrRice = true;
      }
      const s = leafUnlockStepByIngId.get(ingId) || 1;
      if (s > maxDepStep) maxDepStep = s;
      if (recipeBook && !recipeBook.isLeafIngredient(ingId)) {
        const producers = recipeBook.producerRecipesByIngId.get(ingId) || [];
        for (const pId of producers) {
          const pRec = recipeBook.getRecipe(pId);
          if (pRec && pRec.step_id > maxDepStep) {
            maxDepStep = pRec.step_id;
          }
        }
      }
    }

    if (usesMakgeolliOrRice) return Math.max(3, maxDepStep);
    if (usesAlcoholOrFire) return Math.max(2, maxDepStep);
    return Math.max(1, maxDepStep);
  }

  /**
   * [개발자용 신규 음료/주류 배치 추천 알고리즘]
   * 새로운 레시피 초안을 전달하면 어느 점포(Stage 1~6)와 어느 번호대에 넣어야 하는지,
   * 선행 조건은 무엇인지 즉시 분석해 반환합니다.
   *
   * 사용 예시:
   *   window.KSool.app.recipeBook.progression.recommendStageForNewRecipe({
   *     name: '피치 하이볼',
   *     ingredients: [{ id: 101, ratio: 1 }, { id: 618, ratio: 2 }, { id: 613, ratio: 1 }]
   *   }, window.KSool.app.recipeBook)
   */
  recommendStageForNewRecipe(draft, recipeBook) {
    const items = (draft.ingredients || []).map((it, idx) => ({
      ingredient_id: Number(it.id || it.ingredient_id),
      detail_ingredient_id: it.detailId || it.detail_ingredient_id || null,
      ratio: Number(it.ratio) || 1,
      slot_order: idx + 1
    }));
    const maxRatio = items.length > 0 ? Math.max(...items.map(i => i.ratio)) : 1;
    const hasDetail = items.some(i => Boolean(i.detail_ingredient_id));
    const mockRec = {
      display_name: draft.name || '신규 레시피',
      max_ratio: maxRatio,
      requires_detail_ingredient: hasDetail
    };

    const stepId = this._inferStepForNewRecipe(mockRec, items, this.leafUnlockStepByIngId || new Map(), recipeBook);
    const stepCfg = this.getStepConfig(stepId);
    return {
      recommendedStepId: stepId,
      recommendedStageId: stepCfg.stageId,
      stageTitle: stepCfg.title,
      numberRange: `No.${String(stepCfg.startNumber || 1).padStart(2, '0')} ~ No.${String((stepCfg.endNumber || 84) + 1).padStart(2, '0')}`,
      suggestedPosition: `Stage ${stepId} (${stepCfg.title}) 말미 (No.${String((stepCfg.endNumber || 84) + 1).padStart(2, '0')})`,
      reason: hasDetail
        ? '특산/브랜드 상세재료가 포함되어 Stage 6(사이버펑크 미래도시 바)에 배정됩니다.'
        : maxRatio >= 3
          ? `최대 비율이 ${maxRatio}개이므로 고급 비율이 해금되는 Stage 5(스카이라인 라운지 바)에 배정됩니다.`
          : maxRatio === 2
            ? '최대 비율이 2개(2:1 등)이므로 비율 입문 단계인 Stage 4(크래프트 비어 펍)에 배정됩니다.'
            : stepId === 1
              ? '알코올과 불이 쓰이지 않는 순수 1:1/1:1:1 무알콜 조합이므로 Stage 1(길거리 노점)에 배정됩니다.'
              : stepId === 2
                ? '소주·맥주·불 기반의 1:1/1:1:1 기초 주류이므로 Stage 2(이모네 포장마차)에 배정됩니다.'
                : '전통주(막걸리·복분자·식초) 또는 Stage 3 재료가 포함되어 Stage 3(골목 전통 주점)에 배정됩니다.'
    };
  }

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
