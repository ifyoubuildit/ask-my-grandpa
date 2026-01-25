'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

// Component to initialize analytics tracking
export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
}