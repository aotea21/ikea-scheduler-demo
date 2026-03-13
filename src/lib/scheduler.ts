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


export function generateRecommendations(task: AssemblyTask, assemblers: Assembler[], taskLocation: { lat: number, lng: number }): AssignmentRecommendation[] {
    return assemblers
        .filter(assembler => assembler.status !== 'OFFLINE')
        .map(assembler => {
            const distance = calculateDistance(
                assembler.currentLocation.lat,
                assembler.currentLocation.lng,
                taskLocation.lat,
                taskLocation.lng
            );

            // Scoring with normalized weights: skill(0.4) + distance(0.3) + rating(0.2) + availability(0.1)
            let skillScore = 0;
            const hasSkill = hasRequiredSkill(assembler, task.skillRequired);
            if (hasSkill) {
                // Bonus for exact skill match vs over-qualified
                const maxSkillVal = Math.max(...assembler.skills.map(s => SKILL_VALUE[s]));
                const requiredVal = SKILL_VALUE[task.skillRequired];
                skillScore = maxSkillVal === requiredVal ? 100 : 75; // Exact match preferred
            } else {
                skillScore = 0; // Penalty applied via late-stage sort
            }

            // Distance score (0–100): decays with distance
            const distanceScore = Math.max(0, 100 - distance * 2);

            // Rating score (0–100)
            const ratingScore = (assembler.rating / 5) * 100;

            // Availability score
            const availabilityScore = !assembler.activeTaskId ? 100 : 0;

            // Weighted total
            const totalScore = hasSkill
                ? skillScore * 0.4 + distanceScore * 0.3 + ratingScore * 0.2 + availabilityScore * 0.1
                : -50; // Unqualified assemblers sink to bottom

            const matchReasons = [];
            if (distance < 5) matchReasons.push('Nearby (<5km)');
            if (assembler.rating >= 4.8) matchReasons.push('Top Rated');
            if (hasSkill && SKILL_VALUE[task.skillRequired] === Math.max(...assembler.skills.map(s => SKILL_VALUE[s]))) {
                matchReasons.push('Perfect Skill Match');
            }
            if (!assembler.activeTaskId) matchReasons.push('Available');
            if (!hasSkill) matchReasons.push('⚠️ Skill Gap');
            if (assembler.activeTaskId) matchReasons.push('⚠️ Busy');

            return {
                assembler,
                score: Math.round(totalScore),
                matchReasons
            };
        })
        .sort((a, b) => b.score - a.score);
}
