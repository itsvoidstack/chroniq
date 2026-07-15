import type { Metadata } from "next";
import "@/styles/globals.css";
import { SupabaseProvider } from "@/lib/providers/supabase-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";

export const metadata: Metadata = {
  title: "Chroniq",
  description: "Own Your Entertainment History.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
