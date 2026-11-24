import React, { useState } from 'react';
import './PlayerManager.css';

export default function PlayerManager({ players, onAddPlayer, onBulkAddPlayers, onUpdatePlayer, onDeletePlayer, onReactivatePlayer, isAdmin }) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSingle = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    onAddPlayer(trimmed);
    setNewPlayerName('');
  };

  const handleBulkSubmit = () => {
    if (!isAdmin) return;
    if (!bulkText.trim()) return;
    const names = bulkText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length > 0) {
      onBulkAddPlayers(names);
      setBulkText('');
      setShowBulkModal(false);
    }
  };

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="player-manager-root">
      {/* Header and Add Bar */}
      <div className="pm-header-bar">
        <div>
          <h2>👥 Players Directory</h2>
          <p className="pm-sub">
            Total <strong>{players.length}</strong> players registered.
            {!isAdmin ? ' (View-Only Mode: Enter keycode above to manage)' : ' Full management enabled.'}
          </p>
        </div>

        {isAdmin && (
          <div className="pm-header-actions">
            <button className="btn-secondary" onClick={() => setShowBulkModal(true)}>
              📋 Bulk Add Players
            </button>
          </div>
        )}
      </div>

      {/* Add Player Input Form (Admin only) */}
      {isAdmin ? (
        <form className="add-player-form" onSubmit={handleAddSingle}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter player name (e.g., Kasun, Nuwan)..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
            />
            <button type="submit" className="btn-add-player" disabled={!newPlayerName.trim()}>
              ➕ Add Player
            </button>
          </div>
        </form>
      ) : (
        <div className="pm-locked-banner">
          <span>🔒 <strong>Adding & Editing Locked:</strong> Enter the keycode in the header to add, edit, or delete players.</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="pm-filter-row">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="btn-clear">✕</button>}
        </div>
        <span className="count-label">Showing {filteredPlayers.length} of {players.length} players</span>
      </div>

      {/* Players List Table / Cards */}
      <div className="players-card-grid">
        {filteredPlayers.length === 0 ? (
          <div className="no-players-notice">
            <p>No players found. {isAdmin ? 'Add players using the form above.' : 'No registered players.'}</p>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div key={player.id} className={`player-entry-card ${player.isEliminated ? 'player-card-eliminated' : ''}`}>
              <div className="player-card-left">
                <div className={`player-avatar-circle ${player.isEliminated ? 'avatar-eliminated' : ''}`}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="player-details">
                  {isAdmin ? (
                    <input
                      className="inline-name-input"
                      value={player.name}
                      onChange={(e) => onUpdatePlayer(player.id, e.target.value)}
                      title="Click to rename player"
                    />
                  ) : (
                    <span className="inline-name-readonly">{player.name}</span>
                  )}
                  <div className="player-meta-badges">
                    <span className="player-stat-mini">
                      Matches: {player.matches} • Wins: {player.wins}
                    </span>
                    {player.isEliminated ? (
                      <span className="badge-status-pill badge-eliminated">Defeated</span>
                    ) : player.matches > 0 ? (
                      <span className="badge-status-pill badge-active">Winner (Active)</span>
                    ) : (
                      <span className="badge-status-pill badge-new">New Player</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="player-card-right">
                {/* Read-only Points badge */}
                <div className="point-badge-display">
                  {player.points} pts
                </div>

                {/* Reactivate if eliminated (Admin only) */}
                {isAdmin && player.isEliminated && (
                  <button
                    className="btn-reactivate"
                    onClick={() => onReactivatePlayer(player.id)}
                    title="Reactivate player to eligible pool"
                  >
                    ↺ Restore
                  </button>
                )}

                {/* Delete button (Admin only) */}
                {isAdmin && (
                  <button
                    className="btn-del-player"
                    onClick={() => onDeletePlayer(player.id)}
                    title="Remove player"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bulk Add Modal */}
      {isAdmin && showBulkModal && (
        <div className="modal-backdrop" onClick={() => setShowBulkModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Bulk Add Players</h3>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>✕</button>
            </div>
            <p className="modal-hint">
              Paste player names below (separate each name with a new line or comma):
            </p>
            <textarea
              className="bulk-textarea"
              rows={8}
              placeholder="Player 1&#10;Player 2&#10;Player 3&#10;Player 4..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleBulkSubmit} disabled={!bulkText.trim()}>
                Add All Players
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
