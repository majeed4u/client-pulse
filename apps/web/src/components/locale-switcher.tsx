"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/lib/locale-action";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = locale === "en" ? "ar" : "en";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="flex h-8 w-16 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
      aria-label={locale === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      {locale === "en" ? "العربية" : "English"}
    </button>
  );
}
