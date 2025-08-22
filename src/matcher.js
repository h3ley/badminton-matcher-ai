import { skillScores, partnershipHistory } from './state.js';

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function partnerPenalty(a, b) {
  const key = [a.id, b.id].sort().join('-');
  const count = partnershipHistory[key] || 0;
  return count >= 2 ? 10000 : 0; // ใช้มาตรฐานโทษเดิม
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

    for (let improved = true, guard = 0; improved && guard < 2; guard++) {
        improved = false;

        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
            const [a1, a2] = teams[i].players; // a1 = high, a2 = low (จากขั้นสร้างทีมเดิม)
            const [b1, b2] = teams[j].players; // b1 = high, b2 = low

            const before = partnerPenalty(a1, a2) + partnerPenalty(b1, b2);

            // ลองสลับ "ฝั่งอ่อน" ของสองทีม
            const after  = partnerPenalty(a1, b2) + partnerPenalty(b1, a2);

            // คุมความบาลานซ์ทีมให้เปลี่ยนได้น้อยมาก (ปรับ threshold ได้)
            const score_i_after = skillScores[a1.level] + skillScores[b2.level];
            const score_j_after = skillScores[b1.level] + skillScores[a2.level];
            const okBalance =
                Math.abs(score_i_after - teams[i].score) <= 1 &&
                Math.abs(score_j_after - teams[j].score) <= 1;

            if (after < before && okBalance) {
                // ทำ swap แบบปลอดภัย
                teams[i].players = [a1, b2];
                teams[j].players = [b1, a2];

                teams[i].score = score_i_after;
                teams[j].score = score_j_after;

                // อัปเดตโทษทีมไว้ใช้ต่อในขั้นเลือกทีมเจอกัน
                teams[i].penalty = partnerPenalty(teams[i].players[0], teams[i].players[1]);
                teams[j].penalty = partnerPenalty(teams[j].players[0], teams[j].players[1]);

                improved = true;
            }
            }
        }
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

    possibleMatches.sort((a, b) => {
        const d = a.score - b.score;
        return d !== 0 ? d : (Math.random() - 0.5);
    });

    const usedTeamIndices = new Set();
    for (const match of possibleMatches) {
        if (!usedTeamIndices.has(match.indices[0]) && !usedTeamIndices.has(match.indices[1])) {
            courts.push({ team1: match.teams[0].players, team2: match.teams[1].players });
            usedTeamIndices.add(match.indices[0]);
            usedTeamIndices.add(match.indices[1]);
        }
    }
    
    shuffleArray(courts);
    courts.forEach(c => {
        c.team1.sort((a, b) => a.id - b.id)
        c.team2.sort((a, b) => a.id - b.id)
    })
    return courts;
}
