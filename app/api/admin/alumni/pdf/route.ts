import { NextResponse } from "next/server";
import { buildAlumniPdf } from "@/lib/alumni-pdf";
import { getLang, getMessages } from "@/lib/i18n";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { ProfileAddress } from "@/lib/profile-display";
import { AlumniProfileModel } from "@/models/alumni-profile";

export const runtime = "nodejs";
export const maxDuration = 60;

function toPdfRows(
  items: Array<{
    fullName: string;
    registrationNumber?: string | null;
    academicProgram?: string | null;
    group?: string | null;
    passingYear?: string | null;
    occupation?: string | null;
    designation?: string | null;
    organization?: string | null;
    officeAddress?: string | null;
    profilePhotoUrl?: string | null;
    mobilePhone?: string | null;
    whatsappPhone?: string | null;
    email?: string | null;
    address?: ProfileAddress | null;
  }>,
) {
  return items.map((item) => ({
    fullName: item.fullName,
    registrationNumber: item.registrationNumber,
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
  }));
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const m = await getMessages();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }

  // Only exact paid=1 enables paid-only mode. Any other value = all members.
  const paidOnly = new URL(request.url).searchParams.get("paid") === "1";

  await connectDB();

  // Strict Mongo filter: feePaid must be boolean true (not missing, string, or 1).
  const filter = paidOnly
    ? { role: "user", feePaid: { $eq: true } }
    : { role: "user" };

  const raw = await AlumniProfileModel.find(filter)
    .select(
      "fullName registrationNumber academicProgram group passingYear occupation designation organization officeAddress profilePhotoUrl mobilePhone whatsappPhone email address feePaid",
    )
    .sort({ fullName: 1 })
    .lean();

  // Defense in depth: never let a non-paid row into the paid PDF.
  const items = paidOnly
    ? raw.filter((item) => item.feePaid === true)
    : raw;

  if (paidOnly && items.some((item) => item.feePaid !== true)) {
    return NextResponse.json({ error: m.loadFailed }, { status: 500 });
  }

  const pdf = await buildAlumniPdf(toPdfRows(items), m, await getLang());
  const filename = paidOnly ? "paid-members.pdf" : "members.pdf";

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Paid-Only": paidOnly ? "1" : "0",
      "X-Member-Count": String(items.length),
    },
  });
}
