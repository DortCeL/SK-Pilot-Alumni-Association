"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/components/language";

export function LogoutButton({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const m = useMessages();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className={`inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink hover:bg-brand-soft ${className}`}
    >
      <LogOut className="h-4 w-4" aria-hidden />
      {showLabel ? <span>{m.logout}</span> : <span className="sr-only">{m.logout}</span>}
    </button>
  );
}
