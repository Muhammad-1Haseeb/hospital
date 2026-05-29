import * as Sentry from "@sentry/nextjs"; 
import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans as FontSans } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";
import { PWARegistration } from "@/components/PWARegistration";
import AnimatedLayout from "@/components/AnimatedLayout";

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export function generateMetadata(): Metadata {
  return {
    title: siteConfig.name,
    description: siteConfig.tagline,
    icons: {
      icon: "/assets/icons/logo-icon.svg",
    },
    manifest: "/manifest.json",
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-dark-300 font-sans antialiased text-dark-700",
          fontSans.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <PWARegistration />
          <AnimatedLayout>{children}</AnimatedLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
