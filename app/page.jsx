"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CircleCheck, FolderKanban, ListChecks, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

const FEATURES = [
  {
    icon: FolderKanban,
    title: "Projects with roles",
    text: "Every project has one Owner and any number of Members, so the right people can manage the right things.",
  },
  {
    icon: ListChecks,
    title: "Tasks, filters and search",
    text: "Track status, priority, due date and assignee, then filter or search to find any task in seconds.",
  },
  {
    icon: CalendarClock,
    title: "Overdue tracking",
    text: "Overdue tasks are flagged with a clear label on your dashboard and inside every project.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    text: "Firestore Security Rules enforce who can read and change data, not just the interface.",
  },
];

function LogoMark({ className = "size-5 text-white" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 7v7" />
      <path d="M12 7v4" />
      <path d="M16 7v9" />
    </svg>
  );
}

function HeroIllustration() {
  const columns = [
    { x: 60, label: "To do", cards: [0, 1], accent: "#818cf8", done: false },
    { x: 196, label: "In progress", cards: [0, 1], accent: "#fbbf24", done: false },
    { x: 332, label: "Done", cards: [0, 1, 2], accent: "#5eead4", done: true },
  ];
  return (
    <svg viewBox="0 0 520 460" className="h-auto w-full max-w-[520px]" role="img" aria-label="Illustration of a task board with columns, a checklist and a progress ring">
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="indigo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#2943ca" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#020618" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Board */}
      <g filter="url(#shadow)">
        <rect x="40" y="50" width="440" height="330" rx="24" fill="url(#glass)" stroke="#fff" strokeOpacity="0.3" />
      </g>
      <circle cx="68" cy="78" r="5" fill="#fff" fillOpacity="0.5" />
      <circle cx="86" cy="78" r="5" fill="#fff" fillOpacity="0.35" />
      <circle cx="104" cy="78" r="5" fill="#fff" fillOpacity="0.2" />
      <rect x="140" y="72" width="120" height="12" rx="6" fill="#fff" fillOpacity="0.25" />

      {columns.map((col) => (
        <g key={col.label}>
          <rect x={col.x} y="100" width="124" height="262" rx="14" fill="#fff" fillOpacity="0.08" />
          <circle cx={col.x + 16} cy="124" r="4" fill={col.accent} />
          <text x={col.x + 26} y="128" fontSize="11" fontWeight="600" fill="#fff" fillOpacity="0.9">{col.label}</text>
          {col.cards.map((i) => {
            const y = 142 + i * 70;
            return (
              <g key={i}>
                <rect x={col.x + 10} y={y} width="104" height="60" rx="10" fill="#fff" fillOpacity="0.94" />
                <rect x={col.x + 20} y={y + 12} width={col.done ? 56 : 70} height="6" rx="3" fill="#cbd5e1" />
                <rect x={col.x + 20} y={y + 24} width="44" height="6" rx="3" fill="#e2e8f0" />
                <rect x={col.x + 20} y={y + 38} width="28" height="9" rx="4.5" fill={col.accent} />
                {col.done ? (
                  <g>
                    <circle cx={col.x + 98} cy={y + 15} r="7" fill="url(#teal)" />
                    <path d={`M${col.x + 94.5} ${y + 15} l2.5 2.5 l4.5 -5`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                ) : (
                  <circle cx={col.x + 98} cy={y + 15} r="5.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                )}
              </g>
            );
          })}
        </g>
      ))}

      {/* Floating: progress ring */}
      <g filter="url(#shadow)">
        <rect x="392" y="6" width="116" height="96" rx="18" fill="#fff" />
      </g>
      <circle cx="450" cy="46" r="24" fill="none" stroke="#e2e8f0" strokeWidth="7" />
      <circle cx="450" cy="46" r="24" fill="none" stroke="url(#teal)" strokeWidth="7" strokeLinecap="round" strokeDasharray="108.5 150.8" transform="rotate(-90 450 46)" />
      <text x="450" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="#19285f">72%</text>
      <text x="450" y="90" textAnchor="middle" fontSize="10" fontWeight="500" fill="#64748b">Sprint progress</text>

      {/* Floating: checklist */}
      <g filter="url(#shadow)">
        <rect x="8" y="318" width="196" height="124" rx="18" fill="#fff" />
      </g>
      <text x="26" y="344" fontSize="12" fontWeight="700" fill="#19285f">Today</text>
      {[0, 1, 2].map((i) => {
        const y = 362 + i * 25;
        const checked = i < 2;
        return (
          <g key={i}>
            {checked ? (
              <g>
                <circle cx="34" cy={y} r="8" fill="url(#indigo)" />
                <path d={`M30.5 ${y} l2.5 2.5 l4.5 -5`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : (
              <circle cx="34" cy={y} r="7.5" fill="none" stroke="#cbd5e1" strokeWidth="1.8" />
            )}
            <rect x="52" y={y - 3} width={[104, 84, 120][i]} height="6" rx="3" fill={checked ? "#cbd5e1" : "#94a3b8"} />
          </g>
        );
      })}

      {/* Floating: due date */}
      <g filter="url(#shadow)">
        <rect x="318" y="372" width="190" height="60" rx="18" fill="#fff" />
      </g>
      <rect x="336" y="388" width="28" height="28" rx="8" fill="url(#indigo)" />
      <rect x="342" y="396" width="16" height="12" rx="2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M342 400h16M346 393v4M354 393v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <text x="374" y="399" fontSize="12" fontWeight="700" fill="#19285f">Due tomorrow</text>
      <text x="374" y="414" fontSize="10" fontWeight="500" fill="#64748b">3 tasks need attention</text>
    </svg>
  );
}

const ctaPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2943ca] px-5 text-sm font-medium text-white transition-colors hover:bg-[#2339b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#020618]";
const ctaSecondary =
  "inline-flex h-11 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const signedIn = !loading && !!user;

  async function handleLogout() {
    try {
      await logout(); // the page stays on "/" and switches to the signed-out buttons by itself
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#020618] text-white">
      {/* Ambient glows (same as the login page) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-56 -top-60 h-[580px] w-[580px] rounded-full bg-[#3b3ca8] opacity-75 blur-[120px]" />
        <div className="absolute left-[48%] top-[45%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#4c1d95] opacity-20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-56 h-[640px] w-[640px] rounded-full bg-[#0d6e6e] opacity-70 blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <span className="grid size-9 place-items-center rounded-xl border border-white/20 bg-white/15 backdrop-blur">
              <LogoMark />
            </span>
            <span className="text-xl font-semibold tracking-tight">TaskFlow</span>
          </Link>
          <nav aria-label="Account" className="flex items-center gap-2">
            {signedIn ? (
              <>
              <Link href="/dashboard" className="inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#020618]">
                Open dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <LogOut className="size-4" aria-hidden="true" /> Log out
              </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  Sign in
                </Link>
                <Link href="/register" className="inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#020618]">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="grid items-center gap-12 pb-16 pt-8 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-16">
            <div>
              <h1 className="text-[32px] font-bold leading-[1.1] tracking-tight sm:text-5xl">
                Plan projects. <br className="hidden sm:block" />
                Ship tasks. Stay <br className="hidden sm:block" />
                ahead of deadlines.
              </h1>
              <p className="mt-5 max-w-[29rem] text-[15px] leading-6 text-white/85">
                A focused workspace for teams to organize projects, assign work, and catch overdue tasks before they slip.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {signedIn ? (
                  <>
                    <Link href="/dashboard" className={ctaPrimary}>
                      Open dashboard <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <button type="button" onClick={handleLogout} className={`${ctaSecondary} gap-2`}>
                      <LogOut className="size-4" aria-hidden="true" /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/register" className={ctaPrimary}>
                      Create a free account <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <Link href="/login" className={ctaSecondary}>
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {["Projects with owner and member roles", "Task filters, search, and overdue tracking", "Responsive from 375px phones to wide desktops"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                    <CircleCheck className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Illustration */}
            <div className="flex justify-center lg:justify-end">
              <HeroIllustration />
            </div>
          </section>

          {/* Features */}
          <section aria-labelledby="features-heading" className="pb-16 lg:pb-24">
            <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">Everything a small team needs</h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">Simple on purpose: projects, tasks, and the people responsible for them.</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <span className="grid size-9 place-items-center rounded-lg bg-white/15">
                    <Icon className="size-5 text-teal-300" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/80">{text}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Closing CTA */}
          {!signedIn && (
            <section className="mb-16 rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur lg:mb-24 lg:p-12">
              <h2 className="text-2xl font-semibold tracking-tight">Ready to get your team organized?</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/80">Create an account in under a minute and start your first project.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/register" className={ctaPrimary}>
                  Get started <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/login" className={ctaSecondary}>Sign in</Link>
              </div>
            </section>
          )}
        </main>

        <footer className="border-t border-white/15 py-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} TaskFlow. Built with Next.js and Firebase.
        </footer>
      </div>
    </div>
  );
}
