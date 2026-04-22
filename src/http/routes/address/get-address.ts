import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { database } from '@/database/connection'
import { schema } from '@/database/schemas'
import { eq } from 'drizzle-orm'

export async function getAddress(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/address',
      {
        schema: {
          tags: ['Account'],
          summary: 'Get authenticated user address',
          response: {
            200: z.object({
              address: z.object({
                id: z.uuid(),
                street: z.string(),
                city: z.string(),
                state: z.string(),
                zipCode: z.string(),
                neighborhood: z.string(),
                number: z.string(),
                country: z.string(),
                complement: z.string().nullable()
              }).nullable(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const [address] = await database
          .select()
          .from(schema.addresses)
          .where(
            eq(schema.addresses.userId, userId)
          )

        return reply.send({ address: address ?? null })
      },
    )
}