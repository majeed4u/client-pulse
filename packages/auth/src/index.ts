import prisma from "@client-pulse/db";
import { env } from "@client-pulse/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, emailOTP } from "better-auth/plugins";
import { sendOTPEmail } from "./lib/mailer";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [env.CORS_ORIGIN],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      // Optional
      tenantId: env.MICROSOFT_TENANT_ID || "",
      prompt: "select_account",
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  appName: "Client Pulse",
  plugins: [
    adminPlugin(),
    emailOTP({
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendOTPEmail(email, otp, "sign-in");
        } else if (type === "email-verification") {
          // Send the OTP for email verification
          await sendOTPEmail(email, otp, "email-verification");
        } else {
          // Send the OTP for password reset
          await sendOTPEmail(email, otp, "other");
        }
      },
    }),
    twoFactor(),
  ],
});
