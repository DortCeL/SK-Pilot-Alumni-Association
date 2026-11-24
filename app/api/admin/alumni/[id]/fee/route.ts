import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { AlumniProfileModel } from "@/models/alumni-profile";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const m = await getMessages();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }

  const body = (await request.json()) as { feePaid?: unknown };
  if (typeof body.feePaid !== "boolean") {
    return NextResponse.json({ error: m.errValidation }, { status: 400 });
  }

  const { id } = await ctx.params;
  await connectDB();
  const profile = await AlumniProfileModel.findByIdAndUpdate(
    id,
    { feePaid: body.feePaid },
    { new: true },
  ).lean();

  if (!profile) {
    return NextResponse.json({ error: m.errProfileMissing }, { status: 404 });
  }

  return NextResponse.json({ profile, message: m.errProfileUpdated });
}
