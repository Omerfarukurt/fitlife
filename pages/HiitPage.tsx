import React from 'react';
import { Timer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlobalProps } from '../types';
import HiitTimer from '../components/HiitTimer';

const HiitPage: React.FC<GlobalProps> = ({ isDarkMode }) => {
    const navigate = useNavigate();

    return (
        <div className="pb-24 pt-8 px-4 max-w-lg mx-auto min-h-screen">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Timer className="text-rose-500" />
                        HIIT Zamanlayıcı
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tabata & Interval Antrenman</p>
                </div>
            </div>

            <HiitTimer />

            {/* Info Card */}
            <div className="mt-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Nasıl Kullanılır?</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                        <span>Çalışma ve dinlenme sürelerini ayarla.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                        <span>"Başlat"a bas ve antrenmana başla.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                        <span>Sesli uyarılar seni yönlendirecek.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HiitPage;
