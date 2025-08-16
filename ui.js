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
    swapPairsBtn: document.getElementById('swap-pairs-btn'),
    wlTbody: document.getElementById('wl-tbody'),
    // ส่วนสรุป
    sumMatches: document.getElementById('sum-matches'),
    sumPlayers: document.getElementById('sum-players'),
    sumRounds: document.getElementById('sum-rounds'),
    sumGames: document.getElementById('sum-games'),
    sumDecided: document.getElementById('sum-decided'),
    sumAvgwr: document.getElementById('sum-avgwr'),
    // แท็บ/ฟิลเตอร์
    closeStats: document.getElementById('close-stats'),
    tabButtons: Array.from(document.querySelectorAll('#stats-container .tab-btn')),
    panelPartner: document.getElementById('panel-partner'),
    panelWl: document.getElementById('panel-wl'),
    wlFilters: document.getElementById('wl-filters'),
    wlSearch: document.getElementById('wl-search'),
    wlSort: document.getElementById('wl-sort'),
    partnerTbody: document.getElementById('partner-tbody'),
    // ฟิลเตอร์กลาง
    statsFilters: document.getElementById('stats-filters'),
    statsSearch: document.getElementById('stats-search'),
    statsSort: document.getElementById('stats-sort'),
    statsSortDir: document.getElementById('stats-sortdir'),
    // ตาราง
    partnerTbody: document.getElementById('partner-tbody'),
    wlTbody: document.getElementById('wl-tbody'),
    };

export function refreshVisibility() {
    const hasCurrent =
        (state.currentMatch?.courts?.length ?? 0) > 0 ||
        (state.currentMatch?.resting?.length ?? 0) > 0;

    const hasHistory = (state.history?.length ?? 0) > 0;

    if (dom.currentMatchSection) {
        dom.currentMatchSection.classList.toggle('hidden', !hasCurrent);
    }
    if (dom.historySection) {
        dom.historySection.classList.toggle('hidden', !hasHistory);
    }
}

// --- Rendering Functions ---
export function renderAll() {
    renderPlayerList();
    renderMatches();
    renderHistory();
    if (!dom.statsContainer.classList.contains('hidden')) {
        renderPartnershipStats();
        renderWinLossStats();
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

    dom.resultsSection.style.display = 'block';
    
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

    const res = court.result; // 'team1' | 'team2' | undefined

    return`
        <div class="flex flex-wrap items-center justify-around text-center text-sm py-3 ${state.currentMatch.courts.length > 1 && courtIndex < state.currentMatch.courts.length - 1 ? 'border-b border-sky-200 pb-4' : 'pt-4'}">
            <div class="font-semibold text-sky-700 w-20  basis-full w-full flex items-center gap-2 sm:basis-auto sm:w-20 sm:justify-start">
                <span>คอร์ด ${court.courtNum}</span>
                <button class="reshuffle-court-btn text-sky-500 hover:text-sky-700" data-court-index="${courtIndex}" title="สุ่มคอร์ดนี้ใหม่">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
                </button>
            </div>
            <div class="team flex flex-wrap w-24 sm:w-auto sm:flex-nowrap gap-1.5 justify-center items-center rounded-md p-1 relative border border-sky-200 ${isTeam1Repeat ? teamWarning : ''}">
                ${createPlayerHTML(court.team1[0], null, courtIndex, 0, 0, { isRepeat: isTeam1Repeat })}
                ${createPlayerHTML(court.team1[1], null, courtIndex, 0, 1, { isRepeat: isTeam1Repeat })}
                ${team1Warning}
            </div>
            <span class="flex items-center gap-2 text-slate-400 font-bold text-sm w-auto">
                <button class="badge-w-l w-4 h-5 rounded-sm border text-[10px] font-bold flex items-center justify-center
                    ${res === 'team1' ? 'bg-green-100 text-green-600 border-green-600' :
                    res === 'team2' ? 'bg-red-100 text-red-600 border-red-600' :
                    'bg-slate-100 text-slate-300 border-slate-200'}"
                    data-history-index=""
                    data-court-index="${courtIndex}"
                    data-team="team1">
                    ${res === 'team1' ? 'W' : res === 'team2' ? 'L' : '-'}
                </button>
                VS
                <button class="badge-w-l w-4 h-5 rounded-sm border text-[10px] font-bold flex items-center justify-center
                    ${res === 'team2' ? 'bg-green-100 text-green-600 border-green-600' :
                    res === 'team1' ? 'bg-red-100 text-red-600 border-red-600' :
                    'bg-slate-100 text-slate-300 border-slate-200'}"
                    data-history-index=""
                    data-court-index="${courtIndex}"
                    data-team="team2">
                    ${res === 'team2' ? 'W' : res === 'team1' ? 'L' : '-'}
                </button>
            </span>
            <div class="team flex flex-wrap w-24 sm:w-auto sm:flex-nowrap gap-1.5 justify-center items-center rounded-md p-1 relative border border-sky-200 ${isTeam2Repeat ? teamWarning : ''}">
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
            <div class="flex flex-wrap items-center justify-around text-center text-xs py-1.5 ${match.courts.length > 1 && courtIndex < match.courts.length - 1 ? 'border-b pb-3' : 'pt-3'}">
                <div class="font-semibold text-slate-500 w-14  w-20  basis-full w-full flex items-center gap-2 sm:basis-auto sm:w-20 sm:justify-start">
                    <span>คอร์ด ${court.courtNum}</span>
                </div>
                <div class="team flex flex-wrap w-24 sm:w-auto sm:flex-nowrap gap-1.5 justify-center rounded-md p-1 relative border border-slate-200">
                    ${createPlayerHTML(court.team1[0], historyIndex, courtIndex, 0, 0)}
                    ${createPlayerHTML(court.team1[1], historyIndex, courtIndex, 0, 1)}
                </div>
                <span class="flex items-center gap-2 text-slate-400 font-bold text-sm w-70">
                    <button class="badge-w-l w-4 h-5 rounded-sm border text-[10px] font-bold flex items-center justify-center
                        ${court.result === 'team1' ? 'bg-green-100 text-green-600 border-green-600' :
                        court.result === 'team2' ? 'bg-red-100 text-red-600 border-red-600' :
                        'bg-slate-100 text-slate-300 border-slate-200'}"
                        data-history-index="${historyIndex}" 
                        data-court-index="${courtIndex}" 
                        data-team="team1">
                        ${court.result === 'team1' ? 'W' : court.result === 'team2' ? 'L' : '-'}
                    </button>
                    VS
                    <button class="badge-w-l w-4 h-5 rounded-sm border text-[10px] font-bold flex items-center justify-center
                        ${court.result === 'team2' ? 'bg-green-100 text-green-600 border-green-600' :
                        court.result === 'team1' ? 'bg-red-100 text-red-600 border-red-600' :
                        'bg-slate-100 text-slate-300 border-slate-200'}"
                        data-history-index="${historyIndex}" 
                        data-court-index="${courtIndex}" 
                        data-team="team2">
                        ${court.result === 'team2' ? 'W' : court.result === 'team1' ? 'L' : '-'}
                    </button>
                </span>
                <div class="team flex flex-wrap w-24 sm:w-auto sm:flex-nowrap gap-1.5 justify-center rounded-md p-1 relative border border-slate-200">
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
    // ซ่อน/แสดงตามมีข้อมูล
    if ((state.history?.length ?? 0) > 0) {
        dom.historySection.style.display = 'block';
    } else {
        dom.historySection.style.display = 'none';
    }
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
            <span class="font-medium flex-1 text-center">${player.name}</span>
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
        playerTag.className = 'player-tag bg-slate-100 inline-flex items-center gap-1 py-1 pl-2.5 pr-1 rounded-full border border-slate-200';
        
        playerTag.innerHTML = `
            <button data-player-id="${player.id}" class="level-btn ${levelColors[player.level]} text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-colors">${player.level}</button>
            <span class="font-medium text-sm">${player.name}</span>
            <span class="text-xs bg-slate-200 text-slate-600 font-semibold text-center px-2 py-0.5 rounded-full">${player.gamesPlayed}</span>
            <button data-player-id="${player.id}" data-player-name="${player.name}" class="remove-player-btn text-slate-400 hover:text-red-500 font-bold text-base leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors">&times;</button>
        `;
        dom.playerListContainer.appendChild(playerTag);
    });
}

export function renderPartnershipStats({ search = '', sortBy = 'wins', sortDir = 'desc' } = {}) {
    if (!dom.partnerTbody) return;

    const pairStats = new Map();
    const keyOf = (a, b) => {
        const [x, y] = [a.id, b.id].sort((m, n) => String(m).localeCompare(String(n)));
        return `${x}-${y}`;
    };

    const timeline = [...state.history, state.currentMatch];

    timeline.forEach(match => {
        if (!match || !match.courts) return;

        match.courts.forEach(court => {
            const t1 = (court.team1 || []).filter(Boolean);
            const t2 = (court.team2 || []).filter(Boolean);
            if (t1.length < 2 || t2.length < 2) return;

            const makePairs = (teamArr) => {
                const pairs = [];
                for (let i = 0; i < teamArr.length; i++) {
                    for (let j = i + 1; j < teamArr.length; j++) {
                        pairs.push([teamArr[i], teamArr[j]]);
                    }
                }
                return pairs;
            };

            const pairsT1 = makePairs(t1);
            const pairsT2 = makePairs(t2);
            const res = court.result;

            [...pairsT1, ...pairsT2].forEach(([pA, pB]) => {
                const k = keyOf(pA, pB);
                if (!pairStats.has(k)) {
                    pairStats.set(k, { a: pA, b: pB, played: 0, win: 0, loss: 0 });
                }
                pairStats.get(k).played += 1;
            });

            if (res) {
                const winPairs = res === 'team1' ? pairsT1 : pairsT2;
                const losePairs = res === 'team1' ? pairsT2 : pairsT1;
                winPairs.forEach(([pA, pB]) => { const k = keyOf(pA, pB); pairStats.get(k).win += 1; });
                losePairs.forEach(([pA, pB]) => { const k = keyOf(pA, pB); pairStats.get(k).loss += 1; });
            }
        });
    });

    let rows = Array.from(pairStats.values()).map(s => {
        const wr = s.played ? (s.win * 100 / s.played) : 0;
        return {
            namePair: `${s.a.name} × ${s.b.name}`,
            played: s.played,
            wins: s.win,
            losses: s.loss,
            winrate: wr
        };
    });

    // ค้นหา (ตรงกับชื่อคู่)
    if (search) {
        const q = search.trim().toLowerCase();
        rows = rows.filter(r => r.namePair.toLowerCase().includes(q));
    }

    // เรียง
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
        if (sortBy === 'name') return dir * a.namePair.localeCompare(b.namePair, 'th');
        if (sortBy === 'played') return dir * (a.played - b.played) || a.namePair.localeCompare(b.namePair, 'th');
        if (sortBy === 'winrate') return dir * (a.winrate - b.winrate) || dir * (a.played - b.played);
        if (sortBy === 'losses') return dir * (a.losses - b.losses) || dir * (a.played - b.played);
        // default 'wins'
        return dir * (a.wins - b.wins) || dir * (a.winrate - b.winrate) || dir * (a.played - b.played);
    });

    // วาดตาราง
    dom.partnerTbody.innerHTML = '';
    rows.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.className = i % 2 ? 'bg-slate-50/50' : '';
        tr.innerHTML = `
      <td class="px-2 py-1.5 border-b text-left">${r.namePair}</td>
      <td class="px-2 py-1.5 border-b">${r.played}</td>
      <td class="px-2 py-1.5 border-b">${r.wins}</td>
      <td class="px-2 py-1.5 border-b">${r.losses}</td>
      <td class="px-2 py-1.5 border-b">${r.winrate.toFixed(0)}%</td>
    `;
        dom.partnerTbody.appendChild(tr);
    });
}

export function renderWinLossStats({ search = '', sortBy = 'wins', sortDir = 'desc' } = {}) {
    if (!dom.wlTbody) return;

    const perPlayer = {};
    state.players.forEach(p => {
        perPlayer[p.id] = { id: p.id, name: p.name, wins: 0, losses: 0 };
    });

    const timeline = [...state.history, state.currentMatch];
    let decidedCount = 0;

    timeline.forEach(match => {
        if (!match || !match.courts) return;
        match.courts.forEach(court => {
            const t1 = (court.team1 || []).filter(Boolean);
            const t2 = (court.team2 || []).filter(Boolean);
            if (t1.length < 2 || t2.length < 2) return;
            const res = court.result;
            if (!res) return;

            decidedCount++;
            const winners = res === 'team1' ? t1 : t2;
            const losers = res === 'team1' ? t2 : t1;
            winners.forEach(p => perPlayer[p.id] && perPlayer[p.id].wins++);
            losers.forEach(p => perPlayer[p.id] && perPlayer[p.id].losses++);
        });
    });

    let rows = Object.values(perPlayer).map(s => {
        const played = s.wins + s.losses;
        const winrate = played ? (s.wins * 100 / played) : 0;
        return { name: s.name, played, wins: s.wins, losses: s.losses, winrate };
    });

    if (search) {
        const q = search.trim().toLowerCase();
        rows = rows.filter(r => r.name.toLowerCase().includes(q));
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
        if (sortBy === 'name') return dir * a.name.localeCompare(b.name, 'th');
        if (sortBy === 'played') return dir * (a.played - b.played) || a.name.localeCompare(b.name, 'th');
        if (sortBy === 'winrate') return dir * (a.winrate - b.winrate) || dir * (a.played - b.played);
        // default 'wins'
        return dir * (a.wins - b.wins) || dir * (a.winrate - b.winrate) || dir * (a.played - b.played);
    });

    dom.wlTbody.innerHTML = '';
    rows.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.className = i % 2 ? 'bg-slate-50/50' : '';
        tr.innerHTML = `
      <td class="px-2 py-1.5 border-b text-left">${r.name}</td>
      <td class="px-2 py-1.5 border-b">${r.played}</td>
      <td class="px-2 py-1.5 border-b">${r.wins}</td>
      <td class="px-2 py-1.5 border-b">${r.losses}</td>
      <td class="px-2 py-1.5 border-b">${r.winrate.toFixed(0)}%</td>
    `;
        dom.wlTbody.appendChild(tr);
    });

    // การ์ดสรุป
    // ===== สรุป =====
    if (dom.sumRounds) {
        dom.sumRounds.textContent = String(state.history.length + (state.currentMatch?.courts?.length ? 1 : 0));
    }

    if (dom.sumGames || dom.sumDecided || dom.sumAvgwr) {
        let totalGames = 0;
        let decidedGames = 0;
        const wrList = [];

        const timeline = [...state.history, state.currentMatch];
        timeline.forEach(match => {
            if (!match || !match.courts) return;
            match.courts.forEach(court => {
                const t1 = (court.team1 || []).filter(Boolean);
                const t2 = (court.team2 || []).filter(Boolean);
                if (t1.length < 2 || t2.length < 2) return; // ต้องครบคู่
                totalGames++;
                if (court.result) {
                    decidedGames++;
                }
            });
        });

        // อัตราชนะเฉลี่ยจากตาราง WL ที่เพิ่งคำนวณ
        const wrs = rows.filter(r => r.played > 0).map(r => r.winrate);
        const avgWr = wrs.length ? (wrs.reduce((a, c) => a + c, 0) / wrs.length) : 0;

        if (dom.sumGames) dom.sumGames.textContent = String(totalGames);
        if (dom.sumDecided) dom.sumDecided.textContent = String(decidedGames);
        if (dom.sumAvgwr) dom.sumAvgwr.textContent = `${avgWr.toFixed(0)}%`;
    }
}


// --- Modal Management ---
export function openPlayerModal(context, onSelect) {
    dom.modalPlayerList.innerHTML = '';
    
    const isHistory = context.historyIndex !== null;
    const match = isHistory ? state.history[context.historyIndex] : state.currentMatch;
    
    const teamKey = context.teamIndex === 0 ? 'team1' : 'team2';
    const court = match.courts[context.courtIndex];
    const me = court[teamKey][context.playerIndex] || null;
    const partner = court[teamKey][context.playerIndex === 0 ? 1 : 0] || null;

    const playersInMatch = match.courts.flatMap(c => [...c.team1, ...c.team2]).filter(Boolean).map(p => p.id);
    const availableRestForSwap = state.players.filter(p => !playersInMatch.includes(p.id));
    const availablePlayingForSwap = state.players.filter(p => playersInMatch.includes(p.id) && p.id !== me?.id && p.id !== partner?.id);
    
    const levelColors = {
        'C': 'bg-sky-500 text-white',
        'B': 'bg-green-500 text-white',
        'A': 'bg-orange-500 text-white'
    };

    
    const restHeader = document.createElement('div');
    restHeader.className = 'col-span-2 text-center font-semibold text-slate-600 text-sm';
    restHeader.textContent = 'ผู้เล่นที่พัก';
    dom.modalPlayerList.appendChild(restHeader);

    if (availableRestForSwap.length === 0) {
         dom.modalPlayerList.innerHTML = restHeader.outerHTML+`<p class="text-slate-500 col-span-2 text-center text-sm">ไม่มีผู้เล่นที่พักให้สลับ</p>`;
    } else {
        availableRestForSwap.forEach(player => {
            const playerBtn = document.createElement('button');
            playerBtn.className = 'w-full text-left p-2 rounded-lg hover:bg-sky-100 transition text-sm flex items-center gap-2';
            playerBtn.innerHTML = `
                <span class="${levelColors[player.level]} level-indicator font-bold w-4 h-4 flex items-center justify-center rounded-full text-xs">${player.level}</span>
                <span class="flex-1">${player.name}</span>
                <span class="text-xs bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">${player.gamesPlayed} เกม</span>
                ${player.consecutiveRests > 1 ? `<span class="bg-amber-200 text-amber-800 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">${player.consecutiveRests}</span>` : ''}
            `;
            playerBtn.onclick = () => onSelect(player);
            dom.modalPlayerList.appendChild(playerBtn);
        });
    }

    
    // === เพิ่มส่วนใหม่: แสดงผู้เล่นที่กำลังเล่นในรอบปัจจุบัน ===
    if (availablePlayingForSwap.length > 0) {
        // หัวข้อสำหรับผู้เล่นที่กำลังเล่น
        const playingHeader = document.createElement('div');
        playingHeader.className = 'col-span-2 text-center font-semibold text-slate-600 text-sm pt-2 border-t border-slate-200 mt-2';
        playingHeader.textContent = 'ผู้เล่นรอบนี้';
        dom.modalPlayerList.appendChild(playingHeader);

        availablePlayingForSwap.forEach(player => {
            const playerBtn = document.createElement('button');
            playerBtn.className = 'w-full text-left p-2 rounded-lg hover:bg-green-100 transition text-sm flex items-center gap-2 border border-green-200';
            playerBtn.innerHTML = `
                <span class="${levelColors[player.level]} level-indicator font-bold w-4 h-4 flex items-center justify-center rounded-full text-xs">${player.level}</span>
                <span class="flex-1">${player.name}</span>
                <span class="text-xs bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">${player.gamesPlayed} เกม</span>
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

export function initStatsUI() {
  // ปุ่มปิด
  dom.closeStats?.addEventListener('click', () => {
    dom.statsContainer.classList.add('hidden');
  });

  // แท็บ
  dom.tabButtons?.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.tabButtons.forEach(b => b.classList.remove('active', 'text-slate-900', 'border-slate-900'));
      dom.tabButtons.forEach(b => b.classList.add('text-slate-500', 'border-transparent'));
      btn.classList.add('active', 'text-slate-900', 'border-slate-900');
      btn.classList.remove('text-slate-500');

      const tab = btn.dataset.tab;
      const showPartner = tab === 'partner';
      dom.panelPartner.classList.toggle('hidden', !showPartner);
      dom.panelWl.classList.toggle('hidden', showPartner);

      // ฟิลเตอร์เดียว ใช้ได้ทั้งสองแท็บ ไม่ต้องซ่อน
      renderStatsWithCurrentFilters();
    });
  });

  // ฟิลเตอร์กลาง
  const onFilter = () => renderStatsWithCurrentFilters();
  dom.statsSearch?.addEventListener('input', onFilter);
  dom.statsSort?.addEventListener('change', onFilter);
  dom.statsSortDir?.addEventListener('change', onFilter);
  const headerClickHandler = (e) => {
    const th = e.currentTarget;
    const key = th.getAttribute('data-sortkey');
    if (!key) return;

    const currentKey = dom.statsSort?.value || 'wins';
    const currentDir = dom.statsSortDir?.value || 'desc';
    const nextDir = (key === currentKey) ? (currentDir === 'asc' ? 'desc' : 'asc') : 'desc';

    if (dom.statsSort) dom.statsSort.value = key;
    if (dom.statsSortDir) dom.statsSortDir.value = nextDir;

    renderStatsWithCurrentFilters();
    updateSortHeaderArrows(key, nextDir);
  };

  document
    .querySelectorAll('#stats-container thead [data-sortkey]')
    .forEach(th => th.addEventListener('click', headerClickHandler));

  // ลูกศรเริ่มต้นตาม dropdown ปัจจุบัน
  updateSortHeaderArrows(dom.statsSort?.value || 'wins', dom.statsSortDir?.value || 'desc');

}

function getCurrentFilters() {
  return {
    search: dom.statsSearch?.value || '',
    sortBy: dom.statsSort?.value || 'wins',
    sortDir: dom.statsSortDir?.value || 'desc',
  };
}

function renderStatsWithCurrentFilters() {
  const f = getCurrentFilters();

  // เรนเดอร์สรุปเสมอ (อัปเดตการ์ดสรุป)
  renderWinLossStats({ ...f });

  // เรนเดอร์ตามแท็บที่เปิดอยู่
  const partnerActive = !dom.panelPartner.classList.contains('hidden');
  if (partnerActive) {
    renderPartnershipStats({ ...f });
  } else {
    renderWinLossStats({ ...f });
  }
  const f2 = getCurrentFilters();
  updateSortHeaderArrows(f2.sortBy, f2.sortDir);
}

function updateSortHeaderArrows(activeKey, dir) {
  const ths = document.querySelectorAll('#stats-container thead [data-sortkey]');
  ths.forEach(th => {
    const key = th.getAttribute('data-sortkey');
    const arrow = th.querySelector('.sort-arrow');
    if (!arrow) return;
    if (key === activeKey) {
      arrow.textContent = dir === 'asc' ? '↑' : '↓';
      arrow.classList.remove('opacity-0');
    } else {
      arrow.textContent = '';
      arrow.classList.add('opacity-0');
    }
  });
}
