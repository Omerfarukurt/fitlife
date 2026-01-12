import { WorkoutLog, PersonalRecord } from '../types';

/**
 * PR Tracker Utilities
 * Egzersiz bazlı personal record takibi
 */

// Tüm workout loglarından bir egzersiz için PR hesapla
export const calculatePRFromLogs = (
    exerciseName: string,
    workoutLogs: WorkoutLog[]
): { maxWeight: number; maxVolume: number; maxVolumeWeight: number; maxVolumeReps: number; date: string } | null => {
    const exerciseLogs = workoutLogs.filter(
        log => log.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );

    if (exerciseLogs.length === 0) return null;

    let maxWeight = 0;
    let maxWeightDate = '';
    let maxVolume = 0;
    let maxVolumeWeight = 0;
    let maxVolumeReps = 0;
    let maxVolumeDate = '';

    exerciseLogs.forEach(log => {
        log.sets.forEach(set => {
            // Max weight kontrolü
            if (set.weight > maxWeight) {
                maxWeight = set.weight;
                maxWeightDate = log.date;
            }

            // Max volume kontrolü (weight × reps)
            const volume = set.weight * set.reps;
            if (volume > maxVolume) {
                maxVolume = volume;
                maxVolumeWeight = set.weight;
                maxVolumeReps = set.reps;
                maxVolumeDate = log.date;
            }
        });
    });

    return {
        maxWeight,
        maxVolume,
        maxVolumeWeight,
        maxVolumeReps,
        date: maxWeightDate || maxVolumeDate
    };
};

// Yeni set eklendiğinde PR kırılıp kırılmadığını kontrol et
export const checkNewPR = (
    exerciseName: string,
    newWeight: number,
    newReps: number,
    currentPRs: PersonalRecord[]
): { isNewWeightPR: boolean; isNewVolumePR: boolean; weightIncrease: number; previousMax: number } => {
    const existingPR = currentPRs.find(
        pr => pr.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );

    const newVolume = newWeight * newReps;

    if (!existingPR) {
        // İlk kayıt - her şey PR!
        return {
            isNewWeightPR: true,
            isNewVolumePR: true,
            weightIncrease: 0,
            previousMax: 0
        };
    }

    const isNewWeightPR = newWeight > existingPR.maxWeight;
    const isNewVolumePR = newVolume > existingPR.maxVolume;
    const weightIncrease = isNewWeightPR ? newWeight - existingPR.maxWeight : 0;

    return {
        isNewWeightPR,
        isNewVolumePR,
        weightIncrease,
        previousMax: existingPR.maxWeight
    };
};

// PR güncellemesi yap
export const updatePR = (
    exerciseName: string,
    newWeight: number,
    newReps: number,
    currentPRs: PersonalRecord[],
    date: string
): PersonalRecord[] => {
    const newVolume = newWeight * newReps;
    const existingIndex = currentPRs.findIndex(
        pr => pr.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );

    const updatedPRs = [...currentPRs];

    if (existingIndex === -1) {
        // Yeni PR ekle
        updatedPRs.push({
            exerciseName,
            maxWeight: newWeight,
            maxVolume: newVolume,
            maxVolumeWeight: newWeight,
            maxVolumeReps: newReps,
            date,
            previousMax: 0
        });
    } else {
        // Mevcut PR'ı güncelle
        const existing = updatedPRs[existingIndex];

        if (newWeight > existing.maxWeight) {
            updatedPRs[existingIndex] = {
                ...existing,
                previousMax: existing.maxWeight,
                maxWeight: newWeight,
                date
            };
        }

        if (newVolume > existing.maxVolume) {
            updatedPRs[existingIndex] = {
                ...updatedPRs[existingIndex],
                maxVolume: newVolume,
                maxVolumeWeight: newWeight,
                maxVolumeReps: newReps
            };
        }
    }

    return updatedPRs;
};

// PR rozeti belirle
export const getPRBadge = (
    pr: PersonalRecord
): { emoji: string; label: string; color: string }[] => {
    const badges: { emoji: string; label: string; color: string }[] = [];

    // 100kg Club
    if (pr.maxWeight >= 100) {
        badges.push({ emoji: '🏆', label: '100kg Club', color: 'from-yellow-400 to-amber-500' });
    }

    // Artış rozeti
    if (pr.previousMax && pr.maxWeight - pr.previousMax >= 10) {
        badges.push({ emoji: '🚀', label: '+10kg', color: 'from-purple-500 to-pink-500' });
    } else if (pr.previousMax && pr.maxWeight - pr.previousMax >= 5) {
        badges.push({ emoji: '💪', label: '+5kg', color: 'from-blue-500 to-cyan-500' });
    }

    // Volume King - 1000+ hacim
    if (pr.maxVolume >= 1000) {
        badges.push({ emoji: '⚡', label: 'Volume King', color: 'from-orange-500 to-red-500' });
    }

    return badges;
};

// En son kırılan PR'ları getir (son 7 gün)
export const getRecentPRs = (prs: PersonalRecord[], days: number = 7): PersonalRecord[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return prs
        .filter(pr => pr.date >= cutoffStr)
        .sort((a, b) => b.date.localeCompare(a.date));
};

// Top PR'ları getir (en yüksek ağırlıklar)
export const getTopPRs = (prs: PersonalRecord[], count: number = 5): PersonalRecord[] => {
    return [...prs]
        .sort((a, b) => b.maxWeight - a.maxWeight)
        .slice(0, count);
};
