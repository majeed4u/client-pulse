"use client";

import { Button } from "@client-pulse/ui/components/button";
import { Card, CardContent } from "@client-pulse/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@client-pulse/ui/components/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useTranslations } from "next-intl";

interface PortalLinkCopierProps {
  projectId: string;
  portalUrl: string;
  portalEnabled: boolean;
}

export function PortalLinkCopier({
  projectId,
  portalUrl,
  portalEnabled,
}: PortalLinkCopierProps) {
  const queryClient = useQueryClient();
  const t = useTranslations("portalLink");

  const regenerate = trpc.projects.regenerateToken.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.projects.get.queryKey({ id: projectId }),
      });
      toast.success("Portal link regenerated. The old link is now invalid.");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to regenerate link");
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    toast.success("Portal link copied to clipboard");
  };

  if (!portalEnabled) return null;

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-muted-foreground text-xs">
            {t("clientPortalLink")}
          </p>
          <p className="truncate font-mono text-muted-foreground text-sm">
            {portalUrl}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="mr-2 h-4 w-4" />
            {t("copy")}
          </Button>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open portal in new tab"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <Dialog>
            <DialogTrigger
              render={
                <Button variant="ghost" size="sm" title="Regenerate link">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              }
            />
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>{t("regenerateTitle")}</DialogTitle>
                <DialogDescription>
                  {t("regenerateDescription")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  {t("cancel")}
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => regenerate.mutate({ id: projectId })}
                  disabled={regenerate.isPending}
                >
                  {regenerate.isPending ? t("regenerating") : t("confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
