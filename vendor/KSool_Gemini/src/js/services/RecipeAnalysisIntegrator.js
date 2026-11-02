window.KSool = window.KSool || {};

/**
 * RecipeAnalysisIntegrator
 * - 신규 조합법의 선행 의존성(DAG) 및 최소 안전 번호(minSafeNumber) 정밀 분석
 * - 신규 재료 추가 시점 및 비율 기반 난이도(EASY/NORMAL/HARD/MASTER), 권장 Step 산출
 * - 스마트 번호 밀림(Auto Shift): 타겟 번호 이후의 모든 레시피 번호를 1씩 증가시키고 신규 레시피 삽입
 * - 16x16 도트 파싱, 실루엣 알파 마스크, 3종 미니게임(벽돌깨기, 땅따먹기, 네모로직) 단서/외곽선 실시간 연산
 */
class RecipeAnalysisIntegrator {
  /**
   * 추천 조합 객체를 심층 분석하여 선행 의존성, 최소 번호, 난이도, 권장 Step 리포트를 생성합니다.
   * @param {object} suggestion - { suggestion_key, items: [{ ingredient_id, detail_id, ratio }], upvotes, downvotes }
   * @param {RecipeBook} recipeBook
   * @param {BrandResolver} brandResolver
   * @returns {object} 분석 리포트
   */
  static analyzeCandidate(suggestion, recipeBook, brandResolver) {
    if (!suggestion || !suggestion.items || !recipeBook) {
      throw new Error('Invalid arguments for analyzeCandidate');
    }

    const progression = recipeBook.progression;
    const allRecipes = recipeBook.getAllRecipes();
    const totalRecipes = allRecipes.length;

    // 1. 각 재료별 의존성 및 최소 요구 번호 분석
    const candidateItems = suggestion.items.map(it => {
      const ingId = Number(it.ingredient_id);
      const detId = it.detail_id ? Number(it.detail_id) : null;
      const base = recipeBook.getBaseIngredient(ingId);
      const det = detId ? recipeBook.getDetailIngredient(detId) : null;
      const target = det || base;
      const name = target ? brandResolver.resolveName(target) : `재료#${ingId}`;
      const emoji = target ? target.emoji : '🍶';
      const isLeaf = recipeBook.isLeafIngredient(ingId);
      const isDetail = Boolean(detId);

      let minRequiredNumber = 1;
      let minRequiredStep = 1;
      let reason = '';
      let producers = [];
      let isNewIngredient = false;

      if (isLeaf) {
        // 리프(기초) 재료는 해당 재료가 최초 해금되는 Step의 시작 번호 필요
        const stepId = progression.leafUnlockStepByIngId?.get(ingId) || 1;
        const stepConfig = progression.getStepConfig(stepId);
        minRequiredStep = stepId;
        minRequiredNumber = stepConfig ? (stepConfig.startNumber || 1) : 1;
        reason = `기초 재료 (STEP ${stepId} 시작 No.${minRequiredNumber} 이후)`;
      } else {
        // 조합으로 생성되는 중간/완성 재료
        const prodRecipeIds = recipeBook.producerRecipesByIngId.get(ingId) || [];
        if (prodRecipeIds.length === 0) {
          isNewIngredient = true;
          minRequiredNumber = 1;
          minRequiredStep = 1;
          reason = `⚠️ 신규 재료: 도감에 이 재료를 생산하는 선행 레시피가 없습니다.`;
        } else {
          producers = prodRecipeIds.map(pId => recipeBook.getRecipe(pId)).filter(Boolean);
          const maxProdNum = Math.max(...producers.map(p => p.recipe_number || p.recipe_id || 1));
          const prodSteps = producers.map(p => p.step_id || 1);
          minRequiredStep = Math.max(...prodSteps);
          // 선행 재료가 만들어진 '바로 다음 번호' 이후여야 함
          minRequiredNumber = maxProdNum + 1;
          const prodNames = producers.map(p => `${p.display_name}(${p.formatted_number})`).join(', ');
          reason = `선행 조합 [${prodNames}] 완료 후 해금 (최소 No.${minRequiredNumber} 필요)`;
        }
      }

      return {
        ingredient_id: ingId,
        detail_id: detId,
        target: target,
        ratio: Number(it.ratio) || 1,
        name,
        emoji,
        isLeaf,
        isDetail,
        isNewIngredient,
        minRequiredNumber,
        minRequiredStep,
        reason,
        producers
      };
    });

    // 2. 전체 조합의 절대적 최소 안전 번호(minSafeNumber) 및 선행 제약자 도출
    let minSafeNumber = 1;
    let minPrereqStep = 1;
    let bottleneckItem = null;

    for (const item of candidateItems) {
      if (item.minRequiredNumber > minSafeNumber) {
        minSafeNumber = item.minRequiredNumber;
        bottleneckItem = item;
      }
      if (item.minRequiredStep > minPrereqStep) {
        minPrereqStep = item.minRequiredStep;
      }
    }

    // 3. 비율 및 구성에 따른 난이도 & 권장 Step 계산
    const ratios = candidateItems.map(i => i.ratio);
    const maxRatio = Math.max(...ratios);
    const sumRatio = ratios.reduce((a, b) => a + b, 0);
    const itemCount = candidateItems.length;
    const hasDetail = candidateItems.some(i => i.isDetail);

    let difficulty = 'NORMAL';
    let baseRecommendedStep = 5;

    if (hasDetail) {
      difficulty = 'MASTER';
      baseRecommendedStep = 7;
    } else if (maxRatio >= 4) {
      difficulty = 'HARD';
      baseRecommendedStep = 7;
    } else if (maxRatio === 3) {
      difficulty = 'NORMAL';
      baseRecommendedStep = 6;
    } else if (maxRatio === 2) {
      difficulty = 'NORMAL';
      baseRecommendedStep = 5;
    } else {
      // 1:1 동등 비율
      difficulty = 'EASY';
      baseRecommendedStep = itemCount >= 3 ? 3 : 1;
    }

    // 선행 재료 제약과 비율 난이도 중 더 높은 단계 채택
    const finalStep = Math.max(baseRecommendedStep, minPrereqStep);
    const stepConfig = progression.getStepConfig(finalStep);

    // 4. "가능한 번호 중에 가장 나중 번호" 산출:
    // 해당 Step의 가장 마지막 레시피 번호 + 1 위치 (단, minSafeNumber 이상이어야 함)
    let suggestedTargetNumber = totalRecipes + 1;
    if (stepConfig && stepConfig.endNumber > 0) {
      suggestedTargetNumber = Math.min(totalRecipes + 1, Math.max(minSafeNumber, stepConfig.endNumber + 1));
    } else {
      suggestedTargetNumber = Math.max(minSafeNumber, totalRecipes + 1);
    }

    // 번호 밀림(Shift) 영향도 계산: targetNumber ~ totalRecipes 구간의 레시피 수
    const shiftCount = Math.max(0, totalRecipes - suggestedTargetNumber + 1);

    // 기본 추천 레시피 명칭
    const topNames = candidateItems.slice(0, 2).map(i => i.name).join('·');
    const defaultRecipeName = `${topNames} 꿀조합`;

    // 신규 재료 경고 목록
    const newIngredients = candidateItems.filter(i => i.isNewIngredient);

    return {
      candidateItems,
      minSafeNumber,
      minPrereqStep,
      bottleneckItem,
      itemCount,
      maxRatio,
      sumRatio,
      hasDetail,
      difficulty,
      recommendedStep: finalStep,
      stepConfig,
      totalRecipes,
      suggestedTargetNumber,
      shiftCount,
      defaultRecipeName,
      newIngredients,
      hasNewIngredients: newIngredients.length > 0
    };
  }

  /**
   * 16x16 SVG <rect> 요소를 파싱하여 그리드, 활성 픽셀 좌표, 바운딩 박스를 추출합니다.
   * @param {string} innerSvg
   * @returns {object} { grid, activePixels, minR, maxR, minC, maxC, width, height }
   */
  static parseDotSvg(innerSvg) {
    const grid = Array.from({ length: 16 }, () => Array(16).fill(null));
    if (!innerSvg || typeof innerSvg !== 'string') {
      return this._createFallbackDotInfo();
    }

    const rectRegex = /<rect\s+([^>]+)\/?>/g;
    let match;
    let found = false;

    while ((match = rectRegex.exec(innerSvg)) !== null) {
      const attrs = match[1];
      const xMatch = attrs.match(/x="([^"]+)"/);
      const yMatch = attrs.match(/y="([^"]+)"/);
      const wMatch = attrs.match(/width="([^"]+)"/);
      const hMatch = attrs.match(/height="([^"]+)"/);
      const fMatch = attrs.match(/fill="([^"]+)"/);
      if (!xMatch || !yMatch || !wMatch || !hMatch || !fMatch) continue;

      const x = parseInt(xMatch[1], 10);
      const y = parseInt(yMatch[1], 10);
      const w = parseInt(wMatch[1], 10);
      const h = parseInt(hMatch[1], 10);
      const fill = fMatch[1];

      for (let r = y; r < y + h; r++) {
        for (let c = x; c < x + w; c++) {
          if (r >= 0 && r < 16 && c >= 0 && c < 16) {
            grid[r][c] = fill;
            found = true;
          }
        }
      }
    }

    if (!found) {
      return this._createFallbackDotInfo();
    }

    const activePixels = [];
    let minR = 16, maxR = -1, minC = 16, maxC = -1;

    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        if (grid[r][c]) {
          activePixels.push({ r, c, color: grid[r][c] });
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    return {
      grid,
      activePixels,
      minR: minR === 16 ? 0 : minR,
      maxR: maxR === -1 ? 15 : maxR,
      minC: minC === 16 ? 0 : minC,
      maxC: maxC === -1 ? 15 : maxC,
      boxWidth: (maxC >= minC) ? (maxC - minC + 1) : 16,
      boxHeight: (maxR >= minR) ? (maxR - minR + 1) : 16
    };
  }

  static _createFallbackDotInfo() {
    // 16x16 글래스 실루엣 폴백
    const grid = Array.from({ length: 16 }, () => Array(16).fill(null));
    for (let r = 4; r <= 12; r++) {
      for (let c = 5; c <= 10; c++) {
        grid[r][c] = '#f59e0b';
      }
    }
    const activePixels = [];
    for (let r = 4; r <= 12; r++) {
      for (let c = 5; c <= 10; c++) {
        activePixels.push({ r, c, color: '#f59e0b' });
      }
    }
    return {
      grid,
      activePixels,
      minR: 4,
      maxR: 12,
      minC: 5,
      maxC: 10,
      boxWidth: 6,
      boxHeight: 9
    };
  }

  /**
   * 미니게임 1: 벽돌깨기(Breakout) 블록 레이아웃 및 강철 블록 계산
   * @param {object} dotInfo
   * @returns {object} { blocks, totalBreakable, steelCount, stageW, stageH }
   */
  static calcBreakoutBlocks(dotInfo) {
    const cols = 16;
    const rows = 16;
    const bw = 20;
    const bh = 13;
    const gapX = 2;
    const gapY = 2;
    const pitchX = bw + gapX;
    const pitchY = bh + gapY;
    const stageW = cols * pitchX - gapX; // 350px
    const stageH = rows * pitchY - gapY; // 238px
    const padX = 35;
    const topY = 44;

    const centerC = Math.round((dotInfo.minC + dotInfo.maxC) / 2);
    const shoulderR = dotInfo.minR + Math.floor((dotInfo.maxR - dotInfo.minR) * 0.35);

    const steelCoords = new Set();
    for (const p of dotInfo.activePixels) {
      if (p.r === dotInfo.minR && (p.c === centerC || p.c === centerC - 1)) {
        steelCoords.add(`${p.r},${p.c}`);
        if (steelCoords.size >= 2) break;
      }
    }
    for (const p of dotInfo.activePixels) {
      if (p.r === shoulderR && (p.c === dotInfo.minC || p.c === dotInfo.maxC)) {
        steelCoords.add(`${p.r},${p.c}`);
        if (steelCoords.size >= 4) break;
      }
    }

    const blocks = [];
    let totalBreakable = 0;
    let steelCount = 0;

    for (const p of dotInfo.activePixels) {
      const isSteel = steelCoords.has(`${p.r},${p.c}`);
      if (isSteel) steelCount++;
      else totalBreakable++;

      blocks.push({
        r: p.r,
        c: p.c,
        x: padX + p.c * pitchX,
        y: topY + p.r * pitchY,
        w: bw,
        h: bh,
        color: p.color,
        isSteel
      });
    }

    return {
      blocks,
      totalBreakable,
      steelCount,
      stageW,
      stageH,
      padX,
      topY
    };
  }

  /**
   * 미니게임 2: 땅따먹기(Qix) 실루엣 팽창 마스크 및 네온 외곽선 엣지 계산
   * @param {object} dotInfo
   * @returns {object} { edges, totalSilhouetteCells, cols, rows }
   */
  static calcTerritoryEdges(dotInfo, cols = 52, rows = 52) {
    const artSize = 32;
    const startC = Math.floor((cols - artSize) / 2); // 10
    const startR = Math.floor((rows - artSize) / 2); // 10
    const cellW = 420 / cols;
    const cellH = (440 - 32) / rows;
    const topOffset = 32;

    const rawMask = Array.from({ length: rows }, () => new Uint8Array(cols));
    // 16x16 도트를 32x32 영역(2x 스케일)으로 매핑
    for (const p of dotInfo.activePixels) {
      const r1 = startR + p.r * 2;
      const c1 = startC + p.c * 2;
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const nr = r1 + dr;
          const nc = c1 + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            rawMask[nr][nc] = 1;
          }
        }
      }
    }

    // 1셀 팽창(Dilation)
    const dilatedMask = Array.from({ length: rows }, () => new Uint8Array(cols));
    let totalSilhouetteCells = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rawMask[r][c]) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 1 && nr < rows - 1 && nc >= 1 && nc < cols - 1) {
                if (!dilatedMask[nr][nc]) {
                  dilatedMask[nr][nc] = 1;
                  totalSilhouetteCells++;
                }
              }
            }
          }
        }
      }
    }

    // 외곽선 세그먼트 추출
    const edges = [];
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (dilatedMask[r][c]) {
          // 상단 경계
          if (!dilatedMask[r - 1][c]) {
            edges.push({
              x1: c * cellW,
              y1: topOffset + r * cellH,
              x2: (c + 1) * cellW,
              y2: topOffset + r * cellH
            });
          }
          // 하단 경계
          if (!dilatedMask[r + 1][c]) {
            edges.push({
              x1: c * cellW,
              y1: topOffset + (r + 1) * cellH,
              x2: (c + 1) * cellW,
              y2: topOffset + (r + 1) * cellH
            });
          }
          // 좌측 경계
          if (!dilatedMask[r][c - 1]) {
            edges.push({
              x1: c * cellW,
              y1: topOffset + r * cellH,
              x2: c * cellW,
              y2: topOffset + (r + 1) * cellH
            });
          }
          // 우측 경계
          if (!dilatedMask[r][c + 1]) {
            edges.push({
              x1: (c + 1) * cellW,
              y1: topOffset + r * cellH,
              x2: (c + 1) * cellW,
              y2: topOffset + (r + 1) * cellH
            });
          }
        }
      }
    }

    return {
      edges,
      totalSilhouetteCells,
      cols,
      rows,
      cellW,
      cellH,
      topOffset,
      dilatedMask
    };
  }

  /**
   * 미니게임 3: 네모네모 로직(Nonogram) 가로/세로 숫자 단서 계산
   * @param {object} dotInfo
   * @returns {object} { rows, cols, rowClues, colClues, targetGrid, totalTargetFilled }
   */
  static calcNonogramClues(dotInfo) {
    const minR = dotInfo.minR;
    const maxR = dotInfo.maxR;
    const minC = dotInfo.minC;
    const maxC = dotInfo.maxC;

    const rows = maxR - minR + 1;
    const cols = maxC - minC + 1;

    const targetGrid = Array.from({ length: rows }, () => Array(cols).fill(false));
    const targetColors = Array.from({ length: rows }, () => Array(cols).fill(null));
    let totalTargetFilled = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = dotInfo.grid[minR + r][minC + c];
        if (color) {
          targetGrid[r][c] = true;
          targetColors[r][c] = color;
          totalTargetFilled++;
        }
      }
    }

    // Row Clues (가로 숫자)
    const rowClues = [];
    for (let r = 0; r < rows; r++) {
      const clues = [];
      let count = 0;
      for (let c = 0; c < cols; c++) {
        if (targetGrid[r][c]) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      if (count > 0) clues.push(count);
      if (clues.length === 0) clues.push(0);
      rowClues.push(clues);
    }

    // Col Clues (세로 숫자)
    const colClues = [];
    for (let c = 0; c < cols; c++) {
      const clues = [];
      let count = 0;
      for (let r = 0; r < rows; r++) {
        if (targetGrid[r][c]) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      if (count > 0) clues.push(count);
      if (clues.length === 0) clues.push(0);
      colClues.push(clues);
    }

    return {
      rows,
      cols,
      rowClues,
      colClues,
      targetGrid,
      targetColors,
      totalTargetFilled,
      minR,
      minC
    };
  }

  /**
   * 재료 색상을 감안하여 16x16 레트로 도트 칵테일 잔 SVG innerSvg를 자동 생성합니다.
   * @param {Array<object>} candidateItems
   * @returns {string} innerSvg 문자열
   */
  static generateDefaultDotSvg(candidateItems = []) {
    // 재료별 테마 색상 추정
    const colorMap = {
      101: '#22c55e', // 소주 초록
      102: '#f59e0b', // 맥주 골드
      103: '#d97706', // 위스키 호박색
      105: '#f8fafc', // 막걸리 우윳빛
      201: '#7dd3fc', // 얼음 하늘색
      202: '#38bdf8', // 물 파랑
      601: '#e11d48', // 홍차 루비
      602: '#10b981', // 에너지드링크 네온그린
      606: '#fb923c', // 토닉워터 오렌지
      607: '#451a03', // 콜라 갈색
      701: '#ffffff', // 설탕 백색
      705: '#fbbf24'  // 꿀 황금색
    };

    let liquidColor1 = '#f59e0b';
    let liquidColor2 = '#fbbf24';

    if (candidateItems.length > 0) {
      const id0 = candidateItems[0].ingredient_id;
      const id1 = candidateItems[1] ? candidateItems[1].ingredient_id : id0;
      if (colorMap[id0]) liquidColor1 = colorMap[id0];
      if (colorMap[id1]) liquidColor2 = colorMap[id1];
      else liquidColor2 = liquidColor1;
    }

    // 16x16 칵테일/온더락 글래스 아트워크
    return `
<rect x="4" y="3" width="8" height="1" fill="#e2e8f0"/>
<rect x="3" y="4" width="1" height="8" fill="#cbd5e1"/>
<rect x="12" y="4" width="1" height="8" fill="#cbd5e1"/>
<rect x="4" y="12" width="8" height="1" fill="#94a3b8"/>
<rect x="5" y="13" width="6" height="1" fill="#64748b"/>
<rect x="6" y="14" width="4" height="2" fill="#cbd5e1"/>
<rect x="4" y="15" width="8" height="1" fill="#94a3b8"/>
<rect x="5" y="4" width="3" height="3" fill="#ffffff" opacity="0.8"/>
<rect x="9" y="4" width="2" height="2" fill="#7dd3fc"/>
<rect x="4" y="7" width="8" height="3" fill="${liquidColor1}"/>
<rect x="4" y="10" width="8" height="2" fill="${liquidColor2}"/>
<rect x="10" y="2" width="2" height="2" fill="#ef4444"/>
<rect x="11" y="1" width="1" height="1" fill="#15803d"/>
    `.trim().replace(/\n/g, '');
  }

  /**
   * 관리자의 스마트 등록 실행:
   * 1. targetNumber 이상의 모든 레시피를 +1씩 shift (번호 밀림)
   * 2. targetNumber 위치에 신규 레시피 공식 등록
   * 3. PixelIconRegistry에 도트/HD 아이콘 등록
   * 4. RecipeBook 의존성 그래프 및 ProgressionEngine 메타데이터 갱신
   * 5. InventoryManager 및 SuggestionService 상태 동기화
   * @returns {object} { ok, recipe, targetNumber, shiftCount }
   */
  static executeSmartPromotion({
    suggestion,
    targetNumber,
    recipeName,
    customDotSvg,
    customHdSvg,
    recipeBook,
    inventoryManager,
    suggestionService,
    brandResolver
  }) {
    if (!suggestion || !recipeBook || !inventoryManager || !suggestionService) {
      throw new Error('Required dependencies missing for executeSmartPromotion');
    }

    const analysis = this.analyzeCandidate(suggestion, recipeBook, brandResolver);
    const targetNum = parseInt(targetNumber, 10);

    if (isNaN(targetNum) || targetNum < analysis.minSafeNumber) {
      throw new Error(`배치 불가 번호: 최소 No.${analysis.minSafeNumber} 이후여야 합니다.`);
    }

    const allRecipes = recipeBook.getAllRecipes();
    const totalCount = allRecipes.length;

    // 1. targetNum 이상의 기존 레시피 번호들을 1씩 뒤로 밀림 (+1 Shift)
    // 번호 충돌 방지를 위해 역순(큰 번호부터)으로 순회 정렬
    const recipesToShift = allRecipes
      .filter(r => (r.recipe_number || r.recipe_id) >= targetNum)
      .sort((a, b) => (b.recipe_number || b.recipe_id) - (a.recipe_number || a.recipe_id));

    recipesToShift.forEach(r => {
      r.recipe_number = (r.recipe_number || r.recipe_id) + 1;
      r.formatted_number = `No.${String(r.recipe_number).padStart(2, '0')}`;
    });

    // 2. 신규 레시피 ID 및 메타데이터 생성
    const newRecipeId = Math.max(0, ...Array.from(recipeBook.recipes.keys())) + 1;
    const finalName = (recipeName && recipeName.trim()) ? recipeName.trim() : analysis.defaultRecipeName;
    const finalStep = analysis.recommendedStep;

    const newRecipe = {
      recipe_id: newRecipeId,
      recipe_number: targetNum,
      formatted_number: `No.${String(targetNum).padStart(2, '0')}`,
      display_name: finalName,
      real_name: finalName,
      is_licensed: false,
      difficulty: analysis.difficulty,
      required_level: finalStep,
      step_id: finalStep,
      requires_detail_ingredient: analysis.hasDetail,
      emoji: '🥂',
      category: '유저추천꿀조합',
      unlocks_ingredient_id: null,
      unlock_hint: `${analysis.difficulty} 난이도의 특별 조합입니다. 재료들의 황금비율을 찾아보세요!`,
      description: `유저 추천(👍 ${suggestion.upvotes})에서 관리자 스마트 승인된 공식 편입 꿀조합! (${`No.${String(targetNum).padStart(2, '0')}`})`
    };

    const newItems = suggestion.items.map((it, idx) => ({
      id: Date.now() + idx,
      recipe_id: newRecipeId,
      slot_order: idx + 1,
      ingredient_id: Number(it.ingredient_id),
      detail_ingredient_id: it.detail_id ? Number(it.detail_id) : null,
      ratio: Number(it.ratio) || 1
    }));

    // 3. RecipeBook에 등록
    recipeBook.recipes.set(newRecipeId, newRecipe);
    recipeBook.recipeItemsByRecipeId.set(newRecipeId, newItems);

    // 4. PixelIconRegistry에 커스텀 스프라이트 동적 등록
    const dotSvgToUse = customDotSvg || this.generateDefaultDotSvg(analysis.candidateItems);
    const spriteKey = `rec_${newRecipeId}`;
    newRecipe.key = spriteKey;

    if (window.KSool.PixelIconRegistry?.registerCustomSprite) {
      window.KSool.PixelIconRegistry.registerCustomSprite({
        key: spriteKey,
        name: finalName,
        dotInnerSvg: dotSvgToUse,
        hdInnerSvg: customHdSvg || null,
        aliases: [newRecipeId, finalName, `rec_${newRecipeId}`]
      });
    }

    // 5. 의존성 그래프 및 ProgressionEngine 재동기화
    recipeBook._buildIngredientDependencyGraph();
    recipeBook.progression.applyProgressionToRecipeBook(recipeBook);

    // 6. 인벤토리 및 추천 서비스에 반영
    inventoryManager.promotedCustomRecipes.push({
      recipe: newRecipe,
      items: newItems,
      dotInnerSvg: dotSvgToUse,
      hdInnerSvg: customHdSvg || null
    });
    inventoryManager.unlockRecipe(newRecipeId);
    inventoryManager.save();

    suggestion.is_applied = true;
    suggestionService._save();
    suggestionService._syncRemoteApply(suggestion.suggestion_key);

    return {
      ok: true,
      recipe: newRecipe,
      targetNumber: targetNum,
      shiftedCount: recipesToShift.length
    };
  }
}

window.KSool.RecipeAnalysisIntegrator = RecipeAnalysisIntegrator;
