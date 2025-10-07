'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Componente temporal simplificado para compilar
export function TournamentManagement() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#F9FAFB',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: '#111827'
        }}>
          Gestión de Torneos
        </h1>
        
        <div style={{
          padding: '24px',
          background: '#F3F4F6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6B7280', marginBottom: '16px' }}>
            El módulo de torneos está en desarrollo.
          </p>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
            Esta es una versión temporal para permitir la compilación del proyecto.
          </p>
        </div>
      </div>
    </div>
  )
}
