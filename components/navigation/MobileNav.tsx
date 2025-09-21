'use client'

import { useState, useEffect } from 'react'
import { BaseNav } from './BaseNav'
import { usePathname } from 'next/navigation'

interface MobileNavProps {
  navigation: {
    label: string
    href: string
    icon?: string
  }[]
  userInfo?: {
    name: string
    role: string
  }
}

export function MobileNav({ navigation, userInfo }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  
  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        <span aria-hidden="true">
          {isOpen ? '✕' : '☰'}
        </span>
      </button>
      
      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          aria-label="Close menu"
        />
      )}
      
      {/* Mobile navigation panel */}
      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        data-open={isOpen}
      >
        {/* User info */}
        {userInfo && (
          <div role="region" aria-label="User information">
            <p>{userInfo.name}</p>
            <p>{userInfo.role}</p>
          </div>
        )}
        
        {/* Navigation */}
        <BaseNav 
          items={navigation} 
          ariaLabel="Mobile navigation menu"
        />
        
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
        >
          Cerrar
        </button>
      </div>
    </>
  )
}