import { cookies } from "next/headers";
import { messages, type Locale, type Messages } from "@/lib/messages";

export type { Locale, Messages };

export async function getLang(): Promise<Locale> {
  const value = (await cookies()).get("lang")?.value;
  return value === "en" ? "en" : "bn";
}

export async function getMessages(): Promise<Messages> {
  return messages[await getLang()];
}
