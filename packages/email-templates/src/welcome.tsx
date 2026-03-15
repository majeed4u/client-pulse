import { Link, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, infoBox, mutedText, paragraph, primaryButton } from "./layout";

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ userName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview="Welcome to ClientPulse — your professional client portal"
      heading={`Welcome, ${userName}! 🎉`}
    >
      <Text style={paragraph}>
        You've just set up your ClientPulse workspace. Now you can create
        projects, share deliverables with clients, and get paid — all from one
        professional portal.
      </Text>

      <div style={infoBox}>
        <Text style={mutedText}>
          <strong>Get started in 3 steps:</strong>
        </Text>
        <Text style={mutedText}>1. Add your first client</Text>
        <Text style={mutedText}>2. Create a project and upload deliverables</Text>
        <Text style={mutedText}>3. Share the portal link with your client</Text>
      </div>

      <Link href={dashboardUrl} style={primaryButton}>
        Open your dashboard
      </Link>

      <Text style={mutedText}>
        Questions? Reply to this email — we're here to help.
      </Text>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  userName: "Alex",
  dashboardUrl: "https://app.clientpulse.io/dashboard",
} satisfies WelcomeEmailProps;
