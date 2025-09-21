'use client'

import { useEffect, useState } from 'react'
import { Shield, X } from 'lucide-react'

export function SuperAdminAccessIndicator() {
  const [session, setSession] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if we have a super admin access session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.isSuperAdminAccess) {
          setSession(data)
          setIsVisible(true)
        }
      })
      .catch(console.error)
  }, [])

  if (!isVisible || !session) return null

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontWeight: '500'
    }}>
      <Shield size={20} />
      <div>
        <div>Modo Super Admin</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Accediendo como admin al club
        </div>
      </div>
      <a
        href="/api/admin/return"
        style={{
          marginLeft: '12px',
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '6px',
          color: 'white',
          textDecoration: 'none',
          fontSize: '12px',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      >
        Regresar al Admin
      </a>
    </div>
  )
}