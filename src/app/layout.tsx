// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gorontalo Unite · Social Media Dashboard",
  description: "Instagram Insight Dashboard for Gorontalo Unite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="bg-[#0a0a0f] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
