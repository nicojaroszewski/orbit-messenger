"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Plus, X, Download, Smartphone } from "lucide-react";
import { usePWA } from "@/components/providers/pwa-provider";

const STORAGE_KEY = "orbit-onboarding-install-seen";

export function OnboardingInstallPrompt() {
  const { isInstallable, isInstalled, isIOSSafari, triggerInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Check if user has already seen the onboarding
    const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY);

    // Show prompt if:
    // - User hasn't seen onboarding yet
    // - App is not already installed
    // - Either installable (Android/Chrome) OR on iOS Safari
    // - On mobile device
    if (!hasSeenOnboarding && !isInstalled && (isInstallable || isIOSSafari)) {
      // Small delay to let the page settle after login
      const timer = setTimeout(() => {
        if (isMobile || /android|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
          setIsVisible(true);
        }
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", checkMobile);
      };
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [isInstallable, isInstalled, isIOSSafari, isMobile]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleInstall = async () => {
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
  };

  // Don't render if already installed or neither installable nor iOS Safari
  if (isInstalled || (!isInstallable && !isIOSSafari)) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl shadow-2xl safe-area-pb"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}
          >
            {/* Drag handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            <div className="px-6 pt-8 pb-6">
              {/* App Icon */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-[22px] flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white text-3xl font-bold tracking-tight">O</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Smartphone className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Get the Orbit App
              </h2>
              <p className="text-gray-500 text-center text-sm mb-6 max-w-xs mx-auto">
                Install Orbit for instant access, faster performance, and offline support.
              </p>

              {/* Content differs based on platform */}
              {isInstallable ? (
                // Android/Chrome - Show install button
                <div className="space-y-3">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="w-full py-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70"
                  >
                    {isInstalling ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {isInstalling ? "Installing..." : "Install Orbit"}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              ) : isIOSSafari ? (
                // iOS Safari - Show instructions
                <div>
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-4 mb-4">
                    {/* Step 1 */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <Share className="h-5 w-5 text-[#3B82F6]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">1. Tap Share</p>
                        <p className="text-xs text-gray-500">
                          At the bottom of Safari
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <Plus className="h-5 w-5 text-[#3B82F6]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">2. Add to Home Screen</p>
                        <p className="text-xs text-gray-500">
                          Scroll down to find it
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <span className="text-[#3B82F6] font-bold text-sm">Add</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">3. Tap Add</p>
                        <p className="text-xs text-gray-500">
                          In the top right corner
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="w-full py-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-2xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Got it!
                  </button>
                </div>
              ) : null}

              {/* Benefits */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex justify-center gap-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Faster loading
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    Works offline
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    Home screen
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
