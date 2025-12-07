import { Id } from "@/convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  status?: string;
  lastSeen: number;
  isOnline: boolean;
  settings: UserSettings;
  createdAt: number;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  language: "en" | "ru";
}

export interface Conversation {
  _id: Id<"conversations">;
  name?: string;
  type: "direct" | "group";
  participants: Id<"users">[];
  createdBy: Id<"users">;
  avatarUrl?: string;
  lastMessageAt: number;
  lastMessagePreview?: string;
  createdAt: number;
}

export interface Message {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
  content: string;
  type: "text" | "image" | "file" | "system";
  attachmentUrl?: string;
  attachmentName?: string;
  readBy: Id<"users">[];
  deletedAt?: number;
  createdAt: number;
}

export interface Invitation {
  _id: Id<"invitations">;
  fromUserId: Id<"users">;
  toUserId: Id<"users">;
  status: "pending" | "accepted" | "declined";
  message?: string;
  createdAt: number;
  respondedAt?: number;
}

export interface TypingIndicator {
  _id: Id<"typingIndicators">;
  conversationId: Id<"conversations">;
  userId: Id<"users">;
  expiresAt: number;
}

export interface Connection {
  _id: Id<"connections">;
  user1: Id<"users">;
  user2: Id<"users">;
  createdAt: number;
}

// Extended types with user info
export interface ConversationWithUsers extends Conversation {
  participantUsers: User[];
  otherParticipant?: User; // For direct chats
}

export interface MessageWithSender extends Message {
  sender: User;
}

export interface InvitationWithUsers extends Invitation {
  fromUser: User;
  toUser: User;
}
