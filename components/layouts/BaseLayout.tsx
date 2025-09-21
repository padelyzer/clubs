import { ReactNode } from 'react'
import { Breadcrumbs } from '../navigation/Breadcrumbs'

interface BaseLayoutProps {
  children: ReactNode
  showBreadcrumbs?: boolean
  header?: ReactNode
  footer?: ReactNode
  sidebar?: ReactNode
}

export function BaseLayout({ 
  children, 
  showBreadcrumbs = true,
  header,
  footer,
  sidebar
}: BaseLayoutProps) {
  return (
    <div data-layout="base">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Header */}
      {header && (
        <header role="banner">
          {header}
        </header>
      )}
      
      {/* Main container */}
      <div data-layout-container>
        {/* Sidebar */}
        {sidebar && sidebar}
        
        {/* Main content */}
        <main id="main-content" role="main" tabIndex={-1}>
          {/* Breadcrumbs */}
          {showBreadcrumbs && <Breadcrumbs />}
          
          {/* Page content */}
          <div role="region" aria-label="Page content">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      {footer && (
        <footer role="contentinfo">
          {footer}
        </footer>
      )}
    </div>
  )
}