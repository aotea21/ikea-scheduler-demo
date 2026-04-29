import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DataInitializer } from "@/components/DataInitializer";
import { Toaster } from "@/components/Toaster";
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
  title: "IKEA Field Service",
  description: "IKEA Field Service — Assembly Operations Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IKEA Service",
  },
};

import { AuthProvider } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/lib/types";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use getSession() — reads JWT from cookie locally (zero network calls).
  // proxy.ts already validated auth; layout only needs user info for the AuthProvider.
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // Build profile: prefer JWT metadata (fast), fallback to DB if role missing.
  // The DB fallback only triggers once per session for legacy accounts
  // where user_metadata.role wasn't set during account creation.
  let profile: UserProfile | null = null;
  if (user) {
    const jwtRole = user.user_metadata?.role as string | undefined;

    if (jwtRole) {
      // Fast path: role exists in JWT, no DB needed
      profile = {
        id: user.id,
        email: user.email ?? '',
        name: (user.user_metadata?.name as string) ?? user.email ?? '',
        role: jwtRole as UserProfile['role'],
        region: (user.user_metadata?.region as string) ?? undefined,
        assembler_id: (user.user_metadata?.assembler_id as string) ?? undefined,
      };
    } else {
      // Fallback: legacy account without role in JWT → fetch from profiles table
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data as UserProfile | null;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0058a3" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider initialUser={user} initialProfile={profile}>
          <DataInitializer />
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

