import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone";
import { getMessages } from "@/lib/i18n";
import { setSessionCookie } from "@/lib/session";
import { AlumniProfileModel } from "@/models/alumni-profile";

export async function POST(request: Request) {
  const body = (await request.json()) as { identifier?: string; password?: string };
  const identifier = (body.identifier ?? "").trim();
  const password = body.password ?? "";

  const m = await getMessages();
  if (!identifier || !password) {
    return NextResponse.json(
      { error: m.errLoginFields },
      { status: 400 },
    );
  }

  await connectDB();

  const user = identifier.includes("@")
    ? await AlumniProfileModel.findOne({ email: identifier.toLowerCase() }).select(
        "+passwordHash",
      )
    : isValidBdPhone(identifier)
      ? await AlumniProfileModel.findOne({
          mobilePhone: normalizeBdPhone(identifier),
        }).select("+passwordHash")
      : null;

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: m.errBadLogin },
      { status: 401 },
    );
  }

  await setSessionCookie(user._id.toString(), user.role);
  return NextResponse.json({
    ok: true,
    role: user.role,
  });
}