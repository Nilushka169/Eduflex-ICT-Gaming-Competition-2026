import React, { useState, useEffect } from 'react';
import {
  loadData,
  saveData,
  resetAllData,
  exportToJsonFile
} from './data/storage';

import Leaderboard from './components/Leaderboard';
import MatchCreator from './components/MatchCreator';
import PlayerManager from './components/PlayerManager';
import MatchHistory from './components/MatchHistory';
import ConfirmModal from './components/ConfirmModal';
import './App.css';

const ADMIN_KEYCODE = 'nilulinu2002art';

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [showResetModal, setShowResetModal] = useState(false);
  const [toast, setToast] = useState(null);

  // When match is actively in live mode, hide outer navbar/header
  const [isMatchLive, setIsMatchLive] = useState(false);

  // Keycode / Admin authentication state
  const [keyInput, setKeyInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem('eduflex_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Auto-save changes to localStorage
  useEffect(() => {
    saveData(data);
  }, [data]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Handle keycode verification
  const handleKeycodeSubmit = (e) => {
    if (e) e.preventDefault();
    if (keyInput.trim() === ADMIN_KEYCODE) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem('eduflex_admin_auth', 'true');
      } catch (err) {}
      setKeyInput('');
      showToast('🔓 Admin access granted! Full editing & match creation enabled.', 'success');
    } else {
      showToast('❌ Invalid keycode. View-only access.', 'error');
    }
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem('eduflex_admin_auth');
    } catch (err) {}
    showToast('🔒 Locked. Returned to View-Only mode.', 'info');
  };

  // Add a single player (Admin only)
  const handleAddPlayer = (name) => {
    if (!isAdmin) {
      showToast('🔒 Admin keycode required to add players.', 'error');
      return;
    }
    const newPlayer = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name,
      points: 0,
      wins: 0,
      matches: 0,
      isEliminated: false,
    };
    setData(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
    showToast(`Added player "${name}"`);
  };

  // Bulk add players (Admin only)
  const handleBulkAddPlayers = (namesList) => {
    if (!isAdmin) {
      showToast('🔒 Admin keycode required to add players.', 'error');
      return;
    }
    const newPlayers = namesList.map((name, i) => ({
      id: Date.now() + i + Math.floor(Math.random() * 1000),
      name,
      points: 0,
      wins: 0,
      matches: 0,
      isEliminated: false,
    }));
    setData(prev => ({
      ...prev,
      players: [...prev.players, ...newPlayers],
    }));
    showToast(`Successfully added ${newPlayers.length} players!`);
  };

  // Update/Rename player (Admin only)
  const handleUpdatePlayer = (id, newName) => {
    if (!isAdmin) return;
    setData(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === id ? { ...p, name: newName } : p),
    }));
  };

  // Delete player (Admin only)
  const handleDeletePlayer = (id) => {
    if (!isAdmin) {
      showToast('🔒 Admin keycode required to delete players.', 'error');
      return;
    }
    const p = data.players.find(x => x.id === id);
    if (!window.confirm(`Are you sure you want to delete "${p?.name || 'this player'}"?`)) return;
    setData(prev => ({
      ...prev,
      players: prev.players.filter(x => x.id !== id),
    }));
    showToast(`Deleted player "${p?.name || ''}"`, 'info');
  };

  // Reactivate / Restore an eliminated player (Admin only)
  const handleReactivatePlayer = (id) => {
    if (!isAdmin) {
      showToast('🔒 Admin keycode required to reactivate players.', 'error');
      return;
    }
    setData(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === id ? { ...p, isEliminated: false } : p),
    }));
    const p = data.players.find(x => x.id === id);
    showToast(`Reactivated player "${p?.name || ''}"`);
  };

  // Complete a match, award points to winners, and eliminate defeated players!
  const handleCompleteMatch = ({ title, team1Name, team2Name, team1PlayerIds, team2PlayerIds, pointsToAward, winningPlayerIds }) => {
    if (!isAdmin) {
      showToast('🔒 Admin keycode required to record matches.', 'error');
      return;
    }

    const allMatchPlayerIds = [...team1PlayerIds, ...team2PlayerIds];

    const updatedPlayers = data.players.map(p => {
      if (allMatchPlayerIds.includes(p.id)) {
        const addedPoints = pointsToAward[p.id] || 0;
        const isWinner = winningPlayerIds.includes(p.id);

        return {
          ...p,
          points: p.points + addedPoints,
          wins: isWinner ? p.wins + 1 : p.wins,
          matches: p.matches + 1,
          isEliminated: isWinner ? false : true,
        };
      }
      return p;
    });

    const matchRecord = {
      id: Date.now(),
      title,
      timestamp: new Date().toISOString(),
      team1Name,
      team2Name,
      team1PlayerIds,
      team2PlayerIds,
      pointsAwarded: pointsToAward,
      winningPlayerIds,
      losingPlayerIds: allMatchPlayerIds.filter(id => !winningPlayerIds.includes(id)),
    };

    setData(prev => ({
      ...prev,
      players: updatedPlayers,
      matchHistory: [matchRecord, ...prev.matchHistory],
    }));

    showToast(`✅ "${title}" completed! Points saved to leaderboard.`);
    setIsMatchLive(false);
    setActiveTab('leaderboard');
  };

  // Full Reset (Admin only)
  const handleReset = () => {
    if (!isAdmin) {
      showToast('🔒 Admin keycode required to reset tournament.', 'error');
      return;
    }
    const reset = resetAllData();
    setData(reset);
    setShowResetModal(false);
    showToast('🔄 Competition data has been reset to defaults.', 'info');
  };

  // Import JSON File (Admin only)
  const handleFileImport = (event) => {
    if (!isAdmin) {
      showToast('🔒 Admin keycode required to import data files.', 'error');
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.players && Array.isArray(imported.players)) {
          setData(imported);
          showToast('📥 Data file imported successfully!');
        } else {
          showToast('⚠️ Invalid file format', 'error');
        }
      } catch (err) {
        showToast('⚠️ Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className={`tournament-app ${isMatchLive ? 'in-live-mode' : ''}`}>
      {/* Background Ambience */}
      <div className="ambient-glow bg-purple" />
      <div className="ambient-glow bg-blue" />
      <div className="grid-overlay" />

      {/* Main Header */}
      {!isMatchLive && (
        <header className="main-header">
          <div className="header-container">
            {/* Title & Keycode Verification Box */}
            <div className="brand-group">
              <div className="trophy-hexagon">
                <span>🎮</span>
              </div>
              <div>
                <h1 className="tournament-title">Eduflex ICT Gaming Competition 2026</h1>
                <div className="tagline-badge">Artofict</div>
              </div>

              {/* KEYCODE BOX NEXT TO TITLE */}
              <div className="title-keycode-container">
                {isAdmin ? (
                  <div className="admin-status-badge">
                    <span className="admin-icon">🔓</span>
                    <span className="admin-text">Admin Mode</span>
                    <button
                      className="btn-admin-lock"
                      onClick={handleLockAdmin}
                      title="Lock Admin Access (Switch to View-Only)"
                    >
                      Lock 🔒
                    </button>
                  </div>
                ) : (
                  <form className="keycode-form-box" onSubmit={handleKeycodeSubmit}>
                    <input
                      type="password"
                      className="keycode-input"
                      placeholder="Enter keycode..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      title="Enter admin keycode to enable editing, match creation, and scoring"
                    />
                    <button
                      type="submit"
                      className="keycode-tick-btn"
                      title="Click tick to authenticate"
                      disabled={!keyInput.trim()}
                    >
                      ✓
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="header-controls">
              <button
                className="action-btn export-btn"
                onClick={() => exportToJsonFile(data)}
                title="Download data as a local JSON file"
              >
                💾 Save to File
              </button>

              {isAdmin && (
                <>
                  <label className="action-btn import-btn" title="Load data from saved file">
                    📂 Load File
                    <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
                  </label>
                  <button
                    className="action-btn reset-btn"
                    onClick={() => setShowResetModal(true)}
                    title="Reset scores and matches"
                  >
                    ↺ Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* View-Only Notice Banner when not authenticated */}
      {!isMatchLive && !isAdmin && (
        <div className="view-only-banner">
          <span>👁️ <strong>View-Only Mode:</strong> Enter the keycode in the box above and click the tick (<strong>✓</strong>) to unlock match creation, player editing, and mark adding.</span>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`notification-toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Navigation Tabs */}
      {!isMatchLive && (
        <nav className="tournament-nav">
          <button
            className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏆 Leaderboard
          </button>
          <button
            className={`nav-item arena-tab ${activeTab === 'match_arena' ? 'active' : ''}`}
            onClick={() => setActiveTab('match_arena')}
          >
            ⚔ Match Arena (Team 1 vs Team 2)
          </button>
          <button
            className={`nav-item ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            👥 Players Directory ({data.players.length})
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Match History ({data.matchHistory.length})
          </button>
        </nav>
      )}

      {/* Main View Container */}
      <main className={`tournament-content ${isMatchLive ? 'content-live-full' : ''}`}>
        {activeTab === 'leaderboard' && (
          <Leaderboard
            players={data.players}
            totalMatches={data.matchHistory.length}
          />
        )}

        {activeTab === 'match_arena' && (
          <MatchCreator
            players={data.players}
            onCompleteMatch={handleCompleteMatch}
            matchCount={data.matchHistory.length}
            onLiveStatusChange={(live) => setIsMatchLive(live)}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'players' && (
          <PlayerManager
            players={data.players}
            onAddPlayer={handleAddPlayer}
            onBulkAddPlayers={handleBulkAddPlayers}
            onUpdatePlayer={handleUpdatePlayer}
            onDeletePlayer={handleDeletePlayer}
            onReactivatePlayer={handleReactivatePlayer}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'history' && (
          <MatchHistory
            history={data.matchHistory}
            players={data.players}
          />
        )}
      </main>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <ConfirmModal
          message="Are you sure you want to reset all players, scores, and match logs? This action cannot be undone."
          onConfirm={handleReset}
          onCancel={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}
