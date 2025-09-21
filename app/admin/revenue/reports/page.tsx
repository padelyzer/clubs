import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { BarChart, FileText, TrendingUp, Calendar, DollarSign, PieChart, Download, Filter, Eye, RefreshCw, CreditCard, Users, Building2, Target } from 'lucide-react'

export default async function ReportsPage() {
  await requireSuperAdmin()

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  // Obtener datos reales para los reportes
  const [
    monthlyRevenue,
    yearlyRevenue,
    totalBookings,
    activeClubs,
    topClubsData
  ] = await Promise.all([
    // Ingresos del mes
    prisma.booking.aggregate({
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      _sum: { price: true }
    }),
    // Ingresos del año
    prisma.booking.aggregate({
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: startOfYear }
      },
      _sum: { price: true }
    }),
    // Total de reservas
    prisma.booking.count({
      where: { status: 'COMPLETED' }
    }),
    // Clubs activos
    prisma.club.count({
      where: { status: 'APPROVED' }
    }),
    // Top clubs por ingresos (datos reales)
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
      take: 5
    })
  ])

  // Reportes disponibles
  const reports = [
    {
      id: 1,
      name: 'Reporte de Ingresos Mensual',
      description: 'Análisis detallado de ingresos por mes y club',
      type: 'revenue',
      frequency: 'monthly',
      icon: <DollarSign size={20} />,
      color: '#10b981',
      lastGenerated: new Date('2024-09-07'),
      size: '1.2 MB',
      format: 'PDF, Excel'
    },
    {
      id: 2,
      name: 'Reporte de Comisiones',
      description: 'Detalle de comisiones generadas por club',
      type: 'commission',
      frequency: 'monthly',
      icon: <Target size={20} />,
      color: '#8b5cf6',
      lastGenerated: new Date('2024-09-06'),
      size: '890 KB',
      format: 'PDF, CSV'
    },
    {
      id: 3,
      name: 'Análisis de Reservas',
      description: 'Estadísticas de reservas por club y deporte',
      type: 'bookings',
      frequency: 'weekly',
      icon: <BarChart size={20} />,
      color: '#3b82f6',
      lastGenerated: new Date('2024-09-05'),
      size: '2.1 MB',
      format: 'PDF, Excel'
    },
    {
      id: 4,
      name: 'Reporte de Pagos a Clubs',
      description: 'Historial de pagos realizados a clubs',
      type: 'payouts',
      frequency: 'monthly',
      icon: <CreditCard size={20} />,
      color: '#f59e0b',
      lastGenerated: new Date('2024-09-04'),
      size: '750 KB',
      format: 'PDF, CSV'
    },
    {
      id: 5,
      name: 'Dashboard Ejecutivo',
      description: 'Resumen ejecutivo con KPIs principales',
      type: 'executive',
      frequency: 'monthly',
      icon: <TrendingUp size={20} />,
      color: '#ef4444',
      lastGenerated: new Date('2024-09-03'),
      size: '1.8 MB',
      format: 'PDF'
    },
    {
      id: 6,
      name: 'Análisis de Usuarios',
      description: 'Comportamiento y segmentación de usuarios',
      type: 'users',
      frequency: 'monthly',
      icon: <Users size={20} />,
      color: '#06b6d4',
      lastGenerated: new Date('2024-09-02'),
      size: '1.4 MB',
      format: 'PDF, Excel'
    }
  ]

  // Métricas clave
  const metrics = [
    {
      title: 'Ingresos del Mes',
      value: `$${((monthlyRevenue._sum.price || 0) / 100).toLocaleString('es-MX')}`,
      subtitle: 'Septiembre 2024',
      icon: <DollarSign size={24} />,
      color: 'green',
      bgColor: '#10b981'
    },
    {
      title: 'Ingresos del Año',
      value: `$${((yearlyRevenue._sum.price || 0) / 100).toLocaleString('es-MX')}`,
      subtitle: '2024',
      icon: <Calendar size={24} />,
      color: 'blue',
      bgColor: '#3b82f6'
    },
    {
      title: 'Total Reservas',
      value: totalBookings.toLocaleString('es-MX'),
      subtitle: 'Completadas',
      icon: <BarChart size={24} />,
      color: 'purple',
      bgColor: '#8b5cf6'
    },
    {
      title: 'Clubs Activos',
      value: activeClubs.toString(),
      subtitle: 'Aprobados',
      icon: <Building2 size={24} />,
      color: 'orange',
      bgColor: '#f97316'
    }
  ]

  // Datos para gráfico de ingresos mensuales (simulado)
  const monthlyData = [
    { month: 'Ene', revenue: 45200, commission: 6780 },
    { month: 'Feb', revenue: 52100, commission: 7815 },
    { month: 'Mar', revenue: 48900, commission: 7335 },
    { month: 'Abr', revenue: 61200, commission: 9180 },
    { month: 'May', revenue: 58700, commission: 8805 },
    { month: 'Jun', revenue: 67800, commission: 10170 },
    { month: 'Jul', revenue: 72300, commission: 10845 },
    { month: 'Ago', revenue: 69500, commission: 10425 },
    { month: 'Sep', revenue: (monthlyRevenue._sum.price || 0) / 100, commission: ((monthlyRevenue._sum.price || 0) * 0.15) / 100 }
  ]

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: { color: '#10b981', bg: '#d1fae5' },
      weekly: { color: '#3b82f6', bg: '#dbeafe' },
      monthly: { color: '#8b5cf6', bg: '#e9d5ff' },
      quarterly: { color: '#f59e0b', bg: '#fef3c7' }
    }
    const config = colors[frequency as keyof typeof colors] || colors.monthly
    
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500',
        color: config.color,
        background: config.bg
      }}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
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
                Reportes Financieros
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Genera y descarga reportes detallados de ingresos, comisiones y análisis
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <Filter size={16} />
                Filtrar
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
                <RefreshCw size={16} />
                Actualizar Datos
              </button>
            </div>
          </div>
        </div>

        {/* Metrics */}
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
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {metric.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Revenue Chart */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Ingresos y Comisiones 2024
            </h2>
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              {monthlyData.map((data, index) => {
                const maxRevenue = Math.max(...monthlyData.map(d => d.revenue))
                const revenueHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * 250 : 0
                const commissionHeight = maxRevenue > 0 ? (data.commission / maxRevenue) * 250 : 0
                
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', width: '100%', height: '250px' }}>
                      <div style={{
                        width: '60%',
                        height: `${revenueHeight}px`,
                        background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-25px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#4b5563',
                          whiteSpace: 'nowrap'
                        }}>
                          ${data.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div style={{
                        width: '35%',
                        height: `${commissionHeight}px`,
                        background: 'linear-gradient(180deg, #10b981, #047857)',
                        borderRadius: '4px'
                      }} />
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
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />
                <span>Ingresos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }} />
                <span>Comisiones</span>
              </div>
            </div>
          </div>

          {/* Top Clubs */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Top Clubs este Mes
            </h2>
            <div>
              {topClubsData.map((club, index) => (
                <div key={club.id} style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: index < 3 ? '#ffd700' : '#e5e7eb',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>
                        {club.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        {club._count.bookings} reservas
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Reportes Disponibles
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '16px'
          }}>
            {reports.map((report) => (
              <div key={report.id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: `${report.color}15`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: report.color
                    }}>
                      {report.icon}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {report.name}
                      </h3>
                      {getFrequencyBadge(report.frequency)}
                    </div>
                  </div>
                </div>
                
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  {report.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                  <span>Última generación: {report.lastGenerated.toLocaleDateString('es-MX')}</span>
                  <span>{report.size}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Formatos: {report.format}
                  </span>
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
                      <Eye size={14} />
                      Ver
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      background: report.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}>
                      <Download size={14} />
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}