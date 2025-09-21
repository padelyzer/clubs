import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { PiggyBank, DollarSign, Clock, CheckCircle, AlertCircle, Calendar, Building2, CreditCard, TrendingUp, Filter, Download, Search } from 'lucide-react'

export default async function PayoutsPage() {
  await requireSuperAdmin()

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // Obtener datos de pagos
  const [
    totalPayouts,
    monthlyPayouts,
    pendingPayouts,
    completedPayouts,
    clubsWithPendingPayouts,
    avgPayoutAmount
  ] = await Promise.all([
    // Total payouts simulado
    Promise.resolve(125000),
    // Payouts del mes simulado
    Promise.resolve(18500),
    // Pagos pendientes simulado
    Promise.resolve(5),
    // Pagos completados simulado
    Promise.resolve(42),
    // Clubs con pagos pendientes
    prisma.club.findMany({
      where: {
        status: 'APPROVED',
        bookings: {
          some: {
            status: 'COMPLETED',
            createdAt: { gte: startOfMonth }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED',
                createdAt: { gte: startOfMonth }
              }
            }
          }
        }
      },
      take: 10
    }),
    // Promedio de pago simulado
    Promise.resolve(2800)
  ])

  // Datos simulados de pagos recientes
  const recentPayouts = [
    {
      id: 1,
      clubName: 'Club Deportivo Las Águilas',
      amount: 4250,
      date: new Date('2024-09-05'),
      status: 'COMPLETED',
      bookingsCount: 8,
      commission: 4250 * 0.15
    },
    {
      id: 2,
      clubName: 'Centro Tennístico Norte',
      amount: 3180,
      date: new Date('2024-09-04'),
      status: 'PENDING',
      bookingsCount: 6,
      commission: 3180 * 0.15
    },
    {
      id: 3,
      clubName: 'Padel Club Premium',
      amount: 5670,
      date: new Date('2024-09-03'),
      status: 'PROCESSING',
      bookingsCount: 12,
      commission: 5670 * 0.15
    },
    {
      id: 4,
      clubName: 'Sports Complex Elite',
      amount: 2890,
      date: new Date('2024-09-02'),
      status: 'COMPLETED',
      bookingsCount: 5,
      commission: 2890 * 0.15
    },
    {
      id: 5,
      clubName: 'Club Familiar del Valle',
      amount: 1980,
      date: new Date('2024-09-01'),
      status: 'FAILED',
      bookingsCount: 4,
      commission: 1980 * 0.15
    }
  ]

  const metrics = [
    {
      title: 'Total Pagos Realizados',
      value: `$${(totalPayouts / 100).toLocaleString('es-MX')}`,
      subtitle: 'Histórico total',
      icon: <PiggyBank size={24} />,
      color: 'green',
      bgColor: '#10b981'
    },
    {
      title: 'Pagos del Mes',
      value: `$${(monthlyPayouts / 100).toLocaleString('es-MX')}`,
      subtitle: 'Septiembre 2024',
      icon: <Calendar size={24} />,
      color: 'blue',
      bgColor: '#3b82f6'
    },
    {
      title: 'Pagos Pendientes',
      value: pendingPayouts.toString(),
      subtitle: 'Requieren procesamiento',
      icon: <Clock size={24} />,
      color: 'orange',
      bgColor: '#f97316'
    },
    {
      title: 'Pagos Completados',
      value: completedPayouts.toString(),
      subtitle: 'Este mes',
      icon: <CheckCircle size={24} />,
      color: 'green',
      bgColor: '#10b981'
    },
    {
      title: 'Promedio por Pago',
      value: `$${(avgPayoutAmount / 100).toLocaleString('es-MX')}`,
      subtitle: 'Por transacción',
      icon: <TrendingUp size={24} />,
      color: 'purple',
      bgColor: '#8b5cf6'
    },
    {
      title: 'Comisión Total',
      value: `$${((totalPayouts * 0.15) / 100).toLocaleString('es-MX')}`,
      subtitle: '15% de comisión',
      icon: <DollarSign size={24} />,
      color: 'indigo',
      bgColor: '#6366f1'
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { color: '#10b981', bg: '#d1fae5', text: 'Completado' },
      PENDING: { color: '#f59e0b', bg: '#fef3c7', text: 'Pendiente' },
      PROCESSING: { color: '#3b82f6', bg: '#dbeafe', text: 'Procesando' },
      FAILED: { color: '#ef4444', bg: '#fee2e2', text: 'Fallido' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        color: config.color,
        background: config.bg
      }}>
        {config.text}
      </span>
    )
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                Gestión de Pagos a Clubs
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Administra y procesa pagos a clubs deportivos por sus servicios
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <Download size={16} />
                Exportar
              </button>
              <button style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <CreditCard size={16} />
                Procesar Pagos
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {metric.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Recent Payouts */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Pagos Recientes
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px'
                }}>
                  <Filter size={14} />
                  Filtros
                </button>
                <button style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px'
                }}>
                  <Search size={14} />
                  Buscar
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Club
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Monto
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Reservas
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Fecha
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Estado
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayouts.map((payout) => (
                    <tr key={payout.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div>
                          <p style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {payout.clubName}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>
                            Comisión: ${(payout.commission / 100).toLocaleString('es-MX')}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0', fontWeight: '500' }}>
                        ${(payout.amount / 100).toLocaleString('es-MX')}
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        {payout.bookingsCount} reservas
                      </td>
                      <td style={{ padding: '16px 0', fontSize: '14px', color: '#6b7280' }}>
                        {payout.date.toLocaleDateString('es-MX')}
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        {getStatusBadge(payout.status)}
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{
                            padding: '4px 8px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}>
                            Ver
                          </button>
                          {payout.status === 'PENDING' && (
                            <button style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}>
                              Procesar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clubs with Pending Payouts */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Clubs con Actividad
            </h2>
            <div style={{ space: '12px' }}>
              {clubsWithPendingPayouts.map((club) => (
                <div key={club.id} style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Building2 size={16} color="#6b7280" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>
                        {club.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        {club._count.bookings} reservas este mes
                      </p>
                    </div>
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '6px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#374151'
                  }}>
                    Calcular Pago
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          <button style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}>
            <CreditCard size={20} color="#10b981" />
            <span style={{ fontWeight: 500 }}>Procesar Pagos Pendientes</span>
          </button>
          
          <button style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}>
            <AlertCircle size={20} color="#f59e0b" />
            <span style={{ fontWeight: 500 }}>Revisar Pagos Fallidos</span>
          </button>
          
          <button style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}>
            <Download size={20} color="#3b82f6" />
            <span style={{ fontWeight: 500 }}>Exportar Reporte</span>
          </button>
        </div>
      </div>
    </div>
  )
}