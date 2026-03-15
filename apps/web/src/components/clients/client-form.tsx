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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");

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
          <Label htmlFor="name">{t("nameLabel")} *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")} *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">{t("companyLabel")}</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={t("companyPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phoneLabel")}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phonePlaceholder")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">{t("notesLabel")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
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
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? t("createClient") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
