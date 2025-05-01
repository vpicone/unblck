"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface JournalEntry {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
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

function useEditJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const res = await fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content }),
      });
      if (!res.ok) throw new Error("Failed to update entry");
      return res.json();
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData<JournalEntry[]>(["journalEntries"], (old) =>
        old
          ? old.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
          : [updatedEntry]
      );
    },
  });
}

function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api/journal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete entry");
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<JournalEntry[]>(["journalEntries"], (old) =>
        old ? old.filter((e) => e.id !== deletedId) : []
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
  const editJournalEntry = useEditJournalEntry();
  const deleteJournalEntry = useDeleteJournalEntry();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Handle new entry submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addJournalEntry.mutate(content, {
      onSuccess: () => setContent(""),
    });
  }

  function startEdit(entry: JournalEntry) {
    setEditingId(entry.id);
    setEditContent(entry.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      editJournalEntry.mutate(
        { id: editingId, content: editContent },
        { onSuccess: cancelEdit }
      );
    }
  }

  function handleDelete() {
    if (editingId) {
      deleteJournalEntry.mutate(editingId, { onSuccess: cancelEdit });
    }
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
                {new Date(entry.createdAt).toLocaleString()}
              </div>
              {editingId === entry.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="flex flex-col gap-2"
                >
                  <textarea
                    className="border rounded p-2 min-h-[80px]"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
                      disabled={
                        editJournalEntry.isPending || !editContent.trim()
                      }
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded px-4 py-2"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded px-4 py-2 text-red-500 border border-red-500 ml-auto"
                      onClick={handleDelete}
                      disabled={deleteJournalEntry.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="text-">{entry.content}</div>
                  <button
                    className="text-xs text-blue-400 underline mt-2"
                    onClick={() => startEdit(entry)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
