"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, QuickReactionPicker } from "@/components/ui";
import { formatMessageTime } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { Check, CheckCheck, MoreHorizontal, Reply, Smile, Trash2, Edit2, File, Download, Mic } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { MessageWithLinkPreviews } from "./link-preview";

interface MessageBubbleProps {
  message: {
    _id: Id<"messages">;
    content: string;
    type: "text" | "image" | "file" | "system" | "voice";
    createdAt: number;
    deletedAt?: number;
    editedAt?: number;
    replyToId?: Id<"messages">;
    readBy: Id<"users">[];
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
    sender?: {
      _id: Id<"users">;
      name: string;
      avatarUrl?: string;
      clerkId: string;
    } | null;
  };
  isOwn: boolean;
  showAvatar: boolean;
  locale: string;
  onReply?: (messageId: Id<"messages">) => void;
  replyToMessage?: {
    content: string;
    senderName: string;
  } | null;
  participantCount?: number;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  locale,
  onReply,
  replyToMessage,
  participantCount = 2,
}: MessageBubbleProps) {
  const { user } = useUser();
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const addReaction = useMutation(api.reactions.addReaction);
  const reactions = useQuery(api.reactions.getReactions, {
    messageId: message._id,
  });

  // Get current user's reactions
  const currentUserReactions = reactions
    ?.filter((r) => r.users.some((u) => u._id === user?.id))
    .map((r) => r.emoji) || [];

  const handleReaction = async (emoji: string) => {
    if (!user) return;
    try {
      await addReaction({
        messageId: message._id,
        clerkId: user.id,
        emoji,
      });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
    setShowReactionPicker(false);
  };

  // System message
  if (message.type === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-4"
      >
        <p className="text-xs text-nebula-gray bg-lunar-graphite/30 px-4 py-2 rounded-full">
          {message.content}
        </p>
      </motion.div>
    );
  }

  const isDeleted = !!message.deletedAt;
  const isEdited = !!message.editedAt;

  // Calculate read status
  const isDelivered = true; // Assume delivered if we can see it
  const isRead = message.readBy.length > 1 || (isOwn && message.readBy.length >= participantCount);

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
      }}
      className={`group flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} relative`}
    >
      {/* Avatar */}
      <div className="w-8 shrink-0">
        {showAvatar && !isOwn && (
          <Avatar
            src={message.sender?.avatarUrl}
            name={message.sender?.name || "User"}
            size="sm"
          />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[70%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Reply Preview */}
        {replyToMessage && (
          <div
            className={`mb-1 px-3 py-1.5 rounded-lg bg-lunar-graphite/30 border-l-2 ${
              isOwn ? "border-orbit-blue" : "border-stellar-violet"
            }`}
          >
            <p className="text-xs text-nebula-gray">{replyToMessage.senderName}</p>
            <p className="text-xs text-star-white/70 truncate max-w-48">
              {replyToMessage.content}
            </p>
          </div>
        )}

        {/* Main Bubble */}
        <div className="relative">
          {/* Image Message */}
          {message.type === "image" && message.attachmentUrl && !isDeleted ? (
            <div className="rounded-2xl overflow-hidden max-w-xs">
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={message.attachmentUrl}
                  alt={message.attachmentName || "Image"}
                  className="w-full h-auto max-h-64 object-cover hover:opacity-90 transition-opacity"
                />
              </a>
            </div>
          ) : message.type === "file" && message.attachmentUrl && !isDeleted ? (
            /* File Message */
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                isOwn
                  ? "bg-gradient-to-br from-orbit-blue to-orbit-blue/80 text-white"
                  : "bg-lunar-graphite/50 text-star-white"
              } hover:opacity-90 transition-opacity`}
            >
              <div className="p-2 rounded-lg bg-white/10">
                <File className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {message.attachmentName}
                </p>
                {message.attachmentSize && (
                  <p className="text-xs opacity-70">
                    {formatFileSize(message.attachmentSize)}
                  </p>
                )}
              </div>
              <Download className="w-4 h-4 opacity-70" />
            </a>
          ) : message.type === "voice" && message.attachmentUrl && !isDeleted ? (
            /* Voice Message */
            <div
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                isOwn
                  ? "bg-gradient-to-br from-orbit-blue to-orbit-blue/80 text-white"
                  : "bg-lunar-graphite/50 text-star-white"
              }`}
            >
              <div className="p-2 rounded-full bg-white/10">
                <Mic className="w-5 h-5" />
              </div>
              <audio controls className="h-8 max-w-[200px]">
                <source src={message.attachmentUrl} type="audio/webm" />
                Your browser does not support audio.
              </audio>
            </div>
          ) : (
            /* Text Message */
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                isOwn
                  ? "bg-gradient-to-br from-orbit-blue to-orbit-blue/80 text-white"
                  : "bg-lunar-graphite/50 text-star-white"
              } ${isDeleted ? "opacity-60 italic" : ""}`}
            >
              {isDeleted ? (
                <p className="text-sm whitespace-pre-wrap break-words">
                  This message was deleted
                </p>
              ) : (
                <MessageWithLinkPreviews content={message.content} isOwn={isOwn} />
              )}
            </div>
          )}

          {/* Action buttons on hover */}
          <AnimatePresence>
            {showActions && !isDeleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${
                  isOwn ? "right-full mr-2" : "left-full ml-2"
                }`}
              >
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="p-1.5 rounded-full bg-orbital-navy/80 hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
                  title="React"
                >
                  <Smile className="w-4 h-4" />
                </button>
                {onReply && (
                  <button
                    onClick={() => onReply(message._id)}
                    className="p-1.5 rounded-full bg-orbital-navy/80 hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="p-1.5 rounded-full bg-orbital-navy/80 hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
                  title="More"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Reaction Picker */}
          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute bottom-full mb-2 ${isOwn ? "right-0" : "left-0"}`}
              >
                <QuickReactionPicker
                  onSelect={handleReaction}
                  currentUserReactions={currentUserReactions}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions Display */}
        {reactions && reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                  currentUserReactions.includes(reaction.emoji)
                    ? "bg-orbit-blue/30 text-orbit-blue"
                    : "bg-lunar-graphite/50 text-star-white hover:bg-lunar-graphite"
                }`}
                title={reaction.users.map((u) => u.name).join(", ")}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp & Status */}
        <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <p className="text-[10px] text-nebula-gray">
            {formatMessageTime(message.createdAt, locale)}
            {isEdited && " (edited)"}
          </p>
          {isOwn && (
            <span className="text-nebula-gray">
              {isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-orbit-blue" />
              ) : isDelivered ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
