import { Assembler, AssemblyTask, AssignmentRecommendation, DomainSkill } from './types';

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

/** Skills requiring NZ-licensed certification (plumber/electrician) */
const LICENSED_SKILLS: DomainSkill[] = ['PLUMBING', 'ELECTRICAL'];

/**
 * Check if assembler has all required domain skills.
 * For PLUMBING and ELECTRICAL, also verifies valid certification.
 */
function hasRequiredSkills(assembler: Assembler, requiredSkills: DomainSkill[]): boolean {
    return requiredSkills.every(skill => {
        // Must possess the skill
        if (!assembler.skills.includes(skill)) return false;

        // Licensed skills need valid certification
        if (LICENSED_SKILLS.includes(skill)) {
            const cert = assembler.certifications?.[skill];
            if (!cert?.number) return false;
            // Check certification expiry
            if (cert.expiry && new Date(cert.expiry) < new Date()) return false;
        }

        return true;
    });
}

/**
 * Calculate skill match score (0–100).
 * Exact match = 100, partial skills met = proportional, no match = 0.
 */
function calculateSkillScore(assembler: Assembler, requiredSkills: DomainSkill[]): number {
    if (requiredSkills.length === 0) return 100; // No requirement = full score

    const matchedCount = requiredSkills.filter(skill => {
        if (!assembler.skills.includes(skill)) return false;
        if (LICENSED_SKILLS.includes(skill)) {
            const cert = assembler.certifications?.[skill];
            if (!cert?.number) return false;
            if (cert.expiry && new Date(cert.expiry) < new Date()) return false;
        }
        return true;
    }).length;

    return Math.round((matchedCount / requiredSkills.length) * 100);
}


export function generateRecommendations(task: AssemblyTask, assemblers: Assembler[], taskLocation: { lat: number, lng: number }): AssignmentRecommendation[] {
    const requiredSkills = task.requiredSkills || [];
    const isKitchen = task.isKitchenTask;

    // Skill weight is higher for kitchen tasks (licensed trades required)
    const skillWeight = isKitchen ? 0.5 : 0.4;
    const distanceWeight = isKitchen ? 0.2 : 0.3;
    const ratingWeight = 0.2;
    const availabilityWeight = 0.1;

    return assemblers
        .filter(assembler => assembler.status !== 'OFFLINE')
        .map(assembler => {
            const distance = calculateDistance(
                assembler.currentLocation.lat,
                assembler.currentLocation.lng,
                taskLocation.lat,
                taskLocation.lng
            );

            const hasAllSkills = hasRequiredSkills(assembler, requiredSkills);
            const skillScore = calculateSkillScore(assembler, requiredSkills);

            // Distance score (0–100): decays with distance
            const distanceScore = Math.max(0, 100 - distance * 2);

            // Rating score (0–100)
            const ratingScore = (assembler.rating / 5) * 100;

            // Availability score
            const availabilityScore = !assembler.activeTaskId ? 100 : 0;

            // Weighted total — unqualified assemblers get heavy penalty
            const totalScore = hasAllSkills
                ? skillScore * skillWeight + distanceScore * distanceWeight + ratingScore * ratingWeight + availabilityScore * availabilityWeight
                : -50; // Unqualified assemblers sink to bottom

            const matchReasons: string[] = [];
            if (distance < 5) matchReasons.push('Nearby (<5km)');
            if (assembler.rating >= 4.8) matchReasons.push('Top Rated');
            if (hasAllSkills && skillScore === 100) matchReasons.push('Perfect Skill Match');
            if (!assembler.activeTaskId) matchReasons.push('Available');

            // Warnings
            if (!hasAllSkills) {
                const missing = requiredSkills.filter(s => !assembler.skills.includes(s));
                matchReasons.push(`⚠️ Missing: ${missing.join(', ')}`);
            }
            if (assembler.activeTaskId) matchReasons.push('⚠️ Busy');

            // Certification warnings for licensed skills
            requiredSkills.forEach(skill => {
                if (LICENSED_SKILLS.includes(skill)) {
                    const cert = assembler.certifications?.[skill];
                    if (assembler.skills.includes(skill) && !cert?.number) {
                        matchReasons.push(`⚠️ ${skill}: No certification`);
                    } else if (cert?.expiry && new Date(cert.expiry) < new Date()) {
                        matchReasons.push(`⚠️ ${skill}: Cert expired`);
                    }
                }
            });

            return {
                assembler,
                score: Math.round(totalScore),
                matchReasons
            };
        })
        .sort((a, b) => b.score - a.score);
}
