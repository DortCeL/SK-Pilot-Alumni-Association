import { UserRound } from "lucide-react";
import { RegistrationForm } from "@/components/alumni/registration-form";
import { getMessages } from "@/lib/i18n";

export default async function RegisterPage() {
  const m = await getMessages();
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8">
        <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white">
          <UserRound className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-semibold text-brand-deep dark:text-brand md:text-4xl">
          {m.registerTitle}
        </h1>
        <p className="mt-2 text-sm text-muted">{m.registerIntro}</p>
      </div>
      <RegistrationForm />
    </main>
  );
}
