'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ClubsManagement from './components/clubs-management'

export default function AdminClubsClientPage() {
  const searchParams = useSearchParams()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
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
      const params = new URLSearchParams({
        status,
        search,
        page: page.toString()
      })
      
      const response = await fetch(`/api/admin/clubs?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setClubs(data.clubs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
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

  return <ClubsManagement 
    clubs={clubs} 
    pagination={pagination}
  />
}