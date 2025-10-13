// Widget security utilities
import { NextRequest } from 'next/server'

// Simple in-memory rate limiting for demo
// In production, use Redis or similar
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimitWidget(request: NextRequest, limit = 10, windowMs = 60000) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean old entries
  for (const [key, data] of requestCounts.entries()) {
    if (data.resetTime < windowStart) {
      requestCounts.delete(key)
    }
  }
  
  const current = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs }
  
  if (current.resetTime < now) {
    // Reset window
    current.count = 1
    current.resetTime = now + windowMs
  } else {
    current.count++
  }
  
  requestCounts.set(ip, current)
  
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetTime: current.resetTime
  }
}

export function validateOrigin(request: NextRequest, allowedOrigins: string[] = []) {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Allow same-origin requests
  if (!origin && !referer) return true
  
  // Allow if no restrictions
  if (allowedOrigins.length === 0) return true
  
  // Check origin
  if (origin && allowedOrigins.includes(origin)) return true
  
  // Check referer domain
  if (referer) {
    try {
      const refererDomain = new URL(referer).origin
      if (allowedOrigins.includes(refererDomain)) return true
    } catch {
      // Invalid referer URL
    }
  }
  
  return false
}

export function sanitizeInput(input: string, maxLength = 100): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, '') // Basic XSS prevention
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic Mexican phone number validation
  const phoneRegex = /^[\d\s\-\(\)\+]{10,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateEmail(email: string): boolean {
  if (!email) return true // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}