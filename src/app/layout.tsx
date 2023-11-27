import "~/styles/globals.css";

import { headers } from "next/headers";
import { TRPCReactProvider } from "~/trpc/react";
import Header from "./_components/header/Header";
import Footer from "./_components/Footer";
import ProvidersWrapper from "./ProvidersWrapper";
import { Toaster } from "react-hot-toast";
import { env } from "~/env.mjs";

export const metadata = {
  title: env.NODE_ENV === "development" ? "DEV:MatPlan" : "MatPlan",
  description: "Plannera dina matinköp snabbt och smidigt",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`flex h-full flex-col items-center bg-c3 font-sans`}>
        <TRPCReactProvider headers={headers()}>
          <ProvidersWrapper>
            <Toaster position="bottom-center" />
            <Header />
            <main className="w-full max-w-5xl grow overflow-y-auto border-2 border-c5 bg-c4">
              {children}
            </main>
            <Footer />
          </ProvidersWrapper>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
