import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    const ping = await mongoose.connection.db?.admin().command({ ping: 1 });
    return NextResponse.json({
      ok: true,
      database: mongoose.connection.name,
      ping,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MongoDB connection failed";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}