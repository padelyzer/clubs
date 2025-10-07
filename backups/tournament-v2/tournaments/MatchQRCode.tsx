'use client'

import React, { useState } from 'react'
import QRCode from 'react-qr-code'
import { QrCode, Copy, Check, ExternalLink, Download, FileText } from 'lucide-react'
import { generateMatchQRPDF } from '@/lib/pdf/match-qr-generator'

interface MatchQRCodeProps {
  match: {
    id: string
    team1Name?: string
    team2Name?: string
    courtNumber?: string
    startTime?: string
    matchDate?: string
    round?: string
    matchNumber?: number
  }
  tournamentId: string
  tournamentName?: string
}

export default function MatchQRCode({ match, tournamentId, tournamentName = 'Torneo' }: MatchQRCodeProps) {
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  
  // Generate match result submission URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const matchUrl = `${baseUrl}/match-result/${tournamentId}/${match.id}`
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(matchUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true)
    try {
      await generateMatchQRPDF({
        tournamentName,
        stage: match.round || 'Fase de Grupos',
        matchNumber: match.matchNumber || 1,
        team1Name: match.team1Name || 'Equipo 1',
        team2Name: match.team2Name || 'Equipo 2',
        courtName: match.courtNumber || 'Por definir',
        startTime: match.startTime,
        matchDate: match.matchDate,
        qrUrl: matchUrl
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF. Por favor intente de nuevo.')
    } finally {
      setGeneratingPDF(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          background: 'white',
          color: '#6B7280',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F3F4F6'
          e.currentTarget.style.color = '#374151'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.color = '#6B7280'
        }}
      >
        <QrCode size={16} />
        QR Resultados
      </button>

      {showQR && (
        <div
          style={{
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
          }}
          onClick={() => setShowQR(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                QR para Captura de Resultados
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {match.team1Name} vs {match.team2Name}
              </p>
              {match.courtNumber && match.startTime && (
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                  Cancha {match.courtNumber} • {match.startTime}
                </p>
              )}
            </div>

            {/* QR Code */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <QRCode
                value={matchUrl}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
                fgColor="#111827"
                bgColor="#ffffff"
              />
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: generatingPDF 
                  ? '#E5E7EB' 
                  : 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                color: generatingPDF ? '#9CA3AF' : '#182A01',
                fontSize: '14px',
                fontWeight: 600,
                cursor: generatingPDF ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
                transition: 'all 0.3s ease',
                boxShadow: generatingPDF ? 'none' : '0 4px 12px rgba(102, 231, 170, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (!generatingPDF) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 231, 170, 0.35)'
                }
              }}
              onMouseLeave={(e) => {
                if (!generatingPDF) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 231, 170, 0.25)'
                }
              }}
            >
              {generatingPDF ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #9CA3AF',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Descargar PDF para Imprimir
                </>
              )}
            </button>

            {/* Info Box */}
            <div style={{
              background: '#FEF3C7',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              border: '1px solid #FCD34D'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FileText size={16} color="#92400E" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>
                  PDF para Cancha
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: '1.5' }}>
                El PDF incluye el QR en tamaño grande, información del partido y la etapa del torneo. 
                Imprímalo y colóquelo en la cancha correspondiente.
              </p>
            </div>

            {/* Instructions */}
            <div style={{
              background: '#F9FAFB',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                📱 Instrucciones para jugadores:
              </h4>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6B7280', lineHeight: '1.6' }}>
                <li>Escanear el código QR con el celular</li>
                <li>Seleccionar su equipo/pareja</li>
                <li>Capturar el resultado del partido</li>
                <li>Máximo 2 capturas por equipo (4 total)</li>
              </ol>
            </div>

            {/* URL and Actions */}
            <div style={{
              background: '#F3F4F6',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <input
                type="text"
                value={matchUrl}
                readOnly
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: '12px',
                  color: '#6B7280',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: copied ? '#10B981' : '#6B7280',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <a
                href={matchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3B82F6',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={14} />
                Abrir
              </a>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowQR(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#111827',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>

            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  )
}