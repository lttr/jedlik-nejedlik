import * as Sentry from "@sentry/nuxt"

Sentry.init({
  dsn: "https://670cc9796dc78041f2d9c234db7f9f5c@o4510533326602240.ingest.de.sentry.io/4510533327978576",

  tracesSampleRate: 1.0,

  enableLogs: true,

  // Why `dataCollection` and not `sendDefaultPii`: see sentry.client.config.ts.
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

  debug: false,
})
