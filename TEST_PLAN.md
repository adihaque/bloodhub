# BloodHub Test Plan

## Overview
This document outlines comprehensive testing strategies for the BloodHub application, covering security vulnerabilities, user experience issues, and functional edge cases identified in the security audit.

## 1. Security Testing (Hacker Perspective)

### 1.1 Firestore Security Rules Testing
**Objective**: Verify that Firestore rules prevent unauthorized access and data manipulation.

**Test Cases**:
- [ ] **TC-SEC-001**: Attempt to read another user's profile without authentication
- [ ] **TC-SEC-002**: Attempt to create a user profile with another user's UID
- [ ] **TC-SEC-003**: Attempt to update another user's profile data
- [ ] **TC-SEC-004**: Attempt to delete user profiles
- [ ] **TC-SEC-005**: Attempt to write invalid data types to Firestore
- [ ] **TC-SEC-006**: Attempt to bypass field validation rules

**Test Steps**:
```javascript
// Test unauthorized access
const unauthorizedDoc = doc(db, "users", "other-user-uid");
await getDoc(unauthorizedDoc); // Should fail

// Test invalid data
const invalidData = {
  fullName: "<script>alert('xss')</script>",
  email: "invalid-email",
  bloodGroup: "INVALID",
  whatsappNumber: "123",
  createdAt: "not-a-timestamp"
};
await setDoc(doc(db, "users", "test-uid"), invalidData); // Should fail
```

### 1.2 Authentication Bypass Testing
**Objective**: Ensure email verification cannot be bypassed.

**Test Cases**:
- [ ] **TC-SEC-007**: Attempt to access protected routes without email verification
- [ ] **TC-SEC-008**: Attempt to call protected APIs without verification
- [ ] **TC-SEC-009**: Test Google signup verification flow

**Test Steps**:
```javascript
// Test unverified user access
const unverifiedUser = await signInWithEmailAndPassword(email, password);
// User should be redirected to verification page
// Dashboard access should be blocked
```

### 1.3 Input Sanitization Testing
**Objective**: Verify that user inputs are properly sanitized to prevent XSS.

**Test Cases**:
- [ ] **TC-SEC-010**: Test XSS payloads in fullName field
- [ ] **TC-SEC-011**: Test SQL injection attempts in all fields
- [ ] **TC-SEC-012**: Test control character injection

**Test Data**:
```javascript
const maliciousInputs = [
  "<script>alert('xss')</script>",
  "'; DROP TABLE users; --",
  "User\u0000Name",
  "Name<script>alert('xss')</script>",
  "javascript:alert('xss')",
  "onload=alert('xss')"
];
```

### 1.4 Rate Limiting Testing
**Objective**: Verify that rate limiting prevents abuse.

**Test Cases**:
- [ ] **TC-SEC-013**: Test email verification resend cooldown
- [ ] **TC-SEC-014**: Test rapid signup attempts
- [ ] **TC-SEC-015**: Test rapid login attempts

**Test Steps**:
```javascript
// Test rapid resend
for (let i = 0; i < 10; i++) {
  await sendVerificationEmail(); // Should fail after first attempt
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

## 2. User Experience Testing (Annoyed User Perspective)

### 2.1 Form Validation and Feedback
**Objective**: Ensure forms provide clear, immediate feedback.

**Test Cases**:
- [ ] **TC-UX-001**: Test real-time validation feedback
- [ ] **TC-UX-002**: Test error message clarity
- [ ] **TC-UX-003**: Test form submission states
- [ ] **TC-UX-004**: Test loading indicators

**Test Scenarios**:
- Enter invalid email format
- Submit form with missing required fields
- Test password strength indicators
- Verify error messages are user-friendly

### 2.2 Phone Number Formatting
**Objective**: Ensure phone number input is user-friendly.

**Test Cases**:
- [ ] **TC-UX-005**: Test automatic +880 prefixing
- [ ] **TC-UX-006**: Test number pasting from different formats
- [ ] **TC-UX-007**: Test international number handling

**Test Data**:
```javascript
const phoneTestCases = [
  "01712345678",     // Should become +8801712345678
  "+8801712345678",  // Should remain +8801712345678
  "8801712345678",   // Should become +8801712345678
  "1712345678",      // Should become +8801712345678
  "01-712-345-678", // Should become +8801712345678
];
```

### 2.3 Email Verification Flow
**Objective**: Ensure smooth email verification experience.

**Test Cases**:
- [ ] **TC-UX-008**: Test verification email delivery
- [ ] **TC-UX-009**: Test resend verification cooldown
- [ ] **TC-UX-010**: Test verification status checking
- [ ] **TC-UX-011**: Test auto-redirect after verification

**Test Steps**:
- Sign up with new email
- Check email delivery
- Test resend button cooldown
- Verify auto-redirect works

### 2.4 Google Signup Flow
**Objective**: Ensure Google signup is seamless.

**Test Cases**:
- [ ] **TC-UX-012**: Test Google signup completion
- [ ] **TC-UX-013**: Test profile completion redirect
- [ ] **TC-UX-014**: Test error handling for cancelled signup

## 3. Functional Testing (QA Tester Perspective)

### 3.1 Account State Management
**Objective**: Ensure proper handling of various account states.

**Test Cases**:
- [ ] **TC-FUNC-001**: Test unverified user flow
- [ ] **TC-FUNC-002**: Test verified user without profile
- [ ] **TC-FUNC-003**: Test complete user profile
- [ ] **TC-FUNC-004**: Test profile update flow

**Test Matrix**:
| Email Verified | Profile Exists | Expected Behavior |
|----------------|----------------|-------------------|
| No             | No             | Redirect to verify-email |
| Yes            | No             | Redirect to complete-profile |
| Yes            | Yes            | Redirect to dashboard |

### 3.2 Double-Submit Prevention
**Objective**: Ensure forms cannot be submitted multiple times.

**Test Cases**:
- [ ] **TC-FUNC-005**: Test rapid form submission
- [ ] **TC-FUNC-006**: Test button state during submission
- [ ] **TC-FUNC-007**: Test network interruption handling

**Test Steps**:
```javascript
// Test double-submit
const submitButton = document.querySelector('button[type="submit"]');
submitButton.click();
submitButton.click(); // Should be ignored
submitButton.click(); // Should be ignored
```

### 3.3 Network Error Handling
**Objective**: Ensure graceful handling of network issues.

**Test Cases**:
- [ ] **TC-FUNC-008**: Test offline signup attempt
- [ ] **TC-FUNC-009**: Test slow network handling
- [ ] **TC-FUNC-010**: Test partial success scenarios

**Test Tools**:
- Chrome DevTools Network tab (Slow 3G)
- Network throttling
- Offline mode

### 3.4 Data Persistence
**Objective**: Ensure data is properly saved and retrieved.

**Test Cases**:
- [ ] **TC-FUNC-011**: Test Firestore write success
- [ ] **TC-FUNC-012**: Test Firestore read success
- [ ] **TC-FUNC-013**: Test data validation on read

## 4. Automated Testing

### 4.1 Unit Tests
**Objective**: Test individual functions and components.

**Test Files**:
```typescript
// lib/security.test.ts
describe('Security Utilities', () => {
  test('sanitizeInput removes XSS payloads', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<script>');
  });
  
  test('normalizeEmail converts to lowercase', () => {
    const input = 'TEST@EXAMPLE.COM';
    const result = normalizeEmail(input);
    expect(result).toBe('test@example.com');
  });
  
  test('canonicalizePhone formats correctly', () => {
    const input = '01712345678';
    const result = canonicalizePhone(input);
    expect(result).toBe('+8801712345678');
  });
});
```

### 4.2 Integration Tests
**Objective**: Test component interactions and API calls.

**Test Files**:
```typescript
// components/signup.test.tsx
describe('Signup Form', () => {
  test('prevents double submission', async () => {
    const { getByText } = render(<SignupPage />);
    const submitButton = getByText('Create Account');
    
    fireEvent.click(submitButton);
    fireEvent.click(submitButton); // Should be ignored
    
    expect(submitButton).toBeDisabled();
  });
  
  test('sanitizes input before submission', async () => {
    // Test with malicious input
  });
});
```

### 4.3 E2E Tests
**Objective**: Test complete user workflows.

**Test Files**:
```typescript
// e2e/signup-flow.test.ts
describe('Signup Flow', () => {
  test('complete signup and verification flow', async () => {
    // Navigate to signup
    await page.goto('/auth/signup');
    
    // Fill form with test data
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    // ... fill other fields
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to verification page
    await expect(page).toHaveURL(/\/auth\/verify-email/);
    
    // Verify email verification flow
    // ... complete verification steps
  });
});
```

## 5. Performance Testing

### 5.1 Load Testing
**Objective**: Ensure system handles multiple concurrent users.

**Test Cases**:
- [ ] **TC-PERF-001**: Test concurrent signup requests
- [ ] **TC-PERF-002**: Test concurrent verification requests
- [ ] **TC-PERF-003**: Test database performance under load

**Tools**:
- Artillery.js
- k6
- Firebase Emulator

### 5.2 Memory Leak Testing
**Objective**: Ensure no memory leaks in long-running sessions.

**Test Cases**:
- [ ] **TC-PERF-004**: Test memory usage during signup flow
- [ ] **TC-PERF-005**: Test memory usage during verification flow
- [ ] **TC-PERF-006**: Test cleanup after component unmount

## 6. Security Monitoring

### 6.1 Log Analysis
**Objective**: Monitor for suspicious activities.

**Log Sources**:
- Firebase Auth logs
- Firestore access logs
- Cloud Function logs
- Application security events

**Monitoring Rules**:
```javascript
// Example monitoring rules
const securityRules = {
  multipleFailedLogins: 'Alert if >5 failed logins in 5 minutes',
  rapidSignups: 'Alert if >10 signups in 1 minute',
  suspiciousIPs: 'Alert on known malicious IPs',
  dataAccessPatterns: 'Monitor unusual data access patterns'
};
```

### 6.2 Penetration Testing
**Objective**: Simulate real-world attack scenarios.

**Test Scenarios**:
- SQL injection attempts
- XSS payload testing
- CSRF token validation
- Session hijacking attempts
- Privilege escalation testing

## 7. Test Environment Setup

### 7.1 Firebase Emulator
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulator
firebase init emulators

# Start emulators
firebase emulators:start
```

### 7.2 Test Data Management
```typescript
// test-utils/test-data.ts
export const testUsers = {
  valid: {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!',
    bloodGroup: 'A+',
    whatsappNumber: '01712345678'
  },
  malicious: {
    fullName: '<script>alert("xss")</script>',
    email: 'test@example.com',
    password: 'TestPass123!',
    bloodGroup: 'A+',
    whatsappNumber: '01712345678'
  }
};
```

## 8. Test Execution Checklist

### 8.1 Pre-Test Setup
- [ ] Firebase emulator running
- [ ] Test database cleared
- [ ] Test user accounts created
- [ ] Network conditions configured

### 8.2 Test Execution
- [ ] Run unit tests: `npm test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run security tests: `npm run test:security`

### 8.3 Post-Test Cleanup
- [ ] Clean up test data
- [ ] Reset emulator state
- [ ] Generate test reports
- [ ] Document findings

## 9. Bug Reporting Template

```markdown
## Bug Report

**Title**: [Brief description]

**Severity**: [Critical/High/Medium/Low]

**Environment**: [Browser/OS/Device]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Screenshots**: [If applicable]

**Console Logs**: [Any error messages]

**Additional Context**: [Any other relevant information]
```

## 10. Success Criteria

### 10.1 Security Criteria
- [ ] All security test cases pass
- [ ] No critical vulnerabilities found
- [ ] Firestore rules properly enforced
- [ ] Input sanitization working correctly

### 10.2 UX Criteria
- [ ] All UX test cases pass
- [ ] Forms provide clear feedback
- [ ] Error messages are user-friendly
- [ ] Loading states are clear

### 10.3 Functional Criteria
- [ ] All functional test cases pass
- [ ] No double-submit issues
- [ ] Proper error handling
- [ ] Data persistence working

## 11. Maintenance

### 11.1 Regular Updates
- Update test cases monthly
- Review security test scenarios quarterly
- Update dependencies regularly
- Monitor for new security threats

### 11.2 Continuous Improvement
- Collect feedback from test execution
- Identify areas for test automation
- Optimize test performance
- Expand test coverage

---

**Last Updated**: [Date]
**Test Plan Version**: 1.0
**Next Review**: [Date] 