"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton({ className = "btn ghost", children }: { className?: string; children?: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button type="button" className={className} onClick={handleSignOut}>
      {children ?? "Sign out"}
    </button>
  );
}
