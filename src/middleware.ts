import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import type { NextRequest } from "next/server";

const middleware = (req: NextRequest) => {
  return withAuth(req);
};

export const config = {
  matcher: [
    "/admin",
    "/items",
    "/menu",
    "/recipes",
    "/register",
    "/stores",
    "/user",
  ],
};

export default middleware;
