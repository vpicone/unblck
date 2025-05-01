import { relations } from "drizzle-orm/relations";
import { users, journalEntries, statusTypes, goals } from "./schema";

export const journalEntriesRelations = relations(journalEntries, ({one}) => ({
	user: one(users, {
		fields: [journalEntries.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	journalEntries: many(journalEntries),
	goals: many(goals),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	statusType: one(statusTypes, {
		fields: [goals.statusId],
		references: [statusTypes.id]
	}),
	user: one(users, {
		fields: [goals.userId],
		references: [users.id]
	}),
}));

export const statusTypesRelations = relations(statusTypes, ({many}) => ({
	goals: many(goals),
}));