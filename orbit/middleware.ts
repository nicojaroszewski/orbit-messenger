import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { locales, defaultLocale } from "./i18n/config";
import { NextResponse } from "next/server";

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

export default clerkMiddleware(async (auth, req) => {
  // Handle internationalization first
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

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
