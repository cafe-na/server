import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getProfile: FastifyPluginAsyncZod = async (server) => {
  server
  .get('/profile', async () => {})
}