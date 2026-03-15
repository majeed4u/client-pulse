"use client";

import { trpc } from "@/utils/trpc";
import { Badge } from "@client-pulse/ui/components/badge";
import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@client-pulse/ui/components/dropdown-menu";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Building2, MoreHorizontal, Shield } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const ROLE_STYLES: Record<string, string> = {
  OWNER: "bg-purple-500/10 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-500/10 text-blue-700 border-blue-200",
  MEMBER: "border-gray-200 text-gray-600",
};

export default function TeamPage() {
  const t = useTranslations("team");
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery(
    trpc.team.listMembers.queryOptions(),
  );

  const { data: workspace } = useQuery(trpc.workspace.get.queryOptions());

  const removeMutation = useMutation(
    trpc.team.remove.mutationOptions({
      onSuccess: () => {
        toast.success(t("memberRemoved"));
        queryClient.invalidateQueries({ queryKey: ["team"] });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const updateRoleMutation = useMutation(
    trpc.team.updateRole.mutationOptions({
      onSuccess: () => {
        toast.success(t("roleUpdated"));
        queryClient.invalidateQueries({ queryKey: ["team"] });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const isAgency = workspace?.plan === "AGENCY";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        {!isAgency && (
          <Button size="sm" variant="outline">
            {t("upgradeForTeam")}
          </Button>
        )}
      </div>

      {!isAgency && (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-4 py-6">
            <Shield className="h-8 w-8 text-muted-foreground/40 shrink-0" />
            <div>
              <p className="font-medium">{t("agencyOnly")}</p>
              <p className="text-sm text-muted-foreground">
                {t("agencyOnlyDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("membersTitle")}</CardTitle>
          <CardDescription>
            {t("membersCount", { count: members?.length ?? 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))
          ) : !members?.length ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {t("noMembers")}
              </p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    {member.userId.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.userId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("joined")} {format(new Date(member.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-xs ${ROLE_STYLES[member.role] ?? ""}`}
                  >
                    {t(`role.${member.role}` as any)}
                  </Badge>
                  {member.role !== "OWNER" && isAgency && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7"
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            updateRoleMutation.mutate({
                              memberId: member.id,
                              role:
                                member.role === "ADMIN" ? "MEMBER" : "ADMIN",
                            })
                          }
                        >
                          {member.role === "ADMIN"
                            ? t("demoteToMember")
                            : t("promoteToAdmin")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            removeMutation.mutate({ memberId: member.id })
                          }
                        >
                          {t("removeMember")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
