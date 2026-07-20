import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chroniq — Track Everything You Watch",
    template: "%s | Chroniq",
  },
  description:
    "Manage anime, movies, TV shows, and manga manually or automatically with the Chroniq browser extension.",
  keywords: ["anime tracker", "manga tracker", "movie tracker", "watch history", "media library"],
  authors: [{ name: "Chroniq" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chroniq.app",
    siteName: "Chroniq",
    title: "Chroniq — Track Everything You Watch",
    description:
      "Manage anime, movies, TV shows, and manga manually or automatically with the Chroniq browser extension.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chroniq — Track Everything You Watch",
    description:
      "Manage anime, movies, TV shows, and manga manually or automatically with the Chroniq browser extension.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1117" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
