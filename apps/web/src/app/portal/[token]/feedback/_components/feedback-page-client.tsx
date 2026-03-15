"use client";

import { Button } from "@client-pulse/ui/components/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { FeedbackComposer } from "@/components/portal/feedback-composer";

interface Thread {
	id: string;
	title: string;
	status: string;
	messages: Array<{
		id: string;
		authorName: string;
		authorType: string;
		body: string;
		createdAt: string;
	}>;
}

export function FeedbackPageClient({
	token,
	serverUrl,
	initialData,
}: {
	token: string;
	serverUrl: string;
	initialData: { threads: Thread[] };
}) {
	const [threads, setThreads] = useState<Thread[]>(initialData.threads ?? []);

	const refresh = useCallback(async () => {
		try {
			const res = await fetch(`${serverUrl}/portal/${token}/feedback`);
			if (res.ok) {
				const json = await res.json();
				setThreads(json.threads ?? []);
			}
		} catch {
			toast.error("Failed to refresh feedback.");
		}
	}, [token, serverUrl]);

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-3xl px-4 py-8">
				<div className="mb-6 flex items-center gap-3">
					<Link href={`/portal/${token}` as any}>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-muted-foreground" />
						<h1 className="font-semibold text-lg">Feedback</h1>
					</div>
				</div>

				{threads.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-sm">
						No feedback threads yet.
					</p>
				) : (
					<div className="space-y-4">
						{threads.map((thread) => (
							<FeedbackComposer
								key={thread.id}
								thread={thread}
								token={token}
								serverUrl={serverUrl}
								onMessageSent={refresh}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
