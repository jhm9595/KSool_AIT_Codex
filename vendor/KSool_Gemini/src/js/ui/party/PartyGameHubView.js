window.KSool = window.KSool || {};

/**
 * 오프라인 술자리 패스앤플레이(Pass-and-Play) 미니게임 허브 뷰 (SPA 아키텍처)
 * - 5대 테이블탑 술게임 총괄 매니저
 * - 2-스테이지 SPA 뷰: [게임 목록 로비(Lobby)] <-> [전체화면 몰입형 플레이(Game Fullscreen)]
 * - 브라우저 History API 연동 (뒤로가기 버튼 / 모바일 뒤로가기 제스처 완벽 지원)
 * - Screen Wake Lock (게임 진행 중 화면 꺼짐 방지)
 * - 고출력 Web Audio 피드백 & Web Vibration
 * - 1초 내 빠른 재시작 풀스크린 벌칙 오버레이
 */
class PartyGameHubView {
  constructor(containerId = 'view-party', services = {}) {
    this.containerId = containerId;
    this.recipeBook = services.recipeBook || window.ksoolApp?.recipeBook || window.app?.recipeBook;
    this.inventory = services.inventory || window.ksoolApp?.inventory || window.app?.inventory;
    this.fridgeEngine = services.fridgeEngine || window.ksoolApp?.fridgeEngine || window.app?.fridgeEngine;
    this.brandResolver = services.brandResolver || window.ksoolApp?.brandResolver || window.app?.brandResolver;
    this.audio = services.audio || window.ksoolApp?.audio || window.app?.audio;
    this.sound = new window.KSool.PartySoundSynth();
    this.mode = 'lobby'; // 'lobby' | 'game'
    this.activeGameKey = null;
    this.wakeLock = null;
    this.toastTimer = null;

    // 10대 술게임 메타데이터 목록 (해금률 및 필요 조건 순서대로 정렬)
    // 0%: 기본 즉시 플레이 가능 (7종)
    // 10%: 연구실 소주·맥주 기본 재료 해금 (1종)
    // 50%: 도감 레시피 50% 이상 달성 (2종)
    this.gamesList = [
      {
        key: 'updown',
        emoji: '🧢',
        title: 'Up & Down',
        badge: '벌칙자 지목',
        accentColor: '#38bdf8',
        desc: '병뚜껑 속 숫자를 맞히는 게임',
        unlockReq: 0
      },
      {
        key: 'capflick',
        emoji: '👊',
        title: '병뚜껑 꼬다리 치기',
        badge: '릴레이 타격',
        accentColor: '#10b981',
        desc: '병뚜껑 꼬다리를 쳐서 날려버리는 게임',
        unlockReq: 0
      },
      {
        key: 'surface',
        emoji: '🌊',
        title: '표면장력 소주잔 채우기',
        badge: '블라인드 서바이벌',
        accentColor: '#06b6d4',
        desc: '표면장력 한계까지 술 채우기',
        unlockReq: 0
      },
      {
        key: 'bottlespin',
        emoji: '🍾',
        title: '소주병 돌리기',
        badge: '테이블 중앙',
        accentColor: '#f59e0b',
        desc: '소주병을 돌려 벌칙자를 지목하는 게임',
        unlockReq: 0
      },
      {
        key: 'hunmin',
        emoji: '💣',
        title: '훈민정음 시한폭탄',
        badge: '폭탄 돌리기',
        accentColor: '#ef4444',
        desc: '초성의 단어를 외치며 폭탄을 넘기는 게임',
        unlockReq: 0
      },
      {
        key: 'baskin',
        emoji: '🍨',
        title: '배불러라빈스 31',
        badge: '31 카운트다운',
        accentColor: '#f43f5e',
        desc: '1~3개씩 숫자를 외쳐 31을 피하는 술게임',
        unlockReq: 0
      },
      // [임시 숨김] 아이엠그라운드 - 완성도 및 밸런스 보강 시 재오픈
      /*
      {
        key: 'iamground',
        emoji: '🎙️',
        title: '아이엠그라운드',
        badge: '박자 리듬 릴레이',
        accentColor: '#ec4899',
        desc: '박자에 맞춰 자기소개와 상대 지목을 이어가는 리듬 술게임',
        unlockReq: 0
      },
      */
      {
        key: 'penaltycocktail',
        emoji: '🍹',
        title: '랜덤 벌칙주 제조기',
        badge: '벌칙주',
        accentColor: '#a855f7',
        desc: '선택한 재료로 랜덤 비율의 벌칙주 제조',
        unlockReq: 10
      },
      {
        key: 'fridge',
        emoji: '🧊',
        title: '냉장고를 부탁해',
        badge: '조합 탐색',
        accentColor: '#0ea5e9',
        desc: '현재 만들 수 있는 술 조합 찾기',
        unlockReq: 50
      },
      {
        key: 'market',
        emoji: '🧺',
        title: '시장에 가면',
        badge: '기억력 릴레이',
        accentColor: '#10b981',
        desc: '이전 재료를 순서대로 기억하고 새 재료를 추가하는 게임',
        unlockReq: 50
      }
    ];

    // 게임 모듈 인스턴스
    this.games = {
      updown: new window.KSool.UpAndDownGame(this),
      capflick: new window.KSool.CapFlickGame(this),
      surface: new window.KSool.SurfaceTensionGame(this),
      bottlespin: new window.KSool.BottleSpinGame(this),
      hunmin: new window.KSool.HunminBombGame(this),
      penaltycocktail: new window.KSool.PenaltyCocktailGame(this),
      fridge: new window.KSool.FridgePartyGame(this),
      baskin: new window.KSool.Baskin31Game(this),
      market: new window.KSool.MarketMemoryGame(this),
      iamground: new window.KSool.IamGroundGame(this)
    };

    this._setupWakeLockListener();
    this._setupHistoryListener();
  }

  /**
   * 해금률/조건에 따라 정렬된 게임 목록 반환
   * (0% 기본 해금 -> 소주·맥주 재료 해금 -> 도감 50% 해금)
   */
  _getSortedGamesList() {
    return [...this.gamesList].sort((a, b) => {
      const aReq = a.unlockReq ?? 0;
      const bReq = b.unlockReq ?? 0;
      return aReq - bReq;
    });
  }

  getGameMeta(key) {
    return this.gamesList.find(g => g.key === key) || this.gamesList[0];
  }


  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
      } catch (_) {}
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
      } catch (_) {}
      this.wakeLock = null;
    }
  }

  _setupWakeLockListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.mode === 'game') {
        this.requestWakeLock();
      }
    });
  }

  /**
   * SPA 브라우저 뒤로가기 / 히스토리 연동
   * 모바일 뒤로가기 제스처나 브라우저 뒤로가기 클릭 시 웹사이트를 이탈하지 않고
   * 게임 플레이 화면에서 [게임 목록 로비]로 자연스럽게 복귀합니다.
   */
  _setupHistoryListener() {
    window.addEventListener('popstate', (e) => {
      const container = document.getElementById(this.containerId);
      if (!container || !container.classList.contains('active')) return;

      if (this.mode === 'game') {
        this.openLobby(false);
      }
    });
  }

  vibrateShort() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(25); } catch (_) {}
    }
  }

  vibratePenalty() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate([100, 50, 100, 50, 300]); } catch (_) {}
    }
  }

  triggerPenalty({ title, subtitle, accentColor = '#ef4444', icon = '🚨' }) {
    this.vibratePenalty();

    let overlay = document.getElementById('party-penalty-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'party-penalty-overlay';
      overlay.className = 'party-penalty-overlay';
      document.body.appendChild(overlay);
    } else if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }

    overlay.style.setProperty('--penalty-color', accentColor);
    overlay.innerHTML = `
      <div class="penalty-modal-card">
        <div class="penalty-siren-halo">${icon}</div>
        <div class="penalty-title">${title}</div>
        <div class="penalty-subtitle">${subtitle}</div>
        <div class="penalty-tap-hint">터치하여 계속</div>
      </div>
    `;

    overlay.classList.add('active');

    const openedTime = Date.now();
    const handleDismiss = (e) => {
      // 리듬 연타 중 실수로 즉시 닫히는 현상 방지 (최소 500ms 쿨다운)
      if (Date.now() - openedTime < 500) return;
      e.stopPropagation();
      overlay.classList.remove('active');
      overlay.removeEventListener('click', handleDismiss);
      overlay.removeEventListener('touchstart', handleDismiss);
      this.sound.playTap();
      // 현재 게임 리셋 또는 벌칙 종료 콜백 (아이엠그라운드 등 즉시 리셋 방지)
      const curGame = this.games[this.activeGameKey];
      if (curGame) {
        if (typeof curGame.onPenaltyDismissed === 'function') {
          curGame.onPenaltyDismissed();
        } else {
          curGame.reset();
        }
      }
    };

    overlay.addEventListener('click', handleDismiss);
    overlay.addEventListener('touchstart', handleDismiss, { passive: true });
  }

  /**
   * 탭 전환 등으로 술게임 뷰를 벗어날 때 정리
   */
  onLeavePartyTab() {
    this.releaseWakeLock();
    const overlay = document.getElementById('party-penalty-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    if (this.mode === 'game') {
      this.openLobby(false);
    }
  }

  /**
   * 게임 선택 -> 전체화면 몰입형 플레이 화면 진입
   */
  playGame(gameKey) {
    if (!this.games[gameKey] || !this.gamesList.some(g => g.key === gameKey)) return;

    // 이전 실행 중인 게임 클린업
    if (this.activeGameKey && this.games[this.activeGameKey] && typeof this.games[this.activeGameKey].destroy === 'function') {
      this.games[this.activeGameKey].destroy();
    }

    this.mode = 'game';
    this.activeGameKey = gameKey;
    this.sound.playTap();

    // SPA 히스토리 상태 푸시 (뒤로가기 지원)
    try {
      window.history.pushState({ partyGame: gameKey }, '', `#party/${gameKey}`);
    } catch (_) {}

    this.render();
  }

  /**
   * 뒤로가기 버튼 클릭 -> 게임 목록 로비로 복귀
   */
  openLobby(shouldUpdateHistory = true) {
    // 실행 중이던 게임 정리
    if (this.activeGameKey && this.games[this.activeGameKey] && typeof this.games[this.activeGameKey].destroy === 'function') {
      try {
        this.games[this.activeGameKey].destroy();
      } catch (_) {}
    }

    this.mode = 'lobby';
    this.activeGameKey = null;
    this.releaseWakeLock();
    this.sound.playTap();

    const overlay = document.getElementById('party-penalty-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }

    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.remove('party-fullscreen-mode');
    }

    // 1. 무조건 즉시 게임 목록 로비를 화면에 렌더링!
    this.render();

    // 2. 브라우저 히스토리 상태 정리 (뒤로가기 스택 동기화)
    if (shouldUpdateHistory) {
      if (window.history.state && window.history.state.partyGame) {
        try {
          window.history.back();
        } catch (_) {}
      } else {
        try {
          const cleanUrl = window.location.href.split('#')[0];
          window.history.replaceState(null, '', cleanUrl);
        } catch (_) {}
      }
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.mode === 'lobby') {
      container.classList.remove('party-fullscreen-mode');
      this.renderLobby(container);
    } else {
      container.classList.add('party-fullscreen-mode');
      this.renderGameStage(container);
    }
  }

  _ensureInventory() {
    if (!this.inventory) {
      const app = window.ksoolApp || window.app;
      if (app?.inventory) this.inventory = app.inventory;
    }
    return this.inventory;
  }

  _isGameUnlocked(gameKey) {
    const inv = this._ensureInventory();
    if (!inv) return true;
    if (inv.unlockAllSandboxMode) return true;

    if (gameKey === 'penaltycocktail') {
      // 소주(101)와 맥주(102)가 둘 다 해금되었을 때 오픈
      const hasSoju = inv.isIngredientAvailable(101) || inv.isRecipeUnlocked(5);
      const hasBeer = inv.isIngredientAvailable(102) || inv.isRecipeUnlocked(4);
      return Boolean(hasSoju && hasBeer);
    }

    if (gameKey === 'fridge' || gameKey === 'market') {
      // 전체 도감 레시피의 50% 이상 해금 시 오픈
      const ratio = typeof inv.getUnlockProgressRatio === 'function' ? inv.getUnlockProgressRatio() : 0;
      return ratio >= 0.5;
    }

    return true;
  }

  _getGameLockReason(gameKey) {
    const inv = this._ensureInventory();
    if (gameKey === 'penaltycocktail') {
      const hasSoju = inv ? (inv.isIngredientAvailable(101) || inv.isRecipeUnlocked(5)) : false;
      const hasBeer = inv ? (inv.isIngredientAvailable(102) || inv.isRecipeUnlocked(4)) : false;
      let missing = [];
      if (!hasSoju) missing.push('🍶 소주');
      if (!hasBeer) missing.push('🍺 맥주');
      return `🔒 [랜덤 벌칙주 제조기]\n연구실에서 ${missing.join(', ')}를 해금하면 열립니다!`;
    }
    if (gameKey === 'fridge') {
      const ratio = inv && typeof inv.getUnlockProgressRatio === 'function' ? inv.getUnlockProgressRatio() : 0;
      const pct = Math.round(ratio * 100);
      return `🔒 [냉장고를 부탁해]\n도감 50% 이상 달성 시 열립니다! (현재: ${pct}%)`;
    }
    if (gameKey === 'market') {
      const ratio = inv && typeof inv.getUnlockProgressRatio === 'function' ? inv.getUnlockProgressRatio() : 0;
      const pct = Math.round(ratio * 100);
      return `🔒 [시장에 가면]\n도감 50% 이상 달성 시 열립니다! (현재: ${pct}%)`;
    }
    return '🔒 아직 해금되지 않은 게임입니다.';
  }

  showToast(message) {
    let toast = document.getElementById('party-lock-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'party-lock-toast';
      toast.className = 'party-lock-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('show');
    void toast.offsetWidth; // reflow
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  /**
   * [뷰 1] 화면 중앙 5대 술게임 대형 카드 선택 로비
   */
  renderLobby(container) {
    const inv = this._ensureInventory();
    const fridgeProgressRatio = inv && typeof inv.getUnlockProgressRatio === 'function' ? inv.getUnlockProgressRatio() : 0;
    const fridgePercent = Math.round(fridgeProgressRatio * 100);

    container.innerHTML = `
      <div class="party-lobby-container">
        <!-- 상단 헤더: 한 줄 콤팩트 헤더 -->
        <div class="party-lobby-header">
          <h2 class="party-lobby-title">🍻 술자리 미니게임 모음</h2>
        </div>

        <!-- 중앙 게임 선택 카드 목록 -->
        <div class="party-games-grid-menu">
          ${this._getSortedGamesList().map(g => {
            const unlocked = this._isGameUnlocked(g.key);
            let badgeHtml = `<span class="lobby-card-badge" style="color:${g.accentColor}; border-color:${g.accentColor};">${g.badge}</span>`;
            if (!unlocked) {
              if (g.key === 'penaltycocktail') {
                badgeHtml = `<span class="lobby-card-badge lock-badge">🔒 소주·맥주 필요</span>`;
              } else if (g.key === 'fridge' || g.key === 'market') {
                badgeHtml = `<span class="lobby-card-badge lock-badge">🔒 도감 50% (${fridgePercent}%)</span>`;
              }
            }

            return `
              <div class="party-lobby-card ${!unlocked ? 'is-locked' : ''}" data-start-game="${g.key}" style="--card-accent:${g.accentColor};">
                ${!unlocked ? '<div class="lobby-card-lock-overlay" title="잠김">🔒</div>' : ''}
                <div class="lobby-card-emoji-wrap">
                  <span class="lobby-card-emoji">${g.emoji}</span>
                </div>
                <div class="lobby-card-body">
                  <div class="lobby-card-header">
                    ${badgeHtml}
                  </div>
                  <div class="lobby-card-title">${g.title}</div>
                  <div class="lobby-card-desc">${g.desc}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // 게임 선택 이벤트 바인딩
    container.querySelectorAll('[data-start-game]').forEach(card => {
      card.onclick = () => {
        const key = card.getAttribute('data-start-game');
        if (!this._isGameUnlocked(key)) {
          this.sound?.playSnap?.();
          this.vibrateShort?.();
          const reason = this._getGameLockReason(key);
          this.showToast(reason);
          return;
        }
        this.playGame(key);
      };
    });
  }

  /**
   * [뷰 2] 선택한 게임의 전체화면 몰입형 플레이 스테이지 (뒤로가기 탑바 포함)
   */
  renderGameStage(container) {
    const meta = this.getGameMeta(this.activeGameKey);
    this.requestWakeLock();

    container.innerHTML = `
      <div class="party-fullscreen-wrapper party-game-${this.activeGameKey}" data-game="${this.activeGameKey}">
        <!-- 상단 미니 탑바: 뒤로가기 버튼 + 현재 게임 뱃지 -->
        <div class="party-game-top-bar">
          <button type="button" class="party-back-btn" id="party-back-btn">
            <span class="back-icon">‹</span>
            <span class="back-label">뒤로</span>
          </button>
          <div class="party-active-game-pill" style="border-color:${meta.accentColor};">
            <span class="pill-emoji">${meta.emoji}</span>
            <span class="pill-title">${meta.title}</span>
          </div>
          <div class="party-topbar-spacer" style="width:68px;"></div>
        </div>

        <!-- 전체화면 가득 찬 게임 실행 영역 -->
        <div id="party-game-stage" class="party-game-stage fullscreen party-stage-${this.activeGameKey}"></div>
      </div>
    `;

    // 뒤로가기 버튼 이벤트
    const backBtn = container.querySelector('#party-back-btn');
    if (backBtn) {
      backBtn.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.openLobby(true);
      };
    }


    // 선택된 게임 인스턴스 초기화 및 마운트
    if (this.games[this.activeGameKey]) {
      this.games[this.activeGameKey].init();
    }
  }
}

window.KSool.PartyGameHubView = PartyGameHubView;
