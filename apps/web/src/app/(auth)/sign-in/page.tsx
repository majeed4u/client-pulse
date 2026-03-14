import { AuthSignin } from "@/components/auth/auth-signin";

export default function SigninPage() {
  return (
    <div className="w-full">
      <div className="px-6 space-y-2">
        <div className=" font-sans text-2xl">
          <span className="font-semibold text-primary">Sign</span>
          <span className="p-1 font-bold text-2xl">In</span>
        </div>

        <p className="text-muted-foreground mb-4">
          Welcome back! Please sign in to your account.
        </p>
      </div>
      <AuthSignin />
    </div>
  );
}
