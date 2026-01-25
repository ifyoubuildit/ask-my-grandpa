'use client';

import { useState, useCallback } from 'react';
import { getTurnstileSiteKey } from '@/lib/turnstile-config';

interface SmartSecurityOptions {
  required?: boolean; // If true, blocks submission without token
  fallbackAllowed?: boolean; // If true, allows submission even if verification fails
  onSecurityCheck?: (passed: boolean, token?: string) => void;
}

export function useSmartSecurity(options: SmartSecurityOptions = {}) {
  const [securityToken, setSecurityToken] = useState<string>('');
  const [securityPassed, setSecurityPassed] = useState(false);
  const [securityAttempted, setSecurityAttempted] = useState(false);

  const {
    required = false,
    fallbackAllowed = true,
    onSecurityCheck
  } = options;

  const handleSecurityVerify = useCallback((token: string) => {
    const isValidToken = !!(token && token !== 'fallback-token');
    setSecurityToken(token);
    setSecurityPassed(isValidToken);
    setSecurityAttempted(true);
    
    console.log('🛡️ Security check:', { 
      passed: isValidToken, 
      token: token.substring(0, 20) + '...',
      fallbackUsed: token === 'fallback-token'
    });
    
    onSecurityCheck?.(isValidToken, token);
  }, [onSecurityCheck]);

  const handleSecurityError = useCallback(() => {
    console.warn('🛡️ Security verification error - using fallback');
    if (fallbackAllowed) {
      handleSecurityVerify('fallback-token');
    }
  }, [fallbackAllowed, handleSecurityVerify]);

  const canSubmit = useCallback(() => {
    if (!required) return true; // Security is optional
    if (fallbackAllowed && securityAttempted) return true; // Fallback allowed
    return securityPassed; // Strict security required
  }, [required, fallbackAllowed, securityAttempted, securityPassed]);

  const getSecurityProps = useCallback(() => ({
    siteKey: getTurnstileSiteKey(),
    onVerify: handleSecurityVerify,
    onError: handleSecurityError,
    onExpire: handleSecurityError
  }), [handleSecurityVerify, handleSecurityError]);

  return {
    securityToken,
    securityPassed,
    securityAttempted,
    canSubmit: canSubmit(),
    getSecurityProps: getSecurityProps(),
    // For debugging
    securityStatus: {
      token: securityToken ? securityToken.substring(0, 20) + '...' : 'none',
      passed: securityPassed,
      attempted: securityAttempted,
      canSubmit: canSubmit()
    }
  };
}