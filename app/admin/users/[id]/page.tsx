import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlumniProfileCard } from "@/components/alumni/profile-card";
import { connectDB } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import type { ProfileAddress } from "@/lib/profile-display";
import { getCurrentUser } from "@/lib/session";
import { AlumniProfileModel } from "@/models/alumni-profile";

export default async function AdminUserProfilePage({
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
        href="/admin"
        className="mb-6 inline-block text-sm font-medium text-brand hover:underline"
      >
        {m.backToList}
      </Link>
      <AlumniProfileCard
        editHref={`/admin/users/${id}/edit`}
        profile={{
          fullName: profile.fullName,
          academicProgram: profile.academicProgram,
          group: profile.group,
          passingYear: profile.passingYear,
          occupation: profile.occupation,
          designation: profile.designation,
          organization: profile.organization,
          officeAddress: profile.officeAddress,
          profilePhotoUrl: profile.profilePhotoUrl,
          mobilePhone: profile.mobilePhone,
          whatsappPhone: profile.whatsappPhone || profile.mobilePhone,
          email: profile.email,
          address: profile.address as ProfileAddress,
        }}
      />
    </main>
  );
}
