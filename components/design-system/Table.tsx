'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'striped' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  responsive?: boolean
}

/**
 * Table Component - Minimal Linear Design System
 * 
 * @example
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *       <TableHead>Status</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *       <TableCell>Active</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
export function Table({
  className,
  variant = 'default',
  size = 'md',
  responsive = true,
  children,
  ...props
}: TableProps) {
  const table = (
    <table
      className={cn(
        // Base styles
        'w-full text-sm',
        
        // Variant styles
        variant === 'bordered' && 'border border-gray-200',
        
        className
      )}
      {...props}
    >
      {children}
    </table>
  )

  if (responsive) {
    return (
      <div className="w-full overflow-x-auto">
        {table}
      </div>
    )
  }

  return table
}

/**
 * TableHeader Component
 */
export function TableHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  )
}

/**
 * TableBody Component
 */
export function TableBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        'divide-y divide-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  )
}

/**
 * TableRow Component
 */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean
  selected?: boolean
}

export function TableRow({
  className,
  hoverable = true,
  selected = false,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        // Base styles
        'transition-colors',
        
        // Hoverable
        hoverable && 'hover:bg-gray-50',
        
        // Selected
        selected && 'bg-blue-50',
        
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

/**
 * TableHead Component
 */
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sorted?: 'asc' | 'desc' | false
  onSort?: () => void
}

export function TableHead({
  className,
  sortable = false,
  sorted = false,
  onSort,
  children,
  ...props
}: TableHeadProps) {
  return (
    <th
      className={cn(
        // Base styles
        'px-4 py-3',
        'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        'bg-gray-50',
        
        // Sortable
        sortable && 'cursor-pointer select-none hover:bg-gray-100',
        
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="text-gray-400">
            {sorted === 'asc' && '↑'}
            {sorted === 'desc' && '↓'}
            {!sorted && '↕'}
          </span>
        )}
      </div>
    </th>
  )
}

/**
 * TableCell Component
 */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  variant?: 'default' | 'numeric' | 'action'
}

export function TableCell({
  className,
  variant = 'default',
  children,
  ...props
}: TableCellProps) {
  return (
    <td
      className={cn(
        // Base styles
        'px-4 py-3',
        'text-sm text-gray-900',
        
        // Variant styles
        variant === 'numeric' && 'text-right font-mono',
        variant === 'action' && 'text-right',
        
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}

/**
 * TableFooter Component
 */
export function TableFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        'border-t border-gray-200 bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  )
}

/**
 * TableCaption Component
 */
export function TableCaption({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn(
        'px-4 py-2 text-sm text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </caption>
  )
}

/**
 * TablePagination Component
 */
export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (items: number) => void
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </span>
        
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="text-sm border-gray-200 rounded-lg"
          >
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1
            
            // Show first page, last page, and pages around current
            if (totalPages > 5) {
              if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-lg',
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                )}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}