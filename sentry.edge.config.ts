// This file configures the initialization of Sentry for edge functions.
// The config you add here will be used whenever an edge function is executed.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    
    // Additional options
    environment: process.env.NODE_ENV,
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events for health checks
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }
      
      // Remove sensitive data
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.apiKey;
      }
      
      return event;
    },
  });
}