import { Link, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, infoBox, mutedText, paragraph, primaryButton } from "./layout";

interface InvoiceSentEmailProps {
  clientName: string;
  freelancerName: string;
  invoiceNumber: string;
  projectName: string | null;
  amount: string;
  dueDate: string | null;
  portalUrl: string;
}

export function InvoiceSentEmail({
  clientName,
  freelancerName,
  invoiceNumber,
  projectName,
  amount,
  dueDate,
  portalUrl,
}: InvoiceSentEmailProps) {
  return (
    <EmailLayout
      preview={`Invoice ${invoiceNumber} for ${amount} — payment requested by ${freelancerName}`}
      heading={`Invoice ${invoiceNumber}`}
    >
      <Text style={paragraph}>Hi {clientName},</Text>
      <Text style={paragraph}>
        <strong>{freelancerName}</strong> has sent you an invoice for{" "}
        {projectName ? (
          <>
            project <strong>{projectName}</strong>
          </>
        ) : (
          "services rendered"
        )}
        .
      </Text>

      <div style={infoBox}>
        <Text style={mutedText}>
          <strong>Invoice:</strong> {invoiceNumber}
        </Text>
        <Text style={mutedText}>
          <strong>Amount due:</strong> {amount}
        </Text>
        {dueDate && (
          <Text style={mutedText}>
            <strong>Due date:</strong> {dueDate}
          </Text>
        )}
      </div>

      <Link href={portalUrl} style={primaryButton}>
        View &amp; pay invoice
      </Link>

      <Text style={mutedText}>
        You can pay securely online via the link above.
      </Text>
    </EmailLayout>
  );
}

InvoiceSentEmail.PreviewProps = {
  clientName: "Sarah",
  freelancerName: "Alex",
  invoiceNumber: "INV-0042",
  projectName: "Brand Identity Redesign",
  amount: "$3,500.00",
  dueDate: "January 31, 2026",
  portalUrl: "https://app.clientpulse.io/portal/abc123",
} satisfies InvoiceSentEmailProps;
