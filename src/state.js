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

// NEW: schema version
export const SCHEMA_VERSION = 1;

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

// =========================
// Export / Import API
// =========================
function sanitizePlayer(p) {
    return {
        id: p.id ?? (Date.now() + Math.random()),
        name: String(p.name ?? '').trim(),
        gamesPlayed: Number.isFinite(p.gamesPlayed) ? p.gamesPlayed : 0,
        level: skillLevels.includes(p.level) ? p.level : 'C',
        consecutiveRests: Number.isFinite(p.consecutiveRests) ? p.consecutiveRests : 0,
        consecutivePlays: Number.isFinite(p.consecutivePlays) ? p.consecutivePlays : 0
    };
}

export function getExportPayload(courtCount) {
    const payload = {
        schema: SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: {
            players: players.map(sanitizePlayer),
            currentMatch,
            history,
            round,
            courtCount,
            partnershipHistory
        }
    };
    return payload;
}

export function importFromObject(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('ไฟล์ไม่ใช่ JSON ที่ถูกต้อง');

    // รองรับทั้งโครง {schema, data:{...}} และโครงเดิมที่เป็น state ตรงๆ
    const data = obj.data && typeof obj.data === 'object' ? obj.data : obj;

    // ตรวจโครงหลัก
    if (!Array.isArray(data.players)) throw new Error('ข้อมูล players ไม่ถูกต้อง');
    if (typeof data.round !== 'number') throw new Error('ข้อมูล round ไม่ถูกต้อง');
    if (!data.currentMatch || typeof data.currentMatch !== 'object') throw new Error('ข้อมูล currentMatch ไม่ถูกต้อง');
    if (!Array.isArray(data.history)) throw new Error('ข้อมูล history ไม่ถูกต้อง');

    const courtCount = Number.isFinite(data.courtCount) ? data.courtCount : 2;

    // ทำความสะอาดข้อมูลที่สำคัญ
    const cleanedPlayers = data.players.map(sanitizePlayer);

    // เขียนค่าเข้าระบบ
    setPlayers(cleanedPlayers);
    setCurrentMatch(data.currentMatch);
    setHistory(data.history);
    setRound(data.round);
    setPartnershipHistory(data.partnershipHistory || {});

    // เซฟกลับ localStorage
    saveState(courtCount);

    return { courtCount };
}

// --- Functions to modify state (Setters) ---
export function setPlayers(newPlayers) { players = newPlayers; }
export function setCurrentMatch(newMatch) { currentMatch = newMatch; }
export function setHistory(newHistory) { history = newHistory; }
export function setRound(newRound) { round = newRound; }
export function setPartnershipHistory(newHistory) { partnershipHistory = newHistory; }
