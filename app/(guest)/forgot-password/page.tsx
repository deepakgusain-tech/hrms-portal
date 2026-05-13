import ForgotPasswordForm from "./reset-request-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-medium tracking-widest text-blue-600">
            PASSWORD RESET
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Reset access
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we will send reset links for matching accounts.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
