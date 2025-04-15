"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function JournalPage() {
  const { isSignedIn } = useUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch journal entries
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch(() => setError("Failed to load entries"));
  }, [isSignedIn]);

  // Handle new entry submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      setError("Failed to create entry");
      setLoading(false);
      return;
    }
    const newEntry = await res.json();
    setEntries([newEntry, ...entries]);
    setContent("");
    setLoading(false);
  }

  if (!isSignedIn) {
    return (
      <div className="p-8 text-center">
        Please sign in to view your journal.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Journal</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <textarea
          className="border rounded p-2 min-h-[80px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a new journal entry..."
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={loading || !content.trim()}
        >
          {loading ? "Saving..." : "Add Entry"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-gray-500">No entries yet.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="border rounded p-3 bg-white/80">
              <div className="text-sm text-gray-600 mb-1">
                {new Date(entry.created_at).toLocaleString()}
              </div>
              <div>{entry.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
