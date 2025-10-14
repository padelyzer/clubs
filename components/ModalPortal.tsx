'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ModalPortalProps = {
  children: React.ReactNode
}

/**
 * ModalPortal - Renders children in a portal outside the DOM hierarchy
 * This ensures modals appear above all other content, even when rendered
 * inside layouts with z-index stacking contexts
 */
export function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    children,
    document.body
  )
}
