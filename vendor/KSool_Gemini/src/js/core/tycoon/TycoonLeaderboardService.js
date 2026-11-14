window.KSool = window.KSool || {};

/**
 * 🍸 주점 타이쿤 (Tycoon Main Game) - 글로벌 Top 100 랭킹 서비스
 *
 * - Supabase `ksool_tycoon_leaderboard` 테이블과 실시간 연동하여
 *   타임어택(TIME_ATTACK) 및 무한모드(INFINITE) Top 100 랭킹을 전체 유저에게 공개합니다.
 * - 오프라인/네트워크 불안정 시에도 로컬 스토리지 폴백 및 시드 랭커 데이터를 병합해 즉시 작동합니다.
 */
class TycoonLeaderboardService {
  constructor() {
    this.SUPABASE_URL = 'https://jyjxvwxlwkoedxwkkysj.supabase.co';
    this.SUPABASE_KEY = 'sb_publishable_BqLI_-8VDKQiSJ69qVZoug_t6-AWeUj';
    this.LOCAL_KEY = 'ksool_tycoon_leaderboard_v1';
    this.PLAYER_NAME_KEY = 'ksool_tycoon_player_name';
    this.cachedRankings = {
      TIME_ATTACK: [],
      INFINITE: []
    };
    this._loadLocalCache();
  }

  getSavedPlayerName() {
    try {
      return localStorage.getItem(this.PLAYER_NAME_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  savePlayerName(name) {
    try {
      if (name && name.trim()) {
        localStorage.setItem(this.PLAYER_NAME_KEY, name.trim().slice(0, 12));
      }
    } catch (_) {}
  }

  _getDefaultSeeds() {
    return {
      TIME_ATTACK: [
        { player_name: '종로주모장인', mode: 'TIME_ATTACK', served_count: 24, total_earnings: 1840, max_combo: 12, max_wave: 5, badge_emoji: '👑' },
        { player_name: '소맥폭격기', mode: 'TIME_ATTACK', served_count: 19, total_earnings: 1420, max_combo: 9, max_wave: 4, badge_emoji: '🍺' },
        { player_name: '을지로바텐더', mode: 'TIME_ATTACK', served_count: 16, total_earnings: 1180, max_combo: 8, max_wave: 4, badge_emoji: '🍸' },
        { player_name: '홍대막걸리왕', mode: 'TIME_ATTACK', served_count: 14, total_earnings: 960, max_combo: 6, max_wave: 3, badge_emoji: '🍶' },
        { player_name: '강남하이볼러', mode: 'TIME_ATTACK', served_count: 11, total_earnings: 740, max_combo: 5, max_wave: 3, badge_emoji: '🥃' }
      ],
      INFINITE: [
        { player_name: '전설의주조신', mode: 'INFINITE', served_count: 42, total_earnings: 4680, max_combo: 28, max_wave: 9, badge_emoji: '🐉' },
        { player_name: '절대미각김씨', mode: 'INFINITE', served_count: 31, total_earnings: 3150, max_combo: 19, max_wave: 7, badge_emoji: '🔥' },
        { player_name: '단골기억천재', mode: 'INFINITE', served_count: 23, total_earnings: 2190, max_combo: 14, max_wave: 5, badge_emoji: '🧠' },
        { player_name: '포차마스터', mode: 'INFINITE', served_count: 17, total_earnings: 1480, max_combo: 10, max_wave: 4, badge_emoji: '🏮' },
        { player_name: '초보사장님', mode: 'INFINITE', served_count: 9, total_earnings: 620, max_combo: 5, max_wave: 2, badge_emoji: '🌱' }
      ]
    };
  }

  _loadLocalCache() {
    const seeds = this._getDefaultSeeds();
    try {
      const raw = localStorage.getItem(this.LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.cachedRankings.TIME_ATTACK = Array.isArray(parsed.TIME_ATTACK) && parsed.TIME_ATTACK.length > 0
          ? parsed.TIME_ATTACK
          : seeds.TIME_ATTACK;
        this.cachedRankings.INFINITE = Array.isArray(parsed.INFINITE) && parsed.INFINITE.length > 0
          ? parsed.INFINITE
          : seeds.INFINITE;
        return;
      }
    } catch (_) {}
    this.cachedRankings = seeds;
  }

  _saveLocalCache() {
    try {
      localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this.cachedRankings));
    } catch (_) {}
  }

  _sortAndLimitTop100(list) {
    return [...list]
      .sort((a, b) => {
        if ((b.served_count || 0) !== (a.served_count || 0)) {
          return (b.served_count || 0) - (a.served_count || 0);
        }
        return (b.total_earnings || 0) - (a.total_earnings || 0);
      })
      .slice(0, 100);
  }

  async fetchTop100(mode = 'TIME_ATTACK') {
    const targetMode = mode === 'INFINITE' ? 'INFINITE' : 'TIME_ATTACK';
    try {
      const url = `${this.SUPABASE_URL}/rest/v1/ksool_tycoon_leaderboard?mode=eq.${targetMode}&select=*&order=served_count.desc,total_earnings.desc&limit=100`;
      const res = await fetch(url, {
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const remoteRows = await res.json();
        if (Array.isArray(remoteRows) && remoteRows.length > 0) {
          this.cachedRankings[targetMode] = this._sortAndLimitTop100(remoteRows);
          this._saveLocalCache();
          return this.cachedRankings[targetMode];
        }
      }
    } catch (err) {
      console.warn('[TycoonLeaderboardService] Remote fetch fallback:', err);
    }
    this.cachedRankings[targetMode] = this._sortAndLimitTop100(this.cachedRankings[targetMode] || []);
    return this.cachedRankings[targetMode];
  }

  async submitScore({ playerName, mode, servedCount, totalEarnings, maxCombo, maxWave, badgeEmoji }) {
    const cleanName = (playerName || '익명주모').trim().slice(0, 12) || '익명주모';
    this.savePlayerName(cleanName);
    const targetMode = mode === 'INFINITE' ? 'INFINITE' : 'TIME_ATTACK';

    const entry = {
      player_name: cleanName,
      mode: targetMode,
      served_count: Math.max(0, Number(servedCount) || 0),
      total_earnings: Math.max(0, Math.round(Number(totalEarnings) || 0)),
      max_combo: Math.max(0, Number(maxCombo) || 0),
      max_wave: Math.max(1, Number(maxWave) || 1),
      badge_emoji: badgeEmoji || '🍶',
      created_at: new Date().toISOString()
    };

    // 로컬 캐시에 즉시 반영
    const currentList = this.cachedRankings[targetMode] || [];
    currentList.push(entry);
    this.cachedRankings[targetMode] = this._sortAndLimitTop100(currentList);
    this._saveLocalCache();

    // 원격 Supabase 업로드
    try {
      await fetch(`${this.SUPABASE_URL}/rest/v1/ksool_tycoon_leaderboard`, {
        method: 'POST',
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player_name: entry.player_name,
          mode: entry.mode,
          served_count: entry.served_count,
          total_earnings: entry.total_earnings,
          max_combo: entry.max_combo,
          max_wave: entry.max_wave,
          badge_emoji: entry.badge_emoji
        })
      });
      await this.fetchTop100(targetMode);
    } catch (_) {}

    const rankIdx = this.cachedRankings[targetMode].findIndex(
      r => r.player_name === entry.player_name &&
           Number(r.served_count) === entry.served_count &&
           Number(r.total_earnings) === entry.total_earnings
    );

    return {
      ok: true,
      rank: rankIdx >= 0 ? rankIdx + 1 : null,
      top100: this.cachedRankings[targetMode]
    };
  }
}

window.KSool.TycoonLeaderboardService = TycoonLeaderboardService;
