'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ClubsManagement from './components/clubs-management'
import { apiCall } from '@/lib/utils/hybrid-fetch'

export default function AdminClubsClientPage() {
  const searchParams = useSearchParams()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    fetchClubs()
  }, [status, search, page])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        status,
        search,
        page: page.toString()
      })
      
      const { data, error, ok } = await apiCall(`/api/admin/clubs?${params}`)
      
      if (ok && data) {
        setClubs(data.clubs || [])
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        })
      } else {
        // Ensure error is always a string
        const errorMsg = typeof error === 'string' ? error : 'Error al cargar los clubes'
        setError(errorMsg)
        console.error('Error fetching clubs:', { error, data })
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchClubs}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return <ClubsManagement 
    clubs={clubs} 
    pagination={pagination}
  />
}