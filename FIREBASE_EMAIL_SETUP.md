# Firebase Functions Email Setup Guide

## 🎯 What We've Built

We've replaced Netlify Forms with Firebase Functions that automatically send email notifications when:
- ✅ New grandpa registers
- ✅ New apprentice registers  
- ✅ Help request is submitted

## 📧 Email Setup Steps

### Step 1: Create Gmail App Password

1. **Go to your Google Account settings**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication** (required for App Passwords)
3. **Generate App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (custom name)"
   - Name it "Ask My Grandpa Functions"
   - **Copy the 16-character password** (you'll need this)

### Step 2: Set Environment Variables

You need to set these environment variables for Firebase Functions:

```bash
# Set Gmail credentials for Firebase Functions
firebase functions:config:set gmail.email="your-email@gmail.com"
firebase functions:config:set gmail.password="your-16-char-app-password"
firebase functions:config:set admin.email="info@askmygrandpa.com"
```

**OR** use the new method (recommended):

Create `functions/.env` file:
```
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=info@askmygrandpa.com
```

### Step 3: Deploy Firebase Functions

```bash
# Deploy the functions to Firebase
firebase deploy --only functions
```

### Step 4: Test the System

1. **Register a new grandpa** → Check for email notification
2. **Register a new apprentice** → Check for email notification  
3. **Submit a help request** → Check that both admin and grandpa get emails

## 📋 What Each Function Does

### `onGrandpaRegistration`
- **Triggers**: When new document added to `grandpas` collection
- **Sends**: Email to admin with grandpa details
- **Includes**: Name, email, phone, location, skills, contact preference

### `onApprenticeRegistration`  
- **Triggers**: When new document added to `apprentices` collection
- **Sends**: Email to admin with apprentice details
- **Includes**: Name, email, phone, location, interests

### `onHelpRequest`
- **Triggers**: When new document added to `requests` collection
- **Sends**: 
  - Email to admin with request details
  - Email to grandpa with request and apprentice contact info
- **Includes**: Subject, message, availability, contact details

## 🔧 Configuration Files

### Functions Structure
```
functions/
├── src/
│   └── index.ts          # Main functions code
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── .env                  # Environment variables (create this)
```

### Email Templates
The functions send HTML emails with:
- Professional styling matching your brand colors
- All form data clearly formatted
- Direct links to dashboard for grandpas
- Automatic timestamps

## 🚀 Benefits Over Netlify Forms

✅ **Reliable**: Firebase Functions are enterprise-grade  
✅ **Automatic**: Triggers immediately when data is saved  
✅ **Customizable**: Full control over email content and styling  
✅ **Scalable**: Handles any volume of form submissions  
✅ **Integrated**: Works seamlessly with your Firebase database  

## 🔍 Troubleshooting

### Functions Not Deploying?
```bash
# Check Firebase project
firebase projects:list
firebase use your-project-id

# Check functions build
cd functions
npm run build
```

### Emails Not Sending?
1. Check Gmail App Password is correct
2. Verify environment variables are set
3. Check Firebase Functions logs:
```bash
firebase functions:log
```

### Test Email Configuration
```bash
# Test Gmail credentials locally
cd functions
npm run serve
# Then trigger a test registration
```

## 📞 Support

If you need help with setup:
1. Check Firebase Functions logs for errors
2. Verify Gmail App Password is working
3. Test with a simple registration first

The system is now much more reliable than Netlify Forms and gives you complete control over the email notifications!