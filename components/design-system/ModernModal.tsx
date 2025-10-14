'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { ModalPortal } from '@/components/ModalPortal'
import { colors } from '@/lib/design-system/colors'

interface ModernModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  showCloseButton?: boolean
  footer?: React.ReactNode
}

/**
 * ModernModal - Modal that matches the CardModern design system
 * Uses glassmorphism, backdrop blur, and smooth animations
 */
export function ModernModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'medium',
  showCloseButton = true,
  footer
}: ModernModalProps) {
  const [isHovered, setIsHovered] = React.useState(false)

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
    small: '500px',
    medium: '700px',
    large: '900px',
    xlarge: '1200px'
  }

  return (
    <ModalPortal>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <div
          style={{
            maxWidth: sizeStyles[size],
            width: '100%',
            maxHeight: '90vh',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(164, 223, 78, 0.08)',
            boxShadow: isHovered
              ? '0 30px 60px rgba(164, 223, 78, 0.2), 0 12px 24px rgba(0, 0, 0, 0.08)'
              : '0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div
              style={{
                padding: '28px 32px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.06)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '20px',
                background: 'linear-gradient(to bottom, rgba(164, 223, 78, 0.02), transparent)'
              }}
            >
              <div style={{ flex: 1 }}>
                {title && (
                  <h2
                    style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.3,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                      marginBottom: subtitle ? '6px' : 0
                    }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: colors.text.secondary,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.5
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    background: 'rgba(164, 223, 78, 0.06)',
                    border: '1px solid rgba(164, 223, 78, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.12)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.06)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <X size={18} color={colors.text.secondary} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: '32px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              style={{
                padding: '24px 32px',
                borderTop: '1px solid rgba(164, 223, 78, 0.06)',
                background: 'linear-gradient(to top, rgba(164, 223, 78, 0.02), transparent)'
              }}
            >
              {footer}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes modalSlideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    </ModalPortal>
  )
}
