import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a reaction to a message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    clerkId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Check if user already reacted with this emoji
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_user_message", (q) =>
        q.eq("userId", currentUser._id).eq("messageId", args.messageId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (existingReaction) {
      // Remove the reaction if it already exists (toggle)
      await ctx.db.delete(existingReaction._id);
      return null;
    }

    // Add new reaction
    const reactionId = await ctx.db.insert("reactions", {
      messageId: args.messageId,
      userId: currentUser._id,
      emoji: args.emoji,
      createdAt: Date.now(),
    });

    return reactionId;
  },
});

// Remove a reaction from a message
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    clerkId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    const reaction = await ctx.db
      .query("reactions")
      .withIndex("by_user_message", (q) =>
        q.eq("userId", currentUser._id).eq("messageId", args.messageId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (reaction) {
      await ctx.db.delete(reaction._id);
    }

    return args.messageId;
  },
});

// Get reactions for a message
export const getReactions = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    // Group reactions by emoji and fetch user info
    const reactionGroups: Record<
      string,
      { emoji: string; count: number; users: Array<{ _id: string; name: string; avatarUrl?: string }> }
    > = {};

    for (const reaction of reactions) {
      const user = await ctx.db.get(reaction.userId);
      if (!user) continue;

      if (!reactionGroups[reaction.emoji]) {
        reactionGroups[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }

      reactionGroups[reaction.emoji].count++;
      reactionGroups[reaction.emoji].users.push({
        _id: user._id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
    }

    return Object.values(reactionGroups);
  },
});

// Get reactions for multiple messages (batch)
export const getReactionsForMessages = query({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const result: Record<
      string,
      Array<{ emoji: string; count: number; userIds: string[] }>
    > = {};

    for (const messageId of args.messageIds) {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_message", (q) => q.eq("messageId", messageId))
        .collect();

      // Group by emoji
      const grouped: Record<string, { emoji: string; count: number; userIds: string[] }> = {};

      for (const reaction of reactions) {
        if (!grouped[reaction.emoji]) {
          grouped[reaction.emoji] = {
            emoji: reaction.emoji,
            count: 0,
            userIds: [],
          };
        }
        grouped[reaction.emoji].count++;
        grouped[reaction.emoji].userIds.push(reaction.userId);
      }

      result[messageId] = Object.values(grouped);
    }

    return result;
  },
});
