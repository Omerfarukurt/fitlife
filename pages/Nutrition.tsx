import React, { useState, useEffect, useRef } from 'react';
import { MealLog, UserProfile, calculateMacroTargets, GlobalProps } from '../types';
import { analyzeFoodItem, getFoodSuggestions } from '../services/geminiService';
import { Plus, Loader2, PieChart, AlertCircle, Search, Scale, X, Trash2, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';

interface NutritionProps extends GlobalProps {
    logs: MealLog[];
    addLog: (log: MealLog) => void;
    deleteLog: (logId: string) => void;
    user: UserProfile;
}

const Nutrition: React.FC<NutritionProps> = ({ logs, addLog, deleteLog, user, isDarkMode, showNotification }) => {
    // --- View State ---
    // Default to today
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Form State
    const [foodInput, setFoodInput] = useState('');
    const [quantity, setQuantity] = useState<string>('1');
    const [unit, setUnit] = useState<string>('adet');

    // UI/Logic State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isSelectionRef = useRef(false);

    // Static list for quick access
    const FREQUENT_FOODS = ["Yumurta", "Tavuk", "Pilav", "Yulaf", "Muz", "Peynir", "Zeytin", "Kahve"];

    // Optimized Suggestion Logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (isSelectionRef.current) {
                isSelectionRef.current = false;
                return;
            }
            if (foodInput.length < 3) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            setLoadingSuggestions(true);
            try {
                const results = await getFoodSuggestions(foodInput);
                if (foodInput.length >= 3) {
                    setSuggestions(results);
                    setShowSuggestions(true);
                }
            } catch (e) {
                // Silent fail
            } finally {
                setLoadingSuggestions(false);
            }
        };
        const timer = setTimeout(fetchSuggestions, 1000);
        return () => clearTimeout(timer);
    }, [foodInput]);

    // Filter logs for SELECTED DATE
    const selectedDateLogs = logs.filter(l => l.date === selectedDate);

    // Calculate totals
    const totals = selectedDateLogs.reduce((acc, curr) => ({
        calories: acc.calories + curr.macros.calories,
        protein: acc.protein + curr.macros.protein,
        carbs: acc.carbs + curr.macros.carbs,
        fat: acc.fat + curr.macros.fat,
        sugar: acc.sugar + (curr.macros.sugar || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });

    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayLogs = logs.filter(l => l.date === yesterdayStr);
    const yesterdayTotals = yesterdayLogs.reduce((acc, curr) => ({
        calories: acc.calories + curr.macros.calories,
        protein: acc.protein + curr.macros.protein,
        carbs: acc.carbs + curr.macros.carbs,
        fat: acc.fat + curr.macros.fat,
        sugar: acc.sugar + (curr.macros.sugar || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });

    const targets = calculateMacroTargets(user);

    const changeDate = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) setSelectedDate(e.target.value);
    }

    const handleAddFood = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!foodInput.trim()) return;
        if (!quantity || parseFloat(quantity) <= 0) {
            setErrorMsg("Lütfen geçerli bir miktar girin.");
            return;
        }

        setAnalyzing(true);
        setErrorMsg(null);
        setShowSuggestions(false);

        const finalQuery = `${quantity} ${unit} ${foodInput}`;

        try {
            const result = await analyzeFoodItem(finalQuery);

            if (!result.isValidFood) {
                setErrorMsg(result.error || "Bu geçerli bir yiyecek gibi görünmüyor. Lütfen tekrar dene.");
                setAnalyzing(false);
                return;
            }

            const newLog: MealLog = {
                id: Date.now().toString(),
                date: selectedDate,
                foodName: result.correctedName,
                macros: result.macros,
                mealType: mealType
            };

            addLog(newLog);

            // Check for specific badges or completions here if needed immediately
            // For simplicity, visual effects are handled in MacroCards based on totals

            isSelectionRef.current = true;
            setFoodInput('');
            setQuantity('1');
            setUnit('adet');
            setSuggestions([]);
            setShowSuggestions(false);
        } catch (err) {
            setErrorMsg("Bağlantı hatası oluştu. Lütfen tekrar dene.");
        } finally {
            setAnalyzing(false);
        }
    };

    const selectSuggestion = (suggestion: string) => {
        isSelectionRef.current = true;
        setFoodInput(suggestion);
        setShowSuggestions(false);
    };



    const pieData = [
        { name: 'Protein', value: totals.protein, color: '#4f46e5' },
        { name: 'Karb', value: totals.carbs, color: '#10b981' },
        { name: 'Yağ', value: totals.fat, color: '#f59e0b' },
        { name: 'Şeker', value: totals.sugar, color: '#ec4899' },
    ].filter(d => d.value > 0);

    const mealTypeLabels: Record<string, string> = {
        breakfast: 'Kahvaltı',
        lunch: 'Öğle',
        dinner: 'Akşam',
        snack: 'Atıştırmalık'
    };

    const units = ['adet', 'gram', 'porsiyon', 'dilim'];

    return (
        <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Beslenme Takibi</h1>
            </div>

            {/* Date Navigation */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <button onClick={() => changeDate(-1)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2 relative group cursor-pointer">
                    <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-gray-700 dark:text-slate-200 text-sm">
                        {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateInput}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>

                <button onClick={() => changeDate(1)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                    <ChevronRight size={20} />
                </button>
            </div>



            {/* Input Section - Modern Card Design */}
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-700 relative z-20 transition-all hover:shadow-xl">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />

                <form onSubmit={handleAddFood} className="space-y-5 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Plus size={18} className="text-white" />
                            </div>
                            Yeni Besin Ekle
                        </h3>
                    </div>

                    {/* Row 1: Food Name Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ne yedin?</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={foodInput}
                                onChange={(e) => {
                                    setFoodInput(e.target.value);
                                    if (errorMsg) setErrorMsg(null);
                                }}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                onBlur={() => {
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                                placeholder="Örn: Haşlanmış Yumurta, Tavuk Pilav..."
                                className={`w-full border-2 rounded-xl p-4 pl-12 text-base font-medium focus:outline-none focus:ring-4 transition-all dark:bg-slate-800 dark:text-white ${errorMsg ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-900/40' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-200 dark:focus:ring-orange-900/40'}`}
                                disabled={analyzing}
                                autoComplete="off"
                            />
                            <Search className={`absolute left-4 top-4 ${errorMsg ? 'text-red-400' : 'text-slate-400'}`} size={20} />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                                    {loadingSuggestions && (
                                        <div className="p-3 text-xs text-slate-400 flex items-center gap-2 bg-slate-50 dark:bg-slate-900">
                                            <Loader2 size={14} className="animate-spin" /> Öneriler yükleniyor...
                                        </div>
                                    )}
                                    {suggestions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="px-4 py-3.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 border-b last:border-0 border-slate-100 dark:border-slate-700 flex items-center gap-3 transition-colors group"
                                            onClick={() => selectSuggestion(item)}
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Search size={14} className="text-orange-600 dark:text-orange-400" />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Add (Popular Foods) */}
                        <div className="mt-4">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-2">Sık Tüketilenler</span>
                            <div className="flex gap-2 flex-wrap">
                                {FREQUENT_FOODS.map((food, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setFoodInput(food);
                                            isSelectionRef.current = true;
                                        }}
                                        className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-400 transition-all hover:scale-105 hover:shadow-md"
                                    >
                                        {food}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Quantity & Unit - Modern Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">Miktar</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl p-3.5 text-center text-lg font-black focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/40 focus:border-orange-500 transition-all"
                                    placeholder="1"
                                    min="0"
                                    step="0.1"
                                />
                                <Scale className="absolute right-3 top-4 text-slate-300 dark:text-slate-600" size={16} />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">Birim</label>
                            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex gap-1 h-[54px]">
                                {units.map((u) => (
                                    <button
                                        key={u}
                                        type="button"
                                        onClick={() => setUnit(u)}
                                        className={`flex-1 rounded-lg text-xs font-black capitalize transition-all ${unit === u
                                            ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Meal Type & Submit - Redesigned */}
                    <div className="pt-2 space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">Öğün Türü</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setMealType(type as any)}
                                        className={`px-3 py-2.5 rounded-xl text-xs font-black capitalize transition-all ${mealType === type
                                            ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
                                            }`}
                                    >
                                        {mealTypeLabels[type]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={analyzing || !foodInput}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-black text-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    Analiz Ediliyor...
                                </>
                            ) : (
                                <>
                                    <Plus size={24} />
                                    Besini Ekle
                                </>
                            )}
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm animate-fade-in bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border-2 border-red-200 dark:border-red-800">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{errorMsg}</span>
                        </div>
                    )}
                </form>
            </div>

            {/* Daily Summary */}
            <div className="grid grid-cols-2 gap-4">
                {/* Macros Chart */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[160px] relative z-10 transition-colors">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Makro Dağılımı</h3>
                    <p className="text-[10px] text-gray-400 mb-2 text-center w-full block">
                        {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </p>
                    {totals.calories > 0 ? (
                        <div className="h-24 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={40}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#ccc', color: isDarkMode ? '#fff' : '#000' }} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-gray-300 dark:text-slate-600 flex flex-col items-center">
                            <PieChart size={32} />
                            <span className="text-xs mt-1">Veri yok</span>
                        </div>
                    )}
                </div>

                {/* Totals Grid with Progress Bars */}
                <div className="grid grid-cols-1 gap-2">
                    <MacroCard
                        label="Kalori"
                        value={Math.round(totals.calories)}
                        prevValue={Math.round(yesterdayTotals.calories)}
                        target={targets.calories}
                        unit="kcal"
                        color="text-gray-800 dark:text-gray-200"
                        bgBar="bg-gray-100 dark:bg-slate-700"
                        fillBar="bg-gray-800 dark:bg-slate-300"
                    />
                    <div className="grid grid-cols-2 gap-1">
                        <MacroCard
                            label="Prot."
                            value={Math.round(totals.protein)}
                            prevValue={Math.round(yesterdayTotals.protein)}
                            target={targets.protein}
                            unit="g"
                            color="text-indigo-600 dark:text-indigo-400"
                            bgBar="bg-indigo-100 dark:bg-indigo-900/30"
                            fillBar="bg-indigo-600 dark:bg-indigo-500"
                        />
                        <MacroCard
                            label="Karb"
                            value={Math.round(totals.carbs)}
                            prevValue={Math.round(yesterdayTotals.carbs)}
                            target={targets.carbs}
                            unit="g"
                            color="text-emerald-600 dark:text-emerald-400"
                            bgBar="bg-emerald-100 dark:bg-emerald-900/30"
                            fillBar="bg-emerald-600 dark:bg-emerald-500"
                        />
                        <MacroCard
                            label="Yağ"
                            value={Math.round(totals.fat)}
                            prevValue={Math.round(yesterdayTotals.fat)}
                            target={targets.fat}
                            unit="g"
                            color="text-amber-500 dark:text-amber-400"
                            bgBar="bg-amber-100 dark:bg-amber-900/30"
                            fillBar="bg-amber-500 dark:bg-amber-500"
                        />
                        <MacroCard
                            label="Şeker"
                            value={Math.round(totals.sugar)}
                            prevValue={Math.round(yesterdayTotals.sugar)}
                            target={targets.sugar}
                            unit="g"
                            color="text-pink-500 dark:text-pink-400"
                            bgBar="bg-pink-100 dark:bg-pink-900/30"
                            fillBar="bg-pink-500 dark:bg-pink-500"
                        />
                    </div>
                </div>
            </div>

            {/* Food List */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {selectedDate === new Date().toISOString().split('T')[0] ? 'Bugünkü' : new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) + ' Tarihli'} Öğünler
                </h2>
                {selectedDateLogs.length === 0 && (
                    <p className="text-gray-400 text-center py-8">Bu tarihte henüz öğün girilmedi.</p>
                )}
                {[...selectedDateLogs].reverse().map((log) => (
                    <div key={log.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 flex justify-between items-center shadow-sm group transition-colors">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white capitalize">{log.foodName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{mealTypeLabels[log.mealType]}</p>

                            <div className="mt-1 flex gap-2 text-[10px]">
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">P:{log.macros.protein}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">K:{log.macros.carbs}</span>
                                <span className="text-amber-500 dark:text-amber-400 font-medium">Y:{log.macros.fat}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                <div className="font-bold text-gray-800 dark:text-white text-sm">{log.macros.calories}</div>
                                <div className="text-[10px]">kcal</div>
                            </div>

                            <button
                                onClick={() => deleteLog(log.id)}
                                className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Sil"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MacroCard = ({ label, value, prevValue, target, unit, color, bgBar, fillBar }: any) => {
    const percent = target ? Math.min(100, (value / target) * 100) : 0;
    const diff = prevValue !== undefined ? value - prevValue : 0;
    const isCompleted = percent >= 100;

    return (
        <div className={`bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all ${isCompleted ? 'animate-pulse-fast ring-1 ring-emerald-400' : ''}`}>
            {isCompleted && <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/10 pointer-events-none"></div>}

            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">{label}</span>
                    <div className={`font-bold text-xs mt-0.5 ${color}`}>
                        {value}{target && <span className="text-[9px] text-gray-400 dark:text-gray-500">/{target}</span>}<span className="text-[9px] text-gray-400 dark:text-gray-500 ml-0.5">{unit}</span>
                    </div>
                </div>
                {diff !== 0 && (
                    <div className={`flex items-center text-[8px] font-bold ${diff > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                        {diff > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                        {Math.abs(diff)}
                    </div>
                )}
            </div>
            {target && (
                <div className={`h-1 w-full mt-1.5 rounded-full ${bgBar} overflow-hidden`}>
                    <div className={`h-full rounded-full ${fillBar}`} style={{ width: `${percent}%` }}></div>
                </div>
            )}
        </div>
    );
};

export default Nutrition;