"use client";

import { ProjectCard } from "@/components/projects/project-card";
import { trpc } from "@/utils/trpc";
import { Button } from "@client-pulse/ui/components/button";
import { Input } from "@client-pulse/ui/components/input";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@client-pulse/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED" | "ON_HOLD" | "ARCHIVED";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { data: projects, isLoading } = useQuery(
    trpc.projects.list.queryOptions(
      statusFilter !== "ALL" ? { status: statusFilter } : undefined,
    ),
  );

  const filtered = projects?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your projects and client deliverables
          </p>
        </div>
        <Button render={<Link href={"/dashboard/projects/new" as any} />}>
          <Plus className="mr-2 h-4 w-4" />
          New project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="ON_HOLD">On hold</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-lg font-medium">No projects found</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter === "ALL"
                  ? "Create your first project to get started"
                  : `No ${statusFilter.toLowerCase().replace("_", " ")} projects`}
              </p>
              {statusFilter === "ALL" && (
                <Button
                  className="mt-2"
                  render={<Link href={"/dashboard/projects/new" as any} />}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
