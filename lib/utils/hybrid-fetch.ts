// Utility for making API calls with hybrid authentication
import { getSession } from '@/lib/auth/hybrid-session'

export interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

// Enhanced fetch that automatically includes session authentication
export async function hybridFetch(url: string, options: FetchOptions = {}) {
  const sessionData = getSession()
  
  console.log('[HybridFetch] Session data:', sessionData)
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // Add session to Authorization header if available
  if (sessionData) {
    const authValue = `Bearer ${encodeURIComponent(JSON.stringify(sessionData))}`
    headers['Authorization'] = authValue
    console.log('[HybridFetch] Authorization header set, length:', authValue.length)
  } else {
    console.warn('[HybridFetch] No session data available for request to:', url)
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  // Handle unauthorized responses
  if (response.status === 401) {
    console.error('[HybridFetch] Received 401 Unauthorized response')
    // For now, don't auto-redirect to debug the issue
    // TODO: Re-enable after fixing authentication
    /*
    const { clearSession } = await import('@/lib/auth/hybrid-session')
    clearSession()
    window.location.href = '/login'
    */
    // Don't throw here, let apiCall handle the error response
  }
  
  return response
}

// Convenience wrapper for JSON API calls
export async function apiCall<T = any>(
  url: string, 
  options: FetchOptions = {}
): Promise<{ data?: T; error?: string; ok: boolean }> {
  try {
    const response = await hybridFetch(url, options)
    const data = await response.json()
    
    if (!response.ok) {
      // Handle different error response formats
      let errorMessage = `Error ${response.status}`
      
      if (data.error) {
        // If error is a string, use it directly
        if (typeof data.error === 'string') {
          errorMessage = data.error
        }
        // If error is an object with a message property
        else if (data.error.message) {
          errorMessage = data.error.message
        }
      } else if (data.message) {
        // If the response has a message property directly
        errorMessage = data.message
      }
      
      return { 
        error: errorMessage,
        ok: false 
      }
    }
    
    return { data, ok: true }
  } catch (error) {
    console.error('API call error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Network error',
      ok: false 
    }
  }
}