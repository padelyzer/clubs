import { generateSecurePassword, getTestPassword, validatePasswordStrength } from './lib/utils/password-generator'

console.log('🔐 Testing Password Generator\n')

// Test 1: Generate secure passwords
console.log('1. Generating secure passwords:')
for (let i = 0; i < 3; i++) {
  const password = generateSecurePassword()
  const validation = validatePasswordStrength(password)
  console.log(`   Password ${i + 1}: ${password}`)
  console.log(`   Valid: ${validation.isValid}`)
  if (!validation.isValid) {
    console.log(`   Errors: ${validation.errors.join(', ')}`)
  }
  console.log('')
}

// Test 2: Test with environment variable
console.log('2. Testing with environment variable:')
process.env.TEST_PASSWORD = 'MySecureP@ssw0rd'
const envPassword = getTestPassword('TEST_PASSWORD', 'test environment')
console.log(`   Got password: ${envPassword}`)

// Test 3: Test without environment variable
console.log('\n3. Testing without environment variable:')
delete process.env.TEST_PASSWORD
const generatedPassword = getTestPassword('TEST_PASSWORD', 'automatic generation')

// Test 4: Validate weak passwords
console.log('\n4. Testing weak passwords:')
const weakPasswords = ['password', '12345678', 'Password', 'Password1', 'Password1!']
for (const weak of weakPasswords) {
  const validation = validatePasswordStrength(weak)
  console.log(`   "${weak}": ${validation.isValid ? 'Valid' : 'Invalid'}`)
  if (!validation.isValid) {
    console.log(`   - ${validation.errors.join('\n   - ')}`)
  }
}

console.log('\n✅ Password generator test complete!')