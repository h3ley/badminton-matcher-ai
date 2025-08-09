import { skillScores, partnershipHistory } from './state.js';

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function createBalancedMatches(playerPool) {
    let courts = [];
    let pool = [...playerPool];
    
    const cPlayers = pool.filter(p => p.level === 'C');
    shuffleArray(cPlayers);
    while (cPlayers.length > 4) {
        const courtPlayers = cPlayers.splice(0, 4);
        shuffleArray(courtPlayers);
        courts.push({ team1: [courtPlayers[0], courtPlayers[1]], team2: [courtPlayers[2], courtPlayers[3]] });
        pool = pool.filter(p => !courtPlayers.some(cp => cp.id === p.id));
    }

    pool.sort((a, b) => skillScores[b.level] - skillScores[a.level]);
    const teams = [];
    while(pool.length >= 2) {
        const player1 = pool.shift();
        const player2 = pool.pop();
        const key = [player1.id, player2.id].sort().join('-');

        const partnershipCount = partnershipHistory[key] || 0;
        let penalty = 0;
        if (partnershipCount >= 2) {
            // ถ้าเคยคู่กันมาแล้ว 2 ครั้งขึ้นไป ให้ค่าปรับสูงมากๆ
            penalty = 10000; 
        } 
            /*
        else if (partnershipCount === 1) {
            // ถ้าเคยคู่กันมา 1 ครั้ง ให้ค่าปรับปกติ
            penalty = 100;
        }
            */
        // ถ้าไม่เคยคู่กันเลย (0 ครั้ง) ค่าปรับจะเป็น 0

        teams.push({
            players: [player1, player2],
            score: skillScores[player1.level] + (player2 ? skillScores[player2.level] : 0),
            penalty: penalty
        });
    }

    const possibleMatches = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            possibleMatches.push({
                teams: [teams[i], teams[j]],
                score: Math.abs(teams[i].score - teams[j].score) + teams[i].penalty + teams[j].penalty,
                indices: [i, j]
            });
        }
    }
    possibleMatches.sort((a, b) => a.score - b.score);

    const usedTeamIndices = new Set();
    for (const match of possibleMatches) {
        if (!usedTeamIndices.has(match.indices[0]) && !usedTeamIndices.has(match.indices[1])) {
            courts.push({ team1: match.teams[0].players, team2: match.teams[1].players });
            usedTeamIndices.add(match.indices[0]);
            usedTeamIndices.add(match.indices[1]);
        }
    }
    
    shuffleArray(courts);
    return courts;
}
