"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global variable to capture the event even before React mounts
declare global {
  interface Window {
    deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOSSafari: boolean;
  isAndroid: boolean;
  isAndroidChrome: boolean;
  isSamsungBrowser: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  triggerInstall: () => Promise<void>;
  updateAvailable: boolean;
  updateServiceWorker: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isAndroidChrome, setIsAndroidChrome] = useState(false);
  const [isSamsungBrowser, setIsSamsungBrowser] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Check platform and if app is already installed
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent;

    // Check if running in standalone mode (installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // Check platform
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury|Chrome/.test(ua);
    const isAndroidDevice = /Android/.test(ua);

    // Detect specific Android browsers
    const isChrome = /Chrome/.test(ua) && !/Edge|Edg|OPR|SamsungBrowser/.test(ua);
    const isSamsung = /SamsungBrowser/.test(ua);

    setIsIOSSafari(isIOSDevice && isSafari && !isStandalone && !isIOSStandalone);
    setIsAndroid(isAndroidDevice);
    setIsAndroidChrome(isAndroidDevice && isChrome);
    setIsSamsungBrowser(isSamsung);

    // Check if we already captured the install prompt before React mounted
    if (window.deferredInstallPrompt) {
      setInstallPrompt(window.deferredInstallPrompt);
      setIsInstallable(true);
    }
  }, []);

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredInstallPrompt = promptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
      console.log("[PWA] beforeinstallprompt event captured");
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App was installed");
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      window.deferredInstallPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Register service worker and handle updates
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              setWaitingWorker(newWorker);
            }
          });
        }
      });
    });

    // Check for updates periodically (every hour)
    const checkForUpdates = setInterval(() => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }, 60 * 60 * 1000);

    return () => clearInterval(checkForUpdates);
  }, []);

  const triggerInstall = useCallback(async () => {
    const promptToUse = installPrompt || window.deferredInstallPrompt;

    if (!promptToUse) {
      console.log("[PWA] No install prompt available");
      return;
    }

    try {
      console.log("[PWA] Triggering install prompt");
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      console.log("[PWA] User choice:", outcome);

      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
      }

      setInstallPrompt(null);
      window.deferredInstallPrompt = null;
    } catch (error) {
      console.error("[PWA] Error triggering install prompt:", error);
    }
  }, [installPrompt]);

  const updateServiceWorker = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setUpdateAvailable(false);
      window.location.reload();
    }
  }, [waitingWorker]);

  const value: PWAContextType = {
    isOnline,
    isInstallable,
    isInstalled,
    isIOSSafari,
    isAndroid,
    isAndroidChrome,
    isSamsungBrowser,
    installPrompt,
    triggerInstall,
    updateAvailable,
    updateServiceWorker,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}
