"use client";

import { format } from "date-fns";
import { Calendar, Globe } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface PortalHeaderProps {
	projectName: string;
	workspaceName: string;
	workspaceLogoUrl?: string | null;
	clientName: string;
	deadline?: string | null;
	status: string;
}

const STATUS_STYLES: Record<string, string> = {
	ACTIVE: "text-green-600",
	COMPLETED: "text-blue-600",
	ON_HOLD: "text-yellow-600",
	ARCHIVED: "text-gray-500",
};

export function PortalHeader({
	projectName,
	workspaceName,
	workspaceLogoUrl,
	clientName,
	deadline,
	status,
}: PortalHeaderProps) {
	const t = useTranslations("portal");
	return (
		<header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-4xl px-4 py-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3">
						{workspaceLogoUrl ? (
							<Image
								src={workspaceLogoUrl}
								alt={workspaceName}
								width={32}
								height={32}
								className="h-8 w-8 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
								<Globe className="h-4 w-4 text-primary" />
							</div>
						)}
						<div className="min-w-0">
							<p className="text-muted-foreground text-xs">{workspaceName}</p>
							<h1 className="truncate font-semibold">{projectName}</h1>
						</div>
					</div>

					<div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
						{deadline && (
							<span className="hidden items-center gap-1 sm:flex">
								<Calendar className="h-3.5 w-3.5" />
								{t("due")} {format(new Date(deadline), "MMM d, yyyy")}
							</span>
						)}
						<span className="rounded-full bg-muted px-2 py-0.5 font-medium text-xs">
						{t(`status.${status}` as any) ?? status}
						</span>
					</div>
				</div>
				<p className="mt-1 text-muted-foreground text-sm">
					{t("welcome", { name: clientName })}
				</p>
			</div>
		</header>
	);
}
