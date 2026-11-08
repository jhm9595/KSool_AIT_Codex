/* App-specific implementation copied over the generated upstream service. */
window.KSool = window.KSool || {};
window.KSool.TycoonLeaderboardService = class {
  constructor() {
    this.LOCAL_KEY = 'ksool_tycoon_leaderboard_v1';
    this.PLAYER_NAME_KEY = 'ksool_tycoon_player_name';
    this.cachedRankings = { TIME_ATTACK: [], INFINITE: [] };
    try {
      const data = JSON.parse(localStorage.getItem(this.LOCAL_KEY) || '{}');
      for (const mode of Object.keys(this.cachedRankings)) {
        this.cachedRankings[mode] = this._sort((Array.isArray(data[mode]) ? data[mode] : []).map(row => this._entry(row, mode)));
      }
    } catch { /* Empty local history when storage is unavailable. */ }
  }
  _name(value) { return String(value || '익명점주').replace(/[<>&"']/g, '').trim().slice(0, 12) || '익명점주'; }
  _number(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0; }
  _entry(row, mode) {
    return { player_name: this._name(row.player_name), mode, served_count: this._number(row.served_count), total_earnings: this._number(row.total_earnings), max_combo: this._number(row.max_combo), max_wave: Math.max(1, this._number(row.max_wave)), badge_emoji: '🍶' };
  }
  _sort(rows) { return rows.sort((a, b) => b.served_count - a.served_count || b.total_earnings - a.total_earnings).slice(0, 100); }
  getSavedPlayerName() { try { return this._name(localStorage.getItem(this.PLAYER_NAME_KEY)); } catch { return ''; } }
  savePlayerName(name) { try { localStorage.setItem(this.PLAYER_NAME_KEY, this._name(name)); } catch { /* Session-only name. */ } }
  async fetchTop100(mode) { return this.cachedRankings[mode === 'INFINITE' ? 'INFINITE' : 'TIME_ATTACK']; }
  async submitScore({ playerName, mode, servedCount, totalEarnings, maxCombo, maxWave }) {
    const target = mode === 'INFINITE' ? 'INFINITE' : 'TIME_ATTACK';
    const row = this._entry({ player_name: playerName, served_count: servedCount, total_earnings: totalEarnings, max_combo: maxCombo, max_wave: maxWave }, target);
    this.savePlayerName(playerName);
    this.cachedRankings[target] = this._sort([...this.cachedRankings[target], row]);
    let persisted = true;
    try { localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this.cachedRankings)); } catch { persisted = false; }
    return { ok: true, localOnly: true, persisted, rank: this.cachedRankings[target].indexOf(row) + 1 || null, top100: this.cachedRankings[target] };
  }
};
