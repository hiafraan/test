import { LoginForm } from "@/components/login-form";

// Server Component shell; the interactive form is a Client Component.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Server Monitor dashboard
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
