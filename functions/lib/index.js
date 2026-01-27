"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVerificationRequest = exports.submitHelpRequest = exports.registerApprentice = exports.registerGrandpa = exports.sendAdditionalMessage = exports.send24HourReminders = exports.onSessionConfirmed = exports.onRequestAccepted = exports.onHelpRequest = exports.onApprenticeRegistration = exports.onGrandpaRegistration = exports.verifyEmailToken = exports.sendCustomEmailVerification = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
// Initialize Firebase Admin
admin.initializeApp();
// Rate limiting store (in production, use Redis or Firestore)
const rateLimitStore = new Map();
// Email configuration using environment variables
const gmailEmail = process.env.GMAIL_EMAIL || 'cwallace7755@gmail.com';
const gmailPassword = process.env.GMAIL_PASSWORD || 'ojkcgymndbpusyqi';
const adminEmail = process.env.ADMIN_EMAIL || 'info@askmygrandpa.com'; // Your notification email
const fromEmail = 'info@askmygrandpa.com'; // Professional sender address
// Debug logging (remove in production)
console.log('📧 Email config check:', {
    hasGmailEmail: !!gmailEmail,
    gmailEmailLength: (gmailEmail === null || gmailEmail === void 0 ? void 0 : gmailEmail.length) || 0,
    hasPassword: !!gmailPassword,
    passwordLength: (gmailPassword === null || gmailPassword === void 0 ? void 0 : gmailPassword.length) || 0,
    adminEmail,
    fromEmail
});
// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});
// Function to send email notifications
const sendNotificationEmail = async (subject, htmlContent, textContent) => {
    const mailOptions = {
        from: fromEmail,
        to: adminEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully');
    }
    catch (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }
};
// Function to send custom email verification with rate limiting
exports.sendCustomEmailVerification = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onCall(async (data, context) => {
    var _a;
    // Rate limiting check
    const clientIP = ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown';
    const rateLimitKey = `email_verification:${clientIP}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 3; // 3 email verifications per minute per IP
    if (rateLimitStore.has(rateLimitKey)) {
        const entry = rateLimitStore.get(rateLimitKey);
        if (now < entry.resetTime && entry.count >= maxRequests) {
            const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
            throw new functions.https.HttpsError('resource-exhausted', `Rate limit exceeded. Please wait ${remainingTime} seconds before requesting another verification email.`);
        }
        if (now > entry.resetTime) {
            rateLimitStore.delete(rateLimitKey);
        }
    }
    // Update rate limit counter
    const entry = rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: now + windowMs };
    entry.count++;
    rateLimitStore.set(rateLimitKey, entry);
    // Payload validation
    if (!data || typeof data !== 'object') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid request data');
    }
    const { email, displayName, userId } = data;
    if (!email || !displayName || !userId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    // Validate payload size (approximate)
    const payloadSize = JSON.stringify(data).length;
    if (payloadSize > 10240) { // 10KB limit
        throw new functions.https.HttpsError('invalid-argument', 'Request payload too large');
    }
    try {
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        // Store verification token in Firestore
        await admin.firestore().collection('emailVerifications').doc(userId).set({
            email,
            displayName,
            token: verificationToken,
            createdAt: new Date().toISOString(),
            verified: false
        });
        const firstName = displayName.split(' ')[0];
        const verificationUrl = `https://askmygrandpa.com/verify-email?token=${verificationToken}&uid=${userId}`;
        const subject = 'Ask My Grandpa Email Confirmation';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
        <!-- Header with logo/banner space -->
        <div style="background: #4a4037; padding: 20px; text-align: center;">
          <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
          <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">Please confirm your address to finish joining Ask Grandpa.</p>
        </div>
        
        <div style="padding: 30px; background: white; margin: 0;">
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${firstName},
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Welcome to the neighborhood.</strong>
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Before we can fully open the doors to the Ask Grandpa community, we need to make sure we have your correct email address.
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Our community is built on trust. Verifying your account helps us keep everyone safe and ensures you don't miss important updates about your projects.
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Please click the button below to confirm your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #9A3412; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              Verify My Email
            </a>
          </div>
          
          <p style="color: #4a4037; font-size: 14px; line-height: 1.6; margin-top: 40px; opacity: 0.8;">
            If you didn't sign up for Ask Grandpa, you can safely ignore this email.
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best,<br>
            <strong>The Ask Grandpa Team</strong>
          </p>
        </div>
        
        <div style="background: #f0ede6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
            Please confirm your address to finish joining Ask Grandpa.
          </p>
        </div>
      </div>
    `;
        const textContent = `
Hi ${firstName},

Welcome to the neighborhood.

Before we can fully open the doors to the Ask Grandpa community, we need to make sure we have your correct email address.

Our community is built on trust. Verifying your account helps us keep everyone safe and ensures you don't miss important updates about your projects.

Please click the link below to confirm your account:
${verificationUrl}

If you didn't sign up for Ask Grandpa, you can safely ignore this email.

Best,
The Ask Grandpa Team
    `;
        const mailOptions = {
            from: fromEmail,
            to: email,
            subject: subject,
            text: textContent,
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log('Custom verification email sent successfully');
        return { success: true };
    }
    catch (error) {
        console.error('Error sending custom verification email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send verification email');
    }
});
// Function to verify email token
exports.verifyEmailToken = functions.https.onCall(async (data, context) => {
    const { token, uid } = data;
    if (!token || !uid) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing token or uid');
    }
    try {
        const verificationDoc = await admin.firestore().collection('emailVerifications').doc(uid).get();
        if (!verificationDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Verification record not found');
        }
        const verificationData = verificationDoc.data();
        if ((verificationData === null || verificationData === void 0 ? void 0 : verificationData.token) !== token) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid verification token');
        }
        if (verificationData === null || verificationData === void 0 ? void 0 : verificationData.verified) {
            throw new functions.https.HttpsError('already-exists', 'Email already verified');
        }
        // Mark as verified
        await admin.firestore().collection('emailVerifications').doc(uid).update({
            verified: true,
            verifiedAt: new Date().toISOString()
        });
        // Update user profile
        await admin.firestore().collection('users').doc(uid).update({
            isVerified: true
        });
        console.log('Email verification completed successfully');
        return { success: true };
    }
    catch (error) {
        console.error('Error verifying email token:', error);
        throw error;
    }
});
// Function triggered when a new grandpa registers
exports.onGrandpaRegistration = functions.firestore
    .document('grandpas/{grandpaId}')
    .onCreate(async (snap, context) => {
    const grandpaData = snap.data();
    // Send admin notification
    const adminSubject = '🎉 New Grandpa Registration - Ask My Grandpa';
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9A3412;">New Grandpa Registration!</h2>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Grandpa Details:</h3>
          <p><strong>Name:</strong> ${grandpaData.name}</p>
          <p><strong>Email:</strong> ${grandpaData.email}</p>
          <p><strong>Phone:</strong> ${grandpaData.phone}</p>
          <p><strong>Location:</strong> ${grandpaData.city}, ${grandpaData.province}</p>
          <p><strong>Skills:</strong> ${grandpaData.skills}</p>
          <p><strong>Contact Preference:</strong> ${grandpaData.contactPreference}</p>
          ${grandpaData.note ? `<p><strong>Note:</strong> ${grandpaData.note}</p>` : ''}
        </div>
        
        <p style="color: #666;">
          Registration Time: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This notification was sent automatically from Ask My Grandpa platform.
        </p>
      </div>
    `;
    const adminTextContent = `
New Grandpa Registration!

Name: ${grandpaData.name}
Email: ${grandpaData.email}
Phone: ${grandpaData.phone}
Location: ${grandpaData.city}, ${grandpaData.province}
Skills: ${grandpaData.skills}
Contact Preference: ${grandpaData.contactPreference}
${grandpaData.note ? `Note: ${grandpaData.note}` : ''}

Registration Time: ${new Date().toLocaleString()}
    `;
    await sendNotificationEmail(adminSubject, adminHtmlContent, adminTextContent);
    // Send welcome/verification email to grandpa
    const welcomeSubject = 'Welcome to Ask My Grandpa';
    const welcomeHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
        <!-- Header with logo/banner space -->
        <div style="background: #4a4037; padding: 20px; text-align: center;">
          <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
          <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">Welcome to the mentor community.</p>
        </div>
        
        <div style="padding: 30px; background: white; margin: 0;">
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello ${grandpaData.name.split(' ')[0]},
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>We could use a hand. Thanks for offering yours.</strong>
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We know you have decades of hard-earned skills and practical knowledge locked away—the kind of stuff you just can't get from a quick internet search. We are incredibly grateful that you're willing to share it with the next generation.
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            By signing up as a mentor, you aren't just helping someone fix a garbage disposal or patch a wall. <strong>You're connecting with your neighbors and passing down a legacy of self-reliance.</strong>
          </p>
          
          <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #4a4037; margin: 0; font-size: 16px; line-height: 1.6;">
              As a reminder, our golden rule is that <strong>the apprentice holds the tools</strong>. Your job isn't to do free labor; it's to guide, teach, ensure safety, and enjoy a cup of coffee while watching someone gain new confidence.
            </p>
          </div>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            To help match you with the right neighbors looking for help, we need to know what you're best at.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://askmygrandpa.com/dashboard" 
               style="background: #9A3412; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              Complete My Skills Profile
            </a>
          </div>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Thanks again for being here.
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6;">
            With respect,<br>
            <strong>The Ask Grandpa Team</strong>
          </p>
        </div>
        
        <div style="background: #f0ede6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
            Thank you for joining the Ask My Grandpa mentor community.
          </p>
        </div>
      </div>
    `;
    const welcomeTextContent = `
Hello ${grandpaData.name.split(' ')[0]},

We could use a hand. Thanks for offering yours.

We know you have decades of hard-earned skills and practical knowledge locked away—the kind of stuff you just can't get from a quick internet search. We are incredibly grateful that you're willing to share it with the next generation.

By signing up as a mentor, you aren't just helping someone fix a garbage disposal or patch a wall. You're connecting with your neighbors and passing down a legacy of self-reliance.

As a reminder, our golden rule is that the apprentice holds the tools. Your job isn't to do free labor; it's to guide, teach, ensure safety, and enjoy a cup of coffee while watching someone gain new confidence.

To help match you with the right neighbors looking for help, we need to know what you're best at.

Complete your profile: https://askmygrandpa.com/dashboard

Thanks again for being here.

With respect,
The Ask Grandpa Team
    `;
    // Send welcome email to grandpa
    const welcomeMailOptions = {
        from: fromEmail,
        to: grandpaData.email,
        subject: welcomeSubject,
        text: welcomeTextContent,
        html: welcomeHtmlContent,
    };
    try {
        await transporter.sendMail(welcomeMailOptions);
        console.log('Welcome email sent to grandpa successfully');
    }
    catch (error) {
        console.error('Error sending welcome email to grandpa:', error);
    }
});
// Function triggered when a new apprentice registers
exports.onApprenticeRegistration = functions.firestore
    .document('apprentices/{apprenticeId}')
    .onCreate(async (snap, context) => {
    const apprenticeData = snap.data();
    // Send admin notification
    const adminSubject = '🎓 New Apprentice Registration - Ask My Grandpa';
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">New Apprentice Registration!</h2>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Apprentice Details:</h3>
          <p><strong>Name:</strong> ${apprenticeData.name}</p>
          <p><strong>Email:</strong> ${apprenticeData.email}</p>
          <p><strong>Phone:</strong> ${apprenticeData.phone}</p>
          <p><strong>Location:</strong> ${apprenticeData.city}, ${apprenticeData.province}</p>
          <p><strong>Interests:</strong> ${apprenticeData.interests}</p>
          ${apprenticeData.note ? `<p><strong>Note:</strong> ${apprenticeData.note}</p>` : ''}
        </div>
        
        <p style="color: #666;">
          Registration Time: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This notification was sent automatically from Ask My Grandpa platform.
        </p>
      </div>
    `;
    const adminTextContent = `
New Apprentice Registration!

Name: ${apprenticeData.name}
Email: ${apprenticeData.email}
Phone: ${apprenticeData.phone}
Location: ${apprenticeData.city}, ${apprenticeData.province}
Interests: ${apprenticeData.interests}
${apprenticeData.note ? `Note: ${apprenticeData.note}` : ''}

Registration Time: ${new Date().toLocaleString()}
    `;
    await sendNotificationEmail(adminSubject, adminHtmlContent, adminTextContent);
    // Send welcome email to apprentice
    const welcomeSubject = 'Welcome to Ask My Grandpa';
    const welcomeHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
        <!-- Header with logo/banner space -->
        <div style="background: #4a4037; padding: 20px; text-align: center;">
          <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
          <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">Help is on the way.</p>
        </div>
        
        <div style="padding: 30px; background: white; margin: 0;">
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${apprenticeData.name.split(' ')[0]},
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Stuck on a project? Let's get it fixed, together.</strong>
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Welcome to Ask Grandpa.</strong> You've just joined a community of folks ready to pass down years of practical, hands-on wisdom.
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We aren't a directory of contractors. We're neighbors helping neighbors. Our mentors ("Grandpas") are here to guide you, instruct you, and supervise—but remember, <strong>you hold the tools</strong>. We want you to finish the job with a fixed problem and a new skill you get to keep forever.
          </p>
          
          <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #4a4037; margin-top: 0; font-size: 18px;">The House Rules at a glance:</h3>
            <p style="color: #4a4037; margin: 10px 0;"><strong>It's Free:</strong> No cash changes hands here. Payment is a hot cup of tea or coffee for your mentor when the job is done.</p>
            <p style="color: #4a4037; margin: 10px 0;"><strong>Learn for Life:</strong> Our goal isn't a quick fix; it's to teach you self-reliance.</p>
          </div>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Ready to tackle that project?
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://askmygrandpa.com/search" 
               style="background: #9A3412; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              Post My First Request
            </a>
          </div>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Let's get to work,<br>
            <strong>The Ask Grandpa Team</strong>
          </p>
        </div>
        
        <div style="background: #f0ede6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
            Welcome to the Ask My Grandpa community. Help is on the way.
          </p>
        </div>
      </div>
    `;
    const welcomeTextContent = `
Hi ${apprenticeData.name.split(' ')[0]},

Stuck on a project? Let's get it fixed, together.

That leaky faucet isn't going to fix itself. But that doesn't mean you have to figure it out alone.

Welcome to Ask Grandpa. You've just joined a community of folks ready to pass down years of practical, hands-on wisdom.

We aren't a directory of contractors. We're neighbors helping neighbors. Our mentors ("Grandpas") are here to guide you, instruct you, and supervise—but remember, you hold the tools. We want you to finish the job with a fixed problem and a new skill you get to keep forever.

The House Rules at a glance:
• It's Free: No cash changes hands here. Payment is a hot cup of tea or coffee for your mentor when the job is done.
• Learn for Life: Our goal isn't a quick fix; it's to teach you self-reliance.

Ready to tackle that project?
Find a grandpa: https://askmygrandpa.com/search

Let's get to work,
The Ask Grandpa Team
    `;
    // Send welcome email to apprentice
    const welcomeMailOptions = {
        from: fromEmail,
        to: apprenticeData.email,
        subject: welcomeSubject,
        text: welcomeTextContent,
        html: welcomeHtmlContent,
    };
    try {
        await transporter.sendMail(welcomeMailOptions);
        console.log('Welcome email sent to apprentice successfully');
    }
    catch (error) {
        console.error('Error sending welcome email to apprentice:', error);
    }
});
// Function triggered when a new help request is created
exports.onHelpRequest = functions.firestore
    .document('requests/{requestId}')
    .onCreate(async (snap, context) => {
    const requestData = snap.data();
    const subject = '🤝 New Help Request - Ask My Grandpa';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c05621;">New Help Request!</h2>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Subject:</strong> ${requestData.subject}</p>
          <p><strong>Skill:</strong> ${requestData.skill}</p>
          
          <h4>Apprentice:</h4>
          <p><strong>Name:</strong> ${requestData.apprenticeName}</p>
          <p><strong>Email:</strong> ${requestData.apprenticeEmail}</p>
          
          <h4>Grandpa:</h4>
          <p><strong>Name:</strong> ${requestData.grandpaName}</p>
          <p><strong>Email:</strong> ${requestData.grandpaEmail}</p>
          
          <h4>Message:</h4>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #c05621;">
            ${requestData.message}
          </p>
          
          <p><strong>Availability:</strong> ${requestData.availability}</p>
          <p><strong>Status:</strong> ${requestData.status}</p>
        </div>
        
        <p style="color: #666;">
          Request Time: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This notification was sent automatically from Ask My Grandpa platform.
        </p>
      </div>
    `;
    const textContent = `
New Help Request!

Subject: ${requestData.subject}
Skill: ${requestData.skill}

Apprentice:
Name: ${requestData.apprenticeName}
Email: ${requestData.apprenticeEmail}

Grandpa:
Name: ${requestData.grandpaName}
Email: ${requestData.grandpaEmail}

Message: ${requestData.message}

Availability: ${requestData.availability}
Status: ${requestData.status}

Request Time: ${new Date().toLocaleString()}
    `;
    await sendNotificationEmail(subject, htmlContent, textContent);
    // Also send email to the grandpa
    if (requestData.grandpaEmail) {
        const grandpaSubject = `Ask My Grandpa - A Neighbour Needs a Hand`;
        const grandpaHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
          <!-- Header with logo/banner space -->
          <div style="background: #4a4037; padding: 20px; text-align: center;">
            <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
            <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">${requestData.apprenticeName} is looking for some guidance. Can you help?</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 0;">
            <!-- Request Type Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #9A3412; font-size: 24px; font-weight: bold; margin: 0; padding: 15px; background: #f0ede6; border-radius: 8px; border: 2px solid #9A3412;">
                ${requestData.subject}
              </h2>
            </div>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello ${requestData.grandpaName.split(' ')[0]},
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>Your skills are in demand.</strong>
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              An apprentice in your area has run into a snag with a project and is hoping to borrow some of your wisdom to get it fixed.
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>Are you available to lend a hand?</strong>
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Below are the details of their request. Please review the information to see if it's a good match for your expertise and schedule.
            </p>
            
            <!-- Request Details Block -->
            <div style="background: #f0ede6; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e0ddd6;">
              <h3 style="color: #4a4037; margin-top: 0; margin-bottom: 20px; font-size: 20px;">The Request Details</h3>
              
              <p style="color: #4a4037; margin: 12px 0; font-size: 16px;">
                <strong>The Apprentice:</strong> ${requestData.apprenticeName}
              </p>
              
              <p style="color: #4a4037; margin: 12px 0; font-size: 16px;">
                <strong>The Challenge:</strong> ${requestData.skill || requestData.subject}
              </p>
              
              <p style="color: #4a4037; margin: 12px 0 8px 0; font-size: 16px;">
                <strong>Their Note to You:</strong>
              </p>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #9A3412; margin: 8px 0 12px 0;">
                <p style="color: #4a4037; margin: 0; font-style: italic; font-size: 16px; line-height: 1.5;">
                  "${requestData.message}"
                </p>
              </div>
              
              <p style="color: #4a4037; margin: 12px 0; font-size: 16px;">
                <strong>Preferred Availability:</strong> ${requestData.availability}
              </p>
            </div>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              <strong>What's Next?</strong> If you are available and willing to guide ${requestData.apprenticeName.split(' ')[0]} through this project, please click below to accept the request and coordinate a time to meet.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://askmygrandpa.com/dashboard" 
                 style="background: #9A3412; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                View Request & Reply
              </a>
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
              <p style="color: #4a4037; font-size: 14px; margin: 0;">
                <a href="https://askmygrandpa.com/dashboard" style="color: #9A3412; text-decoration: underline;">
                  Not able to help with this one? Click here to decline.
                </a>
              </p>
            </div>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 40px;">
              Thank you for being a generous part of our community.
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6;">
              With respect,<br>
              <strong>The Ask Grandpa Team</strong>
            </p>
          </div>
          
          <div style="background: #f0ede6; padding: 20px; text-align: center;">
            <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
              ${requestData.apprenticeName} is looking for guidance with ${requestData.skill || requestData.subject}.
            </p>
          </div>
        </div>
      `;
        const grandpaTextContent = `
Hello ${requestData.grandpaName.split(' ')[0]},

Your skills are in demand.

An apprentice in your area has run into a snag with a project and is hoping to borrow some of your wisdom to get it fixed.

Are you available to lend a hand?

Below are the details of their request. Please review the information to see if it's a good match for your expertise and schedule.

THE REQUEST DETAILS
The Apprentice: ${requestData.apprenticeName}
The Challenge: ${requestData.skill || requestData.subject}
Their Note to You: "${requestData.message}"
Preferred Availability: ${requestData.availability}

What's Next? If you are available and willing to guide ${requestData.apprenticeName.split(' ')[0]} through this project, please visit your dashboard to accept the request and coordinate a time to meet.

View Request & Reply: https://askmygrandpa.com/dashboard

Thank you for being a generous part of our community.

With respect,
The Ask Grandpa Team
      `;
        const grandpaMailOptions = {
            from: fromEmail,
            to: requestData.grandpaEmail,
            subject: grandpaSubject,
            text: grandpaTextContent,
            html: grandpaHtmlContent,
        };
        try {
            await transporter.sendMail(grandpaMailOptions);
            console.log('Email sent to grandpa successfully');
        }
        catch (error) {
            console.error('Error sending email to grandpa:', error);
        }
    }
});
// Function triggered when a request status changes to "accepted"
exports.onRequestAccepted = functions.firestore
    .document('requests/{requestId}')
    .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    // Only trigger if status changed from 'pending' to 'accepted'
    if (beforeData.status !== 'pending' || afterData.status !== 'accepted') {
        return;
    }
    console.log('🎉 Request accepted, adding apprentice address and sending notification...');
    const requestData = afterData;
    // Fetch apprentice's address from their profile and add it to the request
    try {
        const apprenticeQuery = admin.firestore()
            .collection('apprentices')
            .where('userId', '==', requestData.apprenticeId);
        const apprenticeSnapshot = await apprenticeQuery.get();
        if (!apprenticeSnapshot.empty) {
            const apprenticeData = apprenticeSnapshot.docs[0].data();
            const apprenticeAddress = apprenticeData.address || '';
            // Update the request with the apprentice's address (now that it's accepted)
            await admin.firestore()
                .collection('requests')
                .doc(context.params.requestId)
                .update({
                apprenticeAddress: apprenticeAddress
            });
            console.log('✅ Apprentice address added to accepted request');
        }
    }
    catch (error) {
        console.error('❌ Error adding apprentice address:', error);
    }
    // Send notification email to apprentice
    if (requestData.apprenticeEmail) {
        const subject = 'Good news! Help is on the way for your project.';
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
          <!-- Header with logo/banner space -->
          <div style="background: #4a4037; padding: 20px; text-align: center;">
            <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
            <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">A mentor has accepted your request. Time to connect.</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 0;">
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${requestData.apprenticeName.split(' ')[0]},
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>We have great news. You've got a match.</strong>
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Grandpa <strong>${requestData.grandpaName}</strong> has seen your request for help with <strong>${requestData.skill || requestData.subject}</strong> and is ready to lend a hand.
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>Now it's time to make it official.</strong>
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Please log in to your dashboard to review the details, confirm a time that works for both of you, and accept the mentorship connect. Once you do, you'll be able to communicate directly to sort out the final details.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://askmygrandpa.com/dashboard" 
                 style="background: #9A3412; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Log In to Finalize Details
              </a>
            </div>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Get that coffee pot ready—it's almost time to get to work.
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
              Warmly,<br>
              <strong>The Ask Grandpa Team</strong>
            </p>
          </div>
          
          <div style="background: #f0ede6; padding: 20px; text-align: center;">
            <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
              A mentor has accepted your request for ${requestData.skill || requestData.subject} help.
            </p>
          </div>
        </div>
      `;
        const textContent = `
Hi ${requestData.apprenticeName.split(' ')[0]},

We have great news. You've got a match.

Grandpa ${requestData.grandpaName} has seen your request for help with ${requestData.skill || requestData.subject} and is ready to lend a hand.

Now it's time to make it official.

Please log in to your dashboard to review the details, confirm a time that works for both of you, and accept the mentorship connect. Once you do, you'll be able to communicate directly to sort out the final details.

Log in to finalize details: https://askmygrandpa.com/dashboard

Get that coffee pot ready—it's almost time to get to work.

Warmly,
The Ask Grandpa Team
      `;
        const mailOptions = {
            from: fromEmail,
            to: requestData.apprenticeEmail,
            subject: subject,
            text: textContent,
            html: htmlContent,
        };
        try {
            await transporter.sendMail(mailOptions);
            console.log('✅ Request accepted notification sent to apprentice successfully');
        }
        catch (error) {
            console.error('❌ Error sending request accepted notification to apprentice:', error);
        }
    }
    // Also send admin notification
    const adminSubject = '🤝 Request Accepted - Ask My Grandpa';
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Request Accepted!</h2>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Match Details:</h3>
          <p><strong>Apprentice:</strong> ${requestData.apprenticeName} (${requestData.apprenticeEmail})</p>
          <p><strong>Grandpa:</strong> ${requestData.grandpaName} (${requestData.grandpaEmail})</p>
          <p><strong>Project:</strong> ${requestData.skill || requestData.subject}</p>
          <p><strong>Message:</strong> ${requestData.message}</p>
          <p><strong>Proposed Time:</strong> ${requestData.proposedTime || 'Not specified'}</p>
          <p><strong>Grandpa Response:</strong> ${requestData.grandpaResponse || 'Not specified'}</p>
        </div>
        
        <p style="color: #666;">
          Accepted Time: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This notification was sent automatically from Ask My Grandpa platform.
        </p>
      </div>
    `;
    const adminTextContent = `
Request Accepted!

Apprentice: ${requestData.apprenticeName} (${requestData.apprenticeEmail})
Grandpa: ${requestData.grandpaName} (${requestData.grandpaEmail})
Project: ${requestData.skill || requestData.subject}
Message: ${requestData.message}
Proposed Time: ${requestData.proposedTime || 'Not specified'}
Grandpa Response: ${requestData.grandpaResponse || 'Not specified'}

Accepted Time: ${new Date().toLocaleString()}
    `;
    await sendNotificationEmail(adminSubject, adminHtmlContent, adminTextContent);
});
// Function triggered when a request status changes to "confirmed"
exports.onSessionConfirmed = functions.firestore
    .document('requests/{requestId}')
    .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    // Only trigger if status changed from 'accepted' to 'confirmed'
    if (beforeData.status !== 'accepted' || afterData.status !== 'confirmed') {
        return;
    }
    console.log('📅 Session confirmed, sending notification to grandpa...');
    const requestData = afterData;
    // Send notification email to grandpa
    if (requestData.grandpaEmail) {
        const subject = 'Mentorship Session Confirmed.';
        // Format the date and time (using the proposedTime field for now)
        const sessionDateTime = requestData.proposedTime || 'Time to be determined';
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
          <!-- Header with logo/banner space -->
          <div style="background: #4a4037; padding: 20px; text-align: center;">
            <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
            <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">Here are the final details for your upcoming mentorship session.</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 0;">
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello ${requestData.grandpaName.split(' ')[0]},
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>It's officially on the calendar.</strong>
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${requestData.apprenticeName.split(' ')[0]} has confirmed the time and is looking forward to learning from you. Thank you again for making yourself available to pass on your knowledge.
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>Here are the final details for your session:</strong>
            </p>
            
            <!-- Session Confirmation Card -->
            <div style="background: #f0ede6; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #4a4037;">
              <h3 style="color: #4a4037; margin-top: 0; margin-bottom: 20px; font-size: 20px; text-align: center;">Session Confirmation Card</h3>
              
              <div style="margin-bottom: 15px;">
                <p style="color: #4a4037; margin: 0; font-size: 16px;">
                  <strong>The Project:</strong> ${requestData.skill || requestData.subject}
                </p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <p style="color: #4a4037; margin: 0; font-size: 16px;">
                  <strong>When:</strong> ${sessionDateTime}
                </p>
              </div>
              
              <div style="margin-bottom: 0;">
                <p style="color: #4a4037; margin: 0; font-size: 16px;">
                  <strong>Where:</strong> The home of ${requestData.apprenticeName.split(' ')[0]}
                </p>
                <p style="color: #4a4037; margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">
                  ${requestData.apprenticeAddress || 'Address details will be shared separately'}
                </p>
              </div>
            </div>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>A final thought before you head out:</strong>
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Remember, your role is to be the calm voice of experience. Guide their hands, prioritize safety, and let them handle the tools. Mistakes might happen, and that's okay—that's usually where the real learning happens.
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Enjoy the session and perhaps a good cup of coffee afterward.
            </p>
            
            <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
              With gratitude,<br>
              <strong>The Ask Grandpa Team</strong>
            </p>
          </div>
          
          <div style="background: #f0ede6; padding: 20px; text-align: center;">
            <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
              Your mentorship session with ${requestData.apprenticeName.split(' ')[0]} has been confirmed.
            </p>
          </div>
        </div>
      `;
        const textContent = `
Hello ${requestData.grandpaName.split(' ')[0]},

It's officially on the calendar.

${requestData.apprenticeName.split(' ')[0]} has confirmed the time and is looking forward to learning from you. Thank you again for making yourself available to pass on your knowledge.

Here are the final details for your session:

SESSION CONFIRMATION CARD
The Project: ${requestData.skill || requestData.subject}
When: ${sessionDateTime}
Where: The home of ${requestData.apprenticeName.split(' ')[0]}
${requestData.apprenticeAddress || 'Address details will be shared separately'}

A final thought before you head out:

Remember, your role is to be the calm voice of experience. Guide their hands, prioritize safety, and let them handle the tools. Mistakes might happen, and that's okay—that's usually where the real learning happens.

Enjoy the session and perhaps a good cup of coffee afterward.

With gratitude,
The Ask Grandpa Team
      `;
        const mailOptions = {
            from: fromEmail,
            to: requestData.grandpaEmail,
            subject: subject,
            text: textContent,
            html: htmlContent,
        };
        try {
            await transporter.sendMail(mailOptions);
            console.log('✅ Session confirmed notification sent to grandpa successfully');
        }
        catch (error) {
            console.error('❌ Error sending session confirmed notification to grandpa:', error);
        }
    }
    // Also send admin notification
    const adminSubject = '📅 Session Confirmed - Ask My Grandpa';
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Session Confirmed!</h2>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details:</h3>
          <p><strong>Apprentice:</strong> ${requestData.apprenticeName} (${requestData.apprenticeEmail})</p>
          <p><strong>Grandpa:</strong> ${requestData.grandpaName} (${requestData.grandpaEmail})</p>
          <p><strong>Project:</strong> ${requestData.skill || requestData.subject}</p>
          <p><strong>Scheduled Time:</strong> ${requestData.proposedTime || 'Not specified'}</p>
          <p><strong>Apprentice Address:</strong> ${requestData.apprenticeAddress || 'Not provided'}</p>
          <p><strong>Original Message:</strong> ${requestData.message}</p>
          <p><strong>Grandpa Response:</strong> ${requestData.grandpaResponse || 'Not specified'}</p>
          <p><strong>Apprentice Confirmation:</strong> ${requestData.apprenticeConfirmation || 'Not specified'}</p>
        </div>
        
        <p style="color: #666;">
          Confirmed Time: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This notification was sent automatically from Ask My Grandpa platform.
        </p>
      </div>
    `;
    const adminTextContent = `
Session Confirmed!

Apprentice: ${requestData.apprenticeName} (${requestData.apprenticeEmail})
Grandpa: ${requestData.grandpaName} (${requestData.grandpaEmail})
Project: ${requestData.skill || requestData.subject}
Scheduled Time: ${requestData.proposedTime || 'Not specified'}
Apprentice Address: ${requestData.apprenticeAddress || 'Not provided'}
Original Message: ${requestData.message}
Grandpa Response: ${requestData.grandpaResponse || 'Not specified'}
Apprentice Confirmation: ${requestData.apprenticeConfirmation || 'Not specified'}

Confirmed Time: ${new Date().toLocaleString()}
    `;
    await sendNotificationEmail(adminSubject, adminHtmlContent, adminTextContent);
});
// Scheduled function to send 24-hour reminder emails
// Runs daily at 9:00 AM to check for sessions happening in 24 hours
exports.send24HourReminders = functions.pubsub.schedule('0 9 * * *')
    .timeZone('America/Denver') // Adjust timezone as needed
    .onRun(async (context) => {
    console.log('🕘 Running 24-hour reminder check...');
    try {
        // Calculate the target time range (24 hours from now, with some buffer)
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        const bufferStart = new Date(tomorrow.getTime() - 2 * 60 * 60 * 1000); // 22 hours from now
        const bufferEnd = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000); // 26 hours from now
        console.log('🔍 Checking for sessions between:', bufferStart.toISOString(), 'and', bufferEnd.toISOString());
        // Query for confirmed sessions
        const confirmedSessionsQuery = admin.firestore()
            .collection('requests')
            .where('status', '==', 'confirmed');
        const querySnapshot = await confirmedSessionsQuery.get();
        console.log(`📋 Found ${querySnapshot.docs.length} confirmed sessions to check`);
        let remindersSent = 0;
        for (const doc of querySnapshot.docs) {
            const sessionData = doc.data();
            console.log(`🔍 Checking session ${doc.id} for ${sessionData.apprenticeName} with ${sessionData.grandpaName}`);
            // Check if session has calendar-based availability or confirmed time
            let sessionDateTime = null;
            // First priority: confirmedDateTime from calendar confirmation
            if (sessionData.confirmedDateTime) {
                sessionDateTime = new Date(sessionData.confirmedDateTime);
                console.log(`📅 Found confirmedDateTime: ${sessionDateTime.toISOString()}`);
            }
            // Second priority: finalSelectedTime from apprentice confirmation
            else if (sessionData.finalSelectedTime && sessionData.finalSelectedTime.length > 0) {
                const selectedSlot = sessionData.finalSelectedTime[0];
                const date = new Date(selectedSlot.date);
                const hour = selectedSlot.timeSlots[0];
                date.setHours(hour, 0, 0, 0);
                sessionDateTime = date;
                console.log(`📅 Parsed finalSelectedTime: ${sessionDateTime.toISOString()}`);
            }
            // Third priority: grandpaAvailability (new calendar format)
            else if (sessionData.grandpaAvailability && Array.isArray(sessionData.grandpaAvailability)) {
                // Get the first available slot as the session time
                const firstSlot = sessionData.grandpaAvailability[0];
                if (firstSlot && firstSlot.date && firstSlot.timeSlots && firstSlot.timeSlots.length > 0) {
                    const sessionDate = new Date(firstSlot.date);
                    const sessionHour = firstSlot.timeSlots[0]; // Use first time slot
                    sessionDate.setHours(sessionHour, 0, 0, 0);
                    sessionDateTime = sessionDate;
                    console.log(`📅 Parsed grandpaAvailability: ${sessionDateTime.toISOString()}`);
                }
            }
            // Fallback to legacy text parsing
            else if (sessionData.proposedTime) {
                const sessionTimeStr = sessionData.proposedTime.toLowerCase();
                // Simple check if the session mentions "tomorrow" or contains time indicators
                const shouldSendReminder = sessionTimeStr.includes('tomorrow') ||
                    sessionTimeStr.includes('24 hour') ||
                    sessionTimeStr.includes('next day');
                if (shouldSendReminder) {
                    sessionDateTime = tomorrow; // Use tomorrow as approximate time
                    console.log(`📅 Using heuristic for "tomorrow" mention: ${sessionDateTime.toISOString()}`);
                }
            }
            // Check if session is within our 24-hour window
            if (sessionDateTime && sessionDateTime >= bufferStart && sessionDateTime <= bufferEnd) {
                console.log(`📧 Sending 24-hour reminders for session ${doc.id} scheduled for ${sessionDateTime.toISOString()}`);
                // Send reminder to apprentice
                if (sessionData.apprenticeEmail) {
                    await sendApprenticeReminder(Object.assign(Object.assign({}, sessionData), { sessionDateTime: sessionDateTime.toISOString(), formattedDate: sessionDateTime.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        }), formattedTime: sessionDateTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) }));
                }
                // Send reminder to grandpa
                if (sessionData.grandpaEmail) {
                    await sendGrandpaReminder(Object.assign(Object.assign({}, sessionData), { sessionDateTime: sessionDateTime.toISOString(), formattedDate: sessionDateTime.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        }), formattedTime: sessionDateTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) }));
                }
                remindersSent++;
            }
            else if (sessionDateTime) {
                console.log(`⏰ Session ${doc.id} at ${sessionDateTime.toISOString()} is outside 24-hour window`);
            }
            else {
                console.log(`❓ Could not determine session time for ${doc.id}, proposedTime: ${sessionData.proposedTime}`);
            }
        }
        console.log(`✅ 24-hour reminder check complete. Sent ${remindersSent} reminder pairs.`);
    }
    catch (error) {
        console.error('❌ Error in 24-hour reminder job:', error);
    }
});
// Function to send additional messages between users
exports.sendAdditionalMessage = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { recipientEmail, recipientName, senderName, message, subject, requestId } = req.body;
        if (!recipientEmail || !recipientName || !senderName || !message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const emailSubject = `New Message: ${subject}`;
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
        <!-- Header -->
        <div style="background: #4a4037; padding: 20px; text-align: center;">
          <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
          <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">You have a new message</p>
        </div>
        
        <div style="padding: 30px; background: white; margin: 0;">
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${recipientName.split(' ')[0]},
          </p>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>${senderName}</strong> sent you a new message regarding: <strong>${subject}</strong>
          </p>
          
          <!-- Message Content -->
          <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #9A3412;">
            <p style="color: #4a4037; margin: 0; font-size: 16px; line-height: 1.6; font-style: italic;">
              "${message}"
            </p>
          </div>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            To respond, please log in to your Ask My Grandpa dashboard and view your messages.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://askmygrandpa.com/dashboard" 
               style="background: #9A3412; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              View Messages
            </a>
          </div>
          
          <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong>The Ask My Grandpa Team</strong>
          </p>
        </div>
        
        <div style="background: #f0ede6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
            This message was sent through the Ask My Grandpa platform.
          </p>
        </div>
      </div>
    `;
        const textContent = `
Hi ${recipientName.split(' ')[0]},

${senderName} sent you a new message regarding: ${subject}

Message:
"${message}"

To respond, please log in to your Ask My Grandpa dashboard and view your messages.

Visit: https://askmygrandpa.com/dashboard

Best regards,
The Ask My Grandpa Team
    `;
        const mailOptions = {
            from: fromEmail,
            to: recipientEmail,
            subject: emailSubject,
            text: textContent,
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log('✅ Additional message notification sent successfully');
        res.status(200).json({ success: true, message: 'Message notification sent successfully' });
    }
    catch (error) {
        console.error('❌ Error sending additional message notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Function to validate Turnstile token server-side
const validateTurnstileToken = async (token) => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
        console.warn('TURNSTILE_SECRET_KEY not configured, skipping validation');
        return true; // Allow in development if not configured
    }
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        });
        const data = await response.json();
        return data.success === true;
    }
    catch (error) {
        console.error('Turnstile validation error:', error);
        return false;
    }
};
// HTTP endpoint for grandpa registration with rate limiting
// HTTP endpoint for grandpa registration with rate limiting
exports.registerGrandpa = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // Rate limiting check
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `grandpa_registration:${clientIP}`;
    const windowMs = 300000; // 5 minutes
    const maxRequests = 5;
    // Clean up expired entries
    if (rateLimitStore.has(key)) {
        const entry = rateLimitStore.get(key);
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
    // Check current rate limit
    const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
    if (entry.count >= maxRequests && now < entry.resetTime) {
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
        res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Please wait ${remainingTime} seconds before trying again.`,
            retryAfter: remainingTime
        });
        return;
    }
    // Update count
    entry.count++;
    rateLimitStore.set(key, entry);
    // Payload size limit check
    const bodySize = JSON.stringify(req.body).length;
    if (bodySize > 10240) { // 10KB limit
        res.status(413).json({
            error: 'Payload Too Large',
            message: `Request body too large. Maximum size is 10240 bytes. Received: ${bodySize} bytes.`,
            maxSize: 10240,
            receivedSize: bodySize
        });
        return;
    }
    try {
        const grandpaData = req.body;
        // Validate Turnstile token if provided
        if (grandpaData.turnstileToken) {
            const isValidToken = await validateTurnstileToken(grandpaData.turnstileToken);
            if (!isValidToken) {
                res.status(400).json({ error: 'Invalid security verification' });
                return;
            }
        }
        // Validate required fields
        if (!grandpaData.name || !grandpaData.email || !grandpaData.address) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Add timestamp and source
        grandpaData.timestamp = new Date().toISOString();
        grandpaData.source = 'api';
        // Save to Firestore
        const docRef = await admin.firestore().collection('grandpas').add(grandpaData);
        res.status(200).json({
            success: true,
            id: docRef.id,
            message: 'Grandpa registered successfully'
        });
    }
    catch (error) {
        console.error('Error registering grandpa:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// HTTP endpoint for apprentice registration with rate limiting
// HTTP endpoint for apprentice registration with rate limiting
exports.registerApprentice = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // Rate limiting check
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `apprentice_registration:${clientIP}`;
    const windowMs = 300000; // 5 minutes
    const maxRequests = 5;
    // Clean up expired entries
    if (rateLimitStore.has(key)) {
        const entry = rateLimitStore.get(key);
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
    // Check current rate limit
    const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
    if (entry.count >= maxRequests && now < entry.resetTime) {
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
        res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Please wait ${remainingTime} seconds before trying again.`,
            retryAfter: remainingTime
        });
        return;
    }
    // Update count
    entry.count++;
    rateLimitStore.set(key, entry);
    // Payload size limit check
    const bodySize = JSON.stringify(req.body).length;
    if (bodySize > 10240) { // 10KB limit
        res.status(413).json({
            error: 'Payload Too Large',
            message: `Request body too large. Maximum size is 10240 bytes. Received: ${bodySize} bytes.`,
            maxSize: 10240,
            receivedSize: bodySize
        });
        return;
    }
    try {
        const apprenticeData = req.body;
        // Validate Turnstile token if provided
        if (apprenticeData.turnstileToken) {
            const isValidToken = await validateTurnstileToken(apprenticeData.turnstileToken);
            if (!isValidToken) {
                res.status(400).json({ error: 'Invalid security verification' });
                return;
            }
        }
        // Validate required fields
        if (!apprenticeData.name || !apprenticeData.email || !apprenticeData.address) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Add timestamp and source
        apprenticeData.timestamp = new Date().toISOString();
        apprenticeData.source = 'api';
        // Save to Firestore
        const docRef = await admin.firestore().collection('apprentices').add(apprenticeData);
        res.status(200).json({
            success: true,
            id: docRef.id,
            message: 'Apprentice registered successfully'
        });
    }
    catch (error) {
        console.error('Error registering apprentice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// HTTP endpoint for help requests with rate limiting
// HTTP endpoint for help requests with rate limiting
exports.submitHelpRequest = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // Rate limiting check (stricter for help requests)
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `help_request:${clientIP}`;
    const windowMs = 60000; // 1 minute
    const maxRequests = 5;
    // Clean up expired entries
    if (rateLimitStore.has(key)) {
        const entry = rateLimitStore.get(key);
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
    // Check current rate limit
    const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
    if (entry.count >= maxRequests && now < entry.resetTime) {
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
        res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Please wait ${remainingTime} seconds before trying again.`,
            retryAfter: remainingTime
        });
        return;
    }
    // Update count
    entry.count++;
    rateLimitStore.set(key, entry);
    // Payload size limit check
    const bodySize = JSON.stringify(req.body).length;
    if (bodySize > 10240) { // 10KB limit
        res.status(413).json({
            error: 'Payload Too Large',
            message: `Request body too large. Maximum size is 10240 bytes. Received: ${bodySize} bytes.`,
            maxSize: 10240,
            receivedSize: bodySize
        });
        return;
    }
    try {
        const requestData = req.body;
        // Validate Turnstile token if provided
        if (requestData.turnstileToken) {
            const isValidToken = await validateTurnstileToken(requestData.turnstileToken);
            if (!isValidToken) {
                res.status(400).json({ error: 'Invalid security verification' });
                return;
            }
        }
        // Validate required fields
        if (!requestData.apprenticeId || !requestData.grandpaId || !requestData.subject || !requestData.message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Add timestamp and status
        requestData.timestamp = new Date().toISOString();
        requestData.status = 'pending';
        // Save to Firestore (without apprentice address for security)
        const docRef = await admin.firestore().collection('requests').add(requestData);
        res.status(200).json({
            success: true,
            id: docRef.id,
            message: 'Help request submitted successfully'
        });
    }
    catch (error) {
        console.error('Error submitting help request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Helper function to send apprentice reminder
const sendApprenticeReminder = async (sessionData) => {
    const subject = "Reminder: You're gearing up tomorrow!";
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
      <!-- Header with logo/banner space -->
      <div style="background: #4a4037; padding: 20px; text-align: center;">
        <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
        <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">Your mentorship session with Grandpa ${sessionData.grandpaName.split(' ')[0]} is in 24 hours.</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 0;">
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi ${sessionData.apprenticeName.split(' ')[0]},
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Just a quick heads-up that your session to tackle that <strong>${sessionData.skill || sessionData.subject}</strong> project is happening tomorrow.
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          <strong>Are you ready to get your hands dirty?</strong>
        </p>
        
        <!-- Session Details Card -->
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #9A3412;">
          <h3 style="color: #4a4037; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Session Details:</h3>
          
          <p style="color: #4a4037; margin: 8px 0; font-size: 16px;">
            <strong>Mentor:</strong> Grandpa ${sessionData.grandpaName}
          </p>
          
          <p style="color: #4a4037; margin: 8px 0; font-size: 16px;">
            <strong>Time:</strong> ${sessionData.formattedDate ? `${sessionData.formattedDate} at ${sessionData.formattedTime}` : sessionData.proposedTime || 'Time TBD'}
          </p>
        </div>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          <strong>A Quick Prep Checklist:</strong>
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Since you hold the tools, please make sure you have the necessary materials and workspace ready before your mentor arrives. They are bringing the wisdom, but you need to provide the hardware.
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We can't wait to see what you build.
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          Cheers,<br>
          <strong>The Ask Grandpa Team</strong>
        </p>
      </div>
      
      <div style="background: #f0ede6; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
          Your mentorship session is tomorrow. Get ready to learn!
        </p>
      </div>
    </div>
  `;
    const textContent = `
Hi ${sessionData.apprenticeName.split(' ')[0]},

Just a quick heads-up that your session to tackle that ${sessionData.skill || sessionData.subject} project is happening tomorrow.

Are you ready to get your hands dirty?

SESSION DETAILS:
Mentor: Grandpa ${sessionData.grandpaName}
Time: Tomorrow at ${sessionData.proposedTime}

A Quick Prep Checklist:
Since you hold the tools, please make sure you have the necessary materials and workspace ready before your mentor arrives. They are bringing the wisdom, but you need to provide the hardware.

We can't wait to see what you build.

Cheers,
The Ask Grandpa Team
  `;
    const mailOptions = {
        from: fromEmail,
        to: sessionData.apprenticeEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ 24-hour reminder sent to apprentice successfully');
    }
    catch (error) {
        console.error('❌ Error sending 24-hour reminder to apprentice:', error);
    }
};
// Helper function to send grandpa reminder
const sendGrandpaReminder = async (sessionData) => {
    const subject = "Reminder: Mentorship session tomorrow.";
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
      <!-- Header with logo/banner space -->
      <div style="background: #4a4037; padding: 20px; text-align: center;">
        <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
        <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">You are scheduled to help ${sessionData.apprenticeName.split(' ')[0]} in 24 hours.</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 0;">
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${sessionData.grandpaName.split(' ')[0]},
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          This is a quick reminder that you are scheduled to lend a hand tomorrow.
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Thanks again for taking the time to pass on your skills. <strong>${sessionData.apprenticeName.split(' ')[0]} is looking forward to it.</strong>
        </p>
        
        <!-- Session Details Card -->
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #9A3412;">
          <h3 style="color: #4a4037; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Session Details:</h3>
          
          <p style="color: #4a4037; margin: 8px 0; font-size: 16px;">
            <strong>Apprentice:</strong> ${sessionData.apprenticeName}
          </p>
          
          <p style="color: #4a4037; margin: 8px 0; font-size: 16px;">
            <strong>Time:</strong> ${sessionData.formattedDate ? `${sessionData.formattedDate} at ${sessionData.formattedTime}` : sessionData.proposedTime || 'Time TBD'}
          </p>
          
          <p style="color: #4a4037; margin: 8px 0; font-size: 16px;">
            <strong>Location:</strong> ${sessionData.apprenticeAddress || 'Address details provided separately'}
          </p>
        </div>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Drive safe, and enjoy the session.
        </p>
        
        <p style="color: #4a4037; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          With respect,<br>
          <strong>The Ask Grandpa Team</strong>
        </p>
      </div>
      
      <div style="background: #f0ede6; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #4a4037; opacity: 0.7; margin: 0;">
          Your mentorship session is tomorrow. Safe travels!
        </p>
      </div>
    </div>
  `;
    const textContent = `
Hello ${sessionData.grandpaName.split(' ')[0]},

This is a quick reminder that you are scheduled to lend a hand tomorrow.

Thanks again for taking the time to pass on your skills. ${sessionData.apprenticeName.split(' ')[0]} is looking forward to it.

SESSION DETAILS:
Apprentice: ${sessionData.apprenticeName}
Time: Tomorrow at ${sessionData.proposedTime}
Location: ${sessionData.apprenticeAddress || 'Address details provided separately'}

Drive safe, and enjoy the session.

With respect,
The Ask Grandpa Team
  `;
    const mailOptions = {
        from: fromEmail,
        to: sessionData.grandpaEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ 24-hour reminder sent to grandpa successfully');
    }
    catch (error) {
        console.error('❌ Error sending 24-hour reminder to grandpa:', error);
    }
};
// Function to handle verification requests
exports.onVerificationRequest = functions.firestore
    .document('verificationRequests/{requestId}')
    .onCreate(async (snap, context) => {
    const requestData = snap.data();
    // Send admin notification
    const adminSubject = '🔍 New Verification Request - Ask My Grandpa';
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9A3412;">New Verification Request!</h2>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Grandpa Details:</h3>
          <p><strong>Name:</strong> ${requestData.grandpaName}</p>
          <p><strong>Email:</strong> ${requestData.grandpaEmail}</p>
          <p><strong>Phone:</strong> ${requestData.grandpaPhone}</p>
          
          <h4 style="margin-top: 20px;">Availability for Verification Call:</h4>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #9A3412;">
            <p style="margin: 0; white-space: pre-line;">${requestData.availability}</p>
          </div>
          
          <p style="margin-top: 15px;"><strong>Status:</strong> ${requestData.status}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>Action Required:</strong> Please schedule a 10-minute verification call with this grandpa and update their status in the admin panel.
          </p>
        </div>
        
        <p style="color: #666;">
          Request Time: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          This notification was sent automatically from Ask My Grandpa platform.
        </p>
      </div>
    `;
    const adminTextContent = `
New Verification Request!

Grandpa Details:
Name: ${requestData.grandpaName}
Email: ${requestData.grandpaEmail}
Phone: ${requestData.grandpaPhone}

Availability for Verification Call:
${requestData.availability}

Status: ${requestData.status}

Action Required: Please schedule a 10-minute verification call with this grandpa and update their status in the admin panel.

Request Time: ${new Date().toLocaleString()}
    `;
    await sendNotificationEmail(adminSubject, adminHtmlContent, adminTextContent);
    console.log('Verification request notification sent to admin');
});
//# sourceMappingURL=index.js.map