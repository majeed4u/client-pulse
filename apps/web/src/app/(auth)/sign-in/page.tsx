import { AuthSignin } from "@/components/auth/auth-signin";
import { getTranslations } from "next-intl/server";

export default async function SigninPage() {
  const t = await getTranslations("auth");
  return (
    <div className="w-full">
      <div className="px-6 space-y-2">
        <div className="font-sans text-2xl">
          <span className="font-semibold text-primary">
            {t("signInHeading")}
          </span>
        </div>
        <p className="text-muted-foreground mb-4">{t("signInDescription")}</p>
      </div>
      <AuthSignin />
    </div>
  );
}
