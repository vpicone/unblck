import { Header } from "@/components/ui/header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const authData = await auth();

  if (authData.userId) {
    redirect("/journal");
  }

  return (
    <>
      <Header />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"></main>
      </div>
    </>
  );
}
