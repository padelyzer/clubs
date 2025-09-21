import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import BillingDashboard from './components/billing-dashboard'

async function getInvoiceStats() {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
  const startOfYear = new Date(today.getFullYear(), 0, 1)

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    yearRevenue,
    pendingPayments,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices
  ] = await Promise.all([
    // Total revenue from paid invoices
    prisma.subscriptionInvoice.aggregate({
      where: { status: 'PAID' },
      _sum: { total: true },
      _count: true
    }),

    // Current month revenue
    prisma.subscriptionInvoice.aggregate({
      where: { 
        status: 'PAID',
        paidAt: { gte: startOfMonth }
      },
      _sum: { total: true },
      _count: true
    }),

    // Last month revenue
    prisma.subscriptionInvoice.aggregate({
      where: { 
        status: 'PAID',
        paidAt: { gte: lastMonth, lte: endOfLastMonth }
      },
      _sum: { total: true },
      _count: true
    }),

    // Year revenue
    prisma.subscriptionInvoice.aggregate({
      where: { 
        status: 'PAID',
        paidAt: { gte: startOfYear }
      },
      _sum: { total: true },
      _count: true
    }),

    // Pending payments (PENDING invoices)
    prisma.subscriptionInvoice.aggregate({
      where: { status: 'PENDING' },
      _sum: { total: true },
      _count: true
    }),

    // Total invoices count
    prisma.subscriptionInvoice.count(),

    // Paid invoices count
    prisma.subscriptionInvoice.count({ where: { status: 'PAID' } }),

    // Pending invoices count
    prisma.subscriptionInvoice.count({ where: { status: 'PENDING' } }),

    // Overdue invoices (pending + past due date)
    prisma.subscriptionInvoice.count({ 
      where: { 
        status: 'PENDING',
        dueDate: { lt: today }
      } 
    })
  ])

  // Calculate growth rate
  const growthRate = lastMonthRevenue._sum.total && lastMonthRevenue._sum.total > 0 ? 
    (((monthRevenue._sum.total || 0) - (lastMonthRevenue._sum.total || 0)) / (lastMonthRevenue._sum.total || 1) * 100) : 0

  // Calculate average transaction
  const averageTransaction = totalInvoices > 0 ? (totalRevenue._sum.total || 0) / totalInvoices : 0

  return {
    totalRevenue: (totalRevenue._sum.total || 0) / 100,
    monthRevenue: (monthRevenue._sum.total || 0) / 100,
    lastMonthRevenue: (lastMonthRevenue._sum.total || 0) / 100,
    yearRevenue: (yearRevenue._sum.total || 0) / 100,
    pendingPayments: (pendingPayments._sum.total || 0) / 100,
    averageTransaction: averageTransaction / 100,
    growthRate: Math.round(growthRate * 100) / 100,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    invoicesThisMonth: monthRevenue._count,
    invoicesLastMonth: lastMonthRevenue._count
  }
}

async function getRecentInvoices() {
  return await prisma.subscriptionInvoice.findMany({
    include: {
      club: {
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          state: true,
          status: true
        }
      },
      subscription: {
        select: {
          id: true,
          status: true,
          plan: {
            select: {
              name: true,
              displayName: true,
              price: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

async function getRevenueData() {
  const today = new Date()
  
  // Get last 12 months of revenue data
  const monthlyRevenue = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1)
      
      return prisma.subscriptionInvoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: date, lt: nextMonth }
        },
        _sum: { total: true },
        _count: true
      }).then(result => ({
        month: date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        revenue: (result._sum.total || 0) / 100,
        invoices: result._count,
        date
      }))
    })
  )

  return monthlyRevenue.reverse()
}

async function getPaymentStatusBreakdown() {
  const [paid, pending, failed, cancelled] = await Promise.all([
    prisma.subscriptionInvoice.count({ where: { status: 'PAID' } }),
    prisma.subscriptionInvoice.count({ where: { status: 'PENDING' } }),
    prisma.subscriptionInvoice.count({ where: { status: 'FAILED' } }),
    prisma.subscriptionInvoice.count({ where: { status: 'CANCELLED' } })
  ])

  const total = paid + pending + failed + cancelled

  return {
    paid: { count: paid, percentage: total > 0 ? Math.round((paid / total) * 100) : 0 },
    pending: { count: pending, percentage: total > 0 ? Math.round((pending / total) * 100) : 0 },
    failed: { count: failed, percentage: total > 0 ? Math.round((failed / total) * 100) : 0 },
    cancelled: { count: cancelled, percentage: total > 0 ? Math.round((cancelled / total) * 100) : 0 }
  }
}

export default async function AdminBillingPage() {
  await requireSuperAdmin()

  const [stats, invoices, revenueData, paymentBreakdown] = await Promise.all([
    getInvoiceStats(),
    getRecentInvoices(),
    getRevenueData(),
    getPaymentStatusBreakdown()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Facturación</h1>
      </div>

      <BillingDashboard 
        stats={stats}
        invoices={invoices}
        revenueData={revenueData}
        paymentBreakdown={paymentBreakdown}
      />
    </div>
  )
}