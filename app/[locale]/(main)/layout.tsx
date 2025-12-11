"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/navigation";
import { useEffect } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isLoaded } = useUser();

  // Sync user to Convex
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const invitationCount = useQuery(
    api.invitations.getInvitationCount,
    user ? { clerkId: user.id } : "skip"
  );
  const unreadCount = useQuery(
    api.messages.getUnreadCount,
    user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (isLoaded && user) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.username || "User",
        username:
          user.username ||
          user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          `user${Date.now()}`,
        avatarUrl: user.imageUrl,
      });
    }
  }, [isLoaded, user, createOrUpdateUser]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-cosmic-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-orbit-blue/30 border-t-orbit-blue animate-spin" />
          <p className="text-nebula-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        invitationCount={invitationCount || 0}
        unreadCount={unreadCount || 0}
      />
      {/* Mobile: full width with top padding for header, Desktop: sidebar margin */}
      <main className="min-h-screen pt-14 md:pt-0 md:ml-64">{children}</main>
    </div>
  );
}
