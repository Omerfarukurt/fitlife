import React, { useState, useEffect } from 'react';
import { Plus, Minus, Droplets, Trophy, ChevronDown, ArrowDown } from 'lucide-react';

interface HydrationTrackerProps {
    onGoalReached?: () => void;
    onWaterWarning?: (remaining: number) => void;
    waterGoal?: { min: number, max: number }; // in liters
}

const HydrationTracker: React.FC<HydrationTrackerProps> = ({ onGoalReached, onWaterWarning, waterGoal }) => {
    const [current, setCurrent] = useState(0);
    // Use middle of range as goal, convert to ml
    const goalInMl = waterGoal ? Math.round(((waterGoal.min + waterGoal.max) / 2) * 1000) : 2500;
    const [goal, setGoal] = useState(goalInMl);
    const [isGoalReached, setIsGoalReached] = useState(false);

    // Update goal when waterGoal prop changes
    useEffect(() => {
        if (waterGoal) {
            const newGoal = Math.round(((waterGoal.min + waterGoal.max) / 2) * 1000);
            setGoal(newGoal);
        }
    }, [waterGoal]);

    // Initial Load
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(`water_${today}`);

        if (saved) setCurrent(parseInt(saved));
    }, []);

    // Water Warning - Check if user hasn't reached goal by evening (20:00+)
    useEffect(() => {
        const checkWaterWarning = () => {
            const now = new Date();
            const hour = now.getHours();
            const today = now.toISOString().split('T')[0];
            const warningKey = `water_warning_${today}`;

            // Between 20:00 and 23:59, not reached goal, and no warning sent today
            if (hour >= 20 && current < goal && current > 0 && !localStorage.getItem(warningKey)) {
                const remaining = goal - current;
                if (onWaterWarning) onWaterWarning(remaining);
                localStorage.setItem(warningKey, 'true');
            }
        };

        // Check every minute
        const interval = setInterval(checkWaterWarning, 60000);
        checkWaterWarning(); // Check on mount

        return () => clearInterval(interval);
    }, [current, goal, onWaterWarning]);

    const updateWater = (amount: number) => {
        const newVal = Math.max(0, current + amount);
        setCurrent(newVal);

        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`water_${today}`, newVal.toString());

        // Check Goal
        if (newVal >= goal && current < goal) {
            setIsGoalReached(true);
            if (onGoalReached) onGoalReached();
        } else if (newVal < goal) {
            setIsGoalReached(false);
        }
    };

    const percentage = Math.min((current / goal) * 100, 100);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm relative overflow-visible ring-1 ring-slate-100 dark:ring-slate-700 mt-2">
            {/* Header & Status */}
            <div className="flex items-end justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-sky-100 dark:bg-sky-900/30 p-1.5 rounded-lg text-sky-600 dark:text-sky-400">
                        <Droplets size={16} className="fill-current" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Su Takibi</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Hedef: {goal / 1000}L</p>
                    </div>
                </div>
                <div className="text-right flex items-baseline gap-1">
                    <span className="text-xl font-bold text-sky-600 dark:text-sky-400">{(current / 1000).toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-slate-400">L</span>
                </div>
            </div>

            {/* Progress Bar with Arrow Indicator */}
            <div className="relative mb-6 mx-1">
                {/* Animated Arrow Indicator */}
                <div
                    className="absolute -top-6 transition-all duration-500 flex flex-col items-center z-10"
                    style={{ left: `calc(${percentage}% - 12px)` }}
                >
                    <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/50 px-1.5 py-0.5 rounded shadow-sm mb-0.5 whitespace-nowrap">
                        %{percentage.toFixed(0)}
                    </div>
                    <ArrowDown size={16} className="text-sky-500 animate-bounce" />
                </div>

                <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500 rounded-full relative"
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Controls - Compact Row */}
            <div className="flex items-center justify-between gap-3">
                {/* Decrease Group */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateWater(-250)}
                        className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95 border border-slate-100 dark:border-slate-700 min-w-[50px]"
                    >
                        <Minus size={14} className="mb-0.5" />
                        <span className="text-[10px] font-bold">-250ml</span>
                    </button>
                    <button
                        onClick={() => updateWater(-100)}
                        className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95 border border-slate-100 dark:border-slate-700 min-w-[50px]"
                    >
                        <Minus size={14} className="mb-0.5" />
                        <span className="text-[10px] font-bold">-100ml</span>
                    </button>
                </div>

                {/* Increase Group */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateWater(100)}
                        className="flex flex-col items-center justify-center p-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors active:scale-95 border border-sky-100 dark:border-sky-800 min-w-[50px]"
                    >
                        <Plus size={14} className="mb-0.5" />
                        <span className="text-[10px] font-bold">+100ml</span>
                    </button>
                    <button
                        onClick={() => updateWater(250)}
                        className="flex flex-col items-center justify-center p-2 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-200 dark:shadow-none hover:bg-sky-600 transition-colors active:scale-95 min-w-[60px]"
                    >
                        <Plus size={16} className="mb-0.5" />
                        <span className="text-[10px] font-bold">+250ml</span>
                    </button>
                </div>
            </div>

            {/* Goal Reached Badge - Mini */}
            {isGoalReached && current === goal && (
                <div className="absolute top-2 right-2 animate-bounce">
                    <Trophy size={16} className="text-amber-500 fill-current" />
                </div>
            )}
        </div>
    );
};

export default HydrationTracker;
