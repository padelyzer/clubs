'use client'

import React, { useState, useEffect } from 'react'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { AppleModal } from '@/components/design-system/AppleModal'
import { AppleButton } from '@/components/design-system/AppleButton'
import { AppleInput } from '@/components/design-system/AppleInput'
import { SettingsCard } from '@/components/design-system/SettingsCard'
import { 
  Users, Plus, Search, Filter, Edit, Trash2, 
  Phone, Mail, Calendar, Activity, Star,
  TrendingUp, Clock, CreditCard, History,
  Download, Upload, X, Check, ChevronDown, Loader2,
  UserCircle, Shield, Award
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/design-system/localization'
import { useNotify } from '@/contexts/NotificationContext'

const playerLevels = ['Todos', 'Open', 'Primera Fuerza', 'Segunda Fuerza', 'Tercera Fuerza', 'Cuarta Fuerza', 'Quinta Fuerza', 'Sexta Fuerza']

type Player = {
  id: string
  name: string
  email: string | null
  phone: string
  level: string | null
  memberNumber: string | null
  memberSince: string
  totalBookings: number
  totalSpent: number
  lastBookingAt: string | null
  active: boolean
  createdAt: string
  gender: string | null
}

function PlayersPageContent() {
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('Todos')
  const [isCreating, setIsCreating] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [playerBookings, setPlayerBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  const ITEMS_PER_PAGE = 10
  const notify = useNotify()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: '',
    memberNumber: '',
    gender: ''
  })

  useEffect(() => {
    fetchPlayers()
  }, [currentPage])

  const fetchPlayers = async (search?: string, page?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const pageToUse = page || currentPage
      params.append('limit', ITEMS_PER_PAGE.toString())
      params.append('offset', ((pageToUse - 1) * ITEMS_PER_PAGE).toString())
      
      const response = await fetch(`/api/players?${params}`)
      const data = await response.json()
      
      if (data.success) {
        console.log('Players received from API:', data.players)
        // Log específico para ver el memberNumber
        data.players.forEach((player: any) => {
          console.log(`Player: ${player.name}, memberNumber: ${player.memberNumber}`)
        })
        setPlayers(data.players)
        if (data.pagination) {
          setTotalClients(data.pagination.total)
          setTotalPages(Math.ceil(data.pagination.total / ITEMS_PER_PAGE))
        }
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
    if (value.length > 2 || value.length === 0) {
      fetchPlayers(value, 1)
    }
  }

  const handleCreatePlayer = async () => {
    try {
      const response = await fetch('/api/players/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchPlayers(searchTerm, currentPage)
        setIsCreating(false)
        resetForm()
        
        notify.success({
          title: 'Cliente creado',
          message: `${formData.name} ha sido registrado exitosamente`,
          duration: 5000
        })
      } else {
        notify.error({
          title: 'Error al crear cliente',
          message: data.error || 'Error desconocido',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error creating player:', error)
    }
  }

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return
    
    try {
      // Clean up form data - remove empty strings and unnecessary fields
      const updatePayload = {
        id: editingPlayer.id,
        name: formData.name,
        phone: formData.phone,
        ...(formData.email && { email: formData.email }),
        ...(formData.level && { level: formData.level }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.memberNumber && { memberNumber: formData.memberNumber })
      }
      
      console.log('Updating player with payload:', updatePayload)
      
      const response = await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchPlayers(searchTerm, currentPage)
        setEditingPlayer(null)
        resetForm()
        
        notify.success({
          title: 'Cliente actualizado',
          message: `Los datos de ${formData.name} han sido actualizados`,
          duration: 5000
        })
      } else {
        notify.error({
          title: 'Error al actualizar',
          message: data.error || 'Error desconocido',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error updating player:', error)
    }
  }

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este jugador?')) return
    
    try {
      const response = await fetch(`/api/players?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchPlayers(searchTerm, currentPage)
      }
    } catch (error) {
      console.error('Error deleting player:', error)
    }
  }

  const fetchPlayerBookings = async (playerId: string) => {
    setLoadingBookings(true)
    try {
      const response = await fetch(`/api/players/${playerId}/bookings`)
      const data = await response.json()
      
      console.log('Bookings API Response:', data)
      
      if (data.success) {
        setPlayerBookings(data.bookings)
        console.log('Bookings set:', data.bookings)
        
        // Actualizar estadísticas del jugador con datos reales
        const totalBookings = data.pagination?.total || data.bookings.length
        const totalSpent = data.bookings.reduce((sum: number, booking: any) => {
          // Si es pago dividido, usar solo lo que pagó este jugador
          if (booking.splitPaymentEnabled && booking.playerPayment) {
            return sum + (booking.playerPayment.amount || 0)
          }
          // Si no es pago dividido, usar el precio total
          return sum + (booking.totalPrice || 0)
        }, 0)
        
        // Actualizar el jugador seleccionado con las estadísticas reales
        setSelectedPlayer(prev => prev ? {
          ...prev,
          totalBookings: totalBookings,
          totalSpent: totalSpent
        } : null)
      }
    } catch (error) {
      console.error('Error fetching player bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleSelectPlayer = async (player: Player) => {
    setSelectedPlayer(player)
    await fetchPlayerBookings(player.id)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      level: '',
      memberNumber: '',
      gender: ''
    })
  }

  // Filter players - now just returns all players since we removed level filter
  const filteredPlayers = players

  const getLevelColor = (level: string | null) => {
    switch(level) {
      case 'Open': return '#9333ea'
      case 'Primera Fuerza': return '#dc2626'
      case 'Segunda Fuerza': return '#ea580c'
      case 'Tercera Fuerza': return '#f59e0b'
      case 'Cuarta Fuerza': return '#84cc16'
      case 'Quinta Fuerza': return '#16a34a'
      case 'Sexta Fuerza': return '#06b6d4'
      default: return '#6b7280'
    }
  }


  return (
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#182A01',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}>
              Clientes
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#516640',
              fontWeight: 400,
              margin: 0
            }}>
              Gestiona los clientes de tu club
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {/* Clientes Totales */}
          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {players.length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Clientes totales
              </div>
            </div>
          </CardModern>

          {/* Nuevos este mes */}
          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {players.filter(p => {
                  const monthAgo = new Date()
                  monthAgo.setMonth(monthAgo.getMonth() - 1)
                  return new Date(p.createdAt) >= monthAgo
                }).length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Nuevos este mes
              </div>
            </div>
          </CardModern>

          {/* Con reservas */}
          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #4CAF50, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={20} color="white" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {players.filter(p => p.totalBookings > 0).length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Con reservas
              </div>
            </div>
          </CardModern>

          {/* Inactivos +30 días */}
          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #FFA726, #FF7043)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={20} color="white" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                {players.filter(p => {
                  // Solo clientes que SÍ tienen reservas pero están inactivos
                  if (p.totalBookings === 0) return false // Excluir los que nunca han reservado
                  if (!p.lastBookingAt) return true // Si tiene reservas pero no tiene fecha, está inactivo
                  
                  const monthAgo = new Date()
                  monthAgo.setDate(monthAgo.getDate() - 30) // Exactamente 30 días
                  return new Date(p.lastBookingAt) < monthAgo
                }).length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Inactivos +30 días
              </div>
            </div>
          </CardModern>
        </div>

        {/* Search and Filters */}
        <CardModern variant="glass" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <InputModern
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  icon={<Search size={18} />}
                />
              </div>
              <ButtonModern 
                variant="primary"
                icon={<Plus size={18} />}
                onClick={() => {
                  resetForm()
                  setIsCreating(true)
                }}
                style={{
                  background: 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                  border: 'none',
                  color: '#000000',
                  fontWeight: 600
                }}
              >
                Nuevo Cliente
              </ButtonModern>
            </div>
          </div>
        </CardModern>

        {/* Players Table */}
        <CardModern variant="glass">
          <CardModernHeader>
            <CardModernTitle>Lista de Clientes</CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 size={32} className="animate-spin" color="#66E7AA" />
              </div>
            ) : (
              <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(164, 223, 78, 0.1)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' }}>
                        CLIENTE
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' }}>
                        CONTACTO
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' }}>
                        NÚMERO CLIENTE
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' }}>
                        RESERVAS
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' }}>
                        TOTAL GASTADO
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' }}>
                        ESTADO
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#516640' }}>
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr 
                        key={player.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(164, 223, 78, 0.05)',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => handleSelectPlayer(player)}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600, color: '#182A01', fontSize: '14px' }}>
                            {player.name}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} color="#516640" />
                              <span style={{ fontSize: '13px', color: '#182A01' }}>{player.phone}</span>
                            </div>
                            {player.email && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Mail size={12} color="#516640" />
                                <span style={{ fontSize: '13px', color: '#182A01' }}>{player.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '13px', color: '#182A01' }}>
                            {player.memberNumber || 'Sin número'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                            {player.totalBookings}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                            {formatCurrency(player.totalSpent / 100)}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: player.active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: player.active ? '#16a34a' : '#ef4444'
                          }}>
                            {player.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setFormData({
                                  name: player.name,
                                  email: player.email || '',
                                  phone: player.phone,
                                  level: player.level || '',
                                  memberNumber: player.memberNumber || '',
                                  gender: player.gender || ''
                                })
                                setEditingPlayer(player)
                              }}
                              style={{
                                padding: '6px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#516640'
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePlayer(player.id)
                              }}
                              style={{
                                padding: '6px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalClients > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px',
                  padding: '16px',
                  borderTop: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <div style={{ fontSize: '14px', color: '#516640' }}>
                    {totalPages > 1 ? `Página ${currentPage} de ${totalPages} • ` : ''}{totalClients} clientes en total
                  </div>
                  {totalPages > 1 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const newPage = currentPage - 1
                        setCurrentPage(newPage)
                        fetchPlayers(searchTerm, newPage)
                      }}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: currentPage === 1 ? 'rgba(0, 0, 0, 0.05)' : 'white',
                        color: currentPage === 1 ? '#999' : '#182A01',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.background = 'white'
                        }
                      }}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => {
                        const newPage = currentPage + 1
                        setCurrentPage(newPage)
                        fetchPlayers(searchTerm, newPage)
                      }}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: currentPage === totalPages ? 'rgba(0, 0, 0, 0.05)' : 'white',
                        color: currentPage === totalPages ? '#999' : '#182A01',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.background = 'white'
                        }
                      }}
                    >
                      Siguiente
                    </button>
                  </div>
                  )}
                </div>
              )}
              </>
            )}
          </CardModernContent>
        </CardModern>

        {/* Create/Edit Modal - Apple Style */}
        <AppleModal
          isOpen={isCreating || !!editingPlayer}
          onClose={() => {
            setIsCreating(false)
            setEditingPlayer(null)
            resetForm()
          }}
          title={isCreating ? 'Nuevo Cliente' : 'Editar Cliente'}
          maxWidth="540px"
        >
          <div style={{ padding: '24px 0' }}>
            {/* Player Information Section */}
            <SettingsCard
              icon={<UserCircle size={20} />}
              title="Información Personal"
              description="Datos básicos del cliente"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <AppleInput
                  label="Nombre completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Juan Pérez García"
                  required
                  icon={<UserCircle size={18} />}
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <AppleInput
                    label="Teléfono"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="55 1234 5678"
                    required
                    icon={<Phone size={18} />}
                  />
                  
                  <AppleInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jugador@email.com"
                    icon={<Mail size={18} />}
                  />
                </div>
                
                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1d1d1f',
                    marginBottom: '8px'
                  }}>
                    Sexo
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      background: 'rgba(0, 0, 0, 0.02)',
                      fontSize: '15px',
                      color: '#1d1d1f',
                      fontWeight: 500,
                      appearance: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '1px solid #A4DF4E'
                      e.target.style.background = 'white'
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(0, 0, 0, 0.08)'
                      e.target.style.background = 'rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <option value="">Selecciona...</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      bottom: '14px',
                      pointerEvents: 'none',
                      color: '#86868b'
                    }}
                  />
                </div>
              </div>
            </SettingsCard>

            {/* Player Level Section - With separation */}
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '32px' }}>
            <SettingsCard
              icon={<Award size={20} />}
              title="Nivel de Juego"
              description="Categoría competitiva del cliente"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      background: 'rgba(0, 0, 0, 0.02)',
                      fontSize: '15px',
                      color: '#1d1d1f',
                      fontWeight: 500,
                      appearance: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '1px solid #A4DF4E'
                      e.target.style.background = 'white'
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(0, 0, 0, 0.08)'
                      e.target.style.background = 'rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <option value="">Selecciona un nivel</option>
                    <option value="Open">Open</option>
                    <option value="Primera Fuerza">Primera Fuerza</option>
                    <option value="Segunda Fuerza">Segunda Fuerza</option>
                    <option value="Tercera Fuerza">Tercera Fuerza</option>
                    <option value="Cuarta Fuerza">Cuarta Fuerza</option>
                    <option value="Quinta Fuerza">Quinta Fuerza</option>
                    <option value="Sexta Fuerza">Sexta Fuerza</option>
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#86868b'
                    }}
                  />
                </div>
                
                {formData.level && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${getLevelColor(formData.level)}20, ${getLevelColor(formData.level)}10)`,
                    border: `1px solid ${getLevelColor(formData.level)}30`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getLevelColor(formData.level)
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: getLevelColor(formData.level)
                    }}>
                      Nivel seleccionado: {formData.level}
                    </span>
                  </div>
                )}
              </div>
            </SettingsCard>
            </div>

            {/* Client Number Section */}
            {!isCreating && (
              <SettingsCard
                icon={<Shield size={20} />}
                title="Identificación"
                description="Número único del cliente"
                style={{ marginTop: '20px' }}
              >
                <AppleInput
                  label="Número de cliente"
                  value={formData.memberNumber}
                  onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                  placeholder="CL001"
                  disabled={!editingPlayer}
                  icon={<Shield size={18} />}
                />
              </SettingsCard>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '32px',
            padding: '0 24px'
          }}>
              <AppleButton
                variant="secondary"
                onClick={() => {
                  setIsCreating(false)
                  setEditingPlayer(null)
                  resetForm()
                }}
                fullWidth
              >
                Cancelar
              </AppleButton>
              <AppleButton
                variant="primary"
                onClick={isCreating ? handleCreatePlayer : handleUpdatePlayer}
                fullWidth
                style={{
                  background: 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                  color: '#000000',
                  fontWeight: 600
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000' }}>
                    <Loader2 size={16} className="animate-spin" />
                    {isCreating ? 'Creando...' : 'Guardando...'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000' }}>
                    <Check size={16} />
                    {isCreating ? 'Crear Cliente' : 'Guardar Cambios'}
                  </span>
                )}
              </AppleButton>
            </div>
        </AppleModal>

        {/* Player Details Modal - Apple Style */}
        <AppleModal
          isOpen={!!selectedPlayer}
          onClose={() => {
            setSelectedPlayer(null)
            setPlayerBookings([])
          }}
          title="Detalles del Cliente"
          maxWidth="640px"
        >
          {selectedPlayer && (
            <div style={{ padding: '24px 0' }}>
              {/* Player Header Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 231, 170, 0.1), rgba(164, 223, 78, 0.1))',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid rgba(164, 223, 78, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    {selectedPlayer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#182A01', marginBottom: '4px' }}>
                      {selectedPlayer.name}
                    </h3>
                    {selectedPlayer.level && (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: getLevelColor(selectedPlayer.level),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {selectedPlayer.level}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Phone size={18} color="#516640" />
                    <div>
                      <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '2px' }}>Teléfono</p>
                      <p style={{ fontSize: '14px', color: '#1d1d1f', fontWeight: 500 }}>{selectedPlayer.phone}</p>
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Mail size={18} color="#516640" />
                    <div>
                      <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '2px' }}>Email</p>
                      <p style={{ fontSize: '14px', color: '#1d1d1f', fontWeight: 500 }}>{selectedPlayer.email || 'No registrado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(102, 231, 170, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 231, 170, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Calendar size={16} color="#66E7AA" />
                    <span style={{ fontSize: '12px', color: '#86868b' }}>Reservas Totales</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 600, color: '#182A01' }}>{selectedPlayer.totalBookings}</p>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: 'rgba(164, 223, 78, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(164, 223, 78, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CreditCard size={16} color="#A4DF4E" />
                    <span style={{ fontSize: '12px', color: '#86868b' }}>Total Gastado</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 600, color: '#182A01' }}>{formatCurrency(selectedPlayer.totalSpent / 100)}</p>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: 'rgba(81, 102, 64, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(81, 102, 64, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Shield size={16} color="#516640" />
                    <span style={{ fontSize: '12px', color: '#86868b' }}>Número Cliente</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 600, color: '#182A01' }}>{selectedPlayer.memberNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Booking History Section */}
              <SettingsCard
                icon={<History size={20} />}
                title="Historial de Reservas"
                description="Últimas 5 reservas del cliente"
              >
                  {loadingBookings ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                      <Loader2 size={24} className="animate-spin" color="#66E7AA" />
                    </div>
                  ) : playerBookings.length === 0 ? (
                    <p style={{ color: '#516640', textAlign: 'center' }}>
                      No hay reservas registradas
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {playerBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} style={{
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#182A01' }}>
                              {booking.court} • {booking.startTime} - {booking.endTime}
                            </div>
                            <div style={{ fontSize: '12px', color: '#516640' }}>
                              {new Date(booking.date).toLocaleDateString('es-MX')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                              {formatCurrency(booking.totalPrice / 100)}
                            </div>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: booking.status === 'COMPLETED' ? 'rgba(22, 163, 74, 0.1)' : 
                                        booking.status === 'CONFIRMED' ? 'rgba(59, 130, 246, 0.1)' :
                                        booking.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' :
                                        'rgba(107, 114, 128, 0.1)',
                              color: booking.status === 'COMPLETED' ? '#16a34a' : 
                                    booking.status === 'CONFIRMED' ? '#3b82f6' :
                                    booking.status === 'CANCELLED' ? '#ef4444' :
                                    '#6b7280'
                            }}>
                              {booking.status === 'COMPLETED' ? 'Completada' :
                               booking.status === 'CONFIRMED' ? 'Confirmada' :
                               booking.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </SettingsCard>
            </div>
          )}
        </AppleModal>
      </div>
  )
}

export default function PlayersPage() {
  return <PlayersPageContent />
}