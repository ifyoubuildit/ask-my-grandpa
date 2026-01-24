"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onHelpRequest = exports.onApprenticeRegistration = exports.onGrandpaRegistration = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
// Initialize Firebase Admin
admin.initializeApp();
// Email configuration using environment variables
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;
const adminEmail = process.env.ADMIN_EMAIL || 'info@askmygrandpa.com'; // Your notification email
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
        from: gmailEmail,
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
    const welcomeSubject = '🎉 Welcome to Ask My Grandpa - Please Verify Your Email';
    const welcomeHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9A3412;">Welcome to Ask My Grandpa, ${grandpaData.name}!</h2>
        
        <p>Thank you for joining our community of skilled grandpas ready to help the next generation!</p>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Registration Details:</h3>
          <p><strong>Name:</strong> ${grandpaData.name}</p>
          <p><strong>Email:</strong> ${grandpaData.email}</p>
          <p><strong>Skills:</strong> ${grandpaData.skills}</p>
          <p><strong>Location:</strong> ${grandpaData.city}, ${grandpaData.province}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://askmygrandpa.com/dashboard" 
             style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Access Your Dashboard
          </a>
        </div>
        
        <p><strong>What's Next?</strong></p>
        <ul>
          <li>Complete your profile if needed</li>
          <li>Wait for apprentices to reach out for help</li>
          <li>Share your knowledge and experience!</li>
        </ul>
        
        <p>We'll notify you by email when someone requests your expertise.</p>
        
        <p>Best regards,<br>The Ask My Grandpa Team</p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `;
    const welcomeTextContent = `
Welcome to Ask My Grandpa, ${grandpaData.name}!

Thank you for joining our community of skilled grandpas ready to help the next generation!

Your Registration Details:
Name: ${grandpaData.name}
Email: ${grandpaData.email}
Skills: ${grandpaData.skills}
Location: ${grandpaData.city}, ${grandpaData.province}

Access your dashboard: https://askmygrandpa.com/dashboard

What's Next?
- Complete your profile if needed
- Wait for apprentices to reach out for help
- Share your knowledge and experience!

We'll notify you by email when someone requests your expertise.

Best regards,
The Ask My Grandpa Team
    `;
    // Send welcome email to grandpa
    const welcomeMailOptions = {
        from: gmailEmail,
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
    const welcomeSubject = '🎓 Welcome to Ask My Grandpa - Start Learning!';
    const welcomeHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Welcome to Ask My Grandpa, ${apprenticeData.name}!</h2>
        
        <p>Welcome to our community! You're now connected to experienced grandpas ready to share their knowledge.</p>
        
        <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Registration Details:</h3>
          <p><strong>Name:</strong> ${apprenticeData.name}</p>
          <p><strong>Email:</strong> ${apprenticeData.email}</p>
          <p><strong>Interests:</strong> ${apprenticeData.interests}</p>
          <p><strong>Location:</strong> ${apprenticeData.city}, ${apprenticeData.province}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://askmygrandpa.com/search" 
             style="background: #c05621; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Find a Grandpa
          </a>
        </div>
        
        <p><strong>What's Next?</strong></p>
        <ul>
          <li>Browse available grandpas in your area</li>
          <li>Send help requests for specific skills</li>
          <li>Learn from experienced mentors!</li>
        </ul>
        
        <p>Ready to start learning? Search for grandpas with the skills you need!</p>
        
        <p>Best regards,<br>The Ask My Grandpa Team</p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `;
    const welcomeTextContent = `
Welcome to Ask My Grandpa, ${apprenticeData.name}!

Welcome to our community! You're now connected to experienced grandpas ready to share their knowledge.

Your Registration Details:
Name: ${apprenticeData.name}
Email: ${apprenticeData.email}
Interests: ${apprenticeData.interests}
Location: ${apprenticeData.city}, ${apprenticeData.province}

Find a grandpa: https://askmygrandpa.com/search

What's Next?
- Browse available grandpas in your area
- Send help requests for specific skills
- Learn from experienced mentors!

Ready to start learning? Search for grandpas with the skills you need!

Best regards,
The Ask My Grandpa Team
    `;
    // Send welcome email to apprentice
    const welcomeMailOptions = {
        from: gmailEmail,
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
        const grandpaMailOptions = {
            from: gmailEmail,
            to: requestData.grandpaEmail,
            subject: `🤝 New Help Request: ${requestData.subject}`,
            text: `
Hi ${requestData.grandpaName},

You have a new help request from ${requestData.apprenticeName}!

Subject: ${requestData.subject}
Message: ${requestData.message}
Availability: ${requestData.availability}

Apprentice Contact:
Email: ${requestData.apprenticeEmail}

Please log into your dashboard at https://askmygrandpa.com/dashboard to respond.

Best regards,
Ask My Grandpa Team
        `,
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #c05621;">New Help Request!</h2>
            
            <p>Hi ${requestData.grandpaName},</p>
            
            <p>You have a new help request from <strong>${requestData.apprenticeName}</strong>!</p>
            
            <div style="background: #f0ede6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Subject:</strong> ${requestData.subject}</p>
              <p><strong>Message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #c05621;">
                ${requestData.message}
              </p>
              <p><strong>Availability:</strong> ${requestData.availability}</p>
              <p><strong>Apprentice Email:</strong> ${requestData.apprenticeEmail}</p>
            </div>
            
            <p>
              <a href="https://askmygrandpa.com/dashboard" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in Dashboard
              </a>
            </p>
            
            <p>Best regards,<br>Ask My Grandpa Team</p>
          </div>
        `,
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
//# sourceMappingURL=index.js.map