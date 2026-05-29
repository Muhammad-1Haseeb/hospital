import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://171ff3fa21c9618af8c82b1fb36b6ae9@o4511126682861568.ingest.us.sentry.io/4511126686269441",

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
