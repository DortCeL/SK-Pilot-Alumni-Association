import { NextResponse } from "next/server";
import { buildIdCardPdf } from "@/lib/id-card-pdf";
import { getLang, getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const user = await getCurrentUser();
  const m = await getMessages();
  if (!user) {
    return NextResponse.json({ error: m.errLoginRequired }, { status: 401 });
  }
  if (user.role === "admin") {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }

  const pdf = await buildIdCardPdf(
    {
      fullName: user.fullName,
      registrationNumber: user.registrationNumber,
      group: user.group,
      passingYear: user.passingYear,
      mobilePhone: user.mobilePhone,
      profilePhotoUrl: user.profilePhotoUrl,
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
