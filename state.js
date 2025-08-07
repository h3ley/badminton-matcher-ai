// --- Application State ---
export let players = []; // Array of { id, name, gamesPlayed, level, consecutiveRests }
export let currentMatch = { round: 0, courts: [], resting: [] };
export let history = []; // Array of past matches
export let round = 0;
export let partnershipHistory = {}; // Key: "p1Id-p2Id", Value: count

// --- Configuration ---
export const STORAGE_KEY = 'badmintonMatcherState';
export const skillLevels = ['C', 'B', 'A'];
export const skillScores = { 'C': 1, 'B': 2, 'A': 3 };

// --- State Management Functions ---
export function saveState(courtCount) {
    const state = { players, currentMatch, history, round, courtCount, partnershipHistory };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        const state = JSON.parse(savedState);
        players = state.players || [];
        players.forEach(p => { 
            if (!p.level) p.level = 'C'; 
            if (!p.consecutiveRests) p.consecutiveRests = 0;
        });
        currentMatch = state.currentMatch || { round: 0, courts: [], resting: [] };
        history = state.history || [];
        round = state.round || 0;
        partnershipHistory = state.partnershipHistory || {};
        return state.courtCount || 2; // Return courtCount to be set in main.js
    }
    return 2; // Default court count
}

// --- Functions to modify state (Setters) ---
export function setPlayers(newPlayers) { players = newPlayers; }
export function setCurrentMatch(newMatch) { currentMatch = newMatch; }
export function setHistory(newHistory) { history = newHistory; }
export function setRound(newRound) { round = newRound; }
export function setPartnershipHistory(newHistory) { partnershipHistory = newHistory; }
