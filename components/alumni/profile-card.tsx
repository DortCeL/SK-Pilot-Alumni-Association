import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { displayValue, formatAddress, type ProfileAddress } from "@/lib/profile-display";
import { getLang, getMessages } from "@/lib/i18n";
import { ACADEMIC_PROGRAM } from "@/lib/constants";

type Profile = {
  fullName: string;
  academicProgram?: string | null;
  group?: string | null;
  passingYear?: string | null;
  occupation?: string | null;
  designation?: string | null;
  organization?: string | null;
  officeAddress?: string | null;
  profilePhotoUrl?: string | null;
  mobilePhone?: string | null;
  whatsappPhone?: string | null;
  email?: string | null;
  address?: ProfileAddress | null;
};

export async function AlumniProfileCard({
  profile,
  editHref,
}: {
  profile: Profile;
  editHref?: string;
}) {
  const m = await getMessages();
  const lang = await getLang();
  const program =
    profile.academicProgram === ACADEMIC_PROGRAM ||
    profile.academicProgram === "উচ্চ মাধ্যমিক (HSC)"
      ? m.programValue
      : displayValue(profile.academicProgram);
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-paper">
      <div className="bg-gradient-to-br from-brand-deep via-brand to-[#1f7a5c] px-4 py-6 text-white sm:px-8 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={profile.fullName} src={profile.profilePhotoUrl} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f4ead0]">{program}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {profile.fullName}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              {displayValue(profile.group)} · {m.passingYearLine}{" "}
              {displayValue(profile.passingYear)}
            </p>
          </div>
          {editHref ? (
            <Link
              href={editHref}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-deep hover:bg-[#f4ead0] sm:w-auto"
            >
              <PencilLine className="h-4 w-4" aria-hidden />
              {m.editProfile}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 p-4 sm:grid-cols-2 sm:p-8">
        <Section title={m.contact}>
          <Field label={m.mobile} value={profile.mobilePhone} />
          <Field label={m.whatsapp} value={profile.whatsappPhone || profile.mobilePhone} />
          <Field label={m.email} value={profile.email} />
        </Section>
        <Section title={m.work}>
          <Field label={m.occupation} value={profile.occupation} />
          <Field label={m.designation} value={profile.designation} />
          <Field label={m.organization} value={profile.organization} />
          <Field label={m.officeAddress} value={profile.officeAddress} />
        </Section>
        <Section title={m.addressSection} className="sm:col-span-2">
          <Field label={m.permanentAddress} value={formatAddress(profile.address, lang)} />
        </Section>
      </div>
    </article>
  );
}

function Section({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="mb-3 text-sm font-semibold text-brand">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{displayValue(value)}</p>
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={112}
        height={112}
        className="h-28 w-28 rounded-full object-cover ring-4 ring-white/40"
        style={{ width: 112, height: 112 }}
      />
    );
  }

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-3xl font-semibold ring-4 ring-white/40">
      {name.trim().charAt(0) || "?"}
    </div>
  );
}
