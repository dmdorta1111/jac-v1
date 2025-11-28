/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for the browser/client-side.
 * Errors and performance data from React components and client code are tracked here.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  // Data Source Name - identifies your Sentry project
  dsn: SENTRY_DSN,

  // Environment name (production, staging, development)
  environment: process.env.NODE_ENV || 'development',

  // Percentage of transactions to capture for performance monitoring (0.0 to 1.0)
  // In production, you might want to lower this to reduce quota usage
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set to false to disable Sentry in development
  enabled: process.env.NODE_ENV === 'production' || Boolean(SENTRY_DSN),

  // Capture unhandled promise rejections
  integrations: [
    Sentry.replayIntegration({
      // Session replay helps debug issues by recording user sessions
      // Disabled by default due to privacy concerns - enable if needed
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Percentage of sessions to record for replay (0.0 to 1.0)
  replaysSessionSampleRate: 0.1,

  // Percentage of error sessions to record for replay
  replaysOnErrorSampleRate: 1.0,

  // Filter out sensitive data before sending to Sentry
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !SENTRY_DSN) {
      return null;
    }

    // Remove sensitive query parameters
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        // Remove sensitive params (add more as needed)
        url.searchParams.delete('token');
        url.searchParams.delete('api_key');
        url.searchParams.delete('password');
        event.request.url = url.toString();
      } catch {
        // Invalid URL, keep as is
      }
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Facebook quirks
    'fb_xd_fragment',
    // Network errors that are not actionable
    'NetworkError',
    'Failed to fetch',
    'Load failed',
  ],

  // Don't capture errors from these URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
