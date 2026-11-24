"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  alumniRegistrationSchema,
  type AlumniRegistrationInput,
} from "@/lib/validations/alumni";
import { ACADEMIC_PROGRAM } from "@/lib/constants";
import { AlumniFormFields } from "@/components/alumni/alumni-form-fields";
import { useLang, useMessages } from "@/components/language";

const defaultValues: AlumniRegistrationInput = {
  fullName: "",
  academicProgram: ACADEMIC_PROGRAM,
  group: "",
  passingYear: "",
  occupation: "",
  designation: "",
  organization: "",
  officeAddress: "",
  profilePhotoUrl: "",
  profilePhotoPublicId: "",
  mobilePhone: "",
  whatsappPhone: "",
  whatsappSameAsMobile: false,
  email: "",
  password: "",
  confirmPassword: "",
  address: {
    regionType: "bangladesh",
    division: "",
    district: "",
    upazila: "",
    postOffice: "",
    streetAddress: "",
  },
};

export function RegistrationForm() {
  const lang = useLang();
  return <RegistrationFormBody key={lang} />;
}

function RegistrationFormBody() {
  const router = useRouter();
  const m = useMessages();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AlumniRegistrationInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(alumniRegistrationSchema(m)) as any,
    defaultValues,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/alumni/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? m.registerFailed);
      }
      router.push("/login?registered=1");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : m.registerFailed);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <AlumniFormFields
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
        watch={form.watch}
        setValue={form.setValue}
        mode="register"
        publicUpload
      />

      {submitError ? (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand px-6 text-base font-semibold text-white hover:bg-brand-deep disabled:opacity-60 sm:w-auto"
      >
        {submitting ? m.submittingRegister : m.submitRegister}
      </button>
    </form>
  );
}