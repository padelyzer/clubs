// Sistema híbrido de sesiones: Cookies + localStorage respaldo
// Detecta automáticamente si las cookies funcionan y usa localStorage como fallback

export interface SessionData {
  sessionId: string
  userId: string
  email: string
  role: string
  clubId?: string | null
  expiresAt: number
}

const SESSION_KEY = 'padelyzer-session'
const COOKIE_TEST_KEY = 'padelyzer-cookie-test'

// Detectar si las cookies funcionan
export function canUseCookies(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Intentar establecer una cookie de prueba
    document.cookie = `${COOKIE_TEST_KEY}=test; path=/; max-age=60`
    const cookiesWork = document.cookie.includes(`${COOKIE_TEST_KEY}=test`)
    
    // Limpiar cookie de prueba
    if (cookiesWork) {
      document.cookie = `${COOKIE_TEST_KEY}=; path=/; max-age=0`
    }
    
    return cookiesWork
  } catch {
    return false
  }
}

// Guardar sesión usando el método disponible
export function saveSession(sessionData: SessionData) {
  if (typeof window === 'undefined') return
  
  console.log('[Session] Saving session data:', sessionData)
  const data = JSON.stringify(sessionData)
  
  // IMPORTANTE: Siempre guardar en localStorage como respaldo
  // Esto asegura que funcione incluso si las cookies están bloqueadas
  try {
    localStorage.setItem(SESSION_KEY, data)
    sessionStorage.setItem(SESSION_KEY, data)
    console.log('[Session] Saved to localStorage/sessionStorage')
  } catch (e) {
    console.error('[Session] Error saving to storage:', e)
  }
  
  // También intentar cookies si es posible
  if (canUseCookies()) {
    try {
      const maxAge = Math.floor((sessionData.expiresAt - Date.now()) / 1000)
      document.cookie = `${SESSION_KEY}=${encodeURIComponent(data)}; path=/; max-age=${maxAge}; samesite=lax`
      console.log('[Session] Also saved to cookies')
    } catch (e) {
      console.error('[Session] Error saving to cookies:', e)
    }
  }
}

// Obtener sesión del método disponible
export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null
  
  try {
    let data: string | null = null
    
    // Intentar obtener de cookies primero
    if (canUseCookies()) {
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_KEY}=`))
      if (sessionCookie) {
        data = decodeURIComponent(sessionCookie.split('=')[1])
      }
    }
    
    // Si no hay datos en cookies, intentar localStorage
    if (!data) {
      data = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    }
    
    if (!data) return null
    
    const session: SessionData = JSON.parse(data)
    
    // Verificar si la sesión no ha expirado
    if (session.expiresAt && Date.now() > session.expiresAt) {
      console.log('[Session] Session expired:', {
        expiresAt: new Date(session.expiresAt),
        now: new Date(),
        expired: true
      })
      clearSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('[Session] Error getting session:', error)
    clearSession()
    return null
  }
}

// Limpiar sesión de todos los métodos
export function clearSession() {
  if (typeof window === 'undefined') return
  
  // DEBUG: Ver qué está llamando a clearSession
  console.trace('[Session] clearSession called from:')
  
  // Limpiar cookie
  document.cookie = `${SESSION_KEY}=; path=/; max-age=0`
  
  // Limpiar localStorage
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  
  console.log('[Session] Cleared from all storage methods')
}

// Verificar si hay sesión válida
export function hasValidSession(): boolean {
  return getSession() !== null
}