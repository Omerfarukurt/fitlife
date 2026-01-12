import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile, DailySuggestion, MealLog, WorkoutLog, calculateWaterTarget, GlobalProps, calculateMacroTargets, WeeklyProgram } from '../types';
import { getDailyMealSuggestion } from '../services/geminiService';
import { User, Target, Sun, Moon, Sunrise, Info, X, Zap, Activity, TrendingUp, AlertTriangle, Trophy, Medal, Crown, Flame, Star, Award, Heart, Battery, BedDouble, Dumbbell, ChevronRight, Sparkles, Quote, Calendar } from 'lucide-react';
import HydrationTracker from '../components/HydrationTracker';
import PixelSnow from '../components/PixelSnow';
import ShinyText from '../components/ShinyText';
import RetroGymBuilding from '../components/RetroGymBuilding';

interface DashboardProps extends GlobalProps {
    user: UserProfile;
    setUser: (user: UserProfile) => void;
    logs: MealLog[];
    workoutLogs: WorkoutLog[];
    weeklyProgram?: WeeklyProgram;
}

interface WeatherData {
    temp: number;
    condition: string;
    city: string;
}

// --- Dynamic Challenges Data - Goal-Aware ---
const CHALLENGES = {
    loss: [
        { text: "Bugün 3 farklı renkte sebze tüket!", points: 50, color: "from-orange-500 to-red-500" },
        { text: "Şekersiz bir gün geçir (Meyve hariç)!", points: 100, color: "from-red-500 to-rose-600" },
        { text: "Asansör yerine merdiven kullan.", points: 30, color: "from-orange-400 to-amber-500" },
        { text: "Yatmadan 3 saat önce yemeyi kes.", points: 40, color: "from-amber-500 to-orange-500" },
        { text: "Gün içinde 30 dk tempolu yürüyüş yap.", points: 60, color: "from-orange-500 to-red-500" },
        { text: "Sabah aç karnına 20 dk kardiyo yap.", points: 80, color: "from-red-600 to-rose-700" },
    ],
    gain: [
        { text: "Her öğünde protein hedefini tut (30g+).", points: 60, color: "from-orange-500 to-red-600" },
        { text: "Antrenman sonrası 40g protein al.", points: 70, color: "from-red-500 to-rose-600" },
        { text: "Günde 5-6 öğün ye, metabolizmayı hızlı tut.", points: 80, color: "from-orange-600 to-red-500" },
        { text: "Bugün compound hareket yap (squat/deadlift).", points: 90, color: "from-red-600 to-rose-700" },
        { text: "Yatmadan önce kazeın protein al.", points: 50, color: "from-amber-500 to-orange-600" },
        { text: "Bugün minimum 3000 kalori al.", points: 100, color: "from-red-700 to-rose-800" },
    ],
    maintain: [
        { text: "Dengeli beslen - protein, karb ve yağ dengede.", points: 50, color: "from-orange-400 to-amber-500" },
        { text: "Gün içinde 10.000 adım at.", points: 60, color: "from-amber-500 to-orange-500" },
        { text: "Bir öğününde sebze ağırlıklı beslen.", points: 40, color: "from-orange-500 to-red-500" },
        { text: "Bugün aktif dinlenme - hafif aktivite yap.", points: 30, color: "from-amber-400 to-orange-400" },
        { text: "Su tüketimini takip et, hedefini tut.", points: 40, color: "from-orange-400 to-red-400" },
    ],
    recovery: [
        { text: "Bugün dinlen, kasların toparlanıyor 🧘", points: 50, color: "from-slate-600 to-slate-700" },
        { text: "Yürüyüş yap ama yoğun antrenman yapma.", points: 30, color: "from-slate-500 to-slate-600" },
        { text: "Bol su iç, protein al, iyi uyu.", points: 60, color: "from-slate-700 to-slate-800" },
    ]
};

// --- Motivasyon Sözleri ---
const MOTIVATION_QUOTES = [
    { quote: "Başkaları uyurken çalış, başkaları yemek yerken öğren.", author: "Arnold Schwarzenegger" },
    { quote: "Ağrı geçicidir, bırakmak sonsuzdur.", author: "Lance Armstrong" },
    { quote: "Vücudunuz yapabileceğinizin çok daha fazlasını yapabilir.", author: "Navy SEALs" },
    { quote: "Her bir tekrar seni hedefine bir adım daha yaklaştırır.", author: "FitLife" },
    { quote: "Mazeret üretme, sonuç üret.", author: "Alex Ferguson" },
    { quote: "Bugünün acısı, yarının gururu olacak.", author: "Muhammad Ali" },
    { quote: "Güçlü olmak bir tercih değil, bir zorunluluktur.", author: "CT Fletcher" },
    { quote: "Disiplin, motivasyon bittiğinde devreye girer.", author: "Jocko Willink" },
    { quote: "Tek sınır, kendi kafanda yarattığındır.", author: "Ronnie Coleman" },
    { quote: "Her şampiyon bir zamanlar pes etmeyen bir acemiydi.", author: "FitLife" },
];

// --- Gün İsimleri ---
const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// --- Streak Calculator ---
const calculateStreak = (logs: MealLog[]): number => {
    if (logs.length === 0) return 0;

    const uniqueDates = [...new Set(logs.map(log => log.date))].sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if streak is active (today or yesterday has logs)
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 0;
    let checkDate = new Date(uniqueDates[0]);

    for (const date of uniqueDates) {
        const currentDateStr = checkDate.toISOString().split('T')[0];
        if (date === currentDateStr) {
            streak++;
            checkDate = new Date(checkDate.getTime() - 86400000);
        } else if (date < currentDateStr) {
            break;
        }
    }

    return streak;
};

const getStreakBadge = (streak: number): { icon: React.ReactNode; label: string; color: string } => {
    if (streak >= 14) return { icon: <Crown size={16} />, label: 'Altın', color: 'from-amber-400 to-yellow-500' };
    if (streak >= 7) return { icon: <Medal size={16} />, label: 'Gümüş', color: 'from-slate-300 to-slate-400' };
    if (streak >= 3) return { icon: <Trophy size={16} />, label: 'Bronz', color: 'from-orange-400 to-amber-600' };
    return { icon: <Flame size={16} />, label: 'Başlangıç', color: 'from-rose-400 to-orange-500' };
};

// --- Kas grubu - Egzersiz eşleştirmesi (Recovery için) ---
const MUSCLE_EXERCISE_MAP: Record<string, string[]> = {
    'chest': ['Bench Press', 'Incline Bench Press', 'Dumbbell Press', 'Push Up', 'Chest Press'],
    'back': ['Deadlift', 'Pull Up', 'Lat Pulldown', 'Barbell Row', 'Seated Cable Row'],
    'shoulders': ['Overhead Press', 'Military Press', 'Lateral Raise', 'Front Raise'],
    'legs': ['Squat', 'Leg Press', 'Lunge', 'Leg Extension', 'Leg Curl', 'Romanian Deadlift'],
    'arms': ['Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Dips'],
    'core': ['Plank', 'Crunch', 'Leg Raise', 'Russian Twist']
};

const MUSCLE_NAMES: Record<string, string> = {
    'chest': 'Göğüs', 'back': 'Sırt', 'shoulders': 'Omuz',
    'legs': 'Bacak', 'arms': 'Kol', 'core': 'Karın'
};

// --- Başarım Sistemi ---
interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    requirement: (logs: MealLog[], workoutLogs: WorkoutLog[], streak: number) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_meal', title: 'İlk Adım', description: 'İlk yemek kaydını ekle', icon: <Star size={18} />, color: 'from-amber-400 to-yellow-500', requirement: (logs) => logs.length >= 1 },
    { id: 'streak_3', title: 'Kararlı', description: '3 günlük streak ulaş', icon: <Flame size={18} />, color: 'from-orange-400 to-red-500', requirement: (_, __, streak) => streak >= 3 },
    { id: 'streak_7', title: 'Haftalık Şampiyon', description: '7 günlük streak ulaş', icon: <Trophy size={18} />, color: 'from-violet-400 to-purple-600', requirement: (_, __, streak) => streak >= 7 },
    { id: 'first_workout', title: 'Güç Başlangıcı', description: 'İlk antrenmanı kaydet', icon: <Dumbbell size={18} />, color: 'from-emerald-400 to-teal-500', requirement: (_, workouts) => workouts.length >= 1 },
    { id: 'protein_master', title: 'Protein Ustası', description: '5 gün protein hedefini tut', icon: <Award size={18} />, color: 'from-blue-400 to-indigo-500', requirement: (logs) => logs.filter(l => l.macros.protein >= 30).length >= 5 },
    { id: 'workout_week', title: 'Gym Rat', description: 'Bir haftada 5 antrenman yap', icon: <Crown size={18} />, color: 'from-rose-400 to-pink-500', requirement: (_, workouts) => { const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); return workouts.filter(w => new Date(w.date) >= weekAgo).length >= 5; } },
];

const Dashboard: React.FC<DashboardProps> = ({ user, setUser, logs, workoutLogs, weeklyProgram, isDarkMode, toggleTheme, showNotification, triggerConfetti }) => {
    const [suggestion, setSuggestion] = useState<DailySuggestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'activity'>('general');
    const [formErrors, setFormErrors] = useState<string[]>([]);

    // Daily Motivation Quote - changes daily based on date
    const dailyQuote = useMemo(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        return MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length];
    }, []);

    // Today's Workout
    const todaysWorkout = useMemo(() => {
        const today = new Date();
        const dayName = DAYS[today.getDay()];
        const exercises = weeklyProgram?.[dayName] || [];
        return { dayName, exercises, isRestDay: exercises.length === 0 };
    }, [weeklyProgram]);

    // Daily Challenge State - Smart Selection
    const [dailyChallenge, setDailyChallenge] = useState(() => {
        // Hedefe göre görev seç (recovery check will be done in useEffect)
        const goalChallenges = CHALLENGES[user.goal] || CHALLENGES.maintain;
        return goalChallenges[Math.floor(Math.random() * goalChallenges.length)];
    });

    // Edit Profile Form State
    const [formData, setFormData] = useState({
        name: user.name,
        surname: user.surname || '',
        age: user.age?.toString() || '',
        weight: user.weight.toString(),
        height: user.height.toString(),
        targetCalories: user.targetCalories?.toString() || '2000',
        goal: user.goal,
        trainingFrequency: user.trainingFrequency?.toString() || '3',
        trainingDuration: user.trainingDuration?.toString() || '45',
        trainingIntensity: user.trainingIntensity || 'medium',
        usesCreatine: user.usesCreatine || false,
        customWaterTarget: user.customWaterTarget?.toString() || ''
    });

    // Header State
    const [time, setTime] = useState(new Date());
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Dynamic Water Goal Range
    const waterTarget = calculateWaterTarget(user);

    // === 4 ZAMAN DİLİMİ SİSTEMİ ===
    type TimePhase = 'morning' | 'noon' | 'sunset' | 'night';
    const getTimePhase = (): TimePhase => {
        const hour = time.getHours();
        if (hour >= 7 && hour < 11) return 'morning';  // 07:00-11:00
        if (hour >= 11 && hour < 17) return 'noon';    // 11:00-17:00
        if (hour >= 17 && hour < 20) return 'sunset';  // 17:00-20:00
        return 'night'; // 20:00-07:00
    };
    const timePhase = getTimePhase();
    const isNightMode = timePhase === 'night';

    // === HAFTALIK RAPOR HESAPLAMA - Gelişmiş Analiz ===
    const weeklyReport = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        });

        // Protein analizi
        const weekMeals = logs.filter(l => last7Days.includes(l.date));
        const totalProtein = weekMeals.reduce((sum, m) => sum + m.macros.protein, 0);
        const proteinTarget = (user.targetCalories * 0.3 / 4) * 7;
        const proteinPercentage = proteinTarget > 0 ? Math.round((totalProtein / proteinTarget) * 100) : 0;

        // Antrenman analizi
        const weekWorkouts = workoutLogs.filter(w => last7Days.includes(w.date));
        const muscleGroups: Record<string, number> = {};
        weekWorkouts.forEach(w => {
            Object.entries(MUSCLE_EXERCISE_MAP).forEach(([muscle, exercises]) => {
                if (exercises.some(ex => w.exerciseName.toLowerCase().includes(ex.toLowerCase()))) {
                    muscleGroups[muscle] = (muscleGroups[muscle] || 0) + 1;
                }
            });
        });

        // Kas grubu uyarıları
        const muscleWarnings: string[] = [];
        Object.entries(MUSCLE_NAMES).forEach(([key, name]) => {
            const count = muscleGroups[key] || 0;
            if (count === 0 && weekWorkouts.length >= 3) {
                muscleWarnings.push(`${name} hiç çalışılmadı!`);
            } else if (count === 1 && weekWorkouts.length >= 4) {
                muscleWarnings.push(`${name} sadece 1 kez çalışıldı, yetersiz.`);
            }
        });

        // En az çalışılan kas grubu
        const allMuscles = Object.keys(MUSCLE_NAMES);
        const leastWorkedMuscle = allMuscles.reduce((least, m) =>
            (muscleGroups[m] || 0) < (muscleGroups[least] || 0) ? m : least
            , allMuscles[0]);

        // Odak noktaları önerileri
        const focusPoints: string[] = [];
        if (proteinPercentage < 80) focusPoints.push('Protein alımını artır');
        if (muscleWarnings.length > 0) {
            focusPoints.push(muscleWarnings[0]); // İlk uyarıyı ekle
        }
        if (weekWorkouts.length < 3) focusPoints.push('Antrenman sıklığını artır');
        if (focusPoints.length < 3) focusPoints.push('Su tüketimini takip et');

        return {
            proteinPercentage: Math.min(proteinPercentage, 100),
            proteinMessage: proteinPercentage >= 85
                ? `Protein hedefini %${proteinPercentage} tuttun, harika! 💪`
                : `Protein hedefinin %${proteinPercentage}'ine ulaştın, biraz daha çaba!`,
            workoutCount: weekWorkouts.length,
            leastWorkedMuscle: MUSCLE_NAMES[leastWorkedMuscle] || 'Bilinmiyor',
            leastWorkedMessage: (muscleGroups[leastWorkedMuscle] || 0) === 0
                ? `⚠️ ${MUSCLE_NAMES[leastWorkedMuscle]} hiç çalışılmadı, programına ekle!`
                : `${MUSCLE_NAMES[leastWorkedMuscle]} antrenmanları az (${muscleGroups[leastWorkedMuscle] || 0}x), dengeli çalış`,
            muscleWarnings,
            focusPoints: focusPoints.slice(0, 3)
        };
    }, [logs, workoutLogs, user.targetCalories]);

    // === RECOVERY (TOPARLANMA) HESAPLAMA ===
    const recoveryData = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const yesterdayWorkouts = workoutLogs.filter(w => w.date === yesterday);
        const totalVolume = yesterdayWorkouts.reduce((sum, w) =>
            sum + w.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
        );

        const isRestRecommended = totalVolume > 5000;
        const recoveryMessage = totalVolume > 5000
            ? 'Dün yoğun çalıştın, bugün aktif dinlenme öneriliyor 🧘'
            : totalVolume > 2000
                ? 'Normal yoğunlukta çalıştın, bugün hafif antrenman yapabilirsin'
                : 'Hazırsın, bugün antrenman günü olabilir! 💪';

        // Kas grubu recovery durumu
        const muscleRecovery: Record<string, number> = {};
        const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

        Object.keys(MUSCLE_NAMES).forEach(muscle => {
            const recentWorkouts = workoutLogs.filter(w =>
                [today, yesterday, twoDaysAgo].includes(w.date) &&
                MUSCLE_EXERCISE_MAP[muscle]?.some(ex => w.exerciseName.toLowerCase().includes(ex.toLowerCase()))
            );
            // Her antrenman %30 yorgunluk ekler, her gün %40 toparlanır
            let recovery = 100;
            recentWorkouts.forEach(w => {
                const daysAgo = w.date === today ? 0 : w.date === yesterday ? 1 : 2;
                const fatigue = 30 - (daysAgo * 15); // Daha eski = daha az yorgunluk
                recovery = Math.max(0, recovery - Math.max(0, fatigue));
            });
            muscleRecovery[muscle] = Math.round(recovery);
        });

        return { isRestRecommended, recoveryMessage, totalVolume, muscleRecovery };
    }, [workoutLogs]);

    // === BAŞARIMLAR ===
    const streak = calculateStreak(logs);
    const earnedAchievements = useMemo(() =>
        ACHIEVEMENTS.filter(a => a.requirement(logs, workoutLogs, streak))
        , [logs, workoutLogs, streak]);

    // 1. Clock & Smart Challenge Selection
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Smart Challenge Selection
        const selectChallenge = () => {
            if (recoveryData.isRestRecommended) {
                return CHALLENGES.recovery[Math.floor(Math.random() * CHALLENGES.recovery.length)];
            }
            const goalChallenges = CHALLENGES[user.goal] || CHALLENGES.maintain;
            return goalChallenges[Math.floor(Math.random() * goalChallenges.length)];
        };
        setDailyChallenge(selectChallenge());

        return () => clearInterval(timer);
    }, [recoveryData.isRestRecommended, user.goal]);

    // Update form data when user prop changes
    useEffect(() => {
        setFormData({
            name: user.name,
            surname: user.surname || '',
            age: user.age?.toString() || '',
            weight: user.weight.toString(),
            height: user.height.toString(),
            targetCalories: user.targetCalories?.toString() || '2000',
            goal: user.goal,
            trainingFrequency: user.trainingFrequency?.toString() || '3',
            trainingDuration: user.trainingDuration?.toString() || '45',
            trainingIntensity: user.trainingIntensity || 'medium',
            usesCreatine: user.usesCreatine || false,
            customWaterTarget: user.customWaterTarget?.toString() || ''
        });
    }, [user]);


    // 2. Weather & Suggestion Logic
    useEffect(() => {
        const initDashboard = async () => {
            const latitude = 39.9055;
            const longitude = 41.2658;
            const city = "Erzurum";

            try {
                // A. Get Weather (Fast JSON)
                // Note: In production, cache this to avoid rate limits
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                const weatherData = await weatherRes.json();
                const currentTemp = weatherData.current_weather.temperature;

                const weatherObj = {
                    temp: currentTemp,
                    condition: "Clear", // Simplified condition to avoid complexity
                    city: city
                };
                setWeather(weatherObj);

                // B. Get Suggestion
                // Basic suggestion logic - simplified for demo/speed
                const result = await getDailyMealSuggestion(user.goal, weatherObj);
                setSuggestion(result);
                setLoading(false);

            } catch (error) {
                console.error("Dashboard Init Error", error);
                setLoading(false);
            }
        };

        initDashboard();
    }, [user.goal]);

    const validateForm = () => {
        const errors: string[] = [];
        const age = parseInt(formData.age);
        const height = parseFloat(formData.height);
        const cals = parseInt(formData.targetCalories);

        if (isNaN(age) || age < 14 || age > 100) {
            errors.push("Yaş 14 ile 100 arasında olmalıdır.");
        }
        if (isNaN(height) || height < 50 || height > 250) {
            errors.push("Boy 50cm ile 250cm arasında olmalıdır.");
        }
        if (isNaN(cals) || cals < 1500 || cals > 10000) {
            errors.push("Hedef Kalori 1500 ile 10000 arasında olmalıdır.");
        }

        setFormErrors(errors);
        return errors.length === 0;
    };

    const handleUpdateProfile = () => {
        if (!validateForm()) return;

        setUser({
            ...user,
            name: formData.name,
            surname: formData.surname,
            age: parseInt(formData.age) || user.age,
            weight: parseFloat(formData.weight) || user.weight,
            height: parseFloat(formData.height) || user.height,
            targetCalories: parseInt(formData.targetCalories) || 2000,
            goal: formData.goal as 'loss' | 'gain' | 'maintain',
            trainingFrequency: parseInt(formData.trainingFrequency) || 0,
            trainingDuration: parseInt(formData.trainingDuration) || 0,
            trainingIntensity: formData.trainingIntensity as 'low' | 'medium' | 'high',
            usesCreatine: formData.usesCreatine,
            customWaterTarget: formData.customWaterTarget ? parseFloat(formData.customWaterTarget) : undefined
        });
        setIsEditingProfile(false);
        setFormErrors([]);
        showNotification('Profil Güncellendi', 'Bilgilerin başarıyla kaydedildi.', 'success');
    };

    const todayCalories = logs
        .filter(log => log.date === new Date().toISOString().split('T')[0])
        .reduce((acc, curr) => acc + curr.macros.calories, 0);

    // --- BMI & BMR Calculation (No AI) ---
    const calculateBodyStats = () => {
        const heightM = user.height / 100;
        const bmi = user.weight / (heightM * heightM);

        let bmiStatus = 'Normal';
        let bmiColor = 'text-green-600 dark:text-green-400';

        if (bmi < 18.5) { bmiStatus = 'Zayıf'; bmiColor = 'text-blue-500 dark:text-blue-400'; }
        else if (bmi >= 25 && bmi < 30) { bmiStatus = 'Fazla Kilolu'; bmiColor = 'text-orange-500 dark:text-orange-400'; }
        else if (bmi >= 30) { bmiStatus = 'Obez'; bmiColor = 'text-red-500 dark:text-red-400'; }

        // BMR Calculation (Mifflin-St Jeor)
        const bmr = (10 * user.weight) + (6.25 * user.height) - (5 * (user.age || 25)) + 5;

        // TDEE (Total Daily Energy Expenditure) Estimation
        let activityMultiplier = 1.2;
        const freq = user.trainingFrequency || 3;
        if (freq >= 1 && freq <= 2) activityMultiplier = 1.375;
        else if (freq >= 3 && freq <= 5) activityMultiplier = 1.55;
        else if (freq >= 6) activityMultiplier = 1.725;

        const tdee = bmr * activityMultiplier;

        return { bmi: bmi.toFixed(1), bmiStatus, bmiColor, bmr: Math.round(bmr), tdee: Math.round(tdee) };
    };

    const { bmi, bmiStatus, bmiColor, bmr, tdee } = calculateBodyStats();

    // --- Projection Logic - Akıllı Uyarılar ---
    const calculateProjection = () => {
        // 1 kg fat approx 7700 kcal
        const dailySurplus = user.targetCalories - tdee;
        const monthlyNetCalories = dailySurplus * 30;
        const projectedWeightChange = monthlyNetCalories / 7700;
        const newWeight = user.weight + projectedWeightChange;

        // Antrenman ve kardiyo kontrolü
        const trainingDays = user.trainingFrequency || 0;
        const hasCardio = workoutLogs.some(w =>
            w.exerciseName.toLowerCase().includes('kardiyo') ||
            w.exerciseName.toLowerCase().includes('koşu') ||
            w.exerciseName.toLowerCase().includes('bisiklet')
        );

        let message = "";
        let warning = "";

        if (user.goal === 'gain') {
            if (projectedWeightChange > 0) {
                message = "Harika! Bu planda kas kütleni artırarak büyüyorsun.";
                // Uyarılar
                if (trainingDays < 3) {
                    warning = "⚠️ Dikkat: Haftada 3 günden az antrenman yapıyorsun. Fazla kalori kas yerine yağ olarak depolanabilir!";
                } else if (trainingDays >= 3 && !hasCardio) {
                    warning = "💡 İpucu: Haftada 1-2 kez hafif kardiyo ekle, kalp sağlığı ve kas tanımı için faydalı.";
                }
            } else {
                message = "Dikkat: Hedef kalorin kilo almanıza yetmeyebilir. Artırmalısın.";
            }
        } else if (user.goal === 'loss') {
            if (projectedWeightChange < 0) {
                message = "Süper! Yağ yakım modundasın, kilolar gidiyor.";
                if (!hasCardio && trainingDays < 4) {
                    warning = "💡 İpucu: Kardiyo ekle, yağ yakımı hızlanır!";
                }
            } else {
                message = "Dikkat: Kalori açığı oluşturmuyorsun. Kilo verimi yavaş olabilir.";
                warning = "⚠️ Hedef kalorin TDEE'den fazla. Kilo vermek için kalori açığı oluşturmalısın!";
            }
        } else {
            message = "Form koruma modundasın. Kilonuz dengede kalacak.";
            if (Math.abs(projectedWeightChange) > 1) {
                warning = "⚠️ Dikkat: Kilo değişimi beklenenden fazla. Kalori hedefini gözden geçir.";
            }
        }

        return { newWeight: newWeight.toFixed(1), change: projectedWeightChange.toFixed(1), message, warning };
    };

    const projection = calculateProjection();

    // Streak already calculated above, just get badge
    const streakBadge = getStreakBadge(streak);

    // === 4 ZAMAN DİLİMİ TEMASI ===
    const getTimeBasedBackground = () => {
        switch (timePhase) {
            case 'morning':
                // Sabah (07-11): Yükselen güneş - turuncu-sarı tonlar
                return 'from-orange-900 via-amber-800 to-slate-800 dark:from-orange-950 dark:via-amber-900 dark:to-slate-950';
            case 'noon':
                // Öğlen (11-17): Güneş tepede - parlak ve sıcak
                return 'from-amber-700 via-orange-700 to-slate-800 dark:from-amber-900 dark:via-orange-800 dark:to-slate-900';
            case 'sunset':
                // Akşam (17-20): Gün batımı - mor-kırmızı gradient
                return 'from-purple-900 via-rose-800 to-slate-900 dark:from-purple-950 dark:via-rose-900 dark:to-slate-950';
            case 'night':
            default:
                // Gece (20-07): Koyu lacivert, yıldızlı gece
                return 'from-slate-950 via-indigo-950 to-slate-900 dark:from-black dark:via-indigo-950 dark:to-slate-950';
        }
    };

    // === MEVSİM HESAPLAMA ===
    const getSeason = () => {
        const month = new Date().getMonth(); // 0-11
        if (month >= 2 && month <= 4) return 'spring'; // Mart, Nisan, Mayıs
        if (month >= 5 && month <= 7) return 'summer'; // Haziran, Temmuz, Ağustos
        if (month >= 8 && month <= 10) return 'autumn'; // Eylül, Ekim, Kasım
        return 'winter'; // Aralık, Ocak, Şubat
    };

    const currentSeason = getSeason();

    // Water progress hesapla (particle efekt için)
    const todayStr = new Date().toISOString().split('T')[0];
    const waterProgress = 0; // TODO: Eğer water state müsaitse kullanılabilir

    return (
        <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto overflow-x-hidden">

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 gap-4">


                {/* HERO SECTION - Dynamic 4-Phase Theme */}
                <div className={`col-span-2 relative rounded-xl p-6 text-white shadow-xl overflow-hidden border transition-all duration-700 bg-gradient-to-br ${getTimeBasedBackground()}`}>

                    {/* Phase-Specific Sky Effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">

                        {/* MORNING: Rising Sun (07-11) */}
                        {timePhase === 'morning' && (
                            <>
                                {/* Rising Sun */}
                                <div
                                    className="absolute w-16 h-16 rounded-full"
                                    style={{
                                        left: '75%',
                                        bottom: '20%',
                                        background: 'radial-gradient(circle, #fbbf24 0%, #f97316 50%, transparent 70%)',
                                        boxShadow: '0 0 60px 20px rgba(251, 191, 36, 0.4)',
                                    }}
                                />
                                {/* Sun rays */}
                                <div
                                    className="absolute w-32 h-32"
                                    style={{
                                        left: '70%',
                                        bottom: '10%',
                                        background: 'conic-gradient(from 0deg, transparent, rgba(251, 191, 36, 0.2), transparent 20%)',
                                        borderRadius: '50%'
                                    }}
                                />
                            </>
                        )}

                        {/* NOON: Sun at Peak (11-17) */}
                        {timePhase === 'noon' && (
                            <>
                                {/* Bright Sun */}
                                <div
                                    className="absolute w-14 h-14 rounded-full"
                                    style={{
                                        right: '15%',
                                        top: '10%',
                                        background: 'radial-gradient(circle, #fef3c7 0%, #fbbf24 40%, #f97316 70%, transparent 100%)',
                                        boxShadow: '0 0 80px 30px rgba(251, 191, 36, 0.5), 0 0 120px 60px rgba(251, 191, 36, 0.2)',
                                    }}
                                />
                                {/* Light rays */}
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute bg-gradient-to-b from-yellow-200/20 to-transparent"
                                        style={{
                                            width: '2px',
                                            height: '60px',
                                            right: `${17 + Math.cos(i * Math.PI / 4) * 8}%`,
                                            top: `${15 + Math.sin(i * Math.PI / 4) * 8}%`,
                                            transform: `rotate(${i * 45}deg)`,
                                            transformOrigin: 'top center'
                                        }}
                                    />
                                ))}
                            </>
                        )}

                        {/* SUNSET: Setting Sun (17-20) */}
                        {timePhase === 'sunset' && (
                            <>
                                {/* Setting Sun */}
                                <div
                                    className="absolute w-20 h-20 rounded-full"
                                    style={{
                                        right: '10%',
                                        bottom: '5%',
                                        background: 'radial-gradient(circle, #fbbf24 0%, #f97316 30%, #ef4444 60%, #dc2626 80%, transparent 100%)',
                                        boxShadow: '0 0 80px 40px rgba(239, 68, 68, 0.4)',
                                    }}
                                />
                                {/* Sunset glow */}
                                <div
                                    className="absolute w-full h-1/3 bottom-0 left-0"
                                    style={{
                                        background: 'linear-gradient(to top, rgba(239, 68, 68, 0.3), rgba(168, 85, 247, 0.2), transparent)'
                                    }}
                                />
                            </>
                        )}

                        {/* NIGHT: Moon & Stars (20-07) */}
                        {timePhase === 'night' && (
                            <>
                                {/* Moon */}
                                <div
                                    className="absolute w-12 h-12 rounded-full"
                                    style={{
                                        right: '12%',
                                        top: '15%',
                                        background: 'radial-gradient(circle at 30% 30%, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
                                        boxShadow: '0 0 40px 10px rgba(241, 245, 249, 0.3), inset -4px -4px 10px rgba(100, 116, 139, 0.4)',
                                    }}
                                />
                                {/* Moon craters */}
                                <div
                                    className="absolute w-2 h-2 rounded-full bg-slate-300/50"
                                    style={{ right: '14%', top: '17%' }}
                                />
                                <div
                                    className="absolute w-1.5 h-1.5 rounded-full bg-slate-300/40"
                                    style={{ right: '11%', top: '20%' }}
                                />

                                {/* Twinkling Stars */}
                                {[...Array(50)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="absolute text-white animate-pulse"
                                        style={{
                                            left: `${(i * 7 + i % 13 * 3) % 100}%`,
                                            top: `${(i * 5 + i % 7 * 8) % 70}%`,
                                            fontSize: `${1 + (i % 4)}px`,
                                            opacity: 0.3 + (i % 5) * 0.15,
                                            animationDelay: `${i * 0.1}s`,
                                            animationDuration: `${2 + (i % 3)}s`
                                        }}
                                    >{i % 8 === 0 ? '✦' : '●'}</span>
                                ))}

                                {/* Shooting star (occasional) */}
                                <div
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    style={{
                                        left: '30%',
                                        top: '20%',
                                        boxShadow: '30px 0 20px 2px rgba(255,255,255,0.4), 60px 0 30px 1px rgba(255,255,255,0.2)',
                                        transform: 'rotate(-30deg)',
                                        animation: 'shooting-star 4s linear infinite',
                                        opacity: 0.6
                                    }}
                                />
                            </>
                        )}

                    </div>

                    {/* Retro Pixel Art Gym Building Background */}
                    <RetroGymBuilding isNightMode={isNightMode} currentSeason={currentSeason} />

                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Winter Snow - Now handled inside RetroGymBuilding window */}

                        {/* Spring Flowers */}
                        {currentSeason === 'spring' && (
                            <div className="spring-container">
                                {[...Array(15)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="spring-petal"
                                        style={{
                                            '--delay': `${i * 0.4}s`,
                                            '--left': `${5 + ((i * 8) % 90)}%`,
                                            '--size': `${14 + (i % 4) * 4}px`,
                                            '--fall-duration': `${5 + (i % 3) * 2}s`,
                                            '--sway-duration': `${2.5 + (i % 3) * 1}s`
                                        } as React.CSSProperties}
                                    >{i % 2 === 0 ? '🌸' : '🌼'}</span>
                                ))}
                            </div>
                        )}

                        {/* Autumn Leaves */}
                        {currentSeason === 'autumn' && (
                            <div className="autumn-container">
                                {[...Array(20)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="autumn-leaf"
                                        style={{
                                            '--delay': `${i * 0.3}s`,
                                            '--left': `${3 + ((i * 6) % 94)}%`,
                                            '--size': `${16 + (i % 4) * 5}px`,
                                            '--fall-duration': `${5 + (i % 4) * 2}s`,
                                            '--rotate': `${(i * 45) % 360}deg`
                                        } as React.CSSProperties}
                                    >{i % 3 === 0 ? '🍂' : '🍁'}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="relative z-10">
                        {/* Top Bar */}
                        <div className="flex justify-between items-start mb-6">
                            {/* Clock & Date with dark background for readability */}
                            <div className="bg-black/50 backdrop-blur-sm px-4 py-3 rounded-xl">
                                {/* Clock */}
                                <h1 className="text-5xl font-black tracking-tight mb-1 text-white">
                                    {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    <span className="text-xl ml-2 text-slate-300">
                                        :{time.toLocaleTimeString('tr-TR', { second: '2-digit' })}
                                    </span>
                                </h1>
                                <p className="text-sm font-semibold text-slate-200">
                                    {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Temperature Thermometer */}
                                {weather && (
                                    <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-3">
                                        {/* SVG Thermometer */}
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                                            <rect x="10" y="3" width="4" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                                            <circle cx="12" cy="19" r="3.5" fill={weather.temp < 10 ? '#60a5fa' : weather.temp < 20 ? '#34d399' : weather.temp < 30 ? '#fbbf24' : '#ef4444'} />
                                            <rect
                                                x="10.75"
                                                y={weather.temp < 10 ? 12 : weather.temp < 20 ? 10 : weather.temp < 30 ? 7 : 4}
                                                width="2.5"
                                                height={weather.temp < 10 ? 4 : weather.temp < 20 ? 6 : weather.temp < 30 ? 9 : 12}
                                                rx="1.25"
                                                fill={weather.temp < 10 ? '#60a5fa' : weather.temp < 20 ? '#34d399' : weather.temp < 30 ? '#fbbf24' : '#ef4444'}
                                            />
                                        </svg>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{Math.round(weather.temp)}°</div>
                                            <div className="text-[9px] uppercase text-slate-300">
                                                {weather.city}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={toggleTheme}
                                    className="bg-black/50 backdrop-blur-sm p-3 rounded-xl transition-all hover:bg-black/60"
                                    title={isDarkMode ? 'Açık Mod' : 'Karanlık Mod'}
                                >
                                    {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-white" />}
                                </button>
                            </div>
                        </div>

                        {/* Bottom Bar - User & Stats */}
                        <div className="flex justify-between items-center pt-4 gap-3">
                            {/* User greeting with dark background */}
                            <div
                                className="cursor-pointer group flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-xl transition-all hover:bg-black/60"
                                onClick={() => setIsEditingProfile(true)}
                            >
                                <div className="bg-violet-500/30 p-2 rounded-lg">
                                    <User size={18} className="text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">Merhaba</p>
                                    <h2 className="text-lg font-bold text-white">
                                        <ShinyText text={user.name} disabled={false} speed={3} className="" />
                                    </h2>
                                </div>
                            </div>

                            {/* Calorie stats with dark background */}
                            <div className="bg-black/50 backdrop-blur-sm px-4 py-3 rounded-xl">
                                <div className="text-right">
                                    <div className="text-[10px] uppercase font-bold mb-1 text-slate-300">Günlük Kalori</div>
                                    <div className="flex items-baseline gap-1 justify-end">
                                        <span className="text-2xl font-black text-white">{Math.round(todayCalories)}</span>
                                        <span className="text-sm text-slate-300">/ {user.targetCalories}</span>
                                    </div>
                                    <div className="mt-1 w-32 rounded-full h-1.5 overflow-hidden bg-slate-700">
                                        <div
                                            className="h-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-purple-500"
                                            style={{ width: `${Math.min((todayCalories / user.targetCalories) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STREAK CARD - Half Width */}
                <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${streakBadge.color} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
                            <Flame size={18} className="text-orange-500" />
                            <span className="text-xs font-bold uppercase tracking-wide">Streak</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`text-4xl font-black bg-gradient-to-r ${streakBadge.color} bg-clip-text text-transparent`}>
                                {streak}
                            </div>
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">gün</span>
                        </div>
                        <div className={`mt-3 flex items-center gap-2 text-xs font-bold bg-gradient-to-r ${streakBadge.color} text-white px-3 py-1.5 rounded-full w-fit`}>
                            {streakBadge.icon}
                            <span>{streakBadge.label}</span>
                        </div>
                        {streak === 0 && (
                            <p className="text-[10px] text-slate-400 mt-2">Yemek kaydı ekleyerek streak başlat!</p>
                        )}
                    </div>
                </div>

                {/* COMPACT BODY STATS CARD - Half Width (BMI + BMR + TDEE combined) */}
                <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative group">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
                        <Activity size={16} className="text-teal-600 dark:text-teal-400" />
                        <span className="text-xs font-bold uppercase tracking-wide">Vücut İstatistikleri</span>
                        {/* Info Icon with Tooltip */}
                        <div className="relative ml-auto">
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <Info size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                            </button>
                            {/* Tooltip Popup */}
                            <div className="absolute right-0 top-8 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-bold text-teal-400">BMI (Vücut Kitle İndeksi)</p>
                                        <p className="text-slate-300">Kilonuzun boyunuza göre ideal aralıkta olup olmadığını gösteren değer.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-orange-400">BMR (Bazal Metabolizma)</p>
                                        <p className="text-slate-300">Vücudunuzun dinlenirken harcadığı günlük minimum kalori miktarı.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-purple-400">TDEE (Günlük Enerji İhtiyacı)</p>
                                        <p className="text-slate-300">Aktivite seviyenize göre günlük toplam kalori ihtiyacınız.</p>
                                    </div>
                                </div>
                                <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {/* BMI */}
                        <div className="text-center">
                            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{bmi}</span>
                            <p className="text-[9px] text-slate-400 mt-0.5">BMI</p>
                            <span className={`text-[8px] font-bold ${bmiColor}`}>{bmiStatus}</span>
                        </div>
                        {/* BMR */}
                        <div className="text-center border-x border-slate-100 dark:border-slate-700">
                            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{bmr}</span>
                            <p className="text-[9px] text-slate-400 mt-0.5">BMR</p>
                            <span className="text-[8px] text-slate-500">kcal</span>
                        </div>
                        {/* TDEE */}
                        <div className="text-center">
                            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{tdee}</span>
                            <p className="text-[9px] text-slate-400 mt-0.5">TDEE</p>
                            <span className="text-[8px] text-slate-500">kcal</span>
                        </div>
                    </div>
                </div>

                {/* COMPACT PROJECTION CARD - Half Width */}
                <div className="col-span-1 bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10">
                        <TrendingUp size={60} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-orange-300 uppercase mb-1">Gelecek Ay</p>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-black">{projection.newWeight}</span>
                            <span className="text-sm text-slate-400">kg</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${parseFloat(projection.change) >= 0 ? 'bg-orange-500' : 'bg-red-500'}`}>
                                {parseFloat(projection.change) > 0 ? '+' : ''}{projection.change}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">{projection.message}</p>
                    </div>
                </div>

                {/* === BAŞARIMLAR KARTI - Half Width (Projection yanında) === */}
                <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Award size={18} className="text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">Başarımlar</span>
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full ml-auto">
                            {earnedAchievements.length}/{ACHIEVEMENTS.length}
                        </span>
                    </div>

                    {earnedAchievements.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {earnedAchievements.slice(0, 4).map(achievement => (
                                <div
                                    key={achievement.id}
                                    className={`bg-gradient-to-r ${achievement.color} p-2 rounded-xl text-white`}
                                    title={achievement.description}
                                >
                                    {achievement.icon}
                                </div>
                            ))}
                            {earnedAchievements.length > 4 && (
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500 text-xs font-bold">
                                    +{earnedAchievements.length - 4}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400">Henüz başarım yok. Kayıt ekleyerek başla!</p>
                    )}

                    {/* Sonraki hedef */}
                    {ACHIEVEMENTS.filter(a => !earnedAchievements.includes(a))[0] && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400">Sonraki hedef:</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                {ACHIEVEMENTS.filter(a => !earnedAchievements.includes(a))[0]?.title}
                            </p>
                        </div>
                    )}
                </div>

                {/* === MOTIVATION QUOTE CARD - Full Width === */}
                <div className="col-span-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 opacity-10">
                        <Quote size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Quote size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide text-white/80">Günün Motivasyonu</span>
                        </div>
                        <blockquote className="text-lg font-bold leading-relaxed mb-2">
                            "{dailyQuote.quote}"
                        </blockquote>
                        <p className="text-sm text-white/70">— {dailyQuote.author}</p>
                    </div>
                </div>

                {/* === TODAY'S WORKOUT CARD - Half Width === */}
                <div className={`col-span-1 rounded-2xl p-5 relative overflow-hidden shadow-sm border ${todaysWorkout.isRestDay
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600'
                    : 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400'
                    }`}>
                    <div className="relative z-10 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide text-white/80">Bugün</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2">
                            {todaysWorkout.isRestDay ? '😴 Dinlenme' : '💪 Antrenman'}
                        </h3>
                        {todaysWorkout.isRestDay ? (
                            <p className="text-sm text-white/80">Bugün dinlenme günü. Kendini topla!</p>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">{todaysWorkout.dayName}</p>
                                <div className="flex flex-wrap gap-1">
                                    {todaysWorkout.exercises.slice(0, 3).map((ex, i) => (
                                        <span key={i} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                            {ex}
                                        </span>
                                    ))}
                                    {todaysWorkout.exercises.length > 3 && (
                                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                            +{todaysWorkout.exercises.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* === HAFTALIK RAPOR BUTONU - Half Width === */}
                <div
                    onClick={() => setIsWeeklyReportOpen(true)}
                    className="col-span-1 rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform border border-teal-500/20"
                    style={{ backgroundColor: '#0d9488' }}
                >
                    <div className="absolute top-0 right-0 opacity-10">
                        <Sparkles size={60} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Haftalık Rapor</span>
                        </div>
                        <div className="text-2xl font-black mb-1">%{weeklyReport.proteinPercentage}</div>
                        <p className="text-xs text-teal-100">Protein hedefi</p>
                        <div className="mt-2 flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full w-fit">
                            <span>Detaylar için tıkla</span>
                            <ChevronRight size={12} />
                        </div>
                    </div>
                </div>



                {/* WATER TRACKER - Full Width */}
                <div className="col-span-2">
                    <HydrationTracker
                        waterGoal={waterTarget}
                        onGoalReached={() => {
                            triggerConfetti();
                            showNotification('Su Hedefi Tamamlandı!', 'Günlük su hedefine ulaştın!', 'success');
                        }}
                        onWaterWarning={(remaining) => {
                            showNotification(
                                'Su İçmeyi Unutma! 💧',
                                `Günlük hedefe ${remaining}ml kaldı. Yatmadan önce su içmeyi unutma!`,
                                'info'
                            );
                        }}
                    />
                </div>

            </div>

            {/* Edit Profile Modal */}
            {
                isEditingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-sm relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => { setIsEditingProfile(false); setFormErrors([]); }}
                                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Profil Düzenle</h3>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-100 dark:border-slate-800 mb-4">
                                <button
                                    className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'general' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-400'}`}
                                    onClick={() => setActiveTab('general')}
                                >
                                    Genel
                                </button>
                                <button
                                    className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'activity' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-400'}`}
                                    onClick={() => setActiveTab('activity')}
                                >
                                    Aktivite & Takviye
                                </button>
                            </div>

                            {formErrors.length > 0 && (
                                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-lg">
                                    {formErrors.map((err, i) => (
                                        <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertTriangle size={12} /> {err}
                                        </p>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4">
                                {activeTab === 'general' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ad</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Soyad</label>
                                                <input
                                                    type="text"
                                                    value={formData.surname}
                                                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Yaş (14-100)</label>
                                                <input
                                                    type="number"
                                                    value={formData.age}
                                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Boy (50-250cm)</label>
                                                <input
                                                    type="number"
                                                    value={formData.height}
                                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Kilo (kg)</label>
                                                <input
                                                    type="number"
                                                    value={formData.weight}
                                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Hedef Kalori</label>
                                                <input
                                                    type="number"
                                                    value={formData.targetCalories}
                                                    onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
                                                    placeholder="1500-10000"
                                                    className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg w-full text-sm bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ana Hedef</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => setFormData({ ...formData, goal: 'loss' })}
                                                    className={`p-2 rounded-lg text-xs font-medium border ${formData.goal === 'loss' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                >
                                                    Kilo Ver
                                                </button>
                                                <button
                                                    onClick={() => setFormData({ ...formData, goal: 'gain' })}
                                                    className={`p-2 rounded-lg text-xs font-medium border ${formData.goal === 'gain' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                >
                                                    Kas Kazan
                                                </button>
                                                <button
                                                    onClick={() => setFormData({ ...formData, goal: 'maintain' })}
                                                    className={`p-2 rounded-lg text-xs font-medium border ${formData.goal === 'maintain' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                >
                                                    Koru
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // ACTIVITY & SUPPLEMENTS TAB
                                    <>
                                        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 p-3 rounded-lg mb-3">
                                            <p className="text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
                                                <Info size={14} className="shrink-0 mt-0.5" />
                                                Su hesaplaması için önemlidir.
                                            </p>
                                        </div>

                                        {/* Supplement Checkbox */}
                                        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 mb-3 flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex flex-col">
                                                <span>Kreatin Kullanımı</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">Su ihtiyacını artırır (+800ml)</span>
                                            </label>
                                            <input
                                                type="checkbox"
                                                checked={formData.usesCreatine}
                                                onChange={(e) => setFormData({ ...formData, usesCreatine: e.target.checked })}
                                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                                            />
                                        </div>

                                        {/* Custom Water Target */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Manuel Su Hedefi (Opsiyonel)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="Otomatik"
                                                    value={formData.customWaterTarget}
                                                    onChange={(e) => setFormData({ ...formData, customWaterTarget: e.target.value })}
                                                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                />
                                                <span className="absolute right-3 top-2 text-xs text-slate-400">Litre</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Antrenman Sıklığı</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="7"
                                                        value={formData.trainingFrequency}
                                                        onChange={(e) => setFormData({ ...formData, trainingFrequency: e.target.value })}
                                                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                    />
                                                    <span className="absolute right-3 top-2 text-xs text-slate-400">gün/hf</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ort. Süre</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.trainingDuration}
                                                        onChange={(e) => setFormData({ ...formData, trainingDuration: e.target.value })}
                                                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                                    />
                                                    <span className="absolute right-3 top-2 text-xs text-slate-400">dk</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Antrenman Şiddeti</label>
                                            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                                                {['low', 'medium', 'high'].map((lvl) => (
                                                    <button
                                                        key={lvl}
                                                        onClick={() => setFormData({ ...formData, trainingIntensity: lvl as any })}
                                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${formData.trainingIntensity === lvl ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        {lvl === 'low' ? 'Hafif' : lvl === 'medium' ? 'Orta' : 'Yüksek'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={handleUpdateProfile}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium mt-4 hover:bg-indigo-700 transition-colors"
                                >
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Daily Flow Carousel */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Target className="text-amber-500" size={20} />
                        Günlük Akış
                    </h2>
                    <span className="text-xs text-slate-400 font-medium bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">Ev Tipi & Pratik</span>
                </div>

                {loading ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        <div className="min-w-[280px] h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                        <div className="min-w-[280px] h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    </div>
                ) : suggestion ? (
                    <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">

                        {/* 1. Daily Focus */}
                        <div className="min-w-[280px] max-w-[280px] snap-center bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target size={100} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                        <Info size={16} />
                                    </div>
                                    <span className="text-xs font-bold tracking-wider uppercase opacity-80">Günün Odağı</span>
                                </div>
                                <p className="font-medium text-lg leading-snug drop-shadow-sm">{suggestion.tip}</p>
                            </div>
                        </div>

                        {/* Meals */}
                        <MealCard title="Sabah" content={suggestion.breakfast} icon={<Sunrise size={24} className="text-white opacity-80" />} color="from-orange-400 to-pink-500" label="Pratik Kahvaltı" />
                        <MealCard title="Öğle" content={suggestion.lunch} icon={<Sun size={24} className="text-white opacity-80" />} color="from-emerald-400 to-teal-500" label="Ev Yemeği" />
                        <MealCard title="Akşam" content={suggestion.dinner} icon={<Moon size={24} className="text-white opacity-80" />} color="from-blue-600 to-indigo-700" label="Hafif Kapanış" />

                    </div>
                ) : (
                    <p className="text-slate-500">Öneriler yüklenemedi.</p>
                )}
            </div>

            {/* === HAFTALIK RAPOR MODAL === */}
            {isWeeklyReportOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsWeeklyReportOpen(false)}>
                    <div
                        className="rounded-3xl p-6 max-w-md w-full text-white relative overflow-hidden shadow-2xl"
                        style={{ backgroundColor: '#0d9488' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsWeeklyReportOpen(false); }}
                            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors z-20"
                        >
                            <X size={18} />
                        </button>

                        <div className="absolute top-0 right-0 opacity-10">
                            <Sparkles size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={24} />
                                <h3 className="font-bold text-xl">Haftalık Rapor</h3>
                            </div>
                            <p className="text-indigo-200 text-sm mb-5">Bu haftaki performansın özeti</p>

                            {/* Protein mesajı */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                                <p className="text-base font-medium mb-2">{weeklyReport.proteinMessage}</p>
                                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                                        style={{ width: `${weeklyReport.proteinPercentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-teal-100 mt-1">%{weeklyReport.proteinPercentage} tamamlandı</p>
                            </div>

                            {/* Antrenman dengesi */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Dumbbell size={18} />
                                    <p className="text-sm font-medium">{weeklyReport.leastWorkedMessage}</p>
                                </div>
                                <p className="text-xs text-teal-100 mt-1">Bu hafta {weeklyReport.workoutCount} antrenman yapıldı</p>
                            </div>

                            {/* Odak noktaları */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-xs font-bold uppercase tracking-wide mb-3 text-teal-100">
                                    🎯 Gelecek Hafta Odak Noktaları
                                </p>
                                <div className="space-y-2">
                                    {weeklyReport.focusPoints.map((point, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                                            <ChevronRight size={16} className="text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Kapat butonu */}
                            <button
                                onClick={() => setIsWeeklyReportOpen(false)}
                                className="w-full mt-5 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold transition-colors"
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const MealCard = ({ title, content, icon, color, label }: any) => (
    <div className="min-w-[260px] max-w-[260px] snap-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm flex flex-col h-full">
        <div className={`bg-gradient-to-br ${color} h-24 rounded-xl relative p-3 flex items-start justify-between`}>
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">{label}</span>
            {icon}
        </div>
        <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{content}</p>
        </div>
    </div>
)

export default Dashboard;