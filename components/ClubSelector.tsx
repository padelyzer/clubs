'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, Building2, Check } from 'lucide-react'

interface Club {
  id: string
  name: string
  slug: string
}

export function ClubSelector() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [currentClub, setCurrentClub] = useState<Club | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserClubs()
  }, [])

  const fetchUserClubs = async () => {
    try {
      const res = await fetch('/api/user/clubs')
      if (res.ok) {
        const data = await res.json()
        setClubs(data.clubs || [])
        setCurrentClub(data.currentClub || null)
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchClub = async (club: Club) => {
    try {
      const res = await fetch('/api/user/switch-club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club.id })
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentClub(club)
        setIsOpen(false)
        // Redirigir a la nueva URL del club
        window.location.href = data.redirectUrl || `/c/${club.slug}/dashboard`
      }
    } catch (error) {
      console.error('Error switching club:', error)
    }
  }

  // Solo mostrar si hay múltiples clubes
  if (loading || clubs.length <= 1) {
    return null
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'white',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          minWidth: '200px',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} />
          <span>{currentClub?.name || 'Seleccionar Club'}</span>
        </div>
        <ChevronDown size={16} style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'white',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {clubs.map(club => (
            <button
              key={club.id}
              onClick={() => switchClub(club)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: currentClub?.id === club.id ? '#f5f5f5' : 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentClub?.id !== club.id) {
                  e.currentTarget.style.background = '#f9f9f9'
                }
              }}
              onMouseLeave={(e) => {
                if (currentClub?.id !== club.id) {
                  e.currentTarget.style.background = 'white'
                }
              }}
            >
              <span>{club.name}</span>
              {currentClub?.id === club.id && (
                <Check size={16} style={{ color: '#667eea' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}