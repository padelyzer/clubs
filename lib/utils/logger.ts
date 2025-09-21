/**
 * Professional logging service for Padelyzer
 * Replaces console.log with structured logging
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  metadata?: Record<string, any>
  userId?: string
  clubId?: string
  requestId?: string
}

class Logger {
  private level: LogLevel
  private context: string

  constructor(context = 'App', level = LogLevel.INFO) {
    this.context = context
    this.level = process.env.NODE_ENV === 'production' ? LogLevel.WARN : level
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      metadata,
    }
  }

  private formatLog(entry: LogEntry): string {
    const levelName = LogLevel[entry.level]
    const metadataStr = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : ''
    return `[${entry.timestamp}] ${levelName} [${entry.context}] ${entry.message}${metadataStr}`
  }

  private output(entry: LogEntry): void {
    const formatted = this.formatLog(entry)
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.DEBUG:
        console.debug(formatted)
        break
    }

    // In production, you would send logs to a service like:
    // - Vercel's logging
    // - Datadog
    // - LogRocket
    // - New Relic
    // - Custom logging endpoint
    if (process.env.NODE_ENV === 'production' && entry.level <= LogLevel.WARN) {
      this.sendToLogService(entry)
    }
  }

  private async sendToLogService(entry: LogEntry): Promise<void> {
    // Implementation for external logging service
    // For now, we'll just store critical logs
    try {
      if (process.env.LOG_ENDPOINT) {
        await fetch(process.env.LOG_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LOG_API_KEY}`,
          },
          body: JSON.stringify(entry),
        })
      }
    } catch (error) {
      // Fallback to console if external logging fails
      console.error('Failed to send log to external service:', error)
    }
  }

  error(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, metadata)
      this.output(entry)
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, metadata)
      this.output(entry)
    }
  }

  info(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, metadata)
      this.output(entry)
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata)
      this.output(entry)
    }
  }

  // Specialized logging methods for common use cases
  auth(action: string, userId?: string, metadata?: Record<string, any>): void {
    this.info(`Auth: ${action}`, { userId, ...metadata })
  }

  payment(action: string, amount?: number, userId?: string, metadata?: Record<string, any>): void {
    this.info(`Payment: ${action}`, { amount, userId, ...metadata })
  }

  whatsapp(action: string, phoneNumber?: string, metadata?: Record<string, any>): void {
    // Mask phone number for privacy
    const maskedPhone = phoneNumber ? `${phoneNumber.slice(0, 3)}***${phoneNumber.slice(-4)}` : undefined
    this.info(`WhatsApp: ${action}`, { phoneNumber: maskedPhone, ...metadata })
  }

  booking(action: string, bookingId?: string, clubId?: string, metadata?: Record<string, any>): void {
    this.info(`Booking: ${action}`, { bookingId, clubId, ...metadata })
  }

  api(method: string, path: string, statusCode: number, duration?: number, metadata?: Record<string, any>): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    this.output(this.createLogEntry(level, `API: ${method} ${path} - ${statusCode}`, { 
      statusCode, 
      duration, 
      ...metadata 
    }))
  }

  stripe(action: string, eventType?: string, metadata?: Record<string, any>): void {
    this.info(`Stripe: ${action}`, { eventType, ...metadata })
  }

  admin(action: string, adminId?: string, targetId?: string, metadata?: Record<string, any>): void {
    this.info(`Admin: ${action}`, { adminId, targetId, ...metadata })
  }

  cron(job: string, metadata?: Record<string, any>): void {
    this.info(`Cron: ${job}`, metadata)
  }

  // Create child logger with specific context
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.level)
  }
}

// Create default logger instances for different parts of the application
export const logger = new Logger('App')
export const authLogger = new Logger('Auth')
export const paymentLogger = new Logger('Payment')
export const whatsappLogger = new Logger('WhatsApp')
export const bookingLogger = new Logger('Booking')
export const stripeLogger = new Logger('Stripe')
export const adminLogger = new Logger('Admin')
export const cronLogger = new Logger('Cron')
export const apiLogger = new Logger('API')

// Export the Logger class for creating custom loggers
export { Logger }

// Utility function to create request-scoped logger
export function createRequestLogger(requestId: string, userId?: string, clubId?: string): Logger {
  const logger = new Logger(`Request:${requestId}`)
  // Add request context to all logs from this logger
  const originalOutput = logger['output'].bind(logger)
  logger['output'] = (entry: LogEntry) => {
    entry.requestId = requestId
    if (userId) entry.userId = userId
    if (clubId) entry.clubId = clubId
    originalOutput(entry)
  }
  return logger
}