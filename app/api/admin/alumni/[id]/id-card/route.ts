import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { buildIdCardPdf } from "@/lib/id-card-pdf";
import { getLang, getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { AlumniProfileModel } from "@/models/alumni-profile";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentUser();
  const m = await getMessages();
  if (!actor || actor.role !== "admin") {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();
  const profile = await AlumniProfileModel.findById(id).lean();
  if (!profile || profile.role === "admin") {
    return NextResponse.json({ error: m.errProfileMissing }, { status: 404 });
  }

  const pdf = await buildIdCardPdf(
    {
      fullName: profile.fullName,
      registrationNumber: profile.registrationNumber,
      group: profile.group,
      passingYear: profile.passingYear,
      mobilePhone: profile.mobilePhone,
      profilePhotoUrl: profile.profilePhotoUrl,
    },
    m,
    await getLang(),
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="alumni-id-card.pdf"',
    },
  });
}
