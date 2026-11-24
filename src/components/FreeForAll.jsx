import React, { useState, useEffect } from 'react';
import './FreeForAll.css';

export default function FreeForAll({ players, onRecordFfa }) {
  // Suggest the top 3 players by score as finalists
  const top3 = players.slice(0, 3);

  const [finalist1Id, setFinalist1Id] = useState(top3[0]?.id || players[0]?.id);
  const [finalist2Id, setFinalist2Id] = useState(top3[1]?.id || players[1]?.id);
  const [finalist3Id, setFinalist3Id] = useState(top3[2]?.id || players[2]?.id);

  const [selectedWinnerId, setSelectedWinnerId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Update defaults if players list changes
  useEffect(() => {
    if (players.length >= 3) {
      setFinalist1Id(players[0]?.id);
      setFinalist2Id(players[1]?.id);
      setFinalist3Id(players[2]?.id);
    }
  }, [players]);

  const p1 = players.find(p => p.id === Number(finalist1Id));
  const p2 = players.find(p => p.id === Number(finalist2Id));
  const p3 = players.find(p => p.id === Number(finalist3Id));

  const finalists = [p1, p2, p3].filter(Boolean);

  const handleConfirmWinner = () => {
    // Validation
    const idSet = new Set([Number(finalist1Id), Number(finalist2Id), Number(finalist3Id)]);
    if (idSet.size !== 3) {
      setErrorMessage('Please select 3 distinct players for the Free For All final!');
      return;
    }

    if (!selectedWinnerId) {
      setErrorMessage('Please select who won the 1v1v1 Free For All match!');
      return;
    }

    setErrorMessage('');
    onRecordFfa({
      finalists,
      winnerId: selectedWinnerId,
    });
  };

  return (
    <div className="ffa-wrapper">
      <div className="ffa-header">
        <div className="ffa-glow-icon">👑</div>
        <h2>Grand Final: 3-Player Free For All (1v1v1)</h2>
        <p className="ffa-description">
          The ultimate showdown! The final 3 surviving players battle against each other.
          The winner receives <strong>+1 point</strong> and takes the <strong>#1 Champion spot</strong> on the leaderboard!
        </p>
      </div>

      {errorMessage && (
        <div className="ffa-error-box">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Finalist Pickers if organizer wants to change */}
      <div className="finalists-select-bar">
        <div className="finalist-picker">
          <label>Finalist #1:</label>
          <select value={finalist1Id} onChange={(e) => { setFinalist1Id(Number(e.target.value)); setSelectedWinnerId(null); }}>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.teamName} - {p.points} pts)</option>
            ))}
          </select>
        </div>

        <div className="finalist-picker">
          <label>Finalist #2:</label>
          <select value={finalist2Id} onChange={(e) => { setFinalist2Id(Number(e.target.value)); setSelectedWinnerId(null); }}>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.teamName} - {p.points} pts)</option>
            ))}
          </select>
        </div>

        <div className="finalist-picker">
          <label>Finalist #3:</label>
          <select value={finalist3Id} onChange={(e) => { setFinalist3Id(Number(e.target.value)); setSelectedWinnerId(null); }}>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.teamName} - {p.points} pts)</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Gladiators Display */}
      <div className="ffa-arena-grid">
        {finalists.map((f, idx) => {
          const isSelected = selectedWinnerId === f.id;
          return (
            <div
              key={f.id}
              className={`ffa-player-card ${isSelected ? 'ffa-selected-winner' : ''}`}
              onClick={() => setSelectedWinnerId(f.id)}
            >
              <div className="ffa-card-glow" />
              <div className="ffa-slot-number">FINALIST #{idx + 1}</div>

              <div className="ffa-avatar-circle">
                {isSelected ? '👑' : f.name.charAt(0)}
              </div>

              <h3 className="ffa-name">{f.name}</h3>
              <div className="ffa-team-name">{f.teamName}</div>

              <div className="ffa-current-stats">
                <div className="stat-pill">
                  <span className="lbl">Current Points:</span>
                  <span className="val">{f.points}</span>
                </div>
                <div className="stat-pill">
                  <span className="lbl">Total Wins:</span>
                  <span className="val">{f.wins}</span>
                </div>
              </div>

              <button
                type="button"
                className={`ffa-select-btn ${isSelected ? 'btn-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWinnerId(f.id);
                }}
              >
                {isSelected ? '👑 Selected Champion' : 'Select as Winner'}
              </button>

              {isSelected && (
                <div className="winner-reward-tag">
                  Will receive +1 point & crowned #1 Champion!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm Final Result Button */}
      <div className="ffa-actions-bar">
        <button
          className="ffa-confirm-btn"
          disabled={!selectedWinnerId}
          onClick={handleConfirmWinner}
        >
          {selectedWinnerId
            ? `🏆 Award +1 Point & Crown ${players.find(p => p.id === selectedWinnerId)?.name} as Champion!`
            : 'Select the Free For All winner above'}
        </button>
      </div>
    </div>
  );
}
