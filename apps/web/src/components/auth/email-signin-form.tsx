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

const formSchema = z.object({
  email: z.email("Invalid email address"),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const EmailSignInForm = () => {
  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const isVerifyingRef = useRef(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormSchemaType) {
    setIsSubmitting(true);
    try {
      await authClient.emailOtp.sendVerificationOtp(
        {
          email: data.email,
          type: "sign-in",
        },
        {
          onSuccess: () => {
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

    // Auto-verify when 6 digits entered
    if (value.length === 6 && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      setIsSubmitting(true);

      try {
        await authClient.signIn.emailOtp(
          {
            email: form.getValues("email"),
            otp: value,
          },
          {
            onSuccess: () => {
              toast.success("Signed in successfully");
            },
            onError: () => {
              toast.error("Invalid OTP. Please try again.");
              setOtp("");
            },
          },
        );
      } catch (error) {
        toast.error(`An error occurred`);
        setOtp("");
      } finally {
        // Always reset state, even if errors occur
        setIsSubmitting(false);
        isVerifyingRef.current = false;
        router.push("/");
      }
    }
  }

  return (
    <div>
      {!otpSent ? (
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
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className=" py-6 rounded-md placeholder:text-sm text-base"
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
            {isSubmitting ? "Sending..." : "Continue with Email"}
          </Button>
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
