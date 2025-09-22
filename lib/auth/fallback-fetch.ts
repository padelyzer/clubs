// Cliente fetch que automáticamente incluye el token de fallback
import { getFallbackToken } from './fallback-auth'

export async function fallbackFetch(url: string, options: RequestInit = {}) {
  const token = getFallbackToken()
  
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'x-fallback-token': token,
    }
  }
  
  return fetch(url, options)
}