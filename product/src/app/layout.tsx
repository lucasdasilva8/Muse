import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Muse — Experimental product",
  description:
    "Experimental Muse product prototype. Simulated listings, escrow, and payouts only — not a live securities offering.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${syne.variable}`}>{children}</body>
    </html>
  );
}
