import React from 'react';
import './MatchHistory.css';

export default function MatchHistory({ history, players }) {
  if (history.length === 0) {
    return (
      <div className="history-empty-container">
        <div className="history-icon-big">📋</div>
        <h3>No Matches Recorded Yet</h3>
        <p>Go to the <strong>Match Arena</strong> to assign players to Team 1 vs Team 2 and play matches!</p>
      </div>
    );
  }

  const getPlayerName = (id) => {
    const p = players.find(x => x.id === id);
    return p ? p.name : `Player #${id}`;
  };

  return (
    <div className="history-wrapper">
      <div className="history-header-bar">
        <h2>📋 Match History Log</h2>
        <span className="history-counter">{history.length} Matches Recorded</span>
      </div>

      <div className="history-items-list">
        {history.map((match) => {
          const dateStr = new Date(match.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div key={match.id} className="history-card-box">
              <div className="card-header-flex">
                <span className="match-title-tag">⚔ {match.title}</span>
                <span className="match-time-tag">{dateStr}</span>
              </div>

              <div className="match-sides-row">
                {/* Team 1 Side */}
                <div className="match-side-block side-1">
                  <div className="side-label-bar label-t1">{match.team1Name}</div>
                  <div className="players-awarded-list">
                    {match.team1PlayerIds?.length === 0 ? (
                      <span className="no-players-text">No players</span>
                    ) : (
                      match.team1PlayerIds.map(id => {
                        const pts = match.pointsAwarded?.[id] || 0;
                        return (
                          <div key={id} className={`player-awarded-pill ${pts > 0 ? 'awarded-positive' : ''}`}>
                            <span className="p-name">{getPlayerName(id)}</span>
                            <span className="p-award">{pts > 0 ? `+${pts} pts 🏆` : '+0 pts'}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="vs-sign">VS</div>

                {/* Team 2 Side */}
                <div className="match-side-block side-2">
                  <div className="side-label-bar label-t2">{match.team2Name}</div>
                  <div className="players-awarded-list">
                    {match.team2PlayerIds?.length === 0 ? (
                      <span className="no-players-text">No players</span>
                    ) : (
                      match.team2PlayerIds.map(id => {
                        const pts = match.pointsAwarded?.[id] || 0;
                        return (
                          <div key={id} className={`player-awarded-pill ${pts > 0 ? 'awarded-positive' : ''}`}>
                            <span className="p-name">{getPlayerName(id)}</span>
                            <span className="p-award">{pts > 0 ? `+${pts} pts 🏆` : '+0 pts'}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
