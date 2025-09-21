'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  header?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'dark' | 'light'
}

/**
 * Sidebar Component - Minimal Linear Design System
 * 
 * @example
 * <Sidebar
 *   header={<SidebarHeader title="Dashboard" />}
 *   footer={<SidebarFooter />}
 * >
 *   <SidebarSection title="Main">
 *     <SidebarItem icon="📊" active>Dashboard</SidebarItem>
 *     <SidebarItem icon="📁">Projects</SidebarItem>
 *   </SidebarSection>
 * </Sidebar>
 */
export function Sidebar({
  className,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  header,
  footer,
  variant = 'default',
  children,
  ...props
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = controlledCollapsed ?? internalCollapsed

  const handleCollapse = () => {
    const newValue = !collapsed
    setInternalCollapsed(newValue)
    onCollapsedChange?.(newValue)
  }

  const variants = {
    default: 'bg-white border-r border-gray-200',
    dark: 'bg-gray-900 border-r border-gray-800 text-white',
    light: 'bg-gray-50 border-r border-gray-200',
  }

  return (
    <aside
      className={cn(
        // Base styles
        'flex flex-col h-full',
        'transition-all duration-300',
        
        // Width
        collapsed ? 'w-16' : 'w-64',
        
        // Variant
        variants[variant],
        
        className
      )}
      {...props}
    >
      {/* Collapse Button */}
      <button
        onClick={handleCollapse}
        className={cn(
          'absolute -right-3 top-8',
          'w-6 h-6',
          'bg-white border border-gray-200 rounded-full',
          'flex items-center justify-center',
          'hover:bg-gray-50',
          'transition-colors',
          'z-10'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* Header */}
      {header && (
        <div className={cn(
          'flex-shrink-0',
          'border-b',
          variant === 'dark' ? 'border-gray-800' : 'border-gray-200'
        )}>
          {header}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={cn(
          'flex-shrink-0',
          'border-t',
          variant === 'dark' ? 'border-gray-800' : 'border-gray-200'
        )}>
          {footer}
        </div>
      )}
    </aside>
  )
}

/**
 * SidebarHeader Component
 */
export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  logo?: React.ReactNode
}

export function SidebarHeader({
  className,
  title,
  logo,
  ...props
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'px-4 py-4',
        className
      )}
      {...props}
    >
      {logo ? (
        logo
      ) : title ? (
        <h2 className="text-lg font-semibold">
          {title}
        </h2>
      ) : null}
    </div>
  )
}

/**
 * SidebarSection Component
 */
export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  collapsible?: boolean
}

export function SidebarSection({
  className,
  title,
  collapsible = false,
  children,
  ...props
}: SidebarSectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'px-3 mb-4',
        className
      )}
      {...props}
    >
      {title && (
        <div
          className={cn(
            'flex items-center justify-between',
            'px-2 py-1 mb-2',
            'text-xs font-semibold text-gray-500 uppercase tracking-wider',
            collapsible && 'cursor-pointer hover:text-gray-700'
          )}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <span>{title}</span>
          {collapsible && (
            collapsed ? (
              <ChevronDown className="w-3 h-3 transition-transform" />
            ) : (
              <ChevronUp className="w-3 h-3 transition-transform" />
            )
          )}
        </div>
      )}
      
      {!collapsed && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * SidebarItem Component
 */
export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  active?: boolean
  badge?: string | number
  href?: string
}

export function SidebarItem({
  className,
  icon,
  active = false,
  badge,
  href,
  children,
  ...props
}: SidebarItemProps) {
  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left truncate">
        {children}
      </span>
      {badge && (
        <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
          {badge}
        </span>
      )}
    </>
  )

  const baseClasses = cn(
    // Base styles
    'w-full flex items-center gap-3',
    'px-3 py-2',
    'text-sm font-medium',
    'rounded-lg',
    'transition-colors duration-200',
    
    // States
    active
      ? 'bg-gray-100 text-gray-900'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
    
    className
  )

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    )
  }

  return (
    <button className={baseClasses} {...props}>
      {content}
    </button>
  )
}

/**
 * SidebarFooter Component
 */
export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: {
    name: string
    email?: string
    avatar?: string
  }
}

export function SidebarFooter({
  className,
  user,
  children,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn(
        'p-4',
        className
      )}
      {...props}
    >
      {user ? (
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {user.name[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            {user.email && (
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}