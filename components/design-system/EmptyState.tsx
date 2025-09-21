import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: compact ? '40px 20px' : '80px 20px',
      textAlign: 'center',
      minHeight: compact ? '200px' : '400px'
    }}>
      {icon && (
        <div style={{
          width: compact ? '48px' : '64px',
          height: compact ? '48px' : '64px',
          borderRadius: '16px',
          backgroundColor: '#F0FFF4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: compact ? '16px' : '24px',
          color: '#66E7AA'
        }}>
          {icon}
        </div>
      )}
      
      <h3 style={{
        fontSize: compact ? '17px' : '20px',
        fontWeight: 600,
        color: '#1C1C1E',
        letterSpacing: '-0.02em',
        marginBottom: description ? '8px' : action ? '20px' : 0
      }}>
        {title}
      </h3>
      
      {description && (
        <p style={{
          fontSize: compact ? '13px' : '15px',
          color: '#8E8E93',
          letterSpacing: '-0.01em',
          maxWidth: '400px',
          lineHeight: compact ? '18px' : '22px',
          marginBottom: action ? '24px' : 0
        }}>
          {description}
        </p>
      )}
      
      {action && (
        <div style={{ marginTop: compact ? '16px' : '24px' }}>
          {action}
        </div>
      )}
    </div>
  )
}