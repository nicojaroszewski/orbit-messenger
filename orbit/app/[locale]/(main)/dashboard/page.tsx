"use client";

import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, Avatar } from "@/components/ui";
import { staggerContainer, listItem } from "@/lib/animations";
import {
  MessageSquare,
  Users,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useUser();

  const conversations = useQuery(
    api.conversations.getConversations,
    user ? { clerkId: user.id } : "skip"
  );
  const invitations = useQuery(
    api.invitations.getReceivedInvitations,
    user ? { clerkId: user.id } : "skip"
  );
  const connections = useQuery(
    api.users.getConnections,
    user ? { clerkId: user.id } : "skip"
  );

  const recentChats = conversations?.slice(0, 3) || [];
  const pendingInvites = invitations?.slice(0, 3) || [];

  return (
    <div className="p-6 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Welcome Header */}
        <motion.div variants={listItem} className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-star-white">
            {t("dashboard.welcome", { name: user?.firstName || "" })}
          </h1>
          <p className="text-nebula-gray">
            {new Date().toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={listItem} className="grid grid-cols-3 gap-4">
          {[
            {
              icon: MessageSquare,
              value: conversations?.length || 0,
              label: t("chat.title"),
              color: "from-orbit-blue to-blue-400",
            },
            {
              icon: Users,
              value: connections?.length || 0,
              label: t("profile.connections"),
              color: "from-signal-teal to-teal-400",
            },
            {
              icon: Mail,
              value: invitations?.length || 0,
              label: t("invitations.pending"),
              color: "from-stellar-violet to-purple-400",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} variant="glass" className="text-center py-6">
                <CardContent>
                  <div
                    className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} items-center justify-center mb-3`}
                  >
                    <Icon className="w-6 h-6 text-star-white" />
                  </div>
                  <p className="text-2xl font-bold text-star-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-nebula-gray">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={listItem}>
          <h2 className="text-lg font-semibold text-star-white mb-4">
            {t("dashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/${locale}/chats`}>
              <Card variant="glass" interactive className="h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orbit-blue/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-orbit-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-star-white">
                      {t("dashboard.startChat")}
                    </p>
                    <p className="text-sm text-nebula-gray">
                      {t("chat.newChat")}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-nebula-gray" />
                </CardContent>
              </Card>
            </Link>

            <Link href={`/${locale}/discover`}>
              <Card variant="glass" interactive className="h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-signal-teal/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-signal-teal" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-star-white">
                      {t("dashboard.findPeople")}
                    </p>
                    <p className="text-sm text-nebula-gray">
                      {t("discover.subtitle")}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-nebula-gray" />
                </CardContent>
              </Card>
            </Link>

            <Link href={`/${locale}/invitations`}>
              <Card variant="glass" interactive className="h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stellar-violet/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-stellar-violet" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-star-white">
                      {t("dashboard.viewInvites")}
                    </p>
                    <p className="text-sm text-nebula-gray">
                      {invitations?.length || 0} {t("invitations.pending").toLowerCase()}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-nebula-gray" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Recent Chats */}
        <motion.div variants={listItem}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-star-white">
              {t("dashboard.recentChats")}
            </h2>
            <Link href={`/${locale}/chats`}>
              <Button variant="ghost" size="sm">
                {t("common.settings")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {recentChats.length > 0 ? (
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <Link key={chat._id} href={`/${locale}/chat/${chat._id}`}>
                  <Card variant="glass" interactive>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar
                        src={
                          chat.type === "direct"
                            ? chat.otherParticipant?.avatarUrl
                            : chat.avatarUrl
                        }
                        name={
                          chat.type === "direct"
                            ? chat.otherParticipant?.name || "User"
                            : chat.name || "Group"
                        }
                        size="md"
                        showStatus={chat.type === "direct"}
                        isOnline={chat.otherParticipant?.isOnline}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-star-white truncate">
                          {chat.type === "direct"
                            ? chat.otherParticipant?.name
                            : chat.name}
                        </p>
                        <p className="text-sm text-nebula-gray truncate">
                          {chat.lastMessagePreview || t("chat.noChats")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-nebula-gray">
                          {formatRelativeTime(chat.lastMessageAt, locale)}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-orbit-blue text-star-white rounded-full mt-1">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <Sparkles className="w-12 h-12 text-nebula-gray mx-auto mb-4" />
                <p className="text-star-white font-medium mb-2">
                  {t("chat.noChats")}
                </p>
                <p className="text-sm text-nebula-gray mb-4">
                  {t("chat.noChatsDescription")}
                </p>
                <Link href={`/${locale}/discover`}>
                  <Button>{t("discover.title")}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <motion.div variants={listItem}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-star-white flex items-center gap-2">
                {t("invitations.received")}
                <span className="px-2 py-0.5 text-xs bg-stellar-violet rounded-full">
                  {pendingInvites.length}
                </span>
              </h2>
              <Link href={`/${locale}/invitations`}>
                <Button variant="ghost" size="sm">
                  {t("common.settings")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <Card key={invite._id} variant="glass">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar
                      src={invite.fromUser?.avatarUrl}
                      name={invite.fromUser?.name || "User"}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-star-white">
                        {invite.fromUser?.name}
                      </p>
                      <p className="text-sm text-nebula-gray">
                        @{invite.fromUser?.username}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        {t("invitations.decline")}
                      </Button>
                      <Button size="sm">{t("invitations.accept")}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
