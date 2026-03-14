import prisma from "@client-pulse/db";
import { env } from "@client-pulse/env/server";
import { Hono } from "hono";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";

export const stripeWebhookRoutes = new Hono();

stripeWebhookRoutes.post("/", async (c) => {
  const sig = c.req.header("stripe-signature");
  if (!sig) return c.json({ error: "Missing stripe-signature header" }, 400);

  const rawBody = await c.req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return c.json({ error: "Invalid webhook signature" }, 400);
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const priceId = sub.items.data[0]?.price.id ?? "";
      let plan: "FREE" | "PRO" | "AGENCY" = "FREE";
      if (priceId === env.STRIPE_PRO_PRICE_ID) plan = "PRO";
      else if (priceId === env.STRIPE_AGENCY_PRICE_ID) plan = "AGENCY";

      await prisma.workspace.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan, stripeSubscriptionId: sub.id },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.workspace.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { plan: "FREE", stripeSubscriptionId: null },
      });
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const invoice = await prisma.invoice.findFirst({
        where: { stripePaymentIntentId: pi.id },
      });
      if (invoice) {
        await prisma.$transaction([
          prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "PAID", paidAt: new Date() },
          }),
          ...(invoice.projectId
            ? [
                prisma.activity.create({
                  data: {
                    projectId: invoice.projectId,
                    type: "INVOICE_PAID",
                    actorName: "Stripe",
                    actorType: "CLIENT",
                    metadata: { invoiceNumber: invoice.invoiceNumber },
                  },
                }),
              ]
            : []),
        ]);
      }
      break;
    }
  }

  return c.json({ received: true });
});
