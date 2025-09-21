import {
  loginSchema,
  registerSchema,
  clubRegistrationSchema,
  bookingSchema,
  phoneSchema,
  emailSchema,
  passwordSchema,
  validateRequestBody
} from '@/lib/validation/schemas'

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'admin@sub.domain.org'
      ]

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow()
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        ''
      ]

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow()
      })
    })
  })

  describe('phoneSchema', () => {
    it('should validate Mexican phone numbers', () => {
      const validPhones = [
        '5551234567',
        '+525551234567'
      ]

      validPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).not.toThrow()
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        '555123456',
        '55512345678',
        'abcd1234567',
        ''
      ]

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow()
      })
    })
  })

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123!',
        'MyStr0ng@Pass',
        'Complex#1Password'
      ]

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow()
      })
    })

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'password', // no uppercase, number, special char
        'PASSWORD', // no lowercase, number, special char
        'Password', // no number, special char
        'Password1', // no special char
        'Pass1!', // too short
        ''
      ]

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow()
      })
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'any-password'
      }

      expect(() => loginSchema.parse(validLogin)).not.toThrow()
    })

    it('should reject invalid login data', () => {
      const invalidLogins = [
        { email: 'invalid-email', password: 'password' },
        { email: 'test@example.com', password: '' },
        { email: '', password: 'password' },
        {}
      ]

      invalidLogins.forEach(login => {
        expect(() => loginSchema.parse(login)).toThrow()
      })
    })
  })

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validRegistration = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!'
      }

      expect(() => registerSchema.parse(validRegistration)).not.toThrow()
    })

    it('should reject mismatched passwords', () => {
      const mismatchedPasswords = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass123!'
      }

      expect(() => registerSchema.parse(mismatchedPasswords)).toThrow()
    })

    it('should reject short names', () => {
      const shortName = {
        name: 'J',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!'
      }

      expect(() => registerSchema.parse(shortName)).toThrow()
    })
  })

  describe('clubRegistrationSchema', () => {
    it('should validate complete club registration', () => {
      const validClub = {
        name: 'Test Padel Club',
        email: 'club@example.com',
        phone: '5551234567',
        address: 'Av. Test 123, Col. Centro',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '12345',
        description: 'A great padel club',
        website: 'https://club.example.com',
        ownerName: 'John Owner',
        ownerEmail: 'owner@example.com',
        ownerPhone: '5559876543'
      }

      expect(() => clubRegistrationSchema.parse(validClub)).not.toThrow()
    })

    it('should reject invalid postal codes', () => {
      const invalidPostalCode = {
        name: 'Test Club',
        email: 'club@example.com',
        phone: '5551234567',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123', // Invalid - should be 5 digits
        ownerName: 'John Owner',
        ownerEmail: 'owner@example.com',
        ownerPhone: '5559876543'
      }

      expect(() => clubRegistrationSchema.parse(invalidPostalCode)).toThrow()
    })
  })

  describe('bookingSchema', () => {
    it('should validate correct booking data', () => {
      const validBooking = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
        playerName: 'John Player',
        playerEmail: 'player@example.com',
        playerPhone: '5551234567',
        totalPlayers: 4,
        notes: 'Birthday celebration',
        paymentType: 'FULL' as const
      }

      expect(() => bookingSchema.parse(validBooking)).not.toThrow()
    })

    it('should reject invalid time ranges', () => {
      const invalidTimeRange = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
        startTime: '11:00',
        endTime: '10:00', // End before start
        playerName: 'John Player',
        playerEmail: 'player@example.com',
        playerPhone: '5551234567',
        totalPlayers: 4,
        paymentType: 'FULL' as const
      }

      expect(() => bookingSchema.parse(invalidTimeRange)).toThrow()
    })

    it('should reject invalid player count', () => {
      const invalidPlayerCount = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
        playerName: 'John Player',
        playerEmail: 'player@example.com',
        playerPhone: '5551234567',
        totalPlayers: 6, // Too many players
        paymentType: 'FULL' as const
      }

      expect(() => bookingSchema.parse(invalidPlayerCount)).toThrow()
    })
  })

  describe('validateRequestBody', () => {
    it('should return success for valid data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = validateRequestBody(loginSchema, validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should return errors for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      }

      const result = validateRequestBody(loginSchema, invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toHaveProperty('email')
        expect(result.errors).toHaveProperty('password')
      }
    })

    it('should use custom error messages when provided', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      }

      const customMessages = {
        email: 'Custom email error message',
        password: 'Custom password error message'
      }

      const result = validateRequestBody(loginSchema, invalidData, customMessages)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.email).toBe(customMessages.email)
        expect(result.errors.password).toBe(customMessages.password)
      }
    })

    it('should handle non-object data gracefully', () => {
      const result = validateRequestBody(loginSchema, 'not-an-object')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
      }
    })
  })
})