"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { AppUserProvider } from "@/components/AppUserProvider";

export default function ChatLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">Loading session...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <AppUserProvider>{children}</AppUserProvider>;
}
