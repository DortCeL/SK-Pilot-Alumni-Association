import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarRange, GraduationCap, UserRound } from "lucide-react";
import { getMessages } from "@/lib/i18n";

export default async function Home() {
  const m = await getMessages();

  return (
    <main>
      <section className="relative isolate min-h-[calc(100dvh-4.5rem)] overflow-hidden">
        <Image
          src="/hero-school.jpg"
          alt=""
          fill
          priority
          className="animate-hero-image object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06281e]/90 via-[#0b3d2e]/72 to-[#0b3d2e]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(184,137,46,0.28),transparent_40%)]" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-6xl flex-col justify-end px-4 pb-12 pt-16 sm:justify-center sm:pb-20 sm:pt-20">
          <p className="animate-rise max-w-3xl font-display text-[1.65rem] font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-4xl md:text-5xl">
            {m.brand}
          </p>
          <h1 className="animate-rise-delay mt-4 max-w-xl font-display text-xl font-medium text-[#f4ead0] [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] sm:mt-5 sm:text-3xl">
            {m.homeTitle}
          </h1>
          <p className="animate-rise-delay-2 mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-lg">
            {m.homeBody}
          </p>
          <div className="animate-rise-delay-2 mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d4a94a] px-5 text-sm font-semibold text-[#06281e] transition hover:brightness-110 sm:w-auto"
            >
              {m.registerNow}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/12 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
            >
              {m.login}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 className="font-display text-2xl font-semibold text-brand-deep dark:text-brand sm:text-3xl">
            {m.homeSecondaryTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {m.homeSecondaryBody}
          </p>

          <div className="mt-8 grid gap-8 sm:mt-10 md:grid-cols-3">
            <Feature
              icon={<GraduationCap className="h-5 w-5" aria-hidden />}
              title={m.featureRegister}
              body={m.featureRegisterHint}
            />
            <Feature
              icon={<UserRound className="h-5 w-5" aria-hidden />}
              title={m.featureProfile}
              body={m.featureProfileHint}
            />
            <Feature
              icon={<CalendarRange className="h-5 w-5" aria-hidden />}
              title={m.featureYears}
              body={m.featureYearsHint}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-accent/40 pt-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-deep dark:text-brand">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
