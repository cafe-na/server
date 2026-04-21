import { database } from "@/database/connection";
import { schema } from "@/database/schemas";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { auth } from "@/http/middlewares/auth";
import { and, eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";

export const updateProfile: FastifyPluginAsyncZod = async (server) => {
  server
    .register(auth)
    .put(
      '/profile',
      {
        schema: {
          summary: 'Update user profile',
          tags: ['Auth'],
          body: z.object({
            name: z.string(),
            legalIdNumber: z.string().nullable(),
            phoneNumber: z.string().nullable(),
          }),
          response: {
            204: z.null()
          }
        }
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { name, legalIdNumber, phoneNumber } = request.body

        const cleanLegalId = legalIdNumber ? legalIdNumber.replace(/\D/g, '') : null
        const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : null

        const [user] = await database
          .select()
          .from(schema.users)
          .where(
            and(
              eq(schema.users.id, userId),
            )
          )

        if (!user) {
          throw new UnauthorizedError('Usuário não encontrado.')
        }

        await database
          .update(schema.users)
          .set({
            name: name,
            legalIdNumber: cleanLegalId,
            phoneNumber: cleanPhone,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(schema.users.id, userId),
            )
          )

        return reply.status(204).send(null)
      }
    )
}