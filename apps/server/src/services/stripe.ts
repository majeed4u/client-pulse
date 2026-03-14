import { env } from "@client-pulse/env/server";
import Stripe from "stripe";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

export async function createPaymentLink(opts: {
  invoiceId: string;
  invoiceNumber: string;
  totalCents: number;
  currency: string;
  clientEmail: string;
}): Promise<{ id: string; url: string }> {
  const price = await stripe.prices.create({
    currency: opts.currency.toLowerCase(),
    unit_amount: opts.totalCents,
    product_data: { name: `Invoice ${opts.invoiceNumber}` },
  });

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { invoiceId: opts.invoiceId },
    after_completion: {
      type: "hosted_confirmation",
      hosted_confirmation: { custom_message: "Thank you for your payment!" },
    },
  });

  return { id: link.id, url: link.url };
}

export async function createCheckoutSession(opts: {
  workspaceId: string;
  stripeCustomerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: opts.stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: { workspaceId: opts.workspaceId },
  });
  return session.url ?? opts.cancelUrl;
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}
