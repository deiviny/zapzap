import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AuthService } from './auth.service'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const authService = new AuthService()

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = loginSchema.parse(request.body)

  const admin = await authService.login(email, password)
  if (!admin) {
    return reply.status(401).send({ error: 'Invalid credentials' })
  }

  const token = await reply.jwtSign({ sub: admin.id, role: admin.role }, { expiresIn: '8h' })

  return { token, admin }
}
