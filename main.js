import * as state from './state.js';
import * as ui from './ui.js';
import { createBalancedMatches, shuffleArray } from './matcher.js';

let editingContext = null;
let pendingAction = null;

// --- Player Management ---
function handleAddPlayers() {
    const names = ui.dom.playerInputList.value.split('\n').map(name => name.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
    names.forEach(name => {
        if (!state.players.some(p => p.name === name)) {
            state.players.push({ id: Date.now() + Math.random(), name, gamesPlayed: 0, level: 'C', consecutiveRests: 0 });
        }
    });
    ui.dom.playerInputList.value = '';
    ui.renderAll();
    state.saveState(ui.dom.courtCountInput.value);
}

function removePlayer(playerId) {
    state.setPlayers(state.players.filter(p => p.id !== playerId));
    ui.renderAll();
    state.saveState(ui.dom.courtCountInput.value);
}

function changePlayerLevel(playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (player) {
        player.level = state.skillLevels[(state.skillLevels.indexOf(player.level) + 1) % state.skillLevels.length];
        ui.renderPlayerList();
        state.saveState(ui.dom.courtCountInput.value);
    }
}

// --- Round Management ---
function generateNewRound(IsNewRound = true) {
    const numCourts = parseInt(ui.dom.courtCountInput.value, 10);
    const playersPerRound = numCourts * 4;

    if (state.players.length < playersPerRound) {
        ui.dom.messageArea.textContent = `ผู้เล่นไม่พอสำหรับ ${numCourts} คอร์ด (ต้องการ ${playersPerRound} คน, มี ${players.length} คน)`;
        return;
    }
    ui.dom.messageArea.textContent = '';

    if (state.round > 0 && IsNewRound) {
        state.history.push(JSON.parse(JSON.stringify(state.currentMatch)));
    }

    state.setRound(state.round + 1);
    ui.dom.resultsSection.style.display = 'block';
    if (state.history.length > 0) ui.dom.historySection.style.display = 'block';

    let availablePlayers = [...state.players];
    shuffleArray(availablePlayers);
    availablePlayers.sort((a,b) => a.gamesPlayed - b.gamesPlayed);
    let playingPool = availablePlayers.slice(0, playersPerRound);
    
    const courts = createBalancedMatches(playingPool);
    
    const playingNowIds = new Set(courts.flatMap(c => [...c.team1, ...c.team2]).map(p => p.id));

    state.players.forEach(p => {
        if (playingNowIds.has(p.id)) {
            p.gamesPlayed++;
            p.consecutiveRests = 0;
        } else {
            p.consecutiveRests = countConsecutiveRests(p);
        }
    });

    courts.forEach(court => {
        const t1k = [court.team1[0].id, court.team1[1].id].sort().join('-');
        const t2k = [court.team2[0].id, court.team2[1].id].sort().join('-');
        state.partnershipHistory[t1k] = (state.partnershipHistory[t1k] || 0) + 1;
        state.partnershipHistory[t2k] = (state.partnershipHistory[t2k] || 0) + 1;
    });

    state.setCurrentMatch({
        round: state.round,
        courts: courts.map((c, i) => ({ ...c, courtNum: i + 1 })),
        resting: state.players.filter(p => !playingNowIds.has(p.id))
    });
    
    ui.renderAll();
    state.saveState(ui.dom.courtCountInput.value);
}

function reshuffleCurrentRound() {
    if (state.round === 0) return;

    state.currentMatch.courts.forEach(court => {
        [...court.team1, ...court.team2].forEach(player => {
            if (player) {
                const p = state.players.find(pl => pl.id === player.id);
                if (p) p.gamesPlayed--;
            }
        });
        const t1k = [court.team1[0].id, court.team1[1].id].sort().join('-');
        const t2k = [court.team2[0].id, court.team2[1].id].sort().join('-');
        if (state.partnershipHistory[t1k]) state.partnershipHistory[t1k]--;
        if (state.partnershipHistory[t2k]) state.partnershipHistory[t2k]--;
    });

    state.players.forEach(p => {
        const wasPlaying = state.currentMatch.courts.flatMap(c => [...c.team1, ...c.team2]).some(pl => pl && pl.id === p.id);
        const wasResting = state.currentMatch.resting.some(pl => pl.id === p.id);
        if (wasPlaying) {
            p.consecutiveRests = state.history.length > 0 ? (state.history[state.history.length-1].resting.some(hp => hp.id === p.id) ? (p.consecutiveRests || 0) + 1 : 1) : 0;
        } else if(wasResting) {
            if (p.consecutiveRests > 0) p.consecutiveRests--;
        }
    });

    state.setRound(state.round - 1);
    generateNewRound(false);
}

function reshuffleSingleCourt(courtIndex) {
    if (!state.currentMatch || !state.currentMatch.courts[courtIndex]) return;

    const court = state.currentMatch.courts[courtIndex];
    const originalPlayersInCourt = [...court.team1, ...court.team2].filter(Boolean);
    const reshufflePool = [...originalPlayersInCourt, ...state.currentMatch.resting];

    if (reshufflePool.length < 4) return;

    shuffleArray(reshufflePool);
    const newCourtPlayers = reshufflePool.slice(0, 4);
    const newRestingPlayers = reshufflePool.slice(4);

    const originalPlayerIds = new Set(originalPlayersInCourt.map(p => p.id));
    const newPlayerIds = new Set(newCourtPlayers.map(p => p.id));

    state.players.forEach(p => {
        const wasPlaying = originalPlayerIds.has(p.id);
        const isPlaying = newPlayerIds.has(p.id);
        if(wasPlaying && !isPlaying) {
            p.gamesPlayed--;
            p.consecutiveRests = (p.consecutiveRests || 0) + 1;
        } else if (!wasPlaying && isPlaying) {
            p.gamesPlayed++;
            p.consecutiveRests = 0;
        }
    });

    const newTeams = createBalancedMatches(newCourtPlayers);
    if (newTeams.length > 0) {
        state.currentMatch.courts[courtIndex].team1 = newTeams[0].team1;
        state.currentMatch.courts[courtIndex].team2 = newTeams[0].team2;
    } else {
        shuffleArray(newCourtPlayers);
        state.currentMatch.courts[courtIndex].team1 = [newCourtPlayers[0], newCourtPlayers[1]];
        state.currentMatch.courts[courtIndex].team2 = [newCourtPlayers[2], newCourtPlayers[3]];
    }
    
    state.setCurrentMatch({ ...state.currentMatch, resting: newRestingPlayers });
    
    ui.renderAll();
    state.saveState(ui.dom.courtCountInput.value);
}

// --- Modal and App Reset ---
function selectPlayerForSwap(newPlayer) {
    if (!editingContext) return;

    const { historyIndex, courtIndex, teamIndex, playerIndex } = editingContext;
    const isHistory = historyIndex !== null;
    const matchToEdit = isHistory ? state.history[historyIndex] : state.currentMatch;
    
    const teamKey = teamIndex === 0 ? 'team1' : 'team2';
    const oldPlayer = matchToEdit.courts[courtIndex][teamKey][playerIndex];

    if (oldPlayer.id === newPlayer.id) {
        ui.closePlayerModal();
        return;
    }

    const restingIndex = matchToEdit.resting.findIndex(p => p.id === newPlayer.id);

    if (restingIndex !== -1) {
        const playerFromRest = matchToEdit.resting[restingIndex];
        
        matchToEdit.courts[courtIndex][teamKey][playerIndex] = playerFromRest;
        matchToEdit.resting.splice(restingIndex, 1, oldPlayer);

        const pOld = state.players.find(p => p.id === oldPlayer.id);
        const pNew = state.players.find(p => p.id === newPlayer.id);
        if(pOld) {
            pOld.gamesPlayed--;
            pOld.consecutiveRests = countConsecutiveRests(pOld);
        }
        if(pNew) {
            pNew.gamesPlayed++;
            pNew.consecutiveRests = 0;
        }
    }
    
    ui.renderAll();
    state.saveState(ui.dom.courtCountInput.value);
    ui.closePlayerModal();
}

function resetApp() {
    state.setRound(0);
    state.setHistory([]);
    state.setCurrentMatch({ round: 0, courts: [], resting: [] });
    state.players.forEach(p => { 
        p.gamesPlayed = 0;
        p.consecutiveRests = 0;
    });
    state.setPartnershipHistory({});
    
    ui.dom.resultsSection.style.display = 'none';
    ui.dom.historySection.style.display = 'none';
    ui.dom.messageArea.textContent = '';

    ui.dom.restingPlayersContainer.className = 'mt-6 bg-white p-4 rounded-2xl shadow-sm transition-colors duration-300';
    ui.dom.restingPlayersContainer.querySelector('h3').className = 'text-lg font-semibold text-slate-600 mb-3';
    
    if (!ui.dom.statsContainer.classList.contains('hidden')) {
        ui.dom.statsContainer.classList.add('hidden');
        ui.dom.toggleStatsBtn.textContent = 'ดูสถิติคู่';
    }

    ui.renderPlayerList();
    state.saveState(ui.dom.courtCountInput.value);
}

function clearAll() {
    state.setPlayers([]);
    resetApp();
    localStorage.removeItem(state.STORAGE_KEY);
}

function countConsecutiveRests(player) {
    let count = 0;

    // ป้องกัน null และตรวจว่าผู้เล่นพักในรอบปัจจุบัน
    if (!state.currentMatch?.resting?.some(p => p.id === player.id)) return 0;
    count++;

    // ไล่ย้อนใน history ถ้ายังพักอยู่ให้ count++
    for (let i = state.history.length - 1; i >= 0; i--) {
        if (state.history[i].resting?.some(p => p.id === player.id)) {
            count++;
        } else {
            break;
        }
    }
    return count;
}

// --- Event Listeners ---
ui.dom.addPlayersBtn.addEventListener('click', handleAddPlayers);
ui.dom.generateRoundBtn.addEventListener('click', generateNewRound);
ui.dom.reshuffleBtn.addEventListener('click', reshuffleCurrentRound);

ui.dom.resetBtn.addEventListener('click', () => {
    pendingAction = ui.openConfirmModal('ยืนยันการรีเซ็ตเกม', 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตเกม? จำนวนเกมของผู้เล่นทั้งหมดจะถูกตั้งเป็น 0', resetApp);
});

ui.dom.clearAllBtn.addEventListener('click', () => {
    pendingAction = ui.openConfirmModal('ยืนยันการล้างข้อมูล', 'คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้', clearAll);
});

ui.dom.courtCountInput.addEventListener('change', () => state.saveState(ui.dom.courtCountInput.value));

ui.dom.playerListContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-player-btn');
    if (removeBtn) {
        const playerId = parseFloat(removeBtn.dataset.playerId);
        const playerName = removeBtn.dataset.playerName;
        pendingAction = ui.openConfirmModal('ยืนยันการลบผู้เล่น', `คุณแน่ใจหรือไม่ว่าต้องการลบ "${playerName}"?`, () => removePlayer(playerId));
        return;
    }

    const levelBtn = e.target.closest('.level-btn');
    if (levelBtn) {
        changePlayerLevel(parseFloat(levelBtn.dataset.playerId));
    }
});

ui.dom.currentRoundContainer.addEventListener('click', (e) => {
    const reshuffleCourtBtn = e.target.closest('.reshuffle-court-btn');
    if (reshuffleCourtBtn) {
        reshuffleSingleCourt(parseInt(reshuffleCourtBtn.dataset.courtIndex, 10));
        return;
    }
    
    const slot = e.target.closest('.player-slot');
    if (slot) {
        editingContext = {
            historyIndex: null,
            courtIndex: parseInt(slot.dataset.courtIndex, 10),
            teamIndex: parseInt(slot.dataset.teamIndex, 10),
            playerIndex: parseInt(slot.dataset.playerIndex, 10)
        };
        ui.openPlayerModal(editingContext, selectPlayerForSwap);
    }
});

ui.dom.historyContainer.addEventListener('click', (e) => {
     const slot = e.target.closest('.player-slot');
    if (slot) {
        editingContext = {
            historyIndex: parseInt(slot.dataset.historyIndex, 10),
            courtIndex: parseInt(slot.dataset.courtIndex, 10),
            teamIndex: parseInt(slot.dataset.teamIndex, 10),
            playerIndex: parseInt(slot.dataset.playerIndex, 10)
        };
        ui.openPlayerModal(editingContext, selectPlayerForSwap);
    }
});

ui.dom.toggleStatsBtn.addEventListener('click', () => {
    const isHidden = ui.dom.statsContainer.classList.toggle('hidden');
    ui.dom.toggleStatsBtn.textContent = isHidden ? 'ดูสถิติคู่' : 'ซ่อนสถิติ';
    if (!isHidden) {
        ui.renderPartnershipStats();
    }
});

// Modal Listeners
ui.dom.modalCloseBtn.addEventListener('click', ui.closePlayerModal);
ui.dom.playerModal.addEventListener('click', (e) => {
    if (e.target === ui.dom.playerModal) ui.closePlayerModal();
});

ui.dom.confirmYesBtn.addEventListener('click', () => {
    if (typeof pendingAction === 'function') {
        pendingAction();
    }
    ui.closeConfirmModal();
});
ui.dom.confirmNoBtn.addEventListener('click', ui.closeConfirmModal);
ui.dom.confirmModal.addEventListener('click', (e) => {
    if (e.target === ui.dom.confirmModal) ui.closeConfirmModal();
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const courtCount = state.loadState();
    ui.dom.courtCountInput.value = courtCount;
    ui.renderAll();
});
