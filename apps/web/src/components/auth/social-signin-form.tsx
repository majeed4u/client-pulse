"use client";
import { Button } from "@client-pulse/ui/components/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { env } from "@client-pulse/env/web";

export const SocialSignInForm = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  async function handleSocialSignIn(provider: "google" | "microsoft") {
    await authClient.signIn.social(
      { provider, callbackURL: env.NEXT_PUBLIC_WEB_URL },
      {
        onSuccess: () => {
          toast.success(`Redirecting to ${provider} for authentication...`);
        },
        onError: (error) => {
          toast.error(
            `Error during ${provider} sign-in: ${error.error.message}`,
          );
        },
      },
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-x-1">
        <Button
          type="button"
          variant="outline"
          className="flex flex-1 items-center px-4 gap-2 rounded-l-md py-6 font-semibold font-serif text-muted-foreground text-sm"
          onClick={() => handleSocialSignIn("google")}
        >
          <Image
            src="/socials/google.svg"
            alt="Google Logo"
            width={18}
            height={18}
          />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex flex-1 items-center gap-1 px-4 rounded-r-md py-6 font-semibold font-serif text-muted-foreground text-sm"
          onClick={() => handleSocialSignIn("microsoft")}
        >
          <Image
            src="/socials/microsoft.svg"
            alt="Microsoft Logo"
            width={18}
            height={18}
          />
          Continue with Microsoft
        </Button>
      </div>
    </div>
  );
};
