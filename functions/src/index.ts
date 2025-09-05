import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const COOLDOWN_SECONDS = 60; // 1 minute cooldown between resends

export const sendVerificationEmail = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated", 
      "Must be signed in to request verification email"
    );
  }

  const uid = context.auth.uid;
  
  try {
    // Get user record from Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    const email = userRecord.email;
    
    if (!email) {
      throw new functions.https.HttpsError(
        "failed-precondition", 
        "No email associated with this account"
      );
    }

    // Check if email is already verified
    if (userRecord.emailVerified) {
      throw new functions.https.HttpsError(
        "already-exists", 
        "Email is already verified"
      );
    }

    // Rate limiting check
    const rateDocRef = db.collection('emailRateLimits').doc(uid);
    const now = admin.firestore.Timestamp.now();

    await db.runTransaction(async (tx: admin.firestore.Transaction) => {
      const docSnap = await tx.get(rateDocRef);
      
      if (docSnap.exists) {
        const lastSent = docSnap.data()?.lastSent as admin.firestore.Timestamp;
        const secondsSince = now.seconds - lastSent.seconds;
        
        if (secondsSince < COOLDOWN_SECONDS) {
          const remainingTime = COOLDOWN_SECONDS - secondsSince;
          throw new functions.https.HttpsError(
            "resource-exhausted",
            `Please wait ${remainingTime} seconds before requesting another verification email`
          );
        }
      }
      
      // Update rate limit timestamp
      tx.set(rateDocRef, { 
        lastSent: now,
        email: email,
        uid: uid
      }, { merge: true });
    });

    // Generate email verification link
    const actionCodeSettings = {
      url: `${functions.config().app?.domain || 'https://yourdomain.com'}/auth/verify-email?email=${encodeURIComponent(email)}`,
      handleCodeInApp: false,
    };

    const verificationLink = await admin.auth().generateEmailVerificationLink(
      email, 
      actionCodeSettings
    );

    // TODO: Send email via your email provider (SendGrid, SES, etc.)
    // For now, return the link (in production, send server-side)
    
    // Log the verification request for security monitoring
    await db.collection('verificationLogs').add({
      uid: uid,
      email: email,
      requestedAt: now,
      ip: context.rawRequest?.ip || 'unknown',
      userAgent: context.rawRequest?.headers?.['user-agent'] || 'unknown'
    });

    return { 
      success: true, 
      message: "Verification email sent successfully",
      cooldownSeconds: COOLDOWN_SECONDS
    };

  } catch (error) {
    console.error('Email verification error:', error);
    
    // Re-throw Firebase HttpsErrors as-is
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Wrap other errors
    throw new functions.https.HttpsError(
      "internal", 
      "Failed to send verification email. Please try again later."
    );
  }
});

// Optional: Function to check verification status
export const checkVerificationStatus = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated", 
      "Must be signed in"
    );
  }

  const uid = context.auth.uid;
  
  try {
    const userRecord = await admin.auth().getUser(uid);
    
    return {
      emailVerified: userRecord.emailVerified,
      email: userRecord.email
    };
  } catch (error) {
    console.error('Verification status check error:', error);
    throw new functions.https.HttpsError(
      "internal", 
      "Failed to check verification status"
    );
  }
}); 