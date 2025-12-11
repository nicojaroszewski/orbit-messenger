import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a direct conversation
export const createDirectConversation = mutation({
  args: {
    clerkId: v.string(),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Check if direct conversation already exists
    const existingConversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("type"), "direct"))
      .collect();

    const existingConversation = existingConversations.find((conv) => {
      const participants = conv.participants;
      return (
        participants.length === 2 &&
        participants.includes(currentUser._id) &&
        participants.includes(args.otherUserId)
      );
    });

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      participants: [currentUser._id, args.otherUserId],
      createdBy: currentUser._id,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Create a group conversation
export const createGroupConversation = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Include current user in participants
    const allParticipants = [currentUser._id, ...args.participantIds];

    const conversationId = await ctx.db.insert("conversations", {
      name: args.name,
      type: "group",
      participants: allParticipants,
      createdBy: currentUser._id,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });

    // Create system message
    await ctx.db.insert("messages", {
      conversationId,
      senderId: currentUser._id,
      content: `${currentUser.name} created the group "${args.name}"`,
      type: "system",
      readBy: [currentUser._id],
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Get user's conversations
export const getConversations = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return [];

    // Get all conversations and filter by participant
    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_last_message")
      .order("desc")
      .collect();

    const userConversations = allConversations.filter((conv) =>
      conv.participants.includes(currentUser._id)
    );

    // Fetch participant info for each conversation
    const conversationsWithUsers = await Promise.all(
      userConversations.map(async (conversation) => {
        const participantUsers = await Promise.all(
          conversation.participants.map((id) => ctx.db.get(id))
        );

        const validParticipants = participantUsers.filter(Boolean).map((u) => ({
          _id: u!._id,
          name: u!.name,
          username: u!.username,
          avatarUrl: u!.avatarUrl,
          isOnline: u!.isOnline,
          clerkId: u!.clerkId,
        }));

        const otherParticipant =
          conversation.type === "direct"
            ? validParticipants.find((u) => u._id !== currentUser._id)
            : null;

        // Get unread count
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();

        const unreadCount = messages.filter(
          (m) =>
            m.senderId !== currentUser._id && !m.readBy.includes(currentUser._id)
        ).length;

        return {
          ...conversation,
          participantUsers: validParticipants,
          otherParticipant,
          unreadCount,
        };
      })
    );

    return conversationsWithUsers;
  },
});

// Get single conversation
export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // Check if user is participant
    if (!conversation.participants.includes(currentUser._id)) {
      return null;
    }

    // Fetch participant info
    const participantUsers = await Promise.all(
      conversation.participants.map((id) => ctx.db.get(id))
    );

    const validParticipants = participantUsers.filter(Boolean).map((u) => ({
      _id: u!._id,
      name: u!.name,
      username: u!.username,
      avatarUrl: u!.avatarUrl,
      isOnline: u!.isOnline,
      clerkId: u!.clerkId,
    }));

    const otherParticipant =
      conversation.type === "direct"
        ? validParticipants.find((u) => u._id !== currentUser._id)
        : null;

    return {
      ...conversation,
      participantUsers: validParticipants,
      otherParticipant,
    };
  },
});

// Update conversation (for groups)
export const updateConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (!conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a participant of this conversation");
    }

    if (conversation.type !== "group") {
      throw new Error("Can only update group conversations");
    }

    const updates: Record<string, string | undefined> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(args.conversationId, updates);
    return args.conversationId;
  },
});

// Add participant to group
export const addParticipant = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (!conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a participant of this conversation");
    }

    if (conversation.type !== "group") {
      throw new Error("Can only add participants to group conversations");
    }

    if (conversation.participants.includes(args.userId)) {
      throw new Error("User is already a participant");
    }

    const newUser = await ctx.db.get(args.userId);
    if (!newUser) throw new Error("User to add not found");

    await ctx.db.patch(args.conversationId, {
      participants: [...conversation.participants, args.userId],
    });

    // Create system message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      content: `${currentUser.name} added ${newUser.name} to the group`,
      type: "system",
      readBy: [currentUser._id],
      createdAt: Date.now(),
    });

    return args.conversationId;
  },
});

// Leave group conversation
export const leaveConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (!conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a participant of this conversation");
    }

    if (conversation.type !== "group") {
      throw new Error("Can only leave group conversations");
    }

    const newParticipants = conversation.participants.filter(
      (id) => id !== currentUser._id
    );

    if (newParticipants.length === 0) {
      // Delete conversation if no participants left
      await ctx.db.delete(args.conversationId);
    } else {
      await ctx.db.patch(args.conversationId, {
        participants: newParticipants,
      });

      // Create system message
      await ctx.db.insert("messages", {
        conversationId: args.conversationId,
        senderId: currentUser._id,
        content: `${currentUser.name} left the group`,
        type: "system",
        readBy: [],
        createdAt: Date.now(),
      });
    }

    return args.conversationId;
  },
});
