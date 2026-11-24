import React, { useState } from 'react';
import './MatchPanel.css';

export default function MatchPanel({ players, onMatchResult, matchCount }) {
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [winner, setWinner] = useState(null); // 'A' or 'B'
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const togglePlayerTeam = (playerId, team) => {
    const otherTeam = team === 'A' ? teamB : teamA;
    const setOther = team === 'A' ? setTeamB : setTeamA;
    const current = team === 'A' ? teamA : teamB;
    const setCurrent = team === 'A' ? setTeamA : setTeamB;

    // Remove from other team if present
    if (otherTeam.includes(playerId)) {
      setOther(prev => prev.filter(id => id !== playerId));
    }

    if (current.includes(playerId)) {
      setCurrent(prev => prev.filter(id => id !== playerId));
    } else {
      if (current.length >= 3) {
        setError(`Team ${team} already has 3 players!`);
        setTimeout(() => setError(''), 2000);
        return;
      }
      setCurrent(prev => [...prev, playerId]);
    }
    setError('');
  };

  const getPlayerTeam = (id) => {
    if (teamA.includes(id)) return 'A';
    if (teamB.includes(id)) return 'B';
    return null;
  };

  const handleSubmit = () => {
    if (teamA.length !== 3 || teamB.length !== 3) {
      setError('Each team must have exactly 3 players!');
      return;
    }
    if (!winner) {
      setError('Please select the winning team!');
      return;
    }
    setError('');
    const winnerIds = winner === 'A' ? teamA : teamB;
    const loserIds = winner === 'A' ? teamB : teamA;
    const matchLabel = `Match #${matchCount + 1}`;
    onMatchResult(winnerIds, loserIds, matchLabel);
    // Reset
    setTeamA([]);
    setTeamB([]);
    setWinner(null);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleClear = () => {
    setTeamA([]);
    setTeamB([]);
    setWinner(null);
    setError('');
  };

  return (
    <div className="match-panel">
      <div className="match-header">
        <h2>⚔ Record Match #{matchCount + 1}</h2>
        <p className="match-hint">Select 3 players per team, then pick the winner</p>
      </div>

      {error && <div className="match-error">⚠ {error}</div>}

      {/* Player Selection */}
      <div className="player-grid-section">
        <h3 className="section-title">🎯 Select Players</h3>
        <div className="player-grid">
          {players.map(player => {
            const pTeam = getPlayerTeam(player.id);
            return (
              <div key={player.id} className={`player-card ${pTeam ? `selected-${pTeam}` : ''}`}>
                <div className="player-card-avatar">{player.name.charAt(0).toUpperCase()}</div>
                <div className="player-card-name">{player.name}</div>
                <div className="player-card-pts">{player.points} pts</div>
                {pTeam && <div className="player-team-badge">Team {pTeam}</div>}
                <div className="player-card-btns">
                  <button
                    className={`team-btn team-a-btn ${pTeam === 'A' ? 'active' : ''}`}
                    onClick={() => togglePlayerTeam(player.id, 'A')}
                    disabled={teamA.length >= 3 && !teamA.includes(player.id)}
                  >
                    Team A
                  </button>
                  <button
                    className={`team-btn team-b-btn ${pTeam === 'B' ? 'active' : ''}`}
                    onClick={() => togglePlayerTeam(player.id, 'B')}
                    disabled={teamB.length >= 3 && !teamB.includes(player.id)}
                  >
                    Team B
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teams Display */}
      <div className="teams-display">
        <div className={`team-box ${winner === 'A' ? 'team-winner' : ''}`}>
          <div className="team-label team-a-label">Team A</div>
          <div className="team-members">
            {teamA.length === 0
              ? <span className="empty-slot">Select 3 players</span>
              : teamA.map(id => {
                  const p = players.find(x => x.id === id);
                  return <div key={id} className="team-member-chip">{p?.name}</div>;
                })}
          </div>
          <div className="team-count">{teamA.length}/3</div>
        </div>

        <div className="vs-divider">VS</div>

        <div className={`team-box ${winner === 'B' ? 'team-winner' : ''}`}>
          <div className="team-label team-b-label">Team B</div>
          <div className="team-members">
            {teamB.length === 0
              ? <span className="empty-slot">Select 3 players</span>
              : teamB.map(id => {
                  const p = players.find(x => x.id === id);
                  return <div key={id} className="team-member-chip">{p?.name}</div>;
                })}
          </div>
          <div className="team-count">{teamB.length}/3</div>
        </div>
      </div>

      {/* Winner Selection */}
      {teamA.length === 3 && teamB.length === 3 && (
        <div className="winner-section">
          <h3 className="section-title">🏆 Who Won?</h3>
          <div className="winner-btns">
            <button
              className={`winner-btn winner-a ${winner === 'A' ? 'selected' : ''}`}
              onClick={() => setWinner('A')}
            >
              🏆 Team A Wins
            </button>
            <button
              className={`winner-btn winner-b ${winner === 'B' ? 'selected' : ''}`}
              onClick={() => setWinner('B')}
            >
              🏆 Team B Wins
            </button>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="match-actions">
        <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
        <button
          className={`btn btn-primary ${submitted ? 'btn-success' : ''}`}
          onClick={handleSubmit}
          disabled={teamA.length !== 3 || teamB.length !== 3 || !winner}
        >
          {submitted ? '✅ Recorded!' : '🎯 Submit Match'}
        </button>
      </div>
    </div>
  );
}
