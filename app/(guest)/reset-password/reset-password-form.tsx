"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth-reset";

type ResetActionState = {
  success: boolean;
  message: string;
} | null;

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState<ResetActionState, FormData>(
    resetPassword,
    null
  );

  useEffect(() => {
    if (!state?.success) return;

    const timeout = window.setTimeout(() => {
      router.push("/");
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [router, state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

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

      {!token ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Reset token is missing.
        </p>
      ) : null}

      <div>
        <label className="text-sm text-gray-700" htmlFor="password">
          New Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
          className="mt-1 w-full rounded-lg border bg-gray-100 px-4 py-2 outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          required
          minLength={6}
          className="mt-1 w-full rounded-lg border bg-gray-100 px-4 py-2 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !token}
        className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Saving..." : "Reset Password"}
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
