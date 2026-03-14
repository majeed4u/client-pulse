"use client";

import { Button } from "@client-pulse/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@client-pulse/ui/components/dialog";
import { Input } from "@client-pulse/ui/components/input";
import { Label } from "@client-pulse/ui/components/label";
import { Separator } from "@client-pulse/ui/components/separator";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import QRCode from "react-qr-code";

export function useTwoFactorDialogs() {
  const [showEnablePasswordDialog, setShowEnablePasswordDialog] =
    useState(false);
  const [showDisablePasswordDialog, setShowDisablePasswordDialog] =
    useState(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [totpURL, setTotpURL] = useState<string | null>(null);
  const [verifyOTP, setVerifyOTP] = useState("");
  const [enablePassword, setEnablePassword] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [isVerifyingTOTP, setIsVerifyingTOTP] = useState(false);

  const handleEnable2FA = () => {
    setShowEnablePasswordDialog(true);
  };

  const handleDisable2FA = () => {
    setShowDisablePasswordDialog(true);
  };

  const handleVerifyEnablePassword = async () => {
    if (!enablePassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsEnabling2FA(true);
    try {
      const enableResult = await authClient.twoFactor.enable({
        password: enablePassword,
      });

      if (enableResult.error) {
        toast.error(
          enableResult.error.message ||
            "Failed to verify password. Please try again.",
        );
        setIsEnabling2FA(false);
        return;
      }

      const totpURI = enableResult.data?.totpURI;

      if (totpURI) {
        setTotpURL(totpURI);
        setShowEnablePasswordDialog(false);
        setShowQRCodeDialog(true);
        setEnablePassword("");
        toast.success("Password verified! Please scan the QR code.");
      } else {
        toast.error("Failed to generate QR code.");
        setIsEnabling2FA(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to enable 2FA",
      );
      setIsEnabling2FA(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verifyOTP || verifyOTP.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifyingTOTP(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: verifyOTP,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid verification code");
        setIsVerifyingTOTP(false);
        return;
      }

      toast.success("Two-factor authentication enabled successfully!");
      setShowQRCodeDialog(false);
      setTotpURL(null);
      setVerifyOTP("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify code",
      );
    } finally {
      setIsVerifyingTOTP(false);
    }
  };

  const handleVerifyDisablePassword = async () => {
    if (!disablePassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsDisabling2FA(true);
    try {
      const result = await authClient.twoFactor.disable({
        password: disablePassword,
      });

      if (result.error) {
        toast.error(
          result.error.message ||
            "Failed to verify password. Please try again.",
        );
        setIsDisabling2FA(false);
        return;
      }

      toast.success("Two-factor authentication disabled successfully!");
      setShowDisablePasswordDialog(false);
      setDisablePassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to disable 2FA",
      );
      setIsDisabling2FA(false);
    }
  };

  return {
    handleEnable2FA,
    handleDisable2FA,
    dialogs: (
      <>
        {/* Enable 2FA Password Dialog */}
        <Dialog
          open={showEnablePasswordDialog}
          onOpenChange={setShowEnablePasswordDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Enter your password to verify your identity before enabling 2FA.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="enable-password">Password</Label>
                <Input
                  id="enable-password"
                  type="password"
                  placeholder="Enter your password"
                  value={enablePassword}
                  onChange={(e) => setEnablePassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyEnablePassword();
                    }
                  }}
                  disabled={isEnabling2FA}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEnablePasswordDialog(false);
                  setEnablePassword("");
                }}
                disabled={isEnabling2FA}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyEnablePassword}
                disabled={isEnabling2FA}
              >
                {isEnabling2FA ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disable 2FA Password Dialog */}
        <Dialog
          open={showDisablePasswordDialog}
          onOpenChange={setShowDisablePasswordDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Enter your password to verify your identity before disabling
                2FA. This action will reduce your account security.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="disable-password">Password</Label>
                <Input
                  id="disable-password"
                  type="password"
                  placeholder="Enter your password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyDisablePassword();
                    }
                  }}
                  disabled={isDisabling2FA}
                  autoFocus
                />
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Warning:</strong> Disabling 2FA will make your account
                  less secure.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisablePasswordDialog(false);
                  setDisablePassword("");
                }}
                disabled={isDisabling2FA}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleVerifyDisablePassword}
                disabled={isDisabling2FA}
              >
                {isDisabling2FA ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Disable 2FA
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Code Verification Dialog */}
        <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app or manually enter
                the secret key.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex justify-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                {totpURL ? (
                  <div className="rounded-xl border-2 border-border p-4 bg-white shadow-lg">
                    <QRCode value={totpURL} size={256} />
                  </div>
                ) : (
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4" />
                    <p>Generating QR code...</p>
                  </div>
                )}
              </div>

              {totpURL && (
                <div className="space-y-2">
                  <Label>OTP URI (for manual entry)</Label>
                  <div className="p-3 rounded-lg bg-muted text-xs font-mono break-all">
                    {totpURL}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If the QR code doesn't work, you can manually enter this URI
                    in your authenticator app.
                  </p>
                </div>
              )}

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  Recommended: Google Authenticator, Authy, or Microsoft
                  Authenticator
                </p>
                <p className="text-xs text-muted-foreground">
                  1. Open your authenticator app
                  <br />
                  2. Scan the QR code or manually enter the secret
                  <br />
                  3. Enter the 6-digit code below to complete setup
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="totp-code" className="text-base">
                  Enter Verification Code
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
                <Input
                  id="totp-code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={verifyOTP}
                  onChange={(e) =>
                    setVerifyOTP(e.target.value.replace(/\D/g, ""))
                  }
                  className="font-mono text-center text-xl tracking-[0.5em] h-12"
                  disabled={isVerifyingTOTP}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQRCodeDialog(false);
                  setTotpURL(null);
                  setVerifyOTP("");
                }}
                disabled={isVerifyingTOTP}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyTOTP}
                disabled={isVerifyingTOTP || verifyOTP.length !== 6}
              >
                {isVerifyingTOTP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify & Enable
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    ),
  };
}
