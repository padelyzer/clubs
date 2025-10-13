import crypto from 'crypto'

/**
 * Configuration for password generation
 */
interface PasswordConfig {
  length?: number
  includeUppercase?: boolean
  includeLowercase?: boolean
  includeNumbers?: boolean
  includeSpecials?: boolean
  excludeAmbiguous?: boolean
}

/**
 * Secure password generator for seed files and development purposes
 * Follows security best practices with configurable options
 */
export class PasswordGenerator {
  private static readonly DEFAULT_LENGTH = 16
  private static readonly UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  private static readonly LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz'
  private static readonly NUMBER_CHARS = '0123456789'
  private static readonly SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  /**
   * Generate a secure password with specified configuration
   * @param config Password generation configuration
   * @returns Generated password string
   */
  static generate(config: PasswordConfig = {}): string {
    const {
      length = this.DEFAULT_LENGTH,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSpecials = false, // Default to false for better compatibility
      excludeAmbiguous = true
    } = config

    if (length < 8) {
      throw new Error('Password length must be at least 8 characters')
    }

    let charset = ''
    let requiredChars = ''

    // Build charset and ensure at least one character from each enabled type
    if (includeUppercase) {
      const chars = excludeAmbiguous 
        ? this.UPPERCASE_CHARS.replace(/[O0]/g, '') // Remove O and 0 lookalikes
        : this.UPPERCASE_CHARS
      charset += chars
      requiredChars += this.getRandomChar(chars)
    }

    if (includeLowercase) {
      const chars = excludeAmbiguous 
        ? this.LOWERCASE_CHARS.replace(/[l]/g, '') // Remove l and similar
        : this.LOWERCASE_CHARS
      charset += chars
      requiredChars += this.getRandomChar(chars)
    }

    if (includeNumbers) {
      const chars = excludeAmbiguous 
        ? this.NUMBER_CHARS.replace(/[01]/g, '') // Remove 0 and 1
        : this.NUMBER_CHARS
      charset += chars
      requiredChars += this.getRandomChar(chars)
    }

    if (includeSpecials) {
      charset += this.SPECIAL_CHARS
      requiredChars += this.getRandomChar(this.SPECIAL_CHARS)
    }

    if (charset.length === 0) {
      throw new Error('At least one character type must be enabled')
    }

    // Generate remaining characters
    const remainingLength = length - requiredChars.length
    let password = requiredChars

    for (let i = 0; i < remainingLength; i++) {
      password += this.getRandomChar(charset)
    }

    // Shuffle the password to avoid predictable patterns
    return this.shuffleString(password)
  }

  /**
   * Generate a development-friendly password (alphanumeric only)
   * @param length Password length (default: 16)
   * @returns Generated password string
   */
  static generateDevelopmentPassword(length: number = this.DEFAULT_LENGTH): string {
    return this.generate({
      length,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecials: false,
      excludeAmbiguous: true
    })
  }

  /**
   * Generate a highly secure password with special characters
   * @param length Password length (default: 20)
   * @returns Generated password string
   */
  static generateSecurePassword(length: number = 20): string {
    return this.generate({
      length,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecials: true,
      excludeAmbiguous: true
    })
  }

  /**
   * Get seed passwords from environment variables or generate new ones
   * @returns Object containing seed passwords
   */
  static getSeedPasswords() {
    return {
      admin: process.env.SEED_ADMIN_PASSWORD || this.generateDevelopmentPassword(12),
      owner: process.env.SEED_OWNER_PASSWORD || this.generateDevelopmentPassword(12),
      staff: process.env.SEED_STAFF_PASSWORD || this.generateDevelopmentPassword(12)
    }
  }

  /**
   * Get a cryptographically secure random character from charset
   * @param charset Character set to choose from
   * @returns Random character
   */
  private static getRandomChar(charset: string): string {
    const randomBytes = crypto.randomBytes(1)
    const randomIndex = randomBytes[0] % charset.length
    return charset[randomIndex]
  }

  /**
   * Shuffle a string using Fisher-Yates algorithm
   * @param str String to shuffle
   * @returns Shuffled string
   */
  private static shuffleString(str: string): string {
    const arr = str.split('')
    
    for (let i = arr.length - 1; i > 0; i--) {
      const randomBytes = crypto.randomBytes(1)
      const j = randomBytes[0] % (i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    
    return arr.join('')
  }

  /**
   * Validate password strength
   * @param password Password to validate
   * @returns Object with validation results
   */
  static validatePassword(password: string) {
    const checks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
      noSpaces: !/\s/.test(password)
    }

    const score = Object.values(checks).filter(Boolean).length
    const strength = score >= 5 ? 'strong' : score >= 3 ? 'medium' : 'weak'

    return {
      ...checks,
      score,
      strength,
      valid: checks.minLength && checks.hasUppercase && checks.hasLowercase && checks.hasNumber && checks.noSpaces
    }
  }
}

// Export default for easier imports
export default PasswordGenerator