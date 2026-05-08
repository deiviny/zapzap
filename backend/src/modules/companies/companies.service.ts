import { prisma } from '../../lib/prisma'
import { CompanyStatus } from '@prisma/client'

export class CompaniesService {
  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.company.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { sessions: true, messages: true } } },
      }),
      prisma.company.count(),
    ])
    return { data, total, page, limit }
  }

  async findById(id: string) {
    return prisma.company.findUniqueOrThrow({ where: { id } })
  }

  async create(data: { name: string; document: string; email: string; phone?: string; dailyLimit?: number }) {
    return prisma.company.create({ data: { ...data, dailyLimit: data.dailyLimit ?? 100 } })
  }

  async update(
    id: string,
    data: Partial<{ name: string; email: string; phone: string; dailyLimit: number; status: CompanyStatus }>
  ) {
    return prisma.company.update({ where: { id }, data })
  }

  async addCredits(id: string, amount: number, description: string, adminId: string) {
    const [company] = await prisma.$transaction([
      prisma.company.update({ where: { id }, data: { creditBalance: { increment: amount } } }),
      prisma.creditLog.create({
        data: { companyId: id, amount, type: 'MANUAL_ADD', description, adminId },
      }),
    ])
    return company
  }

  async delete(id: string) {
    return prisma.company.update({ where: { id }, data: { status: 'CANCELLED' } })
  }
}
