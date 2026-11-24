import { z } from "zod";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone";
import { ACADEMIC_PROGRAM, PASSING_YEARS } from "@/lib/constants";
import type { Messages } from "@/lib/messages";

const optionalText = z.string().trim().optional().or(z.literal(""));

function addressBangladeshSchema(m: Messages) {
  return z.object({
    regionType: z.literal("bangladesh"),
    division: z.string().min(1, m.vDivision),
    district: z.string().min(1, m.vDistrict),
    upazila: optionalText,
    postOffice: optionalText,
    streetAddress: optionalText,
  });
}

function addressOverseasSchema(m: Messages) {
  return z.object({
    regionType: z.literal("overseas"),
    country: z.string().min(1, m.vCountry),
    customCountry: optionalText,
    stateOrRegion: z.string().min(1, m.vState),
    city: optionalText,
    postalCode: optionalText,
    streetAddress: optionalText,
  });
}

function profileObject(m: Messages) {
  return z.object({
    fullName: z.string().trim().min(3, m.vName),
    academicProgram: z.literal(ACADEMIC_PROGRAM),
    group: z.string().min(1, m.vGroup),
    passingYear: z
      .string()
      .refine((y) => PASSING_YEARS.includes(y), m.vYear),
    occupation: optionalText,
    designation: optionalText,
    organization: optionalText,
    officeAddress: optionalText,
    profilePhotoUrl: z.string().url(m.vPhoto),
    profilePhotoPublicId: z.string().min(1),
    mobilePhone: z
      .string()
      .transform((v) => normalizeBdPhone(v))
      .refine(isValidBdPhone, m.vPhone),
    whatsappPhone: z.string().optional().or(z.literal("")),
    whatsappSameAsMobile: z.boolean().optional().default(false),
    email: z
      .string()
      .trim()
      .email(m.vEmail)
      .optional()
      .or(z.literal("")),
    address: z.discriminatedUnion("regionType", [
      addressBangladeshSchema(m),
      addressOverseasSchema(m),
    ]),
  });
}

function withSharedRules<T extends z.ZodTypeAny>(schema: T, m: Messages) {
  return schema.superRefine((raw, ctx) => {
    const data = raw as {
      mobilePhone: string;
      whatsappPhone?: string;
      whatsappSameAsMobile?: boolean;
      address: {
        regionType: string;
        country?: string;
        customCountry?: string;
      };
    };
    const whatsapp = data.whatsappSameAsMobile
      ? data.mobilePhone
      : normalizeBdPhone(data.whatsappPhone ?? "");
    if (!isValidBdPhone(whatsapp)) {
      ctx.addIssue({
        code: "custom",
        message: m.vWhatsapp,
        path: ["whatsappPhone"],
      });
    }
    if (data.address.regionType === "overseas" && data.address.country === "CUSTOM") {
      if ((data.address.customCountry?.length ?? 0) < 2) {
        ctx.addIssue({
          code: "custom",
          message: m.vCustomCountry,
          path: ["address", "customCountry"],
        });
      }
    }
  });
}

export function alumniProfileFieldsSchema(m: Messages) {
  return withSharedRules(profileObject(m), m);
}

export function alumniRegistrationSchema(m: Messages) {
  return withSharedRules(
    profileObject(m).extend({
      password: z.string().min(8, m.vPassword),
      confirmPassword: z.string().min(8),
    }),
    m,
  ).refine((data) => data.password === data.confirmPassword, {
    message: m.vPasswordMatch,
    path: ["confirmPassword"],
  });
}

/** Normalize WhatsApp after a successful parse and drop the UI-only checkbox. */
export function toStoredProfile<T extends Record<string, unknown>>(data: T) {
  const {
    whatsappSameAsMobile,
    whatsappPhone,
    mobilePhone,
    ...rest
  } = data as T & {
    whatsappSameAsMobile?: boolean;
    whatsappPhone?: string;
    mobilePhone: string;
  };
  return {
    ...rest,
    mobilePhone,
    whatsappPhone: whatsappSameAsMobile
      ? mobilePhone
      : normalizeBdPhone(whatsappPhone ?? ""),
  };
}

export type AlumniProfileInput = z.infer<ReturnType<typeof alumniProfileFieldsSchema>>;
export type AlumniRegistrationInput = z.infer<ReturnType<typeof alumniRegistrationSchema>>;
