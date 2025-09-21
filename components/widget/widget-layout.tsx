'use client'

import { ReactNode } from 'react'

interface WidgetLayoutProps {
  children: ReactNode
  isEmbedded?: boolean
  club?: {
    name: string
    logo?: string
  }
}

export function WidgetLayout({ children, isEmbedded = false, club }: WidgetLayoutProps) {
  if (isEmbedded) {
    return (
      <div className="widget-embedded">
        <style jsx>{`
          .widget-embedded {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #374151;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }
          .widget-embedded * {
            box-sizing: border-box;
          }
          .widget-embedded input,
          .widget-embedded select,
          .widget-embedded button {
            font-family: inherit;
          }
        `}</style>
        {children}
      </div>
    )
  }

  return (
    <div className="widget-standalone">
      <style jsx>{`
        .widget-standalone {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          color: #374151;
        }
      `}</style>
      {children}
    </div>
  )
}