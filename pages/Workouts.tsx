import React, { useState, useRef, useEffect, useMemo } from 'react';
import { WorkoutLog, WeeklyProgram, WorkoutSet, GlobalProps, DailyEnergy, PersonalRecord } from '../types';
import { Plus, Dumbbell, Calendar as CalendarIcon, Settings, Trash2, ChevronLeft, ChevronRight, Coffee, BookOpen, Trophy } from 'lucide-react';
import { checkNewPR, updatePR } from '../utils/prTracker';
import PRCard from '../components/PRCard';

interface WorkoutsProps extends GlobalProps {
  logs: WorkoutLog[];
  addLog: (log: WorkoutLog) => void;
  updateLog: (logId: string, newSets: WorkoutSet[]) => void;
  program: WeeklyProgram;
  setProgram: (program: WeeklyProgram) => void;
  energyLogs?: DailyEnergy[];
  setDailyEnergy?: (date: string, energy: 'low' | 'medium' | 'high' | 'excellent') => void;
  personalRecords?: PersonalRecord[];
  setPersonalRecords?: (prs: PersonalRecord[]) => void;
}

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// Static Coach Notes Database - No AI/API needed
const COACH_NOTES: Record<string, string[]> = {
  'Göğüs': [
    "Göğüs antrenmanında ilk hareketi compound (bileşik) hareketle başla. Bench Press veya Dumbbell Press ile başlamak kasları aktive etmek için idealdir.",
    "Göğüs çalışırken omuz bıçaklarını geriye çek ve göğsünü yukarı kaldır. Bu duruş hem yaralanmayı önler hem de göğüse daha fazla yük bindirir.",
    "Incline hareketleri ile üst göğsü hedefle. 30-45 derece açı optimal stimülasyon sağlar.",
    "Setler arasında 60-90 saniye dinlen. Bu süre kas büyümesi için en ideal hormonal yanıtı tetikler."
  ],
  'Sırt': [
    "Sırt çalışırken 'kas-beyin bağlantısını' hisset. Hareketi dirseklerinden çek, bileklerinden değil.",
    "Deadlift günlerinde belinizi koruyun - kalçadan menteşeleyin, belinden bükülmeyin. Core'u sıkı tutun.",
    "Row hareketlerinde tam açılıp tam kapanın. Yarım tekrarlar gelişimi sınırlar.",
    "Pull-up yapamıyorsan Lat Pulldown ile başla, zamanla kendi ağırlığına geç. Sabırlı ol!"
  ],
  'Bacak': [
    "Bacak günü en zor ama en verimli gündür! Büyük kas gruplarını çalıştırmak metabolizmayı hızlandırır.",
    "Squat'ta dizler ayak uçlarını geçebilir, önemli olan topukların yerden kalkmaması.",
    "Quad egzersizlerinden sonra hamstring çalış. Denge önemli!",
    "Bacak günü sonrası iyi beslen - protein ve karbonhidrat ihtiyacın yüksek olacak."
  ],
  'Omuz': [
    "Omuz çalışırken ağırlıkları kaldırırken nefes ver, indirirken al. Ritim önemli.",
    "Lateral Raise yaparken kolları tamamen düz tutma, hafif dirsek bükümü eklem sağlığı için önemli.",
    "Ön, yan ve arka deltoid'leri dengeli çalış. Sadece ön deltoid çalışmak duruş bozukluğuna yol açar.",
    "Omuz eklemleri hassastır - ısınmayı asla atlama!"
  ],
  'Ön Kol (Biceps)': [
    "Biceps çalışırken swinging (sallanma) yapma. Kontrollü hareket et, kasın çalışsın.",
    "Hammer Curl ile brachialis'i de çalıştır - kolların daha dolgun görünmesini sağlar.",
    "Biceps haftada 1-2 kez direkt çalışmak yeterli, sırt hareketlerinde zaten dahil oluyor.",
    "Peak contraction - en üstte 1-2 saniye tut, kasın zorlanmasını hisset."
  ],
  'Arka Kol (Triceps)': [
    "Triceps kolun 2/3'ünü oluşturur. Kalın kol istiyorsan triceps'e odaklan!",
    "Pushdown hareketlerinde dirsekleri sabit tut, sadece ön kolun hareket etsin.",
    "Overhead extension ile triceps'in uzun başını (long head) hedefle.",
    "Close Grip Bench hem göğüs hem triceps için müthiş bir compound harekettir."
  ],
  'Karın (Abs)': [
    "Karın kasları yüksek tekrar sayısını sever - 15-25 tekrar aralığında çalış.",
    "Core stabilitesi için plank mükemmel. 30 saniyeden başla, zamanla artır.",
    "Görünür karın için mutfakta çalış! Vücut yağı düşmeden karın kasları görünmez.",
    "Her antrenmanı core hareketi ile bitir - tüm vücudu destekler."
  ],
  'Kardiyo': [
    "HIIT antrenmanı yağ yakımı için çok etkili - 20 saniye sprint, 40 saniye yürüyüş.",
    "Sabah aç karnına hafif kardiyo yağ yakımını artırabilir.",
    "Ağırlık antrenmanı sonrası 15-20 dk kardiyo optimal yağ yakımı sağlar.",
    "Kardiyo yaparken kalp atışını izle. %60-70 bölgesi yağ yakımı, %80+ dayanıklılık."
  ],
  'Kalça (Glutes)': [
    "Hip Thrust kalça için en etkili harekettir. Üstte sıkıştırmayı unutma!",
    "Glute activation band ile ısın - kasları aktive et.",
    "Kalça çalışırken mind-muscle connection çok önemli. Kasın çalıştığını hisset.",
    "Bacak günlerinde kalçayı da ayrıca hedefle - squat tek başına yetmez."
  ],
  'default': [
    "Her antrenmana 5-10 dakika ısınma ile başla. Yaralanma riski azalır, performans artar.",
    "Progressive overload'u unutma - her hafta küçük artışlar yap.",
    "Antrenman sonrası protein al - 30-40g ideal miktar.",
    "Uyku kalitesi kas büyümesi için kritik - 7-8 saat hedefle.",
    "Formu asla ağırlık için feda etme. Hafif ağırlık + doğru form > ağır ağırlık + kötü form.",
    "Haftada en az 1 gün tam dinlen. Kaslar antrenmanda yıkılır, dinlenirken büyür."
  ]
};

// Function to get briefing based on exercises
const getStaticBriefing = (exercises: string[]): string => {
  if (exercises.length === 0) return '';

  // Determine which muscle groups are being worked
  const categories = new Set<string>();

  Object.entries(EXERCISE_DATABASE).forEach(([category, exerciseList]) => {
    exercises.forEach(ex => {
      if (exerciseList.includes(ex)) {
        categories.add(category);
      }
    });
  });

  // Get notes for each category
  const notes: string[] = [];
  categories.forEach(category => {
    const categoryNotes = COACH_NOTES[category] || COACH_NOTES['default'];
    // Pick a random note from this category
    const randomNote = categoryNotes[Math.floor(Math.random() * categoryNotes.length)];
    notes.push(randomNote);
  });

  // If no specific notes found, use default
  if (notes.length === 0) {
    const defaultNotes = COACH_NOTES['default'];
    notes.push(defaultNotes[Math.floor(Math.random() * defaultNotes.length)]);
  }

  // Return first note (or combine if multiple)
  return notes[0];
};

// Expanded Database
const EXERCISE_DATABASE: Record<string, string[]> = {
  'Göğüs': [
    'Bench Press', 'Incline Bench Press', 'Decline Bench Press',
    'Dumbbell Press', 'Incline Dumbbell Press', 'Decline Dumbbell Press',
    'Dumbbell Fly', 'Incline Dumbbell Fly',
    'Cable Crossover', 'High Cable Crossover', 'Low Cable Crossover',
    'Push Up', 'Weighted Push Up', 'Dips', 'Chest Press Machine', 'Pec Deck / Butterfly'
  ],
  'Sırt': [
    'Deadlift', 'Rack Pull',
    'Pull Up', 'Chin Up', 'Lat Pulldown (Wide Grip)', 'Lat Pulldown (Close Grip)',
    'Barbell Row', 'Pendlay Row', 'Dumbbell Row', 'T-Bar Row',
    'Seated Cable Row', 'Face Pull', 'Straight Arm Pulldown',
    'Shrugs', 'Back Extension', 'Hyperextension'
  ],
  'Bacak': [
    'Squat', 'Front Squat', 'Goblet Squat',
    'Leg Press', 'Hack Squat',
    'Lunge', 'Walking Lunge', 'Reverse Lunge',
    'Bulgarian Split Squat', 'Step Up',
    'Leg Extension', 'Leg Curl (Lying)', 'Leg Curl (Seated)',
    'Romanian Deadlift', 'Sumo Deadlift',
    'Calf Raise (Standing)', 'Calf Raise (Seated)'
  ],
  'Kalça (Glutes)': [
    'Hip Thrust', 'Glute Bridge', 'Cable Kickback', 'Abductor Machine'
  ],
  'Omuz': [
    'Overhead Press (Military Press)', 'Seated Dumbbell Press', 'Arnold Press',
    'Lateral Raise', 'Cable Lateral Raise',
    'Front Raise', 'Plate Front Raise',
    'Rear Delt Fly', 'Face Pull',
    'Upright Row', 'Shoulder Press Machine'
  ],
  'Ön Kol (Biceps)': [
    'Barbell Curl', 'EZ Bar Curl',
    'Dumbbell Curl', 'Hammer Curl', 'Incline Dumbbell Curl',
    'Concentration Curl', 'Preacher Curl', 'Cable Curl',
    'Reverse Curl', 'Zottman Curl'
  ],
  'Arka Kol (Triceps)': [
    'Tricep Pushdown (Rope)', 'Tricep Pushdown (Bar)',
    'Skullcrusher', 'Close Grip Bench Press',
    'Overhead Tricep Extension', 'Dumbbell Kickback',
    'Dips', 'Bench Dips'
  ],
  'Karın (Abs)': [
    'Plank', 'Crunch', 'Decline Crunch',
    'Leg Raise', 'Hanging Leg Raise',
    'Russian Twist', 'Bicycle Crunch',
    'Mountain Climber', 'Ab Wheel Rollout', 'Cable Crunch'
  ],
  'Kardiyo': [
    'Koşu Bandı (Hafif)', 'Koşu Bandı (HIIT)',
    'Bisiklet', 'Elliptical',
    'Kürek (Rowing)', 'İp Atlama', 'Merdiven'
  ]
};

// Helper: Format Date YYYY-MM-DD (Local)
const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Get Monday of the week for a given date
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const Workouts: React.FC<WorkoutsProps> = ({ logs, addLog, updateLog, program, setProgram, energyLogs = [], setDailyEnergy, personalRecords = [], setPersonalRecords, triggerConfetti, showNotification }) => {
  const [isSetupMode, setIsSetupMode] = useState(Object.keys(program).length === 0);

  // --- Date State ---
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Determine the week based on selectedDate
  const startOfWeek = getStartOfWeek(selectedDate);
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const changeWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.valueAsDate) {
      setSelectedDate(e.target.valueAsDate);
    }
  };

  // --- Setup Mode State ---
  const [setupDay, setSetupDay] = useState(DAYS[0]);
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(EXERCISE_DATABASE)[0]);
  const [selectedExercise, setSelectedExercise] = useState(EXERCISE_DATABASE[Object.keys(EXERCISE_DATABASE)[0]][0]);

  // Sync selectedDate with setupDay when in setup mode
  useEffect(() => {
    if (isSetupMode) {
      const dayIndex = (selectedDate.getDay() + 6) % 7;
      setSetupDay(DAYS[dayIndex]);
    }
  }, [selectedDate, isSetupMode]);

  // Derived state for current view
  const currentDayIndex = (selectedDate.getDay() + 6) % 7;
  const currentDayName = DAYS[currentDayIndex];
  const selectedDateStr = formatDateKey(selectedDate);
  const daysExercises = program[currentDayName] || [];

  // Static briefing - no API call needed
  const briefing = useMemo(() => {
    return getStaticBriefing(daysExercises);
  }, [daysExercises]);

  // --- Setup Mode Functions ---
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedExercise(EXERCISE_DATABASE[category][0]);
  };

  const addToProgram = () => {
    if (!selectedExercise) return;
    const currentExercises = program[setupDay] || [];
    if (currentExercises.includes(selectedExercise)) return;

    setProgram({
      ...program,
      [setupDay]: [...currentExercises, selectedExercise]
    });
  };

  const setRestDay = () => {
    setProgram({
      ...program,
      [setupDay]: [] // Empty array implies rest day
    });
  };

  const removeFromProgram = (day: string, index: number) => {
    const currentExercises = program[day] || [];
    const updated = currentExercises.filter((_, i) => i !== index);
    setProgram({ ...program, [day]: updated });
  };

  // --- Tracking Functions ---
  const handleAddSet = (exerciseName: string, weight: string, reps: string) => {
    if (!weight || !reps) return;

    const newWeight = parseFloat(weight);
    const newReps = parseFloat(reps);

    // PR Detection with new system
    if (setPersonalRecords && newReps >= 5) {
      const prCheck = checkNewPR(exerciseName, newWeight, newReps, personalRecords);

      if (prCheck.isNewWeightPR && triggerConfetti && showNotification) {
        const updatedPRs = updatePR(exerciseName, newWeight, newReps, personalRecords, selectedDateStr);
        setPersonalRecords(updatedPRs);

        setTimeout(() => {
          triggerConfetti();
          if (prCheck.weightIncrease > 0) {
            showNotification('🏆 YENİ PR!', `${exerciseName}: ${newWeight}kg (+${prCheck.weightIncrease}kg artış!)`, 'award');
          } else {
            showNotification('🔥 İLK REKOR!', `${exerciseName}: ${newWeight}kg x ${newReps} tekrar!`, 'award');
          }
        }, 300);
      } else if (prCheck.isNewVolumePR && !prCheck.isNewWeightPR && showNotification) {
        const updatedPRs = updatePR(exerciseName, newWeight, newReps, personalRecords, selectedDateStr);
        setPersonalRecords(updatedPRs);
        showNotification('⚡ Volume PR!', `${exerciseName}: ${newWeight}kg x ${newReps} = ${newWeight * newReps} hacim!`, 'info');
      }
    }

    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      date: selectedDateStr,
      exerciseName,
      sets: [{ weight: newWeight, reps: newReps }]
    };
    addLog(newLog);
  };

  const handleDeleteSet = (logId: string, setIndex: number, currentSets: WorkoutSet[]) => {
    const newSets = currentSets.filter((_, index) => index !== setIndex);
    updateLog(logId, newSets);
  };

  const CalendarHeader = () => (
    <div className="relative overflow-hidden bg-slate-800 dark:bg-slate-900 p-4 rounded-3xl shadow-2xl mb-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-500/20 rounded-full blur-2xl" />

      {/* Week Navigation */}
      <div className="relative flex items-center justify-between mb-4">
        <button
          onClick={() => changeWeek(-1)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
          <CalendarIcon size={18} className="text-slate-400" />
          <span className="text-white font-bold text-sm tracking-wide">
            {weekDates[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} — {weekDates[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </span>
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleDatePick}
          />
        </div>

        <button
          onClick={() => changeWeek(1)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Pills */}
      <div className="relative grid grid-cols-7 gap-2">
        {weekDates.map((date, idx) => {
          const isSelected = formatDateKey(date) === selectedDateStr;
          const isToday = formatDateKey(date) === formatDateKey(new Date());
          const hasWorkout = (program[DAYS[idx]] || []).length > 0;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`relative flex flex-col items-center py-3 px-1 rounded-2xl transition-all duration-300 ${isSelected
                ? 'bg-slate-600 shadow-lg shadow-slate-600/40 scale-105'
                : 'bg-white/5 hover:bg-white/10'
                }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-white/40'
                }`}>
                {DAYS[idx].slice(0, 2)}
              </span>
              <span className={`text-lg font-black mt-0.5 ${isSelected ? 'text-white' : 'text-white/70'
                }`}>
                {date.getDate()}
              </span>

              {/* Today indicator */}
              {isToday && (
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-400 animate-pulse'
                  }`} />
              )}

              {/* Has workout indicator */}
              {hasWorkout && !isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isSetupMode) {
    return (
      <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-6">
        {/* Header with Week Selector */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              🏋️ Program Oluştur
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Haftalık antrenman rutinini planla
            </p>
          </div>
          {/* Compact Week Selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[120px] text-center">
              {weekDates[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </div>
            <button
              onClick={() => changeWeek(1)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Setup Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">

          {/* Day Header */}
          <div className="bg-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <CalendarIcon size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-black text-lg">{setupDay}</h2>
                  <p className="text-white/70 text-xs">
                    {(program[setupDay] || []).length} egzersiz tanımlı
                  </p>
                </div>
              </div>
              <button
                onClick={setRestDay}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-all"
              >
                <Coffee size={16} />
                OFF Günü
              </button>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-1 p-3 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-800/50">
            {DAYS.map(day => {
              const isActive = setupDay === day;
              const hasExercises = (program[day] || []).length > 0;
              return (
                <button
                  key={day}
                  onClick={() => {
                    const dayIdx = DAYS.indexOf(day);
                    const currentWeekDay = weekDates[dayIdx];
                    setSelectedDate(currentWeekDay);
                    setSetupDay(day);
                  }}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  {day.slice(0, 3)}
                  {hasExercises && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Add Exercise Section */}
          <div className="p-4 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Kas Grubu</label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white transition-colors"
                  >
                    {Object.keys(EXERCISE_DATABASE).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Egzersiz</label>
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white transition-colors"
                  >
                    {EXERCISE_DATABASE[selectedCategory].map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={addToProgram}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold hover:shadow-lg hover:shadow-slate-700/30 transition-all active:scale-[0.98]"
              >
                <Plus size={20} />
                Programa Ekle
              </button>
            </div>

            {/* Exercise List */}
            <div className="space-y-2 min-h-[120px]">
              {(program[setupDay] || []).length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-3">
                    <Coffee className="text-orange-500" size={28} />
                  </div>
                  <h3 className="font-bold text-slate-600 dark:text-slate-400">Dinlenme Günü</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Bu gün için egzersiz planlanmamış</p>
                </div>
              ) : (
                (program[setupDay] || []).map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-700/30">
                      <Dumbbell size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 dark:text-white">{ex}</span>
                      <p className="text-xs text-slate-400">{idx + 1}. sıra</p>
                    </div>
                    <button
                      onClick={() => removeFromProgram(setupDay, idx)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => setIsSetupMode(false)}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-slate-700/30 transition-all active:scale-[0.98]"
        >
          ✓ Kaydet ve Başla
        </button>
      </div>
    );
  }

  // --- Main Tracker UI ---

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            💪 Antrenman
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {currentDayName} • {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Energy Selector */}
          {setDailyEnergy && (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 flex items-center gap-0.5">
              {[
                { level: 'low', emoji: '😴' },
                { level: 'medium', emoji: '😐' },
                { level: 'high', emoji: '💪' },
                { level: 'excellent', emoji: '🔥' }
              ].map(({ level, emoji }) => {
                const currentEnergy = energyLogs.find(l => l.date === selectedDateStr);
                const isSelected = currentEnergy?.energy === level;
                return (
                  <button
                    key={level}
                    onClick={() => setDailyEnergy(selectedDateStr, level as 'low' | 'medium' | 'high' | 'excellent')}
                    className={`text-xl p-2 rounded-xl transition-all duration-200 ${isSelected
                      ? 'bg-white dark:bg-slate-700 shadow-md scale-110'
                      : 'opacity-40 hover:opacity-100'
                      }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}
          {/* Settings Button */}
          <button
            onClick={() => setIsSetupMode(true)}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <Settings size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <CalendarHeader />

      {/* Briefing Card - Redesigned */}
      {daysExercises.length > 0 && (
        <div className="relative overflow-hidden bg-slate-700 p-5 rounded-3xl shadow-xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />

          <div className="relative flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <BookOpen size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-lg mb-1">Koç Notu 📋</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {briefing}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exercises List */}
      <div className="space-y-4">
        {daysExercises.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Coffee className="text-orange-500" size={36} />
            </div>
            <h3 className="text-slate-800 dark:text-white font-black text-xl">{currentDayName}</h3>
            <p className="text-lg font-medium text-orange-500 mt-1">Dinlenme Günü</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-xs mx-auto">
              Bugün için planlanmış antrenman yok. İyi dinlen! 😴
            </p>
          </div>
        ) : (
          daysExercises.map((exerciseName, idx) => {
            const todaysLog = logs.find(l =>
              l.date === selectedDateStr && l.exerciseName === exerciseName
            );

            const history = logs
              .filter(l => l.exerciseName === exerciseName && l.date < selectedDateStr)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const lastSession = history[0];

            return (
              <ExerciseTrackerCard
                key={`${exerciseName}-${selectedDateStr}`}
                exerciseName={exerciseName}
                todaysLog={todaysLog}
                lastSession={lastSession}
                onAddSet={(w, r) => handleAddSet(exerciseName, w, r)}
                onDeleteSet={(setIdx) => todaysLog && handleDeleteSet(todaysLog.id, setIdx, todaysLog.sets)}
              />
            );
          })
        )}
      </div>

      {/* Personal Records Card */}
      {personalRecords.length > 0 && (
        <PRCard personalRecords={personalRecords} />
      )}
    </div>
  );
};

// --- Sub-component for individual exercise card ---

interface ExerciseTrackerCardProps {
  exerciseName: string;
  todaysLog?: WorkoutLog;
  lastSession?: WorkoutLog;
  onAddSet: (w: string, r: string) => void;
  onDeleteSet: (index: number) => void;
}

const ExerciseTrackerCard: React.FC<ExerciseTrackerCardProps> = ({
  exerciseName,
  todaysLog,
  lastSession,
  onAddSet,
  onDeleteSet
}) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const weightInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSet(weight, reps);
    setWeight('');
    setReps('');
    if (weightInputRef.current) {
      weightInputRef.current.focus();
    }
  };

  return (
    <div className="relative p-5 rounded-3xl transition-all duration-300 group
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      border border-white/30 dark:border-slate-700/50
      shadow-[0_8px_32px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgb(0,0,0,0.3)]
      hover:shadow-[0_16px_48px_rgb(249,115,22,0.15)] dark:hover:shadow-[0_16px_48px_rgb(249,115,22,0.25)]
      hover:-translate-y-1">

      {/* Neon glow line - top edge */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-slate-500 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          {/* 3D Float Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-slate-500/30 dark:bg-slate-400/20 rounded-2xl blur-xl transform scale-125" />
            <div className="relative bg-slate-600 dark:bg-slate-700 p-3.5 rounded-2xl 
              shadow-lg shadow-slate-600/40 
              group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Dumbbell size={22} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{exerciseName}</h3>
            {lastSession && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Son ({lastSession.date.slice(5)}): {lastSession.sets.map(s => `${s.weight}kg`).join(', ')}
              </p>
            )}
          </div>
        </div>
        {/* Set count badge */}
        {todaysLog && todaysLog.sets.length > 0 && (
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full">
            {todaysLog.sets.length} set
          </div>
        )}
      </div>

      {/* Sets List - Chip Style */}
      {todaysLog && todaysLog.sets.length > 0 && (
        <div className="mb-4 space-y-2">
          {todaysLog.sets.map((set, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl
              bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-sm
              border border-slate-200/60 dark:border-slate-700/60
              hover:bg-slate-100/60 dark:hover:bg-slate-700/30
              hover:border-slate-300 dark:hover:border-slate-600
              transition-all duration-200 group/set">

              {/* Set number - Pill Badge */}
              <span className="flex items-center justify-center w-8 h-8 rounded-full 
                bg-slate-200 dark:bg-slate-700 
                text-slate-600 dark:text-slate-300 
                text-xs font-black
                group-hover/set:bg-slate-600 group-hover/set:text-white
                transition-colors duration-200">{i + 1}</span>

              {/* Weight and reps - Large, bold */}
              <div className="flex-1 flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-800 dark:text-white">{set.weight}</span>
                  <span className="text-xs text-slate-400 font-medium">kg</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600 text-lg">×</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-800 dark:text-white">{set.reps}</span>
                  <span className="text-xs text-slate-400 font-medium">rep</span>
                </div>
              </div>

              <button
                onClick={() => onDeleteSet(i)}
                className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 
                  hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl
                  transition-all duration-200"
                title="Bu seti sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Set Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-[10px] uppercase text-slate-400 font-bold ml-1 tracking-wide">Ağırlık (kg)</label>
          <input
            ref={weightInputRef}
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl
              bg-slate-100/90 dark:bg-slate-800/90
              border-2 border-transparent
              focus:border-slate-500 focus:bg-white dark:focus:bg-slate-900
              font-bold text-slate-800 dark:text-white text-lg
              placeholder-slate-400
              transition-all duration-200
              focus:ring-4 focus:ring-slate-500/20 focus:outline-none"
            placeholder={lastSession ? String(lastSession.sets[0]?.weight || 0) : "0"}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase text-slate-400 font-bold ml-1 tracking-wide">Tekrar</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl
              bg-slate-100/90 dark:bg-slate-800/90
              border-2 border-transparent
              focus:border-slate-500 focus:bg-white dark:focus:bg-slate-900
              font-bold text-slate-800 dark:text-white text-lg
              placeholder-slate-400
              transition-all duration-200
              focus:ring-4 focus:ring-slate-500/20 focus:outline-none"
            placeholder="10"
          />
        </div>
        <button
          type="submit"
          disabled={!weight || !reps}
          className="relative overflow-hidden bg-slate-600 text-white p-4 rounded-2xl
            shadow-lg shadow-slate-600/40
            hover:shadow-xl hover:shadow-slate-600/50 hover:bg-slate-500
            active:scale-95 
            disabled:opacity-40 disabled:bg-slate-400 disabled:shadow-none
            transition-all duration-200"
        >
          <Plus size={22} className="relative z-10" />
        </button>
      </form >
    </div >
  );
};

export default Workouts;