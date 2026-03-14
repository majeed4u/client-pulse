import { createContext } from "@client-pulse/api/context";
import { appRouter } from "@client-pulse/api/routers/index";
import { auth } from "@client-pulse/auth";
import { env } from "@client-pulse/env/server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { portalRoutes } from "./routes/portal";
import { stripeWebhookRoutes } from "./routes/webhooks/stripe";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

// Portal REST routes (public, token-validated)
app.route("/portal", portalRoutes);

// Stripe webhook — raw body required, mounted before any body parsers
app.route("/webhooks/stripe", stripeWebhookRoutes);

app.get("/", (c) => {
  return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
