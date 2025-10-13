import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  crossOrigin: "anonymous",
  // experimental: {
  //   reactCompiler: true,
  // },
  images: { remotePatterns: [{ hostname: "lh3.googleusercontent.com" }] },
  env: {
    KINDE_SITE_URL:
      process.env.KINDE_SITE_URL ?? `https://${process.env.VERCEL_URL}`,
    KINDE_POST_LOGOUT_REDIRECT_URL:
      process.env.KINDE_POST_LOGOUT_REDIRECT_URL ??
      `https://${process.env.VERCEL_URL}`,
    KINDE_POST_LOGIN_REDIRECT_URL:
      process.env.KINDE_POST_LOGIN_REDIRECT_URL ??
      `https://${process.env.VERCEL_URL}/register`,
  },
};

export default config;
