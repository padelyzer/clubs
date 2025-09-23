import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Court {
  id: string
  name: string
  type: string
  active: boolean
}

interface ClubSettings {
  openTime: string
  closeTime: string
  slotDuration: number
  currency: string
}

interface Club {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  settings?: ClubSettings
}

export function useClub() {
  const params = useParams()
  const [club, setClub] = useState<Club | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.clubSlug) return

    async function fetchClubData() {
      try {
        const response = await fetch(`/api/clubs/by-slug/${params.clubSlug}`)
        if (!response.ok) {
          throw new Error('Error loading club data')
        }
        
        const data = await response.json()
        setClub(data.club)
        setCourts(data.courts || [])
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching club data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClubData()
  }, [params.clubSlug])

  return {
    club,
    courts,
    loading,
    error
  }
}