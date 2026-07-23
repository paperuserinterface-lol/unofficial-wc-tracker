// Draft Page Logic

let currentFormation = '4-3-3';
let draftTeam = {
    players: {},
    substitutes: []
};
const DRAFT_STORAGE_KEY = 'worldCupDraft';

function getPlayersByPosition(position) {
    // Get players that match or are compatible with the position
    const compatiblePositions = {
        GK: ['GK'],
        CB: ['CB1', "CB2", "CB3", "CB4", "CB"],
        CB1: ['CB1', "CB2", "CB3", "CB4", "CB"],
        CB2: ['CB1', "CB2", "CB3", "CB4", "CB"],
        CB3: ['CB1', "CB2", "CB3", "CB4", "CB"],
        CB4: ['CB1', "CB2", "CB3", "CB4", "CB"],
        RB: ['RB', 'RWB'],
        LB: ['LB', 'LWB'],
        RWB: ['RWB', 'RB'],
        LWB: ['LWB', 'LB'],
        CDM1: ['CDM2', 'CDM1', 'CM', 'CDM'],
        CDM2: ['CDM1', 'CDM2', 'CM', 'CDM'],
        CM: ['CM', 'CDM1', 'CDM2', 'CAM', 'CM1', 'CM2', 'RM', 'LM'],
        CM1: ['CM', 'CDM1', 'CDM2', 'CAM', 'CM1', 'CM2' 'RM', 'LM'],
        CM2: ['CM', 'CDM1', 'CDM2', 'CAM', 'CM1', 'CM2' 'RM', 'LM'],
        CAM: ['CM', 'CAM', 'CM1', 'CM2'],
        RM: ['RM', 'RW', 'CM1'],
        LM: ['LM', 'LW', 'CM1'],
        RW: ['ST', 'RW', 'CAM', 'LW', 'LM', 'RM'],
        LW: ['ST', 'RW', 'CAM', 'LW', 'LM', 'RM'],
        ST: ['ST', 'RW', 'CAM', 'LW', 'LM', 'RM'],
        ST1: ['ST1', 'RW', 'CAM', 'LW', 'LM', 'RM']
    };
    
    const validPositions = compatiblePositions[position] || [position];
    return PLAYERS.filter(p => validPositions.includes(p.position));
}

function getRandomPlayers(position, count = 5) {
    // Get all used player IDs in current team and substitutes
    const usedPlayerIds = new Set();
    Object.values(draftTeam.players).forEach(p => { if (p) usedPlayerIds.add(p.id); });
    draftTeam.substitutes.forEach(p => { if (p) usedPlayerIds.add(p.id); });
    
    const positionPlayers = getPlayersByPosition(position).filter(p => !usedPlayerIds.has(p.id));
    const shuffled = [...positionPlayers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function renderPitch() {
    const container = document.getElementById('pitch-players');
    const formation = FORMATIONS[currentFormation];
    
    container.innerHTML = '';
    
    formation.layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'pitch-row';
        
        row.forEach(pos => {
            const slot = document.createElement('div');
            slot.className = 'player-slot';
            slot.dataset.position = pos;
            
            const player = draftTeam.players[pos];
            
            if (player) {
                slot.innerHTML = `
                    <div class="player-card-mini">
                        <div class="player-rating">${player.rating}</div>
                        <div class="player-name">${player.name.split(' ').pop()}</div>
                    </div>
                    <div class="player-position">${pos}</div>
                `;
            } else {
                slot.innerHTML = `
                    <div class="player-card-mini empty">
                        <div class="player-rating">?</div>
                        <div class="player-name">Select</div>
                    </div>
                    <div class="player-position">${pos}</div>
                `;
            }
            
            slot.addEventListener('click', () => openPlayerSelection(pos));
            rowDiv.appendChild(slot);
        });
        
        container.appendChild(rowDiv);
    });
    
    renderSubstitutes();
    calculateStats();
}

function renderSubstitutes() {
    const container = document.getElementById('substitutes-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const sub = draftTeam.substitutes[i];
        const slot = document.createElement('div');
        slot.className = 'substitute-slot';
        slot.dataset.index = i;
        
        if (sub) {
            slot.innerHTML = `
                <span class="player-rating">${sub.rating}</span>
                <span style="flex: 1;">${sub.name}</span>
                <span style="color: var(--text-secondary);">${sub.position}</span>
            `;
        } else {
            slot.innerHTML = `
                <span style="color: var(--text-secondary);">Sub ${i + 1}</span>
                <span style="flex: 1; text-align: center; color: var(--text-secondary);">Empty</span>
            `;
        }
        
        slot.addEventListener('click', () => openSubstituteSelection(i));
        container.appendChild(slot);
    }
}

let currentSelectPosition = null;
let currentSelectIsSubstitute = false;
let currentSelectIndex = null;

function openPlayerSelection(position) {
    currentSelectPosition = position;
    currentSelectIsSubstitute = false;
    
    const modal = document.getElementById('draft-modal');
    const title = document.getElementById('modal-title');
    const options = document.getElementById('player-options');
    
    title.textContent = `Choose ${position}`;
    
    const players = getRandomPlayers(position);
    
    options.innerHTML = players.map(player => `
        <div class="player-option-card" data-player-id="${player.id}">
            <div class="player-rating">${player.rating}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-nation">${player.nation} ${player.club}</div>
            <div class="player-stats">
                <span>PAC ${player.pace}</span>
                <span>SHO ${player.shooting}</span>
                <span>PAS ${player.passing}</span>
                <span>DRI ${player.dribbling}</span>
                <span>DEF ${player.defense}</span>
                <span>PHY ${player.physical}</span>
            </div>
        </div>
    `).join('');
    
    options.querySelectorAll('.player-option-card').forEach(card => {
        card.addEventListener('click', () => {
            const playerId = parseInt(card.dataset.playerId);
            const player = PLAYERS.find(p => p.id === playerId);
            selectPlayer(player);
        });
    });
    
    modal.style.display = 'block';
}

function openSubstituteSelection(index) {
    currentSelectIsSubstitute = true;
    currentSelectIndex = index;
    
    const modal = document.getElementById('draft-modal');
    const title = document.getElementById('modal-title');
    const options = document.getElementById('player-options');
    
    title.textContent = `Choose Substitute ${index + 1}`;
    
    // Get all used player IDs
    const usedPlayerIds = new Set();
    Object.values(draftTeam.players).forEach(p => { if (p) usedPlayerIds.add(p.id); });
    draftTeam.substitutes.forEach((p, i) => { 
        if (p && i !== index) usedPlayerIds.add(p.id); 
    });
    
    // Get available players
    const availablePlayers = PLAYERS.filter(p => !usedPlayerIds.has(p.id));
    // Shuffle and take top 10
    const shuffledPlayers = [...availablePlayers].sort(() => Math.random() - 0.5).slice(0, 10);
    
    options.innerHTML = shuffledPlayers.map(player => `
        <div class="player-option-card" data-player-id="${player.id}">
            <div class="player-rating">${player.rating}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-nation">${player.nation} ${player.club}</div>
            <div class="player-stats">
                <span>PAC ${player.pace}</span>
                <span>SHO ${player.shooting}</span>
                <span>PAS ${player.passing}</span>
                <span>DRI ${player.dribbling}</span>
                <span>DEF ${player.defense}</span>
                <span>PHY ${player.physical}</span>
            </div>
        </div>
    `).join('');
    
    options.querySelectorAll('.player-option-card').forEach(card => {
        card.addEventListener('click', () => {
            const playerId = parseInt(card.dataset.playerId);
            const player = PLAYERS.find(p => p.id === playerId);
            selectPlayer(player);
        });
    });
    
    modal.style.display = 'block';
}

function selectPlayer(player) {
    // Remove player from any existing position or substitute spot
    Object.keys(draftTeam.players).forEach(pos => {
        if (draftTeam.players[pos] && draftTeam.players[pos].id === player.id) {
            delete draftTeam.players[pos];
        }
    });
    const subIndex = draftTeam.substitutes.findIndex(s => s && s.id === player.id);
    if (subIndex !== -1) {
        draftTeam.substitutes.splice(subIndex, 1);
    }
    
    if (currentSelectIsSubstitute) {
        draftTeam.substitutes[currentSelectIndex] = player;
    } else {
        draftTeam.players[currentSelectPosition] = player;
    }
    
    closeModal();
    renderPitch();
    saveDraft();
}

function closeModal() {
    document.getElementById('draft-modal').style.display = 'none';
}

function calculateStats() {
    const players = Object.values(draftTeam.players);
    
    if (players.length === 0) {
        document.getElementById('team-rating').textContent = '0';
        document.getElementById('team-chemistry').textContent = '0';
        return;
    }
    
    const totalRating = players.reduce((sum, p) => sum + (p ? p.rating : 0), 0);
    const avgRating = Math.round(totalRating / players.length);
    
    document.getElementById('team-rating').textContent = avgRating;
    document.getElementById('team-chemistry').textContent = '100';
}

function getDraftPayload() {
    return {
        formation: currentFormation,
        team: draftTeam
    };
}

function saveDraftLocally() {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(getDraftPayload()));
}

async function saveDraftToServer() {
    if (!currentUser) {
        return false;
    }

    const response = await fetch(apiUrl('/api/drafts/latest'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(getDraftPayload())
    });

    const data = await readJsonResponse(response);
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not save your draft.');
    }

    return true;
}

function saveDraft(showFeedback = false) {
    saveDraftLocally();

    if (!currentUser) {
        if (showFeedback) {
            alert('Draft saved locally on this device. Log in to sync it to your account.');
        }
        return;
    }

    saveDraftToServer()
        .then(() => {
            if (showFeedback) {
                alert('Draft saved to your account.');
            }
        })
        .catch((error) => {
            console.error('Draft save error:', error);
            if (showFeedback) {
                alert(error.message || 'Could not sync your draft, but it was saved locally.');
            }
        });
}

function generateDraftTxt() {
    const formation = FORMATIONS[currentFormation];
    const starters = formation.positions.map(position => {
        const player = draftTeam.players[position];
        return `${position}: ${player ? `${player.name} (${player.rating}) - ${player.club}` : 'Empty'}`;
    });

    const substitutes = Array.from({ length: 5 }, (_, index) => {
        const player = draftTeam.substitutes[index];
        return `Sub ${index + 1}: ${player ? `${player.name} (${player.rating}) - ${player.position} - ${player.club}` : 'Empty'}`;
    });

    const teamRating = document.getElementById('team-rating').textContent;
    const chemistry = document.getElementById('team-chemistry').textContent;

    return [
        'FUT Draft',
        '',
        `Formation: ${currentFormation}`,
        `Team Rating: ${teamRating}`,
        `Chemistry: ${chemistry}`,
        '',
        'Starting XI',
        ...starters,
        '',
        'Substitutes',
        ...substitutes
    ].join('\r\n');
}

function exportDraftAsTxt() {
    const content = generateDraftTxt();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `world-cup-draft-${currentFormation}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function applyDraftData(data) {
    if (!data || !data.formation || !data.team) {
        return;
    }

    currentFormation = data.formation;
    draftTeam = data.team;

    const formationSelect = document.getElementById('formation-select');
    if (formationSelect) {
        formationSelect.value = currentFormation;
    }
}

function loadLocalDraft() {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) {
        return false;
    }

    try {
        const data = JSON.parse(saved);
        applyDraftData(data);
        return true;
    } catch (error) {
        console.error('Local draft parse error:', error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return false;
    }
}

async function loadDraftFromServer() {
    if (!currentUser) {
        return false;
    }

    try {
        const response = await fetch(apiUrl('/api/drafts/latest'), {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await readJsonResponse(response);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not load your saved draft.');
        }

        if (!data.draft) {
            return false;
        }

        applyDraftData(data.draft);
        saveDraftLocally();
        renderPitch();
        return true;
    } catch (error) {
        console.error('Server draft load error:', error);
        return false;
    }
}

function loadDraft() {
    loadLocalDraft();

    if (currentUser) {
        loadDraftFromServer();
    }
}

function randomizeDraft() {
    if (!confirm('This will replace your current draft with a random one. Continue?')) {
        return;
    }
    
    draftTeam.players = {};
    draftTeam.substitutes = [];
    
    const formation = FORMATIONS[currentFormation];
    const usedPlayerIds = new Set();
    
    // Fill starting XI
    formation.positions.forEach(position => {
        const availablePlayers = getPlayersByPosition(position).filter(p => !usedPlayerIds.has(p.id));
        if (availablePlayers.length > 0) {
            const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            draftTeam.players[position] = randomPlayer;
            usedPlayerIds.add(randomPlayer.id);
        }
    });
    
    // Fill substitutes
    const availableSubs = PLAYERS.filter(p => !usedPlayerIds.has(p.id));
    for (let i = 0; i < 5; i++) {
        if (availableSubs.length > 0) {
            const idx = Math.floor(Math.random() * availableSubs.length);
            draftTeam.substitutes[i] = availableSubs[idx];
            availableSubs.splice(idx, 1);
        }
    }
    
    renderPitch();
    saveDraft();
}

function resetDraft() {
    if (confirm('Are you sure you want to reset your draft?')) {
        draftTeam = { players: {}, substitutes: [] };
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        renderPitch();

        if (currentUser) {
            fetch(apiUrl('/api/drafts/latest'), {
                method: 'DELETE',
                credentials: 'include'
            }).catch((error) => {
                console.error('Draft delete error:', error);
            });
        }
    }
}

let draftPageInitialized = false;

function initDraftPage() {
    loadDraft();
    renderPitch();

    if (draftPageInitialized) {
        return;
    }
    
    // Formation selector
    document.getElementById('formation-select').addEventListener('change', (e) => {
        currentFormation = e.target.value;
        draftTeam.players = {};
        renderPitch();
        saveDraft();
    });
    
    // Randomize button
    document.getElementById('randomize-draft-btn').addEventListener('click', randomizeDraft);
    
    // Save button
    document.getElementById('save-draft-btn').addEventListener('click', () => {
        saveDraft(true);
    });

    // Export TXT button
    document.getElementById('export-draft-txt-btn').addEventListener('click', () => {
        exportDraftAsTxt();
    });
    
    // Reset button
    document.getElementById('reset-draft-btn').addEventListener('click', resetDraft);
    
    // Close modal
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.id === 'draft-modal') {
            closeModal();
        }
    });

    draftPageInitialized = true;
}
