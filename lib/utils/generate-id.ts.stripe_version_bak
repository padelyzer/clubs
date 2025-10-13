// Fallback function for generating unique IDs when crypto.randomUUID is not available
function generateUniqueId(): string {
  const timestamp = Date.now().toString(36)
  const randomNum = Math.random().toString(36).substring(2, 9)
  return `${timestamp}-${randomNum}`
}

// Safe wrapper for crypto.randomUUID with fallback
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch (error) {
      // Fallback if crypto.randomUUID throws an error
      return generateUniqueId()
    }
  }
  return generateUniqueId()
}