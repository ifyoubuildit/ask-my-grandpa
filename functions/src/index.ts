import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

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
const sendNotificationEmail = async (
  subject: string,
  htmlContent: string,
  textContent: string
) => {
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
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};

// Function triggered when a new grandpa registers
export const onGrandpaRegistration = functions.firestore
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
    const welcomeSubject = 'We could use a hand. Thanks for offering yours.';
    
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
            <strong>Thank you for stepping up to join Ask Grandpa.</strong>
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

Thank you for stepping up to join Ask Grandpa.

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
      from: gmailEmail,
      to: grandpaData.email,
      subject: welcomeSubject,
      text: welcomeTextContent,
      html: welcomeHtmlContent,
    };
    
    try {
      await transporter.sendMail(welcomeMailOptions);
      console.log('Welcome email sent to grandpa successfully');
    } catch (error) {
      console.error('Error sending welcome email to grandpa:', error);
    }
  });

// Function triggered when a new apprentice registers
export const onApprenticeRegistration = functions.firestore
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
    const welcomeSubject = 'Stuck on a project? Let\'s get it fixed, together.';
    
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
            That leaky faucet isn't going to fix itself. But that doesn't mean you have to figure it out alone.
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
      from: gmailEmail,
      to: apprenticeData.email,
      subject: welcomeSubject,
      text: welcomeTextContent,
      html: welcomeHtmlContent,
    };
    
    try {
      await transporter.sendMail(welcomeMailOptions);
      console.log('Welcome email sent to apprentice successfully');
    } catch (error) {
      console.error('Error sending welcome email to apprentice:', error);
    }
  });

// Function triggered when a new help request is created
export const onHelpRequest = functions.firestore
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
      const grandpaSubject = `A neighbor needs a hand: New ${requestData.skill || requestData.subject} Request`;
      
      const grandpaHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f0ede6;">
          <!-- Header with logo/banner space -->
          <div style="background: #4a4037; padding: 20px; text-align: center;">
            <h1 style="color: #f0ede6; margin: 0; font-size: 28px;">Ask My Grandpa</h1>
            <p style="color: #f0ede6; margin: 5px 0 0 0; opacity: 0.8;">${requestData.apprenticeName} is looking for some guidance. Can you help?</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 0;">
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
        from: gmailEmail,
        to: requestData.grandpaEmail,
        subject: grandpaSubject,
        text: grandpaTextContent,
        html: grandpaHtmlContent,
      };
      
      try {
        await transporter.sendMail(grandpaMailOptions);
        console.log('Email sent to grandpa successfully');
      } catch (error) {
        console.error('Error sending email to grandpa:', error);
      }
    }
  });