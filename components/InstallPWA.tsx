import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show banner after 3 seconds
            setTimeout(() => {
                setShowInstallBanner(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallBanner(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // Show iOS banner after delay
        if (isIOSDevice && !localStorage.getItem('pwa-ios-dismissed')) {
            setTimeout(() => {
                setShowInstallBanner(true);
            }, 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setDeferredPrompt(null);
        setShowInstallBanner(false);
    };

    const dismissBanner = () => {
        setShowInstallBanner(false);
        if (isIOS) {
            localStorage.setItem('pwa-ios-dismissed', 'true');
        }
    };

    // Don't show if already installed
    if (isInstalled) return null;

    // Don't show if no prompt available (and not iOS)
    if (!showInstallBanner) return null;

    return (
        <>
            {/* Install Banner */}
            <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 shadow-2xl border border-orange-500/30">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-base">
                                FitLife'ı Yükle
                            </h3>
                            <p className="text-slate-400 text-sm mt-0.5">
                                {isIOS
                                    ? "Ana ekranınıza ekleyin"
                                    : "Hızlı erişim için uygulamayı yükleyin"}
                            </p>
                        </div>

                        <button
                            onClick={dismissBanner}
                            className="flex-shrink-0 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleInstallClick}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                        >
                            <Download className="w-4 h-4" />
                            {isIOS ? "Nasıl Yapılır?" : "Yükle"}
                        </button>
                        <button
                            onClick={dismissBanner}
                            className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors"
                        >
                            Daha Sonra
                        </button>
                    </div>
                </div>
            </div>

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-lg">iOS'ta Yükleme</h3>
                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                className="p-1 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <p className="text-white text-sm">
                                        Safari'de <strong>Paylaş</strong> butonuna tıklayın
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        (Alt taraftaki kare + ok ikonu)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <p className="text-white text-sm">
                                        <strong>"Ana Ekrana Ekle"</strong> seçeneğini bulun
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Aşağı kaydırmanız gerekebilir
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <p className="text-white text-sm">
                                        <strong>"Ekle"</strong> butonuna tıklayın
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        FitLife ana ekranınızda görünecek!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowIOSInstructions(false)}
                            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-3 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Anladım
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s ease-out;
                }
            `}</style>
        </>
    );
};

export default InstallPWA;
