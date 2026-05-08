import { prisma } from '../../lib/prisma'

export class CreditsService {
  async getBalance(companyId: string) {
    const company = await prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { creditBalance: true, id: true, name: true },
    })
    return company
  }

  async getLogs(companyId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.creditLog.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.creditLog.count({ where: { companyId } }),
    ])
    return { data, total, page, limit }
  }

  async addCredits(companyId: string, amount: number, type: string, description: string, adminId?: string) {
    const [company] = await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: { creditBalance: { increment: amount } },
      }),
      prisma.creditLog.create({
        data: { companyId, amount, type, description, adminId },
      }),
    ])
    return company
  }

  async deductCredits(companyId: string, amount: number, description: string) {
    const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } })
    if (company.creditBalance < amount) {
      throw new Error('Insufficient credits')
    }

    const [updated] = await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: { creditBalance: { decrement: amount } },
      }),
      prisma.creditLog.create({
        data: { companyId, amount: -amount, type: 'DEDUCTION', description },
      }),
    ])
    return updated
  }
}
