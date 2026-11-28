import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  const m = await getMessages();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-start gap-3 sm:mb-8">
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand text-white sm:h-11 sm:w-11">
          <Shield className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-brand-deep dark:text-brand sm:text-3xl">
            {m.adminTitle}
          </h1>
          <p className="mt-2 text-sm text-muted">{m.adminIntro}</p>
        </div>
      </div>
      <AdminPanel />
    </main>
  );
}
