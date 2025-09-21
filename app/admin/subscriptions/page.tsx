import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import SubscriptionsManagement from './components/subscriptions-management'

async function getSubscriptionPlans() {
  return await prisma.subscriptionPlan.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      clubSubscriptions: {
        include: {
          club: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              status: true
            }
          }
        }
      },
      _count: {
        select: {
          clubSubscriptions: true
        }
      }
    }
  })
}

async function getSubscriptionStats() {
  const [
    totalSubscriptions,
    activeSubscriptions,
    trialingSubscriptions,
    cancelledSubscriptions,
    totalMRR,
    pastDueSubscriptions
  ] = await Promise.all([
    // Total subscriptions count
    prisma.clubSubscription.count(),
    
    // Active subscriptions count
    prisma.clubSubscription.count({ where: { status: 'ACTIVE' } }),
    
    // Trialing subscriptions count
    prisma.clubSubscription.count({ where: { status: 'TRIALING' } }),
    
    // Cancelled subscriptions count
    prisma.clubSubscription.count({ where: { status: 'CANCELLED' } }),
    
    // Calculate total MRR from active subscriptions
    prisma.clubSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true }
    }).then(subs => 
      subs.reduce((total, sub) => total + sub.plan.price, 0)
    ),
    
    // Past due subscriptions count
    prisma.clubSubscription.count({ where: { status: 'PAST_DUE' } })
  ])

  // Calculate churn rate (simplified: cancelled this month / total active)
  const churnRate = activeSubscriptions > 0 
    ? (cancelledSubscriptions / (activeSubscriptions + cancelledSubscriptions)) * 100 
    : 0

  return {
    totalSubscriptions,
    activeSubscriptions,
    trialingSubscriptions,
    cancelledSubscriptions,
    pastDueSubscriptions,
    totalMRR,
    churnRate: Math.round(churnRate * 100) / 100
  }
}

async function getClubSubscriptions() {
  return await prisma.clubSubscription.findMany({
    include: {
      club: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          status: true,
          email: true,
          createdAt: true
        }
      },
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AdminSubscriptionsPage() {
  await requireSuperAdmin()

  const [plans, stats, clubSubscriptions] = await Promise.all([
    getSubscriptionPlans(),
    getSubscriptionStats(),
    getClubSubscriptions()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Suscripciones</h1>
      </div>

      <SubscriptionsManagement 
        plans={plans}
        stats={stats}
        clubSubscriptions={clubSubscriptions}
      />
    </div>
  )
}