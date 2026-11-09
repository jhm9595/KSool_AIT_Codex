window.KSool = window.KSool || {};

/**
 * 🏮 주막 타이쿤 (Tycoon Main Game) - 손님 도감 & 웹툰 셀 채색(Cel-Shaded) 상반신 캐릭터 렌더러
 *
 * [핵심 기획]
 * - 배경 일러스트(길거리 노점 ~ 사이버펑크 바)의 코믹 잉크 라인아트 & 셀 채색(Webtoon Cel-Shading) 화풍에 맞춰,
 *   원형 배지나 도트/치비 형태가 아닌 '카운터 바 앞으로 걸어와 서 있는 상반신 인물 일러스트'로 렌더링합니다.
 * - 24명의 고유 단골 손님이 각자 개성 있는 헤어스타일, 의상(한복 도포, 쓰리피스 수트, 스트릿 후드, 등산복/조끼, 비단 드레스, 셰프복),
 *   안경/선글라스, 수염, 모자를 착용하고 등장합니다.
 */
class TycoonCustomerPool {
  constructor(recipeBook, brandResolver) {
    this.recipeBook = recipeBook;
    this.brandResolver = brandResolver;
    this.customers = [];
    this._initCustomerRoster();
  }

  _initCustomerRoster() {
    const archetypes = [
      // === Group A: 한복/클래식 선비 패밀리 ===
      {
        id: 'cust_01',
        group: '선비파',
        name: '김진사',
        title: '외알안경 긴수염 선비',
        traitHint: '검은 갓 · 외알안경 · 긴 흰수염 · 푸른 도포',
        skin: '#f5d0a9',
        hat: 'GAT_BLACK',
        hair: 'TOP_KNOT',
        eyes: 'MONOCLE_LEFT',
        beard: 'LONG_WHITE',
        outfit: 'HANBOK_BLUE',
        accent: '#38bdf8',
        preferredRecipeId: 5, // 소주 (Stage 1)
        greeting: '에헴, 내 푸른 도포와 외알안경을 기억해주게! 난 언제나 깔끔한 소주가 좋네.'
      },
      {
        id: 'cust_02',
        group: '선비파',
        name: '이진사',
        title: '둥근안경 긴수염 선비',
        traitHint: '검은 갓 · 둥근안경 · 긴 흰수염 · 푸른 도포',
        skin: '#f5d0a9',
        hat: 'GAT_BLACK',
        hair: 'TOP_KNOT',
        eyes: 'ROUND_GLASSES',
        beard: 'LONG_WHITE',
        outfit: 'HANBOK_BLUE',
        accent: '#60a5fa',
        preferredRecipeId: 26, // 막걸리 (Stage 3)
        greeting: '김진사와 도포도 수염도 같지만 난 양쪽 둥근안경을 썼다네! 내 술은 막걸리뿐이야.'
      },
      {
        id: 'cust_03',
        group: '선비파',
        name: '박어사',
        title: '외알안경 검은수염 어사',
        traitHint: '검은 갓 · 외알안경 · 짧은 검은수염 · 붉은 도포',
        skin: '#f1c292',
        hat: 'GAT_RED_STRING',
        hair: 'TOP_KNOT',
        eyes: 'MONOCLE_LEFT',
        beard: 'GOATEE_BLACK',
        outfit: 'HANBOK_RED',
        accent: '#f87171',
        preferredRecipeId: 20, // 매실주 (Stage 1)
        greeting: '붉은 갓끈에 검은 턱수염! 김진사 영감과 외알안경은 같아도 난 매실주만 마신다오.'
      },
      {
        id: 'cust_04',
        group: '선비파',
        name: '최훈장',
        title: '맨눈 긴수염 훈장님',
        traitHint: '검은 갓 · 안경없음 · 긴 회색수염 · 초록 도포',
        skin: '#f5d0a9',
        hat: 'GAT_BLACK',
        hair: 'TOP_KNOT',
        eyes: 'SHARP_EYES',
        beard: 'LONG_GRAY',
        outfit: 'HANBOK_GREEN',
        accent: '#34d399',
        preferredRecipeId: 57, // 복분자주 (Stage 3)
        greeting: '안경 쓴 선비들과 헷갈리지 말게! 초록 도포의 최훈장은 복분자주 한 잔이면 족하네.'
      },

      // === Group B: 모던 수트 & 신사 패밀리 ===
      {
        id: 'cust_05',
        group: '신사파',
        name: '구보씨',
        title: '갈색중절모 나비넥타이 신사',
        traitHint: '갈색 중절모 · 둥근안경 · 카이저 콧수염 · 빨간 나비넥타이',
        skin: '#f7d5b1',
        hat: 'FEDORA_BROWN',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'MUSTACHE_CURL',
        outfit: 'SUIT_BOWTIE_RED',
        accent: '#fb923c',
        preferredRecipeId: 1, // 소맥 (Stage 1)
        greeting: '빨간 나비넥타이에 말아올린 콧수염! 퇴근길엔 역시 시원한 소맥 아니겠소?'
      },
      {
        id: 'cust_06',
        group: '신사파',
        name: '이상씨',
        title: '갈색중절모 파란넥타이 시인',
        traitHint: '갈색 중절모 · 둥근안경 · 턱수염 · 파란 넥타이',
        skin: '#f7d5b1',
        hat: 'FEDORA_BROWN',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'GOATEE_BLACK',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#38bdf8',
        preferredRecipeId: 65, // 아이스 아메리카노 (Stage 1)
        greeting: '구보씨와 모자·안경은 같지만 난 파란 넥타이에 턱수염이라오. 차가운 아이스 아메리카노 주시오.'
      },
      {
        id: 'cust_07',
        group: '신사파',
        name: '백사장',
        title: '검은중절모 선글라스 사장',
        traitHint: '검은 중절모 · 금테 선글라스 · 카이저 콧수염 · 정장',
        skin: '#f1c292',
        hat: 'FEDORA_BLACK',
        hair: 'POMADE',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'MUSTACHE_CURL',
        outfit: 'SUIT_BOWTIE_RED',
        accent: '#facc15',
        preferredRecipeId: 74, // 고진감래주 (Stage 5)
        greeting: '검은 중절모에 금테 선글라스! 내 인생처럼 쓴맛 끝에 단맛이 오는 고진감래주가 내 단골이지.'
      },
      {
        id: 'cust_08',
        group: '신사파',
        name: '마국장',
        title: '검은중절모 외알안경 국장',
        traitHint: '검은 중절모 · 외알안경 · 수염없음 · 파란 넥타이',
        skin: '#f7d5b1',
        hat: 'FEDORA_BLACK',
        hair: 'POMADE',
        eyes: 'MONOCLE_LEFT',
        beard: 'NONE',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#818cf8',
        preferredRecipeId: 83, // 조선 깔루아 밀크 (Stage 2)
        greeting: '수염 없이 깔끔한 외알안경에 검은 중절모! 달콤쌉싸름한 조선 깔루아 밀크 부탁하오.'
      },

      // === Group C: 스트릿 힙스터 패밀리 ===
      {
        id: 'cust_09',
        group: '힙스터파',
        name: '제이든',
        title: '빨간비니 뿔테 DJ',
        traitHint: '빨간 비니 · 굵은 뿔테안경 · 턱수염 · 보라 후드',
        skin: '#f6d2ad',
        hat: 'BEANIE_RED',
        hair: 'SIDE_SHAVE',
        eyes: 'HORN_GLASSES',
        beard: 'GOATEE_BLACK',
        outfit: 'HOODIE_PURPLE',
        accent: '#f43f5e',
        preferredRecipeId: 14, // 레몬에이드 (Stage 1)
        greeting: 'Yo! 빨간 비니에 보라 후드 제이든이야! 길거리 노점에선 역시 상큼한 레몬에이드지!'
      },
      {
        id: 'cust_10',
        group: '힙스터파',
        name: '케이시',
        title: '빨간비니 선글라스 래퍼',
        traitHint: '빨간 비니 · 선글라스 · 턱수염 · 검정 후드',
        skin: '#f6d2ad',
        hat: 'BEANIE_RED',
        hair: 'SIDE_SHAVE',
        eyes: 'SUNGLASSES_DARK',
        beard: 'GOATEE_BLACK',
        outfit: 'HOODIE_BLACK',
        accent: '#e11d48',
        preferredRecipeId: 18, // 소콜 (Stage 1)
        greeting: '제이든이랑 빨간 비니는 같아도 난 선글라스에 검정 후드야! 달달한 소콜 한 잔 부탁해!'
      },
      {
        id: 'cust_11',
        group: '힙스터파',
        name: '민트민',
        title: '민트비니 뿔테 아티스트',
        traitHint: '민트 비니 · 굵은 뿔테안경 · 수염없음 · 보라 후드',
        skin: '#fbe2c4',
        hat: 'BEANIE_MINT',
        hair: 'BOB_CUT',
        eyes: 'HORN_GLASSES',
        beard: 'NONE',
        outfit: 'HOODIE_PURPLE',
        accent: '#2dd4bf',
        preferredRecipeId: 16, // 망고비어 (Stage 1)
        greeting: '민트색 비니에 수염 없는 뿔테! 전 트로피컬한 망고비어만 마시는 거 아시죠?'
      },
      {
        id: 'cust_12',
        group: '힙스터파',
        name: '레오',
        title: '민트비니 선글라스 댄서',
        traitHint: '민트 비니 · 선글라스 · 콧수염 · 검정 후드',
        skin: '#f1c292',
        hat: 'BEANIE_MINT',
        hair: 'SIDE_SHAVE',
        eyes: 'SUNGLASSES_DARK',
        beard: 'MUSTACHE_THIN',
        outfit: 'HOODIE_BLACK',
        accent: '#14b8a6',
        preferredRecipeId: 9, // 레몬소주 (Stage 2)
        greeting: '민트 비니에 얇은 콧수염과 선글라스! 상큼하게 톡 쏘는 레몬소주가 내 시그니처야.'
      },

      // === Group D: 동네 단골 아재 패밀리 ===
      {
        id: 'cust_13',
        group: '단골아재파',
        name: '황반장',
        title: '파란모자 산적수염 반장님',
        traitHint: '파란 캡모자 · 둥근안경 · 덥수룩 산적수염 · 낚시조끼',
        skin: '#ebb483',
        hat: 'CAP_BLUE',
        hair: 'SHORT_CURL',
        eyes: 'ROUND_GLASSES',
        beard: 'FULL_BUSHY',
        outfit: 'VEST_KHAKI',
        accent: '#3b82f6',
        preferredRecipeId: 4, // 맥주 (Stage 1)
        greeting: '허허! 파란 모자에 산적수염 황반장이야! 더울 땐 시원한 생맥주 한 잔이 최고지!'
      },
      {
        id: 'cust_14',
        group: '단골아재파',
        name: '강소장',
        title: '파란모자 콧수염 소장님',
        traitHint: '파란 캡모자 · 둥근안경 · 일자 콧수염 · 낚시조끼',
        skin: '#ebb483',
        hat: 'CAP_BLUE',
        hair: 'SHORT_CURL',
        eyes: 'ROUND_GLASSES',
        beard: 'MUSTACHE_FLAT',
        outfit: 'VEST_KHAKI',
        accent: '#2563eb',
        preferredRecipeId: 19, // 링겔주 (Stage 2)
        greeting: '황반장이랑 모자·조끼는 똑같아도 내 수염은 깔끔한 일자 콧수염이지! 난 링겔주만 마셔!'
      },
      {
        id: 'cust_15',
        group: '단골아재파',
        name: '오기사',
        title: '노란모자 산적수염 기사님',
        traitHint: '노란 캡모자 · 안경없음 · 덥수룩 산적수염 · 등산복',
        skin: '#ebb483',
        hat: 'CAP_YELLOW',
        hair: 'SHORT_CURL',
        eyes: 'SMILE_EYES',
        beard: 'FULL_BUSHY',
        outfit: 'JACKET_ORANGE',
        accent: '#eab308',
        preferredRecipeId: 58, // 사이다 (Stage 1)
        greeting: '노란 모자에 주황 등산복 입은 오기사요! 운전 중엔 청량한 사이다 한 잔이 최고지!'
      },
      {
        id: 'cust_16',
        group: '단골아재파',
        name: '변사장',
        title: '노란모자 뿔테 세탁소사장',
        traitHint: '노란 캡모자 · 뿔테안경 · 일자 콧수염 · 낚시조끼',
        skin: '#f5d0a9',
        hat: 'CAP_YELLOW',
        hair: 'SHORT_CURL',
        eyes: 'HORN_GLASSES',
        beard: 'MUSTACHE_FLAT',
        outfit: 'VEST_KHAKI',
        accent: '#ca8a04',
        preferredRecipeId: 73, // 밀크소다주 (Stage 2)
        greeting: '노란 모자에 뿔테안경 변사장입니다. 부드럽게 톡 쏘는 밀크소다주 한 잔 말아주소!'
      },

      // === Group E: 로열 & 라운지 VIP 패밀리 ===
      {
        id: 'cust_17',
        group: '로열파',
        name: '강화도령',
        title: '금관 외알안경 도령',
        traitHint: '금빛 왕관 · 외알안경 · 턱수염 · 보라 예복',
        skin: '#fae1c3',
        hat: 'CROWN_GOLD',
        hair: 'TOP_KNOT',
        eyes: 'MONOCLE_LEFT',
        beard: 'GOATEE_BLACK',
        outfit: 'ROYAL_PURPLE',
        accent: '#f59e0b',
        preferredRecipeId: 77, // 태극주 (Stage 3)
        greeting: '금관에 보라색 예복을 입은 강화도령이다! 붉고 푸른 조화의 태극주를 올리거라!'
      },
      {
        id: 'cust_18',
        group: '로열파',
        name: '안동대감',
        title: '금관 긴수염 대감',
        traitHint: '금빛 왕관 · 안경없음 · 긴 흰수염 · 보라 예복',
        skin: '#fae1c3',
        hat: 'CROWN_GOLD',
        hair: 'TOP_KNOT',
        eyes: 'SHARP_EYES',
        beard: 'LONG_WHITE',
        outfit: 'ROYAL_PURPLE',
        accent: '#d97706',
        preferredRecipeId: 39, // 꿀 막걸리 (Stage 6)
        greeting: '강화도령과 옷차림은 같으나 난 긴 백수염이 있지! 달콤한 꿀 막걸리 한 사발 가져오너라.'
      },
      {
        id: 'cust_19',
        group: '로열파',
        name: '명동마님',
        title: '은관 보석안경 마님',
        traitHint: '은빛 티아라 · 빨간 뿔테 · 수염없음 · 붉은 실크드레스',
        skin: '#fdf0df',
        hat: 'TIARA_SILVER',
        hair: 'UPDO_BUN',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'SILK_RED',
        accent: '#ec4899',
        preferredRecipeId: 34, // 딸기우유 (Stage 1)
        greeting: '은빛 티아라에 빨간 안경 명동마님이에요~ 달콤부드러운 딸기우유 한 잔 부탁해요!'
      },
      {
        id: 'cust_20',
        group: '로열파',
        name: '서초마담',
        title: '은관 선글라스 마담',
        traitHint: '은빛 티아라 · 금테 선글라스 · 수염없음 · 붉은 실크드레스',
        skin: '#fdf0df',
        hat: 'TIARA_SILVER',
        hair: 'UPDO_BUN',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'NONE',
        outfit: 'SILK_RED',
        accent: '#db2777',
        preferredRecipeId: 15, // 밀크소다 (Stage 1)
        greeting: '명동마님과 티아라는 같지만 전 금테 선글라스랍니다! 톡 쏘는 밀크소다 주세요~'
      },

      // === Group F: 장인/셰프 패밀리 ===
      {
        id: 'cust_21',
        group: '장인파',
        name: '불주먹최씨',
        title: '붉은머리띠 산적수염 주방장',
        traitHint: '붉은 머리띠 · 날카로운 눈 · 산적수염 · 흰 요리복',
        skin: '#f2c396',
        hat: 'HEADBAND_RED',
        hair: 'SPIKY_BLACK',
        eyes: 'SHARP_EYES',
        beard: 'FULL_BUSHY',
        outfit: 'CHEF_WHITE',
        accent: '#ef4444',
        preferredRecipeId: 27, // 막사 (Stage 4)
        greeting: '붉은 머리띠에 덥수룩한 수염! 불주먹 최씨에겐 시원청량한 막사가 딱이지!'
      },
      {
        id: 'cust_22',
        group: '장인파',
        name: '칼잡이류씨',
        title: '붉은머리띠 콧수염 초밥왕',
        traitHint: '붉은 머리띠 · 날카로운 눈 · 얇은 콧수염 · 흰 요리복',
        skin: '#f2c396',
        hat: 'HEADBAND_RED',
        hair: 'SPIKY_BLACK',
        eyes: 'SHARP_EYES',
        beard: 'MUSTACHE_THIN',
        outfit: 'CHEF_WHITE',
        accent: '#dc2626',
        preferredRecipeId: 51, // 소토닉 (Stage 5)
        greeting: '불주먹 최씨와 머리띠는 같지만 난 날렵한 콧수염이야! 깔끔한 소토닉 한 잔 부탁하네.'
      },
      {
        id: 'cust_23',
        group: '장인파',
        name: '단팥할멈',
        title: '흰두건 둥근안경 할머니',
        traitHint: '하얀 두건 · 둥근안경 · 수염없음 · 갈색 앞치마',
        skin: '#f5d0a9',
        hat: 'BANDANA_WHITE',
        hair: 'GRAY_BUN',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'APRON_BROWN',
        accent: '#a855f7',
        preferredRecipeId: 35, // 바나나우유 (Stage 1)
        greeting: '하얀 두건에 둥근안경 쓴 할멈이여~ 달콤하고 든든한 바나나우유 한 잔 주구려.'
      },
      {
        id: 'cust_24',
        group: '장인파',
        name: '약초할배',
        title: '흰두건 긴수염 약초꾼',
        traitHint: '하얀 두건 · 둥근안경 · 긴 회색수염 · 갈색 앞치마',
        skin: '#f5d0a9',
        hat: 'BANDANA_WHITE',
        hair: 'GRAY_BUN',
        eyes: 'ROUND_GLASSES',
        beard: 'LONG_GRAY',
        outfit: 'APRON_BROWN',
        accent: '#9333ea',
        preferredRecipeId: 60, // 식혜 (음료)
        greeting: '할멈이랑 두건·안경은 같아도 난 긴 회색 수염이 있다네! 달콤시원한 식혜 한 잔 주게!'
      }
    ];

    const isOrderable = (r) => {
      if (!r) return false;
      if (!r.unlocks_ingredient_id) return true;
      const ing = this.recipeBook?.getBaseIngredient?.(r.unlocks_ingredient_id);
      return Boolean(ing && (ing.category_id === 'ALCOHOL' || ing.category_id === 'DRINK'));
    };

    const allRecipes = this.recipeBook.getAllRecipes().filter(isOrderable);
    const fallbackIds = allRecipes.map(r => r.recipe_id);

    this.customers = archetypes.map((arch, idx) => {
      let rec = this.recipeBook.getRecipe(arch.preferredRecipeId);
      if (rec && !isOrderable(rec)) rec = null;
      if (!rec && allRecipes.length > 0) {
        rec = allRecipes[idx % allRecipes.length];
      }
      if (allRecipes.length > 0) this._rosterSynced = true;
      const rId = rec ? rec.recipe_id : (arch.preferredRecipeId || fallbackIds[0] || 5);

      return {
        ...arch,
        preferredRecipeId: rId
      };
    });
  }

  getAllCustomers() {
    if (!this._rosterSynced && this.recipeBook && this.recipeBook.getAllRecipes().length > 0) {
      this._initCustomerRoster();
    }
    return this.customers;
  }

  getCustomerById(id) {
    if (!this._rosterSynced && this.recipeBook && this.recipeBook.getAllRecipes().length > 0) {
      this._initCustomerRoster();
    }
    return this.customers.find(c => c.id === id) || this.customers[0];
  }

  /**
   * 배경 일러스트(웹툰 라인아트 & 셀 채색) 화풍에 맞춘 바 카운터 방문객 상반신 일러스트 렌더링
   * - 원형 배지 테두리를 제거하고 어깨·가슴·목·턱선·헤어·의상 주름까지 표현된 반신상(Bust-up)으로 그립니다.
   * @param {object} customer
   * @param {number} size
   * @param {'NORMAL' | 'WARN' | 'ANGRY'} mood
   */
  renderCustomerAvatarSvg(customer, size = 96, mood = 'NORMAL') {
    if (!customer) return '🧑';
    const c = customer;
    const ink = '#1a1512';
    const skinBase = mood === 'ANGRY' ? '#f5b5a6' : (c.skin || '#f5d0a9');

    // 1. 뒷머리 레이어 (얼굴/귀 뒤쪽 볼륨)
    let backHairSvg = '';
    if (c.hair === 'BOB_CUT' || c.hair === 'UPDO_BUN') {
      backHairSvg = `
        <path d="M27 36 C24 52, 26 68, 33 73 L67 73 C74 68, 76 52, 73 36 Z" fill="#27201c" stroke="${ink}" stroke-width="2.2"/>
      `;
    } else if (c.hair === 'GRAY_BUN') {
      backHairSvg = `
        <circle cx="50" cy="18" r="10" fill="#94a3b8" stroke="${ink}" stroke-width="2"/>
        <path d="M30 38 C28 50, 31 62, 36 66 L64 66 C69 62, 72 50, 70 38 Z" fill="#94a3b8" stroke="${ink}" stroke-width="2"/>
      `;
    } else {
      backHairSvg = `
        <path d="M31 35 C29 46, 31 56, 35 61 L65 61 C69 56, 71 46, 69 35 Z" fill="#1e1b18" stroke="${ink}" stroke-width="2"/>
      `;
    }

    // 2. 목 & 상반신 의상 (어깨·옷깃·주름·명암 셀 채색, y: 62 ~ 112)
    let torsoSvg = '';
    const neckSvg = `
      <path d="M43 60 L43 76 L57 76 L57 60 Z" fill="${skinBase}" stroke="${ink}" stroke-width="2"/>
      <path d="M43 61 Q50 68 57 61 L57 67 Q50 71 43 67 Z" fill="rgba(120, 53, 15, 0.25)"/>
    `;

    if (c.outfit === 'HANBOK_BLUE' || c.outfit === 'HANBOK_RED' || c.outfit === 'HANBOK_GREEN') {
      const mainCol = c.outfit === 'HANBOK_BLUE' ? '#254e7a' : (c.outfit === 'HANBOK_RED' ? '#8c2d2d' : '#245943');
      const shadeCol = c.outfit === 'HANBOK_BLUE' ? '#1a3656' : (c.outfit === 'HANBOK_RED' ? '#631d1d' : '#163b2c');
      const ribbonCol = c.outfit === 'HANBOK_RED' ? '#eab308' : '#e2e8f0';
      torsoSvg = `
        ${neckSvg}
        <!-- 한복 도포 어깨와 소매 -->
        <path d="M12 112 C13 84, 24 72, 41 70 L50 82 L59 70 C76 72, 87 84, 88 112 Z" fill="${mainCol}" stroke="${ink}" stroke-width="2.4"/>
        <!-- 셀 음영 -->
        <path d="M16 112 C18 90, 26 78, 36 74 L42 112 Z" fill="${shadeCol}"/>
        <path d="M84 112 C82 90, 74 78, 64 74 L58 112 Z" fill="${shadeCol}"/>
        <!-- 동정(하얀 깃) & 고름 -->
        <path d="M39 70 L50 86 L61 70 L57 68 L50 79 L43 68 Z" fill="#f8fafc" stroke="${ink}" stroke-width="2"/>
        <path d="M42 74 L55 96 L55 112" fill="none" stroke="${ink}" stroke-width="2"/>
        <path d="M50 85 C54 85, 58 88, 56 92 C53 93, 49 89, 50 85 Z" fill="${ribbonCol}" stroke="${ink}" stroke-width="1.6"/>
        <path d="M51 89 L47 109 M54 89 L57 108" stroke="${ribbonCol}" stroke-width="3" stroke-linecap="round"/>
      `;
    } else if (c.outfit === 'SUIT_BOWTIE_RED' || c.outfit === 'SUIT_TIE_BLUE') {
      const isBow = c.outfit === 'SUIT_BOWTIE_RED';
      torsoSvg = `
        ${neckSvg}
        <!-- 정장 자켓 & 셔츠 -->
        <path d="M14 112 C15 83, 25 72, 41 70 L59 70 C75 72, 85 83, 86 112 Z" fill="#262930" stroke="${ink}" stroke-width="2.4"/>
        <!-- 셔츠 V존 -->
        <polygon points="41,70 50,98 59,70" fill="#f8fafc" stroke="${ink}" stroke-width="1.8"/>
        <!-- 자켓 라펠(깃) -->
        <polygon points="41,70 33,84 46,96 50,98" fill="#181a20" stroke="${ink}" stroke-width="1.8"/>
        <polygon points="59,70 67,84 54,96 50,98" fill="#181a20" stroke="${ink}" stroke-width="1.8"/>
        ${isBow
          ? `<polygon points="43,75 50,79 43,83" fill="#dc2626" stroke="${ink}" stroke-width="1.5"/>
             <polygon points="57,75 50,79 57,83" fill="#dc2626" stroke="${ink}" stroke-width="1.5"/>
             <circle cx="50" cy="79" r="2.2" fill="#991b1b" stroke="${ink}" stroke-width="1.2"/>`
          : `<polygon points="48,75 52,75 53,95 50,98 47,95" fill="#2563eb" stroke="${ink}" stroke-width="1.5"/>`
        }
        <line x1="27" y1="88" x2="25" y2="112" stroke="${ink}" stroke-width="1.8"/>
        <line x1="73" y1="88" x2="75" y2="112" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.outfit === 'HOODIE_PURPLE' || c.outfit === 'HOODIE_BLACK') {
      const hCol = c.outfit === 'HOODIE_PURPLE' ? '#5b21b6' : '#1e242b';
      const hShade = c.outfit === 'HOODIE_PURPLE' ? '#4c1d95' : '#12161b';
      const cordCol = c.outfit === 'HOODIE_PURPLE' ? '#e9d5ff' : '#f43f5e';
      torsoSvg = `
        ${neckSvg}
        <!-- 후드 쿠션 넥라인 -->
        <path d="M31 74 C31 64, 69 64, 69 74 Z" fill="${hShade}" stroke="${ink}" stroke-width="2.2"/>
        <!-- 스트릿 후드티 몸통 -->
        <path d="M12 112 C14 82, 25 71, 38 70 L50 77 L62 70 C75 71, 86 82, 88 112 Z" fill="${hCol}" stroke="${ink}" stroke-width="2.4"/>
        <path d="M16 112 C18 90, 24 80, 32 76 L37 112 Z" fill="${hShade}"/>
        <path d="M84 112 C82 90, 76 80, 68 76 L63 112 Z" fill="${hShade}"/>
        <!-- 후드 스트링 -->
        <path d="M44 76 Q43 90 44 100" fill="none" stroke="${cordCol}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M56 76 Q57 90 56 100" fill="none" stroke="${cordCol}" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="26" y1="88" x2="24" y2="112" stroke="${ink}" stroke-width="1.8"/>
        <line x1="74" y1="88" x2="76" y2="112" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.outfit === 'VEST_KHAKI' || c.outfit === 'JACKET_ORANGE') {
      const isVest = c.outfit === 'VEST_KHAKI';
      const bodyCol = isVest ? '#4d6b31' : '#c2410c';
      const innerCol = isVest ? '#d6d3d1' : '#fde047';
      torsoSvg = `
        ${neckSvg}
        <path d="M13 112 C15 83, 25 72, 40 70 L60 70 C75 72, 85 83, 87 112 Z" fill="${bodyCol}" stroke="${ink}" stroke-width="2.4"/>
        <polygon points="41,70 50,92 59,70" fill="${innerCol}" stroke="${ink}" stroke-width="1.8"/>
        <line x1="50" y1="90" x2="50" y2="112" stroke="${ink}" stroke-width="2"/>
        <rect x="28" y="86" width="13" height="12" rx="2" fill="rgba(0,0,0,0.18)" stroke="${ink}" stroke-width="1.6"/>
        <rect x="59" y="86" width="13" height="12" rx="2" fill="rgba(0,0,0,0.18)" stroke="${ink}" stroke-width="1.6"/>
      `;
    } else if (c.outfit === 'ROYAL_PURPLE' || c.outfit === 'SILK_RED') {
      const isRoyal = c.outfit === 'ROYAL_PURPLE';
      const col = isRoyal ? '#4c1d95' : '#9f1239';
      const trim = isRoyal ? '#fbbf24' : '#fda4af';
      torsoSvg = `
        ${neckSvg}
        <path d="M13 112 C15 83, 25 72, 40 70 L50 80 L60 70 C75 72, 85 83, 87 112 Z" fill="${col}" stroke="${ink}" stroke-width="2.4"/>
        <path d="M38 70 L50 84 L62 70" fill="none" stroke="${trim}" stroke-width="3.2"/>
        <circle cx="50" cy="90" r="5" fill="#fbbf24" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.outfit === 'CHEF_WHITE') {
      torsoSvg = `
        ${neckSvg}
        <path d="M14 112 C15 83, 25 72, 40 70 L50 78 L60 70 C75 72, 85 83, 86 112 Z" fill="#f8fafc" stroke="${ink}" stroke-width="2.4"/>
        <path d="M39 70 L50 82 L61 70" fill="none" stroke="#cbd5e1" stroke-width="2.5"/>
        <line x1="42" y1="80" x2="40" y2="112" stroke="${ink}" stroke-width="1.8"/>
        <circle cx="45" cy="88" r="2" fill="${ink}"/>
        <circle cx="55" cy="88" r="2" fill="${ink}"/>
        <circle cx="45" cy="98" r="2" fill="${ink}"/>
        <circle cx="55" cy="98" r="2" fill="${ink}"/>
      `;
    } else {
      // APRON_BROWN
      torsoSvg = `
        ${neckSvg}
        <path d="M14 112 C15 83, 25 72, 40 70 L60 70 C75 72, 85 83, 86 112 Z" fill="#e2e8f0" stroke="${ink}" stroke-width="2.4"/>
        <path d="M33 72 L36 112 L64 112 L67 72 L61 72 L59 84 L41 84 L39 72 Z" fill="#78350f" stroke="${ink}" stroke-width="2"/>
      `;
    }

    // 3. 귀 & 얼굴 윤곽 (웹툰 턱선 + 볼 음영 + 코 라인)
    const headAndEarsSvg = `
      <!-- 양쪽 귀 -->
      <path d="M34 41 C30 41, 29 49, 34 51" fill="${skinBase}" stroke="${ink}" stroke-width="2"/>
      <path d="M66 41 C70 41, 71 49, 66 51" fill="${skinBase}" stroke="${ink}" stroke-width="2"/>
      <!-- 얼굴 턱선 윤곽 -->
      <path d="M34 31 C34 19, 66 19, 66 31 L65 46 C64 56, 56 64, 50 64 C44 64, 36 56, 35 46 Z" fill="${skinBase}" stroke="${ink}" stroke-width="2.2"/>
      <!-- 웹툰 셀 볼/관자놀이 음영 -->
      <path d="M35 44 C36 54, 43 61, 49 63 C42 60, 38 52, 37 42 Z" fill="rgba(146, 64, 14, 0.16)"/>
      <!-- 코 음영 및 콧대 라인 -->
      <path d="M49.5 41 L48.2 48 L51.5 48.8" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="50,48.5 53,48.5 51,50.5" fill="rgba(146, 64, 14, 0.22)"/>
    `;

    // 4. 앞머리/헤어스타일 레이어 (모자 아래 자연스럽게 내려오는 웹툰 머리카락)
    let frontHairSvg = '';
    if (c.hair === 'BOB_CUT') {
      frontHairSvg = `
        <path d="M33 28 C35 22, 65 22, 67 28 C69 36, 68 48, 66 55 C65 44, 64 36, 61 32 L56 36 L52 31 L45 36 L40 32 C36 36, 35 44, 34 55 C32 48, 31 36, 33 28 Z" fill="#27201c" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.hair === 'POMADE' || c.hair === 'SIDE_SHAVE') {
      frontHairSvg = `
        <path d="M34 33 C36 25, 46 24, 54 27 C60 28, 64 31, 66 35 C63 31, 56 30, 48 31 C41 31, 36 33, 34 36 Z" fill="#1e1b18" stroke="${ink}" stroke-width="1.6"/>
      `;
    } else if (c.hair === 'GRAY_BUN' || c.hair === 'UPDO_BUN') {
      const hCol = c.hair === 'GRAY_BUN' ? '#94a3b8' : '#1e1b18';
      frontHairSvg = `
        <path d="M34 35 C37 26, 46 26, 50 30 C54 26, 63 26, 66 35 C61 31, 54 31, 50 33 C46 31, 39 31, 34 35 Z" fill="${hCol}" stroke="${ink}" stroke-width="1.7"/>
      `;
    } else {
      frontHairSvg = `
        <path d="M34 34 L38 28 L43 33 L49 27 L55 33 L61 28 L66 34 C62 29, 38 29, 34 34 Z" fill="#1e1b18" stroke="${ink}" stroke-width="1.6"/>
      `;
    }

    // 5. 눈·눈썹·안경 레이어
    const browLeft = mood === 'ANGRY' ? 'M38 35 L46 38' : 'M38 36 Q42 34 46 36';
    const browRight = mood === 'ANGRY' ? 'M62 35 L54 38' : 'M54 36 Q58 34 62 36';
    const baseEyes = `
      <path d="${browLeft}" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round"/>
      <path d="${browRight}" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round"/>
      <!-- 눈매 & 눈동자 하이라이트 -->
      <path d="M38.5 41 Q42.5 38.5 46.5 41" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
      <path d="M53.5 41 Q57.5 38.5 61.5 41" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="42.5" cy="41.8" r="2.2" fill="${ink}"/>
      <circle cx="57.5" cy="41.8" r="2.2" fill="${ink}"/>
      <circle cx="41.8" cy="41.1" r="0.7" fill="#ffffff"/>
      <circle cx="56.8" cy="41.1" r="0.7" fill="#ffffff"/>
    `;

    let eyesSvg = '';
    if (c.eyes === 'MONOCLE_LEFT') {
      eyesSvg = `
        ${baseEyes}
        <circle cx="42.5" cy="41.8" r="5.6" fill="rgba(56,189,248,0.18)" stroke="#eab308" stroke-width="2"/>
        <path d="M37 43 Q34 50 35 58" fill="none" stroke="#eab308" stroke-width="1.3"/>
      `;
    } else if (c.eyes === 'ROUND_GLASSES') {
      eyesSvg = `
        ${baseEyes}
        <circle cx="42.5" cy="41.8" r="5.3" fill="rgba(255,255,255,0.18)" stroke="#334155" stroke-width="2"/>
        <circle cx="57.5" cy="41.8" r="5.3" fill="rgba(255,255,255,0.18)" stroke="#334155" stroke-width="2"/>
        <line x1="47.8" y1="41.8" x2="52.2" y2="41.8" stroke="#334155" stroke-width="2"/>
      `;
    } else if (c.eyes === 'HORN_GLASSES') {
      eyesSvg = `
        ${baseEyes}
        <rect x="36.5" y="37.5" width="11.5" height="8.2" rx="1.8" fill="rgba(15,23,42,0.1)" stroke="${ink}" stroke-width="2.6"/>
        <rect x="52" y="37.5" width="11.5" height="8.2" rx="1.8" fill="rgba(15,23,42,0.1)" stroke="${ink}" stroke-width="2.6"/>
        <line x1="48" y1="41" x2="52" y2="41" stroke="${ink}" stroke-width="2.4"/>
      `;
    } else if (c.eyes === 'RED_GLASSES') {
      eyesSvg = `
        ${baseEyes}
        <polygon points="36,38 48,39 47,45.5 37,45.5" fill="rgba(244,63,94,0.16)" stroke="#e11d48" stroke-width="2.2"/>
        <polygon points="52,39 64,38 63,45.5 53,45.5" fill="rgba(244,63,94,0.16)" stroke="#e11d48" stroke-width="2.2"/>
        <line x1="48" y1="41" x2="52" y2="41" stroke="#e11d48" stroke-width="2"/>
      `;
    } else if (c.eyes === 'SUNGLASSES_GOLD') {
      eyesSvg = `
        <path d="${browLeft}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="${browRight}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <rect x="36.5" y="37.8" width="11.8" height="7.8" rx="2" fill="#18181b" stroke="#fbbf24" stroke-width="2"/>
        <rect x="51.7" y="37.8" width="11.8" height="7.8" rx="2" fill="#18181b" stroke="#fbbf24" stroke-width="2"/>
        <line x1="48.3" y1="41" x2="51.7" y2="41" stroke="#fbbf24" stroke-width="2"/>
        <line x1="38.5" y1="39.8" x2="43" y2="43.5" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/>
      `;
    } else if (c.eyes === 'SUNGLASSES_DARK') {
      eyesSvg = `
        <path d="${browLeft}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="${browRight}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <rect x="36" y="38" width="28" height="7.5" rx="2" fill="#090d16" stroke="#38bdf8" stroke-width="1.8"/>
        <line x1="39" y1="40.5" x2="46" y2="40.5" stroke="#38bdf8" stroke-width="1.4"/>
      `;
    } else if (c.eyes === 'SMILE_EYES') {
      eyesSvg = `
        <path d="${browLeft}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="${browRight}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="M38.5 42 Q42.5 38 46.5 42" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M53.5 42 Q57.5 38 61.5 42" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
      `;
    } else {
      eyesSvg = baseEyes;
    }

    // 6. 입 & 수염 레이어
    let beardSvg = '';
    const mouthSvg = mood === 'ANGRY'
      ? `<path d="M45 55 Q50 51.5 55 55" fill="none" stroke="#7f1d1d" stroke-width="2.2" stroke-linecap="round"/>`
      : `<path d="M45.5 54 Q50 57 54.5 54" fill="none" stroke="#9f1239" stroke-width="2" stroke-linecap="round"/>`;

    if (c.beard === 'LONG_WHITE') {
      beardSvg = `
        <path d="M41 53 Q50 57 59 53 L56 76 Q50 82 44 76 Z" fill="#f8fafc" stroke="#64748b" stroke-width="1.8"/>
        <path d="M42 52 Q50 49 58 52" fill="none" stroke="#cbd5e1" stroke-width="2.8" stroke-linecap="round"/>
      `;
    } else if (c.beard === 'LONG_GRAY') {
      beardSvg = `
        <path d="M41 53 Q50 57 59 53 L55 75 Q50 80 45 75 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.8"/>
        <path d="M43 52 Q50 49.5 57 52" fill="none" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>
      `;
    } else if (c.beard === 'GOATEE_BLACK') {
      beardSvg = `
        ${mouthSvg}
        <path d="M44 52 Q50 49.5 56 52" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
        <polygon points="46,58 54,58 50,66" fill="${ink}"/>
      `;
    } else if (c.beard === 'MUSTACHE_CURL') {
      beardSvg = `
        ${mouthSvg}
        <path d="M39 52.5 Q45 55 50 51.5 Q55 55 61 52.5" fill="none" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="38.5" cy="52" r="1.5" fill="${ink}"/>
        <circle cx="61.5" cy="52" r="1.5" fill="${ink}"/>
      `;
    } else if (c.beard === 'MUSTACHE_FLAT') {
      beardSvg = `
        ${mouthSvg}
        <rect x="43" y="50.5" width="14" height="3.8" rx="1.5" fill="${ink}"/>
      `;
    } else if (c.beard === 'MUSTACHE_THIN') {
      beardSvg = `
        ${mouthSvg}
        <path d="M42 52.5 Q50 49.8 58 52.5" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round"/>
      `;
    } else if (c.beard === 'FULL_BUSHY') {
      beardSvg = `
        <path d="M35 47 C35 64, 42 68, 50 68 C58 68, 65 64, 65 47 C59 53, 55 53, 50 53 C45 53, 41 53, 35 47 Z" fill="#27201c" stroke="${ink}" stroke-width="1.8"/>
        <ellipse cx="50" cy="55" rx="3.5" ry="1.8" fill="#fca5a5"/>
      `;
    } else {
      beardSvg = mouthSvg;
    }

    // 7. 모자 & 헤드기어 레이어 (웹툰 원근감 적용)
    let hatSvg = '';
    if (c.hat === 'GAT_BLACK' || c.hat === 'GAT_RED_STRING') {
      hatSvg = `
        <path d="M38 10 L62 10 L64 25 L36 25 Z" fill="#18181b" stroke="${ink}" stroke-width="2"/>
        <ellipse cx="50" cy="25" rx="34" ry="5.5" fill="#18181b" stroke="#475569" stroke-width="2"/>
        ${c.hat === 'GAT_RED_STRING' ? `<path d="M36 26 Q50 62 64 26" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="3,1.5"/>` : ''}
      `;
    } else if (c.hat === 'FEDORA_BROWN' || c.hat === 'FEDORA_BLACK') {
      const isBr = c.hat === 'FEDORA_BROWN';
      const fCol = isBr ? '#78350f' : '#1e2024';
      const bandCol = isBr ? '#dc2626' : '#fbbf24';
      hatSvg = `
        <path d="M33 26 L38 11 Q50 14 62 11 L67 26 Z" fill="${fCol}" stroke="${ink}" stroke-width="2"/>
        <rect x="34.5" y="21.5" width="31" height="3.8" fill="${bandCol}" stroke="${ink}" stroke-width="1.2"/>
        <ellipse cx="50" cy="26" rx="27" ry="4.5" fill="${fCol}" stroke="${ink}" stroke-width="2"/>
      `;
    } else if (c.hat === 'BEANIE_RED' || c.hat === 'BEANIE_MINT') {
      const isRed = c.hat === 'BEANIE_RED';
      const bCol = isRed ? '#e11d48' : '#0d9488';
      const cuffCol = isRed ? '#9f1239' : '#115e59';
      hatSvg = `
        <path d="M33 29 C33 11, 67 11, 67 29 Z" fill="${bCol}" stroke="${ink}" stroke-width="2"/>
        <rect x="32" y="24" width="36" height="6.5" rx="2.5" fill="${cuffCol}" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.hat === 'CAP_BLUE' || c.hat === 'CAP_YELLOW') {
      const isBlue = c.hat === 'CAP_BLUE';
      const cCol = isBlue ? '#2563eb' : '#eab308';
      const visorCol = isBlue ? '#1d4ed8' : '#ca8a04';
      hatSvg = `
        <path d="M33 27 C33 12, 67 12, 67 27 Z" fill="${cCol}" stroke="${ink}" stroke-width="2"/>
        <path d="M32 25 L74 25 C75 29, 66 30, 50 29 L32 29 Z" fill="${visorCol}" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.hat === 'CROWN_GOLD') {
      hatSvg = `
        <polygon points="34,27 36,12 43,20 50,9 57,20 64,12 66,27" fill="#fbbf24" stroke="${ink}" stroke-width="2"/>
        <circle cx="50" cy="19" r="2.6" fill="#ef4444" stroke="${ink}" stroke-width="1.2"/>
      `;
    } else if (c.hat === 'TIARA_SILVER') {
      hatSvg = `
        <polygon points="36,27 40,15 45,21 50,11 55,21 60,15 64,27" fill="#e2e8f0" stroke="${ink}" stroke-width="1.8"/>
        <circle cx="50" cy="19" r="2.5" fill="#ec4899" stroke="${ink}" stroke-width="1.2"/>
      `;
    } else if (c.hat === 'HEADBAND_RED') {
      hatSvg = `
        <path d="M34 26 L38 14 L44 22 L50 12 L56 22 L62 14 L66 26 Z" fill="#18181b" stroke="${ink}" stroke-width="1.8"/>
        <rect x="33" y="23.5" width="34" height="5.5" rx="2" fill="#ef4444" stroke="${ink}" stroke-width="1.8"/>
        <polygon points="67,25 76,21 73,29" fill="#ef4444" stroke="${ink}" stroke-width="1.5"/>
      `;
    } else if (c.hat === 'BANDANA_WHITE') {
      hatSvg = `
        <path d="M33 28 Q50 11 67 28 Z" fill="#f8fafc" stroke="${ink}" stroke-width="2"/>
        <circle cx="68" cy="27" r="3" fill="#e2e8f0" stroke="${ink}" stroke-width="1.5"/>
      `;
    }

    // 8. 화났을 때 빠직(💢) 심볼
    const angerMarkSvg = mood === 'ANGRY'
      ? `<g transform="translate(64, 16)">
           <path d="M2 6 Q7 6 7 2 M11 2 Q11 6 16 6 M16 10 Q11 10 11 15 M7 15 Q7 10 2 10" fill="none" stroke="#ef4444" stroke-width="2.8" stroke-linecap="round"/>
         </g>`
      : '';

    const heightPx = Math.round(size * 1.12);

    return `
      <svg width="${size}" height="${heightPx}" viewBox="0 0 100 112" class="tycoon-cust-avatar-svg ${mood === 'ANGRY' ? 'cust-angry-shake' : ''}" style="overflow:visible; filter:drop-shadow(0 5px 10px rgba(0,0,0,0.55));">
        ${backHairSvg}
        ${torsoSvg}
        ${headAndEarsSvg}
        ${frontHairSvg}
        ${eyesSvg}
        ${beardSvg}
        ${hatSvg}
        ${angerMarkSvg}
      </svg>
    `;
  }
}

window.KSool.TycoonCustomerPool = TycoonCustomerPool;
