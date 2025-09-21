'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Menu, ChevronDown, User } from 'lucide-react'

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  navigation?: React.ReactNode
  actions?: React.ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  sticky?: boolean
}

/**
 * Header Component - Minimal Linear Design System
 * 
 * @example
 * <Header
 *   logo={<Logo />}
 *   navigation={
 *     <>
 *       <HeaderNavItem href="/dashboard">Dashboard</HeaderNavItem>
 *       <HeaderNavItem href="/projects">Projects</HeaderNavItem>
 *     </>
 *   }
 *   actions={
 *     <>
 *       <Button variant="ghost" size="sm">Sign In</Button>
 *       <Button variant="primary" size="sm">Get Started</Button>
 *     </>
 *   }
 * />
 */
export function Header({
  className,
  logo,
  navigation,
  actions,
  variant = 'default',
  sticky = false,
  ...props
}: HeaderProps) {
  const variants = {
    default: 'bg-white border-b border-gray-200',
    bordered: 'bg-white border-b-2 border-gray-900',
    elevated: 'bg-white shadow-md',
  }

  return (
    <header
      className={cn(
        // Base styles
        'w-full',
        'transition-all duration-200',
        
        // Sticky
        sticky && 'sticky top-0 z-40',
        
        // Variant
        variants[variant],
        
        className
      )}
      {...props}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}
          
          {/* Navigation Section */}
          {navigation && (
            <nav className="hidden md:flex md:items-center md:space-x-8">
              {navigation}
            </nav>
          )}
          
          {/* Actions Section */}
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

/**
 * HeaderNavItem Component
 */
export interface HeaderNavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
}

export function HeaderNavItem({
  className,
  active = false,
  children,
  ...props
}: HeaderNavItemProps) {
  return (
    <a
      className={cn(
        // Base styles
        'px-3 py-2',
        'text-sm font-medium',
        'rounded-lg',
        'transition-colors duration-200',
        
        // States
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

/**
 * HeaderLogo Component
 */
export interface HeaderLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  text?: string
}

export function HeaderLogo({
  className,
  src,
  alt,
  text,
  ...props
}: HeaderLogoProps) {
  return (
    <div
      className={cn(
        'flex items-center',
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Logo'}
          className="h-8 w-auto"
        />
      ) : text ? (
        <span className="text-xl font-bold text-gray-900">
          {text}
        </span>
      ) : null}
    </div>
  )
}

/**
 * HeaderUser Component
 */
export interface HeaderUserProps {
  name?: string
  email?: string
  avatar?: string
  menuItems?: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }>
}

export function HeaderUser({
  name,
  email,
  avatar,
  menuItems,
}: HeaderUserProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-3 text-sm rounded-lg hover:bg-gray-50 p-2"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        )}
        
        {name && (
          <div className="hidden md:block text-left">
            <p className="font-medium text-gray-900">{name}</p>
            {email && (
              <p className="text-xs text-gray-500">{email}</p>
            )}
          </div>
        )}
        
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      
      {/* Dropdown Menu */}
      {open && menuItems && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick()
                  setOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}