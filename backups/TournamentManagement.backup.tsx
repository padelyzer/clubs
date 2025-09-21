'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { PaymentModal } from '@/components/modals/PaymentModal'
import BracketVisualization from './BracketVisualization'
import { PlayerRankings } from './PlayerRankings'
import { QRCheckIn } from './QRCheckIn'
import { 
  ArrowLeft, Edit, Trophy, Calendar, Users, DollarSign, CreditCard,
  Play, Settings, UserCheck, Clock, Award, Grid, QrCode, 
  CheckCircle, AlertCircle, Eye, Plus, Search, Filter, Download,
  Target, Shuffle, BarChart3, FileSpreadsheet, MapPin, Timer,
  Mail, MessageCircle, Trash2, RefreshCw, ChevronRight, X,
  TrendingUp, TrendingDown, PieChart, Wallet, Receipt, AlertTriangle,
  Check, XCircle, ExternalLink, Copy, Share2, Info, Edit2, Lock
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'

interface TournamentManagementCompleteProps {
  tournamentId: string
}

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
  category: string
  prizePool: number
  _count: {
    registrations: number
  }
}

interface Registration {
  id: string
  player1Name: string
  player2Name: string
  player1Phone: string
  player2Phone: string
  player1Email?: string
  player2Email?: string
  teamName?: string
  paymentStatus: string
  paymentReference?: string
  confirmed: boolean
  checkedIn: boolean
  paidAmount: number
  createdAt: string
  partnerId?: string
}

interface TournamentMatch {
  id: string
  round: string
  matchNumber: number
  player1Name?: string
  player2Name?: string
  courtId?: string
  scheduledAt?: string
  startTime?: string
  endTime?: string
  status: string
  score?: string
  winner?: string
  qrCode?: string
  court?: {
    id: string
    name: string
  }
  player1Score?: any[]
  player2Score?: any[]
}

interface Court {
  id: string
  name: string
  type: string
  active: boolean
}

interface Payment {
  id: string
  registrationId: string
  amount: number
  method: string
  status: string
  reference?: string
  createdAt: string
  playerName: string
}

export function TournamentManagementComplete({ tournamentId }: TournamentManagementCompleteProps) {
  const router = useRouter()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [showMatchResultModal, setShowMatchResultModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  
  // Match Result State
  const [matchResult, setMatchResult] = useState({
    player1Score: [{ set: 1, games: 0 }],
    player2Score: [{ set: 1, games: 0 }],
    winner: '',
    duration: 60
  })
  
  // Schedule State
  const [scheduleData, setScheduleData] = useState({
    matchId: '',
    courtId: '',
    date: '',
    startTime: '',
    duration: 90
  })
  
  // Financial state
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    registrationIncome: 0,
    pendingPayments: 0,
    completedPayments: 0,
    cashPayments: 0,
    cardPayments: 0,
    transferPayments: 0,
    expenses: [] as any[]
  })
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [matchFilter, setMatchFilter] = useState('all')
  const [checkInFilter, setCheckInFilter] = useState('all')
  const [matchViewMode, setMatchViewMode] = useState<'bracket' | 'list'>('bracket')

  useEffect(() => {
    if (tournamentId) {
      loadTournamentData()
      loadCourts()
    }
  }, [tournamentId])

  const loadTournamentData = async () => {
    try {
      setLoading(true)
      
      // Load tournament details
      const tournamentResponse = await fetch(`/api/tournaments/${tournamentId}`)
      const tournamentData = await tournamentResponse.json()
      
      if (tournamentData.success) {
        setTournament(tournamentData.tournament)
      }

      // Load registrations
      const registrationsResponse = await fetch(`/api/tournaments/${tournamentId}/registrations`)
      const registrationsData = await registrationsResponse.json()
      
      if (registrationsData.success) {
        setRegistrations(registrationsData.registrations || [])
        calculateFinancials(registrationsData.registrations || [])
        generatePaymentsList(registrationsData.registrations || [])
      }

      // Load matches
      const matchesResponse = await fetch(`/api/tournaments/${tournamentId}/matches`)
      const matchesData = await matchesResponse.json()
      
      if (matchesData.success) {
        setMatches(matchesData.matches || [])
      }
      
    } catch (err) {
      setError('Error al cargar datos del torneo')
      console.error('Error loading tournament data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCourts = async () => {
    try {
      const response = await fetch('/api/settings/courts')
      const data = await response.json()
      if (data.success) {
        setCourts(data.courts.filter((court: Court) => court.active))
      }
    } catch (err) {
      console.error('Error loading courts:', err)
    }
  }

  const calculateFinancials = (registrations: Registration[]) => {
    const completed = registrations.filter(r => r.paymentStatus === 'completed')
    const pending = registrations.filter(r => r.paymentStatus === 'pending')
    
    // Calculate by payment method (mock data for now)
    const cash = completed.filter(r => r.paymentReference?.includes('CASH')).length
    const card = completed.filter(r => r.paymentReference?.includes('CARD')).length
    const transfer = completed.filter(r => r.paymentReference?.includes('TRANSFER')).length
    
    setFinancialData({
      totalIncome: completed.reduce((sum, r) => sum + r.paidAmount, 0),
      totalExpenses: 0,
      registrationIncome: completed.reduce((sum, r) => sum + r.paidAmount, 0),
      pendingPayments: pending.length * (tournament?.registrationFee || 0),
      completedPayments: completed.length,
      cashPayments: cash * (tournament?.registrationFee || 0),
      cardPayments: card * (tournament?.registrationFee || 0),
      transferPayments: transfer * (tournament?.registrationFee || 0),
      expenses: []
    })
  }

  const generatePaymentsList = (registrations: Registration[]) => {
    console.log('Generating payments from registrations:', registrations)
    
    const paymentsList: Payment[] = registrations
      .filter(reg => {
        // Mostrar todos los pagos que no sean pendientes
        const isPaid = reg.paymentStatus === 'completed' || reg.paymentStatus === 'processing'
        console.log(`Registration ${reg.id}: status=${reg.paymentStatus}, isPaid=${isPaid}`)
        return isPaid
      })
      .map(reg => ({
        id: `payment_${reg.id}`,
        registrationId: reg.id,
        amount: reg.paidAmount || tournament?.registrationFee || 0,
        method: reg.paymentMethod === 'transfer' ? 'transfer' :
                reg.paymentMethod === 'card' ? 'card' : 
                reg.paymentMethod === 'cash' ? 'cash' : 
                reg.paymentReference?.includes('TRANSFER') ? 'transfer' :
                reg.paymentReference?.includes('CARD') ? 'card' : 
                reg.paymentReference?.includes('CASH') ? 'cash' : 'cash', // Default to cash instead of pending
        status: reg.paymentStatus || 'pending',
        reference: reg.paymentReference || '',
        createdAt: reg.paymentDate || reg.createdAt,
        playerName: `${reg.player1Name} & ${reg.player2Name}`
      }))
    
    console.log('Generated payments list:', paymentsList)
    setPayments(paymentsList)
  }

  const generateBracket = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/generate-bracket`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        alert('Bracket generado exitosamente')
      } else {
        alert('Error al generar bracket: ' + data.error)
      }
    } catch (err) {
      alert('Error al generar bracket')
    }
  }

  const handleCheckIn = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId })
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        alert('Check-in realizado exitosamente')
      } else {
        alert('Error al realizar check-in: ' + data.error)
      }
    } catch (err) {
      alert('Error al realizar check-in')
    }
  }

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta inscripción?')) return
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/registrations/${registrationId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        alert('Inscripción eliminada')
      } else {
        alert('Error al eliminar: ' + data.error)
      }
    } catch (err) {
      alert('Error al eliminar inscripción')
    }
  }

  const handleMatchResult = async () => {
    if (!selectedMatch) return
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${selectedMatch.id}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchResult)
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        setShowMatchResultModal(false)
        alert('Resultado guardado exitosamente')
      } else {
        alert('Error al guardar resultado: ' + data.error)
      }
    } catch (err) {
      alert('Error al guardar resultado')
    }
  }

  const handleScheduleMatch = async () => {
    if (!selectedMatch) return
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${selectedMatch.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: scheduleData.courtId,
          scheduledAt: `${scheduleData.date}T${scheduleData.startTime}:00`,
          duration: scheduleData.duration
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        setShowScheduleModal(false)
        alert('Partido programado exitosamente')
      } else {
        alert('Error al programar partido: ' + data.error)
      }
    } catch (err) {
      alert('Error al programar partido')
    }
  }

  const confirmPayment = async (registrationId: string, method: string, reference?: string) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/registrations/${registrationId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'completed',
          paidAmount: tournament?.registrationFee || 0,
          paymentMethod: method,
          paymentReference: reference,
          paymentDate: new Date().toISOString()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        setShowPaymentModal(false)
        setSelectedRegistration(null)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw error
    }
  }

  const generatePaymentLink = async (registration: Registration) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1Name: registration.player1Name,
          player1Email: registration.player1Email || '',
          player1Phone: registration.player1Phone,
          player2Name: registration.player2Name || 'Compañero',
          player2Email: registration.player2Email || '',
          player2Phone: registration.player2Phone || registration.player1Phone,
          teamName: registration.teamName || '',
          expiresInMinutes: 1440
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data.data.paymentLink
      } else {
        throw new Error(data.error || 'Error generating payment link')
      }
    } catch (error) {
      console.error('Error generating payment link:', error)
      return null
    }
  }

  const exportRegistrations = () => {
    // Create CSV content
    let csv = 'Equipo,Jugador 1,Email 1,Teléfono 1,Jugador 2,Email 2,Teléfono 2,Estado Pago,Check-in\n'
    registrations.forEach(r => {
      csv += `"${r.teamName || ''}","${r.player1Name}","${r.player1Email || ''}","${r.player1Phone}",`
      csv += `"${r.player2Name}","${r.player2Email || ''}","${r.player2Phone || ''}",`
      csv += `"${r.paymentStatus}","${r.checkedIn ? 'Sí' : 'No'}"\n`
    })
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inscripciones_${tournament?.name}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const sendWhatsAppMessage = async (phone: string, message: string) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const sendPaymentReminder = async (registration: any) => {
    const message = `Hola ${registration.player1Name}, te recordamos que tienes un pago pendiente de ${formatCurrency(tournament?.registrationFee || 0, tournament?.currency || 'USD')} para el torneo ${tournament?.name}. Por favor realiza el pago lo antes posible para confirmar tu participación.`
    await sendWhatsAppMessage(registration.player1Phone, message)
  }

  const handleRefundPayment = async (registrationId: string) => {
    if (!confirm('¿Estás seguro de que deseas reembolsar este pago?')) return
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId })
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        alert('Reembolso procesado exitosamente')
      } else {
        alert('Error al procesar reembolso: ' + data.error)
      }
    } catch (err) {
      alert('Error al procesar reembolso')
    }
  }

  const exportPaymentsToCSV = () => {
    const csvContent = [
      ['Jugador', 'Monto', 'Estado', 'Método', 'Referencia', 'Fecha'].join(','),
      ...filteredPayments.map(r => [
        r.player1Name,
        r.paidAmount || tournament?.registrationFee || 0,
        r.paymentStatus,
        r.paymentMethod || '-',
        r.paymentReference || '-',
        r.paymentDate || '-'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pagos_${tournament?.name?.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleReconcilePayments = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/reconcile-payments`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        alert(`Pagos conciliados: ${data.reconciled} actualizados`)
      } else {
        alert('Error al conciliar pagos: ' + data.error)
      }
    } catch (err) {
      alert('Error al conciliar pagos')
    }
  }

  const autoAssignCourts = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/auto-assign-courts`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        await loadTournamentData()
        alert(`${data.assigned} partidos asignados a canchas`)
      } else {
        alert('Error al asignar canchas: ' + data.error)
      }
    } catch (err) {
      alert('Error al asignar canchas')
    }
  }

  const blockCourtsForTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/block-courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: tournament?.startDate,
          endDate: tournament?.endDate,
          courtIds: courts.map(c => c.id)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Canchas bloqueadas para el torneo')
      } else {
        alert('Error al bloquear canchas: ' + data.error)
      }
    } catch (err) {
      alert('Error al bloquear canchas')
    }
  }

  const exportSchedule = () => {
    const csvContent = [
      ['Fecha', 'Hora', 'Cancha', 'Ronda', 'Partido', 'Jugador 1', 'Jugador 2', 'Estado'].join(','),
      ...matches.filter(m => m.scheduledAt).map(m => [
        new Date(m.scheduledAt).toLocaleDateString(),
        new Date(m.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
        m.court?.name || '-',
        m.round,
        m.matchNumber,
        m.player1Name || 'Por determinar',
        m.player2Name || 'Por determinar',
        m.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `calendario_${tournament?.name?.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportFinancialReport = () => {
    const reportContent = [
      `Informe Financiero - ${tournament?.name}`,
      `Fecha: ${new Date().toLocaleDateString()}`,
      '',
      'RESUMEN',
      `Ingresos Totales: ${formatCurrency(financialData.totalIncome / 100, tournament?.currency || 'USD')}`,
      `Gastos Totales: ${formatCurrency(financialData.totalExpenses / 100, tournament?.currency || 'USD')}`,
      `Balance Neto: ${formatCurrency((financialData.totalIncome - financialData.totalExpenses) / 100, tournament?.currency || 'USD')}`,
      '',
      'DESGLOSE DE INGRESOS',
      `Inscripciones: ${formatCurrency(financialData.registrationIncome / 100, tournament?.currency || 'USD')}`,
      `Patrocinios: ${formatCurrency(0, tournament?.currency || 'USD')}`,
      '',
      'DESGLOSE DE GASTOS',
      `Premios: ${formatCurrency((tournament?.prizePool || 0) / 100, tournament?.currency || 'USD')}`,
      `Canchas: ${formatCurrency(0, tournament?.currency || 'USD')}`,
      `Arbitraje: ${formatCurrency(0, tournament?.currency || 'USD')}`,
      '',
      'MÉTODOS DE PAGO',
      `Efectivo: ${formatCurrency(financialData.cashPayments / 100, tournament?.currency || 'USD')}`,
      `Tarjeta: ${formatCurrency(financialData.cardPayments / 100, tournament?.currency || 'USD')}`,
      `Transferencia: ${formatCurrency(financialData.transferPayments / 100, tournament?.currency || 'USD')}`,
      '',
      `Pagos Pendientes: ${formatCurrency(financialData.pendingPayments / 100, tournament?.currency || 'USD')}`
    ].join('\n')

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `informe_financiero_${tournament?.name?.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
  }

  const generateInvoices = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/generate-invoices`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`${data.count} facturas generadas exitosamente`)
      } else {
        alert('Error al generar facturas: ' + data.error)
      }
    } catch (err) {
      alert('Error al generar facturas')
    }
  }

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

  const getTournamentTypeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE_ELIMINATION': return 'Eliminación Simple'
      case 'DOUBLE_ELIMINATION': return 'Doble Eliminación'
      case 'ROUND_ROBIN': return 'Todos contra Todos'
      case 'SWISS': return 'Sistema Suizo'
      case 'GROUP_STAGE': return 'Fase de Grupos'
      default: return type
    }
  }

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = 
      registration.player1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registration.player2Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registration.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPayment = paymentFilter === 'all' || registration.paymentStatus === paymentFilter
    const matchesCheckIn = checkInFilter === 'all' || 
      (checkInFilter === 'checked' && registration.checkedIn) ||
      (checkInFilter === 'unchecked' && !registration.checkedIn)
    
    return matchesSearch && matchesPayment && matchesCheckIn
  })

  const filteredMatches = matches.filter(match => {
    if (matchFilter === 'all') return true
    if (matchFilter === 'scheduled') return match.status === 'SCHEDULED'
    if (matchFilter === 'in_progress') return match.status === 'IN_PROGRESS'
    if (matchFilter === 'completed') return match.status === 'COMPLETED'
    return true
  })

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.playerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = paymentFilter === 'all' || payment.status === paymentFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#6B7280'
        }}>
          Cargando torneo...
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#EF4444'
        }}>
          {error || 'Torneo no encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#F9FAFB'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '24px 32px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => router.push('/dashboard/tournaments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0',
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              color: '#6B7280',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              {tournament.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                background: getStatusColor(tournament.status) + '15',
                color: getStatusColor(tournament.status),
                border: `1px solid ${getStatusColor(tournament.status)}30`
              }}>
                {getStatusLabel(tournament.status)}
              </span>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>
                {registrations.length} / {tournament.maxPlayers} equipos
              </span>
              {tournament.category && (
                <span style={{ 
                  fontSize: '14px', 
                  color: '#6B7280',
                  padding: '2px 8px',
                  background: '#F3F4F6',
                  borderRadius: '4px'
                }}>
                  {tournament.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {tournament.status === 'DRAFT' && (
            <button
              onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/edit`)}
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
            >
              <Edit size={16} />
              Editar Torneo
            </button>
          )}
          
          {tournament.status === 'REGISTRATION_CLOSED' && registrations.length >= 2 && matches.length === 0 && (
            <button
              onClick={generateBracket}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
              }}
            >
              <Target size={16} />
              Generar Bracket
            </button>
          )}
        </div>
      </div>

      </div>

      <div style={{ 
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        paddingLeft: '32px',
        paddingRight: '32px'
      }}>
        <div style={{ 
          display: 'flex',
          gap: '32px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Vista General', icon: Trophy },
            { id: 'registrations', label: 'Inscripciones', icon: UserCheck },
            { id: 'payments', label: 'Pagos', icon: CreditCard },
            { id: 'matches', label: 'Partidos', icon: Grid },
            { id: 'schedule', label: 'Programación', icon: Calendar },
            { id: 'finances', label: 'Finanzas', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 4px',
                marginBottom: '-1px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid #3B82F6' : '3px solid transparent',
                color: activeTab === tab.id ? '#1E40AF' : '#6B7280',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: 'max-content'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '32px' }}>
        {activeTab === 'overview' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '3fr 2fr',
          gap: '24px'
        }}>
          {/* Left Column - Tournament Info & Dates */}
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Tournament Details Card - More Compact */}
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <Trophy size={20} />
                  Información del Torneo
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {/* Description inline with other info */}
                  <div style={{ 
                    padding: '12px',
                    background: '#F9FAFB',
                    borderRadius: '8px'
                  }}>
                    <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                      {tournament.description || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Key metrics in compact grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px'
                  }}>
                    <div style={{
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Tipo
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                        {getTournamentTypeLabel(tournament.type)}
                      </div>
                    </div>

                    <div style={{
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Inscripción
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                        {formatCurrency(tournament.registrationFee / 100, tournament.currency)}
                      </div>
                    </div>

                    <div style={{
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Premios
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626' }}>
                        {formatCurrency(tournament.prizePool / 100, tournament.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Metrics */}
                  <div style={{
                    padding: '16px',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Inscripciones Confirmadas
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#10B981' }}>
                        {registrations.filter(r => r.confirmed).length} / {tournament.maxPlayers}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '4px',
                        background: '#E5E7EB',
                        borderRadius: '2px',
                        marginTop: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(registrations.filter(r => r.confirmed).length / tournament.maxPlayers) * 100}%`,
                          height: '100%',
                          background: '#10B981'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Partidos Completados
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#3B82F6' }}>
                        {matches.filter(m => m.status === 'COMPLETED').length} / {matches.length}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '4px',
                        background: '#E5E7EB',
                        borderRadius: '2px',
                        marginTop: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${matches.length > 0 ? (matches.filter(m => m.status === 'COMPLETED').length / matches.length) * 100 : 0}%`,
                          height: '100%',
                          background: '#3B82F6'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Check-ins Realizados
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#8B5CF6' }}>
                        {registrations.filter(r => r.checkedIn).length} / {registrations.length}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '4px',
                        background: '#E5E7EB',
                        borderRadius: '2px',
                        marginTop: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${registrations.length > 0 ? (registrations.filter(r => r.checkedIn).length / registrations.length) * 100 : 0}%`,
                          height: '100%',
                          background: '#8B5CF6'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            {/* Dates Card - More Compact */}
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <Calendar size={20} />
                  Calendario
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #10B981',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#059669', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Inicio
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                      {new Date(tournament.startDate).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div style={{ fontSize: '11px', color: '#059669' }}>
                      {new Date(tournament.startDate).toLocaleDateString('es-MX', {
                        weekday: 'short'
                      })}
                    </div>
                  </div>

                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #EF4444',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#DC2626', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Fin
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
                      {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short'
                      }) : 'TBD'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#DC2626' }}>
                      {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('es-MX', {
                        weekday: 'short'
                      }) : ''}
                    </div>
                  </div>

                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #F59E0B',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#D97706', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cierre Inscr.
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
                      {new Date(tournament.registrationEnd).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div style={{ fontSize: '11px', color: '#D97706' }}>
                      {new Date(tournament.registrationEnd).toLocaleDateString('es-MX', {
                        weekday: 'short'
                      })}
                    </div>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
          </div>

          {/* Stats Sidebar */}
          <div style={{ display: 'grid', gap: '24px' }}>
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <Users size={20} />
                  Participación
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: 700,
                    color: '#10B981',
                    lineHeight: 1
                  }}>
                    {tournament._count.registrations}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    marginTop: '8px'
                  }}>
                    de {tournament.maxPlayers} equipos
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#E5E7EB',
                    borderRadius: '4px',
                    marginTop: '16px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min((tournament._count.registrations / tournament.maxPlayers) * 100, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <DollarSign size={20} />
                  Resumen Financiero
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Ingresos Confirmados:</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#10B981' }}>
                      {formatCurrency(financialData.registrationIncome / 100, tournament.currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Pagos Pendientes:</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#F59E0B' }}>
                      {formatCurrency(financialData.pendingPayments / 100, tournament.currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Pagos Completados:</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>
                      {financialData.completedPayments}
                    </span>
                  </div>
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E5E7EB'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                      Balance Total
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>
                      {formatCurrency((financialData.totalIncome - financialData.totalExpenses) / 100, tournament.currency)}
                    </div>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            {/* Quick Actions Card */}
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <Settings size={20} />
                  Acciones Rápidas
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {tournament.status === 'REGISTRATION_OPEN' && (
                    <button
                      onClick={() => setActiveTab('registrations')}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Plus size={16} />
                      Nueva Inscripción
                    </button>
                  )}
                  
                  {tournament.status === 'REGISTRATION_CLOSED' && matches.length === 0 && (
                    <button
                      onClick={generateBracket}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Target size={16} />
                      Generar Bracket
                    </button>
                  )}

                  <button
                    onClick={() => exportRegistrationsToCSV()}
                    style={{
                      padding: '12px',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={16} />
                    Exportar Inscripciones
                  </button>

                  <button
                    onClick={() => setActiveTab('qr-checkin')}
                    style={{
                      padding: '12px',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <QrCode size={16} />
                    Gestionar Check-in
                  </button>
                </div>
              </CardModernContent>
            </CardModern>
          </div>
        </div>
      )}

      {activeTab === 'registrations' && (
        <div>
          {/* Actions Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            {/* Search and Filters */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              flex: 1
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
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
                <input
                  type="text"
                  placeholder="Buscar equipos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '44px',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  minWidth: '150px'
                }}
              >
                <option value="all">Todos los pagos</option>
                <option value="completed">Pagados</option>
                <option value="pending">Pendientes</option>
                <option value="failed">Fallidos</option>
              </select>

              <select
                value={checkInFilter}
                onChange={(e) => setCheckInFilter(e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  minWidth: '150px'
                }}
              >
                <option value="all">Todos check-in</option>
                <option value="checked">Registrados</option>
                <option value="unchecked">Sin registrar</option>
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={exportRegistrations}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                Exportar
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#6B7280',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <Filter size={16} />
            {filteredRegistrations.length} inscripciones
          </div>

          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <UserCheck size={20} />
                Inscripciones ({filteredRegistrations.length})
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              {filteredRegistrations.length === 0 ? (
                <div style={{ 
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6B7280'
                }}>
                  <UserCheck size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                    {searchQuery || paymentFilter !== 'all' ? 'No hay inscripciones que coincidan' : 'No hay inscripciones aún'}
                  </h3>
                  <p style={{ fontSize: '14px' }}>
                    {searchQuery || paymentFilter !== 'all' 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Los equipos inscritos aparecerán aquí'
                    }
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {filteredRegistrations.map((registration) => (
                    <div
                      key={registration.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        background: 'white'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontWeight: 600, color: '#182A01', fontSize: '16px' }}>
                            {registration.player1Name}
                            {registration.player2Name && ` & ${registration.player2Name}`}
                          </div>
                          {registration.teamName && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: '#F3F4F6',
                              color: '#6B7280'
                            }}>
                              {registration.teamName}
                            </span>
                          )}
                          {registration.checkedIn && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: '#8B5CF6',
                              color: 'white'
                            }}>
                              ✓ Check-in
                            </span>
                          )}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          gap: '20px',
                          fontSize: '14px', 
                          color: '#6B7280',
                          marginBottom: '8px'
                        }}>
                          <span>📱 {registration.player1Phone}</span>
                          {registration.player1Email && <span>✉️ {registration.player1Email}</span>}
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                          Inscrito el {new Date(registration.createdAt).toLocaleDateString()}
                          {registration.paymentReference && ` • Ref: ${registration.paymentReference}`}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: registration.confirmed ? '#10B981' : '#F59E0B',
                            color: 'white'
                          }}>
                            {registration.confirmed ? 'Confirmado' : 'Pendiente'}
                          </span>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: registration.paymentStatus === 'completed' ? '#10B981' : 
                                       registration.paymentStatus === 'failed' ? '#EF4444' : '#F59E0B',
                            color: 'white'
                          }}>
                            {registration.paymentStatus === 'completed' ? 'Pagado' : 
                             registration.paymentStatus === 'failed' ? 'Fallido' : 'Pendiente pago'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Action Buttons */}
                          {!registration.checkedIn && (
                            <button
                              onClick={() => handleCheckIn(registration.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#8B5CF6',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle size={12} />
                              Check-in
                            </button>
                          )}
                          
                          {registration.paymentStatus === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedRegistration(registration)
                                setShowPaymentModal(true)
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#182A01',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CreditCard size={12} />
                              Pago
                            </button>
                          )}
                          
                          <button
                            onClick={() => sendWhatsAppMessage(
                              registration.player1Phone,
                              `Hola ${registration.player1Name}, tu inscripción al torneo ${tournament.name} está confirmada!`
                            )}
                            style={{
                              padding: '6px 12px',
                              background: '#25D366',
                              border: 'none',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MessageCircle size={12} />
                            WhatsApp
                          </button>
                          
                          <button
                            onClick={() => handleDeleteRegistration(registration.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#EF4444',
                              border: 'none',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={12} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardModernContent>
          </CardModern>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          {/* Payment Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Total Recaudado
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>
                      {formatCurrency(financialData.totalIncome / 100, tournament.currency)}
                    </div>
                  </div>
                  <Wallet size={24} color="#10B981" />
                </div>
              </CardModernContent>
            </CardModern>

            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Efectivo
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                      {formatCurrency(financialData.cashPayments / 100, tournament.currency)}
                    </div>
                  </div>
                  <DollarSign size={24} color="#6B7280" />
                </div>
              </CardModernContent>
            </CardModern>

            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Tarjeta
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                      {formatCurrency(financialData.cardPayments / 100, tournament.currency)}
                    </div>
                  </div>
                  <CreditCard size={24} color="#6B7280" />
                </div>
              </CardModernContent>
            </CardModern>

            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                      Transferencia
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                      {formatCurrency(financialData.transferPayments / 100, tournament.currency)}
                    </div>
                  </div>
                  <Receipt size={24} color="#6B7280" />
                </div>
              </CardModernContent>
            </CardModern>
          </div>

          {/* Payment List */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <CreditCard size={20} />
                Historial de Pagos ({filteredPayments.length})
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              {filteredPayments.length === 0 ? (
                <div style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: '#6B7280'
                }}>
                  <Wallet size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                    No hay pagos registrados
                  </p>
                  <p style={{ fontSize: '14px' }}>
                    Los pagos aparecerán aquí cuando confirmes pagos en la pestaña de Inscripciones
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#182A01', marginBottom: '4px' }}>
                        {payment.playerName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {new Date(payment.createdAt).toLocaleDateString()} • {payment.reference || 'Sin referencia'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: payment.method === 'cash' ? '#F3F4F6' :
                                   payment.method === 'card' ? '#DBEAFE' :
                                   payment.method === 'transfer' ? '#FEF3C7' : '#F3F4F6',
                        color: payment.method === 'cash' ? '#374151' :
                               payment.method === 'card' ? '#1E40AF' :
                               payment.method === 'transfer' ? '#92400E' : '#374151'
                      }}>
                        {payment.method === 'cash' ? 'Efectivo' :
                         payment.method === 'card' ? 'Tarjeta' :
                         payment.method === 'transfer' ? 'Transferencia' : 'Pendiente'}
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: payment.status === 'completed' ? '#10B981' : '#F59E0B'
                      }}>
                        {formatCurrency(payment.amount / 100, tournament.currency)}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: payment.status === 'completed' ? '#10B981' : '#F59E0B',
                        color: 'white'
                      }}>
                        {payment.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardModernContent>
          </CardModern>
        </div>
      )}

      {activeTab === 'matches' && (
        <div>
          {/* View Toggle and Filters */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <select
                value={matchFilter}
                onChange={(e) => setMatchFilter(e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  minWidth: '200px'
                }}
              >
                <option value="all">Todos los partidos</option>
                <option value="scheduled">Programados</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completados</option>
              </select>

              {tournament.status === 'REGISTRATION_CLOSED' && registrations.length >= 2 && matches.length === 0 && (
                <button
                  onClick={generateBracket}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Target size={16} />
                  Generar Bracket
                </button>
              )}
            </div>
            
            {/* View Mode Toggle */}
            {matches.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setMatchViewMode('bracket')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: matchViewMode === 'bracket' ? 'none' : '1px solid #E5E7EB',
                    background: matchViewMode === 'bracket' ? 'linear-gradient(135deg, #66E7AA, #A4DF4E)' : 'white',
                    color: matchViewMode === 'bracket' ? '#182A01' : '#6B7280',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Trophy size={14} />
                  Vista Bracket
                </button>
                <button
                  onClick={() => setMatchViewMode('list')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: matchViewMode === 'list' ? 'none' : '1px solid #E5E7EB',
                    background: matchViewMode === 'list' ? 'linear-gradient(135deg, #66E7AA, #A4DF4E)' : 'white',
                    color: matchViewMode === 'list' ? '#182A01' : '#6B7280',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Grid size={14} />
                  Vista Lista
                </button>
              </div>
            )}
          </div>

          {/* Bracket View */}
          {matchViewMode === 'bracket' && matches.length > 0 && (
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <Trophy size={20} />
                  Vista del Bracket
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <BracketVisualization
                  matches={matches}
                  tournamentType={tournament.type}
                  onMatchClick={(match) => {
                    setSelectedMatch(match)
                    setShowMatchResultModal(true)
                  }}
                />
              </CardModernContent>
            </CardModern>
          )}
          
          {/* List View */}
          {matchViewMode === 'list' && (
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <Grid size={20} />
                  Partidos del Torneo ({filteredMatches.length})
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                {filteredMatches.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#6B7280'
                  }}>
                    <Grid size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                      No hay partidos generados
                    </h3>
                    <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                      Genera el bracket cuando tengas suficientes inscripciones confirmadas
                    </p>
                  </div>
                ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {filteredMatches.map((match) => (
                    <div
                      key={match.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        background: 'white'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#182A01', marginBottom: '4px', fontSize: '16px' }}>
                          {match.round} - Partido {match.matchNumber}
                        </div>
                        <div style={{ fontSize: '15px', color: '#374151', marginBottom: '8px' }}>
                          <span style={{ fontWeight: match.winner === match.player1Name ? 700 : 400 }}>
                            {match.player1Name || 'Por determinar'}
                          </span>
                          <span style={{ margin: '0 8px', color: '#6B7280' }}>vs</span>
                          <span style={{ fontWeight: match.winner === match.player2Name ? 700 : 400 }}>
                            {match.player2Name || 'Por determinar'}
                          </span>
                        </div>
                        {match.score && (
                          <div style={{ fontSize: '14px', color: '#10B981', marginBottom: '4px', fontWeight: 600 }}>
                            Resultado: {match.score}
                          </div>
                        )}
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          {match.court && (
                            <>🏟️ {match.court.name}</>
                          )}
                          {match.startTime && (
                            <> • ⏰ {match.startTime}</>
                          )}
                          {match.scheduledAt && (
                            <> • 📅 {new Date(match.scheduledAt).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: match.status === 'COMPLETED' ? '#10B981' : 
                                     match.status === 'IN_PROGRESS' ? '#3B82F6' : '#F59E0B',
                          color: 'white'
                        }}>
                          {match.status === 'COMPLETED' ? 'Completado' :
                           match.status === 'IN_PROGRESS' ? 'En Progreso' : 'Programado'}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {match.status !== 'COMPLETED' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedMatch(match)
                                  setShowMatchResultModal(true)
                                }}
                                style={{
                                  padding: '6px',
                                  background: '#10B981',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Capturar Resultado"
                              >
                                <Check size={14} color="white" />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedMatch(match)
                                  setShowScheduleModal(true)
                                }}
                                style={{
                                  padding: '6px',
                                  background: '#3B82F6',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Programar"
                              >
                                <Calendar size={14} color="white" />
                              </button>
                            </>
                          )}
                          
                          {match.qrCode && (
                            <button
                              style={{
                                padding: '6px',
                                background: '#F3F4F6',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Ver QR"
                            >
                              <QrCode size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardModernContent>
          </CardModern>
          )}
          
          {/* Show empty state when no matches */}
          {matches.length === 0 && (
            <CardModern>
              <CardModernContent>
                <div style={{ 
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6B7280'
                }}>
                  <Grid size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                    No hay partidos generados
                  </h3>
                  <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                    Genera el bracket cuando tengas suficientes inscripciones confirmadas
                  </p>
                </div>
              </CardModernContent>
            </CardModern>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={autoAssignCourts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                color: '#182A01',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MapPin size={16} />
              Asignar Canchas Automáticamente
            </button>
            
            <button
              onClick={blockCourtsForTournament}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#EF4444',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Lock size={16} />
              Bloquear Canchas
            </button>
            
            <button
              onClick={exportSchedule}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#8B5CF6',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              Exportar Calendario
            </button>
          </div>

          <CardModern>
            <CardModernHeader>
              <CardModernTitle>
                <Calendar size={20} />
                Programación de Partidos
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              {/* Timeline View */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr',
                gap: '16px',
                marginBottom: '32px'
              }}>
                {/* Time slots */}
                <div style={{ display: 'grid', gap: '4px' }}>
                  {Array.from({ length: 14 }, (_, i) => {
                    const hour = 8 + i;
                    return (
                      <div key={hour} style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#6B7280',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '12px',
                        borderRight: '2px solid #E5E7EB'
                      }}>
                        {hour}:00
                      </div>
                    );
                  })}
                </div>
                
                {/* Courts schedule */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${courts.length}, 1fr)`, gap: '12px' }}>
                  {courts.map(court => (
                    <div key={court.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#182A01',
                        padding: '8px',
                        background: '#F3F4F6',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        {court.name}
                      </div>
                      
                      <div style={{ display: 'grid', gap: '4px' }}>
                        {Array.from({ length: 14 }, (_, timeSlot) => {
                          const scheduledMatch = matches.find(m => 
                            m.courtId === court.id && 
                            m.scheduledAt && 
                            new Date(m.scheduledAt).getHours() === 8 + timeSlot
                          );
                          
                          return (
                            <div
                              key={timeSlot}
                              onClick={() => {
                                if (!scheduledMatch) {
                                  setSelectedCourt(court);
                                  setSelectedTimeSlot(8 + timeSlot);
                                  setShowScheduleModal(true);
                                }
                              }}
                              style={{
                                height: '60px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                padding: '4px',
                                background: scheduledMatch ? 
                                  (scheduledMatch.status === 'COMPLETED' ? '#D1FAE5' :
                                   scheduledMatch.status === 'IN_PROGRESS' ? '#FEF3C7' : '#DBEAFE') : 
                                  'white',
                                cursor: scheduledMatch ? 'default' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '11px'
                              }}
                            >
                              {scheduledMatch ? (
                                <>
                                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                                    {scheduledMatch.round}
                                  </div>
                                  <div style={{ fontSize: '10px', textAlign: 'center' }}>
                                    {scheduledMatch.player1Name?.split(' ')[0]} vs {scheduledMatch.player2Name?.split(' ')[0]}
                                  </div>
                                </>
                              ) : (
                                <span style={{ color: '#9CA3AF' }}>Disponible</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Scheduled Matches List */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Partidos Programados</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {matches.filter(m => m.scheduledAt).map(match => (
                    <div key={match.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      background: 'white'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                          {match.player1Name} vs {match.player2Name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {match.round} • Partido {match.matchNumber}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>🏟️ {match.court?.name}</div>
                          <div style={{ fontSize: '12px', fontWeight: 600 }}>
                            {new Date(match.scheduledAt).toLocaleDateString()} {new Date(match.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMatch(match);
                            setShowScheduleModal(true);
                          }}
                          style={{
                            padding: '6px',
                            background: '#F3F4F6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                    {/* Mock matches */}
                    {i % 3 === 0 && (
                      <div style={{
                        fontSize: '10px',
                        background: '#10B981',
                        color: 'white',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        marginBottom: '2px'
                      }}>
                        10:00 C1
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Court Schedule */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#182A01', marginBottom: '16px' }}>
                  Horarios por Cancha
                </h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {courts.map(court => (
                    <div key={court.id} style={{
                      padding: '16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      background: 'white'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                          {court.name}
                        </h5>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#10B981',
                          color: 'white'
                        }}>
                          Disponible
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
                        {['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30'].map(time => (
                          <div key={time} style={{
                            padding: '4px',
                            textAlign: 'center',
                            fontSize: '11px',
                            background: '#F3F4F6',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}>
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      )}

      {activeTab === 'finances' && (
        <div>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setShowExpenseModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                color: '#182A01',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              Agregar Gasto
            </button>
            
            <button
              onClick={exportFinancialReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#8B5CF6',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FileText size={16} />
              Exportar Informe
            </button>
            
            <button
              onClick={generateInvoices}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#3B82F6',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Receipt size={16} />
              Generar Facturas
            </button>
          </div>

          {/* Financial Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <TrendingUp size={20} color="#10B981" />
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Ingresos Totales</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#10B981' }}>
                      {formatCurrency(financialData.totalIncome / 100, tournament.currency)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      {registrations.filter(r => r.paymentStatus === 'completed').length} pagos recibidos
                    </div>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <TrendingDown size={20} color="#EF4444" />
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Gastos Totales</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#EF4444' }}>
                      {formatCurrency(financialData.totalExpenses / 100, tournament.currency)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      {expenses.length} gastos registrados
                    </div>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <PieChart size={20} color="#3B82F6" />
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Balance Neto</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: financialData.totalIncome >= financialData.totalExpenses ? '#10B981' : '#EF4444' }}>
                      {formatCurrency((financialData.totalIncome - financialData.totalExpenses) / 100, tournament.currency)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      Margen: {financialData.totalIncome > 0 ? Math.round(((financialData.totalIncome - financialData.totalExpenses) / financialData.totalIncome) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
            
            <CardModern>
              <CardModernContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Clock size={20} color="#F59E0B" />
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Por Cobrar</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#F59E0B' }}>
                      {formatCurrency(financialData.pendingPayments / 100, tournament.currency)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      ROI: {financialData.totalIncome > 0 
                        ? `${(((financialData.totalIncome - financialData.totalExpenses) / financialData.totalIncome) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </div>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
          </div>

          {/* Income Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <TrendingUp size={20} />
                  Desglose de Ingresos
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Inscripciones</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#10B981' }}>
                      {formatCurrency(financialData.registrationIncome / 100, tournament.currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Patrocinios</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#10B981' }}>
                      {formatCurrency(0, tournament.currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Otros</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#10B981' }}>
                      {formatCurrency(0, tournament.currency)}
                    </span>
                  </div>
                  
                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>Total</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>
                      {formatCurrency(financialData.totalIncome / 100, tournament.currency)}
                    </span>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  <TrendingDown size={20} />
                  Desglose de Gastos
                </CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Premios</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#EF4444' }}>
                      {formatCurrency(tournament.prizePool / 100, tournament.currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Canchas</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#EF4444' }}>
                      {formatCurrency(0, tournament.currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Arbitraje</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#EF4444' }}>
                      {formatCurrency(0, tournament.currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Otros</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#EF4444' }}>
                      {formatCurrency(0, tournament.currency)}
                    </span>
                  </div>
                  
                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>Total</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>
                      {formatCurrency(tournament.prizePool / 100, tournament.currency)}
                    </span>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
          </div>

          {/* Add Expense Button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#EF4444',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Agregar Gasto
          </button>
        </div>
      )}

      {/* Modals */}
      {/* Payment Modal */}
      {showPaymentModal && selectedRegistration && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedRegistration(null)
          }}
          title="Confirmar Pago de Inscripción"
          customerInfo={{
            name: `${selectedRegistration.player1Name}${selectedRegistration.player2Name ? ` & ${selectedRegistration.player2Name}` : ''}`,
            email: selectedRegistration.player1Email || '',
            phone: selectedRegistration.player1Phone,
            teamName: selectedRegistration.teamName || ''
          }}
          amount={tournament.registrationFee}
          currency={tournament.currency}
          context="tournament"
          contextId={tournament.id}
          onConfirmPayment={async (method: string, reference?: string) => {
            await confirmPayment(selectedRegistration.id, method, reference)
          }}
          onGenerateLink={async () => {
            return await generatePaymentLink(selectedRegistration)
          }}
        />
      )}

      {/* Match Result Modal */}
      {showMatchResultModal && selectedMatch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              Capturar Resultado
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  {selectedMatch.player1Name || 'Jugador 1'} - Sets Ganados
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={matchResult.player1Score[0]?.games || 0}
                  onChange={(e) => setMatchResult({
                    ...matchResult,
                    player1Score: [{ set: 1, games: parseInt(e.target.value) }]
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  {selectedMatch.player2Name || 'Jugador 2'} - Sets Ganados
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={matchResult.player2Score[0]?.games || 0}
                  onChange={(e) => setMatchResult({
                    ...matchResult,
                    player2Score: [{ set: 1, games: parseInt(e.target.value) }]
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Ganador
                </label>
                <select
                  value={matchResult.winner}
                  onChange={(e) => setMatchResult({ ...matchResult, winner: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccionar ganador</option>
                  <option value={selectedMatch.player1Name}>{selectedMatch.player1Name}</option>
                  <option value={selectedMatch.player2Name}>{selectedMatch.player2Name}</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  value={matchResult.duration}
                  onChange={(e) => setMatchResult({ ...matchResult, duration: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowMatchResultModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleMatchResult}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Guardar Resultado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedMatch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              Programar Partido
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Cancha
                </label>
                <select
                  value={scheduleData.courtId}
                  onChange={(e) => setScheduleData({ ...scheduleData, courtId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccionar cancha</option>
                  {courts.map(court => (
                    <option key={court.id} value={court.id}>{court.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={scheduleData.startTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={scheduleData.duration}
                  onChange={(e) => setScheduleData({ ...scheduleData, duration: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleScheduleMatch}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Programar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Agregar Gasto</h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Concepto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Alquiler de canchas"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Categoría
                </label>
                <select style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <option value="courts">Canchas</option>
                  <option value="prizes">Premios</option>
                  <option value="referee">Arbitraje</option>
                  <option value="equipment">Equipamiento</option>
                  <option value="catering">Catering</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Otros</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Monto
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Fecha
                </label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Notas (opcional)
                </label>
                <textarea
                  placeholder="Detalles adicionales del gasto"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowExpenseModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  background: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Add expense logic here
                  setShowExpenseModal(false)
                  alert('Gasto agregado exitosamente')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Agregar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Result Modal */}
      {showMatchResultModal && selectedMatch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
              Registrar Resultado
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                padding: '16px',
                background: '#F9FAFB',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {selectedMatch.round} - Partido {selectedMatch.matchNumber}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  {selectedMatch.player1Name} vs {selectedMatch.player2Name}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Ganador
                </label>
                <select
                  value={matchResult.winnerId}
                  onChange={(e) => setMatchResult({...matchResult, winnerId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccionar ganador</option>
                  <option value={selectedMatch.player1Id}>{selectedMatch.player1Name}</option>
                  <option value={selectedMatch.player2Id}>{selectedMatch.player2Name}</option>
                </select>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Resultado
                </label>
                <input
                  type="text"
                  placeholder="Ej: 6-4, 6-2"
                  value={matchResult.score}
                  onChange={(e) => setMatchResult({...matchResult, score: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  placeholder="60"
                  value={matchResult.duration}
                  onChange={(e) => setMatchResult({...matchResult, duration: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowMatchResultModal(false)
                  setSelectedMatch(null)
                  setMatchResult({ winnerId: '', score: '', duration: 60 })
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  background: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleMatchResult}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Guardar Resultado
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'qr-checkin' && (
        <QRCheckIn 
          tournamentId={tournamentId}
          registrations={registrations}
          onCheckIn={handleCheckIn}
        />
      )}

      {activeTab === 'rankings' && (
        <PlayerRankings 
          tournamentId={tournamentId}
          tournamentType={tournament?.type as 'ELIMINATION' | 'ROUND_ROBIN' | 'SWISS' || 'ROUND_ROBIN'}
          onPlayerSelect={(playerId) => {
            console.log('Player selected:', playerId)
          }}
        />
      )}

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
              Check-in de Jugadores
            </h2>
            
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Buscar jugador..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              {registrations.filter(r => r.confirmed && !r.checkedIn).map(registration => (
                <div key={registration.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{registration.player1Name}</div>
                    {registration.player2Name && (
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>& {registration.player2Name}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleCheckIn(registration.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#8B5CF6',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Check-in
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowCheckInModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E5E7EB',
                background: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}