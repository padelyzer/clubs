import { ReactNode } from 'react'
import { BaseLayout } from './BaseLayout'
import Link from 'next/link'

interface PublicLayoutProps {
  children: ReactNode
  showFooter?: boolean
}

export function PublicLayout({ children, showFooter = true }: PublicLayoutProps) {
  const header = (
    <nav role="navigation" aria-label="Public navigation">
      <div data-nav-container>
        {/* Logo */}
        <Link href="/">
          <span>Padelyzer</span>
        </Link>
        
        {/* Public navigation */}
        <ul role="list">
          <li><Link href="/#features">Características</Link></li>
          <li><Link href="/#pricing">Precios</Link></li>
          <li><Link href="/demo">Demo</Link></li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>
        
        {/* Auth buttons */}
        <div data-auth-buttons>
          <Link href="/login">Iniciar Sesión</Link>
          <Link href="/register/club">Registrar Club</Link>
        </div>
      </div>
    </nav>
  )
  
  const footer = showFooter ? (
    <div role="contentinfo">
      <div data-footer-container>
        {/* Company info */}
        <div>
          <h3>Padelyzer</h3>
          <p>La plataforma inteligente del pádel mexicano</p>
        </div>
        
        {/* Product links */}
        <nav aria-label="Product navigation">
          <h4>Producto</h4>
          <ul role="list">
            <li><Link href="/#features">Características</Link></li>
            <li><Link href="/#pricing">Precios</Link></li>
            <li><Link href="/demo">Demo</Link></li>
            <li><Link href="/widget">Widget</Link></li>
          </ul>
        </nav>
        
        {/* Company links */}
        <nav aria-label="Company navigation">
          <h4>Empresa</h4>
          <ul role="list">
            <li><Link href="/about">Nosotros</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contacto</Link></li>
            <li><Link href="/support">Soporte</Link></li>
          </ul>
        </nav>
        
        {/* Legal links */}
        <nav aria-label="Legal navigation">
          <h4>Legal</h4>
          <ul role="list">
            <li><Link href="/terms">Términos</Link></li>
            <li><Link href="/privacy">Privacidad</Link></li>
            <li><Link href="/cookies">Cookies</Link></li>
          </ul>
        </nav>
      </div>
      
      {/* Copyright */}
      <div data-copyright>
        <p>© 2024 Padelyzer. Todos los derechos reservados.</p>
      </div>
    </div>
  ) : null
  
  return (
    <BaseLayout
      header={header}
      footer={footer}
      showBreadcrumbs={false}
    >
      {children}
    </BaseLayout>
  )
}