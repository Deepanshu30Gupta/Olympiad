import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/story(.*)",
  "/privacy(.*)",
  "/contact(.*)",
]);

// These specific routes should send an unauthenticated visitor to
// sign-up (the intended new-visitor path), not Clerk's default
// sign-in redirect. This is handled here at the middleware level so
// it applies no matter how the route is reached — a direct URL, a
// bookmark, or any link — not just clicks from the header nav.
const isSignUpRedirectRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/dashboard(.*)",
  "/leaderboard(.*)",
  "/practice(.*)",
  "/progress(.*)",
  "/topics(.*)",
  "/sessions(.*)",
  "/bookmarks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth();
  if (!userId && isSignUpRedirectRoute(req)) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};