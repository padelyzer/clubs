'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GlassPanel } from './GlassPanel';
import {
  Search,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Command,
  ArrowUp,
  ArrowDown,
  Hash,
  User,
  FileText,
  DollarSign,
  Bell,
  HelpCircle,
  Plus,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void | Promise<void>;
  keywords?: string[];
  section?: string;
  badge?: string;
  disabled?: boolean;
}

export interface CommandSection {
  id: string;
  title: string;
  items: CommandItem[];
}

interface CommandPaletteProps {
  items?: CommandItem[];
  sections?: CommandSection[];
  placeholder?: string;
  emptyState?: React.ReactNode;
  onClose?: () => void;
  showShortcuts?: boolean;
  maxHeight?: string;
}

/**
 * Command Palette Component
 * Inspired by Linear's command palette with fuzzy search and keyboard navigation
 */
export function CommandPalette({
  items = [],
  sections = [],
  placeholder = 'Type a command or search...',
  emptyState = 'No results found',
  onClose,
  showShortcuts = true,
  maxHeight = '400px',
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Combine items and sections into a flat list for easier navigation
  const allItems = useMemo(() => {
    const flatItems: (CommandItem & { sectionTitle?: string })[] = [];
    
    // Add standalone items
    items.forEach(item => flatItems.push(item));
    
    // Add sectioned items
    sections.forEach(section => {
      section.items.forEach(item => 
        flatItems.push({ ...item, sectionTitle: section.title })
      );
    });
    
    return flatItems;
  }, [items, sections]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search) return allItems;
    
    const searchLower = search.toLowerCase();
    return allItems.filter(item => {
      // Check title
      if (item.title.toLowerCase().includes(searchLower)) return true;
      // Check subtitle
      if (item.subtitle?.toLowerCase().includes(searchLower)) return true;
      // Check keywords
      if (item.keywords?.some(k => k.toLowerCase().includes(searchLower))) return true;
      // Check section
      if (item.section?.toLowerCase().includes(searchLower)) return true;
      
      return false;
    });
  }, [search, allItems]);

  // Group filtered items by section
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: typeof filteredItems } = {};
    
    filteredItems.forEach(item => {
      const section = item.sectionTitle || item.section || 'Commands';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) {
        // Open with Cmd+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          onClose?.();
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
          
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex] && !filteredItems[selectedIndex].disabled) {
            executeCommand(filteredItems[selectedIndex]);
          }
          break;
      }
    },
    [isOpen, filteredItems, selectedIndex, onClose]
  );

  // Execute command
  const executeCommand = async (item: CommandItem) => {
    if (item.disabled) return;
    
    setIsLoading(true);
    try {
      await item.action();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Command execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-command-item]');
      items[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => {
          setIsOpen(false);
          onClose?.();
        }}
      />
      
      {/* Command Palette */}
      <div className="fixed inset-x-0 top-[20%] z-50 mx-auto max-w-2xl px-4">
        <GlassPanel
          blur="xl"
          opacity="high"
          border
          shadow="xl"
          padding="none"
          radius="xl"
          className="animate-in fade-in-0 slide-in-from-top-2"
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-gray-400"
            />
            {showShortcuts && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">ESC</kbd>
                <span>to close</span>
              </div>
            )}
          </div>
          
          {/* Results */}
          <div 
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                {emptyState}
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedItems).map(([section, sectionItems]) => (
                  <div key={section}>
                    {/* Section Header */}
                    <div className="px-4 py-1.5 text-xs font-medium text-gray-400">
                      {section}
                    </div>
                    
                    {/* Section Items */}
                    {sectionItems.map((item, index) => {
                      const globalIndex = filteredItems.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={item.id}
                          data-command-item
                          onClick={() => executeCommand(item)}
                          disabled={item.disabled || isLoading}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            'hover:bg-white/10',
                            isSelected && 'bg-white/10',
                            item.disabled && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {/* Icon */}
                          {item.icon && (
                            <div className="flex-shrink-0 text-gray-400">
                              {item.icon}
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <div className="text-xs text-gray-400 truncate">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          
                          {/* Shortcut or Arrow */}
                          {showShortcuts && item.shortcut ? (
                            <kbd className="text-xs text-gray-400">
                              {item.shortcut}
                            </kbd>
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {showShortcuts && (
            <div className="border-t border-white/10 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">↵</kbd>
                    Select
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="h-3 w-3" />
                  <span>+</span>
                  <span>K</span>
                </div>
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </>
  );
}

/**
 * Hook to use command palette
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    open,
    close,
    toggle,
  };
}