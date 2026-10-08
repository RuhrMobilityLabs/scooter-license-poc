import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PocBanner, SiteFooter, SiteHeader } from "@/components/site-chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scooter License (PoC)",
  description: "Proof of concept for a digital, privacy-preserving e-scooter driving license.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PocBanner />
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
