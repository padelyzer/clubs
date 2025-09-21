import { prisma } from '@/lib/config/prisma'
import { NextRequest } from 'next/server'

interface AuditLogData {
  userId?: string | null
  action: string
  entityType: string
  entityId: string
  metadata?: any
  success?: boolean
  errorMessage?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  request: NextRequest,
  data: AuditLogData
) {
  try {
    const ipAddress = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'
    
    await prisma.auditLog.create({
      data: {
        ...data,
        ipAddress,
        userAgent,
        success: data.success ?? true,
      }
    })
  } catch (error) {
    // Log to console but don't fail the main operation
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Log successful action
 */
export async function auditSuccess(
  request: NextRequest,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: any,
  userId?: string | null
) {
  return createAuditLog(request, {
    userId,
    action,
    entityType,
    entityId,
    metadata,
    success: true,
  })
}

/**
 * Log failed action
 */
export async function auditFailure(
  request: NextRequest,
  action: string,
  entityType: string,
  entityId: string,
  errorMessage: string,
  metadata?: any,
  userId?: string | null
) {
  return createAuditLog(request, {
    userId,
    action,
    entityType,
    entityId,
    metadata,
    success: false,
    errorMessage,
  })
}

/**
 * Standard audit actions
 */
export const AuditActions = {
  // Club actions
  CLUB_CREATED: 'club.created',
  CLUB_APPROVED: 'club.approved',
  CLUB_REJECTED: 'club.rejected',
  CLUB_SUSPENDED: 'club.suspended',
  CLUB_REACTIVATED: 'club.reactivated',
  CLUB_UPDATED: 'club.updated',
  CLUB_DELETED: 'club.deleted',
  
  // User actions
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_SUSPENDED: 'user.suspended',
  USER_ACTIVATED: 'user.activated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PASSWORD_RESET: 'user.password_reset',
  
  // Subscription actions
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_REACTIVATED: 'subscription.reactivated',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription.payment_failed',
  
  // Invoice actions
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_FAILED: 'invoice.failed',
  INVOICE_REFUNDED: 'invoice.refunded',
  
  // Admin actions
  ADMIN_EXPORT_DATA: 'admin.export_data',
  ADMIN_IMPERSONATE: 'admin.impersonate',
  ADMIN_SETTINGS_UPDATED: 'admin.settings_updated',
  ADMIN_PLAN_CREATED: 'admin.plan_created',
  ADMIN_PLAN_UPDATED: 'admin.plan_updated',
  ADMIN_PLAN_DELETED: 'admin.plan_deleted',
  
  // Support actions
  SUPPORT_TICKET_CREATED: 'support.ticket_created',
  SUPPORT_TICKET_UPDATED: 'support.ticket_updated',
  SUPPORT_TICKET_RESOLVED: 'support.ticket_resolved',
  SUPPORT_MESSAGE_SENT: 'support.message_sent',
} as const

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string
  entityType?: string
  entityId?: string
  action?: string
  startDate?: Date
  endDate?: Date
  success?: boolean
  page?: number
  limit?: number
}) {
  const { page = 1, limit = 50, ...where } = filters
  
  const whereClause: any = {}
  
  if (where.userId) whereClause.userId = where.userId
  if (where.entityType) whereClause.entityType = where.entityType
  if (where.entityId) whereClause.entityId = where.entityId
  if (where.action) whereClause.action = where.action
  if (where.success !== undefined) whereClause.success = where.success
  
  if (where.startDate || where.endDate) {
    whereClause.createdAt = {}
    if (where.startDate) whereClause.createdAt.gte = where.startDate
    if (where.endDate) whereClause.createdAt.lte = where.endDate
  }
  
  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where: whereClause }),
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
  ])
  
  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }
}