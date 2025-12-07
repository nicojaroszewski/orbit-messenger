# ORBIT - Social Messaging Platform Implementation Plan

## Project Overview

**Orbit** is a next-generation social messaging platform with a cosmic-modern aesthetic. Users can sign up, discover others, send invitations, and start private or group chats. The design language centers around orbital metaphors: gravity, presence, and celestial connection.

---

## Technology Stack

### Core Framework
- **Next.js 15** (App Router) - Full-stack React framework
- **TypeScript** - Type safety throughout
- **Tailwind CSS v4** - Styling with custom cosmic design system

### Backend Services
- **Convex** - Real-time database & backend functions
  - Development URL: `https://precious-snake-597.convex.cloud`
  - Real-time subscriptions for instant messaging
  - File storage for media attachments
  - User presence tracking

### Authentication
- **Clerk** - Complete auth solution with social providers
  - Publishable Key: `pk_test_bW9kZWwtYW1vZWJhLTUzLmNsZXJrLmFjY291bnRzLmRldiQ`
  - JWT Template Issuer: `https://model-amoeba-53.clerk.accounts.dev`
  - User profiles, avatars, sessions

### Internationalization
- **next-intl** - i18n routing (/en, /ru)
  - English (default)
  - Russian
  - No hardcoded strings

### Image Assets
- **Unsplash via Jina AI** - All unique images
  - API Keys provided for scraping

---

## Design System: Cosmic Modern

### Color Palette (CSS Variables)

```css
:root {
  /* Backgrounds */
  --cosmic-midnight: #0A0F1A;      /* Primary background */
  --orbital-navy: #111827;         /* Secondary panels */
  --lunar-graphite: #1F2937;       /* Tertiary/dividers */

  /* Accents */
  --orbit-blue: #3B82F6;           /* Primary CTA */
  --stellar-violet: #8B5CF6;       /* Invites/highlights */
  --signal-teal: #14B8A6;          /* Status indicators */

  /* Text */
  --star-white: #F8FAFC;           /* Primary text */
  --nebula-gray: #94A3B8;          /* Secondary text */

  /* Semantic */
  --aurora-green: #10B981;         /* Success */
  --solar-amber: #FBBF24;          /* Warning */
  --flare-red: #EF4444;            /* Error */
  --pulsar-blue: #3B82F6;          /* Live activity */

  /* Premium gradient */
  --cosmic-titanium-start: #334155;
  --cosmic-titanium-end: #1E293B;
}
```

### Typography
- **Display Font**: "Cabinet Grotesk" or "Clash Display" - Headlines
- **Body Font**: "Satoshi" or "General Sans" - UI text
- **Mono Font**: "JetBrains Mono" - Code/timestamps

### Motion Principles
- Orbital/elastic transitions (spring physics)
- Magnetic drag interactions
- Gravitational hover effects
- Subtle parallax on scroll
- Message arrival trajectories
- Pulse animations for live activity

### Component Patterns
- Circular avatars with glow halos
- Floating card layers with depth
- Nebula gradient backgrounds
- Soft bloom glows on focus
- Orbital path indicators

---

## Architecture Overview

```
orbit/
├── app/
│   ├── [locale]/                    # i18n routing
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Landing page
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── sign-up/[[...sign-up]]/
│   │   ├── (main)/                  # Authenticated routes
│   │   │   ├── layout.tsx           # App shell with sidebar
│   │   │   ├── dashboard/           # User dashboard
│   │   │   ├── chats/               # Chat list
│   │   │   ├── chat/[chatId]/       # Individual chat
│   │   │   ├── discover/            # Find users
│   │   │   ├── invitations/         # Pending invites
│   │   │   ├── settings/            # User settings
│   │   │   └── profile/[userId]/    # User profiles
│   │   └── not-found.tsx
│   └── api/
│       └── convex/                  # Convex HTTP actions
├── components/
│   ├── ui/                          # Core UI components
│   ├── chat/                        # Chat-specific components
│   ├── navigation/                  # Header, sidebar, tabs
│   ├── user/                        # User-related components
│   └── landing/                     # Landing page sections
├── convex/
│   ├── schema.ts                    # Database schema
│   ├── users.ts                     # User functions
│   ├── chats.ts                     # Chat functions
│   ├── messages.ts                  # Message functions
│   ├── invitations.ts               # Invitation functions
│   └── presence.ts                  # Online status
├── lib/
│   ├── convex.ts                    # Convex client
│   ├── utils.ts                     # Utility functions
│   └── animations.ts                # Motion presets
├── messages/
│   ├── en.json                      # English translations
│   └── ru.json                      # Russian translations
├── hooks/
│   ├── use-chat.ts
│   ├── use-presence.ts
│   └── use-typing.ts
└── types/
    └── index.ts                     # TypeScript types
```

---

## Database Schema (Convex)

### Tables

```typescript
// Users (synced from Clerk)
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
    theme: v.string(),
    notifications: v.boolean(),
    language: v.string(),
  }),
  createdAt: v.number(),
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_username", ["username"])
  .index("by_email", ["email"])

// Conversations (1:1 and groups)
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
  .index("by_participant", ["participants"])
  .index("by_last_message", ["lastMessageAt"])

// Messages
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
  .index("by_created_at", ["conversationId", "createdAt"])

// Invitations
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
  .index("by_to_user", ["toUserId", "status"])
  .index("by_from_user", ["fromUserId"])

// Typing indicators
typingIndicators: defineTable({
  conversationId: v.id("conversations"),
  userId: v.id("users"),
  expiresAt: v.number(),
})
  .index("by_conversation", ["conversationId"])

// User presence
presence: defineTable({
  userId: v.id("users"),
  isOnline: v.boolean(),
  lastSeen: v.number(),
})
  .index("by_user", ["userId"])
```

---

## Feature Breakdown

### Phase 1: Foundation
1. **Project Setup**
   - Initialize Next.js 15 with TypeScript
   - Configure Tailwind CSS v4 with cosmic theme
   - Set up i18n with next-intl (/en, /ru)
   - Initialize Convex
   - Configure Clerk authentication

2. **Landing Page**
   - Cosmic hero section with orbital animations
   - Feature showcase with parallax
   - Social proof section
   - CTA to sign up
   - Language switcher

3. **Authentication Flow**
   - Clerk sign-in/sign-up pages
   - Cosmic-themed auth UI
   - User sync to Convex on first login
   - Protected routes

### Phase 2: Core Messaging
4. **User Discovery**
   - Search users by username
   - Browse suggested connections
   - User profile cards with orbital avatars
   - Send connection invitations

5. **Invitations System**
   - Send invitations with optional message
   - Accept/decline invitations
   - Real-time invitation notifications
   - Stellar violet accent for new invites

6. **Chat System**
   - 1:1 direct messages
   - Group chats (2+ participants)
   - Real-time message delivery
   - Message read receipts
   - Typing indicators with signal teal

7. **Chat Interface**
   - Message list with orbital trajectories
   - Message input with send animation
   - Image/file attachments
   - Emoji support
   - Message reactions (stretch)

### Phase 3: Presence & Polish
8. **Presence System**
   - Online/offline status
   - Last seen timestamps
   - Pulsar blue activity indicators
   - Real-time presence updates

9. **User Settings**
   - Theme toggle (light/dark celestial)
   - Notification preferences
   - Language selection (EN/RU)
   - Profile customization

10. **Polish & Animations**
    - Page transitions
    - Micro-interactions
    - Loading states with orbital spinners
    - Empty states with cosmic illustrations

---

## Implementation Steps

### Step 1: Project Initialization
```bash
npx create-next-app@latest orbit --typescript --tailwind --app --no-src-dir
cd orbit
npm install convex @clerk/nextjs next-intl framer-motion
npx convex init
```

### Step 2: Configure Tailwind v4 Theme
- Set up CSS variables for cosmic palette
- Configure custom fonts (Cabinet Grotesk, Satoshi)
- Add animation presets

### Step 3: Set Up i18n
- Create messages/en.json and messages/ru.json
- Configure middleware for locale detection
- Set up [locale] routing structure

### Step 4: Integrate Clerk
- Add environment variables
- Create auth middleware
- Build cosmic-themed sign-in/sign-up

### Step 5: Initialize Convex
- Define database schema
- Create user sync webhook
- Set up real-time subscriptions

### Step 6: Build Core Components
- UI primitives (Button, Input, Card, Avatar)
- Navigation (Sidebar, Header)
- Chat components (MessageBubble, ChatList, ChatInput)

### Step 7: Implement Features
- Landing page
- Auth flow
- User discovery
- Invitations
- Chat system
- Presence

### Step 8: Testing & Validation
- Run Playwright tests
- Validate all routes
- Test real-time features
- Mobile responsiveness

### Step 9: Deployment Preparation
- Environment variables
- Git initialization
- GitHub push

---

## Unique Image Requirements

Using Jina API keys to fetch unique Unsplash images for:
- Landing page hero backgrounds
- Empty state illustrations
- Feature section imagery
- Profile placeholder avatars
- Chat background patterns

All images must be unique - no duplicates across the app.

---

## i18n Keys Structure

```json
{
  "common": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "send": "Send",
    "cancel": "Cancel"
  },
  "landing": {
    "hero": {
      "title": "Welcome to Orbit",
      "subtitle": "Where conversations move like celestial paths"
    }
  },
  "chat": {
    "newMessage": "Type a message...",
    "typing": "{name} is typing..."
  },
  "discover": {
    "title": "Discover People",
    "searchPlaceholder": "Search by username..."
  }
}
```

---

## Success Criteria

- [ ] Full i18n support (/en and /ru routes)
- [ ] Clerk authentication working
- [ ] Convex real-time messaging functional
- [ ] Cosmic-modern design implemented
- [ ] Orbital animations and micro-interactions
- [ ] User discovery and invitations
- [ ] 1:1 and group chat support
- [ ] Presence indicators
- [ ] Mobile responsive
- [ ] All pages with unique Unsplash images
- [ ] Playwright tests passing
- [ ] Production-ready build

---

## Estimated Scope

- **Pages**: ~15 unique routes
- **Components**: ~40 reusable components
- **Convex Functions**: ~20 backend functions
- **Translations**: 2 language files (EN, RU)
- **Total Files**: ~100+ TypeScript files

---

## Notes

This is a **social messaging application**, not a service website. The existing service-website-generator agents are not applicable here. This requires custom implementation of:

1. Real-time messaging infrastructure (Convex)
2. Authentication system (Clerk)
3. Internationalization (next-intl)
4. Cosmic design system (custom Tailwind theme)
5. Complex UI components (chat interface, presence)

The implementation will be done directly without using the directory/service agents, as those are designed for SEO landing pages, not real-time applications.
