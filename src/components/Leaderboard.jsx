import React, { useState } from 'react';
import './Leaderboard.css';

export default function Leaderboard({ players, totalMatches }) {
  const [search, setSearch] = useState('');

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points || b.wins - a.wins);
  const topScore = sortedPlayers[0]?.points || 0;

  const filteredPlayers = sortedPlayers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="leaderboard-root">
      {/* Top Overview Cards */}
      <div className="overview-stats-grid">
        <div className="overview-card">
          <span className="card-icon">🎮</span>
          <div>
            <div className="card-big-num">{totalMatches}</div>
            <div className="card-lbl">Matches Completed</div>
          </div>
        </div>

        <div className="overview-card">
          <span className="card-icon">👥</span>
          <div>
            <div className="card-big-num">{players.length}</div>
            <div className="card-lbl">Total Registered Players</div>
          </div>
        </div>

        <div className="overview-card">
          <span className="card-icon">⭐</span>
          <div>
            <div className="card-big-num">{topScore} pts</div>
            <div className="card-lbl">Leader Score</div>
          </div>
        </div>

        <div className="overview-card highlight-card">
          <span className="card-icon">👑</span>
          <div>
            <div className="card-big-num" style={{ fontSize: '1.2rem', color: '#fbbf24' }}>
              {sortedPlayers[0] && sortedPlayers[0].points > 0 ? sortedPlayers[0].name : 'Undecided'}
            </div>
            <div className="card-lbl">Current #1 Leader</div>
          </div>
        </div>
      </div>

      {/* Compact Top 3 Podium */}
      {sortedPlayers.length >= 3 && !search && (
        <div className="top-podium-section">
          {/* Rank 2 */}
          <div className="podium-step step-silver">
            <div className="podium-rank-tag">🥈 2ND PLACE</div>
            <div className="podium-avatar-bubble avatar-silver">
              {sortedPlayers[1]?.name.charAt(0).toUpperCase()}
            </div>
            <div className="podium-player-name">{sortedPlayers[1]?.name}</div>
            <div className="podium-bottom-points">{sortedPlayers[1]?.points} Points</div>
          </div>

          {/* Rank 1 */}
          <div className="podium-step step-gold">
            <div className="crown-icon-float">👑</div>
            <div className="podium-rank-tag">🥇 1ST PLACE</div>
            <div className="podium-avatar-bubble avatar-gold">
              {sortedPlayers[0]?.name.charAt(0).toUpperCase()}
            </div>
            <div className="podium-player-name">{sortedPlayers[0]?.name}</div>
            <div className="podium-bottom-points pill-gold">{sortedPlayers[0]?.points} Points</div>
          </div>

          {/* Rank 3 */}
          <div className="podium-step step-bronze">
            <div className="podium-rank-tag">🥉 3RD PLACE</div>
            <div className="podium-avatar-bubble avatar-bronze">
              {sortedPlayers[2]?.name.charAt(0).toUpperCase()}
            </div>
            <div className="podium-player-name">{sortedPlayers[2]?.name}</div>
            <div className="podium-bottom-points">{sortedPlayers[2]?.points} Points</div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="table-filter-bar">
        <div className="table-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search player by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-count">
          Showing {filteredPlayers.length} of {players.length} Players
        </div>
      </div>

      {/* Main Table with Tournament Status Column */}
      <div className="table-responsive-box">
        <table className="lb-datatable">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player Name</th>
              <th>Score (Points)</th>
              <th>Wins</th>
              <th>Matches</th>
              <th>Win Rate</th>
              <th>Tournament Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No players found. Add players from the "Players Directory" tab.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => {
                const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1;
                const winRate = player.matches > 0
                  ? Math.round((player.wins / player.matches) * 100)
                  : 0;

                return (
                  <tr
                    key={player.id}
                    className={`lb-data-row ${rank === 1 && player.points > 0 ? 'top-leader-row' : ''} ${player.isEliminated ? 'row-eliminated' : ''}`}
                  >
                    <td className="col-rank">
                      {rank === 1 && player.points > 0 ? (
                        <span className="medal-rank rank-1">🥇 1</span>
                      ) : rank === 2 && player.points > 0 ? (
                        <span className="medal-rank rank-2">🥈 2</span>
                      ) : rank === 3 && player.points > 0 ? (
                        <span className="medal-rank rank-3">🥉 3</span>
                      ) : (
                        <span className="rank-num-badge">#{rank}</span>
                      )}
                    </td>

                    <td className="col-player">
                      <div className="player-inline-wrap">
                        <div className={`avatar-mini ${rank === 1 && player.points > 0 ? 'avatar-leader' : ''} ${player.isEliminated ? 'avatar-dimmed' : ''}`}>
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="player-display-name">
                          {player.name}
                          {rank === 1 && player.points > 0 && (
                            <span className="leader-badge-pill">👑 LEADER</span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="col-points">
                      <span className="points-display-badge">
                        {player.points} pts
                      </span>
                    </td>

                    <td className="col-wins">{player.wins}</td>
                    <td className="col-matches">{player.matches}</td>

                    <td className="col-rate">
                      <div className="rate-bar-container">
                        <div
                          className="rate-bar-fill"
                          style={{ width: `${winRate}%` }}
                        />
                        <span className="rate-num">{winRate}%</span>
                      </div>
                    </td>

                    <td className="col-status">
                      {player.isEliminated ? (
                        <span className="status-pill-badge pill-defeated">Defeated</span>
                      ) : player.wins > 0 ? (
                        <span className="status-pill-badge pill-active">Active Winner</span>
                      ) : (
                        <span className="status-pill-badge pill-new">New Player</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
