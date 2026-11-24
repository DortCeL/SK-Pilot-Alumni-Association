import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none ring-brand/25 focus:border-brand focus:ring-2 disabled:bg-brand-soft/40";

export const sectionClassName =
  "rounded-2xl border border-line bg-paper p-4 sm:p-6";
