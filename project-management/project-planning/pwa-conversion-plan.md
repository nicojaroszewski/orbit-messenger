# Orbit Chat PWA Conversion Plan

## Overview

Convert the Orbit social messaging platform from a standard Next.js webapp to a Progressive Web App (PWA) with installability and app-like experience.

**Current State**: Next.js 16 webapp with Convex backend, Clerk auth, no PWA features
**Target State**: Installable PWA with basic offline support, cached assets, and fast loads

**Scope Decisions**:
- Offline: Basic (cached assets, offline indicator, fast loads)
- Push Notifications: Skip for now
- Icons: Generate placeholder icons with Orbit brand colors

---

## Phase 1: Core PWA Infrastructure

### 1.1 Install Dependencies
```bash
npm install next-pwa
npm install -D @types/serviceworker
```

### 1.2 Create Web App Manifest
**File**: `orbit/public/manifest.json`

```json
{
  "name": "Orbit - Social Messaging Platform",
  "short_name": "Orbit",
  "description": "Connect, communicate, and build your own digital constellations",
  "start_url": "/en/chats",
  "display": "standalone",
  "background_color": "#0A0E1A",
  "theme_color": "#3B82F6",
  "orientation": "portrait-primary",
  "categories": ["social", "communication"],
  "icons": [...]
}
```

### 1.3 Generate App Icons
Create icons in `orbit/public/icons/`:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `apple-touch-icon.png` (180x180)
- `maskable-icon-512x512.png` (with safe zone)

### 1.4 Update Next.js Config
**File**: `orbit/next.config.ts`

```typescript
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [...] // Custom caching strategies
});

export default pwaConfig(withNextIntl(nextConfig));
```

### 1.5 Add PWA Meta Tags
**File**: `orbit/app/layout.tsx`

Add to metadata:
- `themeColor`
- `manifest` link
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- Apple touch icon links
- Splash screen links for iOS

---

## Phase 2: Service Worker Strategy

### 2.1 Caching Strategies by Resource Type

| Resource Type | Strategy | Rationale |
|--------------|----------|-----------|
| Static assets (JS/CSS) | Cache-First | Rarely change, fast loads |
| App shell (HTML) | Stale-While-Revalidate | Quick load + fresh content |
| Images (avatars, UI) | Cache-First with expiration | Reduce bandwidth |
| API calls (Convex) | Network-First | Real-time data priority |
| Fonts | Cache-First | Never change |

### 2.2 Create Offline Fallback Page
**File**: `orbit/app/[locale]/offline/page.tsx`

- Display cached conversation list
- Show "You're offline" message
- Queue message input for later sync
- Retry connection button

### 2.3 Service Worker Registration
**File**: `orbit/components/providers/pwa-provider.tsx`

```typescript
'use client';

export function PWAProvider({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  // Handle install prompt
  // Handle online/offline status
  // Handle update available

  return <>{children}</>;
}
```

---

## Phase 3: Enhanced App Experience (Simplified for Basic Scope)

### 3.1 Install Prompt Component
**File**: `orbit/components/pwa/install-prompt.tsx`

- Detect if installable (beforeinstallprompt event)
- Show tasteful install banner
- Persist dismissal preference
- Track installation analytics

### 3.2 Update Available Notification
**File**: `orbit/components/pwa/update-prompt.tsx`

- Detect service worker update
- Prompt user to refresh
- Handle skipWaiting gracefully

### 3.3 Network Status Indicator
**File**: `orbit/components/ui/network-status.tsx`

- Show offline indicator in header/sidebar
- Toast notification on disconnect/reconnect

---

## Phase 4: iOS-Specific Optimizations

### 4.1 Apple Splash Screens
Generate splash screens for all iOS device sizes in `orbit/public/splash/`

### 4.2 Status Bar Styling
Already have safe-area support, add:
- `apple-mobile-web-app-status-bar-style: black-translucent`
- Handle notch/Dynamic Island properly

### 4.3 iOS Installation Instructions
Since iOS doesn't support beforeinstallprompt:
- Detect iOS Safari
- Show "Add to Home Screen" instructions modal
- Use share sheet guidance

---

## Implementation Steps (Ordered)

### Step 1: Install Dependencies
```bash
cd orbit
npm install next-pwa
```

### Step 2: Generate App Icons
Create `orbit/public/icons/` with placeholder Orbit icons:
- Use brand color #3B82F6 (Orbit blue)
- Generate all required sizes programmatically or via online tool

### Step 3: Create manifest.json
**File**: `orbit/public/manifest.json`

### Step 4: Update next.config.ts
Add next-pwa wrapper with caching strategies

### Step 5: Add PWA Meta Tags
Update `orbit/app/layout.tsx` with all PWA-related meta tags

### Step 6: Create PWA Provider
**File**: `orbit/components/providers/pwa-provider.tsx`
- Service worker registration
- Online/offline detection
- Install prompt handling

### Step 7: Create Offline Page
**File**: `orbit/app/[locale]/offline/page.tsx`
- Simple "You're offline" message with brand styling

### Step 8: Add Network Status Indicator
**File**: `orbit/components/ui/network-status.tsx`
- Toast or banner when offline

### Step 9: iOS Enhancements
- Generate splash screens
- Add iOS-specific meta tags
- Create iOS install instructions modal

### Step 10: Testing & Validation
- Run Lighthouse PWA audit
- Test on Android Chrome
- Test on iOS Safari
- Verify installation works

---

## Files to Create

| File | Purpose |
|------|---------|
| `orbit/public/manifest.json` | PWA manifest |
| `orbit/public/icons/*.png` | App icons (9 files) |
| `orbit/public/splash/*.png` | iOS splash screens |
| `orbit/app/[locale]/offline/page.tsx` | Offline fallback page |
| `orbit/components/providers/pwa-provider.tsx` | SW registration + install prompt |
| `orbit/components/ui/network-status.tsx` | Connection indicator |
| `orbit/components/pwa/ios-install-prompt.tsx` | iOS-specific install modal |

## Files to Modify

| File | Changes |
|------|---------|
| `orbit/next.config.ts` | Add next-pwa wrapper |
| `orbit/app/layout.tsx` | Add PWA meta tags |
| `orbit/app/[locale]/layout.tsx` | Add PWAProvider to provider stack |
| `orbit/package.json` | Add next-pwa dependency |

---

## Success Criteria

- [ ] Lighthouse PWA score: 90+ (100 ideal)
- [ ] Installable on Android Chrome
- [ ] Installable on iOS Safari (with instructions)
- [ ] Offline page displays when no connection
- [ ] Fast subsequent loads with cached assets
- [ ] No console errors related to PWA
- [ ] Proper icons on all devices/platforms
