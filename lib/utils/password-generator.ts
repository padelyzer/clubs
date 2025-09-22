import crypto from 'crypto'

/**
 * Generate a secure password that meets requirements:
 * - At least 8 characters
 * - Contains uppercase, lowercase, numbers, and special characters
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specials = '!@#$%^&*'
  
  const allChars = uppercase + lowercase + numbers + specials
  
  // Ensure at least one character from each set
  let password = [
    uppercase[crypto.randomInt(0, uppercase.length)],
    lowercase[crypto.randomInt(0, lowercase.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    specials[crypto.randomInt(0, specials.length)]
  ]
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password.push(allChars[crypto.randomInt(0, allChars.length)])
  }
  
  // Shuffle the password
  return password
    .sort(() => crypto.randomInt(-1, 2))
    .join('')
}

/**
 * Get password from environment or generate a secure one
 * Logs the password in development for convenience
 */
export function getTestPassword(envVar?: string, context?: string): string {
  // Check environment variable first
  if (envVar && process.env[envVar]) {
    return process.env[envVar]
  }
  
  // Generate secure password
  const password = generateSecurePassword()
  
  // In development, log the password for convenience
  if (process.env.NODE_ENV === 'development') {
    console.log(`
🔐 Generated password${context ? ` for ${context}` : ''}:
   Password: ${password}
   
   To use a fixed password, set environment variable:
   ${envVar || 'TEST_PASSWORD'}="${password}"
`)
  }
  
  return password
}

/**
 * Validate if a password meets security requirements
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}