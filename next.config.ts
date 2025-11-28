import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Automatically upload source maps to Sentry
  // Requires SENTRY_AUTH_TOKEN environment variable
  silent: true, // Suppresses Sentry webpack plugin logs

  // Disable source map upload in development
  disableServerWebpackPlugin: process.env.NODE_ENV !== "production",
  disableClientWebpackPlugin: process.env.NODE_ENV !== "production",

  // Additional config options for the Sentry Webpack plugin
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production
  hideSourceMaps: true,

  // Automatically annotate React components for better error tracking
  reactComponentAnnotation: {
    enabled: true,
  },
};

// Export config with Sentry wrapper
// If Sentry is not configured, this will just return the original config
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
