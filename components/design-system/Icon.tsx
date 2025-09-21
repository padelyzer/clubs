'use client'

import React from 'react'
import * as LucideIcons from 'lucide-react'
import { LucideProps } from 'lucide-react'

export type IconName = keyof typeof LucideIcons

export interface IconProps extends LucideProps {
  name: IconName
}

/**
 * Icon Component - Wrapper for Lucide React icons
 * 
 * @example
 * <Icon name="Trophy" className="w-5 h-5" />
 * <Icon name="Users" size={24} />
 */
export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideProps>
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return <LucideIcon {...props} />
}

// Export commonly used sports/business icons for easy reference
export const SportIcons = {
  // Courts & Facilities
  Court: 'Grid3x3' as IconName,
  Field: 'Square' as IconName,
  Stadium: 'Building' as IconName,
  
  // Sports & Games
  Trophy: 'Trophy' as IconName,
  Medal: 'Medal' as IconName,
  Target: 'Target' as IconName,
  Timer: 'Timer' as IconName,
  
  // Teams & Players
  Users: 'Users' as IconName,
  User: 'User' as IconName,
  UserPlus: 'UserPlus' as IconName,
  UserCheck: 'UserCheck' as IconName,
  
  // Analytics & Stats
  Chart: 'BarChart3' as IconName,
  LineChart: 'LineChart' as IconName,
  TrendingUp: 'TrendingUp' as IconName,
  TrendingDown: 'TrendingDown' as IconName,
  Activity: 'Activity' as IconName,
  
  // Calendar & Schedule
  Calendar: 'Calendar' as IconName,
  Clock: 'Clock' as IconName,
  CalendarDays: 'CalendarDays' as IconName,
  
  // Navigation
  Home: 'Home' as IconName,
  Dashboard: 'LayoutDashboard' as IconName,
  Menu: 'Menu' as IconName,
  ChevronLeft: 'ChevronLeft' as IconName,
  ChevronRight: 'ChevronRight' as IconName,
  ChevronDown: 'ChevronDown' as IconName,
  ChevronUp: 'ChevronUp' as IconName,
  
  // Actions
  Plus: 'Plus' as IconName,
  Minus: 'Minus' as IconName,
  Edit: 'Edit' as IconName,
  Trash: 'Trash2' as IconName,
  Save: 'Save' as IconName,
  Download: 'Download' as IconName,
  Upload: 'Upload' as IconName,
  Share: 'Share2' as IconName,
  
  // Status & Feedback
  Check: 'Check' as IconName,
  X: 'X' as IconName,
  Info: 'Info' as IconName,
  AlertCircle: 'AlertCircle' as IconName,
  AlertTriangle: 'AlertTriangle' as IconName,
  CheckCircle: 'CheckCircle' as IconName,
  XCircle: 'XCircle' as IconName,
  
  // Settings & Config
  Settings: 'Settings' as IconName,
  Sliders: 'Sliders' as IconName,
  Filter: 'Filter' as IconName,
  Search: 'Search' as IconName,
  
  // Communication
  Bell: 'Bell' as IconName,
  Mail: 'Mail' as IconName,
  MessageSquare: 'MessageSquare' as IconName,
  Phone: 'Phone' as IconName,
  
  // Security
  Lock: 'Lock' as IconName,
  Unlock: 'Unlock' as IconName,
  Shield: 'Shield' as IconName,
  Key: 'Key' as IconName,
  
  // Money & Payments
  CreditCard: 'CreditCard' as IconName,
  DollarSign: 'DollarSign' as IconName,
  Receipt: 'Receipt' as IconName,
  
  // Files & Documents
  File: 'File' as IconName,
  FileText: 'FileText' as IconName,
  Folder: 'Folder' as IconName,
  Clipboard: 'Clipboard' as IconName,
  
  // Misc
  LogOut: 'LogOut' as IconName,
  LogIn: 'LogIn' as IconName,
  Eye: 'Eye' as IconName,
  EyeOff: 'EyeOff' as IconName,
  MoreVertical: 'MoreVertical' as IconName,
  MoreHorizontal: 'MoreHorizontal' as IconName,
}