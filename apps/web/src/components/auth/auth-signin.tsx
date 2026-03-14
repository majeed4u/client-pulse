import { Card } from "@client-pulse/ui/components/card";
import { SocialSignInForm } from "./social-signin-form";
import { SigninForm } from "./signin-form";

export const AuthSignin = () => {
  return (
    <Card className="mx-auto flex w-full max-w-md flex-col space-y-2 bg-transparent px-4 py-8 ring-0">
      <SigninForm />
      <div className="relative flex items-center">
        <div className="grow border-muted-foreground/30 border-t" />
        <span className="px-3 text-muted-foreground text-sm">OR</span>
        <div className="grow border-muted-foreground/30 border-t" />
      </div>
      <SocialSignInForm />
    </Card>
  );
};
