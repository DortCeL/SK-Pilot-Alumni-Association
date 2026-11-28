import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { AlumniProfileModel } from "@/models/alumni-profile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: (await getMessages()).errForbidden }, { status: 403 });
  }

  await connectDB();
  const items = await AlumniProfileModel.find({ role: "user" })
    .select("fullName mobilePhone registrationNumber feePaid")
    .sort({ fullName: 1 })
    .lean();

  return NextResponse.json({ items });
}
