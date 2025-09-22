'use client'

import { useHybridAuth } from '@/hooks/use-hybrid-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminSidebar from './components/AdminSidebar'

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, loading } = useHybridAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!session) {
        console.log('[AdminLayout] No session, redirecting to login')
        router.push('/login')
      } else if (session.role !== 'SUPER_ADMIN') {
        console.log('[AdminLayout] Not super admin, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        console.log('[AdminLayout] Valid admin session')
      }
    }
  }, [session, loading, router])

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: '280px' }}>
        {children}
      </main>
    </div>
  )
}