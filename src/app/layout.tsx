import "~/styles/globals.css";

import { headers } from "next/headers";
import { TRPCReactProvider } from "~/trpc/react";
import Header from "./_components/header/Header";
import Footer from "./_components/Footer";
import ProvidersWrapper from "./ProvidersWrapper";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "MatPlan",
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
      <body className={`flex h-full flex-col items-center font-sans bg-c3`}>
        <TRPCReactProvider headers={headers()}>
          <ProvidersWrapper>
            <Toaster position="bottom-center" />
            <Header />
            <main className="w-full max-w-5xl grow overflow-y-auto bg-c4 border-2 border-c5">
              {children}
            </main>
            <Footer />
          </ProvidersWrapper>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
