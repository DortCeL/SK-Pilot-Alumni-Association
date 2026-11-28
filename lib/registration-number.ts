import { AlumniProfileModel } from "@/models/alumni-profile";

const PREFIX = "SKP";

export function formatRegistrationNumber(passingYear: string, sequence: number) {
  const year = String(passingYear).trim() || "0000";
  return `${PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export async function nextRegistrationNumber(passingYear: string) {
  const year = String(passingYear).trim() || "0000";
  const prefix = `${PREFIX}-${year}-`;
  const latest = await AlumniProfileModel.findOne({
    registrationNumber: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\d{4}$`),
  })
    .sort({ registrationNumber: -1 })
    .select("registrationNumber")
    .lean();

  let sequence = 1;
  if (latest?.registrationNumber?.startsWith(prefix)) {
    const parsed = Number(latest.registrationNumber.slice(prefix.length));
    if (Number.isFinite(parsed) && parsed >= 1) sequence = parsed + 1;
  }

  return formatRegistrationNumber(year, sequence);
}

/** Assigns permanent registration numbers to alumni who do not have one yet. */
export async function ensureRegistrationNumbers() {
  const missing = await AlumniProfileModel.find({
    role: "user",
    $or: [
      { registrationNumber: { $exists: false } },
      { registrationNumber: null },
      { registrationNumber: "" },
    ],
  })
    .sort({ createdAt: 1 })
    .select("_id passingYear")
    .lean();

  if (missing.length === 0) return;

  const counters = new Map<string, number>();
  const existing = await AlumniProfileModel.find({
    role: "user",
    registrationNumber: { $regex: `^${PREFIX}-\\d{4}-\\d{4}$` },
  })
    .select("registrationNumber")
    .lean();

  for (const item of existing) {
    const value = item.registrationNumber ?? "";
    const parts = value.split("-");
    if (parts.length !== 3) continue;
    const year = parts[1];
    const sequence = Number(parts[2]);
    if (!year || !Number.isFinite(sequence)) continue;
    counters.set(year, Math.max(counters.get(year) ?? 0, sequence));
  }

  for (const alumni of missing) {
    const year = String(alumni.passingYear ?? "0000").trim() || "0000";
    const next = (counters.get(year) ?? 0) + 1;
    counters.set(year, next);
    await AlumniProfileModel.updateOne(
      { _id: alumni._id, $or: [{ registrationNumber: { $exists: false } }, { registrationNumber: null }, { registrationNumber: "" }] },
      { $set: { registrationNumber: formatRegistrationNumber(year, next) } },
    );
  }
}

export async function allocateRegistrationNumber(passingYear: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = await nextRegistrationNumber(passingYear);
    const taken = await AlumniProfileModel.exists({ registrationNumber: candidate });
    if (!taken) return candidate;
  }
  throw new Error("Could not allocate a registration number");
}
