import axios from 'axios'
import { prisma } from '../../lib/prisma'
import { config, ASAAS_BASE_URL } from '../../config'

const asaasClient = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: { access_token: config.ASAAS_API_KEY },
})

export class PaymentsService {
  async createCharge(
    companyId: string,
    amount: number,
    description: string,
    billingType: string,
    creditsToGrant?: number
  ) {
    const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } })

    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const response = await asaasClient.post('/payments', {
      customer: company.document,
      billingType,
      value: amount,
      dueDate,
      description,
    })

    const payment = await prisma.payment.create({
      data: {
        companyId,
        asaasId: response.data.id,
        amount,
        method: billingType,
        description,
        status: 'PENDING',
        creditsGranted: creditsToGrant,
        dueDate: new Date(dueDate),
      },
    })

    return { payment, checkoutUrl: response.data.invoiceUrl }
  }

  async handleWebhook(payload: any) {
    const { event, payment: asaasPayment } = payload

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      const payment = await prisma.payment.findFirst({ where: { asaasId: asaasPayment.id } })
      if (!payment || payment.status === 'CONFIRMED') return

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'CONFIRMED', paidAt: new Date() },
        }),
        prisma.company.update({
          where: { id: payment.companyId },
          data: { creditBalance: { increment: payment.creditsGranted ?? 0 } },
        }),
        prisma.creditLog.create({
          data: {
            companyId: payment.companyId,
            amount: payment.creditsGranted ?? 0,
            type: 'PAYMENT',
            paymentId: payment.id,
            description: `Payment confirmed: ${asaasPayment.id}`,
          },
        }),
      ])
    }
  }

  async listPayments(companyId?: string) {
    return prisma.payment.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }
}
