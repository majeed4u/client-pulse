"use client";

import { Button } from "@client-pulse/ui/components/button";
import { Input } from "@client-pulse/ui/components/input";
import { Label } from "@client-pulse/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@client-pulse/ui/components/select";
import { Textarea } from "@client-pulse/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

interface ProjectFormProps {
	mode: "create" | "edit";
	initialData?: {
		id: string;
		name: string;
		description?: string | null;
		clientId: string;
		deadline?: Date | string | null;
		portalEnabled?: boolean;
	};
	onSuccess?: () => void;
}

export function ProjectForm({
	mode,
	initialData,
	onSuccess,
}: ProjectFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [name, setName] = useState(initialData?.name ?? "");
	const [description, setDescription] = useState(
		initialData?.description ?? "",
	);
	const [clientId, setClientId] = useState(initialData?.clientId ?? "");
	const [deadline, setDeadline] = useState(
		initialData?.deadline
			? new Date(initialData.deadline).toISOString().slice(0, 10)
			: "",
	);

	const { data: clients } = useQuery(trpc.clients.list.queryOptions());

	const createMutation = useMutation(
		trpc.projects.create.mutationOptions({
			onSuccess: (project) => {
				toast.success("Project created");
				queryClient.invalidateQueries({ queryKey: ["projects"] });
				onSuccess?.();
				router.push(`/dashboard/projects/${project.id}` as any);
			},
			onError: (err) => toast.error(err.message),
		}),
	);

	const updateMutation = useMutation(
		trpc.projects.update.mutationOptions({
			onSuccess: () => {
				toast.success("Project updated");
				queryClient.invalidateQueries({ queryKey: ["projects"] });
				onSuccess?.();
			},
			onError: (err) => toast.error(err.message),
		}),
	);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (mode === "create") {
			createMutation.mutate({
				clientId,
				name,
				description: description || undefined,
				deadline: deadline ? new Date(deadline) : undefined,
			});
		} else if (initialData) {
			updateMutation.mutate({
				id: initialData.id,
				name,
				description: description || null,
				deadline: deadline ? new Date(deadline) : null,
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Project name *</Label>
				<Input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Website redesign"
					required
				/>
			</div>

			{mode === "create" && (
				<div className="space-y-2">
					<Label>Client *</Label>
					<Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a client" />
						</SelectTrigger>
						<SelectContent>
							{clients?.map((c) => (
								<SelectItem key={c.id} value={c.id}>
									{c.name}
									{c.company ? ` · ${c.company}` : ""}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="A brief overview of the project scope…"
					rows={3}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="deadline">Deadline</Label>
				<Input
					id="deadline"
					type="date"
					value={deadline}
					onChange={(e) => setDeadline(e.target.value)}
				/>
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={() => onSuccess?.()}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isPending || (mode === "create" && !clientId)}
				>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "create" ? "Create project" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}
