import { prisma } from '../../lib/prisma'
import { messageQueue } from '../../queues/message.queue'
import { isValidPhone } from '../../utils/phone'

export class MessagesService {
  async sendText(
    tokenId: string,
    companyId: string,
    sessionId: string,
    phone: string,
    content: string
  ) {
    if (!isValidPhone(phone)) {
      throw new Error('Invalid phone number')
    }

    const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } })

    if (company.creditBalance <= 0) {
      const msg = await prisma.message.create({
        data: {
          companyId,
          sessionId,
          tokenId,
          direction: 'OUTBOUND',
          phone,
          content,
          status: 'BLOCKED_NO_CREDIT',
        },
      })
      throw Object.assign(new Error('Insufficient credits'), { code: 'NO_CREDIT', messageId: msg.id })
    }

    const message = await prisma.message.create({
      data: { companyId, sessionId, tokenId, direction: 'OUTBOUND', phone, content, status: 'PENDING' },
    })

    await prisma.company.update({
      where: { id: companyId },
      data: { creditBalance: { decrement: 1 } },
    })

    await messageQueue.add('send-text', {
      messageId: message.id,
      sessionId,
      phone,
      content,
    })

    return message
  }

  async getStatus(messageId: string, companyId: string) {
    return prisma.message.findFirst({ where: { id: messageId, companyId } })
  }

  async getInbox(
    companyId: string,
    filters: { dateFrom?: string; dateTo?: string; phone?: string; status?: string }
  ) {
    const where: any = { companyId, direction: 'INBOUND' }

    if (filters.dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(filters.dateFrom) }
    if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) }
    if (filters.phone) where.phone = { contains: filters.phone }
    if (filters.status) where.status = filters.status

    return prisma.message.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 })
  }

  async listByCompany(companyId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.message.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { companyId } }),
    ])
    return { data, total, page, limit }
  }
}
