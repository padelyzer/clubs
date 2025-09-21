import React from 'react'

interface SettingsCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  noPadding?: boolean
  highlight?: boolean
}

export function SettingsCard({ 
  children, 
  title, 
  description, 
  action,
  icon,
  noPadding = false,
  highlight = false
}: SettingsCardProps) {
  return (
    <div style={{
      backgroundColor: highlight ? '#F0FFF4' : 'white',
      border: `1px solid ${highlight ? '#BBF7D0' : '#D1D1D6'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: highlight 
        ? '0 0 0 1px rgba(102, 231, 170, 0.1), 0 4px 16px -4px rgba(0, 0, 0, 0.08)' 
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      marginBottom: '12px'
    }}>
      {(title || description || action) && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '0.5px solid rgba(60, 60, 67, 0.29)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          backgroundColor: highlight ? 'rgba(52, 199, 89, 0.03)' : 'rgba(242, 242, 247, 0.3)'
        }}>
          <div style={{ flex: 1 }}>
            {title && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: description ? '2px' : 0
              }}>
                {icon && (
                  <div style={{
                    color: highlight ? '#34C759' : '#007AFF',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {icon}
                  </div>
                )}
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: 590, // Slightly heavier than 600 for better hierarchy
                  color: '#1C1C1E',
                  letterSpacing: '-0.408px', // More precise Apple spacing
                  margin: 0,
                  lineHeight: '22px'
                }}>
                  {title}
                </h3>
              </div>
            )}
            {description && (
              <p style={{
                fontSize: '13px',
                color: '#8E8E93',
                letterSpacing: '-0.078px',
                lineHeight: '16px',
                marginTop: '2px'
              }}>
                {description}
              </p>
            )}
          </div>
          {action && (
            <div style={{ flexShrink: 0 }}>
              {action}
            </div>
          )}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : '20px' }}>
        {children}
      </div>
    </div>
  )
}

interface SettingsRowProps {
  label: string
  value?: React.ReactNode
  children?: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
  danger?: boolean
}

export function SettingsRow({ 
  label, 
  value, 
  children, 
  icon,
  onClick,
  danger = false
}: SettingsRowProps) {
  const content = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'opacity 0.2s ease'
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.opacity = '0.7'
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.opacity = '1'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1
      }}>
        {icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: danger ? '#FFEBE9' : '#F0FFF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: danger ? '#DC2626' : '#66E7AA'
          }}>
            {icon}
          </div>
        )}
        <span style={{
          fontSize: '15px',
          color: danger ? '#DC2626' : '#1C1C1E',
          fontWeight: onClick ? 500 : 400,
          letterSpacing: '-0.01em'
        }}>
          {label}
        </span>
      </div>
      {(value || children) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {value && (
            <span style={{
              fontSize: '15px',
              color: '#8E8E93',
              letterSpacing: '-0.01em'
            }}>
              {value}
            </span>
          )}
          {children}
          {onClick && (
            <svg 
              width="7" 
              height="12" 
              viewBox="0 0 7 12" 
              fill="none"
              style={{ marginLeft: '4px' }}
            >
              <path 
                d="M1 1L6 6L1 11" 
                stroke="#C7C7CC" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer'
        }}
      >
        {content}
      </button>
    )
  }

  return content
}

interface SettingsGroupProps {
  children: React.ReactNode
  separator?: boolean
}

export function SettingsGroup({ children, separator = true }: SettingsGroupProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderTop: separator ? '1px solid rgba(229, 231, 235, 0.5)' : 'none',
      paddingTop: separator ? '16px' : 0,
      marginTop: separator ? '16px' : 0
    }}>
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {index < React.Children.count(children) - 1 && (
            <div style={{
              height: '1px',
              backgroundColor: 'rgba(229, 231, 235, 0.3)',
              marginLeft: '44px'
            }} />
          )}
        </>
      ))}
    </div>
  )
}

interface SettingsToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label?: string
  description?: string
}

export function SettingsToggle({ 
  enabled, 
  onChange, 
  label,
  description 
}: SettingsToggleProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: label ? '16px 0' : 0
    }}>
      {label && (
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '15px',
            color: '#1C1C1E',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            marginBottom: description ? '4px' : 0
          }}>
            {label}
          </div>
          {description && (
            <div style={{
              fontSize: '13px',
              color: '#8E8E93',
              letterSpacing: '-0.01em',
              lineHeight: '18px'
            }}>
              {description}
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => onChange(!enabled)}
        style={{
          position: 'relative',
          width: '51px',
          height: '31px',
          borderRadius: '15.5px',
          backgroundColor: enabled ? '#34C759' : '#E5E5EA',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '2px',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '2px',
          left: enabled ? '22px' : '2px',
          width: '27px',
          height: '27px',
          borderRadius: '13.5px',
          backgroundColor: 'white',
          boxShadow: enabled 
            ? '0 3px 8px 0 rgba(0, 0, 0, 0.15), 0 3px 1px 0 rgba(0, 0, 0, 0.06)' 
            : '0 3px 8px 0 rgba(0, 0, 0, 0.15), 0 3px 1px 0 rgba(0, 0, 0, 0.06)',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease'
        }} />
      </button>
    </div>
  )
}