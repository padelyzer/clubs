import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumb?: ReactNode
  metadata?: {
    label: string
    value: string | number
  }[]
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  breadcrumb,
  metadata 
}: PageHeaderProps) {
  return (
    <header role="region" aria-label="Page header">
      {/* Breadcrumb if provided */}
      {breadcrumb && breadcrumb}
      
      <div data-header-content>
        {/* Title and description */}
        <div data-header-text>
          <h1>{title}</h1>
          {description && (
            <p role="doc-subtitle">{description}</p>
          )}
          
          {/* Metadata */}
          {metadata && (
            <dl role="list" aria-label="Page metadata">
              {metadata.map((item, index) => (
                <div key={index}>
                  <dt>{item.label}:</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div data-header-actions role="toolbar" aria-label="Page actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}