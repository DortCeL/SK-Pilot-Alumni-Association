import { redirect } from "next/navigation";
import { PencilLine } from "lucide-react";
import { ProfileEditForm } from "@/components/alumni/profile-edit-form";
import { toFormValues } from "@/lib/form-values";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardEditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  const m = await getMessages();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-start gap-3">
        <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white">
          <PencilLine className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-brand-deep dark:text-brand">
            {m.editProfile}
          </h1>
          <p className="mt-2 text-sm text-muted">{m.editIntro}</p>
        </div>
      </div>
      <ProfileEditForm
        initialValues={toFormValues(user)}
        apiUrl="/api/alumni/profile"
        lockPhone
        cancelHref="/dashboard"
        redirectTo="/dashboard"
      />
    </main>
  );
}
