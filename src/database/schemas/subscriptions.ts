import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { subscriptionStatusEnum } from "./subscription-status";

export const subscriptions = pgTable('subscriptions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(()=> users.id),
  status: subscriptionStatusEnum().default('pending').notNull(),
  abacateSubscriptionId: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().$onUpdateFn(() => new Date())
})