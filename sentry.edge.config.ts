/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for Edge Runtime (middleware, edge API routes).
 * Edge runtime has limited APIs compared to Node.js, so some features are not available.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  // Data Source Name - identifies your Sentry project
  dsn: SENTRY_DSN,

  // Environment name (production, staging, development)
  environment: process.env.NODE_ENV || 'development',

  // Percentage of transactions to capture for performance monitoring (0.0 to 1.0)
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

    return event;
  },
});
