"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Mail,
  Settings,
  Rocket,
} from "lucide-react";

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "chats", icon: MessageSquare, href: "/chats" },
  { key: "discover", icon: Users, href: "/discover" },
  { key: "invitations", icon: Mail, href: "/invitations" },
  { key: "settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  invitationCount?: number;
  unreadCount?: number;
}

export function Sidebar({ invitationCount = 0, unreadCount = 0 }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useUser();

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-orbital-navy border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <Link
        href={`/${locale}/dashboard`}
        className="h-16 flex items-center gap-3 px-4 md:px-6 border-b border-white/5"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet flex items-center justify-center shrink-0">
          <Rocket className="w-5 h-5 text-star-white" />
        </div>
        <span className="hidden md:block text-xl font-bold text-star-white">
          Orbit
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 md:px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);
          const badge =
            item.key === "invitations"
              ? invitationCount
              : item.key === "chats"
              ? unreadCount
              : 0;

          return (
            <Link key={item.key} href={href}>
              <motion.div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-orbit-blue/10 text-orbit-blue"
                    : "text-nebula-gray hover:bg-lunar-graphite hover:text-star-white"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-8 bg-orbit-blue rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className="w-5 h-5 shrink-0" />
                <span className="hidden md:block text-sm font-medium">
                  {item.key === "dashboard" && t("dashboard.welcome", { name: "" }).replace(", ", "")}
                  {item.key === "chats" && t("chat.title")}
                  {item.key === "discover" && t("discover.title")}
                  {item.key === "invitations" && t("invitations.title")}
                  {item.key === "settings" && t("common.settings")}
                </span>

                {/* Badge */}
                {badge > 0 && (
                  <span className="absolute right-2 md:right-3 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-star-white bg-stellar-violet rounded-full">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "bg-orbital-navy border border-white/10",
                userButtonPopoverActionButton:
                  "text-star-white hover:bg-lunar-graphite",
                userButtonPopoverActionButtonText: "text-star-white",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-medium text-star-white truncate">
              {user?.fullName || user?.username}
            </p>
            <p className="text-xs text-nebula-gray truncate">
              @{user?.username || user?.primaryEmailAddress?.emailAddress?.split("@")[0]}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
