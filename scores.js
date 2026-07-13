// Scores Page Logic
let allMatches = [];
let allTeams = [];
let currentFilter = 'all';

async function fetchData() {
    try {
        // Fetch games and teams
        const [gamesRes, teamsRes] = await Promise.all([
            fetch('https://worldcup26.ir/get/games'),
            fetch('https://worldcup26.ir/get/teams')
        ]);
        const gamesData = await gamesRes.json();
        const teamsData = await teamsRes.json();
        
        allMatches = gamesData.games;
        allTeams = teamsData.teams;
        
        // Update matches with team info
        allMatches = allMatches.map(match => {
            const homeTeam = allTeams.find(t => t.id === match.home_team_id);
            const awayTeam = allTeams.find(t => t.id === match.away_team_id);
            
            return {
                ...match,
                homeTeam: homeTeam || { name_en: 'Unknown', flag: '' },
                awayTeam: awayTeam || { name_en: 'Unknown', flag: '' }
            };
        });
        
        filterMatches(currentFilter);
    } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        // Convert mock data to same format as API data
        const formattedMockMatches = MOCK_MATCHES.map(match => ({
            ...match,
            local_date: `${match.date} ${match.time}`,
            homeTeam: { name_en: match.homeTeam.name, flag: match.homeTeam.flag },
            awayTeam: { name_en: match.awayTeam.name, flag: match.awayTeam.flag },
            home_score: match.homeTeam.score,
            away_score: match.awayTeam.score,
            type: 'group',
            time_elapsed: match.status === 'live' ? match.minute : (match.status === 'upcoming' ? 'notstarted' : ''),
            finished: match.status === 'finished' ? 'TRUE' : 'FALSE'
        }));
        renderMatches(formattedMockMatches);
    }
}

function getMatchStatus(match) {
    if (match.finished === 'TRUE') return 'finished';
    if (match.time_elapsed && match.time_elapsed !== 'notstarted') return 'live';
    return 'upcoming';
}

const STADIUM_TIMEZONE_OFFSETS = {
    '1': -6,
    '2': -6,
    '3': -5,
    '4': -5,
    '5': -5,
    '6': -5,
    '7': -4,
    '8': -4,
    '9': -4,
    '10': -4,
    '11': -4,
    '12': -4,
    '13': -7,
    '14': -7,
    '15': -7,
    '16': -7
};

function parseMatchDateParts(dateStr) {
    if (typeof dateStr !== 'string') {
        return null;
    }

    const [datePart, timePart] = dateStr.trim().split(' ');
    if (!datePart || !timePart) {
        return null;
    }

    const [hours, minutes] = timePart.split(':').map(Number);
    if (datePart.includes('/')) {
        const [month, day, year] = datePart.split('/').map(Number);
        return { year, month, day, hours, minutes };
    }

    if (datePart.includes('-')) {
        const [year, month, day] = datePart.split('-').map(Number);
        return { year, month, day, hours, minutes };
    }

    return null;
}

function formatLocalDateTime(dateStr, stadiumId) {
    const parts = parseMatchDateParts(dateStr);
    if (!parts) {
        const fallback = String(dateStr).split(' ');
        return { date: fallback[0] || String(dateStr), time: fallback[1] || '' };
    }

    const sourceOffset = STADIUM_TIMEZONE_OFFSETS[stadiumId] ?? 0;
    const baseUtcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hours - sourceOffset, parts.minutes);
    const converted = new Date(baseUtcMs + 5 * 60 * 60 * 1000);
    const year = converted.getUTCFullYear();
    const month = String(converted.getUTCMonth() + 1).padStart(2, '0');
    const day = String(converted.getUTCDate()).padStart(2, '0');
    const hours = String(converted.getUTCHours()).padStart(2, '0');
    const minutes = String(converted.getUTCMinutes()).padStart(2, '0');

    return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes} GMT+5`
    };
}

function getAdvancementChances(match) {
    const homeScore = parseInt(match.home_score, 10);
    const awayScore = parseInt(match.away_score, 10);

    if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
        return null;
    }

    if (homeScore === awayScore) {
        return { home: 50, away: 50 };
    }

    const margin = Math.abs(homeScore - awayScore);
    const leaderChance = Math.min(95, 50 + margin * 20);
    const trailingChance = 100 - leaderChance;

    return homeScore > awayScore
        ? { home: leaderChance, away: trailingChance }
        : { home: trailingChance, away: leaderChance };
}

function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<div class="match-card"><p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No matches found</p></div>';
        return;
    }

    matches.forEach(match => {
        const status = getMatchStatus(match);
        const card = document.createElement('div');
        card.className = 'match-card';
        
        // Get formatted local date and time
        const dateTime = formatLocalDateTime(match.local_date, match.stadium_id);
        const advancementChances = status === 'live' ? getAdvancementChances(match) : null;
        
        let statusText = '';
        if (status === 'live') {
            statusText = `${match.time_elapsed}' LIVE`;
        } else if (status === 'upcoming') {
            statusText = dateTime.time;
        } else {
            statusText = 'FT';
        }
        
        card.innerHTML = `
            <div class="match-header">
                <div class="match-status ${status}">
                    ${statusText}
                </div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">
                    ${match.type === 'group' ? `Group ${match.group}` : match.type} • ${dateTime.date}${status !== 'live' ? ` • ${dateTime.time}` : ''}
                </div>
            </div>
            <div class="match-teams">
                <div class="team">
                    <div class="team-info">
                        ${match.homeTeam.flag ? `<img src="${match.homeTeam.flag}" class="team-flag" style="width: 40px; height: auto;">` : '<span class="team-flag">🏳</span>'}
                        <span class="team-name">${match.homeTeam.name_en}</span>
                    </div>
                    <span class="team-score">${match.home_score}</span>
                </div>
                <div class="team">
                    <div class="team-info">
                        ${match.awayTeam.flag ? `<img src="${match.awayTeam.flag}" class="team-flag" style="width: 40px; height: auto;">` : '<span class="team-flag">🏳</span>'}
                        <span class="team-name">${match.awayTeam.name_en}</span>
                    </div>
                    <span class="team-score">${match.away_score}</span>
                </div>
            </div>
            ${advancementChances ? `
                <div class="advancement-chances">
                    <span>${match.homeTeam.name_en}: ${advancementChances.home}%</span>
                    <span>${match.awayTeam.name_en}: ${advancementChances.away}%</span>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

function filterMatches(filter) {
    currentFilter = filter;
    let filtered = [...allMatches];
    
    if (filter !== 'all') {
        filtered = filtered.filter(m => getMatchStatus(m) === filter);
    }
    
    // Sort matches: live first, then upcoming, then finished
    filtered.sort((a, b) => {
        const statusOrder = { live: 0, upcoming: 1, finished: 2 };
        const aStatus = getMatchStatus(a);
        const bStatus = getMatchStatus(b);
        
        if (statusOrder[aStatus] !== statusOrder[bStatus]) {
            return statusOrder[aStatus] - statusOrder[bStatus];
        }
        return new Date(a.local_date) - new Date(b.local_date);
    });
    
    renderMatches(filtered);
}

function initScoresPage() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterMatches(tab.dataset.filter);
        });
    });
    
    // Initial data fetch
    fetchData();
    
    // Auto refresh live games every 30 seconds
    setInterval(fetchData, 30000);
}
