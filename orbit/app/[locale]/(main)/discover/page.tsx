"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Avatar, Input } from "@/components/ui";
import { staggerContainer, listItem } from "@/lib/animations";
import { Search, UserPlus, Check, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function DiscoverPage() {
  const t = useTranslations();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingTo, setSendingTo] = useState<Id<"users"> | null>(null);

  const searchResults = useQuery(
    api.users.searchUsers,
    user && searchTerm.length >= 2
      ? { searchTerm, currentUserClerkId: user.id }
      : "skip"
  );

  const suggestedUsers = useQuery(
    api.users.getSuggestedUsers,
    user ? { currentUserClerkId: user.id } : "skip"
  );

  const sendInvitation = useMutation(api.invitations.sendInvitation);

  const handleSendInvite = async (toUserId: Id<"users">) => {
    if (!user) return;
    setSendingTo(toUserId);
    try {
      await sendInvitation({
        fromClerkId: user.id,
        toUserId,
      });
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
    setSendingTo(null);
  };

  const displayUsers = searchTerm.length >= 2 ? searchResults : suggestedUsers;

  return (
    <div className="p-6 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={listItem} className="space-y-2">
          <h1 className="text-3xl font-bold text-star-white">
            {t("discover.title")}
          </h1>
          <p className="text-nebula-gray">{t("discover.subtitle")}</p>
        </motion.div>

        {/* Search */}
        <motion.div variants={listItem}>
          <Input
            placeholder={t("discover.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            className="text-lg py-3"
          />
        </motion.div>

        {/* Section Title */}
        <motion.div variants={listItem}>
          <h2 className="text-lg font-semibold text-star-white">
            {searchTerm.length >= 2
              ? `${t("common.search")} "${searchTerm}"`
              : t("discover.suggested")}
          </h2>
        </motion.div>

        {/* Users Grid */}
        <motion.div variants={listItem}>
          {displayUsers && displayUsers.length > 0 ? (
            <div className="grid gap-4">
              {displayUsers.map((userItem) => (
                <UserCard
                  key={userItem._id}
                  user={userItem}
                  currentUserId={user?.id || ""}
                  onSendInvite={handleSendInvite}
                  isSending={sendingTo === userItem._id}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <Search className="w-12 h-12 text-nebula-gray mx-auto mb-4" />
                <p className="text-star-white font-medium mb-2">
                  {t("discover.noResults")}
                </p>
                <p className="text-sm text-nebula-gray">
                  {t("discover.noResultsDescription")}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

interface UserCardProps {
  user: {
    _id: Id<"users">;
    name: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    isOnline: boolean;
  };
  currentUserId: string;
  onSendInvite: (userId: Id<"users">) => void;
  isSending: boolean;
  t: ReturnType<typeof useTranslations>;
}

function UserCard({
  user,
  currentUserId,
  onSendInvite,
  isSending,
  t,
}: UserCardProps) {
  const invitationStatus = useQuery(
    api.invitations.checkInvitationStatus,
    currentUserId
      ? { clerkId: currentUserId, otherUserId: user._id }
      : "skip"
  );

  const getButtonContent = () => {
    if (isSending) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    switch (invitationStatus?.status) {
      case "connected":
        return (
          <>
            <Check className="w-4 h-4 mr-1" />
            {t("discover.alreadyConnected")}
          </>
        );
      case "sent":
        return (
          <>
            <Check className="w-4 h-4 mr-1" />
            {t("discover.inviteSent")}
          </>
        );
      case "received":
        return t("invitations.accept");
      default:
        return (
          <>
            <UserPlus className="w-4 h-4 mr-1" />
            {t("discover.sendInvite")}
          </>
        );
    }
  };

  const isDisabled =
    isSending ||
    invitationStatus?.status === "connected" ||
    invitationStatus?.status === "sent";

  return (
    <Card variant="glass" interactive>
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar
          src={user.avatarUrl}
          name={user.name}
          size="lg"
          showStatus
          isOnline={user.isOnline}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-star-white">{user.name}</p>
          <p className="text-sm text-nebula-gray">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-nebula-gray/80 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant={
            invitationStatus?.status === "connected" ||
            invitationStatus?.status === "sent"
              ? "secondary"
              : "primary"
          }
          disabled={isDisabled}
          onClick={() => onSendInvite(user._id)}
        >
          {getButtonContent()}
        </Button>
      </CardContent>
    </Card>
  );
}
