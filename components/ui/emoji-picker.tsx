"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Smile, Heart, ThumbsUp, Star, Flame, X } from "lucide-react";

// Emoji categories with popular emojis
const EMOJI_CATEGORIES = {
  recent: {
    icon: Clock,
    label: "Recent",
    emojis: [] as string[], // Will be populated from localStorage
  },
  smileys: {
    icon: Smile,
    label: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
      "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
      "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
      "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔",
      "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
      "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐",
    ],
  },
  gestures: {
    icon: ThumbsUp,
    label: "Gestures",
    emojis: [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "🤝", "👏", "🙌", "👐",
      "🤲", "🤞", "✌️", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇",
      "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "💪", "🦾", "🙏", "✍️",
      "🤳", "💅", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "👀", "👁️",
    ],
  },
  hearts: {
    icon: Heart,
    label: "Hearts",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️",
      "😍", "🥰", "😘", "😻", "💑", "💏", "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", "💌",
    ],
  },
  reactions: {
    icon: Star,
    label: "Reactions",
    emojis: [
      "👍", "👎", "❤️", "😂", "😮", "😢", "😡", "🎉", "🤔", "👀",
      "🔥", "💯", "✅", "❌", "⭐", "💫", "✨", "🌟", "💥", "💢",
      "💬", "👏", "🙏", "💪", "🤝", "🤷", "🤦", "🙈", "🙉", "🙊",
    ],
  },
  symbols: {
    icon: Flame,
    label: "Symbols",
    emojis: [
      "🔥", "💯", "✅", "❌", "❓", "❗", "💤", "💨", "💦", "🎵",
      "🎶", "💰", "💎", "🏆", "🥇", "🥈", "🥉", "🎯", "🎮", "🎲",
      "🎭", "🎨", "🎬", "🎤", "🎧", "🎸", "🎹", "🎺", "🎷", "🪘",
    ],
  },
};

// Quick reactions for message hover
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position?: "top" | "bottom";
  compact?: boolean;
}

export function EmojiPicker({
  onSelect,
  onClose,
  position = "bottom",
  compact = false,
}: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("reactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Load recent emojis from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("orbit-recent-emojis");
    if (stored) {
      try {
        setRecentEmojis(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleEmojiSelect = (emoji: string) => {
    // Update recent emojis
    const newRecent = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 20);
    setRecentEmojis(newRecent);
    localStorage.setItem("orbit-recent-emojis", JSON.stringify(newRecent));

    onSelect(emoji);
  };

  // Filter emojis based on search
  const getFilteredEmojis = () => {
    if (!searchTerm) {
      if (activeCategory === "recent") {
        return recentEmojis;
      }
      return EMOJI_CATEGORIES[activeCategory].emojis;
    }

    // Search across all categories
    const allEmojis = Object.values(EMOJI_CATEGORIES).flatMap((cat) => cat.emojis);
    return [...new Set(allEmojis)]; // Return all unique emojis when searching
  };

  if (compact) {
    return (
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} left-0 z-50`}
      >
        <div className="bg-orbital-navy/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-lunar-graphite rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => onClose()}
              className="w-8 h-8 flex items-center justify-center text-nebula-gray hover:text-star-white hover:bg-lunar-graphite rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, y: position === "top" ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === "top" ? 10 : -10 }}
      className={`absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} right-0 z-50`}
    >
      <div className="w-80 bg-orbital-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nebula-gray" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search emojis..."
              className="w-full pl-10 pr-4 py-2 bg-lunar-graphite/50 border border-white/10 rounded-xl text-star-white placeholder:text-nebula-gray text-sm focus:outline-none focus:ring-2 focus:ring-orbit-blue/50"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchTerm && (
          <div className="flex px-2 py-1 border-b border-white/10 gap-1">
            {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((key) => {
              const category = EMOJI_CATEGORIES[key];
              const Icon = category.icon;
              const isActive = activeCategory === key;

              // Skip recent if empty
              if (key === "recent" && recentEmojis.length === 0) return null;

              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-orbit-blue/20 text-orbit-blue"
                      : "text-nebula-gray hover:text-star-white hover:bg-lunar-graphite/50"
                  }`}
                  title={category.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}

        {/* Emoji Grid */}
        <div className="p-2 h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {getFilteredEmojis().map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-lunar-graphite rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>

          {getFilteredEmojis().length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-nebula-gray">
              <Smile className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No emojis found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Quick reaction picker for messages
interface QuickReactionPickerProps {
  onSelect: (emoji: string) => void;
  currentUserReactions: string[];
}

export function QuickReactionPicker({
  onSelect,
  currentUserReactions,
}: QuickReactionPickerProps) {
  return (
    <div className="flex gap-0.5 bg-orbital-navy/95 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-lg">
      {QUICK_REACTIONS.map((emoji) => {
        const hasReacted = currentUserReactions.includes(emoji);
        return (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className={`w-7 h-7 flex items-center justify-center text-base rounded-full transition-all ${
              hasReacted
                ? "bg-orbit-blue/30 scale-110"
                : "hover:bg-lunar-graphite hover:scale-110"
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
