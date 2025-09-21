'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ModernDashboardLayout } from '@/components/layouts/ModernDashboardLayout'
import { CalendarView } from '@/components/calendar/CalendarView'
import { List, CalendarDays } from 'lucide-react'

export default function BookingsCalendarPage() {
  const router = useRouter()
  const [clubSlug, setClubSlug] = useState<string | null>(null)

  useEffect(() => {
    // Get user's club slug for correct navigation
    const fetchClubSlug = async () => {
      try {
        const response = await fetch('/api/settings/club')
        if (response.ok) {
          const data = await response.json()
          const slug = data.club?.slug
          if (slug) {
            setClubSlug(slug)
            // Redirect to correct URL structure
            router.replace(`/c/${slug}/dashboard/bookings/calendar`)
          }
        }
      } catch (error) {
        console.error('Error fetching club slug:', error)
      }
    }

    fetchClubSlug()
  }, [router])

  // Show loading while we fetch the club slug
  if (!clubSlug) {
    return (
      <ModernDashboardLayout>
        <div style={{ 
          padding: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <div>Cargando...</div>
        </div>
      </ModernDashboardLayout>
    )
  }
  
  return (
    <ModernDashboardLayout>
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#182A01',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em'
          }}>
            Reservaciones
          </h1>
          
          {/* Navigation Tabs */}
          <div style={{ 
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            paddingBottom: '0'
          }}>
            <button
              onClick={() => router.push(`/c/${clubSlug}/dashboard/bookings`)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: '3px solid transparent',
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginBottom: '-1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#374151'
                e.currentTarget.style.borderBottomColor = 'rgba(16, 185, 129, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280'
                e.currentTarget.style.borderBottomColor = 'transparent'
              }}
            >
              <List size={16} />
              Vista Lista
            </button>
            <button
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: '3px solid #10B981',
                color: '#182A01',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginBottom: '-1px'
              }}
            >
              <CalendarDays size={16} />
              Vista Calendario
            </button>
          </div>
        </div>
        
        {/* Calendar Component */}
        <CalendarView />
      </div>
    </ModernDashboardLayout>
  )
}