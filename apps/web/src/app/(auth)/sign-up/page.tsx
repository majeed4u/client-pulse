import { AuthLogo } from "@/components/auth/auth-logo";
import { AuthSignup } from "@/components/auth/auth-signup";

export default async function AuthPage() {
  return (
    <div className="w-full space-y-2">
      <AuthLogo text="Welcome to Taleem - Your Gateway to Knowledge!" />
      <AuthSignup />
    </div>
  );
}
