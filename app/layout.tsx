import type { Metadata } from "next";
import { Figtree, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelegramScript } from '../components/TelegramScript';

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Fragments",
  description: "Play Fragments game!",
  manifest: '/manifest.json',
};

export const viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} antialiased overflow-y-hidden overflow-x-hidden`}
    >
      <body>
        <TelegramScript />
        {children}
      </body>
    </html>
  );
}
