import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const m = await getMessages();
  const role = user ? (user.role === "admin" ? "admin" : "user") : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md dark:bg-paper/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:py-3">
        <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition group-hover:bg-brand-deep">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block max-w-[11.5rem] text-[13px] font-semibold leading-snug text-brand-deep dark:text-brand sm:max-w-[14rem] md:hidden">
              {m.brandShort}
            </span>
            <span className="hidden text-sm font-semibold leading-snug text-brand-deep dark:text-brand md:block md:text-[0.95rem]">
              {m.brand}
            </span>
            <span className="mt-0.5 hidden text-[11px] leading-tight text-muted lg:block">
              {m.brandLatin}
            </span>
          </span>
        </Link>
        <SiteNav role={role} />
      </div>
    </header>
  );
}
