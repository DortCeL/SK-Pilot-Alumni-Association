import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { AlumniProfileModel } from "@/models/alumni-profile";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: (await getMessages()).errForbidden }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const search = params.get("search")?.trim();
  const sort = params.get("sort") || "newest";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(params.get("limit")) || DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { role: "user" };
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { fullName: regex },
      { mobilePhone: regex },
      { whatsappPhone: regex },
      { email: regex },
      { passingYear: regex },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    name: { fullName: 1 },
  };

  await connectDB();
  const [items, total] = await Promise.all([
    AlumniProfileModel.find(filter)
      .sort(sortMap[sort] ?? sortMap.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    AlumniProfileModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}
