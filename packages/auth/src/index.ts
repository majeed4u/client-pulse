import prisma from "@client-pulse/db";
import { env } from "@client-pulse/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, emailOTP } from "better-auth/plugins";
import { sendOTPEmail } from "./lib/mailer";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    adminPlugin(),
    emailOTP({
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
  ],
});
