"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, inputClassName } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { useMessages } from "@/components/language";

type Props = {
  registered?: boolean;
};

export function LoginForm({ registered }: Props) {
  const router = useRouter();
  const m = useMessages();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? m.loginFailed);
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : m.loginFailed);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md flex-col gap-5">
      {registered ? (
        <p className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-deep dark:text-brand">
          {m.loginSuccess}
        </p>
      ) : null}

      <FormField label={m.loginId} required>
        <input
          className={inputClassName}
          placeholder={m.loginIdPlaceholder}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
        />
      </FormField>

      <FormField label={m.password} required>
        <input
          className={inputClassName}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </FormField>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
      >
        {loading ? <Spinner /> : null}
        {loading ? m.loggingIn : m.loginButton}
      </button>
    </form>
  );
}