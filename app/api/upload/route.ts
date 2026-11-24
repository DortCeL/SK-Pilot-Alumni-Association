import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { getMessages } from "@/lib/i18n";

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  const m = await getMessages();
  if (!(file instanceof File)) {
    return NextResponse.json({ error: m.errNoFile }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: m.errFileSize },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: m.errImagesOnly }, { status: 400 });
  }

  const folder = "profile" as const;

  try {
    const uploaded = await uploadImageBuffer(Buffer.from(await file.arrayBuffer()), folder);
    return NextResponse.json(uploaded);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: m.errUpload }, { status: 500 });
  }
}