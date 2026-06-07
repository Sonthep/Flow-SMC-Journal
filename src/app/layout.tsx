import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flow SMC Trade Journal",
  description: "High-performance smart money concepts trading journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-[#f4f7fb] text-slate-800 selection:bg-sky-500/30">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
