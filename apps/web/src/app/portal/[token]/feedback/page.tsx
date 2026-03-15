import { env } from "@client-pulse/env/web";
import { notFound } from "next/navigation";
import { FeedbackPageClient } from "./_components/feedback-page-client";

interface Props {
	params: Promise<{ token: string }>;
}

export default async function FeedbackPage({ params }: Props) {
	const { token } = await params;
	const serverUrl = env.NEXT_PUBLIC_SERVER_URL;

	const res = await fetch(`${serverUrl}/portal/${token}/feedback`, {
		cache: "no-store",
	});

	if (!res.ok) {
		notFound();
	}

	const data = await res.json();

	return (
		<FeedbackPageClient
			token={token}
			serverUrl={serverUrl}
			initialData={data}
		/>
	);
}

export const metadata = { title: "Feedback — Client Portal" };
