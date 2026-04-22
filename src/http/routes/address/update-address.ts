import { database } from "@/database/connection";
import { schema } from "@/database/schemas";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { auth } from "@/http/middlewares/auth";
import { eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";

export const updateAddress: FastifyPluginAsyncZod = async (server) => {
  server
    .register(auth)
    .put(
      '/address',
      {
        schema: {
          summary: 'Update user address',
          tags: ['Account'],
          body: z.object({
            street: z.string(),
            city: z.string(),
            state: z.string(),
            zipCode: z.string(),
            neighborhood: z.string(),
            number: z.string(),
            complement: z.string().nullable()
          }),
          response: {
            204: z.null()
          }
        }
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { city, complement, neighborhood, number, state, street, zipCode } = request.body

        const cleanZipCode = zipCode.replace(/\D/g, '')

        const [user] = await database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, userId))

        if (!user) {
          throw new UnauthorizedError('Usuário não encontrado.')
        }

        await database
          .insert(schema.addresses)
          .values({
            userId,
            street,
            city,
            state,
            zipCode: cleanZipCode,
            neighborhood,
            number,
            complement
          })
          .onConflictDoUpdate({
            target: schema.addresses.userId,
            set: {
              street,
              city,
              state,
              zipCode: cleanZipCode,
              neighborhood,
              number,
              complement,
              updatedAt: new Date(),
            },
          })

        return reply.status(204).send(null)
      }
    )
}