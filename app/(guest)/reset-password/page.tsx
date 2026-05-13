import ResetPasswordForm from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-medium tracking-widest text-blue-600">
            NEW PASSWORD
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Choose a password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your reset link is valid for one hour from the time it was sent.
          </p>
        </div>

        <ResetPasswordForm token={params.token || ""} />
      </div>
    </div>
  );
}
