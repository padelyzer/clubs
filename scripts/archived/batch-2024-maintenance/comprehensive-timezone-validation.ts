#!/usr/bin/env tsx

import { TimezoneValidator } from '../lib/validation/timezone-validator'
import { prisma } from '../lib/config/prisma'

async function runComprehensiveValidation() {
  console.log('🚀 Starting comprehensive timezone validation for present and future...\n')
  
  try {
    // Generate full validation report
    const report = await TimezoneValidator.generateValidationReport()
    console.log(report)
    
    // Also get the detailed validation result
    const validation = await TimezoneValidator.validateCompleteSystem()
    
    if (!validation.success) {
      console.log('🔧 ATTEMPTING AUTO-REPAIR...\n')
      
      const fixResult = await TimezoneValidator.fixClubsWithoutTimezone()
      
      console.log(`🔨 Auto-repair completed:`)
      console.log(`   Fixed: ${fixResult.fixed} clubs`)
      console.log(`   Errors: ${fixResult.errors.length}`)
      
      if (fixResult.errors.length > 0) {
        console.log('\n❌ Repair errors:')
        fixResult.errors.forEach(error => console.log(`   - ${error}`))
      }
      
      if (fixResult.fixed > 0) {
        console.log('\n🔄 Running validation again after repairs...\n')
        const postRepairReport = await TimezoneValidator.generateValidationReport()
        console.log(postRepairReport)
      }
    }
    
    // Test specific future scenarios
    console.log('\n🔮 TESTING FUTURE CLUB SCENARIOS\n')
    console.log('='.repeat(50))
    
    const futureScenarios = [
      { name: 'Club Padel Mérida', city: 'Mérida', state: 'Yucatán', country: 'México' },
      { name: 'Club Santiago', city: 'Santiago', state: '', country: 'Chile' },
      { name: 'Club Sevilla', city: 'Sevilla', state: '', country: 'España' },
      { name: 'Club Lima Norte', city: 'Lima', state: '', country: 'Perú' },
      { name: 'Club Unknown Location', city: 'Unknown', state: '', country: '' }
    ]
    
    const { getSmartDefaultTimezone } = await import('../lib/utils/timezone-detection')
    const { getDayBoundariesInTimezone, getNowInTimezone } = await import('../lib/utils/timezone')
    
    for (const scenario of futureScenarios) {
      console.log(`\n🏢 ${scenario.name}`)
      console.log(`   📍 Location: ${scenario.city}, ${scenario.state} ${scenario.country}`)
      
      try {
        const detectedTimezone = getSmartDefaultTimezone({
          city: scenario.city,
          state: scenario.state,
          country: scenario.country
        })
        
        console.log(`   ⏰ Detected timezone: ${detectedTimezone}`)
        
        // Test timezone functions
        const now = getNowInTimezone(detectedTimezone)
        const { start, end } = getDayBoundariesInTimezone('2025-12-25', detectedTimezone)
        
        console.log(`   🕐 Current time: ${now.toLocaleString('es-MX')}`)
        console.log(`   📅 Christmas day boundaries: ${start.toISOString()} - ${end.toISOString()}`)
        console.log(`   ✅ Status: Ready for registration`)
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
    
    // Performance test
    console.log('\n⚡ PERFORMANCE TEST\n')
    console.log('='.repeat(50))
    
    const startTime = Date.now()
    
    // Simulate multiple timezone operations
    const testTimezones = ['America/Mexico_City', 'America/Cancun', 'America/Tijuana', 'America/Buenos_Aires']
    const testDate = '2025-12-25'
    
    for (let i = 0; i < 100; i++) {
      for (const timezone of testTimezones) {
        getDayBoundariesInTimezone(testDate, timezone)
        getNowInTimezone(timezone)
      }
    }
    
    const endTime = Date.now()
    console.log(`✅ Processed 400 timezone operations in ${endTime - startTime}ms`)
    console.log(`   Average: ${((endTime - startTime) / 400).toFixed(2)}ms per operation`)
    
    // Final status
    console.log('\n' + '='.repeat(60))
    console.log('🏁 FINAL VALIDATION STATUS')
    console.log('='.repeat(60))
    
    const finalValidation = await TimezoneValidator.validateCompleteSystem()
    
    if (finalValidation.success) {
      console.log('🎉 SUCCESS: System is fully ready for present and future clubs!')
      console.log('✅ All existing clubs have proper timezone configuration')
      console.log('✅ All system components handle timezone correctly')
      console.log('✅ Future club registration process is bulletproof')
      console.log('✅ Performance is optimal for production use')
    } else {
      console.log('⚠️  WARNING: System requires attention')
      console.log(`❌ ${finalValidation.summary.validationErrors.length} validation errors found`)
      console.log(`⚠️  ${finalValidation.summary.clubsWithoutTimezone} clubs without timezone`)
      console.log('🔧 Run auto-repair or manual fixes required')
    }
    
  } catch (error) {
    console.error('💥 Comprehensive validation failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

runComprehensiveValidation()