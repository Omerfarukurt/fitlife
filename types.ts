
export interface UserProfile {
  name: string;
  surname?: string;
  age?: number;
  weight: number; // in kg
  height: number; // in cm
  goal: 'loss' | 'gain' | 'maintain';
  targetCalories: number;
  // Hydration & Activity Specs
  trainingFrequency?: number; // Days per week (0-7)
  trainingDuration?: number; // Minutes per session
  trainingIntensity?: 'low' | 'medium' | 'high';
  usesCreatine?: boolean; // Creatine increases water need
  customWaterTarget?: number; // Manual override for water target
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export interface MealLog {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  foodName: string;
  macros: Macros;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface MusicRecommendation {
  track: string;
  artist: string;
  mood: string;
}

export interface DailySuggestion {
  breakfast: string;
  lunch: string;
  dinner: string;
  tip: string;
  weatherWarning?: string;
  music?: MusicRecommendation;
}

export interface WeeklyProgram {
  [key: string]: string[];
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;      // En yüksek tek ağırlık (kg)
  maxVolume: number;      // En yüksek hacim (weight × reps)
  maxVolumeWeight: number; // Max volume'daki ağırlık
  maxVolumeReps: number;   // Max volume'daki tekrar
  date: string;           // Rekor tarihi
  previousMax?: number;   // Önceki max weight (artışı göstermek için)
}

export interface WeightLog {
  date: string;
  weight: number;
}

export interface DailyEnergy {
  date: string; // YYYY-MM-DD
  energy: 'low' | 'medium' | 'high' | 'excellent';
}

// Global Props shared across pages
export interface GlobalProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  showNotification: (title: string, message: string, type?: 'success' | 'info' | 'award') => void;
  triggerConfetti: () => void;
  energyLogs?: DailyEnergy[];
  setDailyEnergy?: (date: string, energy: 'low' | 'medium' | 'high' | 'excellent') => void;
}

// --- Helper: Calculate Macro Targets based on Goal & Weight ---
export const calculateMacroTargets = (user: UserProfile): Macros => {
  // Default to 70kg if 0/undefined to avoid zero division/multiplication issues
  const weight = user.weight > 0 ? user.weight : 70;

  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let sugar = 0;

  if (user.goal === 'loss') {
    // Kilo Vermek (Loss)
    protein = weight * 1.9;
    carbs = weight * 2.5;
    fat = weight * 0.7;
    sugar = 25;
  } else if (user.goal === 'gain') {
    // Kilo Almak (Gain)
    protein = weight * 2.0;
    carbs = weight * 4.8;
    fat = weight * 1.0;
    sugar = 40;
  } else {
    // Formu Korumak (Maintain)
    protein = weight * 1.75;
    carbs = weight * 3.75;
    fat = weight * 0.9;
    sugar = 35;
  }

  // Round values
  protein = Math.round(protein);
  carbs = Math.round(carbs);
  fat = Math.round(fat);

  const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);

  return {
    calories: calculatedCalories,
    protein,
    carbs,
    fat,
    sugar
  };
};

// --- Scientific Water Calculator (Range) ---
export const calculateWaterTarget = (user: UserProfile): { min: number, max: number, isCustom: boolean } => {
  // 0. Check Custom Override
  if (user.customWaterTarget && user.customWaterTarget > 0) {
    return { min: user.customWaterTarget, max: user.customWaterTarget, isCustom: true };
  }

  const weight = user.weight || 70;

  // 1. Base Need Range: 30ml - 38ml per kg
  let minMl = weight * 30;
  let maxMl = weight * 38;

  // 2. Activity Adder (Weekly avg distributed daily)
  const freq = user.trainingFrequency || 3;
  const duration = user.trainingDuration || 60; // minutes
  const intensity = user.trainingIntensity || 'medium';

  let intensityFactor = 8; // ml per minute for low
  if (intensity === 'medium') intensityFactor = 12;
  if (intensity === 'high') intensityFactor = 16;

  const weeklyActivityWaterLoss = duration * intensityFactor * freq;
  const dailyActivityAdder = weeklyActivityWaterLoss / 7;

  minMl += dailyActivityAdder;
  maxMl += dailyActivityAdder;

  // 3. Creatine Adder
  // Creatine draws water into muscle cells. +800ml is a good baseline to add to both ranges.
  if (user.usesCreatine) {
    minMl += 800;
    maxMl += 800;
  }

  // Convert to Liters, round to 1 decimal
  return {
    min: Math.round(minMl / 100) / 10,
    max: Math.round(maxMl / 100) / 10,
    isCustom: false
  };
};

export const getGoalLabel = (goal: string) => {
  switch (goal) {
    case 'loss': return 'Kilo Vermek & Yağ Yakmak';
    case 'gain': return 'Kilo Almak & Kas Yapmak';
    case 'maintain': return 'Formu Korumak';
    default: return 'Belirsiz';
  }
}