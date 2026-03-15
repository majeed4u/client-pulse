/** @jsxImportSource react */

import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@client-pulse/env/server";
import {
	Document,
	Page,
	renderToBuffer,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";

// ─── S3 client (same config as storage.ts) ───────────────────────────────────

const s3 = new S3Client({
	region: "auto",
	endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
		secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
	},
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
	description: string;
	quantity: number;
	unitPrice: number;
}

export interface InvoicePdfData {
	invoiceNumber: string;
	workspaceName: string;
	clientName: string;
	clientEmail: string;
	clientCompany?: string | null;
	currency: string;
	lineItems: InvoiceLineItem[];
	subtotal: number;
	taxPercent: number;
	taxAmount: number;
	total: number;
	dueDate?: Date | null;
	issuedDate: Date;
	notes?: string | null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	page: {
		fontFamily: "Helvetica",
		fontSize: 10,
		padding: 48,
		color: "#111827",
		backgroundColor: "#ffffff",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 36,
	},
	brand: {
		fontSize: 18,
		fontFamily: "Helvetica-Bold",
		color: "#6366f1",
	},
	invoiceTitle: {
		fontSize: 24,
		fontFamily: "Helvetica-Bold",
		color: "#111827",
		textAlign: "right",
	},
	invoiceNumber: {
		fontSize: 11,
		color: "#6b7280",
		textAlign: "right",
		marginTop: 4,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 9,
		fontFamily: "Helvetica-Bold",
		color: "#6b7280",
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 6,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	col: {
		flex: 1,
	},
	label: {
		fontSize: 9,
		color: "#6b7280",
		marginBottom: 2,
	},
	value: {
		fontSize: 10,
		color: "#111827",
	},
	divider: {
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
		marginBottom: 16,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#f9fafb",
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderRadius: 4,
		marginBottom: 4,
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#f3f4f6",
	},
	colDescription: { flex: 3 },
	colQty: { flex: 1, textAlign: "right" },
	colUnitPrice: { flex: 1, textAlign: "right" },
	colTotal: { flex: 1, textAlign: "right" },
	headerText: {
		fontSize: 9,
		fontFamily: "Helvetica-Bold",
		color: "#6b7280",
	},
	totalsSection: {
		marginTop: 16,
		alignItems: "flex-end",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginBottom: 4,
		minWidth: 200,
	},
	totalLabel: {
		fontSize: 10,
		color: "#6b7280",
		flex: 1,
		textAlign: "right",
		paddingRight: 16,
	},
	totalValue: {
		fontSize: 10,
		color: "#111827",
		minWidth: 80,
		textAlign: "right",
	},
	grandTotalRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 2,
		borderTopColor: "#6366f1",
		minWidth: 200,
	},
	grandTotalLabel: {
		fontSize: 12,
		fontFamily: "Helvetica-Bold",
		color: "#111827",
		flex: 1,
		textAlign: "right",
		paddingRight: 16,
	},
	grandTotalValue: {
		fontSize: 12,
		fontFamily: "Helvetica-Bold",
		color: "#6366f1",
		minWidth: 80,
		textAlign: "right",
	},
	notes: {
		marginTop: 32,
		padding: 12,
		backgroundColor: "#f9fafb",
		borderRadius: 4,
	},
	notesLabel: {
		fontSize: 9,
		fontFamily: "Helvetica-Bold",
		color: "#6b7280",
		marginBottom: 4,
	},
	notesText: {
		fontSize: 9,
		color: "#374151",
		lineHeight: 1.5,
	},
	footer: {
		position: "absolute",
		bottom: 32,
		left: 48,
		right: 48,
		textAlign: "center",
		fontSize: 8,
		color: "#9ca3af",
	},
});

// ─── Currency formatter ───────────────────────────────────────────────────────

function formatAmount(cents: number, currency: string): string {
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
		}).format(cents / 100);
	} catch {
		return `${currency} ${(cents / 100).toFixed(2)}`;
	}
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

// ─── PDF Document component ───────────────────────────────────────────────────

function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
	const fmt = (cents: number) => formatAmount(cents, data.currency);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.brand}>{data.workspaceName}</Text>
					<View>
						<Text style={styles.invoiceTitle}>INVOICE</Text>
						<Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
					</View>
				</View>

				{/* Billed to / Invoice details */}
				<View style={styles.row}>
					<View style={styles.col}>
						<Text style={styles.sectionTitle}>Billed to</Text>
						<Text style={styles.value}>{data.clientName}</Text>
						{data.clientCompany && (
							<Text style={styles.label}>{data.clientCompany}</Text>
						)}
						<Text style={styles.label}>{data.clientEmail}</Text>
					</View>
					<View style={[styles.col, { alignItems: "flex-end" }]}>
						<Text style={styles.sectionTitle}>Invoice details</Text>
						<Text style={styles.label}>Date issued</Text>
						<Text style={styles.value}>{formatDate(data.issuedDate)}</Text>
						{data.dueDate && (
							<>
								<Text style={[styles.label, { marginTop: 6 }]}>Due date</Text>
								<Text style={styles.value}>{formatDate(data.dueDate)}</Text>
							</>
						)}
					</View>
				</View>

				<View style={styles.divider} />

				{/* Line items table */}
				<View style={styles.tableHeader}>
					<Text style={[styles.headerText, styles.colDescription]}>
						Description
					</Text>
					<Text style={[styles.headerText, styles.colQty]}>Qty</Text>
					<Text style={[styles.headerText, styles.colUnitPrice]}>
						Unit price
					</Text>
					<Text style={[styles.headerText, styles.colTotal]}>Total</Text>
				</View>

				{data.lineItems.map((item, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: invoice line items are ordered and static
					<View key={i} style={styles.tableRow}>
						<Text style={styles.colDescription}>{item.description}</Text>
						<Text style={styles.colQty}>{item.quantity}</Text>
						<Text style={styles.colUnitPrice}>{fmt(item.unitPrice)}</Text>
						<Text style={styles.colTotal}>
							{fmt(item.quantity * item.unitPrice)}
						</Text>
					</View>
				))}

				{/* Totals */}
				<View style={styles.totalsSection}>
					<View style={styles.totalRow}>
						<Text style={styles.totalLabel}>Subtotal</Text>
						<Text style={styles.totalValue}>{fmt(data.subtotal)}</Text>
					</View>
					{data.taxPercent > 0 && (
						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>Tax ({data.taxPercent}%)</Text>
							<Text style={styles.totalValue}>{fmt(data.taxAmount)}</Text>
						</View>
					)}
					<View style={styles.grandTotalRow}>
						<Text style={styles.grandTotalLabel}>Total due</Text>
						<Text style={styles.grandTotalValue}>{fmt(data.total)}</Text>
					</View>
				</View>

				{/* Notes */}
				{data.notes && (
					<View style={styles.notes}>
						<Text style={styles.notesLabel}>Notes</Text>
						<Text style={styles.notesText}>{data.notes}</Text>
					</View>
				)}

				{/* Footer */}
				<Text style={styles.footer}>
					Generated by ClientPulse · {data.invoiceNumber}
				</Text>
			</Page>
		</Document>
	);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Renders an invoice as a PDF buffer and uploads it to R2.
 * Returns a presigned download URL (24hr TTL).
 */
export async function generateAndUploadInvoicePdf(
	invoiceId: string,
	data: InvoicePdfData,
): Promise<{ pdfKey: string; pdfUrl: string }> {
	const pdfBuffer = await renderToBuffer(<InvoicePdfDocument data={data} />);

	const pdfKey = `invoices/${invoiceId}/invoice.pdf`;

	await s3.send(
		new PutObjectCommand({
			Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
			Key: pdfKey,
			Body: pdfBuffer,
			ContentType: "application/pdf",
			ContentDisposition: `attachment; filename="${data.invoiceNumber}.pdf"`,
		}),
	);

	const pdfUrl = await getSignedUrl(
		s3,
		new GetObjectCommand({
			Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
			Key: pdfKey,
		}),
		{ expiresIn: 86400 }, // 24 hours
	);

	return { pdfKey, pdfUrl };
}
