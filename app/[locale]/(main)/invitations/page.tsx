"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Avatar } from "@/components/ui";
import { staggerContainer, listItem } from "@/lib/animations";
import { Mail, Check, X, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function InvitationsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const receivedInvitations = useQuery(
    api.invitations.getReceivedInvitations,
    user ? { clerkId: user.id } : "skip"
  );

  const sentInvitations = useQuery(
    api.invitations.getSentInvitations,
    user ? { clerkId: user.id } : "skip"
  );

  const displayInvitations =
    activeTab === "received" ? receivedInvitations : sentInvitations;

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
            {t("invitations.title")}
          </h1>
          <p className="text-nebula-gray">{t("invitations.subtitle")}</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={listItem} className="flex gap-2">
          <Button
            variant={activeTab === "received" ? "primary" : "secondary"}
            onClick={() => setActiveTab("received")}
          >
            {t("invitations.received")}
            {receivedInvitations && receivedInvitations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {receivedInvitations.length}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === "sent" ? "primary" : "secondary"}
            onClick={() => setActiveTab("sent")}
          >
            {t("invitations.sent")}
            {sentInvitations && sentInvitations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {sentInvitations.length}
              </span>
            )}
          </Button>
        </motion.div>

        {/* Invitations List */}
        <motion.div variants={listItem}>
          {displayInvitations && displayInvitations.length > 0 ? (
            <div className="space-y-3">
              {displayInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation._id}
                  invitation={invitation}
                  type={activeTab}
                  clerkId={user?.id || ""}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <Mail className="w-12 h-12 text-nebula-gray mx-auto mb-4" />
                <p className="text-star-white font-medium mb-2">
                  {t("invitations.noInvitations")}
                </p>
                <p className="text-sm text-nebula-gray">
                  {t("invitations.noInvitationsDescription")}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

interface InvitationCardProps {
  invitation: {
    _id: Id<"invitations">;
    message?: string;
    createdAt: number;
    fromUser?: {
      _id: Id<"users">;
      name: string;
      username: string;
      avatarUrl?: string;
      isOnline: boolean;
    } | null;
    toUser?: {
      _id: Id<"users">;
      name: string;
      username: string;
      avatarUrl?: string;
      isOnline: boolean;
    } | null;
  };
  type: "received" | "sent";
  clerkId: string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

function InvitationCard({
  invitation,
  type,
  clerkId,
  locale,
  t,
}: InvitationCardProps) {
  const [isLoading, setIsLoading] = useState<"accept" | "decline" | null>(null);

  const acceptInvitation = useMutation(api.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.invitations.declineInvitation);
  const cancelInvitation = useMutation(api.invitations.cancelInvitation);

  const displayUser = type === "received" ? invitation.fromUser : invitation.toUser;

  const handleAccept = async () => {
    setIsLoading("accept");
    try {
      await acceptInvitation({
        invitationId: invitation._id,
        clerkId,
      });
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
    setIsLoading(null);
  };

  const handleDecline = async () => {
    setIsLoading("decline");
    try {
      if (type === "received") {
        await declineInvitation({
          invitationId: invitation._id,
          clerkId,
        });
      } else {
        await cancelInvitation({
          invitationId: invitation._id,
          clerkId,
        });
      }
    } catch (error) {
      console.error("Failed to decline/cancel invitation:", error);
    }
    setIsLoading(null);
  };

  return (
    <Card variant="glass">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar
            src={displayUser?.avatarUrl}
            name={displayUser?.name || "User"}
            size="lg"
            showStatus
            isOnline={displayUser?.isOnline}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-star-white">
                  {displayUser?.name}
                </p>
                <p className="text-sm text-nebula-gray">
                  @{displayUser?.username}
                </p>
              </div>
              <p className="text-xs text-nebula-gray shrink-0">
                {formatRelativeTime(invitation.createdAt, locale)}
              </p>
            </div>
            {invitation.message && (
              <p className="mt-2 text-sm text-star-white/80 bg-lunar-graphite/50 rounded-lg p-3">
                "{invitation.message}"
              </p>
            )}
            <div className="flex gap-2 mt-4">
              {type === "received" ? (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDecline}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "decline" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        {t("invitations.decline")}
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "accept" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        {t("invitations.accept")}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDecline}
                  disabled={isLoading !== null}
                >
                  {isLoading === "decline" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      {t("invitations.cancel")}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
