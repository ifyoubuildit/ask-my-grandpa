# Cloudflare Turnstile Setup Guide

## Overview
Cloudflare Turnstile is now integrated into Ask My Grandpa as an invisible CAPTCHA alternative that provides bot protection without user friction.

## ✅ Current Status
- ✅ Turnstile component created (`components/Turnstile.tsx`)
- ✅ Configuration system implemented (`lib/turnstile-config.ts`)
- ✅ All forms updated with Turnstile integration
- ✅ Server-side validation added to Firebase Functions
- ✅ Test keys configured for development
- ⚠️ **Production keys needed for live deployment**

## 🔧 Setup Instructions

### Step 1: Create Cloudflare Account (Free)
1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Create a free account or sign in
3. No domain required - Turnstile works on any website

### Step 2: Add Turnstile Site
1. In Cloudflare dashboard, click **"Turnstile"** in left sidebar
2. Click **"Add Site"** button (top right)
3. Fill in the form:
   - **Site name**: `Ask My Grandpa`
   - **Domain**: `askmygrandpa.com` (add staging domains if needed)
   - **Widget Mode**: `Managed` (recommended)
4. Click **"Create"**

### Step 3: Copy Keys
After creating the site, you'll see:
- **Site Key** (public, safe for client-side)
- **Secret Key** (private, server-side only)

### Step 4: Configure Environment Variables

#### Frontend (Next.js)
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
```

#### Backend (Firebase Functions)
Add to `functions/.env` file:
```bash
TURNSTILE_SECRET_KEY=your_secret_key_here
```

### Step 5: Deploy Updated Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

## 🧪 Testing

### Development Mode
- Uses Cloudflare test keys that always pass
- No real verification performed
- Perfect for development and testing

### Test Keys Available
- **Always Passes**: `1x00000000000000000000AA`
- **Always Fails**: `2x00000000000000000000AB`
- **Interactive Challenge**: `3x00000000000000000000FF`

### Production Mode
- Uses your actual Cloudflare Turnstile keys
- Real bot protection active
- Invisible verification for users

## 🛡️ Security Features

### Client-Side Protection
- Invisible verification (no puzzles for users)
- Behavioral analysis and browser checks
- Automatic challenge escalation if needed

### Server-Side Validation
- Token verification with Cloudflare API
- Prevents token replay attacks
- Graceful fallback if validation fails

### Integration Points
- **Registration Forms**: Grandpa and Apprentice registration
- **Login Form**: User authentication
- **Request Help Form**: Help request submissions
- **API Endpoints**: All HTTP endpoints validate tokens

## 📊 Monitoring

### Cloudflare Dashboard
- View verification statistics
- Monitor bot detection rates
- Adjust sensitivity settings

### Firebase Functions Logs
- Turnstile validation results
- Error tracking and debugging
- Performance monitoring

## 🚀 Production Deployment Checklist

- [ ] Create Cloudflare Turnstile site
- [ ] Add production domain to Turnstile configuration
- [ ] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` environment variable
- [ ] Set `TURNSTILE_SECRET_KEY` in Firebase Functions
- [ ] Deploy updated Firebase Functions
- [ ] Test registration and login flows
- [ ] Monitor Cloudflare dashboard for verification stats

## 🔧 Configuration Options

### Widget Modes
- **Managed**: Automatic challenge escalation (recommended)
- **Non-Interactive**: Always invisible
- **Invisible**: Hidden widget

### Themes
- **Light**: Default theme
- **Dark**: Dark mode support
- **Auto**: Matches system preference

## 🆘 Troubleshooting

### Common Issues
1. **"Invalid site key"**: Check environment variable configuration
2. **"Verification failed"**: Ensure secret key is correct in Firebase Functions
3. **Widget not loading**: Check domain configuration in Cloudflare
4. **Always failing**: Verify site key matches domain

### Debug Mode
Set `NODE_ENV=development` to use test keys that always pass.

## 📚 Resources
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile Dashboard](https://dash.cloudflare.com/)
- [API Reference](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## ✅ Benefits
- **User-Friendly**: No puzzles or image selection
- **Privacy-Focused**: No personal data collection
- **Free**: No cost for any volume
- **Reliable**: 99.9% uptime SLA
- **Fast**: Minimal impact on page load times

The Ask My Grandpa platform now has enterprise-grade bot protection with zero user friction! 🛡️