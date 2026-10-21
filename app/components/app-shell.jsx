"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { getInitials } from "@/app/lib/task-utils";
import { FolderKanban as FolderKanbanIcon, LayoutDashboard as DashboardIcon, LogOut as LogOutIcon, SquareKanban as LogoMarkIcon } from "lucide-react";

const NAV_ITEM =
  "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]";
const NAV_ACTIVE = "bg-[#e7eeff] text-[#19285f]";
const NAV_IDLE = "text-gray-600 hover:bg-slate-100 hover:text-slate-900";

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]">
      <span className="grid size-8 place-items-center rounded-lg bg-[#2943ca] text-white">
        <LogoMarkIcon className="size-4" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900">TaskFlow</span>
    </Link>
  );
}

function Avatar({ name }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e7eeff] text-xs font-semibold text-[#19285f]">
      {getInitials(name)}
    </span>
  );
}

/**
 * Authenticated layout: sidebar (desktop) / top bar (mobile) + protected content.
 * Visitors are redirected to /login (FR-03).
 */
export function AppShell({ children }) {
  const { user, loading, displayName, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const loggingOut = useRef(false); // an intentional logout goes to the home page, not to the "please sign in" redirect

  useEffect(() => {
    if (!loading && !user && !loggingOut.current) router.replace("/login?reason=auth");
  }, [loading, user, router]);

  async function handleLogout() {
    loggingOut.current = true;
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.replace("/");
    }
  }

  if (loading || !user) {
    return (
      <div role="status" className="grid min-h-screen place-items-center bg-[#f9fafc] text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  const onDashboard = pathname.startsWith("/dashboard");
  const onProjects = pathname.startsWith("/projects");

  const navItems = (
    <>
      <Link href="/dashboard" aria-current={onDashboard ? "page" : undefined} className={`${NAV_ITEM} ${onDashboard ? NAV_ACTIVE : NAV_IDLE}`}>
        <DashboardIcon /> Dashboard
      </Link>
      <Link href="/dashboard#projects" aria-current={onProjects ? "page" : undefined} className={`${NAV_ITEM} ${onProjects ? NAV_ACTIVE : NAV_IDLE}`}>
        <FolderKanbanIcon /> Projects
      </Link>
      <button type="button" onClick={handleLogout} className={`${NAV_ITEM} ${NAV_IDLE}`}>
        <LogOutIcon /> Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f9fafc] text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between border-r border-[#dbdee5] bg-white p-4 md:flex">
        <div>
          <Logo />
          <nav aria-label="Main" className="mt-6 space-y-1">
            {navItems}
          </nav>
        </div>
        <div className="flex items-center gap-2 px-0">
          <Avatar name={displayName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-gray-600">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 border-b border-[#dbdee5] bg-white px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Logo />
          <Avatar name={displayName} />
        </div>
        <nav aria-label="Main" className="mt-3 flex gap-1">
          {navItems}
        </nav>
      </header>

      <main className="p-4 sm:p-8 md:pl-72">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
