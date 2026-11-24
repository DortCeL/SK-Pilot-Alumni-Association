import Link from "next/link";
import { LogIn } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getMessages } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const registered = params.registered === "1";
  const m = await getMessages();

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
          <LogIn className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-semibold text-brand-deep dark:text-brand">
          {m.loginTitle}
        </h1>
        <p className="mt-2 text-sm text-muted">{m.loginIntro}</p>
      </div>
      <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
        <LoginForm registered={registered} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        {m.loginNew}{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          {m.registerNow}
        </Link>
      </p>
    </main>
  );
}
