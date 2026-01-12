import React from 'react';
import { PersonalRecord } from '../types';
import { Trophy, TrendingUp, Flame, Zap } from 'lucide-react';
import { getPRBadge, getTopPRs, getRecentPRs } from '../utils/prTracker';

interface PRCardProps {
    personalRecords: PersonalRecord[];
    isDarkMode?: boolean;
}

const PRCard: React.FC<PRCardProps> = ({ personalRecords, isDarkMode = false }) => {
    const topPRs = getTopPRs(personalRecords, 5);
    const recentPRs = getRecentPRs(personalRecords, 7);

    if (personalRecords.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy size={20} className="text-amber-500" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Personal Records</h3>
                </div>
                <div className="text-center py-8 text-slate-400">
                    <Trophy size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz kayıtlı PR yok</p>
                    <p className="text-xs mt-1">Antrenman yapmaya başla!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy size={20} className="text-white" />
                        <h3 className="font-bold text-white">Personal Records</h3>
                    </div>
                    <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold text-white">
                        {personalRecords.length} PR
                    </span>
                </div>
            </div>

            {/* Recent PRs */}
            {recentPRs.length > 0 && (
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame size={14} className="text-red-500" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Son 7 Günde
                        </span>
                    </div>
                    <div className="space-y-2">
                        {recentPRs.slice(0, 3).map((pr, idx) => (
                            <div
                                key={`recent-${idx}`}
                                className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">🔥</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white">
                                            {pr.exerciseName}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(pr.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg text-amber-600 dark:text-amber-400">
                                        {pr.maxWeight}kg
                                    </p>
                                    {pr.previousMax && pr.previousMax > 0 && (
                                        <p className="text-xs text-green-500 flex items-center justify-end gap-1">
                                            <TrendingUp size={10} />
                                            +{(pr.maxWeight - pr.previousMax).toFixed(1)}kg
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top PRs */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-purple-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        En Yüksek Ağırlıklar
                    </span>
                </div>
                <div className="space-y-2">
                    {topPRs.map((pr, idx) => {
                        const badges = getPRBadge(pr);
                        return (
                            <div
                                key={`top-${idx}`}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                            idx === 1 ? 'bg-slate-300 text-slate-700' :
                                                idx === 2 ? 'bg-amber-600 text-white' :
                                                    'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                            {pr.exerciseName}
                                        </p>
                                        {badges.length > 0 && (
                                            <div className="flex gap-1 mt-0.5">
                                                {badges.map((badge, i) => (
                                                    <span key={i} className="text-xs">
                                                        {badge.emoji}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800 dark:text-white">
                                        {pr.maxWeight}kg
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {pr.maxVolumeWeight}kg × {pr.maxVolumeReps}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PRCard;
