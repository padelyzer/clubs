'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', href: '/' }
    ]
    
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const isLast = index === paths.length - 1
      
      // Format label (capitalize, replace dashes)
      const label = path
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      })
    })
    
    return breadcrumbs
  }
  
  const items = generateBreadcrumbs()
  
  if (items.length <= 1) return null
  
  return (
    <nav aria-label="Breadcrumb">
      <ol role="list">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <>
                <Link href={item.href}>{item.label}</Link>
                <span aria-hidden="true"> / </span>
              </>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}