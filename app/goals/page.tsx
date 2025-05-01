"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  statusId: number;
}

function useGoals(enabled: boolean) {
  return useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json();
    },
    enabled,
  });
}

function useAddGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goal: {
      title: string;
      description?: string;
      targetDate: string;
    }) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return res.json();
    },
    onSuccess: (newGoal) => {
      queryClient.setQueryData<Goal[]>(["goals"], (old) =>
        old ? [newGoal, ...old] : [newGoal]
      );
    },
  });
}

function useEditGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goal: {
      id: number;
      title: string;
      description?: string;
      targetDate: string;
    }) => {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return res.json();
    },
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData<Goal[]>(["goals"], (old) =>
        old
          ? old.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
          : [updatedGoal]
      );
    },
  });
}

function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete goal");
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Goal[]>(["goals"], (old) =>
        old ? old.filter((g) => g.id !== deletedId) : []
      );
    },
  });
}

export default function GoalsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { data: goals = [], isLoading, error } = useGoals(!!isSignedIn);
  const addGoal = useAddGoal();
  const editGoal = useEditGoal();
  const deleteGoal = useDeleteGoal();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [dateObj, setDateObj] = useState<Date | undefined>(
    targetDate ? new Date(targetDate) : undefined
  );
  const [editDateObj, setEditDateObj] = useState<Date | undefined>(
    editTargetDate ? new Date(editTargetDate) : undefined
  );

  function handleDateChange(date: Date | undefined) {
    setDateObj(date);
    setTargetDate(date ? format(date, "yyyy-MM-dd") : "");
  }

  function handleEditDateChange(date: Date | undefined) {
    setEditDateObj(date);
    setEditTargetDate(date ? format(date, "yyyy-MM-dd") : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addGoal.mutate(
      { title, description, targetDate },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setTargetDate("");
          setDateObj(undefined);
        },
      }
    );
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description || "");
    setEditTargetDate(goal.targetDate);
    setEditDateObj(goal.targetDate ? new Date(goal.targetDate) : undefined);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditTargetDate("");
    setEditDateObj(undefined);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      editGoal.mutate(
        {
          id: editingId,
          title: editTitle,
          description: editDescription,
          targetDate: editTargetDate,
        },
        { onSuccess: cancelEdit }
      );
    }
  }

  function handleDelete() {
    if (editingId) {
      deleteGoal.mutate(editingId, { onSuccess: cancelEdit });
    }
  }

  if (!isLoaded) return null;
  if (!isSignedIn) {
    return (
      <div className="p-8 text-center">Please sign in to view your goals.</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Goals</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <input
          className="border rounded p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Goal title"
          required
        />
        <textarea
          className="border rounded p-2 min-h-[60px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateObj && "text-muted-foreground"
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateObj ? format(dateObj, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              disabled={{ before: new Date() }}
              mode="single"
              selected={dateObj}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={addGoal.isPending || !title.trim() || !targetDate}
        >
          Add Goal
        </Button>
      </form>
      {error && <div className="text-red-600 mb-4">{error.message}</div>}
      <div className="space-y-4">
        {isLoading ? null : goals.length === 0 ? (
          <div className="text-gray-500">No goals yet.</div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="rounded p-3 bg-neutral-800">
              {editingId === goal.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="flex flex-col gap-2"
                >
                  <input
                    className="border rounded p-2"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                  <textarea
                    className="border rounded p-2 min-h-[60px]"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editDateObj && "text-muted-foreground"
                        )}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDateObj ? (
                          format(editDateObj, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editDateObj}
                        onSelect={handleEditDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
                      disabled={
                        editGoal.isPending ||
                        !editTitle.trim() ||
                        !editTargetDate
                      }
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      className="rounded px-4 py-2"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="rounded px-4 py-2 text-red-500 border border-red-500 ml-auto"
                      onClick={handleDelete}
                      disabled={deleteGoal.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-semibold">{goal.title}</div>
                  <div className="text-sm text-neutral-400 mb-1">
                    Target: {goal.targetDate}
                  </div>
                  {goal.description && (
                    <div className="text-neutral-300">{goal.description}</div>
                  )}
                  <button
                    className="text-xs text-blue-400 underline mt-2"
                    onClick={() => startEdit(goal)}
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
