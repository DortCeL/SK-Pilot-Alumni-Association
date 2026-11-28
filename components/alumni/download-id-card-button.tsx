"use client";

import { IdCard } from "lucide-react";
import { useState } from "react";
import { useMessages } from "@/components/language";
import { Spinner } from "@/components/ui/spinner";

export function DownloadIdCardButton({
  href,
  className = "",
}: {
  href: string;
  className?: string;
}) {
  const m = useMessages();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(href);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? m.idCardFailed);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "alumni-id-card.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.idCardFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void download()}
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60 sm:w-auto"
      >
        {loading ? <Spinner /> : <IdCard className="h-4 w-4" aria-hidden />}
        {loading ? m.downloadingIdCard : m.downloadIdCard}
      </button>
      {error ? <p className="mt-2 text-xs text-[#f4ead0]">{error}</p> : null}
    </div>
  );
}
