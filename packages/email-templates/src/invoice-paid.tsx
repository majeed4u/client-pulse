/** @jsxImportSource react */
import { Link, Text } from "@react-email/components";
import {
	EmailLayout,
	infoBox,
	mutedText,
	paragraph,
	primaryButton,
} from "./layout";

interface InvoicePaidEmailProps {
	freelancerName: string;
	clientName: string;
	invoiceNumber: string;
	amount: string;
	paidAt: string;
	dashboardUrl: string;
}

export function InvoicePaidEmail({
	freelancerName,
	clientName,
	invoiceNumber,
	amount,
	paidAt,
	dashboardUrl,
}: InvoicePaidEmailProps) {
	return (
		<EmailLayout
			preview={`Payment received: ${invoiceNumber} for ${amount} 💰`}
			heading="Payment received! 💰"
		>
			<Text style={paragraph}>Hi {freelancerName},</Text>
			<Text style={paragraph}>
				<strong>{clientName}</strong> has paid invoice{" "}
				<strong>{invoiceNumber}</strong>. The funds will be transferred to your
				Stripe account per your payout schedule.
			</Text>

			<div style={infoBox}>
				<Text style={mutedText}>
					<strong>Invoice:</strong> {invoiceNumber}
				</Text>
				<Text style={mutedText}>
					<strong>Amount:</strong> {amount}
				</Text>
				<Text style={mutedText}>
					<strong>Paid on:</strong> {paidAt}
				</Text>
			</div>

			<Link href={dashboardUrl} style={primaryButton}>
				View invoice
			</Link>
		</EmailLayout>
	);
}

InvoicePaidEmail.PreviewProps = {
	freelancerName: "Alex",
	clientName: "Sarah",
	invoiceNumber: "INV-0042",
	amount: "$3,500.00",
	paidAt: "January 15, 2026",
	dashboardUrl: "https://app.clientpulse.io/dashboard/invoices/inv_123",
} satisfies InvoicePaidEmailProps;
