"use client";

import { Button } from "@client-pulse/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InvoiceView } from "@/components/portal/invoice-view";

interface Invoice {
	id: string;
	invoiceNumber: string;
	status: string;
	currency: string;
	lineItems: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
	}>;
	subtotal: number;
	taxPercent: number;
	taxAmount: number;
	total: number;
	dueDate: string | null;
	notes: string | null;
	stripePaymentLinkUrl: string | null;
}

export function InvoicePageClient({
	token,
	serverUrl,
	invoice,
}: {
	token: string;
	serverUrl: string;
	invoice: Invoice;
}) {
	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-3xl px-4 py-8">
				<div className="mb-6 flex items-center gap-3">
					<Link href={`/portal/${token}` as any}>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<h1 className="font-semibold text-lg">
						Invoice {invoice.invoiceNumber}
					</h1>
				</div>

				<InvoiceView invoice={invoice} token={token} serverUrl={serverUrl} />
			</div>
		</div>
	);
}
