import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { getBaseUrl } from "@/lib/site";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "CAMPUSOS - The Operating System for Students",
    template: "%s | CAMPUSOS",
  },
  description:
    "CAMPUSOS is the all-in-one productivity and placement super-app for students: planner, focus timer, coding tracker, CGPA tools, resume builder and more.",
  keywords: [
    "student productivity app",
    "placement tracker",
    "study planner",
    "campusos",
    "cgpa calculator",
    "pomodoro student",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CAMPUSOS - The Operating System for Students",
    description:
      "Plan classes, track coding, prepare for placements, and build resume-ready progress in one app.",
    type: "website",
    url: getBaseUrl(),
    siteName: "CAMPUSOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAMPUSOS - The Operating System for Students",
    description:
      "All-in-one productivity and placement super-app for college students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
