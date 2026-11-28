"use client";

import { FileDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminFeesPanel } from "@/components/admin/admin-fees-panel";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { useMessages } from "@/components/language";
import { Spinner } from "@/components/ui/spinner";

type Tab = "members" | "fees";

export function AdminPanel() {
  const m = useMessages();
  const [tab, setTab] = useState<Tab>("members");
  const [total, setTotal] = useState<number | null>(null);
  const [paidTotal, setPaidTotal] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/alumni?limit=1&page=1");
      const data = await res.json();
      if (!res.ok) return;
      setTotal(data.registeredTotal ?? data.total ?? 0);
      setPaidTotal(data.paidTotal ?? 0);
    } catch {
      // keep previous stats
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  async function downloadPdf() {
    if (pdfLoading) return;
    setPdfLoading(true);
    setPdfError(null);
    // Fee tab must always request paid-only; members tab never does.
    const paidOnly = tab === "fees";
    try {
      const urlPath = paidOnly
        ? "/api/admin/alumni/pdf?paid=1"
        : "/api/admin/alumni/pdf";
      const res = await fetch(urlPath, { cache: "no-store" });
      if (!res.ok) throw new Error(m.loadFailed);
      if (paidOnly && res.headers.get("X-Paid-Only") !== "1") {
        throw new Error(m.loadFailed);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = paidOnly ? "paid-members.pdf" : "members.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : m.loadFailed);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {m.totalRegistered}: {total ?? "—"}
          <span className="mx-2 text-line">·</span>
          {m.feePaid}: {paidTotal ?? "—"}
        </p>
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={pdfLoading}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-brand-soft px-3.5 text-sm font-semibold text-brand-deep hover:brightness-95 disabled:opacity-60 dark:text-brand"
        >
          {pdfLoading ? <Spinner /> : <FileDown className="h-4 w-4" aria-hidden />}
          {tab === "fees" ? m.downloadPaidMembersList : m.downloadMembersList}
        </button>
      </div>
      {pdfError ? <p className="text-sm text-rose-600">{pdfError}</p> : null}

      <div className="flex gap-1 rounded-xl border border-line bg-paper p-1">
        <TabButton
          active={tab === "members"}
          onClick={() => setTab("members")}
          label={m.tabMembers}
        />
        <TabButton
          active={tab === "fees"}
          onClick={() => setTab("fees")}
          label={m.tabFees}
        />
      </div>

      {tab === "members" ? (
        <AdminUsersTable onMembersChanged={() => void refreshStats()} />
      ) : (
        <AdminFeesPanel onStatsChange={() => void refreshStats()} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-brand text-white shadow-sm"
          : "text-muted hover:bg-brand-soft hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
