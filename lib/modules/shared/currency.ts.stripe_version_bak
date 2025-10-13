// Unified currency handling utilities

export class CurrencyService {
  /**
   * Convert amount from pesos to cents (for database storage)
   */
  static toCents(amount: number): number {
    return Math.round(amount * 100)
  }

  /**
   * Convert amount from cents to pesos (for display)
   */
  static fromCents(cents: number): number {
    return cents / 100
  }

  /**
   * Format amount in cents to currency string
   */
  static formatCents(cents: number, currency: string = 'MXN'): string {
    const amount = CurrencyService.fromCents(cents)
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  /**
   * Parse currency string to cents
   * e.g., "$1,234.56" -> 123456
   */
  static parseToCents(value: string | number): number {
    if (typeof value === 'number') {
      return CurrencyService.toCents(value)
    }
    
    // Remove currency symbols and separators
    const cleanValue = value.replace(/[^0-9.-]/g, '')
    const amount = parseFloat(cleanValue) || 0
    return CurrencyService.toCents(amount)
  }

  /**
   * Validate if amount is valid for currency operations
   */
  static isValidAmount(amount: number): boolean {
    return !isNaN(amount) && isFinite(amount) && amount >= 0
  }
}