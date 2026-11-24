import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getMessages } from "@/lib/i18n";
import {
  alumniRegistrationSchema,
  toStoredProfile,
} from "@/lib/validations/alumni";
import { AlumniProfileModel } from "@/models/alumni-profile";

export async function POST(request: Request) {
  const m = await getMessages();
  try {
    const parsed = alumniRegistrationSchema(m).safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? m.errValidation },
        { status: 400 },
      );
    }

    const { password, confirmPassword: _confirm, ...rest } = parsed.data;
    const profile = toStoredProfile(rest);
    const email = (profile.email ?? "").trim().toLowerCase();

    await connectDB();

    const phoneTaken = await AlumniProfileModel.exists({
      mobilePhone: profile.mobilePhone,
    });
    if (phoneTaken) {
      return NextResponse.json(
        { error: m.errPhoneTaken },
        { status: 409 },
      );
    }

    if (email) {
      const emailTaken = await AlumniProfileModel.exists({ email });
      if (emailTaken) {
        return NextResponse.json(
          { error: m.errEmailTaken },
          { status: 409 },
        );
      }
    }

    await AlumniProfileModel.create({
      ...profile,
      email,
      feePaid: false,
      role: "user",
      passwordHash: await hashPassword(password),
    });

    return NextResponse.json({
      ok: true,
      message: m.errRegistered,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: m.errRegisterFailed },
      { status: 500 },
    );
  }
}