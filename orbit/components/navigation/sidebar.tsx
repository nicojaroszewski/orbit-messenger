"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Mail,
  Settings,
  Rocket,
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Orbit</span>
        </Link>
        <div className="w-10">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300",
          "md:translate-x-0 md:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orbit-blue to-stellar-violet flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Orbit</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
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
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                  <span className="text-sm font-medium">
                    {item.key === "dashboard" && t("dashboard.welcome", { name: "" }).replace(", ", "")}
                    {item.key === "chats" && t("chat.title")}
                    {item.key === "discover" && t("discover.title")}
                    {item.key === "invitations" && t("invitations.title")}
                    {item.key === "settings" && t("common.settings")}
                  </span>

                  {/* Badge */}
                  {badge > 0 && (
                    <span className="absolute right-3 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-stellar-violet rounded-full">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{user?.username || user?.primaryEmailAddress?.emailAddress?.split("@")[0]}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
