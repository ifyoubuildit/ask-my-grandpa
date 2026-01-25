// Client-side rate limiting utility
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class ClientRateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private storageKey = 'askgrandpa_rate_limits';

  constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          this.storage = new Map(Object.entries(data));
        }
      }
    } catch (error) {
      console.warn('Failed to load rate limit data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = Object.fromEntries(this.storage);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to save rate limit data to storage:', error);
    }
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
    this.saveToStorage();
  }

  checkRateLimit(action: string, maxRequests: number, windowMs: number): {
    allowed: boolean;
    remainingTime?: number;
    remainingRequests?: number;
  } {
    this.cleanExpiredEntries();
    
    const now = Date.now();
    const entry = this.storage.get(action) || { count: 0, resetTime: now + windowMs };

    if (entry.count >= maxRequests && now < entry.resetTime) {
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        remainingTime
      };
    }

    // Update count
    entry.count++;
    this.storage.set(action, entry);
    this.saveToStorage();

    return {
      allowed: true,
      remainingRequests: Math.max(0, maxRequests - entry.count)
    };
  }

  reset(action: string) {
    this.storage.delete(action);
    this.saveToStorage();
  }
}

export const rateLimiter = new ClientRateLimiter();

// Rate limiting configurations
export const RATE_LIMITS = {
  REGISTRATION: { maxRequests: 3, windowMs: 300000 }, // 3 attempts per 5 minutes
  LOGIN: { maxRequests: 5, windowMs: 300000 }, // 5 attempts per 5 minutes
  REQUEST_HELP: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute
  EMAIL_VERIFICATION: { maxRequests: 3, windowMs: 60000 }, // 3 per minute
} as const;