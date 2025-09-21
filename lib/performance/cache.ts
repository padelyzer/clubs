import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Cache key prefixes
const CACHE_PREFIXES = {
  ADMIN_STATS: 'admin:stats',
  CLUB_DATA: 'club:data',
  USER_DATA: 'user:data',
  ANALYTICS: 'analytics',
  PLANS: 'plans',
  INVOICES: 'invoices',
} as const

// Cache TTL in seconds
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null
  
  try {
    const data = await redis.get(key)
    return data as T
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

/**
 * Set cached data with TTL
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return
  
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return
  
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

/**
 * Cache wrapper function - get from cache or fetch and cache
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = await getCachedData<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  const data = await fetcher()
  
  // Cache the result
  await setCachedData(key, data, ttl)
  
  return data
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidators = {
  // Invalidate all admin stats
  adminStats: () => invalidateCache(`${CACHE_PREFIXES.ADMIN_STATS}:*`),
  
  // Invalidate specific club data
  club: (clubId: string) => invalidateCache(`${CACHE_PREFIXES.CLUB_DATA}:${clubId}:*`),
  
  // Invalidate user data
  user: (userId: string) => invalidateCache(`${CACHE_PREFIXES.USER_DATA}:${userId}:*`),
  
  // Invalidate analytics
  analytics: () => invalidateCache(`${CACHE_PREFIXES.ANALYTICS}:*`),
  
  // Invalidate subscription plans
  plans: () => invalidateCache(`${CACHE_PREFIXES.PLANS}:*`),
  
  // Invalidate invoices
  invoices: () => invalidateCache(`${CACHE_PREFIXES.INVOICES}:*`),
}

/**
 * Build cache key with namespace
 */
export function buildCacheKey(prefix: keyof typeof CACHE_PREFIXES, ...parts: string[]): string {
  return `${CACHE_PREFIXES[prefix]}:${parts.join(':')}`
}

export { CACHE_TTL, CACHE_PREFIXES }