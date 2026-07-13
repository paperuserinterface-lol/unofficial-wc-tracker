// Bracket & Groups Page Logic
let bracketTeams = [];
let knockoutMatches = [];

async function fetchBracketData() {
    try {
        const [groupsRes, teamsRes, gamesRes] = await Promise.all([
            fetch('https://worldcup26.ir/get/groups'),
            fetch('https://worldcup26.ir/get/teams'),
            fetch('https://worldcup26.ir/get/games')
        ]);
        const groupsData = await groupsRes.json();
        const teamsData = await teamsRes.json();
        const gamesData = await gamesRes.json();
        
        bracketTeams = teamsData.teams;
        knockoutMatches = gamesData.games.filter(game => ['r32', 'r16', 'qf', 'sf', 'final'].includes(game.type));
        const groups = groupsData.groups.sort((a, b) => a.name.localeCompare(b.name));
        
        renderGroups(groups);
        renderKnockout();
    } catch (error) {
        console.error('Error fetching bracket data:', error);
        // Fallback to mock data
        renderGroups(Object.entries(GROUP_DATA).map(([name, teams]) => ({
            name,
            teams
        })));
        knockoutMatches = [];
        renderKnockout();
    }
}

function renderGroups(groups) {
    const container = document.getElementById('groups-container');
    container.innerHTML = '';

    groups.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        
        // Sort group teams: first by pts descending, then gd, then gf
        const sortedTeams = [...group.teams].sort((a, b) => {
            const ptsA = parseInt(a.pts);
            const ptsB = parseInt(b.pts);
            if (ptsB !== ptsA) return ptsB - ptsA;
            
            const gdA = parseInt(a.gd);
            const gdB = parseInt(b.gd);
            if (gdB !== gdA) return gdB - gdA;
            
            const gfA = parseInt(a.gf);
            const gfB = parseInt(b.gf);
            return gfB - gfA;
        });
        
        groupCard.innerHTML = `
            <h3 class="group-title">Group ${group.name}</h3>
            <table class="group-table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GF</th>
                        <th>GA</th>
                        <th>GD</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTeams.map(team => {
                        const teamInfo = bracketTeams.find(t => t.id === team.team_id);
                        return `
                            <tr>
                                <td class="team-cell">
                                    ${teamInfo && teamInfo.flag ? `<img src="${teamInfo.flag}" style="width: 24px; height: auto; margin-right: 8px;">` : ''}
                                    ${teamInfo ? teamInfo.name_en : 'Unknown'}
                                </td>
                                <td>${team.mp}</td>
                                <td>${team.w}</td>
                                <td>${team.d}</td>
                                <td>${team.l}</td>
                                <td>${team.gf}</td>
                                <td>${team.ga}</td>
                                <td>${team.gd}</td>
                                <td style="color: var(--primary-light);">${team.pts}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        container.appendChild(groupCard);
    });
}

function formatKnockoutDate(dateStr) {
    const date = new Date(dateStr);
    if (!Number.isNaN(date.getTime())) {
        const month = date.toLocaleDateString(undefined, {
            month: 'short'
        });
        const day = date.getDate();
        return `${month} ${day}`;
    }

    if (typeof dateStr !== 'string') {
        return '';
    }

    const [datePart] = dateStr.trim().split(' ');
    if (!datePart) {
        return String(dateStr);
    }

    if (datePart.includes('/')) {
        const [month, day] = datePart.split('/').map(Number);
        const tempDate = new Date(2026, month - 1, day);
        return tempDate.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        });
    }

    if (datePart.includes('-')) {
        const [year, month, day] = datePart.split('-').map(Number);
        const tempDate = new Date(year, month - 1, day);
        return tempDate.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        });
    }

    return String(dateStr);
}

function getKnockoutStatus(match) {
    if (match.finished === 'TRUE') return 'FT';
    if (match.time_elapsed && match.time_elapsed !== 'notstarted') return `${match.time_elapsed}'`;
    return 'TBD';
}

function getTeamDisplay(match, side) {
    const teamId = match[`${side}_team_id`];
    const teamName = match[`${side}_team_name_en`];
    const teamLabel = match[`${side}_team_label`] || 'TBD';
    const teamInfo = bracketTeams.find(team => team.id === teamId);

    if (teamId && teamId !== '0' && teamName) {
        return {
            name: teamName,
            flag: teamInfo ? teamInfo.flag : '',
            label: teamLabel
        };
    }

    return {
        name: teamLabel,
        flag: '',
        label: teamLabel
    };
}

function getScoreDisplay(match, side) {
    const score = match[`${side}_score`];
    const penaltyScore = match[`${side}_penalty_score`];

    if (match.finished === 'TRUE' || match.time_elapsed !== 'notstarted') {
        if (penaltyScore && penaltyScore !== 'null') {
            return `${score} (${penaltyScore})`;
        }
        return score;
    }

    return '—';
}

function renderKnockoutMatch(match) {
    const home = getTeamDisplay(match, 'home');
    const away = getTeamDisplay(match, 'away');
    const showLabels = match.type === 'r32';

    return `
        <div class="bracket-match">
            <div class="bracket-match-meta">
                <span class="bracket-match-id">Match ${match.id}</span>
                <span class="bracket-match-status">${getKnockoutStatus(match)}</span>
            </div>
            <div class="bracket-match-date">${formatKnockoutDate(match.local_date)}</div>
            <div class="bracket-team">
                <div class="bracket-team-identity">
                    ${home.flag ? `<img src="${home.flag}" alt="${home.name}" class="bracket-team-flag">` : '<span class="bracket-team-flag bracket-team-flag-placeholder">🏳</span>'}
                    <div class="bracket-team-text">
                        <span class="bracket-team-name">${home.name}</span>
                        ${showLabels ? `<span class="bracket-team-label">${home.label}</span>` : ''}
                    </div>
                </div>
                <span class="bracket-team-score">${getScoreDisplay(match, 'home')}</span>
            </div>
            <div class="bracket-team">
                <div class="bracket-team-identity">
                    ${away.flag ? `<img src="${away.flag}" alt="${away.name}" class="bracket-team-flag">` : '<span class="bracket-team-flag bracket-team-flag-placeholder">🏳</span>'}
                    <div class="bracket-team-text">
                        <span class="bracket-team-name">${away.name}</span>
                        ${showLabels ? `<span class="bracket-team-label">${away.label}</span>` : ''}
                    </div>
                </div>
                <span class="bracket-team-score">${getScoreDisplay(match, 'away')}</span>
            </div>
        </div>
    `;
}

function renderKnockout() {
    const container = document.getElementById('knockout-container');
    const roundConfig = [
        { title: 'Round of 32', className: 'round-of-32', type: 'r32' },
        { title: 'Round of 16', className: 'round-of-16', type: 'r16' },
        { title: 'Quarterfinals', className: 'quarterfinals', type: 'qf' },
        { title: 'Semifinals', className: 'semifinals', type: 'sf' },
        { title: 'Final', className: 'final', type: 'final' }
    ];

    container.innerHTML = `
        <div class="bracket-layout">
            ${roundConfig.map(round => {
                const matches = knockoutMatches
                    .filter(match => match.type === round.type)
                    .sort((a, b) => parseInt(a.id) - parseInt(b.id));

                return `
                    <section class="bracket-column ${round.className}">
                        <h3 class="bracket-column-title">${round.title}</h3>
                        <div class="bracket-round ${round.className}">
                            ${matches.length ? matches.map(renderKnockoutMatch).join('') : '<div class="bracket-match"><div class="bracket-team"><span class="bracket-team-name">TBD</span><span class="bracket-team-score">—</span></div></div>'}
                        </div>
                    </section>
                `;
            }).join('')}
        </div>
    `;
}

let bracketPageInitialized = false;
let bracketRefreshIntervalId = null;

function initBracketPage() {
    fetchBracketData();

    if (!bracketPageInitialized) {
        document.querySelectorAll('.bracket-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.bracket-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const groupsContainer = document.getElementById('groups-container');
                const knockoutContainer = document.getElementById('knockout-container');
                
                if (tab.dataset.tab === 'groups') {
                    groupsContainer.style.display = 'grid';
                    knockoutContainer.style.display = 'none';
                } else {
                    groupsContainer.style.display = 'none';
                    knockoutContainer.style.display = 'block';
                }
            });
        });

        bracketPageInitialized = true;
    }
    
    if (!bracketRefreshIntervalId) {
        bracketRefreshIntervalId = setInterval(fetchBracketData, 60000);
    }
}
