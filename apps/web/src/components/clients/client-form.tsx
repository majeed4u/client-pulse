"use client";

import { trpc } from "@/utils/trpc";
import { Button } from "@client-pulse/ui/components/button";
import { Input } from "@client-pulse/ui/components/input";
import { Label } from "@client-pulse/ui/components/label";
import { Textarea } from "@client-pulse/ui/components/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ClientFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
    notes?: string | null;
  };
  onSuccess?: () => void;
}

export function ClientForm({ mode, initialData, onSuccess }: ClientFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const createMutation = useMutation(
    trpc.clients.create.mutationOptions({
      onSuccess: () => {
        toast.success("Client created");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        onSuccess?.();
        router.push("/dashboard/clients" as any);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const updateMutation = useMutation(
    trpc.clients.update.mutationOptions({
      onSuccess: () => {
        toast.success("Client updated");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
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
        name,
        email,
        company: company || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      });
    } else if (initialData) {
      updateMutation.mutate({
        id: initialData.id,
        name,
        email,
        company: company || null,
        phone: phone || null,
        notes: notes || null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any internal notes about this client…"
          rows={3}
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
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Add client" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
