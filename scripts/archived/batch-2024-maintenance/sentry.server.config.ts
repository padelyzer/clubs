import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Disable in development
  enabled: process.env.NODE_ENV === "production",
  
  // Before send hook
  beforeSend(event, hint) {
    // Add club context if available
    const error = hint.originalException;
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Server Event:', event, error);
      return null;
    }
    
    return event;
  },
});