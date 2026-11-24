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
        <ThemeToggle />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-paper text-ink hover:bg-brand-soft"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? m.closeMenu : m.openMenu}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 top-[3.75rem] z-30 md:hidden" id="mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-brand-deep/40"
            aria-label={m.closeMenu}
            onClick={() => setOpen(false)}
          />
          <div className="relative border-b border-line bg-paper px-4 py-4 shadow-lg">
            <div className="flex flex-col gap-2">
              <MobileLinks role={role} onNavigate={() => setOpen(false)} />
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                <LanguageToggle className="w-full justify-center" />
                {role ? <LogoutButton className="w-full justify-center" showLabel /> : null}
              </div>
            </div>
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
  const linkClass =
    "inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink hover:bg-brand-soft";

  if (!role) {
    return (
      <>
        <Link href="/register" className={linkClass} onClick={onNavigate}>
          <UserRound className="h-4 w-4" aria-hidden />
          {m.register}
        </Link>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-deep"
          onClick={onNavigate}
        >
          <LogIn className="h-4 w-4" aria-hidden />
          {m.login}
        </Link>
      </>
    );
  }

  return role === "admin" ? (
    <Link href="/admin" className={linkClass} onClick={onNavigate}>
      <Shield className="h-4 w-4" aria-hidden />
      {m.admin}
    </Link>
  ) : (
    <Link href="/dashboard" className={linkClass} onClick={onNavigate}>
      <UserRound className="h-4 w-4" aria-hidden />
      {m.myProfile}
    </Link>
  );
}
