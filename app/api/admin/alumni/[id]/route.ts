import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import {
  alumniProfileFieldsSchema,
  toStoredProfile,
} from "@/lib/validations/alumni";
import { AlumniProfileModel } from "@/models/alumni-profile";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const m = await getMessages();
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }
  const { id } = await ctx.params;
  await connectDB();
  const profile = await AlumniProfileModel.findById(id).lean();
  if (!profile) {
    return NextResponse.json({ error: m.errProfileMissing }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const m = await getMessages();
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }

  const { id } = await ctx.params;
  const parsed = alumniProfileFieldsSchema(m).safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? m.errValidation },
      { status: 400 },
    );
  }

  const stored = toStoredProfile(parsed.data);
  const email = (stored.email ?? "").trim().toLowerCase();
  await connectDB();
  const existing = await AlumniProfileModel.findById(id).lean();
  if (!existing) {
    return NextResponse.json({ error: m.errProfileMissing }, { status: 404 });
  }
  const profile = await AlumniProfileModel.findByIdAndUpdate(
    id,
    { ...stored, email, feePaid: existing.feePaid ?? false },
    { new: true },
  ).lean();

  if (!profile) {
    return NextResponse.json({ error: m.errProfileMissing }, { status: 404 });
  }
  return NextResponse.json({ profile, message: m.errProfileUpdated });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const m = await getMessages();
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: m.errForbidden }, { status: 403 });
  }
  const { id } = await ctx.params;
  if (admin._id.toString() === id) {
    return NextResponse.json({ error: m.errCannotDeleteSelf }, { status: 400 });
  }
  await connectDB();
  await AlumniProfileModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}