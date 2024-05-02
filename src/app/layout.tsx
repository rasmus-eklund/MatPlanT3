import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Header from "~/components/common/header/Header";
import Footer from "~/components/common/Footer";
import { Toaster } from "~/components/ui/sonner";
import { env } from "~/env";
import { Analytics } from "@vercel/analytics/react";

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
    <html className="h-full" lang="en">
      <body
        className={`flex h-full flex-col items-center font-sans ${inter.variable}`}
      >
        <Header />
        <main className="w-full max-w-5xl grow overflow-y-auto border-2 border-c5 bg-c4">
          {children}
        </main>
        <Toaster />
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
