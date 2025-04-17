"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

function useJournalEntries(enabled: boolean) {
  return useQuery<JournalEntry[]>({
    queryKey: ["journalEntries"],
    queryFn: async () => {
      const res = await fetch("/api/journal");
      if (!res.ok) throw new Error("Failed to fetch journal entries");
      return res.json();
    },
    enabled,
  });
}

function useAddJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      return res.json();
    },
    onSuccess: (newEntry) => {
      queryClient.setQueryData<JournalEntry[]>(["journalEntries"], (old) =>
        old ? [newEntry, ...old] : [newEntry]
      );
    },
  });
}

export default function JournalPage() {
  const { isSignedIn, isLoaded } = useUser();
  const {
    data: entries = [],
    isLoading,
    error,
  } = useJournalEntries(!!isSignedIn);
  const addJournalEntry = useAddJournalEntry();
  const [content, setContent] = useState("");

  // Handle new entry submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addJournalEntry.mutate(content, {
      onSuccess: () => setContent(""),
    });
  }

  if (!isLoaded) {
    return;
  }

  if (!isSignedIn) {
    return (
      <div className="p-8 text-center">
        Please sign in to view your journal.
      </div>
    );
  }

  console.log(addJournalEntry);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Journal</h1>
      <p className="text-gray-500 mb-4">
        Keep track of your thoughts and experiences.
      </p>
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
          disabled={addJournalEntry.isPending || !content.trim()}
        >
          Add Entry
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error.message}</div>}
      <div className="space-y-4">
        {isLoading ? null : entries.length === 0 ? (
          <div className="text-gray-500">No entries yet.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded p-3 bg-neutral-800">
              <div className="text-sm text-neutral-400 mb-1">
                {new Date(entry.created_at).toLocaleString()}
              </div>
              <div className="text-">{entry.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
