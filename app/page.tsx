import { Header } from "@/components/ui/header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { RotatingCube } from "@/components/RotatingCube";

export default async function Home() {
  const authData = await auth();

  if (authData.userId) {
    redirect("/journal");
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-background-900">
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Unlock Your <span className="text-indigo-600">Potential</span>{" "}
            <br /> with <span className="text-indigo-700">unblck</span>
          </h1>
          <p className="text-lg sm:text-2xl text-gray-700 max-w-2xl mb-10">
            unblck helps you journal, set goals, and track your progress—all in
            one beautiful, distraction-free space. Start your journey to a more
            mindful, productive you.
          </p>
        </main>
        <footer className="w-full text-center py-6 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} unblck. All rights reserved.
        </footer>
      </div>
    </>
  );
}
