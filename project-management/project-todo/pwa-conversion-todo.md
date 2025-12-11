# PWA Conversion - Task Checklist

> Agents: Update this file as you complete tasks. Mark items with [x] when done.

## Phase 1: Core PWA Infrastructure

- [x] **1.1 Install Dependencies**
  - [x] Run `npm install next-pwa` in orbit directory
  - [x] Verify package.json updated

- [x] **1.2 Generate App Icons**
  - [x] Create `orbit/public/icons/` directory
  - [x] Generate icon-72x72.png
  - [x] Generate icon-96x96.png
  - [x] Generate icon-128x128.png
  - [x] Generate icon-144x144.png
  - [x] Generate icon-152x152.png
  - [x] Generate icon-192x192.png
  - [x] Generate icon-384x384.png
  - [x] Generate icon-512x512.png
  - [x] Generate apple-touch-icon.png (180x180)
  - [x] Generate maskable-icon-512x512.png

- [x] **1.3 Create Web App Manifest**
  - [x] Create `orbit/public/manifest.json`
  - [x] Add all icon references
  - [x] Configure theme colors
  - [x] Set start_url and display mode

- [x] **1.4 Update Next.js Config**
  - [x] Modify `orbit/next.config.ts`
  - [x] Add next-pwa wrapper
  - [x] Configure caching strategies
  - [x] Set up development/production modes

- [x] **1.5 Add PWA Meta Tags**
  - [x] Update `orbit/app/layout.tsx`
  - [x] Add theme-color meta tag
  - [x] Add manifest link
  - [x] Add apple-mobile-web-app-capable
  - [x] Add apple-mobile-web-app-status-bar-style
  - [x] Add apple-touch-icon links

---

## Phase 2: Service Worker & Offline

- [x] **2.1 Create PWA Provider**
  - [x] Create `orbit/components/providers/pwa-provider.tsx`
  - [x] Implement service worker registration
  - [x] Add online/offline detection
  - [x] Handle install prompt event
  - [x] Handle update available event

- [x] **2.2 Create Offline Page**
  - [x] Create `orbit/app/[locale]/offline/page.tsx`
  - [x] Design offline UI with brand styling
  - [x] Add "You're offline" message
  - [x] Add retry/refresh button

- [x] **2.3 Integrate PWA Provider**
  - [x] Update `orbit/app/[locale]/layout.tsx`
  - [x] Add PWAProvider to provider stack

---

## Phase 3: Enhanced App Experience

- [x] **3.1 Network Status Indicator**
  - [x] Create `orbit/components/ui/network-status.tsx`
  - [x] Show offline indicator
  - [x] Toast on disconnect/reconnect

- [x] **3.2 Install Prompt (Optional)**
  - [x] Create install prompt component
  - [x] Detect installable state
  - [x] Show tasteful install banner
  - [x] Persist dismissal preference

---

## Phase 4: iOS-Specific

- [x] **4.1 Apple Splash Screens**
  - [x] Create `orbit/public/splash/` directory
  - [x] Generate iPhone splash screens
  - [x] Generate iPad splash screens
  - [x] Add splash screen links to layout

- [x] **4.2 iOS Install Instructions**
  - [x] Create `orbit/components/pwa/ios-install-prompt.tsx`
  - [x] Detect iOS Safari
  - [x] Show "Add to Home Screen" instructions

---

## Phase 5: Testing & Validation

- [x] **5.1 Development Testing**
  - [x] Run `npm run build` successfully
  - [ ] Run `npm run start` (production mode)
  - [ ] Verify service worker registers

- [ ] **5.2 Lighthouse Audit**
  - [ ] Run Lighthouse PWA audit
  - [ ] Score 90+ on PWA criteria
  - [ ] Fix any flagged issues

- [ ] **5.3 Device Testing**
  - [ ] Test installation on Android Chrome
  - [ ] Test installation on iOS Safari
  - [ ] Test offline functionality
  - [ ] Verify icons display correctly

- [ ] **5.4 Final Verification**
  - [ ] No console errors related to PWA
  - [ ] Fast subsequent page loads
  - [ ] Offline page displays when disconnected

---

## Completion Status

| Phase | Status | Completed By | Date |
|-------|--------|--------------|------|
| Phase 1: Core Infrastructure | ✅ Completed | Claude | 2025-12-11 |
| Phase 2: Service Worker | ✅ Completed | Claude | 2025-12-11 |
| Phase 3: App Experience | ✅ Completed | Claude | 2025-12-11 |
| Phase 4: iOS-Specific | ✅ Completed | Claude | 2025-12-11 |
| Phase 5: Testing | 🟡 In Progress | - | - |

**Legend:**
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed

---

## Notes for Agents

- Update checkboxes as you complete tasks: `[ ]` -> `[x]`
- Update the Completion Status table when finishing a phase
- If you encounter blockers, add them to a "Blockers" section below
- Reference the plan at `../project-planning/pwa-conversion-plan.md`
- Reference context at `../project-context/orbit-pwa-context.md`

## Implementation Notes

### Files Created
- `orbit/public/manifest.json` - PWA manifest with icons, shortcuts, theme colors
- `orbit/public/icons/` - 10 icon files (72x72 to 512x512 + maskable)
- `orbit/public/splash/` - 13 Apple splash screen images for all iOS devices
- `orbit/components/providers/pwa-provider.tsx` - PWA context provider with:
  - Service worker registration
  - Online/offline detection
  - Install prompt handling (beforeinstallprompt)
  - Update available detection
  - iOS Safari detection
- `orbit/components/ui/network-status.tsx` - Network status indicators:
  - Offline banner
  - Reconnected toast
  - Update available banner
  - Compact NetworkIndicator component
- `orbit/components/pwa/ios-install-prompt.tsx` - iOS-specific install modal with step-by-step instructions
- `orbit/app/[locale]/offline/page.tsx` - Branded offline fallback page
- `orbit/types/next-pwa.d.ts` - TypeScript declarations for next-pwa

### Files Modified
- `orbit/package.json` - Added next-pwa dependency
- `orbit/next.config.ts` - Added PWA wrapper with caching strategies
- `orbit/app/layout.tsx` - Added PWA meta tags, viewport config, splash screen links
- `orbit/app/[locale]/layout.tsx` - Integrated PWAProvider, NetworkStatus, IOSInstallPrompt
- `orbit/tsconfig.json` - Added types folder to include

### Caching Strategies Configured
- Static assets (JS/CSS): CacheFirst (30 days)
- Images: CacheFirst (30 days)
- Google Fonts: CacheFirst (1 year)
- App shell (HTML): StaleWhileRevalidate (7 days)
- API calls: NetworkFirst (5 min cache, 10s timeout)
- Offline fallback: `/en/offline`
