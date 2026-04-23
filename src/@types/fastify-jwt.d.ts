import '@fastify/jwt'
import 'fastify'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string }
    user: { sub: string }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    getCurrentUserId(): Promise<string>
  }
}
