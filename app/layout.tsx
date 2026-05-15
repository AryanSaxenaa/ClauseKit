import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { TrustlessWorkProvider } from "@/providers/trustless-work-provider";
import { WalletProvider } from "@/providers/wallet-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClauseKit",
  description:
    "Drop a service contract, AI reads it, live escrows appear on Stellar.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sixtyfour&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <WalletProvider>
            <TrustlessWorkProvider>{children}</TrustlessWorkProvider>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
