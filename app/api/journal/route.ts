import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db/client";
import { journalEntries } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";

// GET: Fetch all journal entries for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const entries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));
  return NextResponse.json(entries);
}

// POST: Create a new journal entry for the current user
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { content } = await req.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  const [result] = await db
    .insert(journalEntries)
    .values({ userId, content })
    .returning();
  return NextResponse.json(result, { status: 201 });
}
