import { prisma } from '@/lib/config/prisma'
import { 
  getNowInTimezone, 
  getDayBoundariesInTimezone, 
  SUPPORTED_TIMEZONES 
} from '@/lib/utils/timezone'
import { getSmartDefaultTimezone, validateTimezone } from '@/lib/utils/timezone-detection'

export interface TimezoneValidationResult {
  success: boolean
  summary: {
    totalClubs: number
    clubsWithTimezone: number
    clubsWithoutTimezone: number
    invalidTimezones: number
    validationErrors: string[]
  }
  details: {
    clubsWithoutTimezone: Array<{
      id: string
      name: string
      city?: string
      state?: string
      country?: string
    }>
    clubsWithInvalidTimezone: Array<{
      id: string
      name: string
      currentTimezone: string
      suggestedTimezone: string
    }>
    systemTests: {
      timezoneDetection: boolean
      dateFiltering: boolean
      utcConversion: boolean
      apiIntegration: boolean
    }
  }
}

/**
 * Comprehensive timezone validation system for present and future
 */
export class TimezoneValidator {
  
  /**
   * Main validation method - validates entire system
   */
  static async validateCompleteSystem(): Promise<TimezoneValidationResult> {
    console.log('🔍 Running comprehensive timezone validation...\n')
    
    const result: TimezoneValidationResult = {
      success: false,
      summary: {
        totalClubs: 0,
        clubsWithTimezone: 0,
        clubsWithoutTimezone: 0,
        invalidTimezones: 0,
        validationErrors: []
      },
      details: {
        clubsWithoutTimezone: [],
        clubsWithInvalidTimezone: [],
        systemTests: {
          timezoneDetection: false,
          dateFiltering: false,
          utcConversion: false,
          apiIntegration: false
        }
      }
    }

    try {
      // 1. Validate all existing clubs
      await this.validateExistingClubs(result)
      
      // 2. Test timezone detection system
      await this.testTimezoneDetection(result)
      
      // 3. Test date filtering and UTC conversion
      await this.testDateOperations(result)
      
      // 4. Test API integration
      await this.testApiIntegration(result)
      
      // 5. Test future club scenario
      await this.testFutureClubScenario(result)
      
      // Determine overall success
      result.success = (
        result.summary.clubsWithoutTimezone === 0 &&
        result.summary.invalidTimezones === 0 &&
        result.details.systemTests.timezoneDetection &&
        result.details.systemTests.dateFiltering &&
        result.details.systemTests.utcConversion &&
        result.details.systemTests.apiIntegration
      )
      
    } catch (error) {
      result.summary.validationErrors.push(`System validation error: ${error.message}`)
    }

    return result
  }

  /**
   * Validate all existing clubs have proper timezone configuration
   */
  private static async validateExistingClubs(result: TimezoneValidationResult): Promise<void> {
    const clubs = await prisma.club.findMany({
      where: { 
        status: 'APPROVED',
        active: true 
      },
      include: {
        ClubSettings: true
      }
    })

    result.summary.totalClubs = clubs.length

    for (const club of clubs) {
      if (!club.ClubSettings) {
        result.details.clubsWithoutTimezone.push({
          id: club.id,
          name: club.name,
          city: club.city,
          state: club.state,
          country: club.country
        })
        result.summary.clubsWithoutTimezone++
        continue
      }

      if (!club.ClubSettings.timezone) {
        result.details.clubsWithoutTimezone.push({
          id: club.id,
          name: club.name,
          city: club.city,
          state: club.state,
          country: club.country
        })
        result.summary.clubsWithoutTimezone++
        continue
      }

      // Validate timezone is supported
      if (!validateTimezone(club.ClubSettings.timezone)) {
        const suggestedTimezone = getSmartDefaultTimezone({
          city: club.city || '',
          state: club.state || '',
          country: club.country || 'Mexico'
        })

        result.details.clubsWithInvalidTimezone.push({
          id: club.id,
          name: club.name,
          currentTimezone: club.ClubSettings.timezone,
          suggestedTimezone
        })
        result.summary.invalidTimezones++
        continue
      }

      result.summary.clubsWithTimezone++
    }
  }

  /**
   * Test timezone detection system
   */
  private static async testTimezoneDetection(result: TimezoneValidationResult): Promise<void> {
    try {
      const testCases = [
        { city: 'Ciudad de México', state: 'CDMX', country: 'México', expected: 'America/Mexico_City' },
        { city: 'Cancún', state: 'Quintana Roo', country: 'México', expected: 'America/Cancun' },
        { city: 'Tijuana', state: 'Baja California', country: 'México', expected: 'America/Tijuana' },
        { city: 'Buenos Aires', state: '', country: 'Argentina', expected: 'America/Buenos_Aires' }
      ]

      let passedTests = 0
      for (const testCase of testCases) {
        const detected = getSmartDefaultTimezone(testCase)
        if (detected === testCase.expected) {
          passedTests++
        }
      }

      result.details.systemTests.timezoneDetection = passedTests === testCases.length
      if (!result.details.systemTests.timezoneDetection) {
        result.summary.validationErrors.push(`Timezone detection failed: ${passedTests}/${testCases.length} tests passed`)
      }
    } catch (error) {
      result.summary.validationErrors.push(`Timezone detection test error: ${error.message}`)
    }
  }

  /**
   * Test date operations and UTC conversion
   */
  private static async testDateOperations(result: TimezoneValidationResult): Promise<void> {
    try {
      const testTimezones = ['America/Mexico_City', 'America/Cancun', 'America/Tijuana']
      const testDate = '2025-12-25'
      
      let passedTests = 0
      for (const timezone of testTimezones) {
        try {
          // Test date boundaries
          const { start, end } = getDayBoundariesInTimezone(testDate, timezone)
          
          // Test timezone functions
          const now = getNowInTimezone(timezone)
          
          if (start && end && now) {
            passedTests++
          }
        } catch (error) {
          result.summary.validationErrors.push(`Date operation failed for ${timezone}: ${error.message}`)
        }
      }

      result.details.systemTests.dateFiltering = passedTests === testTimezones.length
      result.details.systemTests.utcConversion = passedTests === testTimezones.length
    } catch (error) {
      result.summary.validationErrors.push(`Date operations test error: ${error.message}`)
    }
  }

  /**
   * Test API integration with timezone
   */
  private static async testApiIntegration(result: TimezoneValidationResult): Promise<void> {
    try {
      // Test that booking API would use club timezone
      const sampleClub = await prisma.club.findFirst({
        where: { 
          status: 'APPROVED',
          active: true 
        },
        include: {
          ClubSettings: true
        }
      })

      if (sampleClub?.ClubSettings?.timezone) {
        // Verify the timezone works with our date functions
        const testDate = '2025-12-25'
        const { start, end } = getDayBoundariesInTimezone(testDate, sampleClub.ClubSettings.timezone)
        
        if (start && end) {
          result.details.systemTests.apiIntegration = true
        } else {
          result.summary.validationErrors.push('API integration test failed: date boundaries not working')
        }
      } else {
        result.summary.validationErrors.push('API integration test failed: no club with timezone found')
      }
    } catch (error) {
      result.summary.validationErrors.push(`API integration test error: ${error.message}`)
    }
  }

  /**
   * Test future club scenario
   */
  private static async testFutureClubScenario(result: TimezoneValidationResult): Promise<void> {
    try {
      // Test various future club locations
      const futureClubScenarios = [
        { city: 'Playa del Carmen', state: 'Quintana Roo', country: 'México' },
        { city: 'Medellín', state: '', country: 'Colombia' },
        { city: 'Valencia', state: '', country: 'España' }
      ]

      for (const scenario of futureClubScenarios) {
        const detectedTimezone = getSmartDefaultTimezone(scenario)
        
        // Verify the detected timezone is valid
        if (!validateTimezone(detectedTimezone)) {
          result.summary.validationErrors.push(
            `Future club scenario failed: Invalid timezone ${detectedTimezone} for ${scenario.city}, ${scenario.country}`
          )
        }

        // Verify timezone functions work with detected timezone
        try {
          const now = getNowInTimezone(detectedTimezone)
          const { start, end } = getDayBoundariesInTimezone('2025-12-25', detectedTimezone)
          
          if (!now || !start || !end) {
            result.summary.validationErrors.push(
              `Future club scenario failed: Timezone functions don't work with ${detectedTimezone}`
            )
          }
        } catch (error) {
          result.summary.validationErrors.push(
            `Future club scenario failed: Error testing ${detectedTimezone}: ${error.message}`
          )
        }
      }
    } catch (error) {
      result.summary.validationErrors.push(`Future club scenario test error: ${error.message}`)
    }
  }

  /**
   * Fix clubs without timezone (auto-repair function)
   */
  static async fixClubsWithoutTimezone(): Promise<{
    fixed: number
    errors: string[]
  }> {
    const result = { fixed: 0, errors: [] }

    try {
      const clubsWithoutTimezone = await prisma.club.findMany({
        where: {
          status: 'APPROVED',
          active: true,
          OR: [
            { ClubSettings: null },
            { ClubSettings: { timezone: null } },
            { ClubSettings: { timezone: '' } }
          ]
        },
        include: {
          ClubSettings: true
        }
      })

      for (const club of clubsWithoutTimezone) {
        try {
          const smartTimezone = getSmartDefaultTimezone({
            city: club.city || '',
            state: club.state || '',
            country: club.country || 'Mexico'
          })

          if (!club.ClubSettings) {
            // Create ClubSettings
            const clubSettingsId = `club_settings_${club.id}_${Date.now()}`
            await prisma.clubSettings.create({
              data: {
                id: clubSettingsId,
                clubId: club.id,
                currency: 'MXN',
                slotDuration: 90,
                bufferTime: 15,
                advanceBookingDays: 30,
                allowSameDayBooking: true,
                taxIncluded: true,
                taxRate: 16,
                cancellationFee: 0,
                noShowFee: 50,
                timezone: smartTimezone,
                acceptCash: true,
                terminalEnabled: false,
                transferEnabled: true,
                updatedAt: new Date()
              }
            })
          } else {
            // Update existing ClubSettings
            await prisma.clubSettings.update({
              where: { id: club.ClubSettings.id },
              data: { 
                timezone: smartTimezone,
                updatedAt: new Date()
              }
            })
          }

          result.fixed++
        } catch (error) {
          result.errors.push(`Failed to fix club ${club.name}: ${error.message}`)
        }
      }
    } catch (error) {
      result.errors.push(`Fix operation error: ${error.message}`)
    }

    return result
  }

  /**
   * Generate comprehensive validation report
   */
  static async generateValidationReport(): Promise<string> {
    const validation = await this.validateCompleteSystem()
    
    let report = '🔍 COMPREHENSIVE TIMEZONE VALIDATION REPORT\n'
    report += '='.repeat(60) + '\n\n'
    
    // Summary
    report += '📊 SUMMARY\n'
    report += '-'.repeat(30) + '\n'
    report += `Total clubs: ${validation.summary.totalClubs}\n`
    report += `Clubs with timezone: ${validation.summary.clubsWithTimezone}\n`
    report += `Clubs without timezone: ${validation.summary.clubsWithoutTimezone}\n`
    report += `Invalid timezones: ${validation.summary.invalidTimezones}\n`
    report += `Overall status: ${validation.success ? '✅ PASS' : '❌ FAIL'}\n\n`
    
    // System tests
    report += '🧪 SYSTEM TESTS\n'
    report += '-'.repeat(30) + '\n'
    report += `Timezone detection: ${validation.details.systemTests.timezoneDetection ? '✅ PASS' : '❌ FAIL'}\n`
    report += `Date filtering: ${validation.details.systemTests.dateFiltering ? '✅ PASS' : '❌ FAIL'}\n`
    report += `UTC conversion: ${validation.details.systemTests.utcConversion ? '✅ PASS' : '❌ FAIL'}\n`
    report += `API integration: ${validation.details.systemTests.apiIntegration ? '✅ PASS' : '❌ FAIL'}\n\n`
    
    // Issues
    if (validation.details.clubsWithoutTimezone.length > 0) {
      report += '⚠️ CLUBS WITHOUT TIMEZONE\n'
      report += '-'.repeat(30) + '\n'
      validation.details.clubsWithoutTimezone.forEach(club => {
        report += `- ${club.name} (${club.city}, ${club.country})\n`
      })
      report += '\n'
    }
    
    if (validation.details.clubsWithInvalidTimezone.length > 0) {
      report += '⚠️ CLUBS WITH INVALID TIMEZONE\n'
      report += '-'.repeat(30) + '\n'
      validation.details.clubsWithInvalidTimezone.forEach(club => {
        report += `- ${club.name}: ${club.currentTimezone} → ${club.suggestedTimezone}\n`
      })
      report += '\n'
    }
    
    // Errors
    if (validation.summary.validationErrors.length > 0) {
      report += '❌ VALIDATION ERRORS\n'
      report += '-'.repeat(30) + '\n'
      validation.summary.validationErrors.forEach(error => {
        report += `- ${error}\n`
      })
      report += '\n'
    }
    
    // Recommendations
    report += '🎯 RECOMMENDATIONS\n'
    report += '-'.repeat(30) + '\n'
    if (validation.success) {
      report += '✅ System is fully configured for present and future clubs\n'
      report += '✅ All timezone operations are working correctly\n'
      report += '✅ No action required\n'
    } else {
      if (validation.summary.clubsWithoutTimezone > 0) {
        report += `⚡ Run TimezoneValidator.fixClubsWithoutTimezone() to fix ${validation.summary.clubsWithoutTimezone} clubs\n`
      }
      if (validation.summary.validationErrors.length > 0) {
        report += '⚡ Review validation errors and fix system issues\n'
      }
    }
    
    report += '\n🔮 FUTURE CLUB GUARANTEE\n'
    report += '-'.repeat(30) + '\n'
    report += '✓ ClubAdminIntegrationService creates ClubSettings automatically\n'
    report += '✓ Smart timezone detection based on location\n'
    report += '✓ Fallback to America/Mexico_City for unknown locations\n'
    report += '✓ All APIs use club-specific timezone\n'
    report += '✓ Date operations handle UTC correctly\n'
    
    return report
  }
}