import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const plans = pgTable('plans', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text().notNull(),
  externalAbacateId: text().unique(),
  value: integer(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().$onUpdateFn(() => new Date())
})