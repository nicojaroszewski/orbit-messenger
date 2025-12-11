"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Plus, X } from "lucide-react";
import { usePWA } from "@/components/providers/pwa-provider";

export function IOSInstallPrompt() {
  const { isIOSSafari, isInstalled } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem("ios-install-prompt-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after a short delay if on iOS Safari and not installed
    if (isIOSSafari && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isIOSSafari, isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("ios-install-prompt-dismissed", "true");
  };

  if (isDismissed || !isIOSSafari || isInstalled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-8 shadow-xl"
          >
            {/* Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Content */}
            <div className="mt-4">
              {/* App Icon Preview */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orbit-blue to-stellar-violet rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">O</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Install Orbit
              </h2>
              <p className="text-gray-600 text-center text-sm mb-6">
                Add Orbit to your home screen for the best experience with quick access and offline support.
              </p>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Share className="h-5 w-5 text-orbit-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">1. Tap the Share button</p>
                    <p className="text-sm text-gray-500">
                      Find it at the bottom of your Safari browser
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Plus className="h-5 w-5 text-orbit-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">2. Tap &quot;Add to Home Screen&quot;</p>
                    <p className="text-sm text-gray-500">
                      Scroll down in the share sheet to find it
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-orbit-blue font-semibold">Add</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">3. Tap &quot;Add&quot;</p>
                    <p className="text-sm text-gray-500">
                      Confirm by tapping Add in the top right corner
                    </p>
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
