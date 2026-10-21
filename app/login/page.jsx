import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/app/components/login-form'

const FEATURES = [
  'Projects with owner and member roles',
  'Task filters, search, and overdue tracking',
  'Responsive from 375px phones to wide desktops',
]

function LogoMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 7v7" />
      <path d="M12 7v4" />
      <path d="M16 7v9" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0 text-teal-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-screen w-full overflow-hidden bg-[#020618]">
      {/* Ambient glows: indigo (top-left), violet (centre), teal (bottom-right) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-56 -top-60 h-145 w-145 rounded-full bg-[#3b3ca8] opacity-75 blur-[120px]" />
        <div className="absolute left-[48%] top-1/2 h-105 w-105 -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#4c1d95] opacity-20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-56 h-160 w-160 rounded-full bg-[#0d6e6e] opacity-70 blur-[120px]" />
      </div>

      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: brand + value proposition */}
        <section className="text-white">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl border border-white/20 bg-white/15 backdrop-blur">
              <LogoMark />
            </span>
            <span className="text-xl font-semibold tracking-tight">TaskFlow</span>
          </div>

          <h1 className="mt-6 text-[32px] font-bold leading-none tracking-tight sm:text-5xl">
            <span className="block">Plan projects.</span>
            <span className="block">Ship tasks. Stay</span>
            <span className="block">ahead of deadlines.</span>
          </h1>

          <p className="mt-4 max-w-116 text-[15px] leading-6 text-white/85">
            A focused workspace for teams to organize projects, assign{' '}
            <br className="hidden sm:block" />
            work, and catch overdue tasks before they slip.
          </p>

          <ul className="mt-6.25 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-white/90">
                <CheckCircle />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        {/* Right: frosted sign-in card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/85 p-8 text-slate-900 shadow-2xl backdrop-blur-xl">
            <header className="mb-5 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-slate-500">Sign in to manage your projects and tasks.</p>
            </header>

            <Suspense
              fallback={<div className="py-4 text-center text-sm text-slate-500">Loading form...</div>}
            >
              <LoginForm />
            </Suspense>

            <p className="mt-6 text-center text-sm text-slate-600">
              New to TaskFlow?{' '}
              <Link
                href="/register"
                className="rounded font-medium text-[#2943ca] underline underline-offset-4 transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}