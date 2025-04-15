import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch all journal entries for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const entries = await sql`
    SELECT id, content, created_at, updated_at
    FROM journal_entries
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
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
  const result = await sql`
    INSERT INTO journal_entries (user_id, content)
    VALUES (${userId}, ${content})
    RETURNING id, content, created_at, updated_at
  `;
  return NextResponse.json(result[0], { status: 201 });
}
