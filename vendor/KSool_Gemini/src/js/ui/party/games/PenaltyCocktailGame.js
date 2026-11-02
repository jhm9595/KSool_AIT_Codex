window.KSool = window.KSool || {};

/**
 * ⑥ 랜덤 벌칙주 제조기 (PenaltyCocktailGame)
 * - 유저가 해금한 주류(ALCOHOL)와 음료(DRINK) 재료 중 현재 술자리 테이블에 있는 재료들을 선택.
 * - 소주잔(50ml) vs 글라스(250ml) 잔 선택 지원.
 * - '벌칙주 만들기'를 누르면 선택한 재료 중 무작위 개수와 비율로 세상에 단 하나뿐인 벌칙주를 즉석 조제!
 */
class PenaltyCocktailGame {
  constructor(hub) {
    this.hub = hub;
    this.selectedGlass = 'soju'; // 'soju' | 'glass'
    this.selectedIngIds = new Set();
    this.state = 'select'; // 'select' | 'mixing' | 'result'
    this.lastResult = null;
    this.mixingTimeout = null;

    // 서로 구분이 확실한 10종 고대비 파스텔 톤 팔레트
    this.pastelPalette = [
      '#ff9ebb', // 파스텔 딸기 핑크
      '#5eead4', // 파스텔 민트 에메랄드
      '#fde047', // 파스텔 레몬 옐로우
      '#c084fc', // 파스텔 라벤더 바이올렛
      '#38bdf8', // 파스텔 아쿠아 스카이블루
      '#fb923c', // 파스텔 살구 피치
      '#fef08a', // 파스텔 바닐라 크림
      '#f472b6', // 파스텔 로즈 마젠타
      '#a3e635', // 파스텔 라임 그린
      '#fb7185'  // 파스텔 체리 코랄
    ];

    // 대표 음료/주류 고유 색상 맵 (기본 폴백)
    this.colorMap = {
      101: '#86efac', // 소주 (은은한 에메랄드)
      102: '#eab308', // 맥주 (황금빛 골드)
      103: '#f8fafc', // 막걸리 (뽀얀 우윳빛)
      104: '#dc2626', // 복분자주 (루비 레드)
      105: '#f59e0b', // 매실주 (호박 앰버)
      106: '#cbd5e1', // 청주 (투명 크리스탈)
      107: '#e2e8f0', // 보드카 (순백 투명)
      108: '#b45309', // 위스키 (깊은 오크)
      204: '#38bdf8', // 탄산수 (청량 스파클링 블루)
      205: '#4ade80', // 사이다 (라임 그린)
      206: '#451a03', // 콜라 (딥 카라멜 브라운)
      207: '#fb923c', // 오렌지주스 (생생한 오렌지)
      208: '#06b6d4', // 토닉워터 (투명 아쿠아)
      209: '#a3e635', // 에너지드링크 (네온 라임)
      210: '#78350f', // 홍차/커피 (다크 티)
      211: '#fef08a'  // 식혜 (연노랑)
    };
  }

  init() {
    this.state = 'select';
    this.lastResult = null;
    if (this.mixingTimeout) {
      clearTimeout(this.mixingTimeout);
      this.mixingTimeout = null;
    }
    // 처음 들어오면 아무것도 체크하지 않고 소주와 맥주만 체크된 상태로 설정
    const eligible = this.getEligibleIngredients();
    this.selectedIngIds.clear();
    eligible.forEach(ing => {
      const name = ing.display_name || '';
      const id = Number(ing.ingredient_id);
      if (id === 101 || id === 102 || name.includes('소주') || name.includes('맥주')) {
        this.selectedIngIds.add(id);
      }
    });
    if (this.selectedIngIds.size === 0) {
      this.selectedIngIds.add(101);
      this.selectedIngIds.add(102);
    }
    this.render();
  }

  reset() {
    if (this.mixingTimeout) {
      clearTimeout(this.mixingTimeout);
      this.mixingTimeout = null;
    }
    this.state = 'select';
    this.lastResult = null;
    this.render();
  }

  /**
   * 유저가 해금한 재료 중 주류(ALCOHOL)와 음료(DRINK)만 필터링
   */
  getEligibleIngredients() {
    const book = this.hub.recipeBook || window.app?.recipeBook;
    const inv = this.hub.inventory || window.app?.inventory;

    if (!book) return [];

    const allBase = Array.from(book.baseIngredients.values());
    const eligible = allBase.filter(ing => {
      const isDrinkOrAlc = ing.category_id === 'ALCOHOL' || ing.category_id === 'DRINK';
      if (!isDrinkOrAlc) return false;
      return inv ? inv.isIngredientAvailable(ing.ingredient_id) : true;
    });

    // 해금된 적격 재료가 2개 미만인 경우(초기 상태) 기본 스타터 재료 자동 보충
    if (eligible.length < 2) {
      const fallbackIds = [101, 102, 204, 205, 206]; // 소주, 맥주, 탄산수, 사이다, 콜라
      return allBase.filter(ing => fallbackIds.includes(Number(ing.ingredient_id)));
    }

    return eligible;
  }

  /**
   * 재료 색상 추출
   */
  getIngredientColor(ingredient) {
    if (this.colorMap[ingredient.ingredient_id]) {
      return this.colorMap[ingredient.ingredient_id];
    }
    if (ingredient.category_id === 'ALCOHOL') return '#f59e0b';
    return '#38bdf8';
  }

  toggleIngredient(ingId) {
    const id = Number(ingId);
    if (this.selectedIngIds.has(id)) {
      this.selectedIngIds.delete(id);
    } else {
      this.selectedIngIds.add(id);
    }
    this.hub.sound.playTap();
    this.render();
  }

  selectAll() {
    const eligible = this.getEligibleIngredients();
    eligible.forEach(ing => this.selectedIngIds.add(Number(ing.ingredient_id)));
    this.hub.sound.playTap();
    this.render();
  }

  clearAll() {
    this.selectedIngIds.clear();
    this.hub.sound.playTap();
    this.render();
  }

  setGlass(glassType) {
    this.selectedGlass = glassType;
    this.hub.sound.playTap();
    this.hub.vibrateShort();
    this.render();
  }

  /**
   * 비율 총합을 무조건 10으로 맞추는 정수 분할 알고리즘
   * - 1개: [10]
   * - 2개: [3, 7], [4, 6] 등 (합 10)
   * - 3개: [3, 4, 3], [2, 5, 3] 등 (합 10)
   * - 4개: [2, 3, 3, 2] 등 (합 10)
   */
  _generateTenSumRatios(count) {
    if (count <= 1) return [10];
    if (count === 2) {
      const a = Math.floor(Math.random() * 9) + 1; // 1 ~ 9
      return [a, 10 - a];
    }
    // count >= 3: 1부터 9 사이에서 (count - 1)개의 서로 다른 분할점 무작위 추출
    const dividers = [];
    while (dividers.length < count - 1) {
      const d = Math.floor(Math.random() * 9) + 1;
      if (!dividers.includes(d)) dividers.push(d);
    }
    dividers.sort((a, b) => a - b);
    const parts = [];
    let prev = 0;
    for (const d of dividers) {
      parts.push(d - prev);
      prev = d;
    }
    parts.push(10 - prev);
    return parts;
  }

  /**
   * 벌칙주 랜덤 조제 알고리즘
   */
  craftPenaltyDrink() {
    const eligible = this.getEligibleIngredients();
    const activeIngs = eligible.filter(ing => this.selectedIngIds.has(Number(ing.ingredient_id)));

    if (activeIngs.length === 0) {
      this.hub.sound.playDown();
      return;
    }

    // 1. 선택한 재료 중 무작위 K개 선택 (최소 1개, 최대 4개)
    const shuffled = [...activeIngs].sort(() => Math.random() - 0.5);
    const pickCount = activeIngs.length === 1 ? 1 : Math.min(activeIngs.length, Math.floor(Math.random() * 3) + 2);
    const chosen = shuffled.slice(0, pickCount);

    // 2. 무조건 비율 총합 10을 맞추는 정수 분할 할당
    const ratios = this._generateTenSumRatios(chosen.length);

    // 3. 재료별로 서로 겹치지 않는 고대비 파스텔 톤 색상 무작위 배정
    const shuffledColors = [...this.pastelPalette].sort(() => Math.random() - 0.5);

    const itemsWithParts = chosen.map((ing, idx) => ({
      ing,
      parts: ratios[idx],
      percent: ratios[idx] * 10, // 10비율 기준이므로 정확히 10배 (총합 100%)
      color: shuffledColors[idx % shuffledColors.length]
    }));

    // 4. 기상천외한 벌칙주 명칭 작명
    const title = this._generateCocktailName(itemsWithParts, this.selectedGlass);

    this.lastResult = {
      glass: this.selectedGlass,
      items: itemsWithParts,
      totalParts: 10,
      title
    };

    // 5. 조제 믹싱 연출 시작
    this.state = 'mixing';
    if (this.hub.sound && typeof this.hub.sound.playPour === 'function') {
      this.hub.sound.playPour();
    } else if (this.hub.sound && typeof this.hub.sound.playTap === 'function') {
      this.hub.sound.playTap();
    }
    this.hub.vibrateShort();
    this.render();

    this.mixingTimeout = setTimeout(() => {
      this.state = 'result';
      this.hub.sound.playExplosion();
      if (navigator.vibrate) {
        try { navigator.vibrate([100, 50, 200]); } catch (_) {}
      }
      this.render();
    }, 1100);
  }

  _generateCocktailName(items, glass) {
    const hasSoju = items.some(i => i.ing.display_name.includes('소주'));
    const hasBeer = items.some(i => i.ing.display_name.includes('맥주'));
    const hasCola = items.some(i => i.ing.display_name.includes('콜라'));
    const hasCider = items.some(i => i.ing.display_name.includes('사이다'));
    const hasMakgeolli = items.some(i => i.ing.display_name.includes('막걸리'));

    const glassPrefix = glass === 'soju' ? '한입의' : '대용량';

    if (hasSoju && hasBeer && hasCider) return `🌪️ ${glassPrefix} 지옥의 소맥사`;
    if (hasSoju && hasBeer) return `💥 ${glassPrefix} 황금비율 소맥폭탄`;
    if (hasSoju && hasCola) return `🖤 ${glassPrefix} 암흑의 고진감래`;
    if (hasMakgeolli && hasCider) return `🍶 ${glassPrefix} 달콤살벌 막사`;
    if (hasSoju && items.length === 1) return `☠️ ${glassPrefix} 순도 100% 독주`;
    
    const randomAdjectives = ['치명적인', '악마의', '혼돈의', '황홀한', '눈물 쏙 빠지는', '운명의', '기적의'];
    const randomSuffixes = ['벌칙 드링크', '칵테일', '폭탄주', '연금술 포션', '원샷 특효약'];

    const adj = randomAdjectives[Math.floor(Math.random() * randomAdjectives.length)];
    const suf = randomSuffixes[Math.floor(Math.random() * randomSuffixes.length)];
    return `🍹 ${adj} ${items[0].ing.display_name} ${suf}`;
  }

  // =========================================================================
  // 렌더링
  // =========================================================================

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    if (this.state === 'select') {
      this._renderSelectView(container);
    } else if (this.state === 'mixing') {
      this._renderMixingView(container);
    } else {
      this._renderResultView(container);
    }

    this._bindEvents();
  }

  /**
   * [뷰 1] 재료 및 잔 선택 (냉장고를 부탁해 모드)
   */
  _renderSelectView(container) {
    const eligible = this.getEligibleIngredients();
    const alcoholList = eligible.filter(i => i.category_id === 'ALCOHOL');
    const drinkList = eligible.filter(i => i.category_id === 'DRINK');
    const selectedCount = this.selectedIngIds.size;

    container.innerHTML = `
      <div class="party-game-box penalty-cocktail-box">
        <!-- 1. 상단 잔 선택 (단순히 버튼 두 개: 소주잔 50ml, 글라스 250ml) -->
        <div class="glass-toggle-row">
          <button type="button" class="glass-toggle-btn ${this.selectedGlass === 'soju' ? 'active' : ''}" data-glass="soju">
            <span class="glass-btn-icon">🍶</span>
            <span class="glass-btn-name">소주잔 (50ml)</span>
          </button>
          <button type="button" class="glass-toggle-btn ${this.selectedGlass === 'glass' ? 'active' : ''}" data-glass="glass">
            <span class="glass-btn-icon">🍺</span>
            <span class="glass-btn-name">글라스 (250ml)</span>
          </button>
        </div>

        <!-- 2. 재료 등록 (주류 & 음료) -->
        <div class="cocktail-section-card ing-selector-card">
          <div class="cocktail-section-header">
            <div class="title-with-count">
              <span class="cocktail-section-title">🧊 재료 등록</span>
              <span class="ing-count-pill">${selectedCount}개 선택됨</span>
            </div>
          </div>

          <div class="ing-groups-scroll-wrap">
            <!-- 주류 그룹 -->
            <div class="ing-group">
              <div class="group-label">🍺 주류 (알코올)</div>
              <div class="ing-chips-grid">
                ${alcoholList.length > 0 ? alcoholList.map(ing => {
                  const isChecked = this.selectedIngIds.has(Number(ing.ingredient_id));
                  return `
                    <button type="button" 
                            class="fridge-ing-chip alcohol ${isChecked ? 'selected' : ''}" 
                            data-ing-id="${ing.ingredient_id}">
                      <span class="chip-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 26) : (ing.emoji || '🍺')}</span>
                      <span class="chip-name">${ing.display_name}</span>
                    </button>
                  `;
                }).join('') : '<div style="font-size:0.8rem; color:#94a3b8; padding:6px 2px;">해금된 주류가 없습니다. 도감에서 주류를 만들어보세요!</div>'}
              </div>
            </div>

            <!-- 음료 그룹 -->
            <div class="ing-group">
              <div class="group-label">🥤 음료 & 믹서</div>
              <div class="ing-chips-grid">
                ${drinkList.length > 0 ? drinkList.map(ing => {
                  const isChecked = this.selectedIngIds.has(Number(ing.ingredient_id));
                  return `
                    <button type="button" 
                            class="fridge-ing-chip drink ${isChecked ? 'selected' : ''}" 
                            data-ing-id="${ing.ingredient_id}">
                      <span class="chip-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(ing, 26) : (ing.emoji || '🥤')}</span>
                      <span class="chip-name">${ing.display_name}</span>
                    </button>
                  `;
                }).join('') : '<div style="font-size:0.8rem; color:#94a3b8; padding:6px 2px;">해금된 음료가 없습니다.</div>'}
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 벌칙주 만들기 실행 버튼 -->
        <div class="cocktail-action-row">
          <button type="button" 
                  class="btn-make-cocktail ${selectedCount === 0 ? 'disabled' : ''}" 
                  id="btn-make-cocktail">
            🎲 벌칙주 만들기!
          </button>
        </div>
      </div>
    `;
  }

  /**
   * [뷰 2] 쉐이킹 & 주입 애니메이션 화면
   */
  _renderMixingView(container) {
    const isSoju = this.selectedGlass === 'soju';
    container.innerHTML = `
      <div class="party-game-box penalty-cocktail-box mixing-box">
        <div class="mixing-center-wrap">
          <div class="mixing-shaker-anim">🧪</div>
          <div class="mixing-label">황금 비율 계산 중...</div>
          <div class="mixing-sub">지옥의 벌칙주가 탄생합니다!</div>
          
          <div class="mixing-glass-preview ${isSoju ? 'soju' : 'glass'}">
            <div class="mixing-liquid-stream"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * [뷰 3] 조제 완료 결과 화면
   */
  _renderResultView(container) {
    if (!this.lastResult) {
      this.reset();
      return;
    }

    const { glass, items, title } = this.lastResult;
    const isSoju = glass === 'soju';

    // 잔에 채워지는 레이어 생성 (아래에서 위로 적층)
    const layersHtml = items.map(item => `
      <div class="liquid-layer" style="height: ${item.percent}%; background: ${item.color};">
        <span class="layer-label">${item.ing.display_name} ${item.parts}</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="party-game-box penalty-cocktail-box result-box">
        <!-- 1. 벌칙주 타이틀 & 잔 뱃지 -->
        <div class="result-header-card">
          <span class="result-glass-pill">${isSoju ? '🍶 소주잔 기준' : '🍺 글라스(맥주잔) 기준'}</span>
          <h3 class="result-cocktail-title">${title}</h3>
        </div>

        <!-- 2. 중앙: 실제 소주잔 비율로 커진 비주얼 잔 -->
        <div class="result-glass-display-wrap">
          <div class="glass-svg-container ${isSoju ? 'soju-glass' : 'beer-glass'}">
            <div class="glass-outer-shell">
              <div class="glass-liquid-column">
                ${layersHtml}
              </div>
              ${isSoju ? '<div class="soju-thick-base"></div>' : '<div class="beer-thick-base"></div>'}
              <div class="glass-highlight-reflection"></div>
            </div>
            <div class="glass-base-shadow"></div>
          </div>
        </div>

        <!-- 3. 상세 배합 목록 (제목 완전 제거, 확대된 폰트와 간결한 N 비율) -->
        <div class="recipe-breakdown-card">
          <div class="recipe-items-list">
            ${items.map(item => `
              <div class="recipe-item-row">
                <div class="item-left">
                  <span class="item-dot" style="background:${item.color};"></span>
                  <span class="item-emoji">${window.KSool?.pixelIcon ? window.KSool.pixelIcon(item.ing, 22) : (item.ing.emoji || '🍺')}</span>
                  <span class="item-name">${item.ing.display_name}</span>
                </div>
                <div class="item-right">
                  <span class="item-ratio-num">${item.parts}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. 하단 액션 버튼 -->
        <div class="result-action-buttons">
          <button type="button" class="btn-cocktail-action reroll" id="btn-cocktail-reroll">
            🎲 다시 제조
          </button>
          <button type="button" class="btn-cocktail-action edit" id="btn-cocktail-edit">
            🧊 재료 다시 선택
          </button>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    // 잔 선택 토글
    document.querySelectorAll('[data-glass]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-glass');
        this.setGlass(type);
      };
    });

    // 재료 선택 칩 토글
    document.querySelectorAll('[data-ing-id]').forEach(chip => {
      chip.onclick = (e) => {
        e.stopPropagation();
        const id = chip.getAttribute('data-ing-id');
        this.toggleIngredient(id);
      };
    });

    // 벌칙주 만들기 실행
    const makeBtn = document.getElementById('btn-make-cocktail');
    if (makeBtn) {
      makeBtn.onclick = (e) => {
        e.stopPropagation();
        this.craftPenaltyDrink();
      };
    }

    // 결과 뷰: 다시 제조하기
    const rerollBtn = document.getElementById('btn-cocktail-reroll');
    if (rerollBtn) {
      rerollBtn.onclick = (e) => {
        e.stopPropagation();
        this.craftPenaltyDrink();
      };
    }

    // 결과 뷰: 재료 다시 선택
    const editBtn = document.getElementById('btn-cocktail-edit');
    if (editBtn) {
      editBtn.onclick = (e) => {
        e.stopPropagation();
        this.reset();
      };
    }
  }

  destroy() {
    if (this.mixingTimeout) {
      clearTimeout(this.mixingTimeout);
      this.mixingTimeout = null;
    }
  }
}

window.KSool.PenaltyCocktailGame = PenaltyCocktailGame;
