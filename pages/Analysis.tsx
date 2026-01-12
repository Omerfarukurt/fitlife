import React, { useState, useMemo } from 'react';
import { MealLog, WorkoutLog, UserProfile, GlobalProps, calculateMacroTargets } from '../types';
import { TrendingUp, TrendingDown, Minus, Scale, Dumbbell, Flame, Droplets, Wheat, Target, Calendar, ChevronLeft, ChevronRight, Zap, AlertTriangle, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line, CartesianGrid, Legend, ReferenceLine } from 'recharts';

interface AnalysisProps extends GlobalProps {
    logs: MealLog[];
    workoutLogs: WorkoutLog[];
    user: UserProfile;
}

// Kas grubu - Egzersiz eşleştirmesi
const MUSCLE_EXERCISE_MAP: Record<string, string[]> = {
    'chest': ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Press', 'Incline Dumbbell Press', 'Push Up', 'Dips', 'Chest Press', 'Pec Deck', 'Cable Crossover', 'Fly'],
    'back': ['Deadlift', 'Pull Up', 'Chin Up', 'Lat Pulldown', 'Barbell Row', 'Dumbbell Row', 'Seated Cable Row', 'T-Bar Row', 'Face Pull', 'Shrugs'],
    'shoulders': ['Overhead Press', 'Military Press', 'Lateral Raise', 'Front Raise', 'Rear Delt', 'Arnold Press', 'Upright Row'],
    'biceps': ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Concentration Curl', 'Cable Curl', 'EZ Bar Curl'],
    'triceps': ['Tricep Pushdown', 'Skullcrusher', 'Overhead Extension', 'Close Grip Bench', 'Dips', 'Kickback'],
    'core': ['Plank', 'Crunch', 'Leg Raise', 'Russian Twist', 'Mountain Climber', 'Ab Wheel', 'Cable Crunch'],
    'quads': ['Squat', 'Front Squat', 'Leg Press', 'Leg Extension', 'Lunge', 'Bulgarian Split', 'Hack Squat', 'Goblet Squat'],
    'hamstrings': ['Romanian Deadlift', 'Leg Curl', 'Sumo Deadlift', 'Good Morning'],
    'glutes': ['Hip Thrust', 'Glute Bridge', 'Cable Kickback', 'Squat', 'Lunge', 'Deadlift'],
    'calves': ['Calf Raise', 'Seated Calf']
};

const MUSCLE_NAMES: Record<string, string> = {
    'chest': 'Göğüs', 'back': 'Sırt', 'shoulders': 'Omuz',
    'biceps': 'Biceps', 'triceps': 'Triceps', 'core': 'Karın',
    'quads': 'Ön Bacak', 'hamstrings': 'Arka Bacak', 'glutes': 'Kalça', 'calves': 'Baldır'
};

// Isı haritası renk fonksiyonu
const getMuscleColor = (intensity: number): string => {
    if (intensity === 0) return '#374151'; // çalışılmamış - koyu gri
    if (intensity < 25) return '#fef08a'; // hafif sarı
    if (intensity < 50) return '#fbbf24'; // sarı
    if (intensity < 75) return '#f97316'; // turuncu
    return '#ef4444'; // kırmızı
};

const Analysis: React.FC<AnalysisProps> = ({ logs, workoutLogs, user, isDarkMode }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<1 | 3 | 6 | 12>(3);
    const [calorieAdjustment, setCalorieAdjustment] = useState(0);
    const [trainingFrequencyAdjustment, setTrainingFrequencyAdjustment] = useState(user.trainingFrequency || 3);
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedMacro, setSelectedMacro] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');

    // Haftalık tarih aralığı hesaplama
    const getWeekDates = (offset: number) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (offset * 7)); // Pazartesi

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d.toISOString().split('T')[0];
        });
    };

    const currentWeekDates = getWeekDates(weekOffset);
    const weekLabel = (() => {
        const start = new Date(currentWeekDates[0]);
        const end = new Date(currentWeekDates[6]);
        return `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`;
    })();

    // === KAS ISISI HARITASI HESAPLAMASI ===
    const muscleHeatData = useMemo(() => {
        const weekWorkouts = workoutLogs.filter(w => currentWeekDates.includes(w.date));

        const muscleIntensity: Record<string, number> = {};

        Object.keys(MUSCLE_EXERCISE_MAP).forEach(muscle => {
            muscleIntensity[muscle] = 0;
        });

        weekWorkouts.forEach(workout => {
            Object.entries(MUSCLE_EXERCISE_MAP).forEach(([muscle, exercises]) => {
                if (exercises.some(ex => workout.exerciseName.toLowerCase().includes(ex.toLowerCase()))) {
                    // Her set için puan ekle
                    const volume = workout.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                    muscleIntensity[muscle] += Math.min(volume / 500, 25); // Max 25 per workout
                }
            });
        });

        // Normalize to 0-100
        return Object.entries(muscleIntensity).map(([id, intensity]) => ({
            id,
            intensity: Math.min(intensity, 100),
            name: MUSCLE_NAMES[id] || id
        }));
    }, [workoutLogs, currentWeekDates]);

    const getColor = (muscleId: string) =>
        getMuscleColor(muscleHeatData.find(m => m.id === muscleId)?.intensity || 0);

    // === VÜCUT DÖNÜŞÜM TAHMİNİ ===
    const projection = useMemo(() => {
        const heightM = user.height / 100;
        const bmr = (10 * user.weight) + (6.25 * user.height) - (5 * (user.age || 25)) + 5;

        let activityMultiplier = 1.2;
        if (trainingFrequencyAdjustment >= 1 && trainingFrequencyAdjustment <= 2) activityMultiplier = 1.375;
        else if (trainingFrequencyAdjustment >= 3 && trainingFrequencyAdjustment <= 5) activityMultiplier = 1.55;
        else if (trainingFrequencyAdjustment >= 6) activityMultiplier = 1.725;

        const newTDEE = bmr * activityMultiplier;
        const adjustedCalories = user.targetCalories + calorieAdjustment;
        const dailySurplus = adjustedCalories - newTDEE;
        const totalDays = selectedPeriod * 30;
        const totalNetCalories = dailySurplus * totalDays;

        // 1 kg yağ = 7700 kcal, 1 kg kas = 2500 kcal (teorik)
        let fatChange = 0;
        let muscleChange = 0;

        if (dailySurplus > 0) {
            // Kalori fazlası - kilo alma
            if (trainingFrequencyAdjustment >= 3) {
                // Yeterli antrenman - kas ve yağ dengeli
                muscleChange = (totalNetCalories * 0.4) / 2500;
                fatChange = (totalNetCalories * 0.6) / 7700;
            } else {
                // Yetersiz antrenman - çoğu yağ olarak depolanır
                muscleChange = (totalNetCalories * 0.15) / 2500;
                fatChange = (totalNetCalories * 0.85) / 7700;
            }
        } else {
            // Kalori açığı - kilo verme
            if (trainingFrequencyAdjustment >= 3) {
                // Yeterli antrenman - kas korunur
                muscleChange = (totalNetCalories * 0.2) / 2500;
                fatChange = (totalNetCalories * 0.8) / 7700;
            } else {
                // Yetersiz antrenman - kas kaybı fazla
                muscleChange = (totalNetCalories * 0.4) / 2500;
                fatChange = (totalNetCalories * 0.6) / 7700;
            }
        }

        const totalWeightChange = fatChange + muscleChange;
        const newWeight = user.weight + totalWeightChange;
        const newBMI = newWeight / (heightM * heightM);

        // Uyarılar
        const warnings: string[] = [];
        if (dailySurplus > 0 && trainingFrequencyAdjustment < 3) {
            warnings.push('⚠️ Antrenman yetersiz! Fazla kalori yağ olarak depolanacak.');
        }
        if (dailySurplus < -500) {
            warnings.push('⚠️ Aşırı kalori açığı kas kaybına neden olabilir.');
        }
        if (newBMI > 30) {
            warnings.push('⚠️ Tahmini BMI obezite sınırını aşıyor.');
        }
        if (muscleChange < 0 && Math.abs(muscleChange) > 2) {
            warnings.push('💪 Kas kaybını önlemek için protein alımını artır.');
        }

        return {
            currentWeight: user.weight,
            newWeight: Math.round(newWeight * 10) / 10,
            totalChange: Math.round(totalWeightChange * 10) / 10,
            fatChange: Math.round(fatChange * 10) / 10,
            muscleChange: Math.round(muscleChange * 10) / 10,
            currentBMI: Math.round((user.weight / (heightM * heightM)) * 10) / 10,
            newBMI: Math.round(newBMI * 10) / 10,
            dailySurplus: Math.round(dailySurplus),
            warnings
        };
    }, [user, selectedPeriod, calorieAdjustment, trainingFrequencyAdjustment]);

    // === HAFTALIK MAKRO ANALİZİ ===
    const weeklyMacroData = useMemo(() => {
        const macroTargets = calculateMacroTargets(user);

        return currentWeekDates.map(date => {
            const dayLogs = logs.filter(l => l.date === date);
            const dayName = new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' });

            const totals = dayLogs.reduce((acc, log) => ({
                calories: acc.calories + log.macros.calories,
                protein: acc.protein + log.macros.protein,
                carbs: acc.carbs + log.macros.carbs,
                fat: acc.fat + log.macros.fat
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            return {
                date,
                day: dayName,
                ...totals,
                calorieTarget: user.targetCalories,
                proteinTarget: macroTargets.protein,
                carbTarget: macroTargets.carbs,
                fatTarget: macroTargets.fat
            };
        });
    }, [logs, currentWeekDates, user]);

    // Haftalık toplamlar
    const weeklyTotals = useMemo(() => {
        return weeklyMacroData.reduce((acc, day) => ({
            calories: acc.calories + day.calories,
            protein: acc.protein + day.protein,
            carbs: acc.carbs + day.carbs,
            fat: acc.fat + day.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [weeklyMacroData]);

    return (
        <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    📊 Analiz
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Antrenman ve beslenme analizlerin
                </p>
            </div>

            {/* === YA BÖYLE YAPSAM? - VÜCUT DÖNÜŞÜM TAHMİNİ === */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-lg">Ya Böyle Yapsam?</h2>
                            <p className="text-white/70 text-xs">Vücut dönüşüm tahmini</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Period Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                            Periyot
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {([1, 3, 6, 12] as const).map(period => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${selectedPeriod === period
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {period === 12 ? '1 Yıl' : `${period} Ay`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calorie Adjustment Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Kalori Ayarı
                            </label>
                            <span className={`text-sm font-black ${calorieAdjustment > 0 ? 'text-green-500' : calorieAdjustment < 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                                {calorieAdjustment > 0 ? '+' : ''}{calorieAdjustment} kcal
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-500"
                            max="500"
                            step="50"
                            value={calorieAdjustment}
                            onChange={(e) => setCalorieAdjustment(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>-500</span>
                            <span>Mevcut: {user.targetCalories}</span>
                            <span>+500</span>
                        </div>
                    </div>

                    {/* Training Frequency Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Antrenman Sıklığı
                            </label>
                            <span className="text-sm font-black text-violet-600">
                                {trainingFrequencyAdjustment} gün/hafta
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="7"
                            step="1"
                            value={trainingFrequencyAdjustment}
                            onChange={(e) => setTrainingFrequencyAdjustment(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>0</span>
                            <span>Mevcut: {user.trainingFrequency || 3}</span>
                            <span>7</span>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mt-4">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            <Target size={16} className="text-violet-500" />
                            {selectedPeriod === 12 ? '1 Yıl' : `${selectedPeriod} Ay`} Sonrası Tahmin
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Current Weight */}
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                    <Scale size={14} />
                                    <span className="text-[10px] font-bold uppercase">Şu Anki Kilo</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">{projection.currentWeight} <span className="text-sm font-medium">kg</span></p>
                            </div>

                            {/* Projected Weight */}
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                    <Target size={14} />
                                    <span className="text-[10px] font-bold uppercase">Tahmini Kilo</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{projection.newWeight} <span className="text-sm font-medium">kg</span></p>
                                    <span className={`text-xs font-bold ${projection.totalChange > 0 ? 'text-green-500' : projection.totalChange < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {projection.totalChange > 0 ? '+' : ''}{projection.totalChange}
                                    </span>
                                </div>
                            </div>

                            {/* Muscle Change */}
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                    <Dumbbell size={14} />
                                    <span className="text-[10px] font-bold uppercase">Kas Değişimi</span>
                                </div>
                                <p className={`text-xl font-black ${projection.muscleChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {projection.muscleChange > 0 ? '+' : ''}{projection.muscleChange} <span className="text-sm font-medium">kg</span>
                                </p>
                            </div>

                            {/* Fat Change */}
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                    <Flame size={14} />
                                    <span className="text-[10px] font-bold uppercase">Yağ Değişimi</span>
                                </div>
                                <p className={`text-xl font-black ${projection.fatChange <= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {projection.fatChange > 0 ? '+' : ''}{projection.fatChange} <span className="text-sm font-medium">kg</span>
                                </p>
                            </div>
                        </div>

                        {/* Daily Surplus/Deficit */}
                        <div className="mt-3 text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Günlük Kalori Dengesi</p>
                            <p className={`text-lg font-black ${projection.dailySurplus > 0 ? 'text-green-500' : projection.dailySurplus < 0 ? 'text-red-500' : 'text-slate-600'}`}>
                                {projection.dailySurplus > 0 ? '+' : ''}{projection.dailySurplus} kcal
                            </p>
                        </div>

                        {/* Warnings */}
                        {projection.warnings.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {projection.warnings.map((warning, i) => (
                                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-700 dark:text-amber-400">{warning}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === HAFTALIK MAKRO ANALİZİ === */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-lg">Haftalık Besin Analizi</h2>
                                <p className="text-white/70 text-xs">{weekLabel}</p>
                            </div>
                        </div>

                        {/* Week Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setWeekOffset(prev => prev - 1)}
                                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setWeekOffset(prev => Math.min(prev + 1, 0))}
                                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all"
                                disabled={weekOffset >= 0}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Weekly Summary Cards */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                            <Flame size={18} className="text-orange-500 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-800 dark:text-white">{Math.round(weeklyTotals.calories)}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Kalori</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                            <Dumbbell size={18} className="text-red-500 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-800 dark:text-white">{Math.round(weeklyTotals.protein)}g</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Protein</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                            <Wheat size={18} className="text-amber-500 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-800 dark:text-white">{Math.round(weeklyTotals.carbs)}g</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Karb</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                            <Droplets size={18} className="text-yellow-500 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-800 dark:text-white">{Math.round(weeklyTotals.fat)}g</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Yağ</p>
                        </div>
                    </div>

                    {/* Single Chart with Selector */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                        {/* Macro Selector Buttons */}
                        <div className="flex gap-2 mb-4">
                            {[
                                { key: 'calories', label: 'Kalori', color: '#f97316', icon: Flame },
                                { key: 'protein', label: 'Protein', color: '#ef4444', icon: Dumbbell },
                                { key: 'carbs', label: 'Karb', color: '#f59e0b', icon: Wheat },
                                { key: 'fat', label: 'Yağ', color: '#eab308', icon: Droplets }
                            ].map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => setSelectedMacro(item.key as any)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedMacro === item.key
                                        ? 'text-white shadow-lg'
                                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                                        }`}
                                    style={selectedMacro === item.key ? { backgroundColor: item.color } : {}}
                                >
                                    <item.icon size={14} />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyMacroData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }}
                                        formatter={(value: number) => [
                                            selectedMacro === 'calories' ? `${value} kcal` : `${value}g`,
                                            selectedMacro === 'calories' ? 'Kalori' :
                                                selectedMacro === 'protein' ? 'Protein' :
                                                    selectedMacro === 'carbs' ? 'Karbonhidrat' : 'Yağ'
                                        ]}
                                    />
                                    {selectedMacro === 'calories' && (
                                        <ReferenceLine y={user.targetCalories} stroke="#f97316" strokeDasharray="5 5" label={{ value: 'Hedef', fontSize: 10, fill: '#f97316' }} />
                                    )}
                                    <Bar
                                        dataKey={selectedMacro}
                                        fill={
                                            selectedMacro === 'calories' ? '#f97316' :
                                                selectedMacro === 'protein' ? '#ef4444' :
                                                    selectedMacro === 'carbs' ? '#f59e0b' : '#eab308'
                                        }
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
