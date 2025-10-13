import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { TimezoneValidator } from '@/lib/validation/timezone-validator'

/**
 * Timezone Health Check API for production monitoring
 * GET /api/admin/system/timezone-health
 * 
 * This endpoint provides comprehensive timezone validation for monitoring systems
 * and can be used by external monitoring tools to ensure timezone integrity
 */
export async function GET(request: NextRequest) {
  try {
    // Require super admin for security (can be modified for monitoring systems)
    await requireSuperAdmin()
    
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // json, text, or report
    const autoFix = searchParams.get('autoFix') === 'true'
    
    console.log('🔍 Running timezone health check...')
    
    // Run comprehensive validation
    const validation = await TimezoneValidator.validateCompleteSystem()
    
    // Auto-fix if requested and there are issues
    let fixResult = null
    if (autoFix && !validation.success) {
      console.log('🔧 Auto-fixing timezone issues...')
      fixResult = await TimezoneValidator.fixClubsWithoutTimezone()
      
      // Re-validate after fixes
      if (fixResult.fixed > 0) {
        const revalidation = await TimezoneValidator.validateCompleteSystem()
        Object.assign(validation, revalidation)
      }
    }
    
    // Generate response based on format
    switch (format) {
      case 'text':
      case 'report':
        const report = await TimezoneValidator.generateValidationReport()
        return new NextResponse(report, {
          headers: { 'Content-Type': 'text/plain' }
        })
      
      case 'json':
      default:
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          validation,
          autoFix: autoFix ? fixResult : null,
          healthStatus: validation.success ? 'healthy' : 'unhealthy',
          monitoring: {
            // Key metrics for monitoring systems
            totalClubs: validation.summary.totalClubs,
            clubsWithTimezone: validation.summary.clubsWithTimezone,
            clubsWithoutTimezone: validation.summary.clubsWithoutTimezone,
            invalidTimezones: validation.summary.invalidTimezones,
            systemTestsPassing: Object.values(validation.details.systemTests).every(Boolean),
            validationErrors: validation.summary.validationErrors.length,
            
            // Health score (0-100)
            healthScore: calculateHealthScore(validation),
            
            // Status for each component
            components: {
              timezoneDetection: validation.details.systemTests.timezoneDetection ? 'operational' : 'degraded',
              dateFiltering: validation.details.systemTests.dateFiltering ? 'operational' : 'degraded', 
              utcConversion: validation.details.systemTests.utcConversion ? 'operational' : 'degraded',
              apiIntegration: validation.details.systemTests.apiIntegration ? 'operational' : 'degraded'
            }
          }
        })
    }
    
  } catch (error) {
    console.error('Timezone health check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Timezone health check failed',
      details: error.message,
      healthStatus: 'critical',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST - Fix timezone issues (manual repair trigger)
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    
    console.log('🔧 Manual timezone repair triggered...')
    
    const fixResult = await TimezoneValidator.fixClubsWithoutTimezone()
    
    // Re-validate after fixes
    const validation = await TimezoneValidator.validateCompleteSystem()
    
    return NextResponse.json({
      success: true,
      message: 'Timezone repair completed',
      repairResult: fixResult,
      postRepairValidation: validation,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Timezone repair failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Timezone repair failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Calculate health score (0-100) based on validation results
 */
function calculateHealthScore(validation: any): number {
  let score = 100
  
  // Deduct for clubs without timezone (major issue)
  if (validation.summary.clubsWithoutTimezone > 0) {
    const penalty = Math.min(50, validation.summary.clubsWithoutTimezone * 20)
    score -= penalty
  }
  
  // Deduct for invalid timezones (moderate issue)
  if (validation.summary.invalidTimezones > 0) {
    const penalty = Math.min(30, validation.summary.invalidTimezones * 15)
    score -= penalty
  }
  
  // Deduct for system test failures (critical)
  const systemTests = Object.values(validation.details.systemTests)
  const failedTests = systemTests.filter(test => !test).length
  if (failedTests > 0) {
    score -= failedTests * 20
  }
  
  // Deduct for validation errors
  if (validation.summary.validationErrors.length > 0) {
    const penalty = Math.min(20, validation.summary.validationErrors.length * 5)
    score -= penalty
  }
  
  return Math.max(0, score)
}