import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const addresses = pgTable('addresses', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => users.id).notNull().unique(),
  street: text().notNull(),
  city: text().notNull(),
  state: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull().default('BR'),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().$onUpdateFn(() => new Date())
})
