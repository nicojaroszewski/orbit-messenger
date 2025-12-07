import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    content: v.string(),
    type: v.optional(
      v.union(
        v.literal("text"),
        v.literal("image"),
        v.literal("file")
      )
    ),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
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

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      content: args.content,
      type: args.type || "text",
      attachmentUrl: args.attachmentUrl,
      attachmentName: args.attachmentName,
      readBy: [currentUser._id],
      createdAt: Date.now(),
    });

    // Update conversation's last message
    const preview =
      args.type === "image"
        ? "📷 Image"
        : args.type === "file"
        ? "📎 File"
        : args.content.slice(0, 50);

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      lastMessagePreview: preview,
    });

    // Clear typing indicator
    const typingIndicator = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), currentUser._id))
      .first();

    if (typingIndicator) {
      await ctx.db.delete(typingIndicator._id);
    }

    return messageId;
  },
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    if (!conversation.participants.includes(currentUser._id)) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit || 50);

    // Fetch sender info for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: sender
            ? {
                _id: sender._id,
                name: sender.name,
                username: sender.username,
                avatarUrl: sender.avatarUrl,
                clerkId: sender.clerkId,
              }
            : null,
        };
      })
    );

    return messagesWithSenders.reverse();
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Update unread messages
    for (const message of messages) {
      if (
        message.senderId !== currentUser._id &&
        !message.readBy.includes(currentUser._id)
      ) {
        await ctx.db.patch(message._id, {
          readBy: [...message.readBy, currentUser._id],
        });
      }
    }
  },
});

// Delete message (soft delete)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) throw new Error("User not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== currentUser._id) {
      throw new Error("Can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
      content: "This message was deleted",
    });

    return args.messageId;
  },
});

// Set typing indicator
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return;

    const existingIndicator = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), currentUser._id))
      .first();

    if (args.isTyping) {
      if (existingIndicator) {
        await ctx.db.patch(existingIndicator._id, {
          expiresAt: Date.now() + 5000, // 5 seconds
        });
      } else {
        await ctx.db.insert("typingIndicators", {
          conversationId: args.conversationId,
          userId: currentUser._id,
          expiresAt: Date.now() + 5000,
        });
      }
    } else {
      if (existingIndicator) {
        await ctx.db.delete(existingIndicator._id);
      }
    }
  },
});

// Get typing indicators for a conversation
export const getTypingIndicators = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return [];

    const now = Date.now();

    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("userId"), currentUser._id),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .collect();

    // Fetch user info for each indicator
    const indicatorsWithUsers = await Promise.all(
      indicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.userId);
        return {
          ...indicator,
          user,
        };
      })
    );

    return indicatorsWithUsers;
  },
});

// Get unread message count for user
export const getUnreadCount = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) return 0;

    // Get all user's conversations
    const allConversations = await ctx.db.query("conversations").collect();

    const userConversations = allConversations.filter((conv) =>
      conv.participants.includes(currentUser._id)
    );

    let totalUnread = 0;

    for (const conversation of userConversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();

      totalUnread += messages.filter(
        (m) =>
          m.senderId !== currentUser._id && !m.readBy.includes(currentUser._id)
      ).length;
    }

    return totalUnread;
  },
});
