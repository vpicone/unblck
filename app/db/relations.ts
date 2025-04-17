import { relations } from "drizzle-orm/relations";
import { users, journalEntries } from "./schema";

export const journalEntriesRelations = relations(journalEntries, ({one}) => ({
	user: one(users, {
		fields: [journalEntries.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	journalEntries: many(journalEntries),
}));