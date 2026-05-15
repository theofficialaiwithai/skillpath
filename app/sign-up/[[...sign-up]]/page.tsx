import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-65px)] bg-bg-warm">
      <SignUp />
    </main>
  );
}
