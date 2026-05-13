"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth-reset";

type ResetActionState = {
  success: boolean;
  message: string;
} | null;

export default function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState<ResetActionState, FormData>(
    requestPasswordReset,
    null
  );

  return (
    <form action={action} className="space-y-4">
      {state?.message ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label className="text-sm text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          required
          className="mt-1 w-full rounded-lg border bg-gray-100 px-4 py-2 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Sending..." : "Send Reset Link"}
      </button>

      <Link
        href="/"
        className="block text-center text-sm text-blue-600 underline-offset-2 hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}
