"use client";

import { useEffect, useMemo, useState } from "react";
import { useMessages } from "@/components/language";
import { Spinner } from "@/components/ui/spinner";

type FeeRow = {
  _id: string;
  fullName: string;
  mobilePhone: string;
  registrationNumber?: string;
  feePaid?: boolean;
};

export function AdminFeesPanel({
  onStatsChange,
}: {
  onStatsChange?: () => void;
} = {}) {
  const m = useMessages();
  const [items, setItems] = useState<FeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/alumni/fees");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? m.loadFailed);
        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : m.loadFailed);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [m.loadFailed]);

  const unpaid = useMemo(
    () => items.filter((item) => !item.feePaid),
    [items],
  );
  const paid = useMemo(
    () => items.filter((item) => Boolean(item.feePaid)),
    [items],
  );

  async function toggleFee(id: string, nextPaid: boolean) {
    if (savingId) return;
    setSavingId(id);
    setError(null);
    const previous = items;
    setItems((rows) =>
      rows.map((row) => (row._id === id ? { ...row, feePaid: nextPaid } : row)),
    );
    try {
      const res = await fetch(`/api/admin/alumni/${id}/fee`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feePaid: nextPaid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? m.feeUpdateFailed);
      }
      const confirmed =
        typeof data.feePaid === "boolean"
          ? data.feePaid
          : typeof data.profile?.feePaid === "boolean"
            ? data.profile.feePaid
            : null;
      if (confirmed !== nextPaid) {
        throw new Error(m.feeUpdateFailed);
      }
      setItems((rows) =>
        rows.map((row) =>
          row._id === id ? { ...row, feePaid: confirmed } : row,
        ),
      );
      onStatsChange?.();
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : m.feeUpdateFailed);
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
        <Spinner className="h-5 w-5" />
        {m.loading}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted">{m.feeToggleHint}</p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          {m.noneFound}
        </p>
      ) : (
        <>
          <FeeSection
            title={m.feeUnpaidCount.replace("{count}", String(unpaid.length))}
            tone="unpaid"
            rows={unpaid}
            savingId={savingId}
            actionLabel={m.feeMarkPaid}
            emptyLabel={m.noneFound}
            onToggle={toggleFee}
          />
          <FeeSection
            title={m.feePaidCount.replace("{count}", String(paid.length))}
            tone="paid"
            rows={paid}
            savingId={savingId}
            actionLabel={m.feeMarkUnpaid}
            emptyLabel={m.noneFound}
            onToggle={toggleFee}
          />
        </>
      )}
    </div>
  );
}

function FeeSection({
  title,
  tone,
  rows,
  savingId,
  actionLabel,
  emptyLabel,
  onToggle,
}: {
  title: string;
  tone: "paid" | "unpaid";
  rows: FeeRow[];
  savingId: string | null;
  actionLabel: string;
  emptyLabel: string;
  onToggle: (id: string, nextPaid: boolean) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div
        className={`flex items-center justify-between px-4 py-3 sm:px-5 ${
          tone === "paid"
            ? "bg-brand-soft/70 text-brand-deep dark:text-brand"
            : "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
        }`}
      >
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-5 text-sm text-muted sm:px-5">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((row) => {
            const paid = Boolean(row.feePaid);
            const busy = savingId === row._id;
            return (
              <li
                key={row._id}
                className="flex items-center gap-3 px-4 py-3 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {row.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {row.mobilePhone}
                    {row.registrationNumber
                      ? ` · ${row.registrationNumber}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onToggle(row._id, !paid)}
                  className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition disabled:opacity-60 ${
                    paid
                      ? "border border-line bg-paper text-ink hover:bg-brand-soft"
                      : "bg-brand text-white hover:bg-brand-deep"
                  }`}
                >
                  {busy ? <Spinner className="h-3.5 w-3.5" /> : null}
                  {actionLabel}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
