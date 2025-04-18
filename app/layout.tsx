import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "./query-provider";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <ClerkProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <Link href="/" className="font-semibold hover:underline">
                  Home
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <SignedIn>
                  <Link href="/journal" className="hover:underline">
                    Journal
                  </Link>
                </SignedIn>
                <div className="flex items-center gap-4">
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </header>
            {children}
          </body>
        </html>
      </ClerkProvider>
    </QueryProvider>
  );
}
