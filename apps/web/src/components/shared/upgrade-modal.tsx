"use client";

import { Button } from "@client-pulse/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@client-pulse/ui/components/dialog";
import { Check, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  featureName,
}: UpgradeModalProps) {
  const t = useTranslations("upgradeModal");

  const proFeatures = [
    t("upgradeFeature.unlimitedProjects"),
    t("upgradeFeature.invoicePayments"),
    t("upgradeFeature.versionHistory"),
    t("upgradeFeature.customBranding"),
    t("upgradeFeature.pdfExport"),
    t("upgradeFeature.fileSizePro"),
  ];

  const agencyFeatures = [
    t("upgradeFeature.everything"),
    t("upgradeFeature.teamMembers"),
    t("upgradeFeature.fileSizeAgency"),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={true}>
        <div className="text-center space-y-2 pb-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">{t("title")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {featureName
              ? t("descriptionFeature", { feature: featureName })
              : t("description")}
          </DialogDescription>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Pro plan */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <p className="font-semibold">Pro</p>
              <p className="text-2xl font-bold mt-1">
                $29
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
            </div>
            <ul className="space-y-1.5">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button size="sm" className="w-full">
              {t("upgradeToPro")}
            </Button>
          </div>

          {/* Agency plan */}
          <div className="border-2 border-primary rounded-lg p-4 space-y-3 relative">
            <div className="absolute -top-2.5 start-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                {t("popular")}
              </span>
            </div>
            <div>
              <p className="font-semibold">Agency</p>
              <p className="text-2xl font-bold mt-1">
                $79
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
            </div>
            <ul className="space-y-1.5">
              {agencyFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="w-full">
              {t("upgradeToAgency")}
            </Button>
          </div>
        </div>

        <div className="flex justify-center pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("maybeLater")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
