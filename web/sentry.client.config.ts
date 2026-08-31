import * as Sentry from "@sentry/nuxt"

Sentry.init({
  // If set up, you can use your runtime config here
  // dsn: useRuntimeConfig().public.sentry.dsn,
  dsn: "https://670cc9796dc78041f2d9c234db7f9f5c@o4510533326602240.ingest.de.sentry.io/4510533327978576",

  // Ignore expected errors
  ignoreErrors: [
    // View transition skipped when iOS Safari uses native swipe-back animation
    /Skipping view transition because skipTransition\(\) was called/,
  ],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending of user PII (Personally Identifiable Information).
  // Replaces the deprecated `sendDefaultPii: true` flag with its equivalent
  // granular config (see @sentry/core's `defaultPiiToCollectionOptions`).
  // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#dataCollection
  dataCollection: {
    userInfo: true,
    cookies: true,
    httpHeaders: { request: true, response: true },
    httpBodies: ["incomingRequest", "outgoingRequest", "incomingResponse", "outgoingResponse"],
    urlQueryParams: true,
    graphQL: { document: true, variables: true },
    genAI: { inputs: true, outputs: true },
    databaseQueryData: true,
    stackFrameVariables: true,
    frameContextLines: 7,
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
