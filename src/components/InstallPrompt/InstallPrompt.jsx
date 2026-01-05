import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import './InstallPrompt.css';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if already in standalone mode (app installed)
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');
        setIsStandalone(standalone);

        // If installed, mark as permanently hidden
        if (standalone) {
            localStorage.setItem('pwa_installed', 'true');
            return;
        }

        // Check if already installed previously
        const alreadyInstalled = localStorage.getItem('pwa_installed') === 'true';
        if (alreadyInstalled) {
            return; // Never show again if app was installed
        }

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Check if user dismissed before (within 7 days)
        const dismissed = localStorage.getItem('pwa_install_dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                return; // Don't show if dismissed within 7 days
            }
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after 3 seconds
            setTimeout(() => {
                setShowPrompt(true);
                // Auto-vanish after 10 seconds
                setTimeout(() => setIsVisible(false), 10000);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Listen for app installed event
        const handleAppInstalled = () => {
            localStorage.setItem('pwa_installed', 'true');
            setShowPrompt(false);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // For iOS, show custom prompt after delay
        if (iOS && !standalone) {
            setTimeout(() => {
                setShowPrompt(true);
                // Auto-vanish after 15 seconds for iOS
                setTimeout(() => setIsVisible(false), 15000);
            }, 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            // Mark as installed
            localStorage.setItem('pwa_installed', 'true');
            setShowPrompt(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // After fade out animation, hide completely
        setTimeout(() => {
            setShowPrompt(false);
            localStorage.setItem('pwa_install_dismissed', Date.now().toString());
        }, 300);
    };

    if (isStandalone || !showPrompt || !isVisible) return null;

    return (
        <div className={`install-prompt ${!isVisible ? 'hiding' : ''}`}>
            <div className="install-prompt-content">
                <div className="install-icon">
                    <Smartphone size={24} />
                </div>
                <div className="install-text">
                    <h4>Install TiffinTrack</h4>
                    {isIOS ? (
                        <p>Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong></p>
                    ) : (
                        <p>Get the app for quick access & reminders</p>
                    )}
                </div>
                <div className="install-actions">
                    {!isIOS && deferredPrompt && (
                        <button className="install-btn" onClick={handleInstall}>
                            <Download size={16} />
                            Install
                        </button>
                    )}
                    <button className="dismiss-btn" onClick={handleDismiss}>
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
