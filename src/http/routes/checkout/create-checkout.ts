import { database } from "@/database/connection";
import { schema } from "@/database/schemas";
import { env } from "@/env";
import { abacatePay } from "@/services/abacate-pay";
import { eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { auth } from "@/http/middlewares/auth";

export const createCheckout: FastifyPluginAsyncZod = async (server) => {
  server
  .register(auth)
  .post(
    '/checkout',
    {
      schema: {
        response: {
          200: z.object({ url: z.string() }),
          400: z.object({ message: z.string() })
        }
      }
    },
    async (request, reply) => {
     const userId = await request.getCurrentUserId()

      const [user] = await database
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))

      if (!user?.legalIdNumber) {
        return reply.status(400).send({ message: 'CPF/CNPJ nao cadastrado.' })
      }

      const [address] = await database
        .select()
        .from(schema.addresses)
        .where(eq(schema.addresses.userId, userId))

      if (!address) {
        return reply.status(400).send({ message: 'Endereco nao cadastrado.' })
      }

      const billing = await abacatePay.createBilling({
        frequency: 'MONTHLY',
        methods: ['CREDIT_CARD'],
        products: [
          {
            externalId: 'cafeina-subscription',
            name: 'Assinatura Cafe-Na',
            quantity: 1,
            price: 7990,
          },
        ],
        customer: {
          id: user.abacateCustomerId,
          taxId: user.legalIdNumber,
        },
        returnUrl: env.AUTH_REDIRECT_URL,
      })

      return reply.status(200).send({ url: billing.url })
    }
  )
}
