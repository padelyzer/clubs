// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/config/prisma";

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
    
    // Capture Prisma errors
    integrations: [
      Sentry.prismaIntegration({ 
        client: prisma,
      }),
    ],
    
    // Filter out sensitive routes and data
    beforeSend(event, hint) {
      // Don't send events for health checks
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }
      
      // Don't send events for cron jobs
      if (event.request?.url?.includes('/api/cron')) {
        return null;
      }
      
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
        delete event.request.headers['x-api-key'];
      }
      
      // Remove sensitive data from extra context
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.apiKey;
        delete event.extra.stripeSecretKey;
      }
      
      // Remove sensitive user data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      return event;
    },
    
    // Performance monitoring
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}