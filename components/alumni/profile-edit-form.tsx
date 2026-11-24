"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  alumniProfileFieldsSchema,
  type AlumniProfileInput,
  type AlumniRegistrationInput,
} from "@/lib/validations/alumni";
import { AlumniFormFields } from "@/components/alumni/alumni-form-fields";
import { useLang, useMessages } from "@/components/language";

type Props = {
  initialValues: AlumniProfileInput;
  apiUrl: string;
  lockPhone?: boolean;
  cancelHref?: string;
  redirectTo?: string;
};

export function ProfileEditForm(props: Props) {
  const lang = useLang();
  return <ProfileEditFormBody key={lang} {...props} />;
}

function ProfileEditFormBody({
  initialValues,
  apiUrl,
  lockPhone = true,
  cancelHref,
  redirectTo,
}: Props) {
  const router = useRouter();
  const m = useMessages();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AlumniProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(alumniProfileFieldsSchema(m)) as any,
    defaultValues: initialValues,
    values: initialValues,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? m.updateFailed);
      }
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
      setSubmitSuccess(data.message ?? m.saved);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : m.updateFailed);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <AlumniFormFields
        register={form.register as unknown as import("react-hook-form").UseFormRegister<AlumniRegistrationInput>}
        control={form.control as unknown as import("react-hook-form").Control<AlumniRegistrationInput>}
        errors={form.formState.errors as import("react-hook-form").FieldErrors<AlumniRegistrationInput>}
        watch={form.watch as unknown as import("react-hook-form").UseFormWatch<AlumniRegistrationInput>}
        setValue={form.setValue as unknown as import("react-hook-form").UseFormSetValue<AlumniRegistrationInput>}
        mode="edit"
        lockPhone={lockPhone}
      />

      {submitError ? (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">
          {submitError}
        </p>
      ) : null}
      {submitSuccess ? (
        <p className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-deep dark:text-brand">
          {submitSuccess}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-line bg-paper px-6 text-base font-semibold text-ink hover:bg-brand-soft sm:w-auto"
          >
            {m.cancel}
          </Link>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand px-6 text-base font-semibold text-white hover:bg-brand-deep disabled:opacity-60 sm:w-auto"
        >
          {submitting ? m.saving : m.save}
        </button>
      </div>
    </form>
  );
}
