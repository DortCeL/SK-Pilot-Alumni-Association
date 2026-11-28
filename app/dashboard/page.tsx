import { redirect } from "next/navigation";
import { AlumniProfileCard } from "@/components/alumni/profile-card";
import { getCurrentUser } from "@/lib/session";
import type { ProfileAddress } from "@/lib/profile-display";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <AlumniProfileCard
        editHref="/dashboard/edit"
        idCardHref="/api/alumni/id-card"
        profile={{
          fullName: user.fullName,
          registrationNumber: user.registrationNumber,
          academicProgram: user.academicProgram,
          group: user.group,
          passingYear: user.passingYear,
          occupation: user.occupation,
          designation: user.designation,
          organization: user.organization,
          officeAddress: user.officeAddress,
          profilePhotoUrl: user.profilePhotoUrl,
          mobilePhone: user.mobilePhone,
          whatsappPhone: user.whatsappPhone || user.mobilePhone,
          email: user.email,
          address: user.address as ProfileAddress,
        }}
      />
    </main>
  );
}
