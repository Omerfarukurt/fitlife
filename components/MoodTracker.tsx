import React, { useState } from 'react';
import { Smile, Frown, Meh, Battery, Zap, Activity } from 'lucide-react';
import { MoodLog } from '../types';

interface MoodTrackerProps {
    onSaveLog: (log: MoodLog) => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onSaveLog }) => {
    const [selectedMood, setSelectedMood] = useState<MoodLog['mood'] | null>(null);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [isSaved, setIsSaved] = useState(false);

    const moods: { id: MoodLog['mood'], label: string, icon: React.ReactNode, color: string }[] = [
        { id: 'great', label: 'Harika', icon: <Smile size={24} />, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
        { id: 'good', label: 'İyi', icon: <Smile size={24} />, color: 'text-blue-500 bg-blue-50 border-blue-200' },
        { id: 'neutral', label: 'Normal', icon: <Meh size={24} />, color: 'text-slate-500 bg-slate-50 border-slate-200' },
        { id: 'tired', label: 'Yorgun', icon: <Battery size={24} />, color: 'text-orange-500 bg-orange-50 border-orange-200' },
        { id: 'stressed', label: 'Stresli', icon: <Frown size={24} />, color: 'text-red-500 bg-red-50 border-red-200' },
    ];

    const handleSave = () => {
        if (!selectedMood) return;

        const newLog: MoodLog = {
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            mood: selectedMood,
            energy: energyLevel
        };

        onSaveLog(newLog);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setSelectedMood(null);
            setEnergyLevel(5);
        }, 3000);
    };

    if (isSaved) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mb-3 text-emerald-600 dark:text-emerald-400">
                    <Zap size={32} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Kaydedildi!</h3>
                <p className="text-slate-500 text-sm">Enerji durumun günlüğe işlendi.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Activity size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Şu an nasıl hissediyorsun?</h3>
                    <p className="text-xs text-slate-500">Duygu ve enerji takibi yap.</p>
                </div>
            </div>

            {/* Mood Selection */}
            <div className="flex justify-between gap-2 mb-6">
                {moods.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedMood(m.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all w-full ${selectedMood === m.id
                                ? `${m.color} ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-900`
                                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400'
                            }`}
                    >
                        {m.icon}
                        <span className="text-[10px] font-bold">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* Energy Slider */}
            <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Düşük Enerji 😴</span>
                    <span className="text-indigo-600 font-black text-sm">{energyLevel}/10</span>
                    <span>Canavar Gibi 🔥</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            <button
                disabled={!selectedMood}
                onClick={handleSave}
                className="w-full py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
            >
                Durumu Kaydet
            </button>
        </div>
    );
};

export default MoodTracker;
