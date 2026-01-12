import { DailySuggestion, Macros } from "../types";
import { FOODS, searchFoods, findFood, calculateMacros } from "../data/foods";
import { getRandomMealSuggestion, getRandomHealthTip, getRandomMusic } from "../data/suggestions";

interface AnalysisResult {
  macros: Macros;
  correctedName: string;
  isValidFood: boolean;
  error?: string;
}

// Replace API call with local database lookup
export const getDailyMealSuggestion = async (
  preferences: string = "dengeli beslenme",
  weatherContext?: { city: string, temp: number, condition: string }
): Promise<DailySuggestion> => {
  // Return random suggestion from local data
  const suggestion = getRandomMealSuggestion();

  // Add weather warning if context provided
  if (weatherContext) {
    const { temp, condition } = weatherContext;
    let weatherWarning = "";

    if (temp < 10) {
      weatherWarning = "Soğuk hava! Sıcak içecekler ve bol C vitamini tüket.";
    } else if (temp > 30) {
      weatherWarning = "Sıcak hava! Bol su iç ve hafif yemekler tercih et.";
    } else if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("yağmur")) {
      weatherWarning = "Yağmurlu hava. Sıcak çorba ve çay içmeyi unutma.";
    } else {
      weatherWarning = "Harika bir gün! Aktiviteni artır ve sağlıklı beslen.";
    }

    return { ...suggestion, weatherWarning };
  }

  return suggestion;
};

// Replace API call with local food database
export const analyzeFoodItem = async (foodDescription: string): Promise<AnalysisResult> => {
  // Parse quantity and food name
  const parts = foodDescription.trim().split(' ');
  let quantity = 1;
  let unit = 'adet';
  let foodName = foodDescription;

  // Try to extract quantity
  if (parts.length >= 2) {
    const firstPart = parseFloat(parts[0]);
    if (!isNaN(firstPart)) {
      quantity = firstPart;

      // Check if second part is a unit
      const possibleUnit = parts[1].toLowerCase();
      if (['adet', 'gram', 'porsiyon', 'dilim'].includes(possibleUnit)) {
        unit = possibleUnit;
        foodName = parts.slice(2).join(' ');
      } else {
        foodName = parts.slice(1).join(' ');
      }
    }
  }

  // Search in local database (with fuzzy matching built-in)
  const food = findFood(foodName);

  if (!food) {
    return {
      correctedName: foodName,
      isValidFood: false,
      macros: { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
      error: `"${foodName}" veritabanında bulunamadı. Lütfen yemek ismini kontrol edin.`
    };
  }

  // Calculate macros based on quantity and unit
  const macros = calculateMacros(food, quantity, unit);

  return {
    correctedName: food.name,
    isValidFood: true,
    macros
  };
};

// Not used anymore, can be removed or kept for future image feature
export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  return {
    correctedName: "Fotoğraftan yemek tanıma özelliği şu an kullanılamıyor",
    isValidFood: false,
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
    error: "Fotoğraftan yemek tanıma özelliği geçici olarak devre dışı."
  };
};

// Local autocomplete from food database
export const getFoodSuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) return [];
  return searchFoods(query, 8);
};

// Simple math-based advice instead of AI
export const getMonthlyAnalysisAdvice = async (
  avgProtein: number,
  targetProtein: number,
  weight: number
): Promise<string> => {
  const percentage = (avgProtein / targetProtein) * 100;

  if (percentage >= 100) {
    return "Mükemmel! Protein hedefine ulaşıyorsun. Böyle devam et!";
  } else if (percentage >= 80) {
    return "İyi gidiyorsun! Biraz daha gayret göstererek hedefe ulaşabilirsin.";
  } else if (percentage >= 60) {
    return `Hedefinin %${Math.round(percentage)}'ine ulaştın. Protein alımını artırmaya çalış.`;
  } else {
    return "Protein alımın düşük. Her öğüne protein kaynaklarını eklemeyi dene.";
  }
};

// Simple percentage-based analysis
export const getWorkoutProgressAnalysis = async (comparisonData: string): Promise<string> => {
  // Parse comparison data if needed, for now just return motivational message
  if (comparisonData.includes("artış") || comparisonData.includes("yükseldi")) {
    return "Harika gelişim gösteriyorsun! Ağırlıkların artması kas gelişiminin işareti. Böyle devam et!";
  } else if (comparisonData.includes("düşüş") || comparisonData.includes("azaldı")) {
    return "Son haftalarda performansın düştü. Dinlenmeye mi ihtiyacın var yoksa daha fazla protein mi almalısın?";
  } else {
    return "Performansını stabil tutuyorsun. Yavaş yavaş ağırlıkları artırmayı deneyebilirsin.";
  }
};

// Simple static messages
export const getWorkoutBriefing = async (exercises: string[]): Promise<string> => {
  if (exercises.length === 0) return "";

  return "Isınma: 5-10 dakika hafif kardyo yap. Form: Hareketleri yavaş ve kontrollü şekilde yap, sakatlık riskini azaltır.";
};

// Types for backwards compatibility (no longer used but kept to avoid breaking changes)
export interface ChefRecipe {
  name: string;
  description: string;
  prepTime: string;
  calories: number;
  ingredients: string[];
}

export const generateRecipeFromIngredients = async (ingredients: string, goal: string): Promise<ChefRecipe> => {
  throw new Error("Bu özellik artık kullanılamıyor.");
};

export interface CravingAlternative {
  alternative: string;
  reason: string;
  calories: number;
}

export const getHealthyAlternative = async (craving: string): Promise<CravingAlternative> => {
  throw new Error("Bu özellik artık kullanılamıyor.");
};