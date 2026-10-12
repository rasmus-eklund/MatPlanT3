import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(async function proxy() {}, {
  // Proxy still runs on all routes, but doesn't protect the home route
  publicPaths: ["/", "/register"],
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
