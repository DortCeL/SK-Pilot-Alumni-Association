import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/alumni/profile-edit-form";
import { connectDB } from "@/lib/db";
import { toFormValues } from "@/lib/form-values";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { AlumniProfileModel } from "@/models/alumni-profile";

export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");
  if (actor.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  await connectDB();
  const profile = await AlumniProfileModel.findById(id).lean();
  if (!profile) notFound();
  const m = await getMessages();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link
        href={`/admin/users/${id}`}
        className="mb-6 inline-block text-sm font-medium text-brand hover:underline"
      >
        {m.backToProfile}
      </Link>
      <h1 className="mb-2 font-display text-3xl font-semibold text-brand-deep dark:text-brand">
        {m.editNamed} — {profile.fullName}
      </h1>
      <p className="mb-8 text-sm text-muted">
        {m.mobilePrefix}: {profile.mobilePhone}
      </p>
      <ProfileEditForm
        initialValues={toFormValues(profile)}
        apiUrl={`/api/admin/alumni/${id}`}
        lockPhone
        cancelHref={`/admin/users/${id}`}
      />
    </main>
  );
}
