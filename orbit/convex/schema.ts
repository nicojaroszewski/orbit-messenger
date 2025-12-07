import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    status: v.optional(v.string()),
    lastSeen: v.number(),
    isOnline: v.boolean(),
    settings: v.object({
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
      notifications: v.boolean(),
      language: v.union(v.literal("en"), v.literal("ru")),
    }),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["clerkId"],
    })
    .searchIndex("search_username", {
      searchField: "username",
      filterFields: ["clerkId"],
    }),

  // Conversations table (1:1 and groups)
  conversations: defineTable({
    name: v.optional(v.string()),
    type: v.union(v.literal("direct"), v.literal("group")),
    participants: v.array(v.id("users")),
    createdBy: v.id("users"),
    avatarUrl: v.optional(v.string()),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_last_message", ["lastMessageAt"]),

  // Messages table
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system")
    ),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
    readBy: v.array(v.id("users")),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_created", ["conversationId", "createdAt"]),

  // Invitations table
  invitations: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_to_user", ["toUserId"])
    .index("by_to_user_status", ["toUserId", "status"])
    .index("by_from_user", ["fromUserId"])
    .index("by_users", ["fromUserId", "toUserId"]),

  // Typing indicators table
  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    expiresAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_expires", ["expiresAt"]),

  // Connections table (accepted invitations become connections)
  connections: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"]),
});
