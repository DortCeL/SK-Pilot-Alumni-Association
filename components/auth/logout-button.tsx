"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/components/language";
import { Spinner } from "@/components/ui/spinner";

export function LogoutButton({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const m = useMessages();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        } catch {
          setLoading(false);
        }
      }}
      className={`inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink hover:bg-brand-soft disabled:opacity-60 ${className}`}
    >
      {loading ? <Spinner /> : <LogOut className="h-4 w-4" aria-hidden />}
      {showLabel ? <span>{m.logout}</span> : <span className="sr-only">{m.logout}</span>}
    </button>
  );
}
