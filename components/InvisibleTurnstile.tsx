'use client';

import { useEffect, useRef, useState } from 'react';

interface InvisibleTurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  autoExecute?: boolean;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
      execute: (widgetId: string) => void;
    };
  }
}

export default function InvisibleTurnstile({
  siteKey,
  onVerify,
  onError,
  onExpire,
  autoExecute = true
}: InvisibleTurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Turnstile script
    if (!document.querySelector('script[src*="challenges.cloudflare.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && ref.current && window.turnstile && !widgetId) {
      const id = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          console.log('🛡️ Invisible security verification completed');
          onVerify(token);
        },
        'error-callback': () => {
          console.warn('🛡️ Security verification failed, but allowing submission');
          // Don't block the user - just log the failure
          onVerify('fallback-token'); // Allow submission with fallback
          onError?.();
        },
        'expired-callback': () => {
          console.warn('🛡️ Security verification expired, but allowing submission');
          onVerify('fallback-token'); // Allow submission with fallback
          onExpire?.();
        },
        theme: 'light',
        size: 'invisible',
        execution: autoExecute ? 'render' : 'execute'
      });
      setWidgetId(id);
    }

    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [isLoaded, siteKey, onVerify, onError, onExpire, autoExecute, widgetId]);

  // Trigger verification manually if needed
  const execute = () => {
    if (widgetId && window.turnstile) {
      window.turnstile.execute(widgetId);
    }
  };

  // Expose execute function to parent component
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).execute = execute;
    }
  }, [widgetId]);

  // Completely invisible - no UI elements
  return <div ref={ref} style={{ display: 'none' }} />;
}