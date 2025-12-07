"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ScrollToBottomProps {
  show: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function ScrollToBottom({ show, onClick, unreadCount = 0 }: ScrollToBottomProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          onClick={onClick}
          className="fixed bottom-24 right-8 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-orbit-blue hover:bg-orbit-blue/90 text-white shadow-lg shadow-orbit-blue/30 transition-colors"
        >
          {unreadCount > 0 && (
            <span className="text-sm font-medium">
              {unreadCount} new {unreadCount === 1 ? "message" : "messages"}
            </span>
          )}
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
