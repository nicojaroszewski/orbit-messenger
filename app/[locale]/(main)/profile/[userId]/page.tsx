"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Avatar } from "@/components/ui";
import { SkeletonProfile } from "@/components/ui";
import { staggerContainer, listItem } from "@/lib/animations";
import {
  MessageCircle,
  UserPlus,
  UserMinus,
  Calendar,
  Users,
  ArrowLeft,
  Edit2,
  Loader2,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { user: currentUser } = useUser();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const userId = params.userId as Id<"users">;

  const profile = useQuery(api.users.getUserProfile, { userId });
  const connectionStatus = useQuery(
    api.users.checkConnection,
    currentUser ? { clerkId: currentUser.id, otherUserId: userId } : "skip"
  );
  const invitationStatus = useQuery(
    api.invitations.checkInvitationStatus,
    currentUser ? { clerkId: currentUser.id, otherUserId: userId } : "skip"
  );

  const sendInvitation = useMutation(api.invitations.sendInvitation);
  const createConversation = useMutation(api.conversations.createDirectConversation);

  const handleStartChat = async () => {
    if (!currentUser || !profile) return;
    setIsStartingChat(true);
    try {
      const conversationId = await createConversation({
        clerkId: currentUser.id,
        otherUserId: userId,
      });
      router.push(`/${locale}/chat/${conversationId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
    setIsStartingChat(false);
  };

  const handleSendInvite = async () => {
    if (!currentUser) return;
    try {
      await sendInvitation({
        fromClerkId: currentUser.id,
        toUserId: userId,
      });
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };

  const formatJoinDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (!profile) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <SkeletonProfile />
        </div>
      </div>
    );
  }

  const isSelf = connectionStatus?.isSelf;
  const isConnected = connectionStatus?.isConnected;
  const hasPendingInvite =
    invitationStatus?.status === "sent" || invitationStatus?.status === "received";

  return (
    <div className="p-6 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Back Button */}
        <motion.div variants={listItem}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Button>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={listItem}>
          <Card variant="glass" className="overflow-hidden">
            {/* Header Background */}
            <div className="h-32 bg-gradient-to-br from-orbit-blue/30 via-stellar-violet/20 to-signal-teal/10 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orbit-blue/20 via-transparent to-transparent" />
            </div>

            <CardContent className="relative pt-0 -mt-16">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar
                    src={profile.avatarUrl}
                    name={profile.name}
                    size="xl"
                    showStatus
                    isOnline={profile.isOnline}
                    className="border-4 border-orbital-navy shadow-lg"
                  />
                  {isSelf && (
                    <button
                      onClick={() => router.push(`/${locale}/settings`)}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-orbit-blue text-white shadow-lg hover:bg-orbit-blue/90 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Name & Username */}
                <h1 className="text-2xl font-bold text-star-white mt-4">
                  {profile.name}
                </h1>
                <p className="text-nebula-gray">@{profile.username}</p>

                {/* Status */}
                {profile.status && (
                  <p className="text-sm text-star-white/80 mt-2 px-4 py-1 rounded-full bg-lunar-graphite/50">
                    {profile.status}
                  </p>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-nebula-gray mt-4 max-w-md">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-8 mt-6">
                  <div className="flex items-center gap-2 text-nebula-gray">
                    <Users className="w-4 h-4" />
                    <span className="text-star-white font-semibold">
                      {profile.connectionCount}
                    </span>
                    <span>{t("profile.connections")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-nebula-gray">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {t("profile.joined", { date: formatJoinDate(profile.createdAt) })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!isSelf && (
                  <div className="flex items-center gap-3 mt-6">
                    {isConnected ? (
                      <>
                        <Button
                          onClick={handleStartChat}
                          disabled={isStartingChat}
                          className="gap-2"
                        >
                          {isStartingChat ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MessageCircle className="w-4 h-4" />
                          )}
                          {t("profile.startChat")}
                        </Button>
                        <Button variant="secondary" className="gap-2">
                          <UserMinus className="w-4 h-4" />
                          {t("profile.removeConnection")}
                        </Button>
                      </>
                    ) : hasPendingInvite ? (
                      <Button variant="secondary" disabled className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        {invitationStatus?.status === "sent"
                          ? t("discover.inviteSent")
                          : t("invitations.accept")}
                      </Button>
                    ) : (
                      <Button onClick={handleSendInvite} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        {t("discover.sendInvite")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Online Status Indicator */}
        <motion.div variants={listItem}>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    profile.isOnline
                      ? "bg-aurora-green animate-pulse"
                      : "bg-nebula-gray"
                  }`}
                />
                <span className="text-star-white">
                  {profile.isOnline
                    ? t("common.online")
                    : `${t("common.offline")} - ${formatLastSeen(
                        profile.lastSeen,
                        locale,
                        t
                      )}`}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function formatLastSeen(
  timestamp: number,
  locale: string,
  t: ReturnType<typeof useTranslations>
): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("common.justNow");
  if (minutes < 60) return t("common.minutesAgo", { count: minutes });
  if (hours < 24) return t("common.hoursAgo", { count: hours });
  return t("common.daysAgo", { count: days });
}
