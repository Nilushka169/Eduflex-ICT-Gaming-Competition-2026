import React, { useState } from 'react';
import './PlayerSetup.css';

export default function PlayerSetup({ players, onUpdate, onClose }) {
  const [names, setNames] = useState(players.map(p => p.name));

  const handleSave = () => {
    names.forEach((name, idx) => {
      if (name.trim()) {
        onUpdate(players[idx].id, name.trim());
      }
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙ Player Setup</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="modal-hint">Edit player names. Changes apply immediately.</p>
        <div className="setup-list">
          {players.map((player, idx) => (
            <div key={player.id} className="setup-row">
              <div className="setup-avatar">{names[idx]?.charAt(0).toUpperCase() || '?'}</div>
              <input
                className="setup-input"
                value={names[idx]}
                onChange={e => {
                  const updated = [...names];
                  updated[idx] = e.target.value;
                  setNames(updated);
                }}
                placeholder={`Player ${idx + 1}`}
                maxLength={20}
              />
              <div className="setup-pts">{player.points} pts</div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Names</button>
        </div>
      </div>
    </div>
  );
}
