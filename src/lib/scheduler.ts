import { Assembler, AssemblyTask, AssignmentRecommendation, SkillLevel } from './types';

// Helper: Calculate Haversine distance in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Helper: Skill Level to numeric value
const SKILL_VALUE = {
    'EASY': 1,
    'MEDIUM': 2,
    'HARD': 3
};

function hasRequiredSkill(assembler: Assembler, requiredSkill: SkillLevel): boolean {
    const requiredVal = SKILL_VALUE[requiredSkill];
    // Check if assembler has any skill >= required
    // Actually, assembler.skills is an array of skills they have.
    // We assume if they have 'HARD', they can do 'EASY'.
    // But strictly, let's look for exact or higher presence.
    // Simplified: Max skill possessed.
    const maxSkillVal = Math.max(...assembler.skills.map(s => SKILL_VALUE[s]));
    return maxSkillVal >= requiredVal;
}

function calculateSkillScore(assembler: Assembler, task: AssemblyTask): number {
    // Base score for validation (already checked by filter)
    return 50;
}

export function generateRecommendations(task: AssemblyTask, assemblers: Assembler[], taskLocation: { lat: number, lng: number }): AssignmentRecommendation[] {
    return assemblers
        .filter(a => hasRequiredSkill(a, task.requiredSkills))
        .filter(a => hasRequiredSkill(a, task.requiredSkills))
        .filter(a => !a.activeTaskId) // Only free assemblers (null or undefined)
        .map(assembler => {
            const distance = calculateDistance(
                assembler.currentLocation.lat,
                assembler.currentLocation.lng,
                taskLocation.lat,
                taskLocation.lng
            );

            // Scoring Heuristic
            // 1. Skill Match (50 points): 
            //    - Exact match (lowest capable) is good? No, higher skill is fine.
            //    - Let's say raw capability is binary (filtered above).
            //    - We give 50 points base for being capable.
            const skillScore = calculateSkillScore(assembler, task);
            // Distance score (minimize distance)

            const distanceScore = Math.max(0, 100 - distance * 2); // Simple decay
            // Rating score
            const ratingScore = (assembler.rating / 5) * 100;

            const totalScore = skillScore + distanceScore + ratingScore;

            const matchReasons = [];
            if (distance < 5) matchReasons.push('Nearby (< 5km)');
            if (assembler.rating >= 4.8) matchReasons.push('Top Rated');
            if (SKILL_VALUE[task.requiredSkills] === Math.max(...assembler.skills.map(s => SKILL_VALUE[s]))) matchReasons.push('Perfect Skill Match');

            return {
                assembler,
                score: Math.round(totalScore),
                matchReasons
            };
        })
        .sort((a, b) => b.score - a.score);
}
