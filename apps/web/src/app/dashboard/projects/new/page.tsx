"use client";

import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@client-pulse/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NewProjectPage() {
  const t = useTranslations("projects");
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<Link href={"/dashboard/projects" as any} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("newProject")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a project and start sharing deliverables with your client
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
