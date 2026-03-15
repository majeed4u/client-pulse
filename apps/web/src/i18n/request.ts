import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const VALID_LOCALES = ["en", "ar"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value ?? "en";
  const locale = isValidLocale(raw) ? raw : "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
