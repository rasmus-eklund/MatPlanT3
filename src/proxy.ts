import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { type NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  return withAuth(req);
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|$).*)",
  ],
};
