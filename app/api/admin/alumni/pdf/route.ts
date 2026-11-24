import { NextResponse } from "next/server";
import { buildAlumniPdf } from "@/lib/alumni-pdf";
import { getLang, getMessages } from "@/lib/i18n";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { ProfileAddress } from "@/lib/profile-display";
import { AlumniProfileModel } from "@/models/alumni-profile";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const user = await getCurrentUser();
  const m = await getMessages();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }

  await connectDB();
  const items = await AlumniProfileModel.find({ role: "user" }).sort({ fullName: 1 }).lean();
  const pdf = await buildAlumniPdf(
    items.map((item) => ({
      fullName: item.fullName,
      academicProgram: item.academicProgram,
      group: item.group,
      passingYear: item.passingYear,
      occupation: item.occupation,
      designation: item.designation,
      organization: item.organization,
      officeAddress: item.officeAddress,
      profilePhotoUrl: item.profilePhotoUrl,
      mobilePhone: item.mobilePhone,
      whatsappPhone: item.whatsappPhone || item.mobilePhone,
      email: item.email,
      address: item.address as ProfileAddress,
    })),
    m,
    await getLang(),
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="alumni.pdf"',
    },
  });
}
