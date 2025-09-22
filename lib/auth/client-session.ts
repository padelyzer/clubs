'use client'

// Client-side session management as fallback when cookies don't work
export class ClientSession {
  private static SESSION_KEY = 'padelyzer-session-fallback'
  
  static saveSession(sessionData: any) {
    if (typeof window === 'undefined') return
    
    try {
      // Try localStorage first
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({
        ...sessionData,
        timestamp: Date.now()
      }))
      
      // Also try sessionStorage
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData))
      
      console.log('[ClientSession] Session saved to storage')
    } catch (err) {
      console.error('[ClientSession] Failed to save session:', err)
    }
  }
  
  static getSession() {
    if (typeof window === 'undefined') return null
    
    try {
      // Try localStorage first
      const stored = localStorage.getItem(this.SESSION_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        // Check if session is not too old (24 hours)
        if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data
        }
      }
      
      // Fallback to sessionStorage
      const sessionStored = sessionStorage.getItem(this.SESSION_KEY)
      if (sessionStored) {
        return JSON.parse(sessionStored)
      }
    } catch (err) {
      console.error('[ClientSession] Failed to get session:', err)
    }
    
    return null
  }
  
  static clearSession() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.SESSION_KEY)
      sessionStorage.removeItem(this.SESSION_KEY)
      console.log('[ClientSession] Session cleared')
    } catch (err) {
      console.error('[ClientSession] Failed to clear session:', err)
    }
  }
  
  static hasSession(): boolean {
    return !!this.getSession()
  }
}