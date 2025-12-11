"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw, X } from "lucide-react";
import { usePWA } from "@/components/providers/pwa-provider";

export function NetworkStatus() {
  const { isOnline, updateAvailable, updateServiceWorker } = usePWA();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setDismissed(false);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && !dismissed && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3 max-w-screen-xl mx-auto">
              <WifiOff className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                You&apos;re offline. Some features may be unavailable.
              </span>
              <button
                onClick={handleDismiss}
                className="ml-auto p-1 hover:bg-amber-600 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconnected Toast */}
      <AnimatePresence>
        {showReconnected && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              <span className="text-sm font-medium">Back online!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-orbit-blue text-white px-4 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm font-medium">A new version is available!</span>
              <button
                onClick={updateServiceWorker}
                className="bg-white text-orbit-blue px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Update
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact network indicator for sidebar/header
export function NetworkIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-1.5 text-amber-500 text-xs">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline</span>
    </div>
  );
}
