import { Card } from "@client-pulse/ui/components/card";
import { EmailSignInForm } from "./email-signin-form";
import { SocialSignInForm } from "./social-signin-form";

export const AuthForm = () => {
	return (
		<Card className="mx-auto flex w-full max-w-md flex-col space-y-2 bg-transparent px-4 py-8 ring-0">
			<div className="space-y-8">
				<div className="text-center font-sans text-2xl">
					<span className="font-semibold text-primary">Sign</span>
					<span className="p-1 font-bold text-2xl">In</span>
				</div>
			</div>
			<EmailSignInForm />
			<div className="relative flex items-center">
				<div className="grow border-muted-foreground/30 border-t" />
				<span className="px-3 text-muted-foreground text-sm">OR</span>
				<div className="grow border-muted-foreground/30 border-t" />
			</div>
			<SocialSignInForm />
		</Card>
	);
};
