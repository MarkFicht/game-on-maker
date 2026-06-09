// Analytics Service - Stub for event tracking
// In production, would wrap Sentry, Amplitude, Mixpanel, etc.

export type EventName = 
  | 'app_launched'
  | 'game_started'
  | 'game_finished'
  | 'deck_selected'
  | 'purchase_initiated'
  | 'purchase_completed'
  | 'ad_shown'
  | 'ad_clicked'
  | 'settings_changed'
  | 'paywall_shown'
  | 'paywall_dismissed'
  | 'review_clicked';

export interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, unknown>;
  timestamp: number;
}

export interface AnalyticsService {
  initialize(): Promise<void>;
  track(event: EventName, properties?: Record<string, unknown>): void;
  setUserId(userId: string): void;
  setUserProperty(key: string, value: unknown): void;
  logError(error: Error, context?: Record<string, unknown>): void;
}

class MockAnalyticsService implements AnalyticsService {
  private userId: string | null = null;
  private userProperties: Record<string, unknown> = {};
  private events: AnalyticsEvent[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('[Analytics] Mock service initialized');
    this.track('app_launched');
    this.initialized = true;
  }

  track(event: EventName, properties?: Record<string, unknown>): void {
    const analyticsEvent: AnalyticsEvent = {
      name: event,
      properties: {
        ...properties,
        userId: this.userId,
      },
      timestamp: Date.now(),
    };
    
    this.events.push(analyticsEvent);
    console.log('[Analytics] Event:', event, properties || '');
  }

  setUserId(userId: string): void {
    this.userId = userId;
    console.log('[Analytics] User ID set:', userId);
  }

  setUserProperty(key: string, value: unknown): void {
    this.userProperties[key] = value;
    console.log('[Analytics] User property:', key, value);
  }

  logError(error: Error, context?: Record<string, unknown>): void {
    console.error('[Analytics] Error logged:', error.message, context);
    // In production, would send to Sentry/Crashlytics
  }

  // Dev helper: get all tracked events
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }
}

// Singleton
let analyticsInstance: AnalyticsService | null = null;

export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new MockAnalyticsService();
  }
  return analyticsInstance;
}

export function resetAnalytics(): void {
  analyticsInstance = null;
}

// Quick track helper
export function track(event: EventName, properties?: Record<string, unknown>): void {
  getAnalytics().track(event, properties);
}
