import { database } from "@/database/connection";
import { schema } from "@/database/schemas";
import { env } from "@/env";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { auth } from "@/http/middlewares/auth";
import { abacatePay } from "@/services/abacate-pay";
import { eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";

export const createCheckout: FastifyPluginAsyncZod = async (server) => {
  server
    .register(auth)
    .post(
      '/checkout',
      {
        schema: {
          body: z.object({ planId: z.uuid() }),
          response: {
            200: z.object({ url: z.string() }),
          }
        }
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { planId } = request.body

        const [user] = await database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, userId))

        if (!user) {
          console.log('🔥 Não achou o usuário')
          throw new BadRequestError('Usuario nao encontrado.')
        }

        if (!user.abacateCustomerId) {
          console.log('🔥 Não achou o cliente abacate pay')
          throw new BadRequestError('Cliente AbacatePay nao encontrado.')
        }

        const [plan] = await database
          .select()
          .from(schema.plans)
          .where(eq(schema.plans.id, planId))

        if (!plan) {
          console.log('🔥 Não achou o plano')
          throw new BadRequestError('Plano nao encontrado.')
        }

        if (!plan.externalAbacateId || plan.value == null) {
          console.log('🔥 Plano inválido')
          throw new BadRequestError('Plano invalido para checkout.')
        }

        try {
          const billing = await abacatePay.createBilling({
            methods: ['CARD'],
            items: [
              {
                externalId: plan.externalAbacateId,
                id: plan.externalAbacateId,
                name: plan.title,
                quantity: 1,
                price: plan.value,
              },
            ],
            customerId: user.abacateCustomerId,
            metadata: { userId: user.id, planId: plan.id },
            returnUrl: env.AUTH_REDIRECT_URL,
          })
          return reply.status(200).send({ url: billing.url })
        } catch (err: any) {
          console.error("🔥 ERRO NO CHECKOUT:", err)
          throw err
        }

      }
    )
}
