'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string | ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div role="status" aria-label="Empty state">
      <div data-empty-state>
        {/* Icon */}
        {icon && (
          <div aria-hidden="true">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
        )}
        
        {/* Text content */}
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        
        {/* Actions */}
        {(action || secondaryAction) && (
          <div role="group" aria-label="Available actions">
            {action && (
              <button onClick={action.onClick} type="button">
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button onClick={secondaryAction.onClick} type="button">
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}