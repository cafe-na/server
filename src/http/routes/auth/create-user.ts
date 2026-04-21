import { database } from "@/database/connection";
import { schema } from "@/database/schemas";
import { abacatePay } from "@/services/abacate-pay";
import { eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";

type GoogleOAuthUserResponse = {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
}

export const createUser: FastifyPluginAsyncZod = async (server) => {
  server
    .post(
      '/users',
      {
        schema: {
          body: z.object({
            access_token: z.string()
          }),
          response: {
            201: z.object({
              token: z.string()
            })
          }
        }
      },
      async (request, reply) => {
        const { access_token } = request.body

        const response = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
        )

        if (!response.ok) {
          throw new Error('Invalid token')
        }

        const userData = await response.json() as GoogleOAuthUserResponse

        let [userWithEmail] = await database
          .select()
          .from(schema.users)
          .where(
            eq(schema.users.email, userData.email)
          )

        if (!userWithEmail) {
          const customer = await abacatePay.createCustomer({
            email: userData.email,
            name: userData.name,
          });

          [userWithEmail] = await database
            .insert(schema.users)
            .values({
              email: userData.email,
              name: userData.name,
              avatarURL: userData.picture,
              abacateCustomerId: customer.data.id,
            })
            .returning()
        }

        const token = await reply.jwtSign(
          {
            sub: userWithEmail.id,
          },
          {
            sign: {
              expiresIn: '7d'
            }
          }
        )

        return reply.status(201).send({ token })
      })
}