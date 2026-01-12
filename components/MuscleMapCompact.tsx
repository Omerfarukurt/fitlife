import React from 'react';

interface MuscleData {
    id: string;
    name: string;
    volume: number;
    intensity: number;
}

interface MuscleMapCompactProps {
    bodyView: 'front' | 'side' | 'back';
    muscleHeatData: MuscleData[];
}

const getMuscleColor = (intensity: number): string => {
    if (intensity === 0) return '#e2e8f0';
    if (intensity < 25) return '#fef08a';
    if (intensity < 50) return '#fbbf24';
    if (intensity < 75) return '#f97316';
    return '#ef4444';
};

const MuscleMapCompact: React.FC<MuscleMapCompactProps> = ({ bodyView, muscleHeatData }) => {
    const getColor = (muscleId: string) => {
        const muscle = muscleHeatData.find(m => m.id === muscleId);
        return getMuscleColor(muscle?.intensity || 0);
    };

    if (bodyView === 'front') {
        return (
            <svg viewBox="0 0 100 200" className="w-24 h-36">
                <ellipse cx="50" cy="15" rx="12" ry="14" fill="#e8d4c4" />
                <rect x="44" y="28" width="12" height="8" rx="2" fill="#e8d4c4" />
                <ellipse cx="25" cy="42" rx="10" ry="8" fill={getColor('shoulders')} />
                <ellipse cx="75" cy="42" rx="10" ry="8" fill={getColor('shoulders')} />
                <path d="M35 38 Q45 34 50 36 Q55 34 65 38 L62 55 Q50 60 38 55 Z" fill={getColor('chest')} />
                <path d="M38 58 L38 88 Q50 92 62 88 L62 58 Q50 62 38 58" fill={getColor('core')} />
                <ellipse cx="20" cy="58" rx="5" ry="14" fill={getColor('biceps')} />
                <ellipse cx="80" cy="58" rx="5" ry="14" fill={getColor('biceps')} />
                <path d="M16 72 Q14 85 16 98 L24 98 Q26 85 24 72 Z" fill="#e8d4c4" />
                <path d="M76 72 Q74 85 76 98 L84 98 Q86 85 84 72 Z" fill="#e8d4c4" />
                <ellipse cx="50" cy="95" rx="16" ry="8" fill={getColor('glutes')} />
                <path d="M36 102 Q32 125 35 148 L45 148 Q47 125 44 102 Z" fill={getColor('quads')} />
                <path d="M56 102 Q53 125 55 148 L65 148 Q68 125 64 102 Z" fill={getColor('quads')} />
                <ellipse cx="40" cy="152" rx="6" ry="4" fill="#d4b896" />
                <ellipse cx="60" cy="152" rx="6" ry="4" fill="#d4b896" />
                <path d="M35 156 Q32 170 35 184 L45 184 Q47 170 45 156 Z" fill={getColor('calves')} />
                <path d="M55 156 Q52 170 55 184 L65 184 Q68 170 65 156 Z" fill={getColor('calves')} />
                <ellipse cx="40" cy="192" rx="8" ry="4" fill="#e8d4c4" />
                <ellipse cx="60" cy="192" rx="8" ry="4" fill="#e8d4c4" />
            </svg>
        );
    }

    if (bodyView === 'side') {
        return (
            <svg viewBox="0 0 100 200" className="w-24 h-36">
                <ellipse cx="55" cy="15" rx="11" ry="14" fill="#e8d4c4" />
                <path d="M48 28 Q46 34 48 40 L60 40 Q62 34 60 28" fill="#e8d4c4" />
                <ellipse cx="45" cy="48" rx="14" ry="10" fill={getColor('shoulders')} />
                <path d="M55 42 Q65 48 68 62 L60 66 Q55 60 52 50 Z" fill={getColor('chest')} />
                <path d="M40 50 Q34 65 38 85 L48 88 Q52 70 48 52 Z" fill={getColor('back')} />
                <path d="M52 68 Q48 80 50 95 L60 98 Q62 82 60 70 Z" fill={getColor('core')} />
                <ellipse cx="35" cy="62" rx="7" ry="16" fill="#e8d4c4" />
                <path d="M30 78 Q28 92 30 105 L40 105 Q42 92 40 78 Z" fill="#e8d4c4" />
                <ellipse cx="48" cy="105" rx="18" ry="12" fill={getColor('glutes')} />
                <path d="M42 115 Q36 140 40 165 L56 165 Q60 140 55 115 Z" fill={getColor('quads')} />
                <ellipse cx="48" cy="170" rx="9" ry="6" fill="#d4b896" />
                <path d="M40 176 Q35 188 40 198 L56 198 Q60 188 56 176 Z" fill={getColor('calves')} />
            </svg>
        );
    }

    // back view
    return (
        <svg viewBox="0 0 100 200" className="w-24 h-36">
            <ellipse cx="50" cy="15" rx="12" ry="14" fill="#e8d4c4" />
            <rect x="44" y="28" width="12" height="8" rx="2" fill="#e8d4c4" />
            <path d="M28 36 Q40 30 50 32 Q60 30 72 36 L70 52 Q50 46 30 52 Z" fill={getColor('back')} />
            <ellipse cx="22" cy="46" rx="10" ry="8" fill={getColor('shoulders')} />
            <ellipse cx="78" cy="46" rx="10" ry="8" fill={getColor('shoulders')} />
            <path d="M32 52 Q26 70 30 88 L44 92 Q50 75 46 55 Z" fill={getColor('back')} />
            <path d="M68 52 Q74 70 70 88 L56 92 Q50 75 54 55 Z" fill={getColor('back')} />
            <ellipse cx="15" cy="62" rx="5" ry="14" fill={getColor('triceps')} />
            <ellipse cx="85" cy="62" rx="5" ry="14" fill={getColor('triceps')} />
            <path d="M12 76 Q10 88 12 100 L18 100 Q20 88 18 76 Z" fill="#e8d4c4" />
            <path d="M82 76 Q80 88 82 100 L88 100 Q90 88 88 76 Z" fill="#e8d4c4" />
            <ellipse cx="50" cy="102" rx="18" ry="10" fill={getColor('glutes')} />
            <path d="M35 112 Q30 135 34 160 L46 160 Q48 135 44 112 Z" fill={getColor('hamstrings')} />
            <path d="M56 112 Q52 135 54 160 L66 160 Q70 135 64 112 Z" fill={getColor('hamstrings')} />
            <ellipse cx="40" cy="164" rx="6" ry="4" fill="#d4b896" />
            <ellipse cx="60" cy="164" rx="6" ry="4" fill="#d4b896" />
            <path d="M34 168 Q30 180 34 192 L46 192 Q48 180 46 168 Z" fill={getColor('calves')} />
            <path d="M54 168 Q50 180 54 192 L66 192 Q70 180 66 168 Z" fill={getColor('calves')} />
            <ellipse cx="40" cy="198" rx="7" ry="3" fill="#e8d4c4" />
            <ellipse cx="60" cy="198" rx="7" ry="3" fill="#e8d4c4" />
        </svg>
    );
};

export default MuscleMapCompact;
