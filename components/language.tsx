"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { messages, type Locale, type Messages } from "@/lib/messages";
import { Spinner } from "@/components/ui/spinner";

const LanguageContext = createContext<Locale>("bn");

export function LanguageProvider({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

export function useMessages(): Messages {
  return messages[useLang()];
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();
  const m = useMessages();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [lang]);

  function toggle() {
    if (pending) return;
    setPending(true);
    const next = lang === "bn" ? "en" : "bn";
    document.cookie = `lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink hover:bg-brand-soft disabled:opacity-60 ${className}`}
    >
      {pending ? <Spinner /> : <Languages className="h-4 w-4 shrink-0" aria-hidden />}
      {m.languageSwitch}
    </button>
  );
}
