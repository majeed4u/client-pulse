import { AuthSignup } from "@/components/auth/auth-signup";

export default async function SignupPage() {
  return (
    <div className="w-full space-y-2">
      <div className="px-6 space-y-2">
        <div className=" font-sans text-2xl">
          <span className="font-semibold text-primary">Sign</span>
          <span className="p-1 font-bold text-2xl">Up</span>
        </div>

        <p className="text-muted-foreground mb-4">
          Create a new account to get started with Client Pulse.
        </p>
      </div>
      <AuthSignup />
    </div>
  );
}
