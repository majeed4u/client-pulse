import { AuthForm } from "@/components/auth/auth-form";
import { AuthLogo } from "@/components/auth/auth-logo";

export default async function AuthPage() {
	return (
		<div className="w-full space-y-2">
			<AuthLogo text="Welcome to Taleem - Your Gateway to Knowledge!" />
			<AuthForm />
		</div>
	);
}
