'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface SafeLinkProps {
  href: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

// Component that handles navigation without triggering logout
export function SafeLink({ href, children, className, style }: SafeLinkProps) {
  const router = useRouter()
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Use Next.js router for client-side navigation
    // This should preserve the session
    router.push(href)
  }
  
  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}