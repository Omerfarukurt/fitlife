import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import InstallPWA from './components/InstallPWA';
import Dashboard from './pages/Dashboard';
import Nutrition from './pages/Nutrition';
import Analysis from './pages/Analysis';
import Workouts from './pages/Workouts';
import { UserProfile, MealLog, WorkoutLog, WeeklyProgram, WorkoutSet, WeightLog, DailyEnergy, PersonalRecord } from './types';
import { X, CheckCircle, Info, Trophy, Sparkles } from 'lucide-react';

// --- Constants ---
const DEFAULT_USER: UserProfile = {
  name: 'Misafir', surname: '', age: 25, weight: 70, height: 175, goal: 'gain', targetCalories: 2500, trainingFrequency: 3, trainingDuration: 45, trainingIntensity: 'medium', usesCreatine: false
};
const DEFAULT_PROGRAM: WeeklyProgram = {};

// --- Components for Notifications & Effects ---

const Confetti = () => {
  const [particles, setParticles] = useState<{ x: number, y: number, color: string, speedX: number, speedY: number }[]>([]);

  useEffect(() => {
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    const p = Array.from({ length: 50 }).map(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 15,
      speedY: (Math.random() - 0.5) * 15,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.speedX,
        y: p.y + p.speedY,
        speedY: p.speedY + 0.5, // gravity
      })).filter(p => p.y < window.innerHeight));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
};

const NotificationToast = ({ title, message, type, onClose }: { title: string, message: string, type: 'success' | 'info' | 'award', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-500',
    info: 'bg-indigo-500',
    award: 'bg-gradient-to-r from-amber-400 to-orange-500'
  };

  const icons = {
    success: <CheckCircle className="text-white" size={24} />,
    info: <Info className="text-white" size={24} />,
    award: <Trophy className="text-white" size={24} />
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[99] animate-bounce-short">
      <div className={`${bgColors[type]} rounded-2xl p-4 shadow-xl flex items-start gap-3 text-white`}>
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
          {icons[type]}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg">{title}</h4>
          <p className="text-white/90 text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  // --- THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply Theme Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // --- NOTIFICATION STATE ---
  const [notification, setNotification] = useState<{ title: string, message: string, type: 'success' | 'info' | 'award' } | null>(null);
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  const showNotification = useCallback((title: string, message: string, type: 'success' | 'info' | 'award' = 'info') => {
    setNotification({ title, message, type });
  }, []);

  const triggerConfetti = useCallback(() => {
    setIsConfettiActive(true);
    setTimeout(() => setIsConfettiActive(false), 3000);
  }, []);

  // --- Default State (Reset on Reload) ---
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [weeklyProgram, setWeeklyProgram] = useState<WeeklyProgram>(DEFAULT_PROGRAM);
  const [energyLogs, setEnergyLogs] = useState<DailyEnergy[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);

  // Force reset on mount
  useEffect(() => {
    console.log("App mounted. Clearing storage for fresh session.");
    localStorage.clear();
  }, []);


  // --- No Persistence Effects ---


  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setWeightLogs(prev => {
      const existing = prev.find(l => l.date === today);
      if (existing && existing.weight === user.weight) return prev;
      const others = prev.filter(l => l.date !== today);
      return [...others, { date: today, weight: user.weight }].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, [user.weight]);

  const addMealLog = (log: MealLog) => setMealLogs(prev => [...prev, log]);
  const deleteMealLog = (logId: string) => setMealLogs(prev => prev.filter(l => l.id !== logId));



  const addWorkoutLog = (newLog: WorkoutLog) => {
    setWorkoutLogs(prev => {
      const existingIndex = prev.findIndex(l => l.date === newLog.date && l.exerciseName === newLog.exerciseName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], sets: [...updated[existingIndex].sets, ...newLog.sets] };
        return updated;
      } else {
        return [...prev, newLog];
      }
    });
  };

  const updateWorkoutLog = (logId: string, newSets: WorkoutSet[]) => {
    setWorkoutLogs(prev => {
      if (newSets.length === 0) return prev.filter(l => l.id !== logId);
      return prev.map(l => l.id === logId ? { ...l, sets: newSets } : l);
    });
  };

  const setDailyEnergy = (date: string, energy: 'low' | 'medium' | 'high' | 'excellent') => {
    setEnergyLogs(prev => {
      const existing = prev.find(l => l.date === date);
      if (existing) {
        return prev.map(l => l.date === date ? { ...l, energy } : l);
      } else {
        return [...prev, { date, energy }];
      }
    });
  };



  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">

        {isConfettiActive && <Confetti />}
        {notification && (
          <NotificationToast
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                user={user} setUser={setUser} logs={mealLogs} workoutLogs={workoutLogs}
                weeklyProgram={weeklyProgram}
                isDarkMode={isDarkMode} toggleTheme={toggleTheme}
                showNotification={showNotification} triggerConfetti={triggerConfetti}
              />
            }
          />
          <Route
            path="/nutrition"
            element={
              <Nutrition
                logs={mealLogs} addLog={addMealLog} deleteLog={deleteMealLog} user={user}
                isDarkMode={isDarkMode} toggleTheme={toggleTheme}
                showNotification={showNotification} triggerConfetti={triggerConfetti}
              />
            }
          />
          <Route
            path="/workouts"
            element={
              <Workouts
                logs={workoutLogs} addLog={addWorkoutLog} updateLog={updateWorkoutLog}
                program={weeklyProgram} setProgram={setWeeklyProgram}
                energyLogs={energyLogs} setDailyEnergy={setDailyEnergy}
                personalRecords={personalRecords} setPersonalRecords={setPersonalRecords}
                isDarkMode={isDarkMode} toggleTheme={toggleTheme}
                showNotification={showNotification} triggerConfetti={triggerConfetti}
              />
            }
          />
          <Route
            path="/analysis"
            element={
              <Analysis
                logs={mealLogs}
                workoutLogs={workoutLogs}
                user={user}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                showNotification={showNotification}
                triggerConfetti={triggerConfetti}
              />
            }
          />

        </Routes>
        <Navigation isDarkMode={isDarkMode} />
        <InstallPWA />
      </div>
    </Router>
  );
};

export default App;