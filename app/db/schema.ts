import { pgTable, text, timestamp, index, foreignKey, serial, unique, date, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const journalEntries = pgTable("journal_entries", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_users").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_users"
		}).onDelete("cascade"),
]);

export const statusTypes = pgTable("status_types", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("status_types_name_key").on(table.name),
]);

export const goals = pgTable("goals", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	targetDate: date("target_date").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	statusId: integer("status_id").default(2).notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.statusId],
			foreignColumns: [statusTypes.id],
			name: "goals_status_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_users"
		}).onDelete("cascade"),
]);
