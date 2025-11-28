/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry for Node.js server-side code.
 * Errors from API routes, server components, and server-side rendering are tracked here.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  // Data Source Name - identifies your Sentry project
  dsn: SENTRY_DSN,

  // Environment name (production, staging, development)
  environment: process.env.NODE_ENV || 'development',

  // Percentage of transactions to capture for performance monitoring (0.0 to 1.0)
  // Lower this in production to reduce quota usage
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set to false to disable Sentry in development
  enabled: process.env.NODE_ENV === 'production' || Boolean(SENTRY_DSN),

  // Debug mode - logs Sentry's internal operations
  debug: false,

  // Filter out sensitive data before sending to Sentry
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !SENTRY_DSN) {
      return null;
    }

    // Remove sensitive headers
    if (event.request?.headers) {
      const sensitiveHeaders = [
        'authorization',
        'cookie',
        'x-api-key',
        'x-auth-token',
      ];

      sensitiveHeaders.forEach((header) => {
        if (event.request?.headers?.[header]) {
          event.request.headers[header] = '[Filtered]';
        }
      });
    }

    // Remove sensitive environment variables
    if (event.contexts?.runtime?.environment) {
      const env = event.contexts.runtime.environment as Record<string, unknown>;
      const sensitiveKeys = [
        'MONGODB_URI',
        'ANTHROPIC_API_KEY',
        'SENTRY_DSN',
        'SENTRY_AUTH_TOKEN',
      ];

      sensitiveKeys.forEach((key) => {
        if (env[key]) {
          env[key] = '[Filtered]';
        }
      });
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Expected validation errors (handled by application)
    'Validation failed',
    'ZodError',
    // MongoDB connection issues (logged separately)
    'MongoServerError',
    'MongoNetworkError',
  ],
});
