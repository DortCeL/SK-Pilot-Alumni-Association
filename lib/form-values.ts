import { ACADEMIC_PROGRAM } from "@/lib/constants";
import type { AlumniProfileInput } from "@/lib/validations/alumni";

type ProfileLike = {
  fullName: string;
  academicProgram: string;
  group: string;
  passingYear: string;
  occupation?: string | null;
  designation?: string | null;
  organization?: string | null;
  officeAddress?: string | null;
  profilePhotoUrl: string;
  profilePhotoPublicId: string;
  mobilePhone: string;
  whatsappPhone?: string | null;
  email?: string | null;
  address: AlumniProfileInput["address"];
};

export function toFormValues(profile: ProfileLike): AlumniProfileInput {
  const whatsapp = profile.whatsappPhone || profile.mobilePhone;
  return {
    fullName: profile.fullName,
    academicProgram: ACADEMIC_PROGRAM,
    group: profile.group,
    passingYear: profile.passingYear,
    occupation: profile.occupation ?? "",
    designation: profile.designation ?? "",
    organization: profile.organization ?? "",
    officeAddress: profile.officeAddress ?? "",
    profilePhotoUrl: profile.profilePhotoUrl,
    profilePhotoPublicId: profile.profilePhotoPublicId,
    mobilePhone: profile.mobilePhone,
    whatsappPhone: whatsapp,
    whatsappSameAsMobile: whatsapp === profile.mobilePhone,
    email: profile.email ?? "",
    address: profile.address,
  };
}
