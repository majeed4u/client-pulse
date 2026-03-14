"use client";

import { Button } from "@client-pulse/ui/components/button";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export const SocialSignInForm = () => {
	const router = useRouter();
	async function handleSocialSignIn(provider: "google" | "github") {
		await authClient.signIn.social(
			{ provider },
			{
				onSuccess: () => {
					toast.success(`Redirecting to ${provider} for authentication...`);
					router.push("/");
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
					className="flex flex-1 items-center gap-2 rounded-l-md py-6 font-semibold font-serif text-muted-foreground text-sm"
					onClick={() => handleSocialSignIn("google")}
				>
					<IconBrandGoogle color="#4285F4" className="size-6" />
					Continue with Google
				</Button>
				<Button
					type="button"
					variant="outline"
					className="flex flex-1 items-center gap-1 rounded-r-md py-6 font-semibold font-serif text-muted-foreground text-sm"
					onClick={() => handleSocialSignIn("github")}
				>
					<IconBrandGithub color="#000" className="size-6" />
					Continue with Github
				</Button>
			</div>
		</div>
	);
};
