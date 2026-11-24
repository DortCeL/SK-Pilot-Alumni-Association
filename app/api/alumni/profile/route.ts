import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import {
  alumniProfileFieldsSchema,
  toStoredProfile,
} from "@/lib/validations/alumni";
import { AlumniProfileModel } from "@/models/alumni-profile";

export async function GET() {
  const m = await getMessages();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: m.errLoginRequired }, { status: 401 });
  }
  if (user.role === "admin") {
    return NextResponse.json({ error: m.errNoAdminProfile }, { status: 403 });
  }
  return NextResponse.json({ profile: user });
}

export async function PATCH(request: Request) {
  const m = await getMessages();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: m.errLoginRequired }, { status: 401 });
  }
  if (user.role === "admin") {
    return NextResponse.json({ error: m.errNoAdminProfile }, { status: 403 });
  }

  const parsed = alumniProfileFieldsSchema(m).safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? m.errValidation },
      { status: 400 },
    );
  }

  const stored = toStoredProfile(parsed.data);
  const email = (stored.email ?? "").trim().toLowerCase();
  if (email) {
    const taken = await AlumniProfileModel.exists({
      email,
      _id: { $ne: user._id },
    });
    if (taken) {
      return NextResponse.json(
        { error: m.errEmailUsed },
        { status: 409 },
      );
    }
  }

  await connectDB();
  const profile = await AlumniProfileModel.findByIdAndUpdate(
    user._id,
    {
      ...stored,
      email,
      mobilePhone: user.mobilePhone,
      role: user.role,
      feePaid: user.feePaid ?? false,
    },
    { new: true },
  ).lean();

  return NextResponse.json({ profile, message: m.errProfileUpdated });
}