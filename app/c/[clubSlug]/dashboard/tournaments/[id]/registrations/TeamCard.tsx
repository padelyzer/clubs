/**
 * TeamCard Component
 * Extracted from page.tsx (lines 3112-3379)
 * Individual team card with player info and actions
 */

import React from 'react'
import { Users, CheckCircle, Clock, XCircle, Eye, Edit, Trash2 } from 'lucide-react'
import type { Registration } from '../types/tournament'

type TeamCardProps = {
  registration: Registration
  index: number
  onEdit: (reg: Registration) => void
  onDelete?: (id: string) => void
}

export function TeamCard({ registration: reg, index, onEdit, onDelete }: TeamCardProps) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
        e.currentTarget.style.borderColor = '#059669'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#e5e7eb'
      }}
    >
      {/* Franja verde lateral */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: 'linear-gradient(180deg, #047857, #059669)',
          borderRadius: '16px 0 0 16px'
        }}
      />

      {/* Contenido de la tarjeta */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          width: '100%'
        }}
      >
        {/* Número del equipo */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '20px',
            color: '#059669',
            flexShrink: 0
          }}
        >
          {index + 1}
        </div>

        {/* Información del equipo */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1f2937',
                margin: 0
              }}
            >
              {reg.teamName || `Equipo ${index + 1}`}
            </h3>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #047857, #059669)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {reg.category || 'OPEN'} {reg.modality || 'M'}
            </span>
          </div>

          {/* Jugadores */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={16} color="#6b7280" />
              <span
                style={{
                  fontSize: '14px',
                  color: '#4b5563'
                }}
              >
                {reg.player1Name}
              </span>
            </div>
            {reg.player2Name && (
              <>
                <span style={{ color: '#d1d5db' }}>•</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Users size={16} color="#6b7280" />
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#4b5563'
                    }}
                  >
                    {reg.player2Name}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Estado y acciones */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          {/* Estado de pago */}
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background:
                reg.paymentStatus === 'completed'
                  ? '#dcfce7'
                  : reg.paymentStatus === 'pending'
                  ? '#fef3c7'
                  : '#fee2e2',
              fontSize: '13px',
              fontWeight: 600,
              color:
                reg.paymentStatus === 'completed'
                  ? '#15803d'
                  : reg.paymentStatus === 'pending'
                  ? '#a16207'
                  : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {reg.paymentStatus === 'completed' ? (
              <>
                <CheckCircle size={14} />
                Pagado
              </>
            ) : reg.paymentStatus === 'pending' ? (
              <>
                <Clock size={14} />
                Pendiente
              </>
            ) : (
              <>
                <XCircle size={14} />
                Cancelado
              </>
            )}
          </div>

          {/* Acciones */}
          <div
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >
            <button
              title="Ver detalles"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#059669',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0fdf4'
                e.currentTarget.style.borderColor = '#059669'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <Eye size={18} />
            </button>
            <button
              title="Editar equipo"
              onClick={() => onEdit(reg)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#0ea5e9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f9ff'
                e.currentTarget.style.borderColor = '#0ea5e9'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <Edit size={18} />
            </button>
            <button
              title="Eliminar equipo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2'
                e.currentTarget.style.borderColor = '#ef4444'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onClick={() => {
                if (onDelete && confirm('¿Estás seguro de eliminar este equipo?')) {
                  onDelete(reg.id)
                }
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
