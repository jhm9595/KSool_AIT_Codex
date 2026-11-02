window.KSool = window.KSool || {};

/**
 * 5-2) 비율 공개 힌트 프로바이더 (Up/Down 미니게임 & 향후 보상형 광고 어댑터)
 * - 5-1 숫자야구를 모두 맞춘 후에만 활성화됩니다.
 * - 현재는 UpDownRatioGameProvider가 동작하며(예: 정답 9일 때 4 누르면 UP, 10 누르면 DOWN),
 *   추후 광고 연동 시 RewardAdRatioProvider로 설정만 바꾸면 즉시 전환됩니다.
 */
class RatioHintProvider {
  checkRatioGuess(recipeId, slotOrder, guessedNumber) {
    throw new Error('Not implemented');
  }
}

class UpDownRatioGameProvider extends RatioHintProvider {
  constructor(recipeBook, inventoryManager) {
    super();
    this.recipeBook = recipeBook;
    this.inventory = inventoryManager;
  }

  requiresRatioGame(recipeId) {
    const items = this.recipeBook.getRecipeItems(recipeId);
    // 비율이 모두 1인 조합(1:1, 1:1:1 등)은 별도의 비율 Up/Down 게임 불필요
    return items.some(it => Number(it.ratio) > 1);
  }

  ensureUnitRatiosAutoSolved(recipeId) {
    const items = this.recipeBook.getRecipeItems(recipeId);
    const hintState = this.inventory.getHintState(recipeId);
    let changed = false;
    // 비율이 1인 재료는 굳이 숫자를 맞추거나 표시할 필요가 없으므로 자동 해결 처리
    items.forEach(it => {
      const key = String(it.slot_order);
      if (Number(it.ratio) === 1 && Number(hintState.solvedRatios[key]) !== 1) {
        hintState.solvedRatios[key] = 1;
        changed = true;
      }
    });
    if (changed) {
      this.inventory.save();
    }
    return !this.requiresRatioGame(recipeId);
  }

  checkRatioGuess(recipeId, slotOrder, guessedNumber) {
    const items = this.recipeBook.getRecipeItems(recipeId);
    const targetItem = items.find(it => Number(it.slot_order) === Number(slotOrder)) || items[0];
    if (!targetItem) return { status: 'ERROR' };

    const answer = Number(targetItem.ratio);
    const guess = Number(guessedNumber);

    if (guess === answer) {
      const hintState = this.inventory.getHintState(recipeId);
      hintState.solvedRatios[String(slotOrder)] = answer;
      this.inventory.save();
      return {
        status: 'CORRECT',
        answer,
        shortLabel: '정답!'
      };
    } else if (guess < answer) {
      return {
        status: 'UP',
        guess,
        shortLabel: 'Up'
      };
    } else {
      return {
        status: 'DOWN',
        guess,
        shortLabel: 'Down'
      };
    }
  }
}

class RewardAdRatioProvider extends RatioHintProvider {
  constructor(recipeBook, inventoryManager) {
    super();
    this.recipeBook = recipeBook;
    this.inventory = inventoryManager;
  }

  // 향후 광고 SDK 연동 시 호출될 메서드 구조
  unlockRatioByWatchingAd(recipeId, slotOrder, onComplete) {
    const items = this.recipeBook.getRecipeItems(recipeId);
    const targetItem = items.find(it => Number(it.slot_order) === Number(slotOrder));
    if (!targetItem) return;
    const hintState = this.inventory.getHintState(recipeId);
    hintState.solvedRatios[String(slotOrder)] = Number(targetItem.ratio);
    this.inventory.save();
    if (onComplete) onComplete(Number(targetItem.ratio));
  }
}

/**
 * 5-3) 외부 힌트 링크 생성기 (유튜브 타임스탬프 자동 부착 & 블로그 이동)
 */
class ExternalHintLinker {
  static buildTargetUrl(hintMeta) {
    if (!hintMeta || !hintMeta.url) return '#';
    let url = hintMeta.url;
    if (hintMeta.platform === 'YOUTUBE' && hintMeta.start_time_sec > 0) {
      const sep = url.includes('?') ? '&' : '?';
      if (!url.includes('t=')) {
        url = `${url}${sep}t=${Number(hintMeta.start_time_sec)}s`;
      }
    }
    return url;
  }

  static formatTimestamp(seconds) {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

window.KSool.RatioHintProvider = RatioHintProvider;
window.KSool.UpDownRatioGameProvider = UpDownRatioGameProvider;
window.KSool.RewardAdRatioProvider = RewardAdRatioProvider;
window.KSool.ExternalHintLinker = ExternalHintLinker;
