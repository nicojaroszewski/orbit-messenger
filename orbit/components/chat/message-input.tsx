"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button, EmojiPicker } from "@/components/ui";
import { Send, Smile, Paperclip, Mic, X, Image as ImageIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ReplyingTo {
  messageId: Id<"messages">;
  content: string;
  senderName: string;
}

interface MessageInputProps {
  onSend: (content: string, replyToId?: Id<"messages">) => Promise<void>;
  onTyping: () => void;
  onAttachment?: () => void;
  replyingTo?: ReplyingTo | null;
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onTyping,
  onAttachment,
  replyingTo,
  onCancelReply,
  placeholder = "Type a message...",
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || disabled) return;

    setIsSending(true);
    const messageContent = message;
    setMessage("");

    try {
      await onSend(messageContent, replyingTo?.messageId);
      if (onCancelReply) onCancelReply();
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageContent); // Restore on error
    }
    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && replyingTo && onCancelReply) {
      onCancelReply();
    }
  };

  return (
    <div className="relative">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3 pb-0"
          >
            <div className="flex items-center justify-between px-4 py-2 rounded-t-xl bg-lunar-graphite/50 border-l-2 border-orbit-blue">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orbit-blue font-medium">
                  Replying to {replyingTo.senderName}
                </p>
                <p className="text-sm text-nebula-gray truncate">
                  {replyingTo.content}
                </p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1 rounded-full hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          {onAttachment && (
            <button
              type="button"
              onClick={onAttachment}
              className="p-2.5 rounded-full hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-4 py-3 pr-12 bg-lunar-graphite/50 border border-white/10 rounded-xl text-star-white placeholder:text-nebula-gray focus:outline-none focus:ring-2 focus:ring-orbit-blue/50 disabled:opacity-50"
              autoComplete="off"
            />

            {/* Emoji Button (inside input) */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                  position="top"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!message.trim() || isSending || disabled}
            className="shrink-0 rounded-full w-11 h-11 p-0"
          >
            {isSending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
