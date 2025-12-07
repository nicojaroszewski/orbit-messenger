"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Avatar, Input } from "@/components/ui";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Users,
  Loader2,
} from "lucide-react";
import { formatRelativeTime, formatMessageTime } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const chatId = params.chatId as Id<"conversations">;
  const router = useRouter();
  const { user } = useUser();

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversation = useQuery(
    api.conversations.getConversation,
    user ? { conversationId: chatId, clerkId: user.id } : "skip"
  );

  const messages = useQuery(
    api.messages.getMessages,
    user ? { conversationId: chatId, clerkId: user.id } : "skip"
  );

  const typingIndicators = useQuery(
    api.messages.getTypingIndicators,
    user ? { conversationId: chatId, clerkId: user.id } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const setTyping = useMutation(api.messages.setTyping);

  // Current user's Convex ID
  const currentUserConvex = conversation?.participantUsers.find(
    (p) => p.clerkId === user?.id
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (user && chatId) {
      markAsRead({ conversationId: chatId, clerkId: user.id });
    }
  }, [user, chatId, markAsRead, messages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!user) return;

    setTyping({ conversationId: chatId, clerkId: user.id, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping({ conversationId: chatId, clerkId: user.id, isTyping: false });
    }, 3000);
  }, [user, chatId, setTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (user) {
        setTyping({ conversationId: chatId, clerkId: user.id, isTyping: false });
      }
    };
  }, [user, chatId, setTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || isSending) return;

    setIsSending(true);
    const messageContent = message;
    setMessage("");

    try {
      await sendMessage({
        conversationId: chatId,
        clerkId: user.id,
        content: messageContent,
        type: "text",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageContent); // Restore message on error
    }
    setIsSending(false);
    inputRef.current?.focus();
  };

  if (!conversation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-orbit-blue/30 border-t-orbit-blue animate-spin" />
          <p className="text-nebula-gray">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const isGroup = conversation.type === "group";
  const displayName = isGroup
    ? conversation.name
    : conversation.otherParticipant?.name;
  const avatarUrl = isGroup
    ? conversation.avatarUrl
    : conversation.otherParticipant?.avatarUrl;
  const isOnline = !isGroup && conversation.otherParticipant?.isOnline;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 border-b border-white/10 bg-orbital-navy/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/chats`}>
              <Button variant="ghost" size="sm" className="mr-1">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            {isGroup ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stellar-violet to-orbit-blue flex items-center justify-center">
                <Users className="w-5 h-5 text-star-white" />
              </div>
            ) : (
              <Avatar
                src={avatarUrl}
                name={displayName || "User"}
                size="md"
                showStatus
                isOnline={isOnline}
              />
            )}
            <div>
              <p className="font-medium text-star-white">{displayName}</p>
              <p className="text-xs text-nebula-gray">
                {isGroup
                  ? `${conversation.participantUsers.length} ${t("chat.members")}`
                  : isOnline
                  ? t("chat.online")
                  : t("chat.offline")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Date Separator or empty state */}
          {messages?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orbit-blue/20 to-stellar-violet/20 flex items-center justify-center">
                <Send className="w-8 h-8 text-orbit-blue" />
              </div>
              <p className="text-star-white font-medium mb-2">
                {t("chat.startConversation")}
              </p>
              <p className="text-sm text-nebula-gray">
                {t("chat.sendFirstMessage", { name: displayName || "" })}
              </p>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {messages?.map((msg, index) => {
              const isOwnMessage = msg.sender?.clerkId === user?.id;
              const showAvatar =
                !isOwnMessage &&
                (index === 0 ||
                  messages[index - 1]?.sender?._id !== msg.sender?._id);

              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={isOwnMessage}
                  showAvatar={showAvatar}
                  locale={locale}
                  t={t}
                />
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {typingIndicators && typingIndicators.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <Avatar
                  src={typingIndicators[0].user?.avatarUrl}
                  name={typingIndicators[0].user?.name || "User"}
                  size="sm"
                />
                <div className="bg-lunar-graphite/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-signal-teal rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-signal-teal rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-signal-teal rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="shrink-0 px-4 py-4 border-t border-white/10 bg-orbital-navy/50 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Input
              ref={inputRef}
              placeholder={t("chat.messagePlaceholder")}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              className="flex-1"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={!message.trim() || isSending}
              className="shrink-0"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    _id: Id<"messages">;
    content: string;
    type: "text" | "image" | "file" | "system";
    createdAt: number;
    deletedAt?: number;
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
  t: ReturnType<typeof useTranslations>;
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  locale,
  t,
}: MessageBubbleProps) {
  // System message
  if (message.type === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <p className="text-xs text-nebula-gray bg-lunar-graphite/30 px-3 py-1 rounded-full">
          {message.content}
        </p>
      </motion.div>
    );
  }

  const isDeleted = !!message.deletedAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
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
      <div
        className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? "bg-gradient-to-br from-orbit-blue to-orbit-blue/80 text-white"
              : "bg-lunar-graphite/50 text-star-white"
          } ${isDeleted ? "opacity-60 italic" : ""}`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {isDeleted ? t("chat.messageDeleted") : message.content}
          </p>
        </div>
        <p
          className={`text-[10px] text-nebula-gray mt-1 ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {formatMessageTime(message.createdAt, locale)}
        </p>
      </div>
    </motion.div>
  );
}
