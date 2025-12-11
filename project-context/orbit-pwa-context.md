# Orbit Chat App - Project Context for PWA Conversion

> This document contains all context needed for a new agent to continue the PWA conversion work.

## Project Overview

**Project Name**: Orbit - Social Messaging Platform
**Location**: `C:\Users\jaros\Nico\09 AI Website Projects\02 Projects\ChatApp\orbit`
**Type**: Real-time chat/messaging application
**Current State**: Fully functional Next.js webapp, needs PWA conversion

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | React framework (App Router) |
| React | 19.2.0 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | v4 | Styling |
| Convex | 1.30.0 | Real-time backend/database |
| Clerk | 6.36.0 | Authentication |
| next-intl | 4.5.8 | Internationalization (en/ru) |
| Framer Motion | 12.23.25 | Animations |
| Lucide React | 0.556.0 | Icons |

---

## Directory Structure

```
orbit/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata here)
│   ├── globals.css               # Global styles + design tokens
│   └── [locale]/                 # Locale-based routing (en/ru)
│       ├── layout.tsx            # Providers: Clerk, Convex, NextIntl
│       ├── page.tsx              # Landing page
│       ├── (auth)/               # Auth routes (sign-in, sign-up)
│       │   └── layout.tsx
│       └── (main)/               # Protected app routes
│           ├── layout.tsx        # Sidebar + main content layout
│           ├── chat/[chatId]/    # Individual chat view
│           ├── chats/            # Conversations list
│           ├── dashboard/        # Dashboard
│           ├── discover/         # User discovery
│           ├── invitations/      # Connection requests
│           ├── profile/[userId]/ # User profiles
│           └── settings/         # User settings
├── components/
│   ├── chat/                     # Chat-related components
│   ├── landing/                  # Landing page components
│   ├── navigation/               # Sidebar, navigation
│   ├── providers/                # Context providers
│   │   └── theme-provider.tsx    # Theme management (light/dark/system)
│   ├── ui/                       # Reusable UI components
│   └── user/                     # User-related components
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema
│   ├── users.ts                  # User functions
│   ├── messages.ts               # Message functions
│   └── conversations.ts          # Conversation functions
├── lib/
│   ├── animations.ts             # Framer Motion variants
│   └── utils.ts                  # Utility functions (cn, etc.)
├── providers/
│   └── convex-provider.tsx       # Convex client provider
├── i18n/
│   └── request.ts                # i18n configuration
├── messages/
│   ├── en.json                   # English translations
│   └── ru.json                   # Russian translations
├── public/                       # Static assets (currently minimal)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── middleware.ts                 # Route protection + locale handling
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── postcss.config.mjs            # PostCSS (Tailwind)
```

---

## Key Files to Understand

### 1. Root Layout (`orbit/app/layout.tsx`)
- Contains site metadata (title, description, OpenGraph)
- **PWA meta tags will be added here**
- Currently minimal - just wraps children

### 2. Locale Layout (`orbit/app/[locale]/layout.tsx`)
- Provider stack: ClerkProvider → ConvexClientProvider → NextIntlClientProvider
- Sets `className="light"` on html element
- Has safe-area padding for iOS already
- **PWAProvider will be added to this stack**

### 3. Next.js Config (`orbit/next.config.ts`)
- Uses `next-intl` plugin wrapper
- Has image remote patterns for Unsplash and Clerk
- **next-pwa wrapper will be added here**

### 4. Theme Provider (`orbit/components/providers/theme-provider.tsx`)
- Already exists and works
- Supports light/dark/system themes
- Uses localStorage key: `orbit-theme`
- Can be leveraged for PWA offline styling

### 5. Middleware (`orbit/middleware.ts`)
- Handles Clerk auth checks
- Manages locale routing
- Protects authenticated routes

---

## Design System (from globals.css)

### Brand Colors
```css
--cosmic-midnight: #0A0E1A;    /* Darkest background */
--orbital-navy: #0F172A;        /* Dark background */
--lunar-graphite: #1E293B;      /* Card backgrounds */
--orbit-blue: #3B82F6;          /* Primary accent */
--stellar-violet: #8B5CF6;      /* Secondary accent */
--signal-teal: #14B8A6;         /* Tertiary accent */
--star-white: #F8FAFC;          /* Primary text */
--nebula-gray: #94A3B8;         /* Secondary text */
```

### Key Design Tokens
- Border radius: Uses Tailwind defaults
- Shadows: Custom glow effects defined
- Animations: Orbital easing curves in `lib/animations.ts`

---

## Database Schema (Convex)

### Tables
- `users` - User profiles, online status, lastSeen
- `conversations` - Direct and group chats
- `messages` - Message content, metadata, reactions
- `typingIndicators` - Real-time typing status
- `reactions` - Message reactions
- `invitations` - Connection requests
- `connections` - User relationships

### Key Indexes
- `by_clerk_id` - User lookup by Clerk ID
- `by_conversation` - Messages by conversation
- `by_conversation_created` - Messages sorted by time

---

## Authentication Flow

1. User visits protected route
2. Middleware checks Clerk auth status
3. If not authenticated → redirect to `/[locale]/sign-in`
4. If authenticated → allow access, sync user to Convex

### Protected Routes
- `/[locale]/dashboard`
- `/[locale]/chats`
- `/[locale]/chat/[chatId]`
- `/[locale]/settings`
- `/[locale]/profile/[userId]`
- `/[locale]/discover`
- `/[locale]/invitations`

### Public Routes
- `/` and `/[locale]` (landing)
- `/[locale]/sign-in`
- `/[locale]/sign-up`

---

## PWA Conversion Task

### Scope (User-Approved)
- **Offline Level**: Basic (cached assets, offline indicator, fast loads)
- **Push Notifications**: Skip for now
- **Icons**: Generate placeholder icons with brand colors

### What Needs to be Created

1. **`orbit/public/manifest.json`** - PWA manifest
2. **`orbit/public/icons/`** - App icons (9 sizes)
3. **`orbit/public/splash/`** - iOS splash screens
4. **`orbit/app/[locale]/offline/page.tsx`** - Offline fallback
5. **`orbit/components/providers/pwa-provider.tsx`** - SW registration
6. **`orbit/components/ui/network-status.tsx`** - Connection indicator
7. **`orbit/components/pwa/ios-install-prompt.tsx`** - iOS install modal

### What Needs to be Modified

1. **`orbit/next.config.ts`** - Add next-pwa wrapper
2. **`orbit/app/layout.tsx`** - Add PWA meta tags
3. **`orbit/app/[locale]/layout.tsx`** - Add PWAProvider
4. **`orbit/package.json`** - Add next-pwa dependency

---

## Important Considerations

### 1. Convex Real-Time
- All data comes from Convex (no REST APIs)
- Uses `useQuery` and `useMutation` hooks
- Real-time subscriptions for messages
- **Offline**: Show cached UI, disable sending

### 2. Clerk Auth
- Tokens expire, need network to refresh
- **Offline**: Show last-known user state

### 3. Locale Routing
- All routes prefixed with `/en/` or `/ru/`
- Start URL should be `/en/chats` (default locale)

### 4. Existing i18n Support
- Already has `chat.offline` translation key
- Can add more offline-related translations

### 5. Safe Area Support
- Already implemented in locale layout
- Uses `env(safe-area-inset-*)` for iOS

---

## NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables Needed

The app uses:
- Clerk API keys (already configured)
- Convex deployment URL (already configured)

No additional env vars needed for PWA.

---

## Git Status

- Branch: `service-website-generator`
- Multiple uncommitted changes in orbit/ directory
- PWA changes should be committed separately after testing

---

## Success Criteria for PWA

- [ ] Lighthouse PWA score: 90+
- [ ] Installable on Android Chrome
- [ ] Installable on iOS Safari (with instructions)
- [ ] Offline page displays when disconnected
- [ ] Fast subsequent loads with cached assets
- [ ] No console errors related to PWA
- [ ] Proper icons on all devices

---

## Related Documents

- **Implementation Plan**: `../project-planning/pwa-conversion-plan.md`
- **This Context File**: `../project-context/orbit-pwa-context.md`

---

## Quick Start for New Agent

1. Read this context file completely
2. Read the implementation plan in `project-planning/pwa-conversion-plan.md`
3. Start with Step 1: Install `next-pwa` dependency
4. Follow the 10 implementation steps in order
5. Test with Lighthouse PWA audit when complete
