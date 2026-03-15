"use client";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@client-pulse/ui/components/button";
import { Input } from "@client-pulse/ui/components/input";
import {
  Field,
  FieldError,
  FieldGroup,
} from "@client-pulse/ui/components/field";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { TwoFactorVerify } from "./two-factor-verify";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const SigninForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const t = useTranslations("auth");

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormSchemaType) {
    setIsSubmitting(true);
    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: (context) => {
            if (context.data.twoFactorRedirect) {
              setRequires2FA(true);
              setIsSubmitting(false);
              return;
            }
            toast.success("Sign-in successful! Redirecting...");
            router.push("/");
          },
          onError: (context) => {
            toast.error(
              context.error.message || "Failed to sign in. Please try again.",
            );
          },
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (requires2FA) {
    return <TwoFactorVerify onBack={() => setRequires2FA(false)} />;
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  className=" py-6 rounded-md placeholder:text-sm text-base"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="new-password"
                  className=" py-6 rounded-md placeholder:text-sm text-base"
                  type="password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Button
          size="lg"
          type="submit"
          className="w-full py-6 rounded-md text-sm font-serif font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("signingIn") : t("signIn")}
        </Button>

        <div>
          <p className="text-center text-sm text-muted-foreground">
            {t("dontHaveAccount")}{" "}
            <Link
              href="/sign-up"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t("signUpLink")}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
