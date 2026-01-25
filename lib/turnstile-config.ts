// Cloudflare Turnstile Configuration
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://dash.cloudflare.com/
// 2. Navigate to "Turnstile" in the left sidebar
// 3. Click "Add Site"
// 4. Fill in:
//    - Site name: Ask My Grandpa
//    - Domain: askmygrandpa.com (and any staging domains)
//    - Widget Mode: Managed (recommended)
// 5. Copy the Site Key and Secret Key below
// 6. Add Secret Key to Firebase Functions environment variables

export const TURNSTILE_CONFIG = {
  // PRODUCTION SITE KEY - Replace with your actual Cloudflare Turnstile site key
  // This is safe to expose in client-side code
  SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA', // Demo key for testing
  
  // Widget configuration
  THEME: 'light' as const,
  SIZE: 'normal' as const,
  
  // For development/testing - Cloudflare provides test keys
  TEST_KEYS: {
    // Always passes
    ALWAYS_PASSES: '1x00000000000000000000AA',
    // Always fails  
    ALWAYS_FAILS: '2x00000000000000000000AB',
    // Forces interactive challenge
    INTERACTIVE: '3x00000000000000000000FF'
  }
};

// Helper function to get the appropriate site key
export function getTurnstileSiteKey(): string {
  // In development, use test key that always passes
  if (process.env.NODE_ENV === 'development') {
    return TURNSTILE_CONFIG.TEST_KEYS.ALWAYS_PASSES;
  }
  
  // In production, use the configured site key
  return TURNSTILE_CONFIG.SITE_KEY;
}

// Validation function for Turnstile tokens (server-side)
export function validateTurnstileToken(token: string, secretKey: string): Promise<boolean> {
  return fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  })
  .then(response => response.json())
  .then(data => data.success === true)
  .catch(() => false);
}