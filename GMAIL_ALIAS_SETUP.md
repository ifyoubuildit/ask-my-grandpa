# Gmail Alias Setup for info@askmygrandpa.com

## Overview
To send emails from `info@askmygrandpa.com` through Gmail's SMTP while using your ImprovMX alias, you need to add this email address as a "Send mail as" alias in your Gmail account.

## Step-by-Step Setup

### 1. Add Alias in Gmail Settings
1. Open Gmail in your web browser
2. Click the gear icon (⚙️) in the top right
3. Select "See all settings"
4. Go to the "Accounts and Import" tab
5. In the "Send mail as" section, click "Add another email address"

### 2. Configure the Alias
1. **Name**: Enter "Ask My Grandpa" (or your preferred sender name)
2. **Email address**: Enter `info@askmygrandpa.com`
3. **Treat as an alias**: ✅ Check this box (important!)
4. Click "Next Step"

### 3. Verification Options
You have two options for verification:

#### Option A: SMTP Server (Recommended)
1. **SMTP Server**: `smtp.gmail.com`
2. **Port**: `587`
3. **Username**: Your Gmail address (the one with the app password)
4. **Password**: Your Gmail app password (`dprljldzrukcpady`)
5. **Secured connection using TLS**: ✅ Check this
6. Click "Add Account"

#### Option B: Email Verification
1. Choose "Send through Gmail" 
2. Gmail will send a verification email to `info@askmygrandpa.com`
3. Since ImprovMX forwards this to your Gmail, you'll receive it
4. Click the verification link in the email

### 4. Set as Default (Optional)
**⚠️ SKIP THIS STEP** - You don't want to change your default Gmail sender address.

The alias is now set up and ready to use. Your Firebase functions will automatically send emails from `info@askmygrandpa.com`, but your personal Gmail emails will continue to use your regular Gmail address.

## Important Notes

### ✅ What This Achieves
- **Only Ask My Grandpa platform emails** will show as coming from `info@askmygrandpa.com`
- **Your personal Gmail emails** continue to use your regular Gmail address (unchanged)
- Recipients can reply to `info@askmygrandpa.com` and you'll receive replies via ImprovMX forwarding
- Professional appearance for your business emails with your domain name
- Maintains Gmail's reliable delivery infrastructure

### ⚠️ Potential Issues & Solutions

**Issue**: Gmail rejects the alias setup
**Solution**: Make sure you're using the correct app password, not your regular Gmail password

**Issue**: Verification email not received
**Solution**: Check that ImprovMX is properly forwarding emails to your Gmail account

**Issue**: Emails still show as coming from Gmail
**Solution**: The alias setup may take a few minutes to propagate. Also ensure the Firebase functions are redeployed.

### 🔧 Testing the Setup
1. After completing the Gmail alias setup, deploy the updated Firebase functions
2. Test by registering a new user or triggering an email
3. Check that the email appears to come from `info@askmygrandpa.com`

## Firebase Functions Update
The Firebase functions have been updated to use `info@askmygrandpa.com` as the sender address:
- All welcome emails
- Email verification
- Help request notifications  
- Reminder emails
- Admin notifications

## Deployment Command
```bash
cd functions
firebase deploy --only functions
```

## Troubleshooting

If emails are not being delivered after setup:
1. Check Gmail's "Sent" folder to confirm emails are being sent
2. Verify the alias is properly configured in Gmail settings
3. Test sending a manual email from Gmail using the alias
4. Check Firebase Functions logs for any SMTP errors

## Alternative: Custom SMTP Service
If Gmail alias setup doesn't work, consider using a dedicated email service like:
- SendGrid
- Mailgun  
- Amazon SES
- Postmark

These services are designed for transactional emails and provide better deliverability for automated emails.