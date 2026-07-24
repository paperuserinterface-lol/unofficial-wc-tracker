// Stats Page Logic
// Top Scorers, Golden Glove race, and match records are computed live from
// the tournament's real match data. Assists are populated when the live feed
// exposes them; otherwise the card shows the current status without guessing.
// Team/Player of the Tournament are clearly-labeled editorial picks (like the
// app's other curated content), not official awards.

let statsTeams = [];
let statsIntervalId = null;
let playerPerformance = {};

// Fan XI (4-3-3), editorial pick by rating using the existing player database.
const TOTT_PLAYER_IDS = [78, 79, 80, 81, 28, 26, 83, 84, 1, 85, 86];
const POTT_PLAYER_ID = 1; // Lionel Messi — editorial pick

function stripBidiControls(str) {
    return str.replace(/[\u200e\u200f\u202a-\u202e]/g, '');
}

function parseNameEntries(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (raw === 'null') return [];

    const trimmed = String(raw).trim();
    if (!trimmed) return [];

    const inner = trimmed.replace(/^\{/, '').replace(/\}$/, '');
    if (!inner) return [];

    return inner
        .split('","')
        .map(part => part.replace(/^"/, '').replace(/"$/, '').trim())
        .filter(Boolean);
}

function extractScorerName(entry) {
    const isOwnGoal = /\(og\)/i.test(entry);
    const match = entry.match(/^(.*?)\d/);
    const rawName = match ? match[1] : entry;
    return { name: stripBidiControls(rawName).trim(), isOwnGoal };
}

function normalizeName(value) {
    return (value || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
}

function getTeamInfo(teamId) {
    return statsTeams.find(t => t.id === teamId);
}

function computeTopScorers(games) {
    const tally = {};

    games.forEach(game => {
        [
            { scorers: game.home_scorers, teamId: game.home_team_id },
            { scorers: game.away_scorers, teamId: game.away_team_id }
        ].forEach(({ scorers, teamId }) => {
            parseNameEntries(scorers).forEach(entry => {
                const { name, isOwnGoal } = extractScorerName(entry);
                if (isOwnGoal || !name) return;

                const key = `${teamId}::${name}`;
                if (!tally[key]) {
                    tally[key] = { name, teamId, goals: 0 };
                }
                tally[key].goals += 1;
            });
        });
    });

    return Object.values(tally).sort((a, b) => b.goals - a.goals);
}

function computePlayerPerformance(games) {
    const tally = {};

    games.forEach(game => {
        [
            { scorers: game.home_scorers, teamId: game.home_team_id },
            { scorers: game.away_scorers, teamId: game.away_team_id }
        ].forEach(({ scorers }) => {
            parseNameEntries(scorers).forEach(entry => {
                const { name, isOwnGoal } = extractScorerName(entry);
                if (isOwnGoal || !name) return;

                const key = normalizeName(name);
                if (!tally[key]) {
                    tally[key] = { name, goals: 0 };
                }
                tally[key].goals += 1;
            });
        });
    });

    return tally;
}

function computeTopAssists(games) {
    const tally = {};

    const collectEntries = (entries, teamId) => {
        parseNameEntries(entries).forEach(entry => {
            const trimmed = stripBidiControls(String(entry).trim());
            if (!trimmed) return;

            const key = `${teamId}::${trimmed}`;
            if (!tally[key]) {
                tally[key] = { name: trimmed, teamId, assists: 0 };
            }
            tally[key].assists += 1;
        });
    };

    games.forEach(game => {
        const assistFields = [
            game.home_assists,
            game.away_assists,
            game.home_assist,
            game.away_assist,
            game.home_assisters,
            game.away_assisters,
            game.home_assistant,
            game.away_assistant,
            game.assists,
            game.assist
        ];

        const hasAssistData = assistFields.some(value => value !== undefined && value !== null && value !== '' && value !== 'null');
        if (!hasAssistData) return;

        collectEntries(game.home_assists || game.home_assist || game.home_assisters || game.home_assistant, game.home_team_id);
        collectEntries(game.away_assists || game.away_assist || game.away_assisters || game.away_assistant, game.away_team_id);
    });

    return Object.values(tally).sort((a, b) => b.assists - a.assists);
}

function computeGoldenGloveRace(games) {
    const stats = {};

    const ensureTeam = teamId => {
        if (!stats[teamId]) {
            stats[teamId] = { teamId, cleanSheets: 0, conceded: 0, played: 0 };
        }
    };

    games.forEach(game => {
        if (game.finished !== 'TRUE') return;
        const homeScore = parseInt(game.home_score, 10);
        const awayScore = parseInt(game.away_score, 10);
        if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) return;

        ensureTeam(game.home_team_id);
        ensureTeam(game.away_team_id);

        stats[game.home_team_id].played += 1;
        stats[game.away_team_id].played += 1;
        stats[game.home_team_id].conceded += awayScore;
        stats[game.away_team_id].conceded += homeScore;
        if (awayScore === 0) stats[game.home_team_id].cleanSheets += 1;
        if (homeScore === 0) stats[game.away_team_id].cleanSheets += 1;
    });

    return Object.values(stats).sort((a, b) => {
        if (b.cleanSheets !== a.cleanSheets) return b.cleanSheets - a.cleanSheets;
        return a.conceded - b.conceded;
    });
}

function computeMatchRecords(games) {
    const finished = games
        .filter(game => game.finished === 'TRUE')
        .map(game => {
            const homeScore = parseInt(game.home_score, 10);
            const awayScore = parseInt(game.away_score, 10);
            return {
                game,
                homeScore,
                awayScore,
                total: homeScore + awayScore,
                margin: Math.abs(homeScore - awayScore)
            };
        })
        .filter(entry => !Number.isNaN(entry.total));

    const mostGoals = [...finished].sort((a, b) => b.total - a.total).slice(0, 3);
    const biggestWins = [...finished]
        .filter(entry => entry.margin > 0)
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 3);

    return { mostGoals, biggestWins };
}

// ---------- Rendering ----------

function renderStatsRow({ rank, flag, name, teamLabel, value, isLeader }) {
    return `
        <div class="stats-row${isLeader ? ' stats-row-leader' : ''}">
            <span class="stats-rank">${rank}</span>
            ${flag ? `<img src="${flag}" class="stats-flag" alt="">` : '<span class="stats-flag-placeholder">🏳</span>'}
            <span class="stats-name">${name}</span>
            <span class="stats-team">${teamLabel || ''}</span>
            <span class="stats-value">${value}</span>
        </div>
    `;
}

function renderTopScorers(scorers) {
    const container = document.getElementById('stats-top-scorers');
    if (!container) return;

    const top = scorers.slice(0, 10);
    if (top.length === 0) {
        container.innerHTML = '<p class="stats-empty">No goals recorded yet.</p>';
        return;
    }

    container.innerHTML = top.map((entry, index) => {
        const team = getTeamInfo(entry.teamId);
        return renderStatsRow({
            rank: index + 1,
            flag: team ? team.flag : '',
            name: entry.name,
            teamLabel: team ? team.name_en : 'Unknown',
            value: `${entry.goals} ${entry.goals === 1 ? 'goal' : 'goals'}`,
            isLeader: index === 0
        });
    }).join('');
}

function renderTopAssists(assists) {
    const container = document.getElementById('stats-top-assists');
    if (!container) return;

    const top = (assists || []).slice(0, 10);
    if (top.length === 0) {
        container.innerHTML = `
            <p class="stats-empty">Assist data isn't available from the live feed yet.<br>Check back once it becomes available.</p>
        `;
        return;
    }

    container.innerHTML = top.map((entry, index) => {
        const team = getTeamInfo(entry.teamId);
        return renderStatsRow({
            rank: index + 1,
            flag: team ? team.flag : '',
            name: entry.name,
            teamLabel: team ? team.name_en : 'Unknown',
            value: `${entry.assists} ${entry.assists === 1 ? 'assist' : 'assists'}`,
            isLeader: index === 0
        });
    }).join('');
}

function renderGoldenGlove(raceData) {
    const container = document.getElementById('stats-golden-glove');
    if (!container) return;

    const top = raceData.filter(entry => entry.played > 0).slice(0, 5);
    if (top.length === 0) {
        container.innerHTML = '<p class="stats-empty">No finished matches yet.</p>';
        return;
    }

    container.innerHTML = top.map((entry, index) => {
        const team = getTeamInfo(entry.teamId);
        return renderStatsRow({
            rank: index + 1,
            flag: team ? team.flag : '',
            name: team ? team.name_en : 'Unknown',
            teamLabel: `${entry.cleanSheets} clean sheet${entry.cleanSheets === 1 ? '' : 's'}`,
            value: `${entry.conceded} conceded`,
            isLeader: index === 0
        });
    }).join('');
}

function renderMatchRecords(records) {
    const mostGoalsContainer = document.getElementById('stats-most-goals');
    const biggestWinsContainer = document.getElementById('stats-biggest-wins');

    const renderEntry = (entry, index, valueLabel) => {
        const home = getTeamInfo(entry.game.home_team_id);
        const away = getTeamInfo(entry.game.away_team_id);
        const homeName = home ? home.name_en : 'Unknown';
        const awayName = away ? away.name_en : 'Unknown';

        return `
            <div class="stats-row">
                <span class="stats-rank">${index + 1}</span>
                <span class="stats-name stats-name-wide">${homeName} ${entry.homeScore}-${entry.awayScore} ${awayName}</span>
                <span class="stats-value">${valueLabel}</span>
            </div>
        `;
    };

    if (mostGoalsContainer) {
        mostGoalsContainer.innerHTML = records.mostGoals.length
            ? records.mostGoals.map((entry, index) => renderEntry(entry, index, `${entry.total} goals`)).join('')
            : '<p class="stats-empty">No finished matches yet.</p>';
    }

    if (biggestWinsContainer) {
        biggestWinsContainer.innerHTML = records.biggestWins.length
            ? records.biggestWins.map((entry, index) => renderEntry(entry, index, `+${entry.margin}`)).join('')
            : '<p class="stats-empty">No decisive results yet.</p>';
    }
}

function renderTott() {
    const container = document.getElementById('stats-tott-players');
    if (!container || typeof PLAYERS === 'undefined') return;

    const players = TOTT_PLAYER_IDS.map(id => PLAYERS.find(p => p.id === id)).filter(Boolean);
    if (players.length === 0) {
        container.innerHTML = '<p class="stats-empty">Team of the Tournament unavailable.</p>';
        return;
    }

    const rows = [
        players.slice(0, 1),
        players.slice(1, 5),
        players.slice(5, 8),
        players.slice(8, 11)
    ];

    container.innerHTML = rows.map(row => `
        <div class="pitch-row">
            ${row.map(player => `
                <div class="player-slot" title="${player.name}">
                    <div class="player-card-mini">
                        <div class="player-rating">${player.rating}</div>
                        <div class="player-name">${player.name.split(' ').pop()}</div>
                    </div>
                    <div class="player-position">${player.nation} ${player.position}</div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function renderPott() {
    const container = document.getElementById('stats-pott');
    if (!container || typeof PLAYERS === 'undefined') return;

    const player = PLAYERS.find(p => p.id === POTT_PLAYER_ID);
    if (!player) {
        container.innerHTML = '<p class="stats-empty">Player of the Tournament unavailable.</p>';
        return;
    }

    const liveImpact = playerPerformance[normalizeName(player.name)] || { goals: 0 };
    const keyStats = [
        { label: 'Rating', value: player.rating },
        { label: 'Pace', value: player.pace },
        { label: 'Shooting', value: player.shooting },
        { label: 'Passing', value: player.passing },
        { label: 'Dribbling', value: player.dribbling }
    ];

    container.innerHTML = `
        <div class="pott-spotlight">
            <div class="pott-rating">${player.rating}</div>
            <div class="pott-info">
                <div class="pott-name">${player.nation} ${player.name}</div>
                <div class="pott-club">${player.club} · ${player.position}</div>
                <p class="pott-blurb">Editorial pick for standout performances and match-winning impact across the tournament so far.</p>
            </div>
        </div>
        <div class="pott-stats-grid">
            <div class="pott-stat">
                <span class="pott-stat-label">Live goals</span>
                <span class="pott-stat-value">${liveImpact.goals}</span>
            </div>
            <div class="pott-stat">
                <span class="pott-stat-label">Physical</span>
                <span class="pott-stat-value">${player.physical}</span>
            </div>
            <div class="pott-stat">
                <span class="pott-stat-label">Defense</span>
                <span class="pott-stat-value">${player.defense}</span>
            </div>
        </div>
        <div class="pott-stats-grid pott-stats-grid-secondary">
            ${keyStats.map(stat => `
                <div class="pott-stat pott-stat-secondary">
                    <span class="pott-stat-label">${stat.label}</span>
                    <span class="pott-stat-value">${stat.value}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderStatsError() {
    ['stats-top-scorers', 'stats-golden-glove', 'stats-most-goals', 'stats-biggest-wins'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p class="stats-empty">Unable to load live stats right now.</p>';
    });
    renderTopAssists([]);
    renderPott();
}

// ---------- Data fetching ----------

async function fetchStatsData() {
    try {
        const [gamesRes, teamsRes] = await Promise.all([
            fetch('https://worldcup26.ir/get/games'),
            fetch('https://worldcup26.ir/get/teams')
        ]);
        const gamesData = await gamesRes.json();
        const teamsData = await teamsRes.json();

        statsTeams = teamsData.teams || [];
        const games = gamesData.games || [];
    playerPerformance = computePlayerPerformance(games);

        renderTopScorers(computeTopScorers(games));
        renderTopAssists(computeTopAssists(games));
        renderGoldenGlove(computeGoldenGloveRace(games));
        renderMatchRecords(computeMatchRecords(games));
        renderPott();
    } catch (error) {
        console.error('Error fetching stats data:', error);
        renderStatsError();
    }
}

function initStatsPage() {
    fetchStatsData();
    renderTott();
    renderPott();

    if (!statsIntervalId) {
        statsIntervalId = setInterval(fetchStatsData, 60000);
    }
}
