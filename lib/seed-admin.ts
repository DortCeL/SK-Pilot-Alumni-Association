import { hashPassword } from "@/lib/password";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone";
import { ACADEMIC_PROGRAM } from "@/lib/constants";
import { AlumniProfileModel } from "@/models/alumni-profile";

let started = false;

/** Creates the admin from ADMIN_PHONE / ADMIN_PASSWORD the first time the DB connects. */
export async function ensureAdmin() {
  if (started) return;
  started = true;

  const phone = normalizeBdPhone(process.env.ADMIN_PHONE ?? "");
  const password = process.env.ADMIN_PASSWORD ?? "";
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const name = process.env.ADMIN_NAME || "Admin";

  if (!password || !isValidBdPhone(phone)) return;

  const existing = await AlumniProfileModel.findOne({ mobilePhone: phone });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
    }
    return;
  }

  await AlumniProfileModel.create({
    role: "admin",
    passwordHash: await hashPassword(password),
    fullName: name,
    academicProgram: ACADEMIC_PROGRAM,
    group: "Science",
    passingYear: "2000",
    profilePhotoUrl: "https://placehold.co/300x300/png?text=Admin",
    profilePhotoPublicId: "admin-placeholder",
    mobilePhone: phone,
    whatsappPhone: phone,
    feePaid: false,
    email,
    address: {
      regionType: "bangladesh",
      division: "Dhaka",
      district: "ঢাকা",
    },
  });
}