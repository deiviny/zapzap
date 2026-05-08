import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.admin.count()
  if (count > 0) {
    console.log('Admin already exists, skipping seed.')
    return
  }

  const passwordHash = await bcrypt.hash('admin123', 12)

  const admin = await prisma.admin.create({
    data: {
      name: 'Administrador',
      email: 'admin@zapzap.com',
      passwordHash,
      role: 'superadmin',
    },
  })

  console.log(`Admin created: ${admin.email}`)
  console.log('Default password: admin123')
  console.log('IMPORTANT: Change the password after first login!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
