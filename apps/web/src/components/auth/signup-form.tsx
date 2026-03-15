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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@client-pulse/ui/components/input-otp";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useTranslations } from "next-intl";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormSchemaType = z.infer<typeof formSchema>;

export const SignupForm = () => {
  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const isVerifyingRef = useRef(false);
  const t = useTranslations("auth");

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormSchemaType) {
    setIsSubmitting(true);
    try {
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
        },
        {
          onSuccess: ({ data }) => {
            toast.success(`We have sent an OTP to ${data.email}`);
            setOtpSent(true);
          },
          onError: () => {
            toast.error("Failed to send OTP. Please try again.");
          },
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpChange(value: string) {
    setOtp(value);

    if (value.length === 6 && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      setIsSubmitting(true);

      try {
        await authClient.emailOtp.verifyEmail(
          // ← was signIn.emailOtp
          {
            email: form.getValues("email"),
            otp: value,
          },
          {
            onSuccess: () => {
              toast.success("Email verified successfully");
              router.push("/");
            },
            onError: () => {
              toast.error("Invalid OTP. Please try again.");
              setOtp("");
            },
          },
        );
      } catch (error) {
        toast.error("An error occurred");
        setOtp("");
      } finally {
        setIsSubmitting(false);
        isVerifyingRef.current = false;
      }
    }
  }
  return (
    <div>
      {!otpSent ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("namePlaceholder")}
                    autoComplete="name"
                    className=" py-6 rounded-md placeholder:text-sm text-base"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className=" py-6 rounded-md placeholder:text-sm text-base"
                    placeholder={t("passwordPlaceholder")}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
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
            {isSubmitting ? t("signingUp") : t("signUp")}
          </Button>

          <div>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary underline-offset-4 hover:underline"
              >
                {t("signInLink")}
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-semibold mb-4">
              Enter the 6-digit code sent to {form.getValues("email")}
            </p>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              disabled={isSubmitting}
            >
              <InputOTPGroup className="w-full items-center justify-center">
                <InputOTPSlot index={0} className=" p-6" />
                <InputOTPSlot index={1} className=" p-6" />
                <InputOTPSlot index={2} className=" p-6" />
                <InputOTPSlot index={3} className=" p-6" />
                <InputOTPSlot index={4} className=" p-6" />
                <InputOTPSlot index={5} className=" p-6" />
              </InputOTPGroup>
            </InputOTP>
            <div className="text-center text-sm mt-2">
              {isSubmitting ? (
                <span className="text-xs text-muted-foreground">
                  Verifying...
                </span>
              ) : otp === "" ? (
                <span className="text-xs text-muted-foreground">
                  Enter your one-time password
                </span>
              ) : otp.length < 6 ? (
                <span className="text-xs text-muted-foreground">
                  You entered: {otp}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Verifying your code...
                </span>
              )}
            </div>
          </div>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
            }}
            className="w-full p-6 rounded-md text-base"
            disabled={isSubmitting}
          >
            Use a different email
          </Button>
        </div>
      )}
    </div>
  );
};
