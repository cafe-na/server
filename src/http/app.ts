import { env } from '@/env'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastify from 'fastify'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from './routes/_errors/bad-request-error'
import { UnauthorizedError } from './routes/_errors/unauthorized-error'

const server = fastify().withTypeProvider<ZodTypeProvider>()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(fastifyCors, {
  origin: env.AUTH_REDIRECT_URL, //url do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
})

server.register(fastifyCookie, {
  secret: env.JWT_SECRET,
  hook: 'onRequest',
  parseOptions: {},
})

server.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'auth',
    signed: false
  }
})

server.setErrorHandler((error, _request, reply) => {
  const message = error instanceof Error ? error.message : 'Internal server error.'

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ message })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({ message })
  }

  if (typeof error === 'object' && error !== null && 'validation' in error) {
    return reply.status(400).send({ message })
  }

  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : null

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({ message })
    }
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})

export { server }
