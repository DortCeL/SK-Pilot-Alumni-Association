"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, Menu, Shield, UserRound, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageToggle, useMessages } from "@/components/language";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  role: "admin" | "user" | null;
};

const mobileBtn =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-brand-soft px-4 text-sm font-semibold text-brand-deep dark:text-brand";

const mobilePrimary =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white";

export function SiteNav({ role }: Props) {
  const m = useMessages();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
        <DesktopLinks role={role} />
        <LanguageToggle />
        <ThemeToggle />
      </nav>

      <div className="flex items-center gap-1.5 md:hidden">
        <LanguageToggle />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-paper text-ink"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? m.closeMenu : m.openMenu}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-x-0 top-[3.75rem] z-30 border-b border-line bg-paper p-4 md:hidden"
          id="mobile-nav"
        >
          <div className="flex flex-col gap-2.5">
            <MobileLinks role={role} onNavigate={() => setOpen(false)} />
            <ThemeToggle className={mobileBtn} showLabel />
            {role ? <LogoutButton className={mobileBtn} showLabel /> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function DesktopLinks({ role }: { role: Props["role"] }) {
  const m = useMessages();
  if (!role) {
    return (
      <>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-ink hover:bg-brand-soft hover:text-brand-deep"
        >
          <UserRound className="h-4 w-4" aria-hidden />
          {m.register}
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-white hover:bg-brand-deep"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          {m.login}
        </Link>
      </>
    );
  }
  return (
    <>
      {role === "admin" ? (
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-ink hover:bg-brand-soft hover:text-brand-deep"
        >
          <Shield className="h-4 w-4" aria-hidden />
          {m.admin}
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-ink hover:bg-brand-soft hover:text-brand-deep"
        >
          <UserRound className="h-4 w-4" aria-hidden />
          {m.myProfile}
        </Link>
      )}
      <LogoutButton showLabel />
    </>
  );
}

function MobileLinks({
  role,
  onNavigate,
}: {
  role: Props["role"];
  onNavigate: () => void;
}) {
  const m = useMessages();

  if (!role) {
    return (
      <>
        <Link href="/register" className={mobileBtn} onClick={onNavigate}>
          <UserRound className="h-4 w-4" aria-hidden />
          {m.register}
        </Link>
        <Link href="/login" className={mobilePrimary} onClick={onNavigate}>
          <LogIn className="h-4 w-4" aria-hidden />
          {m.login}
        </Link>
      </>
    );
  }

  return role === "admin" ? (
    <Link href="/admin" className={mobileBtn} onClick={onNavigate}>
      <Shield className="h-4 w-4" aria-hidden />
      {m.admin}
    </Link>
  ) : (
    <Link href="/dashboard" className={mobileBtn} onClick={onNavigate}>
      <UserRound className="h-4 w-4" aria-hidden />
      {m.myProfile}
    </Link>
  );
}
