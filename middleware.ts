import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { locales, defaultLocale } from "./i18n/config";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/:locale",
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/:locale/offline",
]);

// Routes that authenticated users should be redirected away from
const isAuthRoute = createRouteMatcher([
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
]);

// Landing page routes
const isLandingRoute = createRouteMatcher([
  "/",
  "/:locale",
]);

// Check if path is a PWA static file that should bypass middleware
function isPWAStaticFile(pathname: string): boolean {
  return (
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/workbox-') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/splash/')
  );
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Check if the pathname is missing a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to default locale
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Check authentication
  const { userId } = await auth();

  // Extract locale from path
  const locale = pathname.split("/")[1] || defaultLocale;

  // Redirect authenticated users away from auth pages to dashboard
  if (userId && (isAuthRoute(req) || isLandingRoute(req))) {
    // Check if the pathname is just the locale (landing page)
    const isJustLocale = pathname === `/${locale}` || pathname === `/${locale}/`;
    if (isAuthRoute(req) || isJustLocale) {
      const dashboardUrl = new URL(`/${locale}/dashboard`, req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Redirect unauthenticated users from protected routes to sign-in
  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL(`/${locale}/sign-in`, req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

// Main middleware export - check for PWA files BEFORE Clerk processing
export default async function middleware(req: NextRequest, event: import('next/server').NextFetchEvent) {
  const pathname = req.nextUrl.pathname;

  // PWA static files should bypass all middleware and be served directly
  if (isPWAStaticFile(pathname)) {
    return NextResponse.next();
  }

  // All other requests go through Clerk
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (Next.js internals)
     * - Static files (images, fonts, etc.)
     * - PWA files (manifest.json, sw.js, workbox files, icons, splash)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|icons/|splash/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)",
  ],
};
