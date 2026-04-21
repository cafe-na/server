import { pgEnum } from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum(
  'subscription_status',
  [
    'pending',
    'active',
    'cancelled',
    'expired'
  ]
)