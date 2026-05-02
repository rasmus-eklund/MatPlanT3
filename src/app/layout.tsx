import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Header from "~/components/common/header/Header";
import Footer from "~/components/common/Footer";
import AppStatus from "~/components/common/AppStatus";
import { Toaster } from "~/components/ui/sonner";
import { env } from "~/env";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./authprovider";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: env.NODE_ENV === "development" ? "DEV:MatPlan" : "MatPlan",
  description: "Planera dina matinköp snabbt och smidigt",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full" lang="sv">
      <body
        className={`flex h-full flex-col items-center font-sans ${inter.variable}`}
      >
        <AuthProvider>
          <AppStatus />
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
          </Suspense>
          <main className="border-c5 bg-c4 w-full max-w-5xl grow overflow-y-auto border-2">
            {children}
          </main>
          <Toaster />
          <Analytics />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
