# BloodHub Security Implementation Guide

## Overview
This document outlines the security improvements implemented in BloodHub to address critical vulnerabilities identified in the security audit.

## 🚨 Critical Security Issues Fixed

### 1. Firestore Security Rules
**Issue**: Unrestricted access to user data
**Fix**: Strict security rules that enforce user isolation

**Implementation**:
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only authenticated users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only authenticated users can create their own profile
      allow create: if request.auth != null && request.auth.uid == userId
                    && isValidNewUser(request.resource.data);
      
      // Only authenticated users can update their own profile (limited fields)
      allow update: if request.auth != null && request.auth.uid == userId
                    && isValidUserUpdate(request.resource.data, resource.data);
      
      // Users cannot delete their own profiles
      allow delete: if false;
    }
  }
}
```

### 2. Input Sanitization
**Issue**: XSS vulnerabilities from user input
**Fix**: Comprehensive input sanitization utilities

**Implementation**:
```typescript
// lib/security.ts
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control chars
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove script protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function createSecureUserData(rawData: any) {
  const sanitizedName = sanitizeName(rawData.fullName);
  const normalizedEmail = normalizeEmail(rawData.email);
  const canonicalPhone = canonicalizePhone(rawData.whatsappNumber);
  
  // Validate all fields before returning
  if (!sanitizedName || !normalizedEmail || !canonicalPhone) {
    throw new Error('Invalid input data');
  }
  
  return { sanitizedName, normalizedEmail, canonicalPhone };
}
```

### 3. Rate Limiting
**Issue**: No protection against brute force attacks
**Fix**: Server-side rate limiting with Cloud Functions

**Implementation**:
```typescript
// functions/src/index.ts
export const sendVerificationEmail = functions.https.onCall(async (data, context) => {
  // Rate limiting check
  const rateDocRef = db.collection('emailRateLimits').doc(uid);
  const now = admin.firestore.Timestamp.now();

  await db.runTransaction(async (tx) => {
    const docSnap = await tx.get(rateDocRef);
    
    if (docSnap.exists) {
      const lastSent = docSnap.data()?.lastSent;
      const secondsSince = now.seconds - lastSent.seconds;
      
      if (secondsSince < COOLDOWN_SECONDS) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `Please wait ${COOLDOWN_SECONDS - secondsSince} seconds`
        );
      }
    }
    
    // Update rate limit timestamp
    tx.set(rateDocRef, { lastSent: now }, { merge: true });
  });
});
```

### 4. Double-Submit Prevention
**Issue**: Forms could be submitted multiple times
**Fix**: Token-based submission protection

**Implementation**:
```typescript
const [submitToken, setSubmitToken] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  // Prevent double-submit with token-based protection
  if (isSubmitting || submitToken) {
    return;
  }
  
  const token = Math.random().toString(36).substring(7);
  setSubmitToken(token);
  setIsSubmitting(true);
  
  try {
    // ... form submission logic
  } finally {
    setIsSubmitting(false);
    setSubmitToken(null);
  }
};
```

### 5. Error Message Sanitization
**Issue**: Raw error messages exposed internal details
**Fix**: Friendly error message mapping

**Implementation**:
```typescript
export function getFriendlyErrorMessage(error: any): string {
  const code = error?.code || error?.message || '';
  
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in or use password reset.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  };
  
  return errorMap[code] || 'An error occurred. Please try again.';
}
```

## 🔧 Implementation Steps

### Step 1: Deploy Firestore Security Rules
```bash
# Deploy security rules
firebase deploy --only firestore:rules
```

### Step 2: Deploy Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Step 3: Update Frontend Dependencies
```bash
npm install
# Ensure all security utilities are imported
```

### Step 4: Test Security Measures
```bash
# Run security tests
npm run test:security

# Test in Firebase emulator
firebase emulators:start
```

## 🧪 Testing Security Measures

### Manual Security Testing
1. **Test Firestore Rules**:
   ```javascript
   // Try to access another user's data
   const otherUserDoc = doc(db, "users", "other-uid");
   await getDoc(otherUserDoc); // Should fail
   ```

2. **Test Input Sanitization**:
   ```javascript
   // Try XSS payload
   const maliciousName = "<script>alert('xss')</script>";
   // Should be sanitized to: "alert('xss')"
   ```

3. **Test Rate Limiting**:
   ```javascript
   // Rapid verification requests
   for (let i = 0; i < 10; i++) {
     await sendVerificationEmail(); // Should fail after first
   }
   ```

### Automated Security Testing
```typescript
// test/security.test.ts
describe('Security Tests', () => {
  test('prevents XSS in user input', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });
  
  test('enforces rate limiting', async () => {
    // Test rapid API calls
  });
  
  test('validates Firestore rules', async () => {
    // Test unauthorized access attempts
  });
});
```

## 🚀 Production Deployment Checklist

### Security Configuration
- [ ] Firestore rules deployed and tested
- [ ] Cloud Functions deployed with proper IAM
- [ ] Environment variables configured securely
- [ ] HTTPS enforced on all endpoints
- [ ] CORS policies configured

### Monitoring Setup
- [ ] Security event logging enabled
- [ ] Error tracking service configured (Sentry)
- [ ] Rate limiting alerts configured
- [ ] Suspicious activity monitoring

### Backup and Recovery
- [ ] Database backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Security incident response plan ready

## 🔍 Security Monitoring

### Log Analysis
Monitor these security events:
- Failed authentication attempts
- Unauthorized Firestore access
- Rate limit violations
- Suspicious input patterns
- Multiple account creation attempts

### Alert Thresholds
```javascript
const securityThresholds = {
  failedLogins: 5,        // Alert after 5 failed logins in 5 minutes
  rapidSignups: 10,       // Alert after 10 signups in 1 minute
  suspiciousIPs: 1,       // Alert on any known malicious IP
  dataAccessAnomalies: 1  // Alert on unusual access patterns
};
```

## 📚 Additional Security Resources

### Firebase Security Best Practices
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Auth Security](https://firebase.google.com/docs/auth/security)
- [Cloud Functions Security](https://firebase.google.com/docs/functions/security)

### OWASP Guidelines
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Input Validation](https://owasp.org/www-project-proactive-controls/v3/en/c5-validate-inputs)
- [Output Encoding](https://owasp.org/www-project-proactive-controls/v3/en/c4-encode-data)

### Security Testing Tools
- [OWASP ZAP](https://owasp.org/www-project-zap/)
- [Burp Suite](https://portswigger.net/burp)
- [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)

## 🆘 Security Incident Response

### Immediate Actions
1. **Isolate**: Disable affected functionality
2. **Assess**: Determine scope and impact
3. **Contain**: Stop the attack from spreading
4. **Document**: Record all details and evidence

### Communication Plan
- **Internal**: Notify development team immediately
- **Users**: Transparent communication about the issue
- **Regulatory**: Report if required by law
- **Public**: PR statement if necessary

### Recovery Steps
1. **Fix**: Implement security patches
2. **Test**: Verify fixes work correctly
3. **Deploy**: Roll out fixes to production
4. **Monitor**: Watch for recurrence
5. **Review**: Post-incident analysis

## 📊 Security Metrics

### Key Performance Indicators
- **Security Incidents**: Number of security events per month
- **Vulnerability Response Time**: Time to fix identified issues
- **Security Test Coverage**: Percentage of code covered by security tests
- **User Security Awareness**: Security training completion rates

### Regular Security Reviews
- **Monthly**: Security metrics review
- **Quarterly**: Security architecture review
- **Annually**: Comprehensive security audit
- **Continuous**: Automated security scanning

---

**Last Updated**: [Current Date]
**Security Version**: 1.0
**Next Security Review**: [Date + 3 months]

For security-related questions or incidents, contact: [Security Team Contact] 