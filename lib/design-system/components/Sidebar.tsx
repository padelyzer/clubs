'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  Calendar,
  Users,
  Settings,
  FileText,
  DollarSign,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Hash,
  Star,
  Folder,
  LogOut,
  HelpCircle,
  Command,
  PanelLeftClose,
  PanelLeft,
  Square,
  MessageSquare,
  CheckSquare,
  Clock,
  CreditCard,
  ChartBar,
  Shield,
} from 'lucide-react';

// Types
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  shortcut?: string;
  onClick?: () => void;
  children?: NavItem[];
  expanded?: boolean;
  disabled?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface SidebarProps {
  sections?: NavSection[];
  footer?: React.ReactNode;
  header?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  width?: string;
  collapsedWidth?: string;
  className?: string;
}

// Context for sidebar state
interface SidebarContextValue {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  expandedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  expandedItems: Set<string>;
  toggleItem: (itemId: string) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

/**
 * Modern Sidebar Component
 * Inspired by Linear's collapsible sidebar with hierarchical navigation
 */
export function Sidebar({
  sections = [],
  footer,
  header,
  collapsible = true,
  defaultCollapsed = false,
  width = '240px',
  collapsedWidth = '60px',
  className,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded).map(s => s.id))
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Toggle item expansion
  const toggleItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // Keyboard shortcut for collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCollapsed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapsed]);

  // Context value
  const contextValue: SidebarContextValue = {
    isCollapsed,
    toggleCollapsed,
    expandedSections,
    toggleSection,
    expandedItems,
    toggleItem,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={cn(
          'relative flex flex-col h-full',
          'bg-white/50 dark:bg-gray-900/50',
          'backdrop-blur-xl',
          'border-r border-gray-200/50 dark:border-gray-800/50',
          'transition-all duration-300 ease-in-out',
          className
        )}
        style={{
          width: isCollapsed ? collapsedWidth : width,
        }}
      >
        {/* Header */}
        {header && (
          <div className="flex-shrink-0 border-b border-gray-200/50 dark:border-gray-800/50">
            {header}
          </div>
        )}

        {/* Collapse Toggle */}
        {collapsible && (
          <button
            onClick={toggleCollapsed}
            className={cn(
              'absolute -right-3 top-6 z-10',
              'w-6 h-6 rounded-full',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'flex items-center justify-center',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          {sections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              isCollapsed={isCollapsed}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-800/50">
            {footer}
          </div>
        )}
      </aside>
    </SidebarContext.Provider>
  );
}

/**
 * Sidebar Section Component
 */
function SidebarSection({
  section,
  isCollapsed,
  isExpanded,
  onToggle,
}: {
  section: NavSection;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { expandedItems, toggleItem } = useSidebar();

  return (
    <div>
      {/* Section Title */}
      {section.title && !isCollapsed && (
        <button
          onClick={section.collapsible ? onToggle : undefined}
          className={cn(
            'w-full flex items-center justify-between',
            'px-2 py-1 mb-1',
            'text-xs font-medium text-gray-500 dark:text-gray-400',
            'hover:text-gray-700 dark:hover:text-gray-200',
            'transition-colors',
            section.collapsible && 'cursor-pointer'
          )}
        >
          <span className="uppercase tracking-wider">{section.title}</span>
          {section.collapsible && (
            <ChevronDown 
              className={cn(
                'h-3 w-3 transition-transform',
                !isExpanded && '-rotate-90'
              )}
            />
          )}
        </button>
      )}

      {/* Section Items */}
      {(!section.collapsible || isExpanded) && (
        <div className="space-y-0.5">
          {section.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isExpanded={expandedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar Item Component
 */
function SidebarItem({
  item,
  isCollapsed,
  isExpanded,
  onToggle,
  level = 0,
}: {
  item: NavItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  level?: number;
}) {
  const pathname = usePathname();
  const isActive = item.href ? pathname === item.href : false;
  const hasChildren = item.children && item.children.length > 0;
  const { expandedItems, toggleItem } = useSidebar();

  const content = (
    <>
      {/* Expand/Collapse Icon for Parent Items */}
      {hasChildren && !isCollapsed && (
        <ChevronRight
          className={cn(
            'h-3 w-3 flex-shrink-0 transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
      )}

      {/* Item Icon */}
      {item.icon && (
        <div className={cn(
          'flex-shrink-0',
          isCollapsed ? 'mx-auto' : '',
          !hasChildren && !isCollapsed && 'ml-3'
        )}>
          {item.icon}
        </div>
      )}

      {/* Item Label */}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>

          {/* Badge */}
          {item.badge && (
            <span className={cn(
              'px-1.5 py-0.5 text-xs rounded-full',
              'bg-blue-100 text-blue-600',
              'dark:bg-blue-900/30 dark:text-blue-400'
            )}>
              {item.badge}
            </span>
          )}

          {/* Shortcut */}
          {item.shortcut && (
            <kbd className="hidden lg:inline-flex text-xs text-gray-400">
              {item.shortcut}
            </kbd>
          )}
        </>
      )}
    </>
  );

  const itemClasses = cn(
    'w-full flex items-center gap-2 rounded-lg transition-colors',
    'hover:bg-gray-100/50 dark:hover:bg-gray-800/50',
    isActive && 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400',
    item.disabled && 'opacity-50 cursor-not-allowed',
    isCollapsed ? 'p-2 justify-center' : 'px-2 py-1.5 text-sm',
    level > 0 && !isCollapsed && `pl-${(level + 1) * 4}`
  );

  // Render as button or link
  const itemElement = item.href ? (
    <Link href={item.href} className={itemClasses}>
      {content}
    </Link>
  ) : (
    <button
      onClick={hasChildren ? onToggle : item.onClick}
      disabled={item.disabled}
      className={itemClasses}
    >
      {content}
    </button>
  );

  return (
    <>
      {itemElement}
      
      {/* Render children if expanded */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-0.5 space-y-0.5">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              isCollapsed={isCollapsed}
              isExpanded={expandedItems.has(child.id)}
              onToggle={() => toggleItem(child.id)}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Default sidebar sections for the app
 */
export const defaultSections: NavSection[] = [
  {
    id: 'main',
    title: '',
    items: [
      {
        id: 'home',
        label: 'Inicio',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />,
        shortcut: 'G H',
      },
      {
        id: 'bookings',
        label: 'Reservas',
        href: '/dashboard/bookings',
        icon: <Calendar className="h-4 w-4" />,
        badge: 3,
        shortcut: 'G B',
      },
      {
        id: 'reception',
        label: 'Recepción',
        href: '/dashboard/reception',
        icon: <CheckSquare className="h-4 w-4" />,
        shortcut: 'G R',
      },
    ],
  },
  {
    id: 'management',
    title: 'Gestión',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'courts',
        label: 'Canchas',
        href: '/dashboard/settings#courts',
        icon: <Square className="h-4 w-4" />,
      },
      {
        id: 'pricing',
        label: 'Precios',
        href: '/dashboard/pricing',
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        id: 'users',
        label: 'Usuarios',
        href: '/dashboard/users',
        icon: <Users className="h-4 w-4" />,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: <ChartBar className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'settings',
    title: 'Configuración',
    collapsible: true,
    items: [
      {
        id: 'club-settings',
        label: 'Club',
        href: '/dashboard/settings',
        icon: <Settings className="h-4 w-4" />,
        shortcut: 'G S',
      },
      {
        id: 'notifications',
        label: 'Notificaciones',
        href: '/dashboard/settings#notifications',
        icon: <Bell className="h-4 w-4" />,
      },
      {
        id: 'payments',
        label: 'Pagos',
        href: '/dashboard/settings#payments',
        icon: <CreditCard className="h-4 w-4" />,
      },
    ],
  },
];