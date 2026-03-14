"use client";

import { ClientForm } from "@/components/clients/client-form";
import { trpc } from "@/utils/trpc";
import { Badge } from "@client-pulse/ui/components/badge";
import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@client-pulse/ui/components/dialog";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  FileText,
  FolderKanban,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-700 border-green-200",
  COMPLETED: "bg-blue-500/10 text-blue-700 border-blue-200",
  ARCHIVED: "bg-gray-500/10 text-gray-600 border-gray-200",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-600",
  SENT: "bg-blue-500/10 text-blue-700",
  VIEWED: "bg-purple-500/10 text-purple-700",
  PAID: "bg-green-500/10 text-green-700",
  OVERDUE: "bg-red-500/10 text-red-700",
  CANCELLED: "bg-gray-500/10 text-gray-500",
};

export default function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: client, isLoading } = useQuery(
    trpc.clients.get.queryOptions({ id: params.id }),
  );

  const deleteMutation = useMutation(
    trpc.clients.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Client deleted");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        router.push("/dashboard/clients" as any);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleDelete = () => {
    if (confirm("Delete this client? This cannot be undone.")) {
      deleteMutation.mutate({ id: params.id });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-lg font-medium">Client not found</p>
        <Button variant="outline" render={<Link href={"/dashboard/clients" as any} />}>
          Back to clients
        </Button>
      </div>
    );
  }

  const totalInvoiced = client.invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = client.invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href={"/dashboard/clients" as any} />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            {client.company && (
              <p className="text-sm text-muted-foreground">{client.company}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contact info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span>{client.company}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total invoiced</span>
              <span className="font-medium">
                ${(totalInvoiced / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total paid</span>
              <span className="font-medium text-green-600">
                ${(totalPaid / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outstanding</span>
              <span className="font-medium text-orange-600">
                ${((totalInvoiced - totalPaid) / 100).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Summary counts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5" /> Projects
              </span>
              <span className="font-medium">{client.projects.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Invoices
              </span>
              <span className="font-medium">{client.invoices.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Projects</CardTitle>
          <Button variant="outline" size="sm" render={<Link href={"/dashboard/projects/new" as any} />}>
            New project
          </Button>
        </CardHeader>
        <CardContent>
          {client.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No projects yet
            </p>
          ) : (
            <div className="space-y-2">
              {client.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}` as any}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-sm">{project.name}</span>
                  <Badge
                    className={`text-xs ${STATUS_COLORS[project.status] ?? ""}`}
                    variant="outline"
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Invoices</CardTitle>
          <Button variant="outline" size="sm" render={<Link href={"/dashboard/invoices/new" as any} />}>
            New invoice
          </Button>
        </CardHeader>
        <CardContent>
          {client.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No invoices yet
            </p>
          ) : (
            <div className="space-y-2">
              {client.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}` as any}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">
                      {invoice.invoiceNumber}
                    </span>
                    <Badge
                      className={`text-xs ${INVOICE_STATUS_COLORS[invoice.status] ?? ""}`}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {invoice.currency} ${(invoice.total / 100).toFixed(2)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
          </DialogHeader>
          <ClientForm
            mode="edit"
            initialData={client}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
