"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw, Home, MessageCircle } from "lucide-react";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative mb-8"
      >
        {/* Outer ring */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-orbit-blue rounded-full blur-xl"
        />

        {/* Icon container */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-orbit-blue to-stellar-violet rounded-full flex items-center justify-center shadow-lg">
          <WifiOff className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center"
      >
        You are Offline
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 text-center max-w-md mb-8"
      >
        It looks like you have lost your internet connection.
        Check your connection and try again.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        <button
          onClick={handleRefresh}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orbit-blue text-white rounded-xl font-medium hover:bg-orbit-blue/90 transition-colors shadow-lg shadow-orbit-blue/20"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        <button
          onClick={handleGoHome}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </motion.div>

      {/* Offline Features Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full"
      >
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orbit-blue" />
          While Offline
        </h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">*</span>
            <span>View previously loaded conversations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">*</span>
            <span>Browse cached content</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">-</span>
            <span>Sending messages requires connection</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">-</span>
            <span>New content will not load until reconnected</span>
          </li>
        </ul>
      </motion.div>

      {/* Brand Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-sm text-gray-400"
      >
        Orbit - Stay Connected
      </motion.div>
    </div>
  );
}
