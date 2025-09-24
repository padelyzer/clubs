'use client'

import React, { useState, useEffect } from 'react'
import { CardModern, CardModernHeader, CardModernTitle } from '@/components/design-system/CardModern'
import { 
  TrendingUp, Users, Calendar, DollarSign,
  Activity, Clock, MapPin, Star, X, Loader2
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/design-system/localization'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    activeClients: 0,
    newClientsMonth: 0,
    pendingPayments: 0,
    courtUtilization: 0
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [courtStats, setCourtStats] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [bookingsRes, transactionsRes, playersRes, courtsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/finance/transactions?period=month'),
        fetch('/api/players'),
        fetch('/api/settings/courts')
      ])

      const bookingsData = await bookingsRes.json()
      const transactionsData = await transactionsRes.json()
      const playersData = await playersRes.json()
      const courtsData = await courtsRes.json()

      // Process bookings metrics
      if (bookingsData.success) {
        const bookings = bookingsData.bookings || []
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)

        const todayBookings = bookings.filter((b: any) => {
          const bookingDate = new Date(b.date)
          bookingDate.setHours(0, 0, 0, 0)
          return bookingDate.getTime() === today.getTime()
        })

        const weekBookings = bookings.filter((b: any) => {
          const bookingDate = new Date(b.date)
          return bookingDate >= weekAgo
        })

        const monthBookings = bookings.filter((b: any) => {
          const bookingDate = new Date(b.date)
          return bookingDate >= monthAgo
        })

        // Calculate pending payments
        const pendingPayments = bookings.filter((b: any) => 
          b.paymentStatus === 'pending' || b.paymentStatus === 'processing'
        ).length

        // Set recent bookings (latest 5) - deduplicate by ID
        const uniqueBookings = todayBookings.filter((booking: any, index: number, self: any[]) => 
          index === self.findIndex((b: any) => b.id === booking.id)
        )
        
        setRecentBookings(uniqueBookings.slice(0, 5).map((b: any) => ({
          id: b.id,
          player: b.playerName,
          court: b.court?.name || 'Sin asignar',
          time: b.startTime,
          status: b.status === 'CONFIRMED' ? 'confirmed' : 
                  b.status === 'PENDING' ? 'pending' : 
                  b.status === 'CANCELLED' ? 'cancelled' : 'other',
          paymentStatus: b.paymentStatus
        })))

        setMetrics(prev => ({
          ...prev,
          todayBookings: todayBookings.length,
          weekBookings: weekBookings.length,
          monthBookings: monthBookings.length,
          pendingPayments
        }))
      }

      // Process financial metrics
      if (transactionsData.success) {
        const summary = transactionsData.summary || {}
        setMetrics(prev => ({
          ...prev,
          monthRevenue: summary.income || 0,
          todayRevenue: Math.floor((summary.income || 0) / 30), // Approximate daily
          weekRevenue: Math.floor((summary.income || 0) / 4) // Approximate weekly
        }))
      }

      // Process player metrics
      if (playersData.success) {
        const players = playersData.players || []
        const activeClients = players.filter((p: any) => p.active).length
        
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        const newClients = players.filter((p: any) => 
          new Date(p.createdAt) >= monthAgo
        ).length

        setMetrics(prev => ({
          ...prev,
          activeClients,
          newClientsMonth: newClients
        }))
      }

      // Process court statistics
      if (courtsData.success && bookingsData.success) {
        const courts = courtsData.courts || []
        const bookings = bookingsData.bookings || []
        
        const stats = courts.map((court: any) => {
          const courtBookings = bookings.filter((b: any) => b.courtId === court.id)
          const revenue = courtBookings.reduce((sum: number, b: any) => 
            sum + (b.paymentStatus === 'completed' ? b.price : 0), 0
          )
          
          // Calculate utilization (assuming 14 hours operation, 90 min slots = 9 slots/day)
          const possibleSlots = 9 * 30 // 30 days
          const utilization = Math.min(100, Math.round((courtBookings.length / possibleSlots) * 100))

          return {
            name: court.name,
            bookings: court.stats?.totalBookings || courtBookings.length,
            revenue,
            utilization,
            active: court.active
          }
        })

        setCourtStats(stats)

        // Calculate average utilization
        const avgUtilization = stats.reduce((sum: number, s: any) => 
          sum + s.utilization, 0
        ) / (stats.length || 1)
        
        setMetrics(prev => ({
          ...prev,
          courtUtilization: Math.round(avgUtilization)
        }))
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Loader2 size={32} className="animate-spin" color="#66E7AA" />
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#182A01',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#516640',
            fontWeight: 400,
            margin: 0
          }}>
            Bienvenido de vuelta. Aquí está el resumen de tu club hoy.
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Reservas Hoy */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calendar size={20} color="#182A01" />
                </div>
                <span style={{
                  padding: '4px 8px',
                  background: 'rgba(22, 163, 74, 0.1)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#16a34a'
                }}>
                  HOY
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {metrics.todayBookings}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Reservas hoy
              </div>
            </div>
          </CardModern>

          {/* Ingresos del Mes */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={20} color="#182A01" />
                </div>
                <span style={{
                  padding: '4px 8px',
                  background: 'rgba(22, 163, 74, 0.1)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#16a34a'
                }}>
                  MES
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {formatCurrency(metrics.monthRevenue / 100)}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Ingresos del mes
              </div>
            </div>
          </CardModern>

          {/* Clientes Activos */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} color="#182A01" />
                </div>
                {metrics.newClientsMonth > 0 && (
                  <span style={{
                    padding: '4px 8px',
                    background: 'rgba(22, 163, 74, 0.1)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#16a34a'
                  }}>
                    +{metrics.newClientsMonth}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {metrics.activeClients}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Clientes activos
              </div>
            </div>
          </CardModern>

          {/* Ocupación */}
          <CardModern variant="glass" interactive>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {metrics.courtUtilization}%
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Ocupación promedio
              </div>
            </div>
          </CardModern>
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Recent Bookings */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle>Reservas de Hoy</CardModernTitle>
            </CardModernHeader>
            <div style={{ padding: '20px' }}>
              {recentBookings.length === 0 ? (
                <p style={{ color: '#516640', textAlign: 'center', padding: '20px' }}>
                  No hay reservas para hoy
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentBookings.map((booking) => (
                    <div key={booking.id} style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: booking.status === 'confirmed' ? '#16a34a' : 
                                      booking.status === 'pending' ? '#eab308' : '#dc2626'
                        }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#182A01' }}>
                            {booking.player}
                          </div>
                          <div style={{ fontSize: '12px', color: '#516640' }}>
                            {booking.court} • {booking.time}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        background: booking.paymentStatus === 'completed' 
                          ? 'rgba(22, 163, 74, 0.1)' 
                          : 'rgba(234, 179, 8, 0.1)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: booking.paymentStatus === 'completed' ? '#16a34a' : '#eab308'
                      }}>
                        {booking.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardModern>

          {/* Court Statistics */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle>Estadísticas por Cancha</CardModernTitle>
            </CardModernHeader>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {courtStats.map((court) => (
                  <div key={court.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                        {court.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#516640' }}>
                        {court.utilization}% ocupación
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(164, 223, 78, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${court.utilization}%`,
                        background: 'linear-gradient(90deg, #A4DF4E, #66E7AA)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginTop: '4px'
                    }}>
                      <span style={{ fontSize: '11px', color: '#516640' }}>
                        {court.bookings} reservas
                      </span>
                      <span style={{ fontSize: '11px', color: '#516640' }}>
                        {formatCurrency(court.revenue / 100)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardModern>
        </div>

        {/* Summary Stats */}
        <div style={{ 
          marginTop: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.05))',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {metrics.monthBookings}
            </div>
            <div style={{ fontSize: '12px', color: '#516640' }}>
              Reservas este mes
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {metrics.pendingPayments}
            </div>
            <div style={{ fontSize: '12px', color: '#516640' }}>
              Pagos pendientes
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(metrics.weekRevenue / 100)}
            </div>
            <div style={{ fontSize: '12px', color: '#516640' }}>
              Ingresos esta semana
            </div>
          </div>
        </div>
    </div>
  )
}