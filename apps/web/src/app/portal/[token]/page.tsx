import { env } from "@client-pulse/env/web";
import { notFound } from "next/navigation";
import { PortalPageClient } from "./_components/portal-page-client";

interface Props {
	params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: Props) {
	const { token } = await params;
	const serverUrl = env.NEXT_PUBLIC_SERVER_URL;

	const res = await fetch(`${serverUrl}/portal/${token}`, {
		cache: "no-store",
	});

	if (!res.ok) {
		notFound();
	}

	const data = await res.json();

	if (!data.project) {
		notFound();
	}

	return (
		<PortalPageClient token={token} serverUrl={serverUrl} initialData={data} />
	);
}

export async function generateMetadata({ params }: Props) {
	const { token } = await params;
	const serverUrl = env.NEXT_PUBLIC_SERVER_URL;

	try {
		const res = await fetch(`${serverUrl}/portal/${token}`, {
			cache: "no-store",
		});
		if (!res.ok) return { title: "Client Portal" };
		const data = await res.json();
		return {
			title: data.project?.name
				? `${data.project.name} — Client Portal`
				: "Client Portal",
		};
	} catch {
		return { title: "Client Portal" };
	}
}
