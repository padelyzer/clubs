#!/usr/bin/env tsx

/**
 * Scheduled Timezone Health Check
 * 
 * This script should be run periodically (e.g., daily via cron) to ensure
 * timezone integrity across the system. It can be added to crontab like:
 * 
 * # Daily timezone health check at 3 AM
 * 0 3 * * * cd /path/to/project && npx tsx scripts/scheduled-timezone-check.ts
 * 
 * Or configured in your deployment platform's scheduler
 */

import { TimezoneValidator } from '../lib/validation/timezone-validator'
import { prisma } from '../lib/config/prisma'

const LOG_PREFIX = '[TIMEZONE-CHECK]'

async function scheduledTimezoneHealthCheck() {
  const startTime = Date.now()
  console.log(`${LOG_PREFIX} Starting scheduled timezone health check...`)
  
  try {
    // Run comprehensive validation
    const validation = await TimezoneValidator.validateCompleteSystem()
    
    const duration = Date.now() - startTime
    const status = validation.success ? 'HEALTHY' : 'UNHEALTHY'
    
    console.log(`${LOG_PREFIX} Validation completed in ${duration}ms - Status: ${status}`)
    
    // Log key metrics
    console.log(`${LOG_PREFIX} Metrics:`)
    console.log(`  - Total clubs: ${validation.summary.totalClubs}`)
    console.log(`  - Clubs with timezone: ${validation.summary.clubsWithTimezone}`)
    console.log(`  - Clubs without timezone: ${validation.summary.clubsWithoutTimezone}`)
    console.log(`  - Invalid timezones: ${validation.summary.invalidTimezones}`)
    console.log(`  - Validation errors: ${validation.summary.validationErrors.length}`)
    
    // Auto-fix minor issues
    if (!validation.success && validation.summary.clubsWithoutTimezone > 0) {
      console.log(`${LOG_PREFIX} Auto-fixing ${validation.summary.clubsWithoutTimezone} clubs without timezone...`)
      
      const fixResult = await TimezoneValidator.fixClubsWithoutTimezone()
      console.log(`${LOG_PREFIX} Auto-fix results: Fixed ${fixResult.fixed} clubs, ${fixResult.errors.length} errors`)
      
      if (fixResult.errors.length > 0) {
        console.error(`${LOG_PREFIX} Auto-fix errors:`)
        fixResult.errors.forEach(error => console.error(`  - ${error}`))
      }
    }
    
    // Critical alerts for serious issues
    if (validation.summary.validationErrors.length > 0) {
      console.error(`${LOG_PREFIX} CRITICAL ALERTS:`)
      validation.summary.validationErrors.forEach(error => {
        console.error(`  🚨 ${error}`)
      })
    }
    
    // System test failures
    const systemTests = validation.details.systemTests
    const failedTests = Object.entries(systemTests).filter(([_, passed]) => !passed)
    
    if (failedTests.length > 0) {
      console.error(`${LOG_PREFIX} SYSTEM TEST FAILURES:`)
      failedTests.forEach(([test, _]) => {
        console.error(`  🚨 ${test} failed`)
      })
    }
    
    // Success confirmation
    if (validation.success) {
      console.log(`${LOG_PREFIX} ✅ All timezone systems operating normally`)
    } else {
      console.error(`${LOG_PREFIX} ❌ Timezone system requires attention`)
      process.exit(1) // Exit with error for monitoring systems
    }
    
    // Additional future-readiness check
    console.log(`${LOG_PREFIX} Testing future club scenarios...`)
    const futureTestScenarios = [
      { city: 'Guadalajara', state: 'Jalisco', country: 'México' },
      { city: 'Monterrey', state: 'Nuevo León', country: 'México' },
      { city: 'Bogotá', state: '', country: 'Colombia' }
    ]
    
    const { getSmartDefaultTimezone } = await import('../lib/utils/timezone-detection')
    const { validateTimezone } = await import('../lib/utils/timezone-detection')
    
    let futureTestsPassed = 0
    for (const scenario of futureTestScenarios) {
      try {
        const timezone = getSmartDefaultTimezone(scenario)
        if (validateTimezone(timezone)) {
          futureTestsPassed++
        }
      } catch (error) {
        console.error(`${LOG_PREFIX} Future test failed for ${scenario.city}: ${error.message}`)
      }
    }
    
    console.log(`${LOG_PREFIX} Future readiness: ${futureTestsPassed}/${futureTestScenarios.length} tests passed`)
    
  } catch (error) {
    console.error(`${LOG_PREFIX} Health check failed:`, error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    const totalDuration = Date.now() - startTime
    console.log(`${LOG_PREFIX} Health check completed in ${totalDuration}ms`)
  }
}

// Run the health check
scheduledTimezoneHealthCheck()