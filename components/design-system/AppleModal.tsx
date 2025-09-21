import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface AppleModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  showCloseButton?: boolean
  footer?: React.ReactNode
}

export function AppleModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'medium',
  showCloseButton = true,
  footer
}: AppleModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeStyles = {
    small: {
      maxWidth: '400px',
      maxHeight: '90vh'
    },
    medium: {
      maxWidth: '600px',
      maxHeight: '90vh'
    },
    large: {
      maxWidth: '900px',
      maxHeight: '90vh'
    },
    fullscreen: {
      width: '100vw',
      height: '100vh',
      maxWidth: '100%',
      maxHeight: '100%',
      borderRadius: 0
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: size === 'fullscreen' ? 'stretch' : 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: size === 'fullscreen' ? 0 : '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          ...sizeStyles[size],
          backgroundColor: 'white',
          borderRadius: size === 'fullscreen' ? 0 : '20px',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          position: 'relative',
          boxShadow: size === 'fullscreen' 
            ? 'none' 
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'slideUp 0.3s ease',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              {title && (
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1C1C1E',
                  letterSpacing: '-0.02em',
                  marginBottom: subtitle ? '4px' : 0
                }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p style={{
                  fontSize: '13px',
                  color: '#8E8E93',
                  letterSpacing: '-0.01em'
                }}>
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '15px',
                  backgroundColor: '#F2F2F7',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5E5EA'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F2F2F7'
                }}
              >
                <X size={16} color="#8E8E93" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid rgba(229, 231, 235, 0.5)',
            backgroundColor: '#FAFAFA'
          }}>
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}