"use client";

import { ClientCard } from "@/components/clients/client-card";
import { ClientForm } from "@/components/clients/client-form";
import { trpc } from "@/utils/trpc";
import { Button } from "@client-pulse/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@client-pulse/ui/components/dialog";
import { Input } from "@client-pulse/ui/components/input";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";

export default function ClientsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: clients, isLoading } = useQuery(trpc.clients.list.queryOptions());

  const filtered = clients?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your clients and their projects
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-lg font-medium">No clients yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first client to get started
          </p>
          <Button onClick={() => setOpen(true)} className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {/* Add client dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
          </DialogHeader>
          <ClientForm mode="create" onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
