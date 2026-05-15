import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
      <span className="font-heading text-xl font-bold text-brand">SkillPath</span>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton>
            <button className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="text-sm font-medium bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark transition-colors">
              Sign up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}
