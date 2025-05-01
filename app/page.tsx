"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {isSignedIn && (
          <>
            <Link
              href="/journal"
              className="rounded bg-blue-600 text-white px-4 py-2 mt-2 inline-block hover:bg-blue-700 transition-colors"
            >
              Go to Journal
            </Link>
            <Link
              href="/goals"
              className="rounded bg-blue-600 text-white px-4 py-2 mt-2 inline-block hover:bg-blue-700 transition-colors"
            >
              Go to Goals
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
