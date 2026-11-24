import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { connectDB } from "@/lib/db";
import { AlumniProfileModel } from "@/models/alumni-profile";

const COOKIE = "session";
const WEEK = 60 * 60 * 24 * 7;

function secret() {
  return process.env.AUTH_SECRET || "dev-only-change-me";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionToken(userId: string, role: string) {
  const payload = Buffer.from(
    JSON.stringify({ userId, role, exp: Date.now() + WEEK * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      userId: string;
      role: "user" | "admin";
      exp: number;
    };
    if (!data.userId || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, role: string) {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(userId, role), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: WEEK,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCurrentUser() {
  try {
    await connectDB();
    const token = (await cookies()).get(COOKIE)?.value;
    const session = readSessionToken(token);
    if (!session) return null;
    return AlumniProfileModel.findById(session.userId).lean();
  } catch (error) {
    unstable_rethrow(error);
    console.error("session lookup failed", error);
    return null;
  }
}