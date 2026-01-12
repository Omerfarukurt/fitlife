import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';

const HiitTimer: React.FC = () => {
    // Settings
    const [workTime, setWorkTime] = useState(20);
    const [restTime, setRestTime] = useState(10);
    const [totalSets, setTotalSets] = useState(8);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    // State
    const [isActive, setIsActive] = useState(false);
    const [isWork, setIsWork] = useState(true); // true = Work, false = Rest
    const [currentSet, setCurrentSet] = useState(1);
    const [timeLeft, setTimeLeft] = useState(workTime);
    const [isFinished, setIsFinished] = useState(false);

    // Audio Context for Beeps
    const audioContextRef = useRef<AudioContext | null>(null);

    const playBeep = (freq = 440, type: OscillatorType = 'sine', duration = 0.1) => {
        if (!isSoundEnabled) return;
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && !isFinished) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    // Last 3 seconds countdown beeps
                    if (prev <= 4 && prev > 1) {
                        playBeep(600, 'sine', 0.1);
                    }
                    if (prev === 1) {
                        playBeep(880, 'square', 0.3); // High pitch for switch
                    }

                    if (prev <= 1) {
                        // Switch Phase
                        if (isWork) {
                            // Switch to Rest
                            if (currentSet === totalSets) {
                                setIsFinished(true);
                                setIsActive(false);
                                return 0;
                            }
                            setIsWork(false);
                            return restTime;
                        } else {
                            // Switch to Work
                            setIsWork(true);
                            setCurrentSet(s => s + 1);
                            return workTime;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, isWork, currentSet, totalSets, workTime, restTime]);

    const toggleTimer = () => {
        if (!isActive && isFinished) {
            resetTimer();
            setIsActive(true);
        } else {
            setIsActive(!isActive);
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsFinished(false);
        setCurrentSet(1);
        setIsWork(true);
        setTimeLeft(workTime);
    };

    // Calculate progress
    const totalDuration = isWork ? workTime : restTime;
    const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

    return (
        <div className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl transition-all duration-500 ${isFinished
                ? 'bg-emerald-500 text-white'
                : isWork
                    ? 'bg-rose-500 text-white'
                    : 'bg-indigo-600 text-white'
            }`}>
            {/* Status Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-widest text-sm opacity-80">
                        {isFinished ? 'TAMAMLANDI' : isWork ? 'ÇALIŞMA' : 'DİNLENME'}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSoundEnabled(!isSoundEnabled)} className="opacity-80 hover:opacity-100 transition-opacity">
                        {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <div className="font-mono font-bold bg-black/20 px-3 py-1 rounded-lg text-sm">
                        {currentSet} / {totalSets}
                    </div>
                </div>
            </div>

            {/* Main Timer Display */}
            <div className="relative flex flex-col items-center justify-center py-10 z-10">
                <div className="text-[120px] font-black leading-none tracking-tighter tabular-nums drop-shadow-lg">
                    {timeLeft}
                </div>
                {!isFinished && (
                    <p className="opacity-60 font-medium animate-pulse mt-2">
                        {isActive ? (isWork ? 'Hadi Bas !' : 'Nefes Al') : 'DURAKLATILDI'}
                    </p>
                )}
                {isFinished && <p className="text-2xl font-bold animate-bounce mt-4">Harika İş!</p>}
            </div>

            {/* Progress Bar Background */}
            <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none">
                <div
                    className="h-full bg-white/10 transition-all duration-1000 ease-linear origin-bottom"
                    style={{ transform: `scaleY(${progress / 100})` }}
                ></div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 relative z-10 mt-6">
                <button
                    onClick={toggleTimer}
                    className="bg-white text-slate-900 rounded-2xl py-4 font-bold text-lg shadow-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isActive ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                    {isActive ? 'Duraklat' : isFinished ? 'Tekrar' : 'Başlat'}
                </button>
                <button
                    onClick={resetTimer}
                    className="bg-black/20 text-white rounded-2xl py-4 font-bold text-lg hover:bg-black/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={24} />
                    Sıfırla
                </button>
            </div>

            {/* Quick Settings (Only when stopped) */}
            {!isActive && !isFinished && (
                <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <label className="text-xs opacity-70 uppercase font-bold block mb-1">Çalışma</label>
                        <div className="flex items-center justify-center gap-2 font-bold text-xl">
                            <button onClick={() => setWorkTime(Math.max(10, workTime - 5))} className="hover:text-white/70">-</button>
                            <span>{workTime}s</span>
                            <button onClick={() => setWorkTime(workTime + 5)} className="hover:text-white/70">+</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs opacity-70 uppercase font-bold block mb-1">Dinlenme</label>
                        <div className="flex items-center justify-center gap-2 font-bold text-xl">
                            <button onClick={() => setRestTime(Math.max(5, restTime - 5))} className="hover:text-white/70">-</button>
                            <span>{restTime}s</span>
                            <button onClick={() => setRestTime(restTime + 5)} className="hover:text-white/70">+</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs opacity-70 uppercase font-bold block mb-1">Setler</label>
                        <div className="flex items-center justify-center gap-2 font-bold text-xl">
                            <button onClick={() => setTotalSets(Math.max(1, totalSets - 1))} className="hover:text-white/70">-</button>
                            <span>{totalSets}</span>
                            <button onClick={() => setTotalSets(totalSets + 1)} className="hover:text-white/70">+</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HiitTimer;
