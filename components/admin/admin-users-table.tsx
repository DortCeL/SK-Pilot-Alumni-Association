"use client";

import Image from "next/image";
import Link from "next/link";
import { PencilLine, Search, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useLang, useMessages } from "@/components/language";
import { inputClassName } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import {
  displayValue,
  formatAddress,
  type ProfileAddress,
} from "@/lib/profile-display";

type AlumniRow = {
  _id: string;
  fullName: string;
  registrationNumber?: string;
  academicProgram?: string;
  group: string;
  passingYear: string;
  occupation?: string;
  designation?: string;
  organization?: string;
  officeAddress?: string;
  profilePhotoUrl?: string;
  mobilePhone: string;
  whatsappPhone?: string;
  email?: string;
  address?: ProfileAddress;
};

type SortMode = "newest" | "oldest" | "name";

type ListData = {
  items: AlumniRow[];
  total: number;
  totalPages: number;
};

type ListView = {
  search: string;
  reg: string;
  sort: SortMode;
  page: number;
};

const PAGE_SIZE = 20;

let savedView: ListView = { search: "", reg: "", sort: "newest", page: 1 };
const pageCache = new Map<string, ListData>();

function cacheKey(view: ListView) {
  return `${view.sort}|${view.page}|${view.search.trim().toLowerCase()}|${view.reg.trim().toLowerCase()}`;
}

export function AdminUsersTable({
  onMembersChanged,
}: {
  onMembersChanged?: () => void;
} = {}) {
  const m = useMessages();
  const saved = pageCache.get(cacheKey(savedView));
  const [searchInput, setSearchInput] = useState(savedView.search);
  const [search, setSearch] = useState(savedView.search);
  const [regInput, setRegInput] = useState(savedView.reg);
  const [reg, setReg] = useState(savedView.reg);
  const [sort, setSort] = useState<SortMode>(savedView.sort);
  const [page, setPage] = useState(savedView.page);
  const [fetchTick, setFetchTick] = useState(0);
  const forceFetch = useRef(false);
  const [rows, setRows] = useState<AlumniRow[]>(saved?.items ?? []);
  const [total, setTotal] = useState(saved?.total ?? 0);
  const [totalPages, setTotalPages] = useState(saved?.totalPages ?? 1);
  const [loading, setLoading] = useState(!saved);
  const [searchOpen, setSearchOpen] = useState(
    Boolean(savedView.search || savedView.reg),
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      const nextReg = regInput.trim();
      if (nextSearch === search && nextReg === reg) return;
      setPage(1);
      setSearch(nextSearch);
      setReg(nextReg);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, regInput, search, reg]);

  useEffect(() => {
    const view: ListView = { search, reg, sort, page };
    savedView = view;
    const cached = pageCache.get(cacheKey(view));
    const force = forceFetch.current;
    forceFetch.current = false;
    if (cached && !force) {
      setRows(cached.items);
      setTotal(cached.total);
      setTotalPages(cached.totalPages);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    async function load() {
      if (!cached) setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (reg) params.set("reg", reg);
        params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));
        const res = await fetch(`/api/admin/alumni?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? m.loadFailed);
        if (cancelled) return;
        const next: ListData = {
          items: data.items ?? [],
          total: data.total ?? 0,
          totalPages: Math.max(
            1,
            data.totalPages ?? Math.ceil((data.total ?? 0) / PAGE_SIZE) ?? 1,
          ),
        };
        pageCache.set(cacheKey(view), next);
        setRows(next.items);
        setTotal(next.total);
        setTotalPages(next.totalPages);
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
  }, [search, reg, sort, page, fetchTick, m.loadFailed]);

  async function handleDelete(id: string) {
    if (deletingId) return;
    if (!confirm(m.confirmDelete)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/alumni/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      pageCache.clear();
      forceFetch.current = true;
      const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      setLoading(true);
      setFetchTick((tick) => tick + 1);
      onMembersChanged?.();
    } finally {
      setDeletingId(null);
    }
  }

  function changeSort(nextSort: SortMode) {
    if (nextSort === sort && page === 1) return;
    if (!pageCache.get(cacheKey({ search, reg, sort: nextSort, page: 1 }))) {
      setLoading(true);
    }
    setSort(nextSort);
    setPage(1);
  }

  const isFiltering = Boolean(searchInput.trim() || regInput.trim());

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          aria-expanded={searchOpen}
          aria-label={searchOpen ? m.closeSearch : m.openSearch}
          onClick={() => setSearchOpen((open) => !open)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
            searchOpen || isFiltering
              ? "border-brand bg-brand text-white"
              : "border-line bg-paper text-ink hover:bg-brand-soft"
          }`}
        >
          {searchOpen ? (
            <X className="h-4 w-4" aria-hidden />
          ) : isFiltering ? (
            <span className="filter-dots" aria-hidden>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          ) : (
            <Search className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          searchOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`origin-top pb-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              searchOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-1 opacity-0"
            }`}
          >
            <div className="rounded-2xl border border-line bg-paper p-3 sm:p-4">
              <AdminSearchBar
                search={searchInput}
                setSearch={setSearchInput}
                reg={regInput}
                setReg={setRegInput}
                sort={sort}
                setSort={changeSort}
              />
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading && rows.length === 0 ? (
        <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
          <Spinner className="h-5 w-5" />
          {m.loading}
        </p>
      ) : null}

      {!loading && rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          {m.noneFound}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="relative">
          {loading ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/55">
              <Spinner className="h-6 w-6 text-brand" />
            </div>
          ) : null}
          <ul className="grid gap-2 md:hidden">
            {rows.map((row) => (
              <MobileRow
                key={row._id}
                row={row}
                deleting={deletingId === row._id}
                onDelete={() => void handleDelete(row._id)}
              />
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border border-line bg-paper md:block">
            <table className="w-full text-left text-sm">
              <tbody>
                {rows.map((row) => (
                  <DesktopRow
                    key={row._id}
                    row={row}
                    deleting={deletingId === row._id}
                    onDelete={() => void handleDelete(row._id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                className="inline-flex h-9 items-center rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  const next = page - 1;
                  if (!pageCache.get(cacheKey({ search, reg, sort, page: next }))) {
                    setLoading(true);
                  }
                  setPage(next);
                }}
              >
                {loading ? <Spinner className="mr-1.5" /> : null}
                {m.previousPage}
              </button>
              <p className="text-sm text-muted">
                {m.pageOf
                  .replace('{page}', String(page))
                  .replace('{total}', String(totalPages))}
              </p>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                className="inline-flex h-9 items-center rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  const next = page + 1;
                  if (!pageCache.get(cacheKey({ search, reg, sort, page: next }))) {
                    setLoading(true);
                  }
                  setPage(next);
                }}
              >
                {loading ? <Spinner className="mr-1.5" /> : null}
                {m.nextPage}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function formatOccupationDesignation(occupation?: string, designation?: string) {
  const parts = [occupation, designation]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function stopRowAction(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function MobileRow({
  row,
  deleting,
  onDelete,
}: {
  row: AlumniRow;
  deleting: boolean;
  onDelete: () => void;
}) {
  const m = useMessages();
  const roleLine = formatOccupationDesignation(row.occupation, row.designation);

  return (
    <li className="relative overflow-hidden rounded-xl border border-line bg-paper">
      <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-0.5">
        <Link
          href={`/admin/users/${row._id}/edit`}
          aria-label={m.edit}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-brand hover:bg-brand-soft"
          onClick={stopRowAction}
        >
          <PencilLine className="h-4 w-4" aria-hidden />
        </Link>
        <button
          type="button"
          aria-label={m.delete}
          disabled={deleting}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-700 hover:bg-rose-50 disabled:opacity-60 dark:text-rose-300 dark:hover:bg-rose-950"
          onClick={(event) => {
            stopRowAction(event);
            onDelete();
          }}
        >
          {deleting ? <Spinner /> : <Trash2 className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      <Link
        href={`/admin/users/${row._id}`}
        className="flex items-start gap-2.5 p-2.5 pr-20"
      >
        <Avatar name={row.fullName} src={row.profilePhotoUrl} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{row.fullName}</p>
          {row.registrationNumber ? (
            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-muted">
              {row.registrationNumber}
            </p>
          ) : null}
          <p className="mt-0.5 break-words text-xs leading-4 text-brand">{roleLine}</p>
          <p className="mt-1.5 text-[11px] text-muted">
            {m.group}: {displayValue(row.group)}
            {" · "}
            {m.passingYear}: {displayValue(row.passingYear)}
          </p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted">
            {m.mobile}: {row.mobilePhone}
          </p>
          <p className="text-[11px] leading-4 text-muted">
            {m.whatsapp}: {row.whatsappPhone || row.mobilePhone}
          </p>
        </div>
      </Link>
    </li>
  );
}

function DesktopRow({
  row,
  deleting,
  onDelete,
}: {
  row: AlumniRow;
  deleting: boolean;
  onDelete: () => void;
}) {
  const m = useMessages();
  const lang = useLang();
  const roleLine = formatOccupationDesignation(row.occupation, row.designation);

  return (
    <tr className="border-t border-line first:border-t-0">
      <td className="p-0">
        <div className="relative flex items-start gap-3 px-3 py-2">
          <Link
            href={`/admin/users/${row._id}`}
            className="flex min-w-0 flex-1 items-start gap-3 rounded-lg outline-offset-2 hover:bg-brand-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Avatar name={row.fullName} src={row.profilePhotoUrl} size={40} />
            <div className="min-w-0 flex-1 py-0.5 pr-20">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-semibold text-ink">{row.fullName}</span>
                {row.registrationNumber ? (
                  <span className="text-xs font-medium tracking-wide text-muted">
                    {row.registrationNumber}
                  </span>
                ) : null}
                <span className="max-w-full break-words text-xs text-brand">
                  {roleLine}
                </span>
              </div>
              <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs leading-5 text-muted">
                <Bit label={m.group} value={row.group} />
                <Bit label={m.year} value={row.passingYear} />
                <Bit label={m.mobile} value={row.mobilePhone} />
                <Bit
                  label={m.whatsapp}
                  value={row.whatsappPhone || row.mobilePhone}
                />
                <Bit label={m.email} value={row.email} />
                <Bit label={m.organization} value={row.organization} />
              </p>
              <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs leading-5 text-muted">
                <Bit
                  label={m.addressSection}
                  value={formatAddress(row.address, lang)}
                />
                <Bit label={m.officeAddress} value={row.officeAddress} />
              </p>
            </div>
          </Link>
          <div className="absolute right-2 top-2 flex shrink-0 items-center gap-0.5">
            <Link
              href={`/admin/users/${row._id}/edit`}
              aria-label={m.edit}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-brand hover:bg-brand-soft"
              onClick={stopRowAction}
            >
              <PencilLine className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              aria-label={m.delete}
              disabled={deleting}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-700 hover:bg-rose-50 disabled:opacity-60 dark:text-rose-300 dark:hover:bg-rose-950"
              onClick={(event) => {
                stopRowAction(event);
                onDelete();
              }}
            >
              {deleting ? <Spinner /> : <Trash2 className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

function Bit({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <span>
      <span className="text-muted">{label}: </span>
      {displayValue(value)}
    </span>
  );
}

function Avatar({
  name,
  src,
  size,
}: {
  name: string;
  src?: string;
  size: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-deep dark:text-brand"
      style={{ width: size, height: size }}
    >
      {name.trim().charAt(0) || "?"}
    </div>
  );
}

function AdminSearchBar({
  search,
  setSearch,
  reg,
  setReg,
  sort,
  setSort,
}: {
  search: string;
  setSearch: (v: string) => void;
  reg: string;
  setReg: (v: string) => void;
  sort: SortMode;
  setSort: (v: SortMode) => void;
}) {
  const m = useMessages();
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
      <input
        className={inputClassName}
        placeholder={m.searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <input
        className={`${inputClassName} sm:max-w-xs`}
        placeholder={m.regSearchPlaceholder}
        value={reg}
        onChange={(e) => setReg(e.target.value)}
      />
      <select
        className={`${inputClassName} sm:w-44`}
        value={sort}
        onChange={(e) => setSort(e.target.value as SortMode)}
      >
        <option value="newest">{m.sortNewest}</option>
        <option value="oldest">{m.sortOldest}</option>
        <option value="name">{m.sortName}</option>
      </select>
    </div>
  );
}
