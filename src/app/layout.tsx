import "~/styles/globals.css";

import { Geist } from "next/font/google";
import Header from "~/components/common/header/Header";
import Footer from "~/components/common/Footer";
import { Toaster } from "~/components/ui/sonner";
import { env } from "~/env";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./authprovider";
import { cn } from "~/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: env.NODE_ENV === "development" ? "DEV:MatPlan" : "MatPlan",
  description: "Planera dina matinköp snabbt och smidigt",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn("h-full", "font-sans", geist.variable)} lang="sv">
      <body className={`flex h-full flex-col items-center font-sans ${geist.variable}`}>
        <AuthProvider>
          <Header />
          <main className="w-full max-w-5xl grow overflow-y-auto border-2 border-c5 bg-c4">
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
