const STORAGE_KEY = 'eduflex_ict_gaming_app_v2';
const API_ENDPOINT = '/api/data';

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

function normalizeData(parsed) {
  if (!parsed || !Array.isArray(parsed.players)) return getDefaultData();
  return {
    players: parsed.players.map(p => ({
      ...p,
      isEliminated: Boolean(p.isEliminated),
    })),
    matchHistory: Array.isArray(parsed.matchHistory) ? parsed.matchHistory : [],
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return normalizeData(JSON.parse(raw));
  } catch {
    return getDefaultData();
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local cache:', e);
  }
}

export async function fetchCloudData() {
  const res = await fetch(API_ENDPOINT, {
    method: 'GET',
    cache: 'no-store',
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Server error (${res.status})`);
  }
  const json = await res.json();
  const normalized = normalizeData(json);
  saveData(normalized);
  return normalized;
}

export async function saveCloudData(data, keycode) {
  const res = await fetch(API_ENDPOINT, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-keycode': keycode,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to save (${res.status})`);
  }
  return res.json();
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
