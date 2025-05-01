import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db/client";
import { goals } from "@/app/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET: Fetch all goals for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const allGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));
  return NextResponse.json(allGoals);
}

// POST: Create a new goal for the current user
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, targetDate } = await req.json();
  if (!title || !targetDate) {
    return NextResponse.json(
      { error: "Title and target date are required" },
      { status: 400 }
    );
  }
  const [result] = await db
    .insert(goals)
    .values({ userId, title, description, targetDate })
    .returning();
  return NextResponse.json(result, { status: 201 });
}

// PATCH: Edit a goal for the current user
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, title, description, targetDate } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
  }
  const [result] = await db
    .update(goals)
    .set({ title, description, targetDate })
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning();
  if (!result) {
    return NextResponse.json(
      { error: "Goal not found or not authorized" },
      { status: 404 }
    );
  }
  return NextResponse.json(result);
}

// DELETE: Delete a goal for the current user
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
  }
  const [deleted] = await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning();
  if (!deleted) {
    return NextResponse.json(
      { error: "Goal not found or not authorized" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
