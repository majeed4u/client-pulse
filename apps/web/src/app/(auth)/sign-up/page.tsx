import { AuthSignup } from "@/components/auth/auth-signup";
import { getTranslations } from "next-intl/server";

export default async function SignupPage() {
  const t = await getTranslations("auth");
  return (
    <div className="w-full space-y-2">
      <div className="px-6 space-y-2">
        <div className="font-sans text-2xl">
          <span className="font-semibold text-primary">
            {t("signUpHeading")}
          </span>
        </div>
        <p className="text-muted-foreground mb-4">{t("signUpDescription")}</p>
      </div>
      <AuthSignup />
    </div>
  );
}
