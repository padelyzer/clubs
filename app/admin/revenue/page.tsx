import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Users, Calendar, ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, Receipt, Target } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RevenueDashboardPage() {
  await requireSuperAdmin()

  // Obtener datos de ingresos
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
  const startOfYear = new Date(today.getFullYear(), 0, 1)

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    yearRevenue,
    activeSubscriptions,
    totalBookings,
    pendingPayouts,
    totalCommissions
  ] = await Promise.all([
    // Total revenue all time
    prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { price: true }
    }),
    // This month revenue
    prisma.booking.aggregate({
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      _sum: { price: true }
    }),
    // Last month revenue
    prisma.booking.aggregate({
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { price: true }
    }),
    // Year revenue
    prisma.booking.aggregate({
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: startOfYear }
      },
      _sum: { price: true }
    }),
    // Active subscriptions
    prisma.clubSubscription.count({
      where: { 
        status: 'ACTIVE',
        currentPeriodEnd: { gte: new Date() }
      }
    }),
    // Total bookings count
    prisma.booking.count({
      where: { status: 'COMPLETED' }
    }),
    // Pending payouts (placeholder)
    Promise.resolve(0),
    // Total commissions (15% of revenue)
    prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { price: true }
    }).then(result => (result._sum.price || 0) * 0.15)
  ])

  const monthGrowth = lastMonthRevenue._sum.price 
    ? (((monthRevenue._sum.price || 0) - (lastMonthRevenue._sum.price || 0)) / (lastMonthRevenue._sum.price || 1) * 100)
    : 0

  const metrics = [
    {
      title: 'Ingresos Totales',
      value: `$${((totalRevenue._sum.price || 0) / 100).toLocaleString('es-MX')}`,
      subtitle: 'Histórico total',
      icon: <DollarSign size={24} />,
      color: 'green',
      bgColor: '#10b981'
    },
    {
      title: 'Ingresos del Mes',
      value: `$${((monthRevenue._sum.price || 0) / 100).toLocaleString('es-MX')}`,
      subtitle: `${monthGrowth > 0 ? '+' : ''}${monthGrowth.toFixed(1)}% vs mes anterior`,
      icon: monthGrowth > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />,
      color: monthGrowth > 0 ? 'green' : 'red',
      bgColor: monthGrowth > 0 ? '#10b981' : '#ef4444',
      trend: monthGrowth
    },
    {
      title: 'Ingresos del Año',
      value: `$${((yearRevenue._sum.price || 0) / 100).toLocaleString('es-MX')}`,
      subtitle: `${new Date().getFullYear()}`,
      icon: <Calendar size={24} />,
      color: 'blue',
      bgColor: '#3b82f6'
    },
    {
      title: 'Comisiones Totales',
      value: `$${(totalCommissions / 100).toLocaleString('es-MX')}`,
      subtitle: '15% de comisión',
      icon: <Wallet size={24} />,
      color: 'purple',
      bgColor: '#8b5cf6'
    },
    {
      title: 'Suscripciones Activas',
      value: activeSubscriptions.toString(),
      subtitle: 'Clubs con suscripción',
      icon: <CreditCard size={24} />,
      color: 'indigo',
      bgColor: '#6366f1'
    },
    {
      title: 'Reservas Completadas',
      value: totalBookings.toLocaleString('es-MX'),
      subtitle: 'Total histórico',
      icon: <Users size={24} />,
      color: 'orange',
      bgColor: '#f97316'
    }
  ]

  // Datos para gráfica mensual (últimos 12 meses)
  const monthlyData: any[] = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const revenue = await prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { price: true }
    })
    
    monthlyData.push({
      month: date.toLocaleDateString('es-MX', { month: 'short' }),
      revenue: (revenue._sum.price || 0) / 100
    })
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f5f5f5', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Dashboard de Ingresos
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Monitoreo completo de ingresos, comisiones y pagos
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {metrics.map((metric, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    {metric.title}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {metric.value}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${metric.bgColor}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: metric.bgColor
                }}>
                  {metric.icon}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {metric.trend !== undefined && (
                  metric.trend > 0 ? (
                    <ArrowUpRight size={16} color="#10b981" />
                  ) : (
                    <ArrowDownRight size={16} color="#ef4444" />
                  )
                )}
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  {metric.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Revenue Chart */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Ingresos Mensuales (Últimos 12 meses)
          </h2>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            {monthlyData.map((data, index) => {
              const maxRevenue = Math.max(...monthlyData.map(d => d.revenue))
              const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 250 : 0
              
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: `${height}px`,
                    background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#4b5563',
                      whiteSpace: 'nowrap'
                    }}>
                      ${data.revenue.toLocaleString('es-MX')}
                    </div>
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {data.month}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <a href="/admin/revenue/commissions" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Wallet size={20} color="#8b5cf6" />
            <span style={{ fontWeight: 500 }}>Ver Comisiones</span>
          </a>
          
          <a href="/admin/revenue/payouts" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <PiggyBank size={20} color="#10b981" />
            <span style={{ fontWeight: 500 }}>Gestionar Pagos</span>
          </a>
          
          <a href="/admin/revenue/reports" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Receipt size={20} color="#3b82f6" />
            <span style={{ fontWeight: 500 }}>Generar Reportes</span>
          </a>
          
          <a href="/admin/billing" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Target size={20} color="#f97316" />
            <span style={{ fontWeight: 500 }}>Facturación</span>
          </a>
        </div>
      </div>
    </div>
  )
}