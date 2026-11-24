import React, { useState } from 'react';
import './MatchArena.css';

export default function MatchArena({ players, onRecordMatch, matchCount }) {
  // Mode: 'preset_teams' or 'custom_players'
  const [mode, setMode] = useState('preset_teams');

  // Unique team names
  const teamNames = Array.from(new Set(players.map(p => p.teamName)));

  // Preset mode state
  const [selectedTeamA, setSelectedTeamA] = useState(teamNames[0] || '');
  const [selectedTeamB, setSelectedTeamB] = useState(teamNames[1] || '');

  // Custom mode state (array of player IDs)
  const [customTeamA, setCustomTeamA] = useState([]);
  const [customTeamB, setCustomTeamB] = useState([]);

  // Selected winning team
  const [winner, setWinner] = useState(null); // 'A' or 'B'
  const [errorMsg, setErrorMsg] = useState('');

  // Players in Team A & B
  const teamAPlayers = mode === 'preset_teams'
    ? players.filter(p => p.teamName === selectedTeamA)
    : players.filter(p => customTeamA.includes(p.id));

  const teamBPlayers = mode === 'preset_teams'
    ? players.filter(p => p.teamName === selectedTeamB)
    : players.filter(p => customTeamB.includes(p.id));

  // Toggle player in custom mode
  const toggleCustomPlayer = (playerId, targetTeam) => {
    if (targetTeam === 'A') {
      if (customTeamA.includes(playerId)) {
        setCustomTeamA(prev => prev.filter(id => id !== playerId));
      } else {
        if (customTeamA.length >= 3) {
          setErrorMsg('Team A already has 3 players!');
          setTimeout(() => setErrorMsg(''), 2500);
          return;
        }
        setCustomTeamB(prev => prev.filter(id => id !== playerId));
        setCustomTeamA(prev => [...prev, playerId]);
      }
    } else {
      if (customTeamB.includes(playerId)) {
        setCustomTeamB(prev => prev.filter(id => id !== playerId));
      } else {
        if (customTeamB.length >= 3) {
          setErrorMsg('Team B already has 3 players!');
          setTimeout(() => setErrorMsg(''), 2500);
          return;
        }
        setCustomTeamA(prev => prev.filter(id => id !== playerId));
        setCustomTeamB(prev => [...prev, playerId]);
      }
    }
  };

  const handleRecord = () => {
    if (teamAPlayers.length !== 3 || teamBPlayers.length !== 3) {
      setErrorMsg('Both teams must have exactly 3 players!');
      return;
    }

    if (mode === 'preset_teams' && selectedTeamA === selectedTeamB) {
      setErrorMsg('Please select two different teams!');
      return;
    }

    if (!winner) {
      setErrorMsg('Please select the winning team (Team A or Team B)!');
      return;
    }

    setErrorMsg('');
    const teamAName = mode === 'preset_teams' ? selectedTeamA : 'Custom Team A';
    const teamBName = mode === 'preset_teams' ? selectedTeamB : 'Custom Team B';

    onRecordMatch({
      teamAName,
      teamBName,
      teamAPlayers,
      teamBPlayers,
      winningTeam: winner,
    });

    // Reset winner selection
    setWinner(null);
    if (mode === 'custom_players') {
      setCustomTeamA([]);
      setCustomTeamB([]);
    }
  };

  return (
    <div className="arena-container">
      <div className="arena-header">
        <div className="arena-title-wrap">
          <span className="arena-badge">STAGE: 3v3 BATTLE</span>
          <h2>⚔ Match #{matchCount + 1} Center</h2>
          <p className="arena-subtitle">
            Teams of 3 compete against each other. Each winning player earns <strong>+1 point</strong>!
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mode-toggle">
          <button
            className={`toggle-btn ${mode === 'preset_teams' ? 'active' : ''}`}
            onClick={() => { setMode('preset_teams'); setWinner(null); }}
          >
            🛡 Choose Pre-set Teams
          </button>
          <button
            className={`toggle-btn ${mode === 'custom_players' ? 'active' : ''}`}
            onClick={() => { setMode('custom_players'); setWinner(null); }}
          >
            🎯 Custom 3-Player Pick
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="arena-error-banner">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Preset Team Selector Dropdowns */}
      {mode === 'preset_teams' && (
        <div className="preset-selector-row">
          <div className="selector-group team-a-group">
            <label>Select Team A (3 Players):</label>
            <select
              value={selectedTeamA}
              onChange={(e) => { setSelectedTeamA(e.target.value); setWinner(null); }}
            >
              {teamNames.map(t => (
                <option key={t} value={t} disabled={t === selectedTeamB}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="versus-pill">VS</div>

          <div className="selector-group team-b-group">
            <label>Select Team B (3 Players):</label>
            <select
              value={selectedTeamB}
              onChange={(e) => { setSelectedTeamB(e.target.value); setWinner(null); }}
            >
              {teamNames.map(t => (
                <option key={t} value={t} disabled={t === selectedTeamA}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Custom Player Picker */}
      {mode === 'custom_players' && (
        <div className="custom-picker-box">
          <div className="picker-header">
            <h4>Select 3 Players for Team A and 3 for Team B from the 30-player pool:</h4>
            <div className="picker-counts">
              <span className="count-a">Team A: {customTeamA.length}/3</span>
              <span className="count-b">Team B: {customTeamB.length}/3</span>
            </div>
          </div>

          <div className="player-selection-grid">
            {players.map(p => {
              const inA = customTeamA.includes(p.id);
              const inB = customTeamB.includes(p.id);
              return (
                <div key={p.id} className={`picker-card ${inA ? 'in-team-a' : ''} ${inB ? 'in-team-b' : ''}`}>
                  <div className="picker-avatar">{p.name.charAt(0)}</div>
                  <div className="picker-info">
                    <div className="p-name">{p.name}</div>
                    <div className="p-team">{p.teamName} • {p.points} pts</div>
                  </div>
                  <div className="picker-actions">
                    <button
                      className={`pick-btn pick-a ${inA ? 'active' : ''}`}
                      onClick={() => toggleCustomPlayer(p.id, 'A')}
                    >
                      {inA ? '✓ A' : '+ A'}
                    </button>
                    <button
                      className={`pick-btn pick-b ${inB ? 'active' : ''}`}
                      onClick={() => toggleCustomPlayer(p.id, 'B')}
                    >
                      {inB ? '✓ B' : '+ B'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* The Battle Arena Visual Display */}
      <div className="arena-battleground">
        {/* Team A Display */}
        <div className={`battle-side side-a ${winner === 'A' ? 'side-winner' : ''}`}>
          <div className="side-badge badge-a">TEAM A</div>
          <h3 className="side-team-title">
            {mode === 'preset_teams' ? selectedTeamA : 'Team A Selection'}
          </h3>

          <div className="roster-grid">
            {teamAPlayers.map(p => (
              <div key={p.id} className="roster-card">
                <div className="roster-avatar a-avatar">{p.name.charAt(0)}</div>
                <div className="roster-details">
                  <span className="roster-name">{p.name}</span>
                  <span className="roster-pts">{p.points} Current Points</span>
                </div>
                {winner === 'A' && <span className="pts-bonus">+1 pt</span>}
              </div>
            ))}
          </div>

          <button
            className={`winner-select-btn btn-win-a ${winner === 'A' ? 'selected' : ''}`}
            onClick={() => setWinner('A')}
          >
            {winner === 'A' ? '🏆 Team A is Winner' : 'Choose Team A as Winner'}
          </button>
        </div>

        {/* Central VS Divider */}
        <div className="arena-versus">
          <div className="lightning-icon">⚡</div>
          <div className="vs-text">VS</div>
          <div className="match-tag">3 vs 3</div>
        </div>

        {/* Team B Display */}
        <div className={`battle-side side-b ${winner === 'B' ? 'side-winner' : ''}`}>
          <div className="side-badge badge-b">TEAM B</div>
          <h3 className="side-team-title">
            {mode === 'preset_teams' ? selectedTeamB : 'Team B Selection'}
          </h3>

          <div className="roster-grid">
            {teamBPlayers.map(p => (
              <div key={p.id} className="roster-card">
                <div className="roster-avatar b-avatar">{p.name.charAt(0)}</div>
                <div className="roster-details">
                  <span className="roster-name">{p.name}</span>
                  <span className="roster-pts">{p.points} Current Points</span>
                </div>
                {winner === 'B' && <span className="pts-bonus">+1 pt</span>}
              </div>
            ))}
          </div>

          <button
            className={`winner-select-btn btn-win-b ${winner === 'B' ? 'selected' : ''}`}
            onClick={() => setWinner('B')}
          >
            {winner === 'B' ? '🏆 Team B is Winner' : 'Choose Team B as Winner'}
          </button>
        </div>
      </div>

      {/* Record Match Button */}
      <div className="arena-submit-bar">
        <button
          className="submit-match-action"
          disabled={!winner || teamAPlayers.length !== 3 || teamBPlayers.length !== 3}
          onClick={handleRecord}
        >
          {winner
            ? `🎯 Record Victory for ${winner === 'A' ? (mode === 'preset_teams' ? selectedTeamA : 'Team A') : (mode === 'preset_teams' ? selectedTeamB : 'Team B')} (+1 Point to each player)`
            : 'Select the winning team above to record'}
        </button>
      </div>
    </div>
  );
}
