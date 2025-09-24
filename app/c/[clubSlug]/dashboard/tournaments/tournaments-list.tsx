'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Trophy, Plus, Search, Filter, Edit, Calendar,
  Users, Clock, DollarSign, Play, Settings, Eye
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'

interface Tournament {
  id: string
  name: string
  description: string
  type: string
  startDate: string
  endDate: string
  registrationEnd: string
  registrationFee: number
  maxPlayers: number
  status: string
  currency: string
  _count: {
    registrations: number
  }
}

export function TournamentsList() {
  const router = useRouter()
  const params = useParams()
  const clubSlug = params.clubSlug as string
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments')
      const data = await response.json()
      
      if (data.success) {
        setTournaments(data.tournaments)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar torneos')
    } finally {
      setLoading(false)
    }
  }

  const filteredTournaments = (tournaments || []).filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#6B7280'
      case 'REGISTRATION_OPEN': return '#10B981'
      case 'REGISTRATION_CLOSED': return '#F59E0B'
      case 'IN_PROGRESS': return '#3B82F6'
      case 'COMPLETED': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador'
      case 'REGISTRATION_OPEN': return 'Inscripciones Abiertas'
      case 'REGISTRATION_CLOSED': return 'Inscripciones Cerradas'
      case 'IN_PROGRESS': return 'En Progreso'
      case 'COMPLETED': return 'Completado'
      default: return status
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#6B7280'
      }}>
        Cargando torneos...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#EF4444'
      }}>
        {error}
      </div>
    )
  }

  return (
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
          Torneos
        </h1>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#6B7280',
            margin: 0
          }}>
            Gestiona y administra todos los torneos del club
          </p>
          
          <button
            onClick={() => router.push(`/c/${clubSlug}/dashboard/tournaments/create`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
              color: '#182A01',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(102, 231, 170, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 231, 170, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 231, 170, 0.15)'
            }}
          >
            <Plus size={16} />
            Nuevo Torneo
          </button>
        </div>
      </div>

      {/* Filters */}
      <CardModern style={{ marginBottom: '32px' }}>
        <CardModernContent>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto auto',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280'
                }}
              />
              <InputModern
                type="text"
                placeholder="Buscar torneos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="REGISTRATION_OPEN">Inscripciones Abiertas</option>
              <option value="REGISTRATION_CLOSED">Inscripciones Cerradas</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completado</option>
            </select>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#6B7280',
              fontSize: '14px'
            }}>
              <Filter size={16} />
              {filteredTournaments.length} torneo{filteredTournaments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardModernContent>
      </CardModern>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <CardModern>
          <CardModernContent>
            <div style={{ 
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6B7280'
            }}>
              <Trophy size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {searchTerm || statusFilter !== 'all' ? 'No hay torneos que coincidan' : 'No hay torneos creados'}
              </h3>
              <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer torneo'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => router.push(`/c/${clubSlug}/dashboard/tournaments/create`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(102, 231, 170, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 231, 170, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 231, 170, 0.15)'
                  }}
                >
                  <Plus size={16} />
                  Crear Primer Torneo
                </button>
              )}
            </div>
          </CardModernContent>
        </CardModern>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {filteredTournaments.map((tournament) => (
            <CardModern key={tournament.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardModernHeader>
                <CardModernTitle>{tournament.name}</CardModernTitle>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: getStatusColor(tournament.status) + '20',
                    color: getStatusColor(tournament.status)
                  }}>
                    {getStatusLabel(tournament.status)}
                  </span>
                </div>
              </CardModernHeader>
              
              <CardModernContent style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%' 
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6B7280',
                    marginBottom: '16px',
                    lineHeight: 1.5,
                    minHeight: '42px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {tournament.description || 'Sin descripción'}
                  </p>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {tournament._count.registrations}/{tournament.maxPlayers}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {formatCurrency(tournament.registrationFee / 100, tournament.currency)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {tournament.status === 'REGISTRATION_OPEN' ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: 'auto'
                }}>
                  <button
                    onClick={() => router.push(`/c/${clubSlug}/dashboard/tournaments/${tournament.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      height: '36px',
                      minWidth: '70px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E5E7EB'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F3F4F6'
                    }}
                  >
                    <Eye size={14} />
                    Ver
                  </button>
                  
                  {(tournament.status === 'DRAFT' || tournament.status === 'REGISTRATION_OPEN') && (
                    <button
                      onClick={() => router.push(`/c/${clubSlug}/dashboard/tournaments/${tournament.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        height: '36px',
                        minWidth: '110px',
                        background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#182A01',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(102, 231, 170, 0.2)',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 231, 170, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(102, 231, 170, 0.2)'
                      }}
                    >
                      <Edit size={14} />
                      Administrar
                    </button>
                  )}
                </div>
              </CardModernContent>
            </CardModern>
          ))}
        </div>
      )}
    </div>
  )
}