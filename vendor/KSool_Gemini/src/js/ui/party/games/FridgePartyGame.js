window.KSool = window.KSool || {};

/**
 * ⑦ 냉장고를 부탁해 미니게임 어댑터 (PartyGameHubView 전용)
 * - 술자리 미니게임 허브 내에서 내 냉장고 속 재료로 만들 수 있는 술 조합 탐색 & 랜덤 뽑기
 */
class FridgePartyGame {
  constructor(hub) {
    this.hub = hub;
    this.view = null;
  }

  init() {
    const app = window.ksoolApp || window.app;
    this.view = new window.KSool.FridgeRecommenderView({
      containerId: 'party-game-stage',
      recipeBook: this.hub.recipeBook || app?.recipeBook,
      inventory: this.hub.inventory || app?.inventory,
      fridgeEngine: this.hub.fridgeEngine || app?.fridgeEngine,
      brandResolver: this.hub.brandResolver || app?.brandResolver,
      audio: this.hub.audio || app?.audio || this.hub.sound,
      onShowRecipeDetail: (recipe) => {
        if (app && typeof app.showCraftResultModal === 'function') {
          app.showCraftResultModal({ isSuccess: true, recipe, isNewDiscovery: false });
        }
      }
    });
    this.render();
  }

  render() {
    if (this.view) {
      this.view.render();
    }
  }

  reset() {
    this.render();
  }

  destroy() {
    this.view = null;
  }
}

window.KSool.FridgePartyGame = FridgePartyGame;
