import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db/client";
import { journalEntries } from "@/app/db/schema";
import { eq, desc, and } from "drizzle-orm";

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

// PATCH: Edit a journal entry for the current user
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, content } = await req.json();
  if (!id || typeof content !== "string") {
    return NextResponse.json(
      { error: "ID and content are required" },
      { status: 400 }
    );
  }
  const [result] = await db
    .update(journalEntries)
    .set({ content })
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
    .returning();
  if (!result) {
    return NextResponse.json(
      { error: "Entry not found or not authorized" },
      { status: 404 }
    );
  }
  return NextResponse.json(result);
}

// DELETE: Delete a journal entry for the current user
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const [deleted] = await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
    .returning();
  if (!deleted) {
    return NextResponse.json(
      { error: "Entry not found or not authorized" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
