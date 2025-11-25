import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [],
  beforeSend(event) {
    // Never show errors in the browser console
    event.level = "fatal";
    return event;
  },
});
