// Security configuration and helper functions

// Rate limiting constants
export const SECURITY_CONFIG = {
  EMAIL_RESEND_COOLDOWN_MS: 60000, // 1 minute
  MAX_VERIFICATION_ATTEMPTS: 15,
  AUTO_POLL_INTERVAL_MS: 8000, // 8 seconds
  AUTO_POLL_TIMEOUT_MS: 120000, // 2 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN_MS: 300000, // 5 minutes
} as const

// Input sanitization functions
export const sanitizeInput = {
  // Remove control characters and potentially dangerous HTML
  fullName: (input: string): string => {
    return input
      .replace(/[\u0000-\u001F\u007F<>]/g, '') // Remove control chars and < >
      .trim()
      .slice(0, 100) // Limit length
  },

  // Normalize email (lowercase, trim)
  email: (input: string): string => {
    return input.trim().toLowerCase()
  },

  // Canonicalize phone number
  phoneNumber: (input: string): string => {
    const digits = input.replace(/\D/g, '')
    if (digits.startsWith('880')) {
      return `+${digits}`
    }
    return `+880${digits}`
  },

  // Validate blood group
  bloodGroup: (input: string): string | null => {
    const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    return validGroups.includes(input) ? input : null
  }
}

// Create secure user data with proper sanitization
export function createSecureUserData(rawData: any) {
  const sanitizedName = sanitizeInput.fullName(rawData.fullName);
  const normalizedEmail = sanitizeInput.email(rawData.email);
  const canonicalPhone = sanitizeInput.phoneNumber(rawData.phoneNumber);
  const canonicalWhatsApp = sanitizeInput.phoneNumber(rawData.whatsappNumber);
  
  // Validate all fields before returning
  if (!sanitizedName || !normalizedEmail || !canonicalPhone || !canonicalWhatsApp) {
    throw new Error('Invalid input data');
  }
  
  return { 
    fullName: sanitizedName, 
    email: normalizedEmail, 
    phoneNumber: canonicalPhone,
    whatsappNumber: canonicalWhatsApp,
    bloodGroup: rawData.bloodGroup 
  };
}

// Log security events
export function logSecurityEvent(event: string, data: any, uid?: string) {
  console.log(`[SECURITY] ${event}:`, { ...data, uid, timestamp: new Date().toISOString() });
}

// Normalize email function (for backward compatibility)
export function normalizeEmail(email: string): string {
  return sanitizeInput.email(email);
}

// Sanitize name function (for backward compatibility)
export function sanitizeName(name: string): string {
  return sanitizeInput.fullName(name);
}

// Canonicalize phone function (for backward compatibility)
export function canonicalizePhone(phone: string): string {
  return sanitizeInput.phoneNumber(phone);
}

// Error message mapping
export const ERROR_MESSAGES = {
  AUTH: {
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/email-already-in-use': 'Email already in use. Try logging in or use password reset.',
    'auth/weak-password': 'Password is too weak. Add more characters.',
    'auth/operation-not-allowed': 'Email/password signup is not enabled. Please contact support.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
  },
  FIRESTORE: {
    'permission-denied': 'Access denied. Please check your permissions.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'deadline-exceeded': 'Request timed out. Please try again.',
  }
} as const

// Helper function to get friendly error message
export const getFriendlyErrorMessage = (error: any, context: 'AUTH' | 'FIRESTORE' = 'AUTH'): string => {
  const code = error?.code || error?.message || ""
  const messages = ERROR_MESSAGES[context]
  
  for (const [key, message] of Object.entries(messages)) {
    if (code.includes(key)) {
      return message
    }
  }
  
  return `An error occurred. Please try again. (Code: ${code})`
}

// Rate limiting helpers
export const rateLimitHelpers = {
  // Check if user can perform action based on localStorage
  canPerformAction: (actionKey: string, cooldownMs: number): boolean => {
    const stored = localStorage.getItem(actionKey)
    if (!stored) return true
    
    try {
      const { lastAttempt } = JSON.parse(stored)
      return Date.now() - lastAttempt > cooldownMs
    } catch {
      return true
    }
  },

  // Record action attempt
  recordAction: (actionKey: string): void => {
    localStorage.setItem(actionKey, JSON.stringify({ lastAttempt: Date.now() }))
  },

  // Get time remaining until action can be performed
  getTimeRemaining: (actionKey: string, cooldownMs: number): number => {
    const stored = localStorage.getItem(actionKey)
    if (!stored) return 0
    
    try {
      const { lastAttempt } = JSON.parse(stored)
      const timeSince = Date.now() - lastAttempt
      return Math.max(0, cooldownMs - timeSince)
    } catch {
      return 0
    }
  }
}

// Validation helpers
export const validationHelpers = {
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  },

  // Validate phone number format
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  },

  // Validate password strength
  isStrongPassword: (password: string): boolean => {
    return password.length >= 8 && 
           /[a-z]/.test(password) && 
           /[A-Z]/.test(password) && 
           /\d/.test(password)
  }
} 