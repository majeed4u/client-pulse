import { Link, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, infoBox, mutedText, paragraph, primaryButton } from "./layout";

interface InvoiceReminderEmailProps {
  clientName: string;
  freelancerName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  daysUntilDue: number;
  portalUrl: string;
}

export function InvoiceReminderEmail({
  clientName,
  freelancerName,
  invoiceNumber,
  amount,
  dueDate,
  daysUntilDue,
  portalUrl,
}: InvoiceReminderEmailProps) {
  return (
    <EmailLayout
      preview={`Reminder: Invoice ${invoiceNumber} for ${amount} is due in ${daysUntilDue} days`}
      heading={`Payment reminder: ${invoiceNumber}`}
    >
      <Text style={paragraph}>Hi {clientName},</Text>
      <Text style={paragraph}>
        This is a friendly reminder that invoice{" "}
        <strong>{invoiceNumber}</strong> from <strong>{freelancerName}</strong>{" "}
        is due in <strong>{daysUntilDue} days</strong>.
      </Text>

      <div style={infoBox}>
        <Text style={mutedText}>
          <strong>Invoice:</strong> {invoiceNumber}
        </Text>
        <Text style={mutedText}>
          <strong>Amount due:</strong> {amount}
        </Text>
        <Text style={mutedText}>
          <strong>Due date:</strong> {dueDate}
        </Text>
      </div>

      <Link href={portalUrl} style={primaryButton}>
        Pay invoice now
      </Link>

      <Text style={mutedText}>
        If you've already paid, please disregard this message.
      </Text>
    </EmailLayout>
  );
}

InvoiceReminderEmail.PreviewProps = {
  clientName: "Sarah",
  freelancerName: "Alex",
  invoiceNumber: "INV-0042",
  amount: "$3,500.00",
  dueDate: "January 31, 2026",
  daysUntilDue: 3,
  portalUrl: "https://app.clientpulse.io/portal/abc123",
} satisfies InvoiceReminderEmailProps;
