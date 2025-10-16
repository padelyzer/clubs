'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { QrCode, ChevronDown, ChevronUp, Printer, Download } from 'lucide-react'
import { CardModern } from '@/components/design-system/CardModern'

interface CourtQR {
  id: string
  courtNumber: string
  qrCode: string
  accessUrl: string
  Court?: {
    name: string
  }
}

interface CourtQRPanelProps {
  tournamentId: string
  colors: any
}

export function CourtQRPanel({ tournamentId, colors }: CourtQRPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [courtQRs, setCourtQRs] = useState<CourtQR[]>([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    if (expanded && !generated) {
      loadCourtQRs()
    }
  }, [expanded])

  const loadCourtQRs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tournaments/courts/qr')
      const data = await response.json()

      if (Array.isArray(data)) {
        setCourtQRs(data)
        setGenerated(data.length > 0)
      }
    } catch (error) {
      console.error('Error loading court QRs:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tournaments/courts/qr', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.qrCodes) {
        setCourtQRs(data.qrCodes)
        setGenerated(true)
      }
    } catch (error) {
      console.error('Error generating court QRs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <CardModern variant="glass" padding="md">
        {/* Header - Collapsible */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            padding: '16px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${colors.accent[300]}15, ${colors.accent[400]}25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <QrCode size={20} style={{ color: colors.accent[600] }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '4px'
              }}>
                QR Codes de Canchas
              </h3>
              <p style={{
                fontSize: '13px',
                color: colors.text.secondary
              }}>
                {generated
                  ? `${courtQRs.length} códigos QR generados para sumisión de resultados`
                  : 'Genera códigos QR para que los jugadores suban resultados desde las canchas'
                }
              </p>
            </div>
          </div>

          {expanded ? (
            <ChevronUp size={20} style={{ color: colors.text.secondary }} />
          ) : (
            <ChevronDown size={20} style={{ color: colors.text.secondary }} />
          )}
        </button>

        {/* Content - Expanded */}
        {expanded && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            {!generated ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <button
                  onClick={generateQRs}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                    color: 'white',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <QrCode size={18} />
                  {loading ? 'Generando...' : 'Generar Códigos QR'}
                </button>
              </div>
            ) : (
              <>
                {/* Action buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={handlePrint}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: 'white',
                      border: `1px solid ${colors.border.default}`,
                      color: colors.text.primary,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.neutral[50]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white'
                    }}
                  >
                    <Printer size={16} />
                    Imprimir Todos
                  </button>
                </div>

                {/* QR Codes Grid */}
                <div
                  className="qr-print-area"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px'
                  }}
                >
                  {courtQRs.map((courtQR) => (
                    <div
                      key={courtQR.id}
                      style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: '12px',
                        border: `1px solid ${colors.border.light}`,
                        textAlign: 'center',
                        pageBreakInside: 'avoid'
                      }}
                    >
                      {/* Court Number */}
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: colors.text.primary,
                        marginBottom: '12px',
                        padding: '8px',
                        background: `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.primary[700]}25)`,
                        borderRadius: '8px'
                      }}>
                        {courtQR.Court?.name || `Cancha ${courtQR.courtNumber}`}
                      </div>

                      {/* QR Code */}
                      <div style={{
                        padding: '16px',
                        background: 'white',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}>
                        <QRCode
                          value={courtQR.accessUrl}
                          size={180}
                          level="H"
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxWidth: '180px'
                          }}
                        />
                      </div>

                      {/* Instructions */}
                      <div style={{
                        fontSize: '11px',
                        color: colors.text.tertiary,
                        lineHeight: 1.4
                      }}>
                        Escanea para subir el resultado<br />de tu partido
                      </div>

                      {/* URL for reference */}
                      <div style={{
                        fontSize: '9px',
                        color: colors.text.tertiary,
                        marginTop: '8px',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace'
                      }}>
                        {courtQR.qrCode}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardModern>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except QR codes */
          body * {
            visibility: hidden;
          }

          .qr-print-area,
          .qr-print-area * {
            visibility: visible;
          }

          .qr-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
            padding: 20px;
          }

          /* Prevent page breaks inside QR cards */
          .qr-print-area > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
