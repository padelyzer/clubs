'use client'

import { useEffect, useState } from 'react'
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminIndicator() {
  const [isSuperAdminAccess, setIsSuperAdminAccess] = useState(false)
  const [clubName, setClubName] = useState('')

  useEffect(() => {
    // Verificar si es un acceso de Super Admin
    const checkSuperAdminAccess = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          if (data.session?.isSuperAdminAccess) {
            setIsSuperAdminAccess(true)
            // Obtener el nombre del club si está disponible
            const clubResponse = await fetch('/api/club/current')
            if (clubResponse.ok) {
              const clubData = await clubResponse.json()
              setClubName(clubData.name || '')
            }
          }
        }
      } catch (error) {
        console.error('Error verificando acceso de Super Admin:', error)
      }
    }

    checkSuperAdminAccess()
  }, [])

  if (!isSuperAdminAccess) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
      color: 'white',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(124, 58, 237, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Shield size={20} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>MODO SUPER ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span style={{ fontSize: '14px' }}>
            Estás accediendo al panel de <strong>{clubName || 'este club'}</strong>
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <a
          href="/api/admin/return"
          style={{
            background: 'white',
            color: '#7c3aed',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <ArrowLeft size={16} />
          Volver al Panel Admin
        </a>
      </div>
    </div>
  )
}