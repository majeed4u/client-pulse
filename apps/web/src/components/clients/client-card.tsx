"use client";

import { Badge } from "@client-pulse/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { Building2, FileText, FolderKanban, Mail, Phone } from "lucide-react";
import Link from "next/link";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
    _count: { projects: number; invoices: number };
  };
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/dashboard/clients/${client.id}` as any}>
      <Card className="hover:border-primary/50 cursor-pointer transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{client.name}</CardTitle>
            {client.company && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {client.company}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span>{client.company}</span>
            </div>
          )}
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FolderKanban className="h-3.5 w-3.5" />
              {client._count.projects} project
              {client._count.projects !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {client._count.invoices} invoice
              {client._count.invoices !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
