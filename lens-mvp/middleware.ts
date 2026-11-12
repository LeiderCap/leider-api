import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPrivateRoute = createRouteMatcher([
  '/api/saved(.*)',
  '/api/watchlists(.*)',
  '/api/memory(.*)',
  '/api/blueprint/generate(.*)',
  '/api/reports(.*)',
  '/saved(.*)',
  '/watchlists(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPrivateRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|map|txt|xml|pdf|csv)).*)',
    '/(api|trpc)(.*)',
  ],
};
