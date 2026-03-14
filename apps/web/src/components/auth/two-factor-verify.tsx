"use client";

import { Button } from "@client-pulse/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@client-pulse/ui/components/input-otp";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShieldCheck } from "lucide-react";

interface TwoFactorVerifyProps {
  onBack: () => void;
}

export function TwoFactorVerify({ onBack }: TwoFactorVerifyProps) {
  const router = useRouter();
  const [totpCode, setTotpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleVerify() {
    if (totpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: totpCode,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid verification code");
        setTotpCode("");
        return;
      }

      toast.success("Sign-in successful! Redirecting...");
      router.push("/");
    } catch {
      toast.error("Failed to verify code. Please try again.");
      setTotpCode("");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={totpCode}
          onChange={setTotpCode}
          disabled={isVerifying}
          onComplete={handleVerify}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button
        size="lg"
        className="w-full py-6 rounded-md text-sm font-serif font-semibold"
        disabled={isVerifying || totpCode.length !== 6}
        onClick={handleVerify}
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify & Sign In"
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={onBack}
        disabled={isVerifying}
      >
        Back to sign in
      </Button>
    </div>
  );
}
