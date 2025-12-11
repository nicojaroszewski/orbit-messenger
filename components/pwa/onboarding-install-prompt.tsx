"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Plus, X, Download, Smartphone } from "lucide-react";
import { usePWA } from "@/components/providers/pwa-provider";

const STORAGE_KEY = "orbit-onboarding-install-seen";

export function OnboardingInstallPrompt() {
  const { isInstallable, isInstalled, isIOSSafari, triggerInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user has already seen/dismissed the onboarding
    const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY);

    // Show banner if:
    // - User hasn't dismissed it yet
    // - App is not already installed as PWA
    if (!hasSeenOnboarding && !isInstalled) {
      // Small delay to let the page settle after login
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSInstructions(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleInstall = async () => {
    if (isInstallable) {
      // Android/Chrome - trigger native install
      setIsInstalling(true);
      try {
        await triggerInstall();
        localStorage.setItem(STORAGE_KEY, "true");
        setIsVisible(false);
      } catch (error) {
        console.error("Install failed:", error);
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOSSafari) {
      // iOS Safari - show instructions modal
      setShowIOSInstructions(true);
    } else {
      // Desktop or unsupported browser - just dismiss with a note
      // The banner will show info about mobile installation
      handleDismiss();
    }
  };

  // Don't render if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Top Banner */}
      <AnimatePresence>
        {isVisible && !showIOSInstructions && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg md:left-64"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              {/* Left: Icon + Text */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    Install Orbit App
                  </p>
                  <p className="text-xs text-white/80 truncate hidden sm:block">
                    Get faster access & offline support
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isInstallable ? (
                  // Android/Chrome - Show install button
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="px-4 py-2 bg-white text-[#3B82F6] rounded-lg font-semibold text-sm flex items-center gap-1.5 hover:bg-white/90 transition-colors disabled:opacity-70"
                  >
                    {isInstalling ? (
                      <div className="w-4 h-4 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isInstalling ? "Installing..." : "Install"}
                    </span>
                  </button>
                ) : isIOSSafari ? (
                  // iOS Safari - Show how button
                  <button
                    onClick={handleInstall}
                    className="px-4 py-2 bg-white text-[#3B82F6] rounded-lg font-semibold text-sm flex items-center gap-1.5 hover:bg-white/90 transition-colors"
                  >
                    <Share className="w-4 h-4" />
                    <span className="hidden sm:inline">How to Install</span>
                  </button>
                ) : (
                  // Desktop - Show info that it's for mobile
                  <span className="text-xs text-white/70 hidden sm:block">
                    Open on mobile to install
                  </span>
                )}

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowIOSInstructions(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}
            >
              {/* Drag handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full" />

              {/* Close button */}
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>

              <div className="px-6 pt-8 pb-6">
                {/* App Icon */}
                <div className="flex justify-center mb-5">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <span className="text-white text-2xl font-bold">O</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Install Orbit on iPhone
                </h2>
                <p className="text-gray-500 text-center text-sm mb-5">
                  Follow these 3 simple steps:
                </p>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-4 mb-5">
                  {/* Step 1 */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Share className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">1. Tap the Share button</p>
                      <p className="text-xs text-gray-500">At the bottom of Safari</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Plus className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">2. Tap &quot;Add to Home Screen&quot;</p>
                      <p className="text-xs text-gray-500">Scroll down to find it</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <span className="text-[#3B82F6] font-bold text-sm">Add</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">3. Tap &quot;Add&quot;</p>
                      <p className="text-xs text-gray-500">In the top right corner</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
