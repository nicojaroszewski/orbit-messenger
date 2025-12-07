import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user from Clerk
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        lastSeen: Date.now(),
        isOnline: true,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      username: args.username,
      avatarUrl: args.avatarUrl,
      lastSeen: Date.now(),
      isOnline: true,
      settings: {
        theme: "dark",
        notifications: true,
        language: "en",
      },
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Get current user by Clerk ID
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by username
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
  },
});

// Search users by name or username
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    currentUserClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm || args.searchTerm.length < 2) {
      return [];
    }

    const searchLower = args.searchTerm.toLowerCase();

    // Get all users and filter manually (for simplicity)
    const allUsers = await ctx.db.query("users").collect();

    return allUsers.filter(
      (user) =>
        user.clerkId !== args.currentUserClerkId &&
        (user.name.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower))
    ).slice(0, 20);
  },
});

// Get suggested users (users not connected yet)
export const getSuggestedUsers = query({
  args: { currentUserClerkId: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.currentUserClerkId))
      .first();

    if (!currentUser) return [];

    // Get all connections for current user
    const connections1 = await ctx.db
      .query("connections")
      .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
      .collect();

    const connections2 = await ctx.db
      .query("connections")
      .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
      .collect();

    const connectedUserIds = new Set([
      ...connections1.map((c) => c.user2),
      ...connections2.map((c) => c.user1),
    ]);

    // Get pending invitations
    const sentInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", currentUser._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const pendingUserIds = new Set(sentInvitations.map((i) => i.toUserId));

    // Get all users except current user and connected users
    const allUsers = await ctx.db.query("users").collect();

    return allUsers
      .filter(
        (user) =>
          user._id !== currentUser._id &&
          !connectedUserIds.has(user._id) &&
          !pendingUserIds.has(user._id)
      )
      .slice(0, 10);
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const updates: Record<string, string | undefined> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// Update user settings
export const updateSettings = mutation({
  args: {
    clerkId: v.string(),
    settings: v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
      notifications: v.optional(v.boolean()),
      language: v.optional(v.union(v.literal("en"), v.literal("ru"))),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const newSettings = {
      ...user.settings,
      ...Object.fromEntries(
        Object.entries(args.settings).filter(([, v]) => v !== undefined)
      ),
    };

    await ctx.db.patch(user._id, { settings: newSettings });
    return user._id;
  },
});

// Update online status
export const updateOnlineStatus = mutation({
  args: {
    clerkId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return;

    await ctx.db.patch(user._id, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});

// Get user connections
export const getConnections = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    const connections1 = await ctx.db
      .query("connections")
      .withIndex("by_user1", (q) => q.eq("user1", user._id))
      .collect();

    const connections2 = await ctx.db
      .query("connections")
      .withIndex("by_user2", (q) => q.eq("user2", user._id))
      .collect();

    const connectedUserIds = [
      ...connections1.map((c) => c.user2),
      ...connections2.map((c) => c.user1),
    ];

    const connectedUsers = await Promise.all(
      connectedUserIds.map((id) => ctx.db.get(id))
    );

    return connectedUsers.filter(Boolean);
  },
});
