"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, Avatar, Input } from "@/components/ui";
import { staggerContainer, listItem } from "@/lib/animations";
import {
  MessageSquare,
  Search,
  Plus,
  Users,
  Sparkles,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  const conversations = useQuery(
    api.conversations.getConversations,
    user ? { clerkId: user.id } : "skip"
  );

  const connections = useQuery(
    api.users.getConnections,
    user ? { clerkId: user.id } : "skip"
  );

  const createDirectConversation = useMutation(
    api.conversations.createDirectConversation
  );

  const filteredConversations = conversations?.filter((conv) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    if (conv.type === "direct") {
      return conv.otherParticipant?.name.toLowerCase().includes(searchLower) ||
        conv.otherParticipant?.username.toLowerCase().includes(searchLower);
    } else {
      return conv.name?.toLowerCase().includes(searchLower);
    }
  });

  const handleStartChat = async (userId: Id<"users">) => {
    if (!user) return;
    try {
      const conversationId = await createDirectConversation({
        clerkId: user.id,
        otherUserId: userId,
      });
      router.push(`/${locale}/chat/${conversationId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={listItem} className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("chat.title")}
            </h1>
            <p className="text-gray-500">{t("chat.subtitle")}</p>
          </div>
          <Button onClick={() => setShowNewGroupModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("chat.newChat")}
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div variants={listItem}>
          <Input
            placeholder={t("chat.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </motion.div>

        {/* Conversations List */}
        <motion.div variants={listItem}>
          {filteredConversations && filteredConversations.length > 0 ? (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <ConversationCard
                  key={conversation._id}
                  conversation={conversation}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm text-center py-12">
              <CardContent>
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium mb-2">
                  {t("chat.noChats")}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {t("chat.noChatsDescription")}
                </p>

                {/* Quick Start Chat with Connections */}
                {connections && connections.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      {t("chat.startWithConnection")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {connections.slice(0, 5).filter(Boolean).map((connection) => (
                        <button
                          key={connection!._id}
                          onClick={() => handleStartChat(connection!._id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Avatar
                            src={connection!.avatarUrl}
                            name={connection!.name}
                            size="sm"
                          />
                          <span className="text-sm text-gray-900">
                            {connection!.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Link href={`/${locale}/discover`} className="mt-6 inline-block">
                  <Button>{t("discover.title")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : searchTerm ? (
            <Card className="bg-white border border-gray-200 shadow-sm text-center py-8">
              <CardContent>
                <Search className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-900 font-medium">
                  {t("common.noResults")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t("chat.noSearchResults")}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </motion.div>
      </motion.div>

      {/* New Chat Modal */}
      {showNewGroupModal && (
        <NewChatModal
          connections={(connections || []).filter((c): c is NonNullable<typeof c> => c !== null)}
          onClose={() => setShowNewGroupModal(false)}
          onStartChat={handleStartChat}
          locale={locale}
          userId={user?.id || ""}
          t={t}
        />
      )}
    </div>
  );
}

interface ConversationCardProps {
  conversation: {
    _id: Id<"conversations">;
    name?: string;
    type: "direct" | "group";
    lastMessageAt: number;
    lastMessagePreview?: string;
    unreadCount: number;
    avatarUrl?: string;
    otherParticipant?: {
      _id: Id<"users">;
      name: string;
      username: string;
      avatarUrl?: string;
      isOnline: boolean;
    } | null;
    participantUsers: Array<{
      _id: Id<"users">;
      name: string;
      avatarUrl?: string;
      isOnline: boolean;
    }>;
  };
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

function ConversationCard({ conversation, locale, t }: ConversationCardProps) {
  const isGroup = conversation.type === "group";
  const displayName = isGroup
    ? conversation.name
    : conversation.otherParticipant?.name;
  const avatarUrl = isGroup
    ? conversation.avatarUrl
    : conversation.otherParticipant?.avatarUrl;
  const isOnline = !isGroup && conversation.otherParticipant?.isOnline;

  return (
    <Link href={`/${locale}/chat/${conversation._id}`}>
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          {isGroup ? (
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-stellar-violet to-orbit-blue flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          ) : (
            <Avatar
              src={avatarUrl}
              name={displayName || "User"}
              size="lg"
              showStatus
              isOnline={isOnline}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 truncate">
                {displayName}
              </p>
              {isGroup && (
                <span className="text-xs text-gray-500">
                  ({conversation.participantUsers.length})
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conversation.lastMessagePreview || t("chat.noMessages")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">
              {formatRelativeTime(conversation.lastMessageAt, locale)}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium bg-orbit-blue text-white rounded-full mt-1">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface NewChatModalProps {
  connections: Array<{
    _id: Id<"users">;
    name: string;
    username: string;
    avatarUrl?: string;
    isOnline: boolean;
  }>;
  onClose: () => void;
  onStartChat: (userId: Id<"users">) => void;
  locale: string;
  userId: string;
  t: ReturnType<typeof useTranslations>;
}

function NewChatModal({
  connections,
  onClose,
  onStartChat,
  locale,
  userId,
  t,
}: NewChatModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

  const createGroupConversation = useMutation(
    api.conversations.createGroupConversation
  );

  const filteredConnections = connections.filter(
    (conn) =>
      conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) return;
    try {
      const conversationId = await createGroupConversation({
        clerkId: userId,
        name: groupName,
        participantIds: selectedUsers,
      });
      router.push(`/${locale}/chat/${conversationId}`);
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const toggleUserSelection = (userId: Id<"users">) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md"
      >
        <Card className="bg-white border border-gray-200 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("chat.newChat")}
              </h2>

              {/* Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!isGroup ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setIsGroup(false)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {t("chat.directMessage")}
                </Button>
                <Button
                  variant={isGroup ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setIsGroup(true)}
                >
                  <Users className="w-4 h-4 mr-1" />
                  {t("chat.groupChat")}
                </Button>
              </div>

              {/* Group Name Input */}
              {isGroup && (
                <Input
                  placeholder={t("chat.groupNamePlaceholder")}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-4"
                />
              )}

              {/* Search */}
              <Input
                placeholder={t("chat.searchConnections")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="mt-4"
              />
            </div>

            {/* Connections List */}
            <div className="max-h-64 overflow-y-auto p-2 bg-gray-50">
              {filteredConnections.length > 0 ? (
                <div className="space-y-1">
                  {filteredConnections.map((connection) => (
                    <button
                      key={connection._id}
                      onClick={() =>
                        isGroup
                          ? toggleUserSelection(connection._id)
                          : onStartChat(connection._id)
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedUsers.includes(connection._id)
                          ? "bg-orbit-blue/10 border border-orbit-blue/30"
                          : "hover:bg-gray-100 border border-transparent"
                      }`}
                    >
                      <Avatar
                        src={connection.avatarUrl}
                        name={connection.name}
                        size="md"
                        showStatus
                        isOnline={connection.isOnline}
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">
                          {connection.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{connection.username}
                        </p>
                      </div>
                      {isGroup && selectedUsers.includes(connection._id) && (
                        <div className="w-5 h-5 rounded-full bg-orbit-blue flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {connections.length === 0
                      ? t("chat.noConnections")
                      : t("common.noResults")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-white">
              <Button variant="secondary" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              {isGroup && (
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedUsers.length < 1}
                >
                  {t("chat.createGroup")} ({selectedUsers.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
