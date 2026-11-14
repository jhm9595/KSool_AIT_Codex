window.KSool = window.KSool || {};

/**
 * 🍸 주점 타이쿤 (Tycoon Main Game) - 손님 도감 & 웹툰 셀 채색(Cel-Shaded) 상반신 캐릭터 렌더러
 *
 * [핵심 기획]
 * - 배경 일러스트(길거리 노점 ~ 사이버펑크 바)의 코믹 잉크 라인아트 & 셀 채색(Webtoon Cel-Shading) 화풍에 맞춰,
 *   카운터 바 앞으로 걸어와 서 있는 상반신 인물 일러스트로 렌더링합니다.
 * - 6개 점포 테마(노점, 포차, 골목 주점, 펍, 라운지 바, 미래도시 바)와 69종의 모든 판매 음료에
 *   1:1로 완벽 매핑된 69명의 트렌디하고 개성 넘치는 현대 캐릭터들이 등장합니다.
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
      // =========================================================================
      // === STAGE 1: 길거리 노점 (10명, No.01~No.18 무알콜·음료·에이드) ===
      // =========================================================================
      {
        id: 'cust_01',
        group: '노점단골',
        name: '민우',
        title: '아침 조깅러',
        traitHint: '블루 볼캡 · 웃는 눈 · 트레이닝복',
        skin: '#f5d0a9',
        hat: 'CAP_BLUE',
        hair: 'SHORT_CURL',
        eyes: 'SMILE_EYES',
        beard: 'NONE',
        outfit: 'TRACKSUIT_BLUE',
        accent: '#38bdf8',
        preferredRecipeId: 12, // No.02 탄산수
        greeting: '한 바퀴 뛰고 나니 목이 타네요! 톡 쏘는 시원한 탄산수 한 잔 부탁드려요!'
      },
      {
        id: 'cust_02',
        group: '노점단골',
        name: '지훈',
        title: '자전거 라이더',
        traitHint: '오렌지 자켓 · 선글라스 · 숏컷',
        skin: '#f1c292',
        hat: 'NONE',
        hair: 'SIDE_SHAVE',
        eyes: 'SUNGLASSES_DARK',
        beard: 'NONE',
        outfit: 'JACKET_ORANGE',
        accent: '#f97316',
        preferredRecipeId: 58, // No.03 사이다
        greeting: '한강 라이딩 코스 완주 기념! 청량한 사이다 한 잔 시원하게 마시고 갈게요!'
      },
      {
        id: 'cust_03',
        group: '노점단골',
        name: '제이든',
        title: '스트릿 힙스터',
        traitHint: '빨간 비니 · 굵은 뿔테안경 · 보라 후드',
        skin: '#f6d2ad',
        hat: 'BEANIE_RED',
        hair: 'SIDE_SHAVE',
        eyes: 'HORN_GLASSES',
        beard: 'NONE',
        outfit: 'HOODIE_PURPLE',
        accent: '#f43f5e',
        preferredRecipeId: 14, // No.04 레몬에이드
        greeting: 'Yo! 빨간 비니에 보라 후드 제이든이야! 길거리 노점에선 상큼한 레몬에이드가 최고지!'
      },
      {
        id: 'cust_04',
        group: '노점단골',
        name: '유나',
        title: '홈바 믹솔로지스트',
        traitHint: '단발머리 · 둥근안경 · 캐주얼 셔츠',
        skin: '#fae1c3',
        hat: 'NONE',
        hair: 'BOB_CUT',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'CASUAL_SHIRT',
        accent: '#06b6d4',
        preferredRecipeId: 52, // No.05 토닉워터
        greeting: '안녕하세요! 홈바 조합 재료로 쓸 깔끔한 토닉워터 부탁드릴게요.'
      },
      {
        id: 'cust_05',
        group: '노점단골',
        name: '태오',
        title: '스케이트보더',
        traitHint: '노란 캡모자 · 샤프한 눈 · 블랙 후드',
        skin: '#f5d0a9',
        hat: 'CAP_YELLOW',
        hair: 'SHORT_CURL',
        eyes: 'SHARP_EYES',
        beard: 'NONE',
        outfit: 'HOODIE_BLACK',
        accent: '#eab308',
        preferredRecipeId: 15, // No.06 밀크소다
        greeting: '보드 타다 마시는 부드럽고 톡 쏘는 밀크소다! 한 잔 시원하게 주세요!'
      },
      {
        id: 'cust_06',
        group: '노점단골',
        name: '소희',
        title: '새내기 대학생',
        traitHint: '베레모 · 단발머리 · 핑크 스웨터',
        skin: '#fdf0df',
        hat: 'BERET',
        hair: 'BOB_CUT',
        eyes: 'SMILE_EYES',
        beard: 'NONE',
        outfit: 'SWEATER_PINK',
        accent: '#ec4899',
        preferredRecipeId: 34, // No.07 딸기우유
        greeting: '강의 끝나고 오는 길이에요~ 달콤하고 부드러운 딸기우유 한 잔 부탁해요!'
      },
      {
        id: 'cust_07',
        group: '노점단골',
        name: '준혁',
        title: '동네 마실러',
        traitHint: '헤어밴드 · 스마일 · 캐주얼 셔츠',
        skin: '#f5d0a9',
        hat: 'HEADBAND_RED',
        hair: 'SHORT_CURL',
        eyes: 'SMILE_EYES',
        beard: 'NONE',
        outfit: 'CASUAL_SHIRT',
        accent: '#eab308',
        preferredRecipeId: 35, // No.08 바나나우유
        greeting: '동네 목욕탕 다녀오는 길입니다! 든든하고 달콤한 바나나우유가 딱이죠!'
      },
      {
        id: 'cust_08',
        group: '노점단골',
        name: '도현',
        title: '열공 취준생',
        traitHint: '단정한 뿔테안경 · 포마드 · 카키 조끼',
        skin: '#f7d5b1',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'HORN_GLASSES',
        beard: 'NONE',
        outfit: 'VEST_KHAKI',
        accent: '#84cc16',
        preferredRecipeId: 59, // No.09 배음료
        greeting: '공부하다 머리 식히러 나왔어요. 시원하고 달콤한 갈아만든 배음료 한 잔 부탁합니다!'
      },
      {
        id: 'cust_09',
        group: '노점단골',
        name: '수아',
        title: '단골 고등학생',
        traitHint: '포니테일 · 둥근안경 · 핑크 스웨터',
        skin: '#fbe2c4',
        hat: 'NONE',
        hair: 'PONYTAIL',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'SWEATER_PINK',
        accent: '#a855f7',
        preferredRecipeId: 29, // No.17 초코우유
        greeting: '야자 끝나고 당 충전하러 왔어요! 진하고 달달한 초코우유 주세요!'
      },
      {
        id: 'cust_10',
        group: '노점단골',
        name: '현석',
        title: '헬스 매니아',
        traitHint: '헤어밴드 · 날카로운 눈 · 트레이닝복',
        skin: '#ebb483',
        hat: 'HEADBAND_RED',
        hair: 'SPIKY_BLACK',
        eyes: 'SHARP_EYES',
        beard: 'NONE',
        outfit: 'TRACKSUIT_BLUE',
        accent: '#ef4444',
        preferredRecipeId: 22, // No.18 토마토주스
        greeting: '오운완! 라이코펜 듬뿍 들어간 건강한 토마토주스 한 잔 마셔줘야죠!'
      },

      // =========================================================================
      // === STAGE 2: 이모네 포장마차 (18명, No.19~No.37 포차 안주 & 기초 주류) ===
      // =========================================================================
      {
        id: 'cust_11',
        group: '포차단골',
        name: '김대리',
        title: '칼퇴 직장인',
        traitHint: '둥근안경 · 셔츠 넥타이 · 깔끔한 포마드',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#3b82f6',
        preferredRecipeId: 5, // No.19 소주
        greeting: '오늘 하루도 치열했습니다! 퇴근길 포차에선 역시 깔끔한 소주 한 잔이죠!'
      },
      {
        id: 'cust_12',
        group: '포차단골',
        name: '박과장',
        title: '포차 단골 과장',
        traitHint: '짧은 턱수염 · 카키 조끼 · 둥근안경',
        skin: '#f1c292',
        hat: 'NONE',
        hair: 'SHORT_CURL',
        eyes: 'ROUND_GLASSES',
        beard: 'GOATEE_BLACK',
        outfit: 'VEST_KHAKI',
        accent: '#10b981',
        preferredRecipeId: 20, // No.20 매실주
        greeting: '과음하지 않고 은은하게 달콤한 매실주 한 잔 마시러 왔네. 부탁하네!'
      },
      {
        id: 'cust_13',
        group: '포차단골',
        name: '강주임',
        title: '야근 피로회복러',
        traitHint: '뿔테안경 · 단발머리 · 캐주얼 셔츠',
        skin: '#f7d5b1',
        hat: 'NONE',
        hair: 'BOB_CUT',
        eyes: 'HORN_GLASSES',
        beard: 'NONE',
        outfit: 'CASUAL_SHIRT',
        accent: '#6366f1',
        preferredRecipeId: 19, // No.21 링겔주
        greeting: '야근 피로엔 소주와 매화수가 만난 링겔주가 직효약이죠! 한 병 말아주세요!'
      },
      {
        id: 'cust_14',
        group: '포차단골',
        name: '레오',
        title: '인디 댄서',
        traitHint: '민트 비니 · 선글라스 · 얇은 콧수염 · 블랙 후드',
        skin: '#f1c292',
        hat: 'BEANIE_MINT',
        hair: 'SIDE_SHAVE',
        eyes: 'SUNGLASSES_DARK',
        beard: 'MUSTACHE_THIN',
        outfit: 'HOODIE_BLACK',
        accent: '#14b8a6',
        preferredRecipeId: 9, // No.22 레몬소주
        greeting: '민트 비니에 선글라스 레오야! 상큼하게 톡 쏘는 레몬소주가 내 시그니처지.'
      },
      {
        id: 'cust_15',
        group: '포차단골',
        name: '민지',
        title: '동네 분위기메이커',
        traitHint: '올림머리 · 스마일 눈 · 보라 후드',
        skin: '#fdf0df',
        hat: 'NONE',
        hair: 'UPDO_BUN',
        eyes: 'SMILE_EYES',
        beard: 'NONE',
        outfit: 'HOODIE_PURPLE',
        accent: '#22c55e',
        preferredRecipeId: 80, // No.23 올때메론주
        greeting: '메론 아이스크림 바가 퐁당 빠진 올때메론주! 달콤해서 너무 좋아요~'
      },
      {
        id: 'cust_16',
        group: '포차단골',
        name: '승우',
        title: '바캉스 청년',
        traitHint: '골드 선글라스 · 스파이키 헤어 · 블루 트랙수트',
        skin: '#ebb483',
        hat: 'NONE',
        hair: 'SPIKY_BLACK',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'NONE',
        outfit: 'TRACKSUIT_BLUE',
        accent: '#0284c7',
        preferredRecipeId: 81, // No.24 상어바주
        greeting: '바다의 청량함을 그대로 담은 상어바주 한 잔! 시원하게 부탁해요!'
      },
      {
        id: 'cust_17',
        group: '포차단골',
        name: '채원',
        title: '달콤파 입맛 동기',
        traitHint: '베레모 · 레드 안경 · 핑크 스웨터',
        skin: '#fae1c3',
        hat: 'BERET',
        hair: 'BOB_CUT',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'SWEATER_PINK',
        accent: '#e11d48',
        preferredRecipeId: 30, // No.25 초코방울주
        greeting: '초코에 퐁당 빠진 달콤한 칵테일 소주! 초코방울주 한 잔 주세요~'
      },
      {
        id: 'cust_18',
        group: '포차단골',
        name: '황반장',
        title: '동네 호탕 반장님',
        traitHint: '파란 캡모자 · 둥근안경 · 산적수염 · 카키 조끼',
        skin: '#ebb483',
        hat: 'CAP_BLUE',
        hair: 'SHORT_CURL',
        eyes: 'ROUND_GLASSES',
        beard: 'FULL_BUSHY',
        outfit: 'VEST_KHAKI',
        accent: '#3b82f6',
        preferredRecipeId: 4, // No.26 맥주
        greeting: '허허! 파란 모자 황반장이야! 목 넘김 시원한 생맥주 한 잔 시원하게 주소!'
      },
      {
        id: 'cust_19',
        group: '포차단골',
        name: '구보씨',
        title: '퇴근길 신사',
        traitHint: '갈색 중절모 · 카이저 콧수염 · 빨간 나비넥타이',
        skin: '#f7d5b1',
        hat: 'FEDORA_BROWN',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'MUSTACHE_CURL',
        outfit: 'SUIT_BOWTIE_RED',
        accent: '#fb923c',
        preferredRecipeId: 1, // No.27 소맥
        greeting: '빨간 나비넥타이에 콧수염 구보요! 퇴근길 포차에선 역시 시원한 소맥 아니겠소?'
      },
      {
        id: 'cust_20',
        group: '포차단골',
        name: '변사장',
        title: '동네 세탁소 사장님',
        traitHint: '노란 캡모자 · 뿔테안경 · 일자 콧수염 · 카키 조끼',
        skin: '#f5d0a9',
        hat: 'CAP_YELLOW',
        hair: 'SHORT_CURL',
        eyes: 'HORN_GLASSES',
        beard: 'MUSTACHE_FLAT',
        outfit: 'VEST_KHAKI',
        accent: '#ca8a04',
        preferredRecipeId: 73, // No.28 밀크소다주
        greeting: '노란 모자 변사장입니다. 부드럽게 톡 쏘는 밀크소다주 한 잔 부탁하오!'
      },
      {
        id: 'cust_21',
        group: '포차단골',
        name: '시우',
        title: '동아리 회장',
        traitHint: '헤드폰 목에 건 청년 · 캐주얼 셔츠',
        skin: '#f6d2ad',
        hat: 'HEADPHONES',
        hair: 'SIDE_SHAVE',
        eyes: 'SMILE_EYES',
        beard: 'NONE',
        outfit: 'CASUAL_SHIRT',
        accent: '#10b981',
        preferredRecipeId: 21, // No.29 맥사토
        greeting: '맥주에 사이다와 토마토의 조화! 상큼한 맥사토 한 잔 말아주세요!'
      },
      {
        id: 'cust_22',
        group: '포차단골',
        name: '케이시',
        title: '스트릿 래퍼',
        traitHint: '빨간 비니 · 선글라스 · 턱수염 · 검정 후드',
        skin: '#f6d2ad',
        hat: 'BEANIE_RED',
        hair: 'SIDE_SHAVE',
        eyes: 'SUNGLASSES_DARK',
        beard: 'GOATEE_BLACK',
        outfit: 'HOODIE_BLACK',
        accent: '#e11d48',
        preferredRecipeId: 18, // No.30 소콜
        greeting: 'Yo! 빨간 비니에 선글라스 케이시야! 콜라의 달달함이 살아있는 소콜 한 잔 줘!'
      },
      {
        id: 'cust_23',
        group: '포차단골',
        name: '지은',
        title: '러닝 크루 리더',
        traitHint: '포니테일 · 날카로운 눈 · 블루 트랙수트',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'PONYTAIL',
        eyes: 'SHARP_EYES',
        beard: 'NONE',
        outfit: 'TRACKSUIT_BLUE',
        accent: '#84cc16',
        preferredRecipeId: 53, // No.31 깔라만시 원액
        greeting: '비타민 충전 제대로 되는 새콤짜릿한 깔라만시 원액 부탁드려요!'
      },
      {
        id: 'cust_24',
        group: '포차단골',
        name: '진호',
        title: '회식 2차차 직장인',
        traitHint: '포마드 헤어 · 넥타이 푼 셔츠 · 일자 콧수염',
        skin: '#f1c292',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'SMILE_EYES',
        beard: 'MUSTACHE_FLAT',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#a3e635',
        preferredRecipeId: 54, // No.32 깔라만시주
        greeting: '숙취 걱정 덜어주는 깔라만시주 한 병! 상큼하게 마시고 내일도 화이팅!'
      },
      {
        id: 'cust_25',
        group: '포차단골',
        name: '이상씨',
        title: '감성 시인',
        traitHint: '갈색 중절모 · 둥근안경 · 턱수염 · 파란 넥타이',
        skin: '#f7d5b1',
        hat: 'FEDORA_BROWN',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'GOATEE_BLACK',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#38bdf8',
        preferredRecipeId: 65, // No.34 아이스 아메리카노
        greeting: '술자리의 마무리는 언제나 차갑고 쌉싸름한 아이스 아메리카노라오.'
      },
      {
        id: 'cust_26',
        group: '포차단골',
        name: '윤아',
        title: '수험생 멘토',
        traitHint: '단발머리 · 둥근안경 · 핑크 스웨터',
        skin: '#fdf0df',
        hat: 'NONE',
        hair: 'BOB_CUT',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'SWEATER_PINK',
        accent: '#f43f5e',
        preferredRecipeId: 78, // No.35 소원주
        greeting: '소주에 원두커피가 어우러진 소원주! 오늘 소원 하나 빌고 마실게요.'
      },
      {
        id: 'cust_27',
        group: '포차단골',
        name: '민서',
        title: '동네 바리스타',
        traitHint: '갈색 에이프런 · 뿔테안경 · 깔끔한 숏컷',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'SHORT_CURL',
        eyes: 'HORN_GLASSES',
        beard: 'NONE',
        outfit: 'APRON_BROWN',
        accent: '#d97706',
        preferredRecipeId: 83, // No.36 조선 깔루아 밀크
        greeting: '달콤 쌉싸름한 커피와 우유, 소주의 마법! 조선 깔루아 밀크 한 잔 부탁해요.'
      },
      {
        id: 'cust_28',
        group: '포차단골',
        name: '민트민',
        title: '컬러풀 아티스트',
        traitHint: '민트 비니 · 굵은 뿔테안경 · 보라 후드',
        skin: '#fbe2c4',
        hat: 'BEANIE_MINT',
        hair: 'BOB_CUT',
        eyes: 'HORN_GLASSES',
        beard: 'NONE',
        outfit: 'HOODIE_PURPLE',
        accent: '#2dd4bf',
        preferredRecipeId: 16, // No.37 망고비어
        greeting: '민트 비니에 보라 후드! 달콤 트로피컬한 망고비어 한 잔 부탁해요!'
      },

      // =========================================================================
      // === STAGE 3: 골목 전통 주점 (12명, No.38~No.55 전통 막걸리·식혜·복분자주) ===
      // =========================================================================
      {
        id: 'cust_29',
        group: '주점단골',
        name: '한결',
        title: '전통주 소믈리에',
        traitHint: '단정한 포마드 · 둥근 메탈안경 · 린넨 셔츠',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'CASUAL_SHIRT',
        accent: '#f59e0b',
        preferredRecipeId: 26, // No.39 막걸리
        greeting: '골목 주점의 진정한 맛! 구수하고 뽀얀 생막걸리 한 사발 부탁드립니다.'
      },
      {
        id: 'cust_30',
        group: '주점단골',
        name: '영호',
        title: '전통 약초 연구가',
        traitHint: '하얀 헤어밴드 · 둥근안경 · 얇은 콧수염 · 갈색 에이프런',
        skin: '#f5d0a9',
        hat: 'HEADBAND_RED',
        hair: 'SHORT_CURL',
        eyes: 'ROUND_GLASSES',
        beard: 'MUSTACHE_THIN',
        outfit: 'APRON_BROWN',
        accent: '#d97706',
        preferredRecipeId: 60, // No.40 식혜
        greeting: '엿기름과 쌀의 깊은 발효 단맛! 살얼음 동동 띄운 시원한 식혜 한 그릇 주시오.'
      },
      {
        id: 'cust_31',
        group: '주점단골',
        name: '오기사',
        title: '등산 동호회장',
        traitHint: '노란 캡모자 · 스마일 눈 · 오렌지 아웃도어 자켓',
        skin: '#ebb483',
        hat: 'CAP_YELLOW',
        hair: 'SHORT_CURL',
        eyes: 'SMILE_EYES',
        beard: 'FULL_BUSHY',
        outfit: 'JACKET_ORANGE',
        accent: '#f97316',
        preferredRecipeId: 42, // No.41 식혜 막걸리
        greeting: '산행 후 마시는 꿀맛! 밥알 동동 식혜 막걸리 한 대접 시원하게 말아주게!'
      },
      {
        id: 'cust_32',
        group: '주점단골',
        name: '예린',
        title: '골목 맛집러',
        traitHint: '베레모 · 단발머리 · 핑크 스웨터',
        skin: '#fdf0df',
        hat: 'BERET',
        hair: 'BOB_CUT',
        eyes: 'SMILE_EYES',
        beard: 'NONE',
        outfit: 'SWEATER_PINK',
        accent: '#f43f5e',
        preferredRecipeId: 38, // No.42 딸기 막걸리
        greeting: 'SNS에서 난리 난 비주얼! 분홍빛 달콤한 딸기 막걸리 한 잔 부탁해요!'
      },
      {
        id: 'cust_33',
        group: '주점단골',
        name: '성민',
        title: '달콤 퓨전파',
        traitHint: '버킷햇 · 날카로운 눈 · 캐주얼 셔츠',
        skin: '#f5d0a9',
        hat: 'BUCKET_HAT',
        hair: 'SIDE_SHAVE',
        eyes: 'SHARP_EYES',
        beard: 'NONE',
        outfit: 'CASUAL_SHIRT',
        accent: '#eab308',
        preferredRecipeId: 44, // No.43 바나나우유 막걸리
        greeting: '바나나우유와 부드러운 막걸리의 황금 조합! 바나나 막걸리 주세요!'
      },
      {
        id: 'cust_34',
        group: '주점단골',
        name: '건우',
        title: '과수원 청년',
        traitHint: '갈색 중절모 · 턱수염 · 카키 조끼',
        skin: '#f1c292',
        hat: 'FEDORA_BROWN',
        hair: 'POMADE',
        eyes: 'SMILE_EYES',
        beard: 'GOATEE_BLACK',
        outfit: 'VEST_KHAKI',
        accent: '#84cc16',
        preferredRecipeId: 46, // No.44 배 막걸리
        greeting: '나주 배의 달콤하고 시원한 과즙이 담긴 배 막걸리 한 잔 올립니다!'
      },
      {
        id: 'cust_35',
        group: '주점단골',
        name: '다솜',
        title: '새참 챙기는 청년',
        traitHint: '올림머리 · 둥근안경 · 갈색 앞치마',
        skin: '#fbe2c4',
        hat: 'NONE',
        hair: 'UPDO_BUN',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'APRON_BROWN',
        accent: '#06b6d4',
        preferredRecipeId: 48, // No.47 요구르트 막걸리
        greeting: '새콤달콤 유산균 가득! 새참으로 최고인 요구르트 막걸리 부탁해요~'
      },
      {
        id: 'cust_36',
        group: '주점단골',
        name: '은비',
        title: '디저트 셰프',
        traitHint: '셰프복 · 단발머리 · 레드 안경',
        skin: '#fdf0df',
        hat: 'NONE',
        hair: 'BOB_CUT',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'CHEF_WHITE',
        accent: '#fb7185',
        preferredRecipeId: 45, // No.48 복숭아 막걸리
        greeting: '복숭아 향이 입안 가득 퍼지는 복숭아 막걸리 한 잔 맛보고 싶어요!'
      },
      {
        id: 'cust_37',
        group: '주점단골',
        name: '하준',
        title: '트렌드세터',
        traitHint: '선글라스 머리에 얹은 청년 · 블랙 가죽자켓',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'SIDE_SHAVE',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'MUSTACHE_THIN',
        outfit: 'LEATHER_JACKET',
        accent: '#eab308',
        preferredRecipeId: 47, // No.49 파인애플 막걸리
        greeting: '트로피컬한 달콤함과 전통주의 만남! 파인애플 막걸리 한 병 주시오!'
      },
      {
        id: 'cust_38',
        group: '주점단골',
        name: '최부장',
        title: '기력 보충 부장님',
        traitHint: '포마드 헤어 · 샤프한 눈 · 블루 정장',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'SHARP_EYES',
        beard: 'MUSTACHE_FLAT',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#7e22ce',
        preferredRecipeId: 57, // No.50 복분자주
        greeting: '오늘 하루 기력 충전엔 진한 자줏빛 복분자주 한 잔이 최고지!'
      },
      {
        id: 'cust_39',
        group: '주점단골',
        name: '서연',
        title: '필라테스 강사',
        traitHint: '포니테일 · 날카로운 눈 · 블루 트랙수트',
        skin: '#fae1c3',
        hat: 'NONE',
        hair: 'PONYTAIL',
        eyes: 'SHARP_EYES',
        beard: 'NONE',
        outfit: 'TRACKSUIT_BLUE',
        accent: '#e11d48',
        preferredRecipeId: 64, // No.52 홍초
        greeting: '새콤한 활력 충전! 몸이 가벼워지는 시원한 홍초 한 잔 주세요!'
      },
      {
        id: 'cust_40',
        group: '주점단골',
        name: '로이',
        title: '칵테일 아티스트',
        traitHint: '버킷햇 · 외알안경 · 보라 예복',
        skin: '#f5d0a9',
        hat: 'BUCKET_HAT',
        hair: 'SIDE_SHAVE',
        eyes: 'MONOCLE_LEFT',
        beard: 'GOATEE_BLACK',
        outfit: 'ROYAL_PURPLE',
        accent: '#3b82f6',
        preferredRecipeId: 77, // No.53 태극주
        greeting: '붉고 푸른 두 층의 아름다운 조화! 환상적인 비주얼의 태극주를 부탁하오!'
      },

      // =========================================================================
      // === STAGE 4: 크래프트 비어 펍 (12명, No.56~No.67 펍 칵테일 & 에너지 폭탄주) ===
      // =========================================================================
      {
        id: 'cust_41',
        group: '펍단골',
        name: '루카스',
        title: '페스티벌 매니아',
        traitHint: '헤드폰 · 스마일 눈 · 보라 후드',
        skin: '#f6d2ad',
        hat: 'HEADPHONES',
        hair: 'SIDE_SHAVE',
        eyes: 'SMILE_EYES',
        beard: 'NONE',
        outfit: 'HOODIE_PURPLE',
        accent: '#38bdf8',
        preferredRecipeId: 75, // No.56 뽕가리스웨트
        greeting: '이온음료와 소주의 전설적인 조합! 페스티벌의 열정 뽕가리스웨트 한 잔 줘!'
      },
      {
        id: 'cust_42',
        group: '펍단골',
        name: '제우스',
        title: '프로게이머',
        traitHint: '헤드폰 · 뿔테안경 · 블랙 후드',
        skin: '#f5d0a9',
        hat: 'HEADPHONES',
        hair: 'SHORT_CURL',
        eyes: 'HORN_GLASSES',
        beard: 'NONE',
        outfit: 'HOODIE_BLACK',
        accent: '#22c55e',
        preferredRecipeId: 76, // No.57 에너자이저주
        greeting: '랭크전 연승 가자! 밤샘 집중력을 폭발시켜줄 에너자이저주 한 잔 부탁해!'
      },
      {
        id: 'cust_43',
        group: '펍단골',
        name: '올리버',
        title: '영국 유학파 신사',
        traitHint: '갈색 중절모 · 둥근안경 · 나비넥타이',
        skin: '#fdf0df',
        hat: 'FEDORA_BROWN',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'MUSTACHE_CURL',
        outfit: 'SUIT_BOWTIE_RED',
        accent: '#b45309',
        preferredRecipeId: 6, // No.58 홍차주
        greeting: '홍차의 은은한 베르가못 향과 소주의 조화! 품격 있는 홍차주 한 잔 주시오.'
      },
      {
        id: 'cust_44',
        group: '펍단골',
        name: '불주먹최씨',
        title: '열혈 펍 주방장',
        traitHint: '붉은 머리띠 · 날카로운 눈 · 산적수염 · 셰프복',
        skin: '#f2c396',
        hat: 'HEADBAND_RED',
        hair: 'SPIKY_BLACK',
        eyes: 'SHARP_EYES',
        beard: 'FULL_BUSHY',
        outfit: 'CHEF_WHITE',
        accent: '#ef4444',
        preferredRecipeId: 27, // No.59 막사
        greeting: '붉은 머리띠 불주먹 최씨요! 시원하고 톡 쏘는 막사 한 사발이면 피로가 싹 가시지!'
      },
      {
        id: 'cust_45',
        group: '펍단골',
        name: '성진',
        title: '로스터리 대표',
        traitHint: '블랙 가죽자켓 · 뿔테안경 · 단정한 포마드',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'HORN_GLASSES',
        beard: 'GOATEE_BLACK',
        outfit: 'LEATHER_JACKET',
        accent: '#78350f',
        preferredRecipeId: 79, // No.60 더치 라거
        greeting: '더치 커피의 묵직한 풍미와 시원한 맥주의 만남! 더치 라거 한 잔 부탁합니다.'
      },
      {
        id: 'cust_46',
        group: '펍단골',
        name: '지아',
        title: '불금 파티 리더',
        traitHint: '베레모 · 레드 안경 · 붉은 실크드레스',
        skin: '#fae1c3',
        hat: 'BERET',
        hair: 'BOB_CUT',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'SILK_RED',
        accent: '#ec4899',
        preferredRecipeId: 10, // No.61 복소사
        greeting: '복분자, 소주, 사이다의 환상 궁합! 파티의 주인공 복소사 한 잔 주세요!'
      },
      {
        id: 'cust_47',
        group: '펍단골',
        name: '덕배',
        title: '수제 앙금 장인',
        traitHint: '하얀 두건 · 둥근안경 · 갈색 앞치마',
        skin: '#f5d0a9',
        hat: 'HEADBAND_RED',
        hair: 'SHORT_CURL',
        eyes: 'ROUND_GLASSES',
        beard: 'MUSTACHE_FLAT',
        outfit: 'APRON_BROWN',
        accent: '#831843',
        preferredRecipeId: 82, // No.62 단팥 막걸리
        greeting: '달콤한 통단팥과 부드러운 막걸리의 조화! 단팥 막걸리 한 대접 주구려.'
      },
      {
        id: 'cust_48',
        group: '펍단골',
        name: '락희',
        title: '인디밴드 기타리스트',
        traitHint: '헝클어진 스파이키 헤어 · 선글라스 · 블랙 가죽자켓',
        skin: '#f1c292',
        hat: 'NONE',
        hair: 'SPIKY_BLACK',
        eyes: 'SUNGLASSES_DARK',
        beard: 'GOATEE_BLACK',
        outfit: 'LEATHER_JACKET',
        accent: '#f59e0b',
        preferredRecipeId: 24, // No.63 배배꼬인주
        greeting: '공연 끝나고 목 축일 땐 꼬인 일도 술술 풀리는 배배꼬인주 한 잔이지!'
      },
      {
        id: 'cust_49',
        group: '펍단골',
        name: '션',
        title: '브루어리 탭룸 매니저',
        traitHint: '민트 비니 · 얇은 콧수염 · 캐주얼 셔츠',
        skin: '#f5d0a9',
        hat: 'BEANIE_MINT',
        hair: 'SIDE_SHAVE',
        eyes: 'SHARP_EYES',
        beard: 'MUSTACHE_THIN',
        outfit: 'CASUAL_SHIRT',
        accent: '#14b8a6',
        preferredRecipeId: 33, // No.64 배즙보이주
        greeting: '탱크에서 갓 뽑아낸 듯 시원한 배즙보이주! 상큼 달콤하게 한 잔 말아줘요!'
      },
      {
        id: 'cust_50',
        group: '펍단골',
        name: '마크',
        title: '크로스핏 코치',
        traitHint: '스포티 헤어밴드 · 날카로운 눈 · 트레이닝복',
        skin: '#ebb483',
        hat: 'HEADBAND_RED',
        hair: 'SHORT_CURL',
        eyes: 'SHARP_EYES',
        beard: 'NONE',
        outfit: 'TRACKSUIT_BLUE',
        accent: '#eab308',
        preferredRecipeId: 8, // No.65 에너지주
        greeting: '짜릿한 부스터 한 모금! 밤새 지치지 않는 에너지주 한 잔 부탁합니다!'
      },
      {
        id: 'cust_51',
        group: '펍단골',
        name: '소라',
        title: '트로피컬 여행작가',
        traitHint: '골드 선글라스 · 포니테일 · 핑크 스웨터',
        skin: '#fae1c3',
        hat: 'NONE',
        hair: 'PONYTAIL',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'NONE',
        outfit: 'SWEATER_PINK',
        accent: '#f59e0b',
        preferredRecipeId: 17, // No.66 망고비어주
        greeting: '동남아 해변의 석양이 떠오르는 맛! 망고비어주 한 잔 시원하게 부탁해요!'
      },
      {
        id: 'cust_52',
        group: '펍단골',
        name: '백사장',
        title: '투자회사 대표',
        traitHint: '검은 중절모 · 금테 선글라스 · 카이저 콧수염 · 레드 나비넥타이',
        skin: '#f1c292',
        hat: 'FEDORA_BLACK',
        hair: 'POMADE',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'MUSTACHE_CURL',
        outfit: 'SUIT_BOWTIE_RED',
        accent: '#facc15',
        preferredRecipeId: 74, // No.67 고진감래주
        greeting: '검은 중절모에 금테 선글라스! 쓴맛 뒤에 찾아오는 달콤함, 고진감래주가 내 단골이지.'
      },

      // =========================================================================
      // === STAGE 5: 스카이라인 라운지 바 (10명, No.68~No.77 고급 황금비율 & VIP 칵테일) ===
      // =========================================================================
      {
        id: 'cust_53',
        group: '라운지VIP',
        name: '칼잡이류',
        title: '헤드 바텐더',
        traitHint: '클래식 포마드 · 날카로운 눈 · 얇은 콧수염 · 셰프복',
        skin: '#f2c396',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'SHARP_EYES',
        beard: 'MUSTACHE_THIN',
        outfit: 'CHEF_WHITE',
        accent: '#38bdf8',
        preferredRecipeId: 51, // No.68 소토닉
        greeting: '클래식 바텐더 류요. 청량한 탄산과 레몬 향이 어우러진 깔끔한 소토닉 한 잔 부탁하네.'
      },
      {
        id: 'cust_54',
        group: '라운지VIP',
        name: '마국장',
        title: '호텔 총지배인',
        traitHint: '검은 중절모 · 외알안경 · 파란 넥타이 정장',
        skin: '#f7d5b1',
        hat: 'FEDORA_BLACK',
        hair: 'POMADE',
        eyes: 'MONOCLE_LEFT',
        beard: 'NONE',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#818cf8',
        preferredRecipeId: 7, // No.69 만능열쇠 홍차주
        greeting: '외알안경에 검은 중절모 마국장이오. 황금비율로 완성된 만능열쇠 홍차주를 청하오.'
      },
      {
        id: 'cust_55',
        group: '라운지VIP',
        name: '에드워드',
        title: '벤처 투자자',
        traitHint: '골드 선글라스 · 포마드 · 블루 수트',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'MUSTACHE_THIN',
        outfit: 'SUIT_TIE_BLUE',
        accent: '#facc15',
        preferredRecipeId: 31, // No.70 황금소맥
        greeting: '3:7의 황금비율! 라운지에서 음미하는 부드러운 거품의 황금소맥 부탁드립니다.'
      },
      {
        id: 'cust_56',
        group: '라운지VIP',
        name: '클로이',
        title: 'VIP 파티 플래너',
        traitHint: '은빛 티아라 · 레드 안경 · 붉은 실크드레스',
        skin: '#fdf0df',
        hat: 'TIARA_SILVER',
        hair: 'UPDO_BUN',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'SILK_RED',
        accent: '#f59e0b',
        preferredRecipeId: 2, // No.71 꿀주
        greeting: '소주와 맥주가 황금비율로 만나 꿀맛이 나는 꿀주! 파티엔 이게 빠질 수 없죠!'
      },
      {
        id: 'cust_57',
        group: '라운지VIP',
        name: '혜원',
        title: '갤러리 디렉터',
        traitHint: '단아한 올림머리 · 둥근 메탈안경 · 보라 드레스',
        skin: '#fae1c3',
        hat: 'NONE',
        hair: 'UPDO_BUN',
        eyes: 'ROUND_GLASSES',
        beard: 'NONE',
        outfit: 'ROYAL_PURPLE',
        accent: '#d97706',
        preferredRecipeId: 39, // No.72 꿀 막걸리
        greeting: '아카시아 꿀의 그윽한 단맛이 깃든 프리미엄 꿀 막걸리 한 사발 부탁드립니다.'
      },
      {
        id: 'cust_58',
        group: '라운지VIP',
        name: '장셰프',
        title: '파인다이닝 오너',
        traitHint: '단정한 셰프복 · 뿔테안경 · 포마드',
        skin: '#f5d0a9',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'HORN_GLASSES',
        beard: 'MUSTACHE_FLAT',
        outfit: 'CHEF_WHITE',
        accent: '#d97706',
        preferredRecipeId: 43, // No.73 미숫가루 막걸리
        greeting: '곡물의 고소함과 발효주의 깊은 풍미! 정성껏 빚은 미숫가루 막걸리 주시오.'
      },
      {
        id: 'cust_59',
        group: '라운지VIP',
        name: '빅토리아',
        title: '미식 칼럼니스트',
        traitHint: '베레모 · 레드 안경 · 보라 드레스',
        skin: '#fdf0df',
        hat: 'BERET',
        hair: 'BOB_CUT',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'ROYAL_PURPLE',
        accent: '#f59e0b',
        preferredRecipeId: 49, // No.74 꿀 미숫가루 막걸리
        greeting: '고소한 미숫가루에 꿀 한 스푼의 풍미! 꿀 미숫가루 막걸리를 평가해보고 싶네요.'
      },
      {
        id: 'cust_60',
        group: '라운지VIP',
        name: '명동마님',
        title: 'VIP 컬렉터',
        traitHint: '은빛 티아라 · 레드 안경 · 붉은 실크드레스',
        skin: '#fdf0df',
        hat: 'TIARA_SILVER',
        hair: 'UPDO_BUN',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'SILK_RED',
        accent: '#ec4899',
        preferredRecipeId: 50, // No.75 석류 막걸리
        greeting: '은빛 티아라에 붉은 드레스 명동마님이에요~ 붉은 보석 같은 석류 막걸리 주세요!'
      },
      {
        id: 'cust_61',
        group: '라운지VIP',
        name: '서초마담',
        title: '아트 디렉터',
        traitHint: '은빛 티아라 · 금테 선글라스 · 붉은 실크드레스',
        skin: '#fdf0df',
        hat: 'TIARA_SILVER',
        hair: 'UPDO_BUN',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'NONE',
        outfit: 'SILK_RED',
        accent: '#eab308',
        preferredRecipeId: 40, // No.76 유자 막걸리
        greeting: '상큼한 남해 유자의 향기가 가득 퍼지는 유자 막걸리 한 잔 올리세요~'
      },
      {
        id: 'cust_62',
        group: '라운지VIP',
        name: '데이비드',
        title: '건축가',
        traitHint: '갈색 중절모 · 둥근안경 · 턱수염 · 나비넥타이',
        skin: '#f7d5b1',
        hat: 'FEDORA_BROWN',
        hair: 'POMADE',
        eyes: 'ROUND_GLASSES',
        beard: 'GOATEE_BLACK',
        outfit: 'SUIT_BOWTIE_RED',
        accent: '#10b981',
        preferredRecipeId: 41, // No.77 매실 막걸리
        greeting: '달콤 상큼한 매실의 풍미가 스며든 매실 막걸리 한 잔 부탁하오.'
      },

      // =========================================================================
      // === STAGE 6: 사이버펑크 미래도시 바 (7명, No.78~No.84 특산·브랜드 마스터 명주) ===
      // =========================================================================
      {
        id: 'cust_63',
        group: '미래네온',
        name: '제로',
        title: '네온 해커',
        traitHint: '사이버 바이저 · 네온 핑크 헤어 · 사이버 네온자켓',
        skin: '#fae1c3',
        hat: 'CYBER_VISOR',
        hair: 'NEON_PINK',
        eyes: 'CYBER_EYE',
        beard: 'NONE',
        outfit: 'CYBER_NEON',
        accent: '#06b6d4',
        preferredRecipeId: 68, // No.78 테스형라
        greeting: '네온 시티의 밤을 가르는 시그니처! 테라와 참이슬이 만난 테스형라 한 잔 뽑아줘!'
      },
      {
        id: 'cust_64',
        group: '미래네온',
        name: '잭',
        title: '사이버 용병',
        traitHint: '사이버 바이저 · 턱수염 · 사이버 네온자켓',
        skin: '#ebb483',
        hat: 'CYBER_VISOR',
        hair: 'SPIKY_BLACK',
        eyes: 'CYBER_EYE',
        beard: 'GOATEE_BLACK',
        outfit: 'CYBER_NEON',
        accent: '#38bdf8',
        preferredRecipeId: 69, // No.79 테진아
        greeting: '임무 완수 후 마시는 짜릿한 한 모금! 테라와 진로의 완벽한 조화 테진아 한 잔!'
      },
      {
        id: 'cust_65',
        group: '미래네온',
        name: '네오나',
        title: '홀로그램 팝스타',
        traitHint: '네온 핑크 헤어 · 레드 안경 · 붉은 실크드레스',
        skin: '#fdf0df',
        hat: 'NONE',
        hair: 'NEON_PINK',
        eyes: 'RED_GLASSES',
        beard: 'NONE',
        outfit: 'SILK_RED',
        accent: '#ec4899',
        preferredRecipeId: 70, // No.80 카아스처럼
        greeting: '은하계 콘서트 무대 뒤의 달콤한 충전! 카스와 처음처럼의 카아스처럼 부탁해요!'
      },
      {
        id: 'cust_66',
        group: '미래네온',
        name: '카일',
        title: '우주 무역상',
        traitHint: '블랙 가죽자켓 · 골드 선글라스 · 카이저 콧수염',
        skin: '#f1c292',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'MUSTACHE_CURL',
        outfit: 'LEATHER_JACKET',
        accent: '#3b82f6',
        preferredRecipeId: 71, // No.81 캘리포니아 이즈백
        greeting: '지구 귀환을 기념하는 전설의 명주! 캘리포니아 이즈백 한 병 오픈해주쇼!'
      },
      {
        id: 'cust_67',
        group: '미래네온',
        name: '앤',
        title: '안드로이드 바이어',
        traitHint: '실버 숏컷 · 사이버 바이저 · 사이버 네온자켓',
        skin: '#f5d0a9',
        hat: 'CYBER_VISOR',
        hair: 'SILVER_SHORT',
        eyes: 'CYBER_EYE',
        beard: 'NONE',
        outfit: 'CYBER_NEON',
        accent: '#facc15',
        preferredRecipeId: 72, // No.82 카스텔라
        greeting: '부드러움과 탄산감의 극한 연산 결과값! 카스텔라 한 잔 분석 부탁드립니다.'
      },
      {
        id: 'cust_68',
        group: '미래네온',
        name: '송명인',
        title: '시간여행 전통 명인',
        traitHint: '단아한 포마드 · 외알안경 · 보라 예복',
        skin: '#fae1c3',
        hat: 'NONE',
        hair: 'POMADE',
        eyes: 'MONOCLE_LEFT',
        beard: 'MUSTACHE_THIN',
        outfit: 'ROYAL_PURPLE',
        accent: '#10b981',
        preferredRecipeId: 55, // No.83 이천 수라상 생막걸리
        greeting: '이천 햅쌀의 정기를 담은 수라상 명주! 시공간을 초월한 이천 수라상 생막걸리를 내오게!'
      },
      {
        id: 'cust_69',
        group: '미래네온',
        name: '카이',
        title: '메가코프 총괄 CEO',
        traitHint: '사이버 바이저 · 골드 프레임 · 사이버 네온자켓',
        skin: '#f5d0a9',
        hat: 'CYBER_VISOR',
        hair: 'POMADE',
        eyes: 'SUNGLASSES_GOLD',
        beard: 'MUSTACHE_THIN',
        outfit: 'CYBER_NEON',
        accent: '#06b6d4',
        preferredRecipeId: 56, // No.84 제주 화산 쏘토닉
        greeting: '제주 화산 암반수와 한라산의 숨결! 전설의 제주 화산 쏘토닉으로 건배하지.'
      }
    ];

    const isOrderable = (r) => {
      if (!r) return false;
      if (!r.unlocks_ingredient_id) return true;
      const ing = this.recipeBook?.getBaseIngredient?.(r.unlocks_ingredient_id);
      return Boolean(ing && (ing.category_id === 'ALCOHOL' || ing.category_id === 'DRINK'));
    };

    const allRecipes = this.recipeBook ? this.recipeBook.getAllRecipes().filter(isOrderable) : [];
    const fallbackIds = allRecipes.map(r => r.recipe_id);

    this.customers = archetypes.map((arch, idx) => {
      let rec = this.recipeBook ? this.recipeBook.getRecipe(arch.preferredRecipeId) : null;
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
   * @param {object} customer
   * @param {number} size
   * @param {'NORMAL' | 'WARN' | 'ANGRY'} mood
   */
  renderCustomerAvatarSvg(customer, size = 96, mood = 'NORMAL') {
    if (!customer) return '🧑';
    const c = customer;
    const ink = '#1a1512';
    const skinBase = mood === 'ANGRY' ? '#f5b5a6' : (c.skin || '#f5d0a9');

    // 1. 뒷머리 레이어
    let backHairSvg = '';
    if (c.hair === 'BOB_CUT' || c.hair === 'UPDO_BUN') {
      backHairSvg = `
        <path d="M27 36 C24 52, 26 68, 33 73 L67 73 C74 68, 76 52, 73 36 Z" fill="#27201c" stroke="${ink}" stroke-width="2.2"/>
      `;
    } else if (c.hair === 'PONYTAIL') {
      backHairSvg = `
        <path d="M28 36 C26 48, 29 60, 35 66 L65 66 C71 60, 74 48, 72 36 Z" fill="#27201c" stroke="${ink}" stroke-width="2"/>
        <!-- 묶은 말총머리 -->
        <path d="M68 32 C78 30, 84 42, 82 56 C80 62, 74 60, 72 52 Z" fill="#1e1b18" stroke="${ink}" stroke-width="2"/>
      `;
    } else if (c.hair === 'NEON_PINK') {
      backHairSvg = `
        <path d="M26 34 C23 52, 25 70, 32 75 L68 75 C75 70, 77 52, 74 34 Z" fill="#ec4899" stroke="${ink}" stroke-width="2.2"/>
      `;
    } else if (c.hair === 'SILVER_SHORT') {
      backHairSvg = `
        <path d="M30 35 C28 46, 31 56, 35 61 L65 61 C69 56, 71 46, 69 35 Z" fill="#cbd5e1" stroke="${ink}" stroke-width="2"/>
      `;
    } else {
      backHairSvg = `
        <path d="M30 35 C28 46, 31 56, 35 61 L65 61 C69 56, 71 46, 69 35 Z" fill="#1e1b18" stroke="${ink}" stroke-width="2"/>
      `;
    }

    // 2. 목 & 상반신 의상
    let torsoSvg = '';
    const neckSvg = `
      <path d="M43 60 L43 76 L57 76 L57 60 Z" fill="${skinBase}" stroke="${ink}" stroke-width="2"/>
      <path d="M43 61 Q50 68 57 61 L57 67 Q50 71 43 67 Z" fill="rgba(120, 53, 15, 0.25)"/>
    `;

    if (c.outfit === 'SUIT_BOWTIE_RED' || c.outfit === 'SUIT_TIE_BLUE') {
      const isBow = c.outfit === 'SUIT_BOWTIE_RED';
      torsoSvg = `
        ${neckSvg}
        <path d="M14 112 C15 83, 25 72, 41 70 L59 70 C75 72, 85 83, 86 112 Z" fill="#262930" stroke="${ink}" stroke-width="2.4"/>
        <polygon points="41,70 50,98 59,70" fill="#f8fafc" stroke="${ink}" stroke-width="1.8"/>
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
        <path d="M31 74 C31 64, 69 64, 69 74 Z" fill="${hShade}" stroke="${ink}" stroke-width="2.2"/>
        <path d="M12 112 C14 82, 25 71, 38 70 L50 77 L62 70 C75 71, 86 82, 88 112 Z" fill="${hCol}" stroke="${ink}" stroke-width="2.4"/>
        <path d="M16 112 C18 90, 24 80, 32 76 L37 112 Z" fill="${hShade}"/>
        <path d="M84 112 C82 90, 76 80, 68 76 L63 112 Z" fill="${hShade}"/>
        <path d="M44 76 Q43 90 44 100" fill="none" stroke="${cordCol}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M56 76 Q57 90 56 100" fill="none" stroke="${cordCol}" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="26" y1="88" x2="24" y2="112" stroke="${ink}" stroke-width="1.8"/>
        <line x1="74" y1="88" x2="76" y2="112" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.outfit === 'VEST_KHAKI' || c.outfit === 'JACKET_ORANGE') {
      const isVest = c.outfit === 'VEST_KHAKI';
      const bodyCol = isVest ? '#4d6b31' : '#ea580c';
      const innerCol = isVest ? '#d6d3d1' : '#fed7aa';
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
    } else if (c.outfit === 'CASUAL_SHIRT') {
      torsoSvg = `
        ${neckSvg}
        <path d="M14 112 C15 83, 25 72, 40 70 L50 75 L60 70 C75 72, 85 83, 86 112 Z" fill="#f1f5f9" stroke="${ink}" stroke-width="2.4"/>
        <!-- 셔츠 칼라 -->
        <polygon points="40,70 48,82 43,84 37,73" fill="#ffffff" stroke="${ink}" stroke-width="1.6"/>
        <polygon points="60,70 52,82 57,84 63,73" fill="#ffffff" stroke="${ink}" stroke-width="1.6"/>
        <line x1="50" y1="78" x2="50" y2="112" stroke="${ink}" stroke-width="1.8"/>
        <circle cx="50" cy="88" r="1.5" fill="${ink}"/>
        <circle cx="50" cy="98" r="1.5" fill="${ink}"/>
      `;
    } else if (c.outfit === 'LEATHER_JACKET') {
      torsoSvg = `
        ${neckSvg}
        <path d="M13 112 C15 83, 25 72, 40 70 L50 78 L60 70 C75 72, 85 83, 87 112 Z" fill="#18181b" stroke="${ink}" stroke-width="2.4"/>
        <polygon points="41,70 49,94 37,84" fill="#27272a" stroke="${ink}" stroke-width="1.6"/>
        <polygon points="59,70 51,94 63,84" fill="#27272a" stroke="${ink}" stroke-width="1.6"/>
        <!-- 은색 지퍼 -->
        <line x1="50" y1="94" x2="50" y2="112" stroke="#94a3b8" stroke-width="2.2"/>
        <line x1="28" y1="88" x2="38" y2="98" stroke="#71717a" stroke-width="1.8"/>
      `;
    } else if (c.outfit === 'TRACKSUIT_BLUE') {
      torsoSvg = `
        ${neckSvg}
        <path d="M13 112 C15 83, 25 72, 40 70 L60 70 C75 72, 85 83, 87 112 Z" fill="#0284c7" stroke="${ink}" stroke-width="2.4"/>
        <!-- 어깨 흰색 스트라이프 -->
        <path d="M22 84 L27 112" stroke="#f8fafc" stroke-width="3" fill="none"/>
        <path d="M78 84 L73 112" stroke="#f8fafc" stroke-width="3" fill="none"/>
        <polygon points="42,70 50,88 58,70" fill="#f8fafc" stroke="${ink}" stroke-width="1.6"/>
        <line x1="50" y1="88" x2="50" y2="112" stroke="#38bdf8" stroke-width="2"/>
      `;
    } else if (c.outfit === 'SWEATER_PINK') {
      torsoSvg = `
        ${neckSvg}
        <path d="M13 112 C15 83, 25 72, 40 70 L60 70 C75 72, 85 83, 87 112 Z" fill="#f472b6" stroke="${ink}" stroke-width="2.4"/>
        <!-- 라운드 니트 넥 -->
        <path d="M38 70 Q50 78 62 70" fill="none" stroke="#db2777" stroke-width="3.5" stroke-linecap="round"/>
        <!-- 니트 주름 -->
        <path d="M28 92 Q32 102 30 112" fill="none" stroke="#db2777" stroke-width="1.6"/>
        <path d="M72 92 Q68 102 70 112" fill="none" stroke="#db2777" stroke-width="1.6"/>
      `;
    } else if (c.outfit === 'CYBER_NEON') {
      torsoSvg = `
        ${neckSvg}
        <path d="M12 112 C14 82, 24 71, 39 70 L50 78 L61 70 C76 71, 86 82, 88 112 Z" fill="#090d16" stroke="#06b6d4" stroke-width="2.4"/>
        <!-- 네온 발광 라인 -->
        <path d="M38 72 L49 92 L49 112" fill="none" stroke="#22d3ee" stroke-width="2.2"/>
        <path d="M62 72 L51 92 L51 112" fill="none" stroke="#f43f5e" stroke-width="2.2"/>
        <!-- 사이버 숄더 아머 -->
        <polygon points="18,85 28,78 35,90 22,96" fill="#1e293b" stroke="#38bdf8" stroke-width="1.6"/>
        <polygon points="82,85 72,78 65,90 78,96" fill="#1e293b" stroke="#f43f5e" stroke-width="1.6"/>
      `;
    } else {
      // APRON_BROWN
      torsoSvg = `
        ${neckSvg}
        <path d="M14 112 C15 83, 25 72, 40 70 L60 70 C75 72, 85 83, 86 112 Z" fill="#e2e8f0" stroke="${ink}" stroke-width="2.4"/>
        <path d="M33 72 L36 112 L64 112 L67 72 L61 72 L59 84 L41 84 L39 72 Z" fill="#78350f" stroke="${ink}" stroke-width="2"/>
      `;
    }

    // 3. 귀 & 얼굴 윤곽
    const headAndEarsSvg = `
      <path d="M34 41 C30 41, 29 49, 34 51" fill="${skinBase}" stroke="${ink}" stroke-width="2"/>
      <path d="M66 41 C70 41, 71 49, 66 51" fill="${skinBase}" stroke="${ink}" stroke-width="2"/>
      <path d="M34 31 C34 19, 66 19, 66 31 L65 46 C64 56, 56 64, 50 64 C44 64, 36 56, 35 46 Z" fill="${skinBase}" stroke="${ink}" stroke-width="2.2"/>
      <path d="M35 44 C36 54, 43 61, 49 63 C42 60, 38 52, 37 42 Z" fill="rgba(146, 64, 14, 0.16)"/>
      <path d="M49.5 41 L48.2 48 L51.5 48.8" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="50,48.5 53,48.5 51,50.5" fill="rgba(146, 64, 14, 0.22)"/>
    `;

    // 4. 풍성한 정수리 & 헤어스타일 레이어 (대머리/정수리 빈틈 완벽 커버)
    let frontHairSvg = '';
    const hairColor = c.hair === 'NEON_PINK' ? '#ec4899' : (c.hair === 'SILVER_SHORT' ? '#cbd5e1' : (c.hair === 'BOB_CUT' ? '#27201c' : '#1e1b18'));

    if (c.hair === 'BOB_CUT') {
      frontHairSvg = `
        <path d="M31 56 C30 40, 31 22, 36 14 C42 11, 58 11, 64 14 C69 22, 70 40, 69 56 C67 48, 65 36, 61 32 L56 36 L52 31 L45 36 L40 32 C36 36, 34 48, 31 56 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
      `;
    } else if (c.hair === 'POMADE') {
      frontHairSvg = `
        <path d="M33 38 C32 24, 33 15, 46 13 C56 12, 66 14, 68 22 C69 28, 68 34, 67 38 C66 33, 64 28, 56 27 C48 26, 40 29, 34 34 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
        <path d="M48 13 C52 18, 52 24, 46 28" fill="none" stroke="${ink}" stroke-width="1.3" opacity="0.45"/>
      `;
    } else if (c.hair === 'SIDE_SHAVE') {
      frontHairSvg = `
        <path d="M33 38 C32 24, 33 15, 45 14 C56 13, 66 15, 68 22 C69 28, 68 34, 67 38 C66 33, 62 29, 54 28 C46 27, 39 30, 34 34 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
        <path d="M43 14 C47 20, 48 26, 44 30" fill="none" stroke="${ink}" stroke-width="1.3" opacity="0.35"/>
      `;
    } else if (c.hair === 'SPIKY_BLACK') {
      frontHairSvg = `
        <path d="M33 38 L32 28 L30 20 L35 22 L37 13 L42 20 L46 11 L50 19 L54 11 L58 20 L63 13 L65 22 L70 20 L68 28 L67 38 C65 33, 61 29, 53 28 C45 27, 39 30, 34 34 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
      `;
    } else if (c.hair === 'NEON_PINK' || c.hair === 'SILVER_SHORT') {
      frontHairSvg = `
        <path d="M33 38 C32 24, 33 15, 45 13 C56 12, 66 14, 68 22 C69 28, 68 34, 67 38 C66 33, 62 28, 54 28 C46 27, 39 30, 34 34 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
        <path d="M41 15 Q50 12 59 15 M44 21 Q50 18 56 21" fill="none" stroke="${ink}" stroke-width="1.2" opacity="0.4"/>
      `;
    } else if (c.hair === 'UPDO_BUN') {
      frontHairSvg = `
        <!-- 정수리 똥머리 번 -->
        <circle cx="50" cy="10" r="8.5" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
        <path d="M46 9 Q50 6 54 9" fill="none" stroke="${ink}" stroke-width="1.3" opacity="0.4"/>
        <!-- 머리 본체 덮개 -->
        <path d="M33 38 C32 24, 34 16, 44 14 C50 14, 56 14, 66 16 C68 24, 68 34, 67 38 C66 33, 61 29, 53 29 C45 28, 39 31, 34 34 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
      `;
    } else if (c.hair === 'PONYTAIL') {
      frontHairSvg = `
        <path d="M33 38 C32 24, 33 16, 44 14 C54 13, 65 14, 67 22 C68 28, 68 34, 67 38 C66 33, 62 29, 54 28 C46 27, 39 30, 34 34 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
        <!-- 옆으로 묶은 말총머리 연결 -->
        <path d="M66 22 C78 18, 86 28, 84 46 C82 54, 74 52, 70 40 C68 34, 67 28, 66 22 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
      `;
    } else {
      // SHORT_CURL
      frontHairSvg = `
        <path d="M33 38 C31 28, 31 18, 38 14 C44 11, 56 11, 62 14 C69 18, 69 28, 67 38 C65 33, 61 29, 56 31 C51 27, 45 32, 40 28 C36 33, 34 36, 33 38 Z" fill="${hairColor}" stroke="${ink}" stroke-width="2"/>
        <path d="M37 17 Q43 14 49 17 M46 16 Q52 13 58 17 M40 23 Q45 20 50 23" fill="none" stroke="${ink}" stroke-width="1.2" opacity="0.4"/>
      `;
    }

    // 5. 눈·눈썹·안경 레이어
    const browLeft = mood === 'ANGRY' ? 'M38 35 L46 38' : 'M38 36 Q42 34 46 36';
    const browRight = mood === 'ANGRY' ? 'M62 35 L54 38' : 'M54 36 Q58 34 62 36';
    const baseEyes = `
      <path d="${browLeft}" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round"/>
      <path d="${browRight}" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round"/>
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
    } else if (c.eyes === 'CYBER_EYE') {
      eyesSvg = `
        <path d="${browLeft}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="${browRight}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="M38.5 41 Q42.5 38.5 46.5 41" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="42.5" cy="41.8" r="2.2" fill="${ink}"/>
        <!-- 사이버네틱 발광 의안 -->
        <circle cx="57.5" cy="41.8" r="3.6" fill="#06b6d4" stroke="#22d3ee" stroke-width="1.5"/>
        <circle cx="57.5" cy="41.8" r="1.5" fill="#ffffff"/>
      `;
    } else {
      eyesSvg = baseEyes;
    }

    // 6. 입 & 수염 레이어
    let beardSvg = '';
    const mouthSvg = mood === 'ANGRY'
      ? `<path d="M45 55 Q50 51.5 55 55" fill="none" stroke="#7f1d1d" stroke-width="2.2" stroke-linecap="round"/>`
      : `<path d="M45.5 54 Q50 57 54.5 54" fill="none" stroke="#9f1239" stroke-width="2" stroke-linecap="round"/>`;

    if (c.beard === 'GOATEE_BLACK') {
      beardSvg = `
        ${mouthSvg}
        <path d="M44 52 Q50 49.5 56 52" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
        <polygon points="46,58 54,58 50,65" fill="${ink}"/>
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

    // 7. 모자 & 헤드기어 레이어
    let hatSvg = '';
    if (c.hat === 'FEDORA_BROWN' || c.hat === 'FEDORA_BLACK') {
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
    } else if (c.hat === 'BUCKET_HAT') {
      hatSvg = `
        <path d="M36 24 L39 12 L61 12 L64 24 Z" fill="#475569" stroke="${ink}" stroke-width="2"/>
        <path d="M30 25 C34 22, 66 22, 70 25 L73 30 C63 28, 37 28, 27 30 Z" fill="#334155" stroke="${ink}" stroke-width="2"/>
      `;
    } else if (c.hat === 'HEADPHONES') {
      hatSvg = `
        <!-- 헤드폰 밴드 -->
        <path d="M28 42 C26 15, 74 15, 72 42" fill="none" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <!-- 양쪽 이어패드 -->
        <rect x="25" y="36" width="7" height="15" rx="3.5" fill="#ef4444" stroke="${ink}" stroke-width="1.8"/>
        <rect x="68" y="36" width="7" height="15" rx="3.5" fill="#ef4444" stroke="${ink}" stroke-width="1.8"/>
      `;
    } else if (c.hat === 'BERET') {
      hatSvg = `
        <ellipse cx="50" cy="22" rx="20" ry="7" fill="#7f1d1d" stroke="${ink}" stroke-width="2"/>
        <path d="M33 24 C34 18, 66 18, 67 24 Z" fill="#991b1b" stroke="${ink}" stroke-width="1.8"/>
        <circle cx="50" cy="15" r="1.8" fill="#7f1d1d"/>
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
    } else if (c.hat === 'CYBER_VISOR') {
      hatSvg = `
        <!-- 미래도시 네온 바이저 -->
        <polygon points="30,34 70,34 68,43 32,43" fill="rgba(6,182,212,0.5)" stroke="#06b6d4" stroke-width="2.2"/>
        <line x1="33" y1="38" x2="67" y2="38" stroke="#ffffff" stroke-width="1.4" opacity="0.8"/>
        <circle cx="31" cy="38" r="2.5" fill="#0891b2"/>
        <circle cx="69" cy="38" r="2.5" fill="#0891b2"/>
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
