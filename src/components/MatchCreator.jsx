import React, { useState } from 'react';
import './MatchCreator.css';

export default function MatchCreator({ players, onCompleteMatch, matchCount, onLiveStatusChange, isAdmin }) {
  const [matchTitle, setMatchTitle] = useState(`Match #${matchCount + 1}`);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');

  // Search query for the available players pool
  const [poolSearch, setPoolSearch] = useState('');

  // Player IDs assigned to Team 1 and Team 2 during setup
  const [team1PlayerIds, setTeam1PlayerIds] = useState([]);
  const [team2PlayerIds, setTeam2PlayerIds] = useState([]);

  // Live match active state
  const [isLiveMatchActive, setIsLiveMatchActive] = useState(false);

  // Points awarded in this active match: { [playerId]: number }
  const [livePoints, setLivePoints] = useState({});

  // Assigned players
  const team1Players = players.filter(p => team1PlayerIds.includes(p.id));
  const team2Players = players.filter(p => team2PlayerIds.includes(p.id));
  const assignedIds = [...team1PlayerIds, ...team2PlayerIds];

  // Eligible players pool:
  const eligiblePlayers = players.filter(p => !p.isEliminated);
  const availablePlayers = eligiblePlayers.filter(p => !assignedIds.includes(p.id));

  // Search filtered available players
  const filteredAvailablePlayers = availablePlayers.filter(p =>
    p.name.toLowerCase().includes(poolSearch.toLowerCase())
  );

  // --- Setup Phase Actions ---
  const assignToTeam1 = (id) => {
    if (!isAdmin) return;
    setTeam2PlayerIds(prev => prev.filter(x => x !== id));
    if (!team1PlayerIds.includes(id)) {
      setTeam1PlayerIds(prev => [...prev, id]);
    }
  };

  const assignToTeam2 = (id) => {
    if (!isAdmin) return;
    setTeam1PlayerIds(prev => prev.filter(x => x !== id));
    if (!team2PlayerIds.includes(id)) {
      setTeam2PlayerIds(prev => [...prev, id]);
    }
  };

  const removeFromMatch = (id) => {
    if (!isAdmin) return;
    setTeam1PlayerIds(prev => prev.filter(x => x !== id));
    setTeam2PlayerIds(prev => prev.filter(x => x !== id));
  };

  const handleClearTeams = () => {
    if (!isAdmin) return;
    setTeam1PlayerIds([]);
    setTeam2PlayerIds([]);
  };

  // Launch the match into Live Mode
  const handleLaunchMatch = () => {
    if (!isAdmin) {
      alert('🔒 Please enter the keycode in the header to create and start matches.');
      return;
    }
    if (team1PlayerIds.length === 0 && team2PlayerIds.length === 0) {
      alert('Please assign players to the teams before starting the match!');
      return;
    }
    const initial = {};
    assignedIds.forEach(id => { initial[id] = 0; });
    setLivePoints(initial);
    setIsLiveMatchActive(true);
    if (onLiveStatusChange) onLiveStatusChange(true);
  };

  const handleCloseLive = () => {
    setIsLiveMatchActive(false);
    if (onLiveStatusChange) onLiveStatusChange(false);
  };

  // --- Live Match Scoring Actions ---
  const adjustLivePoints = (playerId, delta) => {
    if (!isAdmin) return;
    setLivePoints(prev => {
      const current = prev[playerId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [playerId]: next };
    });
  };

  const quickAwardTeam1 = () => {
    if (!isAdmin) return;
    setLivePoints(prev => {
      const copy = { ...prev };
      team1PlayerIds.forEach(id => { copy[id] = 1; });
      team2PlayerIds.forEach(id => { copy[id] = 0; });
      return copy;
    });
  };

  const quickAwardTeam2 = () => {
    if (!isAdmin) return;
    setLivePoints(prev => {
      const copy = { ...prev };
      team2PlayerIds.forEach(id => { copy[id] = 1; });
      team1PlayerIds.forEach(id => { copy[id] = 0; });
      return copy;
    });
  };

  // Finish and submit match
  const handleFinishMatch = () => {
    if (!isAdmin) return;
    const winningPlayerIds = assignedIds.filter(id => (livePoints[id] || 0) > 0);

    onCompleteMatch({
      title: matchTitle,
      team1Name,
      team2Name,
      team1PlayerIds,
      team2PlayerIds,
      pointsToAward: livePoints,
      winningPlayerIds,
    });

    handleCloseLive();
    handleClearTeams();
    setLivePoints({});
    setMatchTitle(`Match #${matchCount + 2}`);
  };

  // Total points assigned in this live match
  const totalPointsBeingAwarded = Object.values(livePoints).reduce((acc, curr) => acc + curr, 0);

  // Live leaderboard preview
  const liveLeaderboard = [...players].map(p => {
    const added = livePoints[p.id] || 0;
    return {
      ...p,
      liveTotalPoints: p.points + added,
      addedInMatch: added,
      isPlaying: assignedIds.includes(p.id),
    };
  }).sort((a, b) => b.liveTotalPoints - a.liveTotalPoints || b.wins - a.wins);

  return (
    <div className="match-creator-root">
      {/* Setup View (when not in live match) */}
      {!isLiveMatchActive && (
        <>
          <div className="mc-header">
            <div>
              <h2>⚔ Match Setup & Assignment</h2>
              <p className="mc-sub">
                Assign eligible players to <strong>{team1Name}</strong> and <strong>{team2Name}</strong>.
                {!isAdmin && <span className="locked-inline-msg"> 🔒 (View-only: Enter keycode above to edit or start matches)</span>}
              </p>
            </div>

            <div className="match-title-input-wrap">
              <label>Match Label:</label>
              <input
                type="text"
                value={matchTitle}
                onChange={(e) => setMatchTitle(e.target.value)}
                placeholder="e.g. Match #1, Semi-Final..."
                disabled={!isAdmin}
              />
            </div>
          </div>

          {/* Team Assignment Columns */}
          <div className="teams-setup-container">
            {/* TEAM 1 SETUP */}
            <div className="setup-team-column team-1-border">
              <div className="setup-team-header">
                <span className="badge-team badge-team-1">TEAM 1</span>
                <input
                  className="setup-team-name-input"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="Team 1 Name"
                  disabled={!isAdmin}
                />
                <span className="team-count-tag">{team1Players.length} Assigned</span>
              </div>

              <div className="setup-roster-list">
                {team1Players.length === 0 ? (
                  <div className="setup-empty-placeholder">
                    No players assigned yet.<br />
                    {isAdmin ? 'Search and select players from the eligible pool below.' : 'View-only mode.'}
                  </div>
                ) : (
                  team1Players.map(p => (
                    <div key={p.id} className="setup-player-item">
                      <div className="setup-player-left">
                        <div className="avatar-small t1-avatar">{p.name.charAt(0)}</div>
                        <div>
                          <div className="setup-player-name">{p.name}</div>
                          <div className="setup-player-score">{p.points} current pts</div>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          className="btn-remove-assigned"
                          onClick={() => removeFromMatch(p.id)}
                          title="Remove from Team 1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* VERSUS SIGN */}
            <div className="setup-vs-divider">
              <div className="vs-circle">VS</div>
            </div>

            {/* TEAM 2 SETUP */}
            <div className="setup-team-column team-2-border">
              <div className="setup-team-header">
                <span className="badge-team badge-team-2">TEAM 2</span>
                <input
                  className="setup-team-name-input"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="Team 2 Name"
                  disabled={!isAdmin}
                />
                <span className="team-count-tag">{team2Players.length} Assigned</span>
              </div>

              <div className="setup-roster-list">
                {team2Players.length === 0 ? (
                  <div className="setup-empty-placeholder">
                    No players assigned yet.<br />
                    {isAdmin ? 'Search and select players from the eligible pool below.' : 'View-only mode.'}
                  </div>
                ) : (
                  team2Players.map(p => (
                    <div key={p.id} className="setup-player-item">
                      <div className="setup-player-left">
                        <div className="avatar-small t2-avatar">{p.name.charAt(0)}</div>
                        <div>
                          <div className="setup-player-name">{p.name}</div>
                          <div className="setup-player-score">{p.points} current pts</div>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          className="btn-remove-assigned"
                          onClick={() => removeFromMatch(p.id)}
                          title="Remove from Team 2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Start Match Action Bar */}
          <div className="start-match-bar">
            {isAdmin && (
              <button className="btn-clear-setup" onClick={handleClearTeams}>
                ↺ Clear Assigned Teams
              </button>
            )}
            <button
              className="btn-launch-match"
              onClick={handleLaunchMatch}
              disabled={!isAdmin || (team1Players.length === 0 && team2Players.length === 0)}
              title={!isAdmin ? 'Enter keycode to start matches' : 'Click to launch live match console'}
            >
              {isAdmin ? '🚀 Start Match & Open Live Scoring' : '🔒 Start Match (Keycode Required)'}
            </button>
          </div>

          {/* Available Players Pool with Search Filter */}
          <div className="setup-pool-card">
            <div className="pool-header-with-search">
              <div>
                <h3>👥 Available Eligible Players Pool ({availablePlayers.length} active)</h3>
                <span className="pool-hint">
                  {isAdmin
                    ? 'Click "+ Team 1" or "+ Team 2" to assign players to this match.'
                    : 'Players available for tournament matches.'}
                </span>
              </div>

              {/* SEARCH BAR FOR TEAM ASSIGNMENT */}
              <div className="pool-search-input-wrap">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search player..."
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                />
                {poolSearch && (
                  <button className="clear-pool-search" onClick={() => setPoolSearch('')}>✕</button>
                )}
              </div>
            </div>

            {filteredAvailablePlayers.length === 0 ? (
              <div className="all-assigned-msg">
                {poolSearch
                  ? `No eligible players matching "${poolSearch}".`
                  : 'All eligible players have been assigned to this match or are eliminated.'}
              </div>
            ) : (
              <div className="setup-pool-grid">
                {filteredAvailablePlayers.map(player => (
                  <div key={player.id} className="pool-chip">
                    <div className="pool-chip-avatar">{player.name.charAt(0)}</div>
                    <div className="pool-chip-info">
                      <span className="pool-chip-name">{player.name}</span>
                      <span className="pool-chip-pts">
                        {player.points} pts {player.wins > 0 ? `(${player.wins}W)` : '(New)'}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="pool-chip-btns">
                        <button
                          className="btn-pool-assign assign-t1"
                          onClick={() => assignToTeam1(player.id)}
                          title={`Assign to ${team1Name}`}
                        >
                          + Team 1
                        </button>
                        <button
                          className="btn-pool-assign assign-t2"
                          onClick={() => assignToTeam2(player.id)}
                          title={`Assign to ${team2Name}`}
                        >
                          + Team 2
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ==============================================================
          FULL-SCREEN LIVE MATCH CONSOLE
         ============================================================== */}
      {isLiveMatchActive && (
        <div className="live-fullscreen-console">
          {/* Top Bar */}
          <div className="live-console-header">
            <div className="live-branding">
              <span className="live-dot" />
              <span className="live-pill-tag">LIVE MATCH CONSOLE</span>
              <span className="live-match-name">{matchTitle}</span>
            </div>
            <div className="live-header-buttons">
              <button className="btn-exit-console" onClick={handleCloseLive}>
                ✕ Exit Window
              </button>
              {isAdmin && (
                <button className="btn-top-save-match" onClick={handleFinishMatch}>
                  💾 Submit & Save Match Results
                </button>
              )}
            </div>
          </div>

          {/* Split Dual Panels */}
          <div className="live-console-body">
            {/* LEFT PANEL: Assigned Players & Points Controls */}
            <div className="live-side-marking">
              <div className="side-marking-head">
                <div className="head-text-group">
                  <h3>🎯 Award Match Points</h3>
                  <span className="head-sub">Add points to winning players. Defeated players with 0 pts will be eliminated.</span>
                </div>
                {totalPointsBeingAwarded > 0 && (
                  <span className="total-pts-tag">+{totalPointsBeingAwarded} pts to award</span>
                )}
              </div>

              {/* Quick Win Buttons */}
              {isAdmin && (
                <div className="quick-win-actions">
                  <button className="btn-preset-win win-t1" onClick={quickAwardTeam1}>
                    🏆 {team1Name} Won (+1 each)
                  </button>
                  <button className="btn-preset-win win-t2" onClick={quickAwardTeam2}>
                    🏆 {team2Name} Won (+1 each)
                  </button>
                </div>
              )}

              {/* Rosters with Steppers */}
              <div className="scoring-rosters-scroll">
                {/* Team 1 Roster */}
                <div className="scoring-team-group">
                  <div className="scoring-team-title t1-color">
                    <span>{team1Name}</span>
                    <span className="member-count">{team1Players.length} players</span>
                  </div>

                  <div className="scoring-players-stack">
                    {team1Players.map(p => {
                      const pts = livePoints[p.id] || 0;
                      return (
                        <div key={p.id} className={`scoring-player-item ${pts > 0 ? 'awarded-glow' : ''}`}>
                          <div className="p-left-info">
                            <div className="p-avatar t1-bg">{p.name.charAt(0)}</div>
                            <div>
                              <div className="p-name">{p.name}</div>
                              <div className="p-current">Current: {p.points} pts</div>
                            </div>
                          </div>

                          <div className="p-right-scoring">
                            <span className="stepper-label">Points:</span>
                            <div className="live-stepper">
                              <button
                                className="live-step-btn"
                                onClick={() => adjustLivePoints(p.id, -1)}
                                disabled={!isAdmin || pts <= 0}
                                title="Subtract 1 point"
                              >
                                -
                              </button>
                              <span className={`live-step-val ${pts > 0 ? 'val-win' : ''}`}>
                                +{pts}
                              </span>
                              <button
                                className="live-step-btn"
                                onClick={() => adjustLivePoints(p.id, 1)}
                                disabled={!isAdmin}
                                title="Add 1 point"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team 2 Roster */}
                <div className="scoring-team-group">
                  <div className="scoring-team-title t2-color">
                    <span>{team2Name}</span>
                    <span className="member-count">{team2Players.length} players</span>
                  </div>

                  <div className="scoring-players-stack">
                    {team2Players.map(p => {
                      const pts = livePoints[p.id] || 0;
                      return (
                        <div key={p.id} className={`scoring-player-item ${pts > 0 ? 'awarded-glow' : ''}`}>
                          <div className="p-left-info">
                            <div className="p-avatar t2-bg">{p.name.charAt(0)}</div>
                            <div>
                              <div className="p-name">{p.name}</div>
                              <div className="p-current">Current: {p.points} pts</div>
                            </div>
                          </div>

                          <div className="p-right-scoring">
                            <span className="stepper-label">Points:</span>
                            <div className="live-stepper">
                              <button
                                className="live-step-btn"
                                onClick={() => adjustLivePoints(p.id, -1)}
                                disabled={!isAdmin || pts <= 0}
                                title="Subtract 1 point"
                              >
                                -
                              </button>
                              <span className={`live-step-val ${pts > 0 ? 'val-win' : ''}`}>
                                +{pts}
                              </span>
                              <button
                                className="live-step-btn"
                                onClick={() => adjustLivePoints(p.id, 1)}
                                disabled={!isAdmin}
                                title="Add 1 point"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Direct Submit Button inside Left Panel */}
              {isAdmin && (
                <div className="direct-submit-container">
                  <button className="btn-direct-submit" onClick={handleFinishMatch}>
                    💾 Submit & Save Match Results
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: Live Updating Leaderboard List */}
            <div className="live-side-leaderboard">
              <div className="side-lb-head">
                <h3>🏆 Live Leaderboard Standing</h3>
                <span className="head-sub">Updates in real-time as you award points on the left</span>
              </div>

              <div className="live-lb-table-wrapper">
                <table className="live-lb-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Live Score</th>
                      <th>Match Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveLeaderboard.map((player, idx) => (
                      <tr
                        key={player.id}
                        className={`live-lb-row ${player.isPlaying ? 'row-in-match' : ''} ${player.addedInMatch > 0 ? 'row-gained-pts' : ''}`}
                      >
                        <td className="live-rank-col">
                          {idx === 0 && player.liveTotalPoints > 0 ? (
                            <span className="live-medal gold">🥇 1</span>
                          ) : idx === 1 && player.liveTotalPoints > 0 ? (
                            <span className="live-medal silver">🥈 2</span>
                          ) : idx === 2 && player.liveTotalPoints > 0 ? (
                            <span className="live-medal bronze">🥉 3</span>
                          ) : (
                            <span className="live-rank-num">#{idx + 1}</span>
                          )}
                        </td>

                        <td className="live-name-col">
                          <span className="live-lb-pname">{player.name}</span>
                          {player.isPlaying && (
                            <span className="playing-now-pill">IN MATCH</span>
                          )}
                          {player.isEliminated && !player.isPlaying && (
                            <span className="eliminated-pill">DEFEATED</span>
                          )}
                        </td>

                        <td className="live-pts-col">
                          <span className="live-pts-badge">
                            {player.liveTotalPoints} pts
                            {player.addedInMatch > 0 && (
                              <span className="added-pts-tag">+{player.addedInMatch}</span>
                            )}
                          </span>
                        </td>

                        <td className="live-status-col">
                          {player.addedInMatch > 0 ? (
                            <span className="status-gaining">Winning</span>
                          ) : player.isPlaying ? (
                            <span className="status-playing">Playing</span>
                          ) : player.isEliminated ? (
                            <span className="status-defeated">Defeated</span>
                          ) : (
                            <span className="status-idle">Bench</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Fixed Bar */}
          <div className="live-console-footer">
            <div className="footer-status-info">
              {totalPointsBeingAwarded > 0 ? (
                <span>Ready to save: <strong>+{totalPointsBeingAwarded} points</strong> awarded to winning players</span>
              ) : (
                <span>Award points to the winners, then click Submit to record the match</span>
              )}
            </div>
            <div className="footer-btns">
              <button className="btn-exit-console" onClick={handleCloseLive}>
                ✕ Exit Window
              </button>
              {isAdmin && (
                <button className="btn-bottom-submit" onClick={handleFinishMatch}>
                  💾 Submit & Save Match Results
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
