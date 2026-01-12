import React from 'react';

// Helper to map intensity to color (same as in Analysis)
const getMuscleColor = (intensity: number): string => {
    if (intensity === 0) return '#e2e8f0'; // not worked
    if (intensity < 25) return '#fef08a'; // light yellow
    if (intensity < 50) return '#fbbf24'; // yellow
    if (intensity < 75) return '#f97316'; // orange
    return '#ef4444'; // red
};

interface MuscleMapProps {
    bodyView: 'front' | 'side' | 'back';
    muscleHeatData: { id: string; intensity: number }[];
}

const MuscleMap: React.FC<MuscleMapProps> = ({ bodyView, muscleHeatData }) => {
    const getColor = (muscleId: string) =>
        getMuscleColor(muscleHeatData.find(m => m.id === muscleId)?.intensity || 0);

    // Simplified but more detailed shapes for each view
    if (bodyView === 'front') {
        return (
            <svg viewBox="0 0 200 380" className="w-48 h-96">
                {/* Head */}
                <ellipse cx="100" cy="32" rx="24" ry="28" fill="#cbd5e1" />
                {/* Chest */}
                <path d="M70 86 Q80 78 100 80 Q120 78 130 86 L124 112 Q100 120 76 112 Z" fill={getColor('chest')} />
                {/* Abs (core) */}
                <path d="M78 115 L78 168 Q100 176 122 168 L122 115 Q100 122 78 115" fill={getColor('core')} />
                {/* Shoulders */}
                <ellipse cx="52" cy="90" rx="18" ry="16" fill={getColor('shoulders')} />
                <ellipse cx="148" cy="90" rx="18" ry="16" fill={getColor('shoulders')} />
                {/* Biceps */}
                <ellipse cx="42" cy="118" rx="10" ry="24" fill={getColor('biceps')} />
                <ellipse cx="158" cy="118" rx="10" ry="24" fill={getColor('biceps')} />
                {/* Triceps */}
                <ellipse cx="33" cy="118" rx="7" ry="20" fill={getColor('triceps')} />
                <ellipse cx="167" cy="118" rx="7" ry="20" fill={getColor('triceps')} />
                {/* Glutes */}
                <ellipse cx="100" cy="182" rx="28" ry="18" fill={getColor('glutes')} />
                {/* Quads */}
                <path d="M76 196 Q68 232 72 278 L88 278 Q92 232 86 196 Z" fill={getColor('quads')} />
                <path d="M114 196 Q108 232 112 278 L128 278 Q132 232 124 196 Z" fill={getColor('quads')} />
                {/* Hamstrings */}
                <ellipse cx="80" cy="238" rx="11" ry="34" fill={getColor('hamstrings')} />
                <ellipse cx="120" cy="238" rx="11" ry="34" fill={getColor('hamstrings')} />
                {/* Calves */}
                <path d="M70 292 Q64 318 70 340 L90 340 Q94 318 92 292 Z" fill={getColor('calves')} />
                <path d="M108 292 Q104 318 110 340 L130 340 Q134 318 132 292 Z" fill={getColor('calves')} />
                {/* Feet */}
                <ellipse cx="80" cy="360" rx="16" ry="7" fill="#cbd5e1" />
                <ellipse cx="120" cy="360" rx="16" ry="7" fill="#cbd5e1" />
            </svg>
        );
    }

    if (bodyView === 'side') {
        return (
            <svg viewBox="0 0 200 380" className="w-48 h-96">
                {/* Head */}
                <ellipse cx="110" cy="32" rx="22" ry="26" fill="#cbd5e1" />
                {/* Chest side */}
                <path d="M100 56 Q98 68 100 76 L115 78 Q118 68 115 56 Z" fill={getColor('chest')} />
                {/* Shoulders side */}
                <ellipse cx="95" cy="88" rx="22" ry="18" fill={getColor('shoulders')} />
                {/* Biceps side */}
                <ellipse cx="75" cy="118" rx="12" ry="26" fill={getColor('biceps')} />
                {/* Triceps side */}
                <ellipse cx="125" cy="118" rx="12" ry="26" fill={getColor('triceps')} />
                {/* Core side */}
                <path d="M100 120 Q95 140 98 165 L108 168 Q112 145 110 125 Z" fill={getColor('core')} />
                {/* Glutes side */}
                <ellipse cx="102" cy="182" rx="26" ry="20" fill={getColor('glutes')} />
                {/* Quads side */}
                <path d="M95 200 Q88 240 92 280 L108 280 Q112 240 108 200 Z" fill={getColor('quads')} />
                {/* Hamstrings side */}
                <ellipse cx="100" cy="286" rx="12" ry="10" fill={getColor('hamstrings')} />
                {/* Calves side */}
                <path d="M92 294 Q88 320 92 342 L108 342 Q112 320 110 294 Z" fill={getColor('calves')} />
                {/* Feet side */}
                <ellipse cx="100" cy="358" rx="20" ry="8" fill="#cbd5e1" />
            </svg>
        );
    }

    // back view
    return (
        <svg viewBox="0 0 200 380" className="w-48 h-96">
            {/* Head */}
            <ellipse cx="100" cy="32" rx="24" ry="28" fill="#cbd5e1" />
            {/* Back */}
            <path d="M60 70 Q75 62 100 64 Q125 62 140 70 L135 88 Q100 82 65 88 Z" fill={getColor('back')} />
            {/* Shoulders */}
            <ellipse cx="48" cy="92" rx="18" ry="16" fill={getColor('shoulders')} />
            <ellipse cx="152" cy="92" rx="18" ry="16" fill={getColor('shoulders')} />
            {/* Triceps (upper arm back) */}
            <ellipse cx="30" cy="118" rx="8" ry="22" fill={getColor('triceps')} />
            <ellipse cx="170" cy="118" rx="8" ry="22" fill={getColor('triceps')} />
            {/* Glutes */}
            <ellipse cx="100" cy="186" rx="30" ry="20" fill={getColor('glutes')} />
            {/* Hamstrings */}
            <path d="M74 200 Q66 235 70 278 L86 278 Q90 235 84 200 Z" fill={getColor('hamstrings')} />
            <path d="M116 200 Q110 235 114 278 L130 278 Q134 235 126 200 Z" fill={getColor('hamstrings')} />
            {/* Calves */}
            <path d="M68 292 Q62 315 68 340 L88 340 Q92 315 90 292 Z" fill={getColor('calves')} />
            <path d="M112 292 Q108 315 112 340 L132 340 Q136 315 134 292 Z" fill={getColor('calves')} />
            {/* Feet */}
            <ellipse cx="78" cy="360" rx="16" ry="7" fill="#cbd5e1" />
            <ellipse cx="122" cy="360" rx="16" ry="7" fill="#cbd5e1" />
        </svg>
    );
};

export default MuscleMap;
