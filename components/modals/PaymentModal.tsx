'use client'

import React, { useState } from 'react'
import { CreditCard, Link2, Smartphone, Copy, Check, ExternalLink, DollarSign, Building } from 'lucide-react'

interface PaymentOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
  recommended?: boolean
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  customerInfo: {
    name: string
    email?: string
    phone?: string
    teamName?: string
  }
  amount: number
  currency: string
  context: 'booking' | 'tournament'
  contextId: string // booking ID or tournament ID
  onConfirmPayment: (method: string, reference?: string) => Promise<void>
  onGenerateLink: () => Promise<string | null>
  availableOptions?: {
    stripe: boolean
    paymentLink: boolean
    onsite: boolean
    terminal: boolean
    transfer: boolean
  }
}

export function PaymentModal({
  isOpen,
  onClose,
  title,
  customerInfo,
  amount,
  currency,
  context,
  contextId,
  onConfirmPayment,
  onGenerateLink,
  availableOptions = {
    stripe: true,
    paymentLink: true,
    onsite: true,
    terminal: false,
    transfer: false
  }
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('payment_link')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [paymentReference, setPaymentReference] = useState('')
  const [showReferenceField, setShowReferenceField] = useState(false)

  if (!isOpen) return null

  const paymentOptions: PaymentOption[] = [
    {
      id: 'payment_link',
      name: 'Link de Pago',
      description: 'Genera un link seguro para pagar desde cualquier dispositivo',
      icon: <Link2 size={20} />,
      available: availableOptions.paymentLink,
      recommended: true
    },
    {
      id: 'stripe_direct',
      name: 'Pago con Tarjeta (Directo)',
      description: 'Procesamiento inmediato en esta pantalla',
      icon: <CreditCard size={20} />,
      available: availableOptions.stripe
    },
    {
      id: 'onsite_cash',
      name: 'Efectivo en el Club',
      description: 'El cliente pagará en efectivo al llegar',
      icon: <DollarSign size={20} />,
      available: availableOptions.onsite
    },
    {
      id: 'onsite_terminal',
      name: 'Terminal en el Club',
      description: 'Pago con tarjeta en terminal del club',
      icon: <CreditCard size={20} />,
      available: availableOptions.terminal
    },
    {
      id: 'transfer',
      name: 'Transferencia Bancaria',
      description: 'Transferencia directa a cuenta del club',
      icon: <Building size={20} />,
      available: availableOptions.transfer
    }
  ]

  const availablePaymentOptions = paymentOptions.filter(option => option.available)

  const handleGenerateLink = async () => {
    setIsProcessing(true)
    try {
      const link = await onGenerateLink()
      if (link) {
        setPaymentLink(link)
      }
    } catch (error) {
      console.error('Error generating payment link:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyLink = async () => {
    if (paymentLink) {
      try {
        await navigator.clipboard.writeText(paymentLink)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 3000)
      } catch (error) {
        console.error('Error copying link:', error)
      }
    }
  }

  const handleOpenLink = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank')
    }
  }

  const handleConfirmPayment = async () => {
    // For transfer, terminal, and direct card payments, require reference
    if ((selectedMethod === 'transfer' || selectedMethod === 'onsite_terminal' || selectedMethod === 'stripe_direct') && !paymentReference.trim()) {
      alert('Por favor ingresa la referencia del pago')
      return
    }

    setIsProcessing(true)
    try {
      await onConfirmPayment(selectedMethod, paymentReference)
      onClose()
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Error al confirmar el pago. Por favor intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        margin: '20px'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '24px' 
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: 600, 
            color: '#182A01',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CreditCard size={28} color="#10B981" />
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Customer Info */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#182A01', marginBottom: '16px' }}>
            Información del Cliente
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Cliente: </span>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#182A01' }}>
                {customerInfo.name}
              </span>
              {customerInfo.teamName && (
                <>
                  <span style={{ color: '#6B7280' }}> - Equipo: </span>
                  <span style={{ fontWeight: 600, color: '#182A01' }}>
                    {customerInfo.teamName}
                  </span>
                </>
              )}
            </div>
            
            {customerInfo.email && (
              <div>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Email: </span>
                <span style={{ fontSize: '14px', color: '#182A01' }}>
                  {customerInfo.email}
                </span>
              </div>
            )}
            
            {customerInfo.phone && (
              <div>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Teléfono: </span>
                <span style={{ fontSize: '14px', color: '#182A01' }}>
                  {customerInfo.phone}
                </span>
              </div>
            )}

            <div>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Monto: </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>
                ${(amount / 100).toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#182A01', marginBottom: '16px' }}>
            Método de Pago
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {availablePaymentOptions.map((option) => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  border: selectedMethod === option.id 
                    ? '2px solid #10B981' 
                    : '2px solid #E5E7EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedMethod === option.id ? '#f0fdf4' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.id}
                  checked={selectedMethod === option.id}
                  onChange={(e) => {
                    setSelectedMethod(e.target.value)
                    setShowReferenceField(e.target.value === 'transfer' || e.target.value === 'onsite_terminal' || e.target.value === 'stripe_direct')
                    setPaymentReference('')
                  }}
                  style={{ margin: 0, transform: 'scale(1.2)' }}
                />
                
                <div style={{ color: '#10B981' }}>
                  {option.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: 600, 
                      color: '#182A01' 
                    }}>
                      {option.name}
                    </span>
                    {option.recommended && (
                      <span style={{
                        fontSize: '11px',
                        background: '#10B981',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 600
                      }}>
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6B7280',
                    margin: 0
                  }}>
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Link Section */}
        {selectedMethod === 'payment_link' && (
          <div style={{
            background: '#f0f9ff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0369a1', marginBottom: '16px' }}>
              Link de Pago
            </h4>
            
            {!paymentLink ? (
              <button
                onClick={handleGenerateLink}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#0284c7',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.6 : 1
                }}
              >
                <Link2 size={16} />
                {isProcessing ? 'Generando...' : 'Generar Link de Pago'}
              </button>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  wordBreak: 'break-all',
                  color: '#374151'
                }}>
                  {paymentLink}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopyLink}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: linkCopied ? '#10B981' : '#6B7280',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                    {linkCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                  
                  <button
                    onClick={handleOpenLink}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    <ExternalLink size={14} />
                    Abrir
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Reference Field */}
        {showReferenceField && (
          <div style={{
            background: '#fef3c7',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#92400e', marginBottom: '16px' }}>
              {selectedMethod === 'transfer' ? 'Referencia de Transferencia' : 
               selectedMethod === 'stripe_direct' ? 'Número de Autorización/Recibo' : 'Número de Ticket/Recibo'}
            </h4>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#92400e',
                marginBottom: '8px'
              }}>
                {selectedMethod === 'transfer' 
                  ? 'Número de referencia de la transferencia bancaria:'
                  : selectedMethod === 'stripe_direct'
                  ? 'Número de autorización o referencia del pago:'
                  : 'Número de ticket o recibo de la terminal:'}
              </label>
              
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={selectedMethod === 'transfer' 
                  ? 'Ej: 1234567890'
                  : selectedMethod === 'stripe_direct'
                  ? 'Ej: AUTH123456 o REF789012'
                  : 'Ej: 00123456'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
                required
              />
            </div>
            
            <p style={{
              fontSize: '12px',
              color: '#92400e',
              margin: 0
            }}>
              {selectedMethod === 'transfer'
                ? 'Esta referencia será utilizada para verificar el pago en el estado de cuenta bancario.'
                : 'Este número nos ayudará a verificar el pago realizado en la terminal.'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          
          {selectedMethod !== 'payment_link' && (
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1
              }}
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}