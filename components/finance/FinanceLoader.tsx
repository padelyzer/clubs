import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface FinanceLoaderProps {
  title: string
  subtitle?: string
  selectedPeriod?: Date
  skeletonType?: 'cards' | 'table' | 'chart'
}

export function FinanceLoader({
  title,
  subtitle,
  selectedPeriod,
  skeletonType = 'cards'
}: FinanceLoaderProps) {
  const renderSkeleton = () => {
    switch (skeletonType) {
      case 'cards':
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            width: '100%',
            maxWidth: '800px'
          }}>
            {[1, 2, 3, 4].map((index) => (
              <div key={index} style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(164, 223, 78, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  width: '40px',
                  height: '12px',
                  background: 'rgba(164, 223, 78, 0.2)',
                  borderRadius: '6px',
                  marginBottom: '12px'
                }} />
                <div style={{
                  width: '80px',
                  height: '24px',
                  background: 'rgba(164, 223, 78, 0.2)',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }} />
                <div style={{
                  width: '60px',
                  height: '12px',
                  background: 'rgba(164, 223, 78, 0.1)',
                  borderRadius: '6px'
                }} />
              </div>
            ))}
          </div>
        )

      case 'table':
        return (
          <div style={{
            width: '100%',
            maxWidth: '900px',
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(164, 223, 78, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              padding: '16px',
              background: 'rgba(164, 223, 78, 0.05)',
              borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  height: '16px',
                  background: 'rgba(164, 223, 78, 0.2)',
                  borderRadius: '4px'
                }} />
              ))}
            </div>
            {/* Table rows */}
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px',
                padding: '16px',
                borderBottom: row < 5 ? '1px solid rgba(164, 223, 78, 0.05)' : 'none'
              }}>
                {[1, 2, 3, 4, 5].map((col) => (
                  <div key={col} style={{
                    height: '14px',
                    background: 'rgba(164, 223, 78, 0.1)',
                    borderRadius: '4px'
                  }} />
                ))}
              </div>
            ))}
          </div>
        )

      case 'chart':
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            width: '100%',
            maxWidth: '1000px'
          }}>
            {/* Chart area */}
            <div style={{
              height: '300px',
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(164, 223, 78, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '20px',
              gap: '8px'
            }}>
              {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                <div key={bar} style={{
                  flex: 1,
                  height: `${Math.random() * 60 + 20}%`,
                  background: 'rgba(164, 223, 78, 0.2)',
                  borderRadius: '4px 4px 0 0'
                }} />
              ))}
            </div>
            {/* Side info */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[1, 2, 3].map((item) => (
                <div key={item} style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(164, 223, 78, 0.1)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '12px',
                    background: 'rgba(164, 223, 78, 0.2)',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }} />
                  <div style={{
                    width: '40px',
                    height: '20px',
                    background: 'rgba(164, 223, 78, 0.1)',
                    borderRadius: '4px'
                  }} />
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#182A01',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          {subtitle || 'Cargando información financiera del club'}
        </p>
      </div>

      {/* Loading content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '24px'
      }}>
        {/* Animated spinner */}
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(164, 223, 78, 0.2)',
          borderTop: '4px solid #A4DF4E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          boxShadow: '0 4px 12px rgba(164, 223, 78, 0.2)'
        }} />

        <div style={{ textAlign: 'center' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#182A01',
            margin: '0 0 8px 0'
          }}>
            Cargando {title.toLowerCase()}...
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#516640',
            margin: 0
          }}>
            {selectedPeriod
              ? `Procesando datos del período ${format(selectedPeriod, 'MMMM yyyy', { locale: es })}`
              : 'Procesando información financiera'
            }
          </p>
        </div>

        {/* Skeleton content */}
        {renderSkeleton()}
      </div>

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}