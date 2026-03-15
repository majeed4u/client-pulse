"use client";

import { Button } from "@client-pulse/ui/components/button";
import { Textarea } from "@client-pulse/ui/components/textarea";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface FeedbackComposerProps {
	thread: {
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
	};
	token: string;
	serverUrl: string;
	onMessageSent: () => void;
}

export function FeedbackComposer({
	thread,
	token,
	serverUrl,
	onMessageSent,
}: FeedbackComposerProps) {
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const t = useTranslations("portal");

	const sendMessage = async () => {
		if (!message.trim()) return;
		setSending(true);
		try {
			const res = await fetch(
				`${serverUrl}/portal/${token}/feedback/${thread.id}/messages`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ body: message.trim() }),
				},
			);
			if (!res.ok) throw new Error("Failed to send");
			setMessage("");
			toast.success("Message sent!");
			onMessageSent();
		} catch {
			toast.error("Failed to send message. Please try again.");
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="rounded-lg border">
			<div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
				<MessageCircle className="h-4 w-4 text-muted-foreground" />
				<h3 className="font-medium text-sm">{thread.title}</h3>
				{thread.status === "RESOLVED" && (
					<span className="ml-auto text-muted-foreground text-xs">
						{t("resolved")}
					</span>
				)}
			</div>

			<div className="max-h-64 divide-y overflow-y-auto">
				{thread.messages.length === 0 ? (
					<p className="px-4 py-6 text-center text-muted-foreground text-sm">
						{t("noMessages")}
					</p>
				) : (
					thread.messages.map((msg) => (
						<div
							key={msg.id}
							className={`px-4 py-3 ${msg.authorType === "CLIENT" ? "bg-primary/5" : ""}`}
						>
							<div className="mb-1 flex items-center gap-2">
								<span className="font-medium text-xs">{msg.authorName}</span>
								<span className="text-muted-foreground text-xs">
									{formatDistanceToNow(new Date(msg.createdAt), {
										addSuffix: true,
									})}
								</span>
							</div>
							<p
								className="prose prose-sm max-w-none text-sm"
								dangerouslySetInnerHTML={{ __html: msg.body }}
							/>
						</div>
					))
				)}
			</div>

			{thread.status === "OPEN" && (
				<div className="flex gap-2 border-t p-3">
					<Textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					placeholder={t("writeMessage")}
						rows={2}
						className="resize-none"
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								sendMessage();
							}
						}}
					/>
					<Button
						size="icon"
						onClick={sendMessage}
						disabled={!message.trim() || sending}
						className="shrink-0"
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
