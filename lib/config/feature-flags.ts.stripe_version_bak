/**
 * Feature Flags Configuration
 * 
 * This module provides a simple feature flag system for controlling
 * feature rollouts and A/B testing in the Padelyzer application.
 */

export interface FeatureFlag {
  enabled: boolean
  description: string
  rolloutPercentage?: number
  enabledFor?: string[] // User IDs or club IDs
  environments?: ('development' | 'staging' | 'production')[]
}

export interface FeatureFlags {
  // Authentication & Security
  ENHANCED_2FA: FeatureFlag
  PASSWORDLESS_LOGIN: FeatureFlag
  
  // Booking System
  REAL_TIME_BOOKING: FeatureFlag
  BOOKING_WAITLIST: FeatureFlag
  RECURRING_BOOKINGS: FeatureFlag
  
  // Payments
  STRIPE_PAYMENTS: FeatureFlag
  MERCADO_PAGO: FeatureFlag
  SPLIT_PAYMENTS: FeatureFlag
  
  // Analytics & Reporting
  ADVANCED_ANALYTICS: FeatureFlag
  EXPORT_REPORTS: FeatureFlag
  REAL_TIME_DASHBOARD: FeatureFlag
  
  // Communication
  WHATSAPP_NOTIFICATIONS: FeatureFlag
  EMAIL_CAMPAIGNS: FeatureFlag
  SMS_REMINDERS: FeatureFlag
  
  // Club Management
  MULTI_LOCATION: FeatureFlag
  STAFF_MANAGEMENT: FeatureFlag
  EQUIPMENT_TRACKING: FeatureFlag
  
  // User Experience
  DARK_MODE: FeatureFlag
  MOBILE_APP_PROMOTION: FeatureFlag
  ONBOARDING_FLOW_V2: FeatureFlag
}

// Feature flags configuration
export const FEATURE_FLAGS: FeatureFlags = {
  // Authentication & Security
  ENHANCED_2FA: {
    enabled: false,
    description: 'Enhanced two-factor authentication with multiple options',
    environments: ['staging', 'production']
  },
  
  PASSWORDLESS_LOGIN: {
    enabled: false,
    description: 'Magic link and OTP-based passwordless authentication',
    rolloutPercentage: 10,
    environments: ['development', 'staging']
  },
  
  // Booking System
  REAL_TIME_BOOKING: {
    enabled: true,
    description: 'Real-time booking updates using WebSockets',
    environments: ['development', 'staging', 'production']
  },
  
  BOOKING_WAITLIST: {
    enabled: false,
    description: 'Waitlist functionality for fully booked time slots',
    rolloutPercentage: 25,
    environments: ['staging']
  },
  
  RECURRING_BOOKINGS: {
    enabled: false,
    description: 'Allow users to create recurring weekly/monthly bookings',
    environments: ['development']
  },
  
  // Payments
  STRIPE_PAYMENTS: {
    enabled: true,
    description: 'Stripe payment integration for online payments',
    environments: ['development', 'staging', 'production']
  },
  
  MERCADO_PAGO: {
    enabled: false,
    description: 'MercadoPago integration for Latin American payments',
    environments: ['staging']
  },
  
  SPLIT_PAYMENTS: {
    enabled: false,
    description: 'Allow players to split payment costs',
    rolloutPercentage: 20
  },
  
  // Analytics & Reporting
  ADVANCED_ANALYTICS: {
    enabled: false,
    description: 'Advanced analytics dashboard with custom metrics',
    enabledFor: ['super_admin'],
    environments: ['development', 'staging']
  },
  
  EXPORT_REPORTS: {
    enabled: true,
    description: 'Export booking and financial reports',
    environments: ['development', 'staging', 'production']
  },
  
  REAL_TIME_DASHBOARD: {
    enabled: false,
    description: 'Real-time dashboard updates',
    rolloutPercentage: 30
  },
  
  // Communication
  WHATSAPP_NOTIFICATIONS: {
    enabled: true,
    description: 'WhatsApp notifications for booking confirmations',
    environments: ['development', 'staging', 'production']
  },
  
  EMAIL_CAMPAIGNS: {
    enabled: false,
    description: 'Email marketing campaigns for clubs',
    environments: ['staging']
  },
  
  SMS_REMINDERS: {
    enabled: false,
    description: 'SMS reminders for upcoming bookings',
    rolloutPercentage: 15
  },
  
  // Club Management
  MULTI_LOCATION: {
    enabled: false,
    description: 'Support for clubs with multiple locations',
    environments: ['development']
  },
  
  STAFF_MANAGEMENT: {
    enabled: false,
    description: 'Staff scheduling and management features',
    environments: ['development']
  },
  
  EQUIPMENT_TRACKING: {
    enabled: false,
    description: 'Track padel equipment and maintenance',
    rolloutPercentage: 5
  },
  
  // User Experience
  DARK_MODE: {
    enabled: true,
    description: 'Dark mode theme option',
    environments: ['development', 'staging', 'production']
  },
  
  MOBILE_APP_PROMOTION: {
    enabled: false,
    description: 'Promote mobile app download to users',
    rolloutPercentage: 50
  },
  
  ONBOARDING_FLOW_V2: {
    enabled: false,
    description: 'New onboarding flow with interactive tutorial',
    rolloutPercentage: 30,
    environments: ['staging']
  }
}

/**
 * Check if a feature is enabled for the current context
 */
export function isFeatureEnabled(
  flagName: keyof FeatureFlags,
  context?: {
    userId?: string
    clubId?: string
    environment?: string
    userRole?: string
  }
): boolean {
  const flag = FEATURE_FLAGS[flagName]
  
  if (!flag.enabled) {
    return false
  }
  
  // Check environment restriction
  if (flag.environments && context?.environment) {
    if (!flag.environments.includes(context.environment as any)) {
      return false
    }
  }
  
  // Check if enabled for specific users/clubs
  if (flag.enabledFor && (context?.userId || context?.clubId)) {
    const identifier = context.userId || context.clubId
    if (identifier && !flag.enabledFor.includes(identifier)) {
      return false
    }
  }
  
  // Check rollout percentage
  if (flag.rolloutPercentage && context?.userId) {
    const hash = simpleHash(context.userId)
    const userPercentile = hash % 100
    return userPercentile < flag.rolloutPercentage
  }
  
  return true
}

/**
 * Get all enabled features for the current context
 */
export function getEnabledFeatures(context?: {
  userId?: string
  clubId?: string
  environment?: string
  userRole?: string
}): (keyof FeatureFlags)[] {
  return Object.keys(FEATURE_FLAGS).filter(flagName =>
    isFeatureEnabled(flagName as keyof FeatureFlags, context)
  ) as (keyof FeatureFlags)[]
}

/**
 * Simple hash function for consistent user-based rollouts
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Feature flag hook for React components
 */
export function useFeatureFlag(flagName: keyof FeatureFlags) {
  // In a real implementation, this would use React context
  // to get user information and check the feature flag
  const environment = process.env.NODE_ENV || 'development'
  
  return isFeatureEnabled(flagName, { environment })
}

/**
 * Higher-order component for feature-gated components
 */
export function withFeatureFlag<P extends object>(
  flagName: keyof FeatureFlags,
  WrappedComponent: any,
  FallbackComponent?: any
) {
  return function FeatureGatedComponent(props: P) {
    const environment = process.env.NODE_ENV || 'development'
    const isEnabled = isFeatureEnabled(flagName, { environment })
    
    if (!isEnabled) {
      return FallbackComponent ? FallbackComponent(props) : null
    }
    
    return WrappedComponent(props)
  }
}

/**
 * Utility to get feature flag status for admin dashboard
 */
export function getFeatureFlagStatus() {
  const environment = process.env.NODE_ENV || 'development'
  
  return Object.entries(FEATURE_FLAGS).map(([name, flag]) => ({
    name,
    enabled: flag.enabled,
    description: flag.description,
    rolloutPercentage: flag.rolloutPercentage,
    environments: flag.environments,
    enabledFor: flag.enabledFor,
    currentlyActive: isFeatureEnabled(name as keyof FeatureFlags, { environment })
  }))
}