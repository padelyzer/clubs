import { SUPPORTED_TIMEZONES } from './timezone'

/**
 * Detecta el timezone más probable basado en la ciudad del club
 */
export function detectTimezoneFromLocation(city: string, state?: string, country?: string): string {
  const location = `${city} ${state || ''} ${country || ''}`.toLowerCase()
  
  // México - diferentes zonas horarias por región
  if (country?.toLowerCase().includes('mexico') || country?.toLowerCase().includes('méxico')) {
    // Zona del Pacífico (Tijuana, Mexicali)
    if (location.includes('tijuana') || location.includes('mexicali') || location.includes('baja california')) {
      return 'America/Tijuana'
    }
    
    // Zona de Sonora (Hermosillo, no cambia por horario de verano)
    if (location.includes('hermosillo') || location.includes('sonora')) {
      return 'America/Hermosillo'
    }
    
    // Zona del Pacífico Mexicano (Mazatlán, La Paz)
    if (location.includes('mazatlan') || location.includes('mazatlán') || 
        location.includes('la paz') || location.includes('culiacán') || 
        location.includes('sinaloa') || location.includes('nayarit')) {
      return 'America/Mazatlan'
    }
    
    // Zona Montaña Mexicana (Chihuahua)
    if (location.includes('chihuahua') || location.includes('ciudad juárez') || 
        location.includes('juarez')) {
      return 'America/Chihuahua'
    }
    
    // Zona del Sureste (Cancún, Quintana Roo)
    if (location.includes('cancun') || location.includes('cancún') || 
        location.includes('quintana roo') || location.includes('cozumel') || 
        location.includes('playa del carmen')) {
      return 'America/Cancun'
    }
    
    // Por defecto: Ciudad de México (Centro de México)
    return 'America/Mexico_City'
  }
  
  // Argentina
  if (country?.toLowerCase().includes('argentina')) {
    return 'America/Buenos_Aires'
  }
  
  // Chile
  if (country?.toLowerCase().includes('chile')) {
    return 'America/Santiago'
  }
  
  // Perú
  if (country?.toLowerCase().includes('peru') || country?.toLowerCase().includes('perú')) {
    return 'America/Lima'
  }
  
  // Colombia
  if (country?.toLowerCase().includes('colombia')) {
    return 'America/Bogota'
  }
  
  // Venezuela
  if (country?.toLowerCase().includes('venezuela')) {
    return 'America/Caracas'
  }
  
  // Brasil
  if (country?.toLowerCase().includes('brasil') || country?.toLowerCase().includes('brazil')) {
    return 'America/Sao_Paulo'
  }
  
  // España
  if (country?.toLowerCase().includes('españa') || country?.toLowerCase().includes('spain')) {
    return 'Europe/Madrid'
  }
  
  // Por defecto: Ciudad de México
  return 'America/Mexico_City'
}

/**
 * Valida que un timezone sea soportado por la aplicación
 */
export function validateTimezone(timezone: string): boolean {
  return SUPPORTED_TIMEZONES.some(tz => tz.value === timezone)
}

/**
 * Obtiene información legible del timezone
 */
export function getTimezoneInfo(timezone: string) {
  return SUPPORTED_TIMEZONES.find(tz => tz.value === timezone) || {
    value: timezone,
    label: timezone,
    offset: 'UTC'
  }
}

/**
 * Detecta timezone inteligente para un nuevo club
 */
export function getSmartDefaultTimezone(clubData: {
  city: string
  state?: string
  country?: string
}): string {
  const detected = detectTimezoneFromLocation(clubData.city, clubData.state, clubData.country)
  
  // Validar que el timezone detectado sea soportado
  if (validateTimezone(detected)) {
    return detected
  }
  
  // Fallback a México Central
  return 'America/Mexico_City'
}