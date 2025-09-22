// This file configures the initialization of Sentry on the client side.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    
    replaysOnErrorSampleRate: 1.0,
    
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out sensitive routes
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
    
    // Additional options
    environment: process.env.NODE_ENV,
    
    // Ignore common browser errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Facebook related errors
      "fb_xd_fragment",
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i,
      "Can't find variable: ZiteReader",
      "jigsaw is not defined",
      "ComboSearch is not defined",
      // Errors from ads
      "http://tt.epicplay.com",
      // Network errors
      "NetworkError",
      "Non-Error promise rejection captured",
    ],
  });
}