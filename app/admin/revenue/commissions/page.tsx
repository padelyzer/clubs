import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { Wallet, Building2, DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react'

export default async function CommissionsPage() {
  await requireSuperAdmin()

  // Obtener datos de comisiones por club
  const clubs = await prisma.club.findMany({
    where: { status: 'APPROVED' },
    include: {
      Booking: {
        where: { status: 'COMPLETED' },
        select: {
          price: true,
          createdAt: true
        }
      },
      _count: {
        select: {
          Booking: {
            where: { status: 'COMPLETED' }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const clubCommissions = clubs.map(club => {
    const totalRevenue = club.Booking.reduce((sum, booking) => sum + (booking.price || 0), 0)
    const commission = totalRevenue * 0.15 // 15% commission
    const lastBooking = club.Booking[club.Booking.length - 1]
    
    return {
      id: club.id,
      name: club.name,
      city: club.city,
      totalBookings: club._count.Booking,
      totalRevenue: totalRevenue / 100,
      commission: commission / 100,
      lastActivity: lastBooking?.createdAt || club.createdAt,
      status: club.stripePayoutsEnabled ? 'Activo' : 'Pendiente'
    }
  }).filter(club => club.totalRevenue > 0)

  const totalCommissions = clubCommissions.reduce((sum, club) => sum + club.commission, 0)
  const averageCommission = clubCommissions.length > 0 ? totalCommissions / clubCommissions.length : 0

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                Comisiones por Club
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Gestión de comisiones del 15% sobre reservas completadas
              </p>
            </div>
            <button style={{
              padding: '10px 20px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Filter size={16} />
              Filtrar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#8b5cf615',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wallet size={24} color="#8b5cf6" />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Comisiones Totales</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  ${totalCommissions.toLocaleString('es-MX')}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10b98115',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={24} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Clubs Activos</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {clubCommissions.length}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#3b82f615',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Promedio por Club</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  ${averageCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clubs Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Detalle de Comisiones por Club
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>CLUB</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>CIUDAD</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>RESERVAS</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>INGRESOS TOTALES</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>COMISIÓN (15%)</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>ESTADO</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>ÚLTIMA ACTIVIDAD</th>
                </tr>
              </thead>
              <tbody>
                {clubCommissions.map((club, index) => (
                  <tr key={club.id} style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{club.name}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{club.city}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>{club.totalBookings}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>${club.totalRevenue.toLocaleString('es-MX')}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#8b5cf6' }}>
                      ${club.commission.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: club.status === 'Activo' ? '#10b98120' : '#fbbf2420',
                        color: club.status === 'Activo' ? '#059669' : '#d97706'
                      }}>
                        {club.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                      {new Date(club.lastActivity).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}