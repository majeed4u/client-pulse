import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const BRAND_COLOR = "#6366f1";
const BRAND_GRADIENT = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";

interface EmailLayoutProps {
  preview: string;
  heading: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, heading, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>⚡ ClientPulse</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={headingStyle}>{heading}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} ClientPulse. All rights reserved.
            </Text>
            <Text style={footerText}>
              This email was sent because you use ClientPulse.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const primaryButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: BRAND_COLOR,
  color: "#ffffff",
  borderRadius: "6px",
  padding: "12px 24px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "14px",
  margin: "16px 0",
};

export const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 12px",
};

export const mutedText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#6b7280",
  margin: "0 0 8px",
};

export const infoBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderLeft: `4px solid ${BRAND_COLOR}`,
  borderRadius: "0 6px 6px 0",
  padding: "12px 16px",
  margin: "16px 0",
};

// --- Internal styles ---
const body: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: "40px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  maxWidth: "580px",
  margin: "0 auto",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const header: React.CSSProperties = {
  background: BRAND_GRADIENT,
  padding: "28px 40px",
  textAlign: "center",
};

const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: 0,
  letterSpacing: "-0.3px",
};

const content: React.CSSProperties = {
  padding: "32px 40px 24px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 20px",
  letterSpacing: "-0.3px",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "0 40px",
};

const footer: React.CSSProperties = {
  padding: "20px 40px 28px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 4px",
};
