import * as state from './state.js';

// --- DOM Elements ---
export const dom = {
    addPlayersBtn: document.getElementById('add-players-btn'),
    playerInputList: document.getElementById('player-input-list'),
    playerListContainer: document.getElementById('player-list-container'),
    playerTotalCount: document.getElementById('player-total-count'),
    courtCountInput: document.getElementById('court-count'),
    generateRoundBtn: document.getElementById('generate-round-btn'),
    resetBtn: document.getElementById('reset-btn'),
    clearAllBtn: document.getElementById('clear-all-btn'),
    resultsSection: document.getElementById('results-section'),
    roundCounter: document.getElementById('round-counter'),
    reshuffleBtn: document.getElementById('reshuffle-btn'),
    currentRoundContainer: document.getElementById('current-round-container'),
    restingPlayersContainer: document.getElementById('resting-players-container'),
    restingList: document.getElementById('resting-list'),
    messageArea: document.getElementById('message-area'),
    historySection: document.getElementById('history-section'),
    historyContainer: document.getElementById('history-container'),
    toggleStatsBtn: document.getElementById('toggle-stats-btn'),
    statsContainer: document.getElementById('stats-container'),
    statsList: document.getElementById('stats-list'),
    playerModal: document.getElementById('player-modal'),
    modalPlayerList: document.getElementById('modal-player-list'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmYesBtn: document.getElementById('confirm-yes-btn'),
    confirmNoBtn: document.getElementById('confirm-no-btn'),
    swapPairsBtn: document.getElementById('swap-pairs-btn')
};

// --- Rendering Functions ---
export function renderAll() {
    renderPlayerList();
    renderMatches();
    renderHistory();
    if (!dom.statsContainer.classList.contains('hidden')) {
        renderPartnershipStats();
    }
}

export function renderMatches() {
    dom.roundCounter.textContent = `รอบปัจจุบัน (รอบที่ ${state.round})`;
    dom.currentRoundContainer.innerHTML = '';
    dom.restingList.innerHTML = '';
    
    if (state.round === 0) {
        dom.resultsSection.style.display = 'none';
        return;
    }
    
    dom.restingPlayersContainer.className = 'mt-6 bg-sky-50 p-4 rounded-2xl shadow-sm transition-colors duration-300 border border-sky-200';
    dom.restingPlayersContainer.querySelector('h3').className = 'text-lg font-semibold text-sky-800 mb-3';

    const currentRoundCard = document.createElement('div');
    currentRoundCard.className = 'bg-sky-50 p-4 rounded-2xl shadow-sm fade-in border border-sky-200';

    let courtsHTML = state.currentMatch.courts.map((court, courtIndex) => {
        // --- เพิ่มโค้ดส่วนนี้เข้ามา ---
    const getPartnershipCount = (p1, p2) => {
        if (!p1 || !p2) return 0;
        const key = [p1.id, p2.id].sort().join('-');
        // เราต้อง -1 เพราะรอบปัจจุบันถูกนับไปแล้ว
        return (state.partnershipHistory[key] || 1) ; 
    };

    const team1Count = getPartnershipCount(court.team1[0], court.team1[1]);
    const team2Count = getPartnershipCount(court.team2[0], court.team2[1]);
    const isTeam1Repeat = team1Count > 2;
    const isTeam2Repeat = team2Count > 2;
    const teamWarning = `bg-amber-200 border-amber-400`;
    const team1Warning = isTeam1Repeat 
        ? `<span class="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">${team1Count}</span>` 
        : '';
    const team2Warning = isTeam2Repeat 
        ? `<span class="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">${team2Count}</span>` 
        : '';
    // --- สิ้นสุดส่วนที่เพิ่ม ---

    return`
        <div class="flex items-center justify-around text-center text-sm py-2 ${state.currentMatch.courts.length > 1 && courtIndex < state.currentMatch.courts.length - 1 ? 'border-b border-sky-200' : ''}">
            <div class="font-semibold text-sky-700 w-20 flex items-center gap-2">
                <span>คอร์ด ${court.courtNum}</span>
                <button class="reshuffle-court-btn text-sky-500 hover:text-sky-700" data-court-index="${courtIndex}" title="สุ่มคอร์ดนี้ใหม่">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
                </button>
            </div>
            <div class="team flex gap-1.5 w-32 justify-center items-center rounded-md p-1 relative ${isTeam1Repeat ? teamWarning : ''}">
                ${createPlayerHTML(court.team1[0], null, courtIndex, 0, 0, { isRepeat: isTeam1Repeat })}
                ${createPlayerHTML(court.team1[1], null, courtIndex, 0, 1, { isRepeat: isTeam1Repeat })}
                ${team1Warning}
            </div>
            <span class="text-slate-400 font-bold text-base">VS</span>
            <div class="team flex gap-1.5 w-32 justify-center items-center rounded-md p-1 relative ${isTeam2Repeat ? teamWarning : ''}">
                ${createPlayerHTML(court.team2[0], null, courtIndex, 1, 0, { isRepeat: isTeam2Repeat })}
                ${createPlayerHTML(court.team2[1], null, courtIndex, 1, 1, { isRepeat: isTeam2Repeat })}
                ${team2Warning}
            </div>
        </div>
    `}).join('');

    currentRoundCard.innerHTML = courtsHTML;
    dom.currentRoundContainer.appendChild(currentRoundCard);

    if (state.currentMatch.resting.length > 0) {
        state.currentMatch.resting.forEach(player => {
            const fullPlayer = state.players.find(p => p.id === player.id);
            const restCount = fullPlayer ? fullPlayer.consecutiveRests : 0;
            const restingTag = document.createElement('span');
            restingTag.className = 'bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5';
            restingTag.innerHTML = `
                <span>${player.name}</span>
                ${restCount > 1 ? `<span class="bg-amber-200 text-amber-800 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">${restCount}</span>` : ''}
            `;
            dom.restingList.appendChild(restingTag);
        });
    } else {
        dom.restingList.innerHTML = `<p class="text-slate-400 text-sm">ไม่มีผู้เล่นพัก</p>`;
    }
}

export function renderHistory() {
    dom.historyContainer.innerHTML = '';
    [...state.history].reverse().forEach((match, reverseIndex) => {
        const historyIndex = state.history.length - 1 - reverseIndex;
        const historyCard = document.createElement('div');
        historyCard.className = 'history-card bg-white p-4 rounded-2xl shadow-sm border relative';
        
        let courtsHTML = match.courts.map((court, courtIndex) => `
            <div class="flex items-center justify-around text-center text-xs py-1.5 ${match.courts.length > 1 && courtIndex < match.courts.length - 1 ? 'border-b' : ''}">
                <div class="font-semibold text-slate-500 w-14">คอร์ด ${court.courtNum}</div>
                <div class="team flex gap-1.5 w-32 justify-center">
                    ${createPlayerHTML(court.team1[0], historyIndex, courtIndex, 0, 0)}
                    ${createPlayerHTML(court.team1[1], historyIndex, courtIndex, 0, 1)}
                </div>
                <span class="text-slate-300 font-bold text-sm">VS</span>
                <div class="team flex gap-1.5 w-32 justify-center">
                    ${createPlayerHTML(court.team2[0], historyIndex, courtIndex, 1, 0)}
                    ${createPlayerHTML(court.team2[1], historyIndex, courtIndex, 1, 1)}
                </div>
            </div>
        `).join('');

        let restingHTML = `
            <div class="mt-2 pt-2 border-t border-slate-100 text-sm flex items-baseline gap-2">
                <strong class="text-slate-600 font-medium">พัก:</strong>
                <span class="text-slate-500 flex-wrap">${
                    (match.resting && match.resting.length)
                        ? match.resting
                            .map(p => p.consecutiveRests > 1 ? `${p.name}<span class="text-amber-500 font-bold pl-0.5">${p.consecutiveRests}</span>` : p.name)
                            .join(', ')
                        : 'ไม่มี'
                }</span>
            </div>
        `;

        historyCard.innerHTML = `
            <button 
                class="delete-history-btn absolute top-2 right-2 text-slate-400 hover:text-red-500 font-bold text-lg leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors" 
                data-history-index="${historyIndex}" 
                title="ลบรอบนี้">
                &times;
            </button>
            
            <h3 class="text-base font-semibold text-slate-600 mb-2">รอบที่ ${match.round}</h3>
            ${courtsHTML}
            ${restingHTML}
        `;
        dom.historyContainer.appendChild(historyCard);
    });
}

export function createPlayerHTML(player, historyIndex, courtIndex, teamIndex, playerIndex, options = {}) {
    if (!player) return `<div class="p-2 w-24 h-8"></div>`;
    const isHistory = historyIndex !== null;
    const levelColors = {
        'C': 'bg-sky-500 text-white',
        'B': 'bg-green-500 text-white',
        'A': 'bg-orange-500 text-white'
    };

    const { isRepeat = false } = options;
    const slotClasses = isRepeat 
        ? 'bg-amber-100 border-amber-400' 
        : 'bg-slate-100 border-transparent';
    
     return `
        <div class="player-slot p-1.5 rounded-md w-24 text-center cursor-pointer hover:bg-slate-200 transition text-xs flex items-center gap-1.5 relative ${slotClasses}" 
             ${isHistory ? `data-history-index="${historyIndex}"` : ''}
             data-court-index="${courtIndex}" 
             data-team-index="${teamIndex}" 
             data-player-index="${playerIndex}"
             data-player-id="${player.id}">
             <span class="level-indicator ${levelColors[player.level]} font-bold w-4 h-4 flex items-center justify-center rounded-full text-xs">${player.level}</span>
            <span class="font-medium flex-1 text-left">${player.name}</span>
        </div>
    `;
}

export function renderPlayerList() {
    dom.playerListContainer.innerHTML = '';
    dom.playerTotalCount.textContent = state.players.length;

    if (state.players.length === 0) {
        dom.playerListContainer.innerHTML = `<p class="text-slate-400 text-sm">ยังไม่มีผู้เล่น...</p>`;
        return;
    }

    const sortedPlayers = [...state.players].sort((a, b) => a.gamesPlayed - b.gamesPlayed || a.name.localeCompare(b.name, 'th'));
    
    const levelColors = {
        'C': 'bg-sky-500 text-white',
        'B': 'bg-green-500 text-white',
        'A': 'bg-orange-500 text-white'
    };

    sortedPlayers.forEach(player => {
        const playerTag = document.createElement('div');
        playerTag.className = 'player-tag bg-slate-100 inline-flex items-center gap-2 py-1 pl-2.5 pr-1 rounded-full border border-slate-200';
        
        playerTag.innerHTML = `
            <button data-player-id="${player.id}" class="level-btn ${levelColors[player.level]} text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-colors">${player.level}</button>
            <span class="font-medium text-sm">${player.name}</span>
            <span class="text-xs bg-slate-200 text-slate-600 font-semibold w-10 text-center py-0.5 rounded-full">${player.gamesPlayed}</span>
            <button data-player-id="${player.id}" data-player-name="${player.name}" class="remove-player-btn text-slate-400 hover:text-red-500 font-bold text-base leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors">&times;</button>
        `;
        dom.playerListContainer.appendChild(playerTag);
    });
}

export function renderPartnershipStats() {
    dom.statsList.innerHTML = '';
    const stats = [];

    for (const key in state.partnershipHistory) {
        const count = state.partnershipHistory[key];
        if (count > 0) {
            const [p1Id, p2Id] = key.split('-');
            const player1 = state.players.find(p => p.id == p1Id);
            const player2 = state.players.find(p => p.id == p2Id);

            if (player1 && player2) {
                stats.push({
                    text: `${player1.name} & ${player2.name}: ${count} ครั้ง`,
                    count: count
                });
            }
        }
    }

    if (stats.length === 0) {
        dom.statsList.innerHTML = '<p>ยังไม่มีข้อมูลการจับคู่</p>';
        return;
    }

    stats.sort((a, b) => b.count - a.count);

    stats.forEach(stat => {
        const p = document.createElement('p');
        p.textContent = stat.text;
        dom.statsList.appendChild(p);
    });
}

// --- Modal Management ---
export function openPlayerModal(context, onSelect) {
    dom.modalPlayerList.innerHTML = '';
    
    const isHistory = context.historyIndex !== null;
    const match = isHistory ? state.history[context.historyIndex] : state.currentMatch;
    
    const playersInMatch = match.courts.flatMap(c => [...c.team1, ...c.team2]).filter(Boolean).map(p => p.id);
    const availableForSwap = state.players.filter(p => !playersInMatch.includes(p.id));
    
    const levelColors = {
        'C': 'bg-sky-500 text-white',
        'B': 'bg-green-500 text-white',
        'A': 'bg-orange-500 text-white'
    };

    if (availableForSwap.length === 0) {
         dom.modalPlayerList.innerHTML = `<p class="text-slate-500 col-span-2 text-center text-sm">ไม่มีผู้เล่นที่พักให้สลับ</p>`;
    } else {
        availableForSwap.forEach(player => {
            const playerBtn = document.createElement('button');
            playerBtn.className = 'w-full text-left p-2 rounded-lg hover:bg-sky-100 transition text-sm flex items-center gap-2';
            playerBtn.innerHTML = `
                <span class="${levelColors[player.level]} font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs">${player.level}</span>
                <span class="flex-1">${player.name}</span>
                <span class="text-xs bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">${player.gamesPlayed} เกม</span>
                ${player.consecutiveRests > 1 ? `<span class="bg-amber-200 text-amber-800 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">${player.consecutiveRests}</span>` : ''}
            `;
            playerBtn.onclick = () => onSelect(player);
            dom.modalPlayerList.appendChild(playerBtn);
        });
    }
    dom.playerModal.classList.add('is-open');
}

export function closePlayerModal() {
    dom.playerModal.classList.remove('is-open');
}

export function openConfirmModal(title, message, onConfirm) {
    dom.confirmTitle.textContent = title;
    dom.confirmMessage.textContent = message;
    dom.confirmModal.classList.add('is-open');
    return onConfirm; // Return the callback
}

export function closeConfirmModal() {
    dom.confirmModal.classList.remove('is-open');
}
