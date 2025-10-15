/**
 * RegistrationsHeader Component
 * Extracted from page.tsx (lines 2815-3017)
 * Green header with search bar and statistics
 */

import React from 'react'
import { Users, TrendingUp, Loader2, Plus, Search } from 'lucide-react'
import type { Registration } from '../types/tournament'

type RegistrationsHeaderProps = {
  registrations: Registration[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  loadingRegistrations: boolean
  onRefresh: () => void
  onAddTeam: () => void
}

export function RegistrationsHeader({
  registrations,
  searchTerm,
  setSearchTerm,
  loadingRegistrations,
  onRefresh,
  onAddTeam
}: RegistrationsHeaderProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #047857, #059669)',
        borderRadius: '16px 16px 0 0',
        padding: '24px',
        color: 'white'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={24} color="white" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                margin: '0 0 4px 0',
                color: 'white'
              }}
            >
              Equipos Inscritos
            </h2>
            <p
              style={{
                fontSize: '14px',
                margin: 0,
                color: 'rgba(255,255,255,0.8)'
              }}
            >
              Gestión de inscripciones y participantes del torneo
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onRefresh}
            disabled={loadingRegistrations}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              cursor: loadingRegistrations ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              width: '44px',
              height: '44px'
            }}
            onMouseEnter={(e) => {
              if (!loadingRegistrations) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            }}
          >
            {loadingRegistrations ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <TrendingUp size={20} />
            )}
          </button>
          <button
            onClick={onAddTeam}
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              width: '44px',
              height: '44px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div
        style={{
          position: 'relative',
          marginBottom: '20px'
        }}
      >
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.6)'
          }}
        />
        <input
          type="text"
          placeholder="Buscar equipos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 16px 16px 48px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '16px',
            outline: 'none',
            backdropFilter: 'blur(8px)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
        />
      </div>

      {/* Estadísticas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
            {registrations.length}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Total Inscritos
          </p>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
            {registrations.filter((r) => r.confirmed).length}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Confirmados
          </p>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
            {registrations.filter((r) => r.paymentStatus === 'pending').length}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Pago Pendiente
          </p>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
            {registrations.filter((r) => r.checkedIn).length}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Check-in
          </p>
        </div>
      </div>
    </div>
  )
}
