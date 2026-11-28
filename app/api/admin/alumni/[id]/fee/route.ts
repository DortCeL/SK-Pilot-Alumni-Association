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
    { $set: { feePaid: body.feePaid } },
    { new: true },
  )
    .select("feePaid fullName")
    .lean();

  if (!profile) {
    return NextResponse.json({ error: m.errProfileMissing }, { status: 404 });
  }

  // Confirm the stored value matches what was requested.
  if (profile.feePaid !== body.feePaid) {
    return NextResponse.json({ error: m.feeUpdateFailed }, { status: 500 });
  }

  return NextResponse.json({
    feePaid: profile.feePaid,
    profile,
    message: m.errProfileUpdated,
  });
}
