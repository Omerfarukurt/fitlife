import React, { useState } from 'react';

interface MuscleData {
    id: string;
    intensity: number;
    name: string;
}

interface AnatomicalMuscleMapProps {
    muscleHeatData: MuscleData[];
    isDarkMode?: boolean;
}

// Kas renk hesaplama
const getMuscleColor = (intensity: number): string => {
    if (intensity === 0) return '#4a5568';
    if (intensity < 25) return '#ecc94b';
    if (intensity < 50) return '#ed8936';
    if (intensity < 75) return '#e53e3e';
    return '#c53030';
};

const MUSCLE_NAMES: Record<string, string> = {
    'chest': 'Göğüs', 'back': 'Sırt', 'shoulders': 'Omuz',
    'biceps': 'Biceps', 'triceps': 'Triceps', 'core': 'Karın',
    'quads': 'Ön Bacak', 'hamstrings': 'Arka Bacak',
    'glutes': 'Kalça', 'calves': 'Baldır', 'lats': 'Kanat',
    'traps': 'Trapez', 'forearms': 'Önkol'
};

const AnatomicalMuscleMap: React.FC<AnatomicalMuscleMapProps> = ({ muscleHeatData, isDarkMode = false }) => {
    const [activeView, setActiveView] = useState<'front' | 'back'>('front');
    const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

    const getColor = (muscleId: string) => {
        const muscle = muscleHeatData.find(m => m.id === muscleId);
        return getMuscleColor(muscle?.intensity || 0);
    };

    const getIntensity = (muscleId: string) => {
        return muscleHeatData.find(m => m.id === muscleId)?.intensity || 0;
    };

    const skinColor = isDarkMode ? '#64748b' : '#e8c4a0';
    const skinDark = isDarkMode ? '#475569' : '#d4a574';
    const strokeColor = isDarkMode ? '#334155' : '#a67c52';

    // ÖN GÖRÜNÜM - Profesyonel Anatomi
    const FrontView = () => (
        <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-lg">
            <defs>
                <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={skinDark} />
                    <stop offset="50%" stopColor={skinColor} />
                    <stop offset="100%" stopColor={skinDark} />
                </linearGradient>
                <linearGradient id="muscleShine" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                </linearGradient>
            </defs>

            {/* === KAFA === */}
            <ellipse cx="100" cy="28" rx="22" ry="26" fill={skinColor} stroke={strokeColor} strokeWidth="0.5" />
            <ellipse cx="100" cy="30" rx="18" ry="14" fill={skinDark} opacity="0.3" />

            {/* Boyun */}
            <rect x="90" y="52" width="20" height="14" fill={skinColor} stroke={strokeColor} strokeWidth="0.3" />

            {/* === TRAPEZ (üst) === */}
            <path
                d="M70 66 Q85 60 100 62 Q115 60 130 66 L125 74 Q100 68 75 74 Z"
                fill={getColor('shoulders')}
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === OMUZLAR (Deltoid) === */}
            <ellipse
                cx="55" cy="78" rx="16" ry="14"
                fill={getColor('shoulders')}
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <ellipse
                cx="145" cy="78" rx="16" ry="14"
                fill={getColor('shoulders')}
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === GÖĞÜS (Pectoralis) === */}
            <path
                d="M70 74 Q78 68 100 70 Q122 68 130 74 L126 100 Q100 108 74 100 Z"
                fill={getColor('chest')}
                onMouseEnter={() => setHoveredMuscle('chest')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            {/* Göğüs ortası ayırıcı */}
            <line x1="100" y1="72" x2="100" y2="100" stroke={strokeColor} strokeWidth="1" opacity="0.4" />

            {/* === BICEPS === */}
            <ellipse
                cx="42" cy="105" rx="9" ry="22"
                fill={getColor('biceps')}
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <ellipse
                cx="158" cy="105" rx="9" ry="22"
                fill={getColor('biceps')}
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === ÖNKOL === */}
            <ellipse cx="38" cy="145" rx="7" ry="20" fill={skinColor} stroke={strokeColor} strokeWidth="0.3" />
            <ellipse cx="162" cy="145" rx="7" ry="20" fill={skinColor} stroke={strokeColor} strokeWidth="0.3" />

            {/* === KARIN (Abs) === */}
            <path
                d="M78 102 L78 170 Q100 178 122 170 L122 102 Q100 110 78 102"
                fill={getColor('core')}
                onMouseEnter={() => setHoveredMuscle('core')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            {/* Karın bölmeleri */}
            <line x1="100" y1="105" x2="100" y2="168" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
            <line x1="80" y1="118" x2="120" y2="118" stroke={strokeColor} strokeWidth="0.5" opacity="0.4" />
            <line x1="80" y1="134" x2="120" y2="134" stroke={strokeColor} strokeWidth="0.5" opacity="0.4" />
            <line x1="80" y1="150" x2="120" y2="150" stroke={strokeColor} strokeWidth="0.5" opacity="0.4" />

            {/* === ELLER === */}
            <ellipse cx="35" cy="178" rx="8" ry="12" fill={skinColor} />
            <ellipse cx="165" cy="178" rx="8" ry="12" fill={skinColor} />

            {/* === KALÇA / HIP === */}
            <ellipse cx="100" cy="185" rx="28" ry="16" fill={skinDark} opacity="0.6" />

            {/* === QUADRICEPS === */}
            <path
                d="M75 195 Q65 240 70 290 L92 290 Q98 240 92 195 Z"
                fill={getColor('quads')}
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <path
                d="M125 195 Q135 240 130 290 L108 290 Q102 240 108 195 Z"
                fill={getColor('quads')}
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            {/* Quad detay çizgileri */}
            <path d="M78 210 Q80 250 78 280" stroke={strokeColor} strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M122 210 Q120 250 122 280" stroke={strokeColor} strokeWidth="0.5" fill="none" opacity="0.3" />

            {/* İç bacak */}
            <path d="M92 200 Q100 250 95 285" stroke={skinDark} strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M108 200 Q100 250 105 285" stroke={skinDark} strokeWidth="2" fill="none" opacity="0.4" />

            {/* === BALDIR === */}
            <path
                d="M68 295 Q60 325 66 355 L88 355 Q95 325 88 295 Z"
                fill={getColor('calves')}
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <path
                d="M132 295 Q140 325 134 355 L112 355 Q105 325 112 295 Z"
                fill={getColor('calves')}
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === AYAKLAR === */}
            <ellipse cx="77" cy="372" rx="16" ry="8" fill={skinColor} />
            <ellipse cx="123" cy="372" rx="16" ry="8" fill={skinColor} />
        </svg>
    );

    // ARKA GÖRÜNÜM - Profesyonel Anatomi
    const BackView = () => (
        <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-lg">
            {/* === KAFA === */}
            <ellipse cx="100" cy="28" rx="22" ry="26" fill={skinColor} stroke={strokeColor} strokeWidth="0.5" />

            {/* Boyun */}
            <rect x="90" y="52" width="20" height="14" fill={skinColor} stroke={strokeColor} strokeWidth="0.3" />

            {/* === TRAPEZ === */}
            <path
                d="M65 66 Q82 55 100 58 Q118 55 135 66 L128 90 Q100 82 72 90 Z"
                fill={getColor('back')}
                onMouseEnter={() => setHoveredMuscle('back')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === ARKA OMUZ === */}
            <ellipse
                cx="52" cy="78" rx="16" ry="14"
                fill={getColor('shoulders')}
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <ellipse
                cx="148" cy="78" rx="16" ry="14"
                fill={getColor('shoulders')}
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === KANAT (Latissimus Dorsi) === */}
            <path
                d="M68 88 Q58 120 65 155 Q80 170 95 160 L95 95 Q80 90 68 88"
                fill={getColor('back')}
                onMouseEnter={() => setHoveredMuscle('back')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <path
                d="M132 88 Q142 120 135 155 Q120 170 105 160 L105 95 Q120 90 132 88"
                fill={getColor('back')}
                onMouseEnter={() => setHoveredMuscle('back')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === ORTA SIRT === */}
            <path
                d="M95 85 L95 150 Q100 155 105 150 L105 85 Q100 82 95 85"
                fill={getColor('back')}
                opacity="0.8"
                onMouseEnter={() => setHoveredMuscle('back')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            {/* Omurga */}
            <line x1="100" y1="65" x2="100" y2="175" stroke={strokeColor} strokeWidth="1.5" opacity="0.5" />

            {/* === TRICEPS === */}
            <ellipse
                cx="38" cy="105" rx="10" ry="24"
                fill={getColor('triceps')}
                onMouseEnter={() => setHoveredMuscle('triceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <ellipse
                cx="162" cy="105" rx="10" ry="24"
                fill={getColor('triceps')}
                onMouseEnter={() => setHoveredMuscle('triceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            {/* Triceps 3 baş çizgisi */}
            <path d="M35 95 L35 115" stroke={strokeColor} strokeWidth="0.5" opacity="0.4" />
            <path d="M40 95 L40 115" stroke={strokeColor} strokeWidth="0.5" opacity="0.4" />
            <path d="M160 95 L160 115" stroke={strokeColor} strokeWidth="0.5" opacity="0.4" />
            <path d="M165 95 L165 115" stroke={strokeColor} strokeWidth="0.5" opacity="0.4" />

            {/* === ÖNKOL === */}
            <ellipse cx="35" cy="148" rx="7" ry="20" fill={skinColor} stroke={strokeColor} strokeWidth="0.3" />
            <ellipse cx="165" cy="148" rx="7" ry="20" fill={skinColor} stroke={strokeColor} strokeWidth="0.3" />

            {/* === ELLER === */}
            <ellipse cx="32" cy="180" rx="8" ry="12" fill={skinColor} />
            <ellipse cx="168" cy="180" rx="8" ry="12" fill={skinColor} />

            {/* === BEL === */}
            <path
                d="M80 155 L80 180 Q100 188 120 180 L120 155 Q100 162 80 155"
                fill={getColor('back')}
                opacity="0.7"
                onMouseEnter={() => setHoveredMuscle('back')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === KALÇA (Glutes) === */}
            <ellipse
                cx="82" cy="198" rx="18" ry="16"
                fill={getColor('glutes')}
                onMouseEnter={() => setHoveredMuscle('glutes')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <ellipse
                cx="118" cy="198" rx="18" ry="16"
                fill={getColor('glutes')}
                onMouseEnter={() => setHoveredMuscle('glutes')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />

            {/* === HAMSTRINGS === */}
            <path
                d="M72 215 Q62 255 68 295 L90 295 Q96 255 88 215 Z"
                fill={getColor('hamstrings')}
                onMouseEnter={() => setHoveredMuscle('hamstrings')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <path
                d="M128 215 Q138 255 132 295 L110 295 Q104 255 112 215 Z"
                fill={getColor('hamstrings')}
                onMouseEnter={() => setHoveredMuscle('hamstrings')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            {/* Hamstring ayırıcı çizgi */}
            <path d="M78 225 Q80 260 78 290" stroke={strokeColor} strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M122 225 Q120 260 122 290" stroke={strokeColor} strokeWidth="0.5" fill="none" opacity="0.3" />

            {/* === BALDIR (Gastrocnemius) === */}
            <path
                d="M66 300 Q55 330 62 360 L88 360 Q96 330 86 300 Z"
                fill={getColor('calves')}
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            <path
                d="M134 300 Q145 330 138 360 L112 360 Q104 330 114 300 Z"
                fill={getColor('calves')}
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
            />
            {/* Baldır iki baş çizgisi */}
            <path d="M75 310 Q76 335 75 355" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.4" />
            <path d="M125 310 Q124 335 125 355" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.4" />

            {/* === AYAKLAR === */}
            <ellipse cx="75" cy="375" rx="16" ry="8" fill={skinColor} />
            <ellipse cx="125" cy="375" rx="16" ry="8" fill={skinColor} />
        </svg>
    );

    const hoveredData = hoveredMuscle ? {
        name: MUSCLE_NAMES[hoveredMuscle] || hoveredMuscle,
        intensity: getIntensity(hoveredMuscle)
    } : null;

    return (
        <div className="relative">
            {/* View Toggle */}
            <div className="flex justify-center gap-3 mb-4">
                <button
                    onClick={() => setActiveView('front')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'front'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                        }`}
                >
                    Ön
                </button>
                <button
                    onClick={() => setActiveView('back')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'back'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                        }`}
                >
                    Arka
                </button>
            </div>

            {/* Muscle Map */}
            <div className="relative flex justify-center">
                <div className="w-56 h-80">
                    {activeView === 'front' ? <FrontView /> : <BackView />}
                </div>

                {/* Hover Tooltip */}
                {hoveredMuscle && hoveredData && (
                    <div className="absolute top-2 right-2 bg-black/90 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-20">
                        <p className="font-bold">{hoveredData.name}</p>
                        <p className="text-gray-300 text-xs">Yoğunluk: {Math.round(hoveredData.intensity)}%</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-3 flex justify-center items-center gap-2">
                <span className="text-xs text-gray-400">0%</span>
                <div className="w-24 h-2 rounded-full bg-gradient-to-r from-gray-500 via-yellow-500 via-orange-500 to-red-600" />
                <span className="text-xs text-gray-400">100%</span>
            </div>
        </div>
    );
};

export default AnatomicalMuscleMap;
