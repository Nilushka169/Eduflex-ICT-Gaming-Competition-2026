const STORAGE_KEY = 'eduflex_ict_gaming_app_v2';

// Initial starter players if completely empty
export function getDefaultData() {
  return {
    players: [
      { id: 1, name: 'Kasun Perera', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 2, name: 'Nuwan Pradeep', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 3, name: 'Sahan Dilshan', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 4, name: 'Thilina Madushan', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 5, name: 'Kavindu Senanayake', points: 0, wins: 0, matches: 0, isEliminated: false },
      { id: 6, name: 'Dilan Chamara', points: 0, wins: 0, matches: 0, isEliminated: false },
    ],
    matchHistory: [],
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw);
    if (!parsed.players || !Array.isArray(parsed.players)) return getDefaultData();
    // Ensure isEliminated flag exists on all players
    parsed.players = parsed.players.map(p => ({
      ...p,
      isEliminated: Boolean(p.isEliminated),
    }));
    return parsed;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function resetAllData() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultData();
}

export function exportToJsonFile(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eduflex_ict_gaming_data_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
