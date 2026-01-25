'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackRouteChange } from '@/lib/gtag';

// Hook to track page views in SPA - safe for prerendering
export const useAnalytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== 'undefined' && pathname) {
      trackRouteChange();
    }
  }, [pathname]);
};

export default useAnalytics;