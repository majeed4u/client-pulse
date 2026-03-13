import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

function OTPEmail({
  email,
  otp,
  type = "sign-in",
}: {
  email: string;
  otp: string;
  type?: "sign-in" | "email-verification" | "other";
}) {
  const verificationText =
    type === "sign-in"
      ? "complete your sign in"
      : type === "email-verification"
        ? "verify your email address"
        : "reset your password";

  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="bg-neutral-50 font-sans">
          <Container className="max-w-lg mx-auto py-12 px-4">
            <Section className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-600">
                  <Text className="text-3xl m-0">🔐</Text>
                </div>
              </div>
              <Text className="text-2xl font-bold text-neutral-900 m-0 mb-2">
                Verification Code
              </Text>
              <Text className="text-neutral-600 text-sm m-0">
                Secure access to your account
              </Text>
            </Section>

            <Section className="bg-white rounded-3xl px-8 py-10 shadow-xl border border-neutral-200">
              <Text className="text-neutral-900 text-center mb-8 leading-relaxed text-base m-0">
                {email
                  ? `We've sent a verification code to ${email}. Enter the code below to ${verificationText}.`
                  : `Enter the code below to ${verificationText}.`}
              </Text>

              <div className="bg-neutral-100 rounded-2xl px-8 py-8 mb-8 border-2 border-violet-200">
                <Text className="text-6xl font-bold text-primary tracking-widest text-center m-0 font-mono">
                  {otp}
                </Text>
              </div>

              <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-200 mb-6">
                <Text className="text-amber-900 text-sm text-center m-0">
                  ⏰ This code expires in 10 minutes
                </Text>
              </div>

              <div className="bg-neutral-100 rounded-xl px-4 py-4 border border-neutral-200">
                <Text className="text-neutral-600 text-xs text-center leading-relaxed m-0">
                  🛡️ Security tip: Never share this code with anyone. Our team
                  will never ask for your verification code.
                </Text>
              </div>
            </Section>

            <Section className="mt-8 text-center">
              <Text className="text-neutral-600 text-xs m-0 mb-2">
                If you didn&apos;t request this code, please ignore this email.
              </Text>
              <Text className="text-neutral-600 text-sm font-medium m-0">
                Thank you for choosing us!
              </Text>
              <Text className="font-bold m-0 mt-2">Taleem</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export { OTPEmail };
