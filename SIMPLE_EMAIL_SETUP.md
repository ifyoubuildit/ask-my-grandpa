# Simple Email Setup (3 Steps Only!)

## 🎯 What This Does
Automatically sends you emails when someone registers or requests help.

## 📧 Quick Setup (5 minutes)

### Step 1: Get Gmail App Password
1. Go to https://myaccount.google.com/security
2. Turn on "2-Step Verification" (if not already on)
3. Click "App passwords" → Generate new → Copy the 16-character password

### Step 2: Set Environment Variables
Open your terminal and run these commands (replace with your info):

```bash
firebase functions:config:set gmail.email="your-email@gmail.com"
firebase functions:config:set gmail.password="your-16-char-app-password"
```

### Step 3: Deploy Functions
```bash
firebase deploy --only functions
```

## ✅ That's It!

You'll now get emails when:
- Someone registers as a grandpa
- Someone registers as an apprentice  
- Someone requests help

## 🔍 Test It
1. Register a new grandpa on your site
2. Check your email - you should get a notification!

---

**Need help?** The functions are already written and ready to go. Just need those 3 steps to activate them!