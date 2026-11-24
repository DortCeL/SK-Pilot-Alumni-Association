"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { FormField } from "@/components/ui/form-field";
import { useMessages } from "@/components/language";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
  folder: "profile";
  valueUrl?: string;
  onUploaded: (payload: { url: string; publicId: string }) => void;
  error?: string;
  /** Use public upload endpoint when not logged in (registration). */
  publicUpload?: boolean;
};

export function ImageUploadField({
  label,
  required,
  hint,
  folder,
  valueUrl,
  onUploaded,
  error,
  publicUpload = false,
}: Props) {
  const m = useMessages();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLocalError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? m.uploadFailed);
      }
      onUploaded({ url: data.url, publicId: data.publicId });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : m.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error ?? localError ?? undefined}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-brand/40 bg-brand-soft px-4 text-sm font-medium text-brand-deep hover:brightness-95 disabled:opacity-60 dark:text-brand"
        >
          {uploading ? <Spinner /> : null}
          {uploading ? m.uploading : valueUrl ? m.changePhoto : m.clickUpload}
        </button>
        {valueUrl ? (
          <Image
            src={valueUrl}
            alt={m.uploadedAlt}
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 rounded-lg border border-line object-cover"
          />
        ) : null}
      </div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </FormField>
  );
}