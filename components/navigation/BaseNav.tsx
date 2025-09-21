'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon?: string
  children?: NavItem[]
}

interface BaseNavProps {
  items: NavItem[]
  ariaLabel?: string
}

export function BaseNav({ items, ariaLabel = "Main navigation" }: BaseNavProps) {
  const pathname = usePathname()
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav role="navigation" aria-label={ariaLabel}>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </Link>
            
            {item.children && (
              <ul>
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link 
                      href={child.href}
                      aria-current={isActive(child.href) ? 'page' : undefined}
                    >
                      {child.icon && <span aria-hidden="true">{child.icon}</span>}
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}