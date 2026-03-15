import { env } from "@client-pulse/env/web";
import { notFound } from "next/navigation";
import { InvoicePageClient } from "./_components/invoice-page-client";

interface Props {
	params: Promise<{ token: string; invoiceId: string }>;
}

export default async function InvoicePage({ params }: Props) {
	const { token, invoiceId } = await params;
	const serverUrl = env.NEXT_PUBLIC_SERVER_URL;

	const res = await fetch(`${serverUrl}/portal/${token}/invoice/${invoiceId}`, {
		cache: "no-store",
	});

	if (!res.ok) {
		notFound();
	}

	const data = await res.json();

	if (!data.invoice) {
		notFound();
	}

	return (
		<InvoicePageClient
			token={token}
			serverUrl={serverUrl}
			invoice={data.invoice}
		/>
	);
}

export async function generateMetadata({ params }: Props) {
	const { token, invoiceId } = await params;
	const serverUrl = env.NEXT_PUBLIC_SERVER_URL;

	try {
		const res = await fetch(
			`${serverUrl}/portal/${token}/invoice/${invoiceId}`,
			{ cache: "no-store" },
		);
		if (!res.ok) return { title: "Invoice — Client Portal" };
		const data = await res.json();
		return {
			title: data.invoice?.invoiceNumber
				? `${data.invoice.invoiceNumber} — Client Portal`
				: "Invoice — Client Portal",
		};
	} catch {
		return { title: "Invoice — Client Portal" };
	}
}
