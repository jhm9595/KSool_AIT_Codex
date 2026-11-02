window.KSool = window.KSool || {};

class CraftingPot {
  constructor(gameConfig) {
    this.config = gameConfig;
    /** @type {Array<{baseId: number, detailId: number|null, count: number}>} */
    this.slots = [];
  }

  getTotalCount() {
    return this.slots.reduce((sum, s) => sum + s.count, 0);
  }

  /**
   * 재료를 탭했을 때 호출 (Tap-to-Stack)
   * - 현재 진행 단계(stepConfig)의 재료당 최대 개수(maxCountPerSlot) 및 총합(maxTotalCount) 제약을 적용합니다.
   * - Step 1~4(maxCountPerSlot = 1)에서는 비율 없이 1개씩만 투입 가능하며,
   *   Step 5(최대 2개) -> Step 6(최대 3개) -> Step 7(최대 10개) 순으로 점진 확장됩니다.
   */
  tapIngredient(baseId, detailId = null, stepConfig = null) {
    const maxPerSlot = stepConfig ? stepConfig.maxCountPerSlot : this.config.maxTotalCount;
    const maxTotal = stepConfig ? stepConfig.maxTotalCount : this.config.maxTotalCount;
    const total = this.getTotalCount();

    const existingIdx = this.slots.findIndex(
      s => s.baseId === Number(baseId) && (s.detailId || null) === (detailId ? Number(detailId) : null)
    );
    const existing = existingIdx >= 0 ? this.slots[existingIdx] : null;

    if (existing) {
      if (existing.count >= maxPerSlot) {
        if (maxPerSlot === 1) {
          // 비율 해금 전 단계(maxPerSlot === 1)에서는 같은 재료를 다시 누르면 조합칸에서 내려감(토글 제거)
          this.slots.splice(existingIdx, 1);
          return { ok: true, action: 'REMOVED', slot: null };
        }
        return {
          ok: false,
          reason: 'STEP_MAX_PER_SLOT',
          message: `현재 한 재료당 최대 ${maxPerSlot}개까지만 넣을 수 있습니다!\n(더 많은 조합을 해금하면 최대 비율이 확장됩니다)`
        };
      }

      if (total >= maxTotal) {
        return {
          ok: false,
          reason: 'MAX_TOTAL_REACHED',
          message: `현재 단계에서 재료 총 개수 합계는 최대 ${maxTotal}개까지만 넣을 수 있습니다!`
        };
      }

      existing.count += 1;
      return { ok: true, action: 'INCREMENTED', slot: existing };
    }

    if (total >= maxTotal) {
      return {
        ok: false,
        reason: 'MAX_TOTAL_REACHED',
        message: `현재 단계에서 재료 총 개수 합계는 최대 ${maxTotal}개까지만 넣을 수 있습니다!`
      };
    }

    const maxSlots = this.config.getEffectiveMaxSlots();
    if (this.slots.length >= maxSlots) {
      return {
        ok: false,
        reason: 'MAX_SLOTS_REACHED',
        message: `현재 조합칸은 최대 ${maxSlots}종류까지 올릴 수 있습니다. (상단에서 슬롯 확장 가능)`
      };
    }

    const newSlot = {
      baseId: Number(baseId),
      detailId: detailId ? Number(detailId) : null,
      count: 1
    };
    this.slots.push(newSlot);
    return { ok: true, action: 'ADDED', slot: newSlot };
  }

  decrementSlot(index) {
    if (index < 0 || index >= this.slots.length) return;
    this.slots[index].count -= 1;
    if (this.slots[index].count <= 0) {
      this.slots.splice(index, 1);
    }
  }

  removeSlot(index) {
    if (index < 0 || index >= this.slots.length) return;
    this.slots.splice(index, 1);
  }

  clear() {
    this.slots = [];
  }

  getSlots() {
    return [...this.slots];
  }
}

window.KSool.CraftingPot = CraftingPot;
