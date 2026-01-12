import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Medal, TrendingUp, Calendar } from 'lucide-react';
import { GlobalProps } from '../types';

interface PRRecord {
    id: string;
    exercise: string;
    weight: number;
    date: string;
    note?: string;
}

const PersonalRecords: React.FC<GlobalProps> = ({ toggleTheme, isDarkMode, showNotification, triggerConfetti }) => {
    const [records, setRecords] = useState<PRRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newExercise, setNewExercise] = useState('');
    const [newWeight, setNewWeight] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const saved = localStorage.getItem('prLogs');
        if (saved) {
            setRecords(JSON.parse(saved));
        }
    }, []);

    const saveRecords = (updatedRecords: PRRecord[]) => {
        setRecords(updatedRecords);
        localStorage.setItem('prLogs', JSON.stringify(updatedRecords));
    };

    const handleAddRecord = () => {
        if (!newExercise || !newWeight) {
            showNotification('Eksik Bilgi', 'Lütfen egzersiz adı ve ağırlığı girin.', 'info');
            return;
        }

        const weight = parseFloat(newWeight);

        // Check if it's a new PR for this exercise
        const existingBest = records
            .filter(r => r.exercise.toLowerCase() === newExercise.toLowerCase())
            .sort((a, b) => b.weight - a.weight)[0];

        const newRecord: PRRecord = {
            id: Date.now().toString(),
            exercise: newExercise,
            weight: weight,
            date: newDate
        };

        if (!existingBest || weight > existingBest.weight) {
            triggerConfetti();
            showNotification('YENİ REKOR!', `${newExercise} için yeni bir PR kırdın: ${weight}kg!`, 'award');
        } else {
            showNotification('Kaydedildi', 'Antrenman kaydı eklendi.', 'success');
        }

        const updated = [...records, newRecord];
        saveRecords(updated);

        setIsModalOpen(false);
        setNewExercise('');
        setNewWeight('');
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu kaydı silmek istediğine emin misin?')) {
            const updated = records.filter(r => r.id !== id);
            saveRecords(updated);
        }
    };

    // Get only the absolute best records per exercise for the "Wall of Fame"
    const bestRecords = Object.values(records.reduce<Record<string, PRRecord>>((acc, curr) => {
        if (!acc[curr.exercise] || curr.weight > acc[curr.exercise].weight) {
            acc[curr.exercise] = curr;
        }
        return acc;
    }, {})).sort((a, b) => b.weight - a.weight);

    return (
        <div className="pb-24 pt-8 px-4 max-w-2xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Trophy className="text-amber-500" />
                        PR Duvarı
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">En iyi derecelerin</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Wall of Fame Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bestRecords.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-300">
                            <Medal size={32} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">Henüz hiç rekorun yok.</p>
                        <p className="text-sm text-slate-400">İlk rekorunu eklemek için + butonuna bas.</p>
                    </div>
                ) : (
                    bestRecords.map((record, index) => (
                        <div key={record.id} className="relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-md transition-all">
                            {/* Decorative Background Icon */}
                            <div className="absolute -right-4 -bottom-4 opacity-5 text-slate-900 dark:text-white transform group-hover:scale-110 transition-transform">
                                <Trophy size={100} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white capitalize">{record.exercise}</h3>
                                    {index < 3 && <Medal size={20} className={index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-400' : 'text-amber-700'} />}
                                </div>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{record.weight}</span>
                                    <span className="text-sm font-bold text-slate-400">kg</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Calendar size={12} />
                                    <span>{new Date(record.date).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Recent History Section could go here if requested, keeping it simple for now */}

            {/* Add Record Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-sm relative">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="text-indigo-500" />
                            Yeni Rekor Ekle
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Egzersiz</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Bench Press"
                                    value={newExercise}
                                    onChange={(e) => setNewExercise(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                />
                                {/* Quick Chips */}
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                                    {['Bench Press', 'Squat', 'Deadlift', 'Overhead Press'].map(ex => (
                                        <button
                                            key={ex}
                                            onClick={() => setNewExercise(ex)}
                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors"
                                        >
                                            {ex}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ağırlık (kg)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newWeight}
                                        onChange={(e) => setNewWeight(e.target.value)}
                                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleAddRecord}
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalRecords;
