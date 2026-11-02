window.KSool = window.KSool || {};

/**
 * 6) 초간단 조합 추천 & 관리자 '딸깍' 도감 편입 서비스
 * - 이름, 설명 입력 없이 오직 게임 내 재료+비율 묶음만 노출
 * - 재료 해금 스포일러 방지: 유저가 '이미 해금한 재료'들로만 구성된 추천 조합만 화면에 노출합니다.
 * - 유저는 👍 / 👎 만 투표, 관리자가 [⚡적용]을 누르면 즉시 정식 도감(RECIPE)으로 편입되고 목록에서 제거됨
 */
class SuggestionService {
  constructor(recipeBook, inventoryManager, brandResolver) {
    this.recipeBook = recipeBook;
    this.inventory = inventoryManager;
    this.brandResolver = brandResolver;
    this.STORAGE_KEY = 'ksool_alchemy_v2_suggestions';
    this.suggestions = [];
    this.userVotes = {}; // suggestion_key -> 'UP' | 'DOWN'
    this.SUPABASE_URL = 'https://jyjxvwxlwkoedxwkkysj.supabase.co';
    this.SUPABASE_KEY = 'sb_publishable_BqLI_-8VDKQiSJ69qVZoug_t6-AWeUj';
    this.onSuggestionsUpdated = null;
  }

  init() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.suggestions)) this.suggestions = parsed.suggestions;
        if (parsed.userVotes) this.userVotes = parsed.userVotes;
      }
    } catch (_) {}

    if (this.suggestions.length === 0) {
      this._seedDefaultSuggestions();
    }
    this._fetchRemoteSuggestions();
  }

  _seedDefaultSuggestions() {
    this.suggestions = [
      // 스타터 재료 기반 추천 조합 (초기 유저도 스포일러 없이 바로 확인 가능)
      {
        suggestion_key: '103:0@2+606:0@2+301:0@1',
        items: [
          { ingredient_id: 103, detail_id: null, ratio: 2 },
          { ingredient_id: 606, detail_id: null, ratio: 2 },
          { ingredient_id: 301, detail_id: null, ratio: 1 }
        ],
        upvotes: 35,
        downvotes: 2,
        is_applied: false
      },
      {
        suggestion_key: '601:0@3+401:0@2+701:0@1',
        items: [
          { ingredient_id: 601, detail_id: null, ratio: 3 },
          { ingredient_id: 401, detail_id: null, ratio: 2 },
          { ingredient_id: 701, detail_id: null, ratio: 1 }
        ],
        upvotes: 24,
        downvotes: 1,
        is_applied: false
      },
      // 소주/얼음 해금 시 노출되는 추천 조합
      {
        suggestion_key: '101:0@2+201:0@1+602:0@2+606:0@2',
        items: [
          { ingredient_id: 101, detail_id: null, ratio: 2 },
          { ingredient_id: 606, detail_id: null, ratio: 2 },
          { ingredient_id: 602, detail_id: null, ratio: 2 },
          { ingredient_id: 201, detail_id: null, ratio: 1 }
        ],
        upvotes: 42,
        downvotes: 3,
        is_applied: false
      },
      // 막걸리/밀크소다/얼음 해금 시 노출되는 추천 조합
      {
        suggestion_key: '105:0@4+604:0@3+201:0@1',
        items: [
          { ingredient_id: 105, detail_id: null, ratio: 4 },
          { ingredient_id: 604, detail_id: null, ratio: 3 },
          { ingredient_id: 201, detail_id: null, ratio: 1 }
        ],
        upvotes: 18,
        downvotes: 2,
        is_applied: false
      }
    ];
    this._save();
  }

  _buildKey(potSlots) {
    return potSlots
      .map(s => `${s.baseId}:${s.detailId || 0}@${s.count}`)
      .sort()
      .join('+');
  }

  /**
   * 내가 해금한 재료들로만 이루어진 추천 조합만 필터링하여 반환합니다. (재료 해금 힌트/스포일러 원천 차단)
   */
  getActiveSuggestions() {
    return this.suggestions
      .filter(s => {
        if (s.is_applied) return false;
        return s.items.every(it => this.inventory.isIngredientAvailable(it.ingredient_id));
      })
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  }

  /**
   * 현재 가마솥에 담긴 재료+비율 그대로 초간단 추천 등록 (이름/설명 없음)
   */
  submitFromPot(potSlots) {
    if (!potSlots || potSlots.length < 2) {
      return { ok: false, message: '가마솥에 재료를 2종류 이상 먼저 담아주세요!' };
    }

    const key = this._buildKey(potSlots);
    const existing = this.suggestions.find(s => s.suggestion_key === key && !s.is_applied);

    if (existing) {
      existing.upvotes += 1;
      this.userVotes[key] = 'UP';
      this._save();
      this._syncRemoteVote(key, existing.upvotes, existing.downvotes);
      return { ok: true, action: 'UPVOTED_EXISTING', message: '이미 올라온 조합이라 👍 추천이 +1 추가되었습니다!' };
    }

    const newEntry = {
      suggestion_key: key,
      items: potSlots.map(s => ({
        ingredient_id: Number(s.baseId),
        detail_id: s.detailId ? Number(s.detailId) : null,
        ratio: Number(s.count)
      })),
      upvotes: 1,
      downvotes: 0,
      is_applied: false
    };

    this.suggestions.unshift(newEntry);
    this.userVotes[key] = 'UP';
    this._save();
    this._syncRemoteUpsert(newEntry);
    return { ok: true, action: 'CREATED', message: '현재 재료 조합이 추천 목록에 등록되었습니다!' };
  }

  vote(suggestionKey, type) {
    const item = this.suggestions.find(s => s.suggestion_key === suggestionKey);
    if (!item) return;

    const prev = this.userVotes[suggestionKey];
    if (prev === type) return;

    if (prev === 'UP') item.upvotes = Math.max(0, item.upvotes - 1);
    if (prev === 'DOWN') item.downvotes = Math.max(0, item.downvotes - 1);

    if (type === 'UP') item.upvotes += 1;
    if (type === 'DOWN') item.downvotes += 1;

    this.userVotes[suggestionKey] = type;
    this._save();
    this._syncRemoteVote(suggestionKey, item.upvotes, item.downvotes);
  }

  /**
   * 관리자 '딸깍' 원클릭 적용: 정식 도감(RECIPE)으로 즉시 등록하고 추천 목록에서 제거
   */
  applySuggestionByAdmin(suggestionKey) {
    const target = this.suggestions.find(s => s.suggestion_key === suggestionKey && !s.is_applied);
    if (!target) return null;

    target.is_applied = true;
    const promoted = this.recipeBook.promoteSuggestionToOfficialRecipe(target, this.brandResolver);

    this.inventory.promotedCustomRecipes.push(promoted);
    this.inventory.unlockRecipe(promoted.recipe.recipe_id);
    this.inventory.save();
    this._save();
    this._syncRemoteApply(suggestionKey);

    return promoted.recipe;
  }

  _save() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({ suggestions: this.suggestions, userVotes: this.userVotes })
      );
    } catch (_) {}
  }
  async _fetchRemoteSuggestions() {
    try {
      const res = await fetch(`${this.SUPABASE_URL}/rest/v1/ksool_suggestions?select=*&order=upvotes.desc`, {
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`
        }
      });
      if (!res.ok) return;
      const remoteList = await res.json();
      if (!Array.isArray(remoteList) || remoteList.length === 0) return;

      const map = new Map();
      this.suggestions.forEach(s => map.set(s.suggestion_key, s));

      remoteList.forEach(r => {
        const existing = map.get(r.suggestion_key);
        if (existing) {
          existing.upvotes = r.upvotes;
          existing.downvotes = r.downvotes;
          existing.is_applied = r.is_applied;
          if (r.items) existing.items = r.items;
        } else {
          map.set(r.suggestion_key, {
            suggestion_key: r.suggestion_key,
            items: r.items,
            upvotes: r.upvotes,
            downvotes: r.downvotes,
            is_applied: r.is_applied
          });
        }
      });

      this.suggestions = Array.from(map.values());
      this._save();
      if (this.onSuggestionsUpdated) {
        this.onSuggestionsUpdated();
      }
    } catch (err) {
      console.warn('[SuggestionService] Remote sync fallback to local cache:', err);
    }
  }

  async _syncRemoteUpsert(entry) {
    try {
      await fetch(`${this.SUPABASE_URL}/rest/v1/ksool_suggestions`, {
        method: 'POST',
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          suggestion_key: entry.suggestion_key,
          items: entry.items,
          upvotes: entry.upvotes,
          downvotes: entry.downvotes,
          is_applied: entry.is_applied
        })
      });
    } catch (_) {}
  }

  async _syncRemoteVote(suggestionKey, upvotes, downvotes) {
    try {
      await fetch(`${this.SUPABASE_URL}/rest/v1/ksool_suggestions?suggestion_key=eq.${encodeURIComponent(suggestionKey)}`, {
        method: 'PATCH',
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ upvotes, downvotes })
      });
    } catch (_) {}
  }

  async _syncRemoteApply(suggestionKey) {
    try {
      await fetch(`${this.SUPABASE_URL}/rest/v1/ksool_suggestions?suggestion_key=eq.${encodeURIComponent(suggestionKey)}`, {
        method: 'PATCH',
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_applied: true })
      });
    } catch (_) {}
  }
}

window.KSool.SuggestionService = SuggestionService;
