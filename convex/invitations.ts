import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send invitation
export const sendInvitation = mutation({
  args: {
    fromClerkId: v.string(),
    toUserId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fromUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.fromClerkId))
      .first();

    if (!fromUser) throw new Error("User not found");

    // Check if invitation already exists
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_users", (q) =>
        q.eq("fromUserId", fromUser._id).eq("toUserId", args.toUserId)
      )
      .first();

    if (existingInvitation && existingInvitation.status === "pending") {
      throw new Error("Invitation already sent");
    }

    // Check if reverse invitation exists
    const reverseInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_users", (q) =>
        q.eq("fromUserId", args.toUserId).eq("toUserId", fromUser._id)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (reverseInvitation) {
      // Auto-accept if the other user already sent an invitation
      await ctx.db.patch(reverseInvitation._id, {
        status: "accepted",
        respondedAt: Date.now(),
      });

      // Create connection
      await ctx.db.insert("connections", {
        user1: fromUser._id,
        user2: args.toUserId,
        createdAt: Date.now(),
      });

      return { type: "auto_accepted", invitationId: reverseInvitation._id };
    }

    // Create new invitation
    const invitationId = await ctx.db.insert("invitations", {
      fromUserId: fromUser._id,
      toUserId: args.toUserId,
      status: "pending",
      message: args.message,
      createdAt: Date.now(),
    });

    return { type: "created", invitationId };
  },
});

// Accept invitation
export const acceptInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    if (invitation.toUserId !== user._id) {
      throw new Error("Not authorized to accept this invitation");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer pending");
    }

    // Update invitation
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    // Create connection
    await ctx.db.insert("connections", {
      user1: invitation.fromUserId,
      user2: invitation.toUserId,
      createdAt: Date.now(),
    });

    return args.invitationId;
  },
});

// Decline invitation
export const declineInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    if (invitation.toUserId !== user._id) {
      throw new Error("Not authorized to decline this invitation");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer pending");
    }

    await ctx.db.patch(args.invitationId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    return args.invitationId;
  },
});

// Cancel sent invitation
export const cancelInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    if (invitation.fromUserId !== user._id) {
      throw new Error("Not authorized to cancel this invitation");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer pending");
    }

    await ctx.db.delete(args.invitationId);
    return args.invitationId;
  },
});

// Get received invitations
export const getReceivedInvitations = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_to_user_status", (q) =>
        q.eq("toUserId", user._id).eq("status", "pending")
      )
      .collect();

    // Fetch sender info for each invitation
    const invitationsWithUsers = await Promise.all(
      invitations.map(async (invitation) => {
        const fromUser = await ctx.db.get(invitation.fromUserId);
        return {
          ...invitation,
          fromUser,
        };
      })
    );

    return invitationsWithUsers;
  },
});

// Get sent invitations
export const getSentInvitations = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Fetch recipient info for each invitation
    const invitationsWithUsers = await Promise.all(
      invitations.map(async (invitation) => {
        const toUser = await ctx.db.get(invitation.toUserId);
        return {
          ...invitation,
          toUser,
        };
      })
    );

    return invitationsWithUsers;
  },
});

// Get invitation count
export const getInvitationCount = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return 0;

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_to_user_status", (q) =>
        q.eq("toUserId", user._id).eq("status", "pending")
      )
      .collect();

    return invitations.length;
  },
});

// Check if invitation exists between users
export const checkInvitationStatus = query({
  args: {
    clerkId: v.string(),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return { status: "none" };

    // Check if connected
    const connection1 = await ctx.db
      .query("connections")
      .withIndex("by_user1", (q) => q.eq("user1", user._id))
      .filter((q) => q.eq(q.field("user2"), args.otherUserId))
      .first();

    const connection2 = await ctx.db
      .query("connections")
      .withIndex("by_user2", (q) => q.eq("user2", user._id))
      .filter((q) => q.eq(q.field("user1"), args.otherUserId))
      .first();

    if (connection1 || connection2) {
      return { status: "connected" };
    }

    // Check sent invitation
    const sentInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_users", (q) =>
        q.eq("fromUserId", user._id).eq("toUserId", args.otherUserId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (sentInvitation) {
      return { status: "sent", invitationId: sentInvitation._id };
    }

    // Check received invitation
    const receivedInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_users", (q) =>
        q.eq("fromUserId", args.otherUserId).eq("toUserId", user._id)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (receivedInvitation) {
      return { status: "received", invitationId: receivedInvitation._id };
    }

    return { status: "none" };
  },
});
