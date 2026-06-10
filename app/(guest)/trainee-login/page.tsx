import LoginForm from "../login-form";
import Link from "next/link";

export default function TraineeLoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-gradient-to-br from-[#0f172a] via-[#0f766e] to-[#14b8a6]">
        <div>
          <p className="text-xs tracking-widest opacity-80">TRAINEE PORTAL</p>
          <h1 className="text-2xl font-semibold mt-2">HRMS Onboarding Hub</h1>
        </div>

        <div className="max-w-lg">
          <p className="text-sm uppercase tracking-widest opacity-70 mb-4">
            Welcome Trainee
          </p>
          <h2 className="text-5xl font-semibold leading-tight mb-6">
            Track your training, attendance, and progress in one place.
          </h2>
          <p className="text-sm opacity-80">
            Use your trainee credentials to access your dedicated dashboard and training material.
          </p>
        </div>

        <p className="text-xs opacity-70">© {new Date().getFullYear()} YOUR COMPANY</p>
      </div>

      <div className="flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <p className="text-xs tracking-widest text-cyan-600 font-medium">
              SIGN IN
            </p>
            <h2 className="text-3xl font-semibold text-gray-900 mt-2">
              Trainee Login
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Login to your trainee dashboard.
            </p>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <h3 className="text-center font-semibold text-lg mb-1">TRAINEE PORTAL</h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              Secure login for trainees
            </p>
            <LoginForm />

            <div className="mt-5 text-center text-sm text-gray-500">
              <Link href="/" className="text-cyan-600 underline-offset-2 hover:underline">
                Back to main login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
