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
    const subject = '🎉 New Grandpa Registration - Ask My Grandpa';
    const htmlContent = `
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
    const textContent = `
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
    await sendNotificationEmail(subject, htmlContent, textContent);
});
// Function triggered when a new apprentice registers
exports.onApprenticeRegistration = functions.firestore
    .document('apprentices/{apprenticeId}')
    .onCreate(async (snap, context) => {
    const apprenticeData = snap.data();
    const subject = '🎓 New Apprentice Registration - Ask My Grandpa';
    const htmlContent = `
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
    const textContent = `
New Apprentice Registration!

Name: ${apprenticeData.name}
Email: ${apprenticeData.email}
Phone: ${apprenticeData.phone}
Location: ${apprenticeData.city}, ${apprenticeData.province}
Interests: ${apprenticeData.interests}
${apprenticeData.note ? `Note: ${apprenticeData.note}` : ''}

Registration Time: ${new Date().toLocaleString()}
    `;
    await sendNotificationEmail(subject, htmlContent, textContent);
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