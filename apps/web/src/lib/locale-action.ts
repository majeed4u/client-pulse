"use server";

import { cookies } from "next/headers";

const VALID_LOCALES = ["en", "ar"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale);
}

export async function setLocale(locale: string): Promise<void> {
  if (!isValidLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
