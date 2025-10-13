'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNotify } from '@/contexts/NotificationContext'

interface SplitPayment {
  id: string
  playerName: string
  playerEmail: string
  playerPhone: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  completedAt?: string
  stripeChargeId?: string
  paymentLink?: string
}

interface SplitPaymentStatus {
  booking: {
    id: string
    date: string
    startTime: string
    endTime: string
    club: {
      name: string
    }
    court: {
      name: string
    }
    playerName: string
    totalPlayers: number
    price: number
    paymentStatus: string
  }
  splitPayments: SplitPayment[]
  totalPayments: number
  completedPayments: number
  pendingPayments: number
  totalAmount: number
  completedAmount: number
  pendingAmount: number
}

interface ClubPaymentConfig {
  acceptCash: boolean
  terminalEnabled: boolean
  transferEnabled: boolean
  bankName?: string
  accountNumber?: string
}

interface SplitPaymentManagerProps {
  bookingId: string
  onClose?: () => void
  embedded?: boolean
}

export function SplitPaymentManager({ bookingId, onClose, embedded = false }: SplitPaymentManagerProps) {
  const notify = useNotify()
  const [status, setStatus] = useState<SplitPaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGenerateLinks, setShowGenerateLinks] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState<ClubPaymentConfig | null>(null)
  const [showReferenceModal, setShowReferenceModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<{ id: string, method: string } | null>(null)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<{ playerName: string, link: string } | null>(null)

  useEffect(() => {
    fetchStatus()
    fetchPaymentConfig()
  }, [bookingId])

  async function fetchStatus() {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`)
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        setShowGenerateLinks(data.status.splitPayments.length === 0)
      } else {
        setError(data.error || 'Error al cargar datos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function fetchPaymentConfig() {
    try {
      const response = await fetch('/api/settings/club')
      const data = await response.json()

      if (data.success && data.settings) {
        setPaymentConfig({
          acceptCash: data.settings.acceptCash ?? true,
          terminalEnabled: data.settings.terminalEnabled ?? false,
          transferEnabled: data.settings.transferEnabled ?? false,
          bankName: data.settings.bankName,
          accountNumber: data.settings.accountNumber
        })
      } else {
        // Set defaults if no settings found
        setPaymentConfig({
          acceptCash: true,
          terminalEnabled: false,
          transferEnabled: false
        })
      }
    } catch (err) {
      console.error('Error fetching payment config:', err)
      // Set defaults on error
      setPaymentConfig({
        acceptCash: true,
        terminalEnabled: false,
        transferEnabled: false
      })
    }
  }

  async function generateSplitPayments() {
    setActionLoading('generate')
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        await fetchStatus()
        setShowGenerateLinks(false)
      } else {
        setError(data.error || 'Error al generar pagos divididos')
      }
    } catch (err) {
      setError('Error al generar pagos divididos')
    } finally {
      setActionLoading(null)
    }
  }


  async function processPayment(splitPaymentId: string, paymentMethod: string, reference?: string) {
    // For card and transfer payments, show reference modal first
    if ((paymentMethod === 'terminal' || paymentMethod === 'transfer') && !reference) {
      setSelectedPayment({ id: splitPaymentId, method: paymentMethod })
      setShowReferenceModal(true)
      return
    }

    setActionLoading(`payment-${splitPaymentId}-${paymentMethod}`)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          splitPaymentId,
          action: 'complete',
          paymentMethod,
          referenceNumber: reference || `${paymentMethod.toUpperCase()}_${Date.now().toString().slice(-6)}`
        }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchStatus()
        setShowReferenceModal(false)
        setSelectedPayment(null)
        setReferenceNumber('')
      } else {
        setError(data.error || 'Error al procesar pago')
      }
    } catch (err) {
      setError('Error al procesar pago')
    } finally {
      setActionLoading(null)
    }
  }

  async function generatePaymentLink(splitPaymentId: string) {
    setActionLoading(`link-${splitPaymentId}`)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          splitPaymentId,
          action: 'generate-link'
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentLink) {
        // Copy link to clipboard
        await navigator.clipboard.writeText(data.paymentLink)
        notify('Link copiado al portapapeles', 'success')

        // Show modal with payment link
        const splitPayment = status?.splitPayments?.find(sp => sp.id === splitPaymentId)
        if (splitPayment) {
          setGeneratedLink({ playerName: splitPayment.playerName, link: data.paymentLink })
          setShowLinkModal(true)
        }
        
        await fetchStatus()
      } else {
        setError(data.error || 'Error al generar link de pago')
      }
    } catch (err) {
      setError('Error al generar link de pago')
    } finally {
      setActionLoading(null)
    }
  }

  const getPaymentMethodButtons = (splitPayment: SplitPayment) => {
    if (!paymentConfig) return null
    
    const buttons = []
    
    if (paymentConfig.acceptCash) {
      buttons.push(
        <button
          key="cash"
          onClick={() => processPayment(splitPayment.id, 'cash')}
          disabled={actionLoading === `payment-${splitPayment.id}-cash`}
          style={{
            fontSize: '11px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '5px 8px',
            borderRadius: '6px',
            border: 'none',
            cursor: actionLoading === `payment-${splitPayment.id}-cash` ? 'not-allowed' : 'pointer',
            opacity: actionLoading === `payment-${splitPayment.id}-cash` ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {actionLoading === `payment-${splitPayment.id}-cash` ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path d="M9 12l2 2 4-4" opacity="0.5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="12" y1="12" x2="12" y2="12.01" />
            </svg>
          )}
          Efectivo
        </button>
      )
    }
    
    if (paymentConfig.terminalEnabled) {
      buttons.push(
        <button
          key="terminal"
          onClick={() => processPayment(splitPayment.id, 'terminal')}
          disabled={actionLoading === `payment-${splitPayment.id}-terminal`}
          style={{
            fontSize: '11px',
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            padding: '5px 8px',
            borderRadius: '6px',
            border: 'none',
            cursor: actionLoading === `payment-${splitPayment.id}-terminal` ? 'not-allowed' : 'pointer',
            opacity: actionLoading === `payment-${splitPayment.id}-terminal` ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {actionLoading === `payment-${splitPayment.id}-terminal` ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path d="M9 12l2 2 4-4" opacity="0.5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          )}
          Tarjeta
        </button>
      )
    }
    
    if (paymentConfig.transferEnabled) {
      buttons.push(
        <button
          key="transfer"
          onClick={() => processPayment(splitPayment.id, 'transfer')}
          disabled={actionLoading === `payment-${splitPayment.id}-transfer`}
          style={{
            fontSize: '11px',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            padding: '5px 8px',
            borderRadius: '6px',
            border: 'none',
            cursor: actionLoading === `payment-${splitPayment.id}-transfer` ? 'not-allowed' : 'pointer',
            opacity: actionLoading === `payment-${splitPayment.id}-transfer` ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {actionLoading === `payment-${splitPayment.id}-transfer` ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path d="M9 12l2 2 4-4" opacity="0.5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 11 12 6 17 11" />
              <polyline points="17 13 12 18 7 13" />
            </svg>
          )}
          Transferencia
        </button>
      )
    }
    
    // Add payment link button
    buttons.push(
      <button
        key="link"
        onClick={() => generatePaymentLink(splitPayment.id)}
        disabled={actionLoading === `link-${splitPayment.id}`}
        style={{
          fontSize: '12px',
          backgroundColor: '#e0e7ff',
          color: '#4338ca',
          padding: '6px 10px',
          borderRadius: '6px',
          border: 'none',
          cursor: actionLoading === `link-${splitPayment.id}` ? 'not-allowed' : 'pointer',
          opacity: actionLoading === `link-${splitPayment.id}` ? 0.6 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {actionLoading === `link-${splitPayment.id}` ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path d="M9 12l2 2 4-4" opacity="0.5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
        Link
      </button>
    )
    
    return buttons
  }

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }


  if (loading) {
    if (embedded) {
      return (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    if (embedded) {
      return (
        <div className="p-6">
          <div className="text-center text-red-600 mb-4">
            {error || 'Error al cargar información'}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Volver al Check-in
          </button>
        </div>
      )
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
          <div className="text-center text-red-600 mb-4">
            {error || 'Error al cargar información'}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  if (embedded) {
    return (
      <div>
        {/* Progress indicator */}
        <div style={{ 
          marginBottom: '20px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e6ed'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Progreso de pagos: {status.completedPayments}/{status.totalPayments}
            </span>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              ${formatAmount(status.completedAmount)} / ${formatAmount(status.totalAmount)} MXN
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#10b981',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              width: `${status.totalPayments > 0 ? (status.completedPayments / status.totalPayments) * 100 : 0}%`
            }}></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Split payments list */}
        {showGenerateLinks ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px'
            }}>
              💳
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Generar Pagos Divididos
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Esta reserva será dividida en {status.totalPayments} pagos iguales de ${formatAmount(status.booking.price / status.totalPayments)} MXN cada uno.
            </p>
            <button
              onClick={generateSplitPayments}
              disabled={actionLoading === 'generate'}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: actionLoading === 'generate' ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'generate' ? 0.5 : 1
              }}
            >
              {actionLoading === 'generate' ? 'Generando...' : '🚀 Generar Pagos Divididos'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {status.splitPayments.map((payment, index) => (
              <div key={payment.id} style={{
                padding: '16px',
                background: 'white',
                border: '1px solid #e0e6ed',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#6b7280'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {payment.playerName}
                      </div>
                      {(payment.playerEmail || payment.playerPhone) && (
                        <div style={{
                          fontSize: '11px',
                          color: '#6b7280'
                        }}>
                          {payment.playerEmail && <div>{payment.playerEmail}</div>}
                          {payment.playerPhone && <div>{payment.playerPhone}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        ${formatAmount(payment.amount)} MXN
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }} className={getStatusColor(payment.status)}>
                        {payment.status === 'completed' ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Pagado
                          </>
                        ) : payment.status === 'processing' ? (
                          <>
                            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path d="M9 12l2 2 4-4" opacity="0.5" />
                            </svg>
                            Procesando
                          </>
                        ) : payment.status === 'failed' ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <path d="M18 6L6 18" />
                              <path d="M6 6l12 12" />
                            </svg>
                            Falló
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 12h0M12 12h0M16 12h0" strokeLinecap="round" />
                            </svg>
                            Pendiente
                          </>
                        )}
                      </div>
                    </div>
                    {payment.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                        {getPaymentMethodButtons(payment)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status footer */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          {status.completedPayments === status.totalPayments ? (
            <span style={{ color: '#10b981', fontWeight: '500' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Todos los pagos completados
            </span>
          ) : (
            <span>
              Faltan {status.totalPayments - status.completedPayments} pagos por completar
            </span>
          )}
        </div>

        {/* Reference Modal */}
        {showReferenceModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#111827'
              }}>
                Ingrese referencia de {selectedPayment?.method === 'terminal' ? 'tarjeta' : 'transferencia'}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                Ingrese los últimos 4-6 dígitos de la referencia o número de autorización
              </p>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                placeholder="Ej: 123456"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setShowReferenceModal(false)
                    setSelectedPayment(null)
                    setReferenceNumber('')
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (selectedPayment && referenceNumber.trim()) {
                      processPayment(selectedPayment.id, selectedPayment.method, referenceNumber.trim())
                    }
                  }}
                  disabled={!referenceNumber.trim()}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: referenceNumber.trim() ? '#10b981' : '#e5e7eb',
                    color: referenceNumber.trim() ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: referenceNumber.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pagos Divididos</h2>
              <p className="text-sm text-gray-500">
                {status.booking.club.name} • {status.booking.court.name} • {' '}
                {format(new Date(status.booking.date), 'PPP', { locale: es })} {status.booking.startTime} - {status.booking.endTime}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso de pagos: {status.completedPayments}/{status.totalPayments}
            </span>
            <span className="text-sm text-gray-500">
              ${formatAmount(status.completedAmount)} / ${formatAmount(status.totalAmount)} MXN
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${status.totalPayments > 0 ? (status.completedPayments / status.totalPayments) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {showGenerateLinks ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generar Pagos Divididos
                </h3>
                <p className="text-gray-600 mb-4">
                  Esta reserva será dividida en {status.totalPayments} pagos iguales de ${formatAmount(status.booking.price / status.totalPayments)} MXN cada uno.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Se generan {status.totalPayments} registros de pago únicos</li>
                    <li>• Cada jugador paga su parte por separado</li>
                    <li>• La reserva se confirma cuando todos paguen</li>
                    <li>• Se pueden procesar pagos con múltiples métodos</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={generateSplitPayments}
                disabled={actionLoading === 'generate'}
                className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'generate' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </span>
                ) : (
                  '🚀 Generar Pagos Divididos'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {status.splitPayments.map((payment, index) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{payment.playerName}</h4>
                        <div className="text-xs text-gray-500">
                          {payment.playerEmail && <div>{payment.playerEmail}</div>}
                          {payment.playerPhone && <div>{payment.playerPhone}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${formatAmount(payment.amount)} MXN
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)} {payment.status === 'completed' ? 'Pagado' : payment.status === 'processing' ? 'Procesando' : payment.status === 'failed' ? 'Falló' : 'Pendiente'}
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-wrap">
                        {payment.status === 'pending' && paymentConfig && (
                          <>
                            {paymentConfig.acceptCash && (
                              <button
                                onClick={() => processPayment(payment.id, 'cash')}
                                disabled={actionLoading === `payment-${payment.id}-cash`}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                {actionLoading === `payment-${payment.id}-cash` ? '⏳' : '💵'} Efectivo
                              </button>
                            )}
                            {paymentConfig.terminalEnabled && (
                              <button
                                onClick={() => processPayment(payment.id, 'terminal')}
                                disabled={actionLoading === `payment-${payment.id}-terminal`}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                              >
                                {actionLoading === `payment-${payment.id}-terminal` ? '⏳' : '💳'} Tarjeta
                              </button>
                            )}
                            {paymentConfig.transferEnabled && (
                              <button
                                onClick={() => processPayment(payment.id, 'transfer')}
                                disabled={actionLoading === `payment-${payment.id}-transfer`}
                                className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
                              >
                                {actionLoading === `payment-${payment.id}-transfer` ? '⏳' : '🏦'} Transferencia
                              </button>
                            )}
                          </>
                        )}
                        {payment.status === 'completed' && payment.completedAt && (
                          <div className="text-xs text-gray-500">
                            {format(new Date(payment.completedAt), 'dd/MM/yy HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {payment.paymentLink && payment.status === 'pending' && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium text-gray-700 mb-1">Link de pago:</div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={payment.paymentLink}
                          readOnly
                          className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(payment.paymentLink!)
                            notify('Link copiado al portapapeles', 'success')
                          }}
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {status.completedPayments === status.totalPayments ? (
                <span className="text-green-600 font-medium">✅ Todos los pagos completados</span>
              ) : (
                <span>
                  Faltan {status.totalPayments - status.completedPayments} pagos por completar
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Payment Link Modal */}
      {showLinkModal && generatedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Link de Pago Generado
              </h3>
              <p className="text-sm text-gray-600">
                Envía este link a {generatedLink.playerName} para que complete su pago.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Link de pago:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink.link)
                    notify('Link copiado al portapapeles', 'success')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copiar
                </button>
              </div>
              <input
                type="text"
                value={generatedLink.link}
                readOnly
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 text-sm mb-2">Opciones para enviar:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                  </svg>
                  Email
                </li>
                <li className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  SMS
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Hola ${generatedLink.playerName}, aquí está tu link para pagar tu parte de la reserva: ${generatedLink.link}`)}`, '_blank')
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                WhatsApp
              </button>
              <button
                onClick={() => {
                  setShowLinkModal(false)
                  setGeneratedLink(null)
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Modal */}
      {showReferenceModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ingresar Referencia de Pago
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor ingresa el número de referencia del pago con {selectedPayment.method === 'terminal' ? 'tarjeta' : 'transferencia'}.
            </p>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={selectedPayment.method === 'terminal' ? 'Ej: 1234' : 'Ej: REF-123456'}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (referenceNumber.trim()) {
                    processPayment(selectedPayment.id, selectedPayment.method, referenceNumber.trim())
                  }
                }}
                disabled={!referenceNumber.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Pago
              </button>
              <button
                onClick={() => {
                  setShowReferenceModal(false)
                  setSelectedPayment(null)
                  setReferenceNumber('')
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}