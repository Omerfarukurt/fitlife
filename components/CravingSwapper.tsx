import React, { useState } from 'react';
import { RefreshCw, ArrowRight, Check, AlertCircle, Quote } from 'lucide-react';
import { getHealthyAlternative, CravingAlternative } from '../services/geminiService';
import { MealLog } from '../types';

interface CravingSwapperProps {
    onAddAlternative: (log: MealLog) => void;
}

const CravingSwapper: React.FC<CravingSwapperProps> = ({ onAddAlternative }) => {
    const [craving, setCraving] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CravingAlternative | null>(null);

    const handleSearch = async () => {
        if (!craving.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const data = await getHealthyAlternative(craving);
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        if (!result) return;

        onAddAlternative({
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            foodName: result.alternative,
            macros: {
                calories: result.calories,
                protein: 0,
                carbs: 0,
                fat: 0,
                sugar: 0
            },
            mealType: 'snack'
        });

        setCraving('');
        setResult(null);
    };

    return (
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/10 dark:to-orange-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <RefreshCw size={80} className="text-rose-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg text-rose-600 dark:text-rose-400">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Canın ne çekiyor?</h3>
                        <p className="text-xs text-slate-500">Sana sağlıklı bir alternatif bulalım.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={craving}
                        onChange={(e) => setCraving(e.target.value)}
                        placeholder="Örn: Cips, Çikolata, Burger..."
                        className="flex-1 border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 dark:text-white focus:outline-none placeholder:text-slate-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !craving}
                        className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                    </button>
                </div>

                {result && (
                    <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-rose-100 dark:border-rose-900/30 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-black text-lg text-rose-600 dark:text-rose-400">{result.alternative}</h4>
                                <span className="text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md">
                                    ~{result.calories} kcal
                                </span>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
                                title="Günlüğe Ekle"
                            >
                                <Check size={16} />
                            </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Quote size={16} className="text-slate-300 shrink-0 transform scale-x-[-1]" />
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">{result.reason}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CravingSwapper;
