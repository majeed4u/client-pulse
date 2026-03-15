"use client";

import { Button } from "@client-pulse/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@client-pulse/ui/components/card";
import { Input } from "@client-pulse/ui/components/input";
import { Label } from "@client-pulse/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.slice(0, 50);
}

export default function OnboardingPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [slugTouched, setSlugTouched] = useState(false);

	const createMutation = useMutation(
		trpc.workspace.create.mutationOptions({
			onSuccess: () => {
				toast.success("Workspace created! Welcome to ClientPulse.");
				router.replace("/dashboard");
			},
			onError: (err) => {
				toast.error(err.message ?? "Failed to create workspace.");
			},
		}),
	);

	const handleNameChange = (value: string) => {
		setName(value);
		if (!slugTouched) {
			setSlug(slugify(value));
		}
	};

	const handleSlugChange = (value: string) => {
		setSlugTouched(true);
		setSlug(slugify(value));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !slug.trim()) return;
		createMutation.mutate({ name: name.trim(), slug });
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Set up your workspace</CardTitle>
					<CardDescription>
						Your workspace is where you manage clients, projects, and invoices.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="name">Workspace name</Label>
							<Input
								id="name"
								placeholder="Acme Studio"
								value={name}
								onChange={(e) => handleNameChange(e.target.value)}
								required
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="slug">Workspace URL</Label>
							<div className="flex items-center rounded-md border bg-muted/50 text-sm">
								<span className="border-r px-3 py-2 text-muted-foreground">
									clientpulse.io/
								</span>
								<Input
									id="slug"
									className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
									placeholder="acme-studio"
									value={slug}
									onChange={(e) => handleSlugChange(e.target.value)}
									required
									pattern="[a-z0-9-]+"
								/>
							</div>
							<p className="text-muted-foreground text-xs">
								Lowercase letters, numbers, and hyphens only.
							</p>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={
								createMutation.isPending || !name.trim() || !slug.trim()
							}
						>
							{createMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating…
								</>
							) : (
								"Create workspace"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
