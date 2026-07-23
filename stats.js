// Stats Page Logic
// Top Scorers, Golden Glove race, and match records are computed live from
// the tournament's real match data. Assists aren't provided by the live
// feed, so that section is shown honestly as unavailable rather than
// guessed. Team/Player of the Tournament are clearly-labeled editorial
// picks (like the app's other curated content), not official awards.

let statsTeams = [];
let statsIntervalId = null;

// Fan XI (4-3-3), editorial pick by rating using the existing player database.
const TOTT_PLAYER_IDS = [2, 78, 22, 79, 80, 25, 10, 83, 1, 82, 18];
const POTT_PLAYER_ID = 1; // Kylian Mbappé — editorial pick

function stripBidiControls(str) {
    return str.replace(/[\u200e\u200f\u202a-\u202e]/g, '');
}

function parseScorerEntries(raw) {
    if (!raw || raw === 'null') return [];
    const trimmed = raw.trim();
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
            parseScorerEntries(scorers).forEach(entry => {
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

function renderTopAssists() {
    const container = document.getElementById('stats-top-assists');
    if (!container) return;

    container.innerHTML = `
        <p class="stats-empty">Assist data isn't provided by the live match feed yet.<br>Check back once it becomes available.</p>
    `;
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

    container.innerHTML = `
        <div class="pott-spotlight">
            <div class="pott-rating">${player.rating}</div>
            <div class="pott-info">
                <div class="pott-name">${player.nation} ${player.name}</div>
                <div class="pott-club">${player.club} · ${player.position}</div>
                <p class="pott-blurb">Editorial pick for standout performances and match-winning impact across the tournament so far.</p>
            </div>
        </div>
    `;
}

function renderStatsError() {
    ['stats-top-scorers', 'stats-golden-glove', 'stats-most-goals', 'stats-biggest-wins'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p class="stats-empty">Unable to load live stats right now.</p>';
    });
    renderTopAssists();
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

        renderTopScorers(computeTopScorers(games));
        renderTopAssists();
        renderGoldenGlove(computeGoldenGloveRace(games));
        renderMatchRecords(computeMatchRecords(games));
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
