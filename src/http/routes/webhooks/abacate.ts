import { database } from "@/database/connection";
import { schema } from "@/database/schemas";
import { env } from "@/env";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";

export const abacateWebhook: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/webhooks/abacate',
    {
      schema: {
        body: z.object({
          event: z.string(),
          data: z.object({
            id: z.string(),
            metadata: z.record(z.string(), z.string()).optional(),
            customer: z.object({
              taxId: z.string().optional(),
              name: z.string().optional(),
              address: z.object({
                street: z.string(),
                number: z.string(),
                complement: z.string().nullable().optional(),
                neighborhood: z.string(),
                city: z.string(),
                state: z.string(),
                zipCode: z.string(),
              }).optional(),
            }).optional(),
          })
        }),
        response: {
          200: z.object({ ok: z.boolean() })
        }
      }
    },
    async (request, reply) => {
      const authHeader = request.headers.authorization

      if (authHeader !== `Bearer ${env.ABACATEPAY_WEBHOOK_TOKEN}`) {
        throw new UnauthorizedError()
      }

      const { event, data } = request.body

      if (event === 'billing.paid' || event === 'subscription.completed') {
        const userId = data.metadata?.userId
        const planId = data.metadata?.planId

        if (!userId) {
          return reply.status(200).send({ ok: true })
        }

        if (data.customer?.taxId) {
          await database
            .update(schema.users)
            .set({
              legalIdNumber: data.customer.taxId,
              updatedAt: new Date(),
            })
            .where(eq(schema.users.id, userId))
        }

        if (data.customer?.address) {
          const addr = data.customer.address
          const cleanZip = addr.zipCode.replace(/\D/g, '')

          await database
            .insert(schema.addresses)
            .values({
              userId,
              street: addr.street,
              number: addr.number,
              complement: addr.complement ?? null,
              neighborhood: addr.neighborhood,
              city: addr.city,
              state: addr.state,
              zipCode: cleanZip,
            })
            .onConflictDoUpdate({
              target: schema.addresses.userId,
              set: {
                street: addr.street,
                number: addr.number,
                complement: addr.complement ?? null,
                neighborhood: addr.neighborhood,
                city: addr.city,
                state: addr.state,
                zipCode: cleanZip,
                updatedAt: new Date(),
              }
            })
        }

        await database
          .insert(schema.subscriptions)
          .values({
            userId,
            planId: planId ?? null,
            status: 'active',
            abacateSubscriptionId: data.id,
          })
          .onConflictDoUpdate({
            target: schema.subscriptions.userId,
            set: {
              status: 'active',
              planId: planId ?? null,
              abacateSubscriptionId: data.id,
              updatedAt: new Date(),
            }
          })
      }

      return reply.status(200).send({ ok: true })
    }
  )
}
