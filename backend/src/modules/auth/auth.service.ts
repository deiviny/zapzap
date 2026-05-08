import { prisma } from '../../lib/prisma'
import { hashPassword, verifyPassword } from '../../utils/crypto'

export class AuthService {
  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin || !admin.isActive) {
      return null
    }

    const valid = await verifyPassword(password, admin.passwordHash)
    if (!valid) return null

    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
  }

  async createInitialAdmin(email: string, password: string, name: string) {
    const count = await prisma.admin.count()
    if (count > 0) throw new Error('Admin already exists')

    const passwordHash = await hashPassword(password)
    return prisma.admin.create({ data: { email, passwordHash, name } })
  }
}
