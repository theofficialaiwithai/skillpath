import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-65px)] bg-bg-warm">
      <SignIn />
    </main>
  );
}
