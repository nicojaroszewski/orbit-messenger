import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate an upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get the URL for a stored file
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Send a message with an attachment
export const sendMessageWithAttachment = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("image"),
      v.literal("file"),
      v.literal("voice")
    ),
    storageId: v.id("_storage"),
    attachmentName: v.string(),
    attachmentSize: v.number(),
    replyToId: v.optional(v.id("messages")),
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

    // Get the file URL from storage
    const attachmentUrl = await ctx.storage.getUrl(args.storageId);

    if (!attachmentUrl) {
      throw new Error("Failed to get file URL");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      content: args.content,
      type: args.type,
      attachmentUrl,
      attachmentName: args.attachmentName,
      attachmentSize: args.attachmentSize,
      replyToId: args.replyToId,
      readBy: [currentUser._id],
      createdAt: Date.now(),
    });

    // Update conversation's last message
    const preview =
      args.type === "image"
        ? "📷 Image"
        : args.type === "voice"
        ? "🎤 Voice message"
        : `📎 ${args.attachmentName}`;

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

// Delete a file from storage
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
