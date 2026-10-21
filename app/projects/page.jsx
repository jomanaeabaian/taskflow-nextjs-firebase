"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import { AppShell } from "@/app/components/app-shell";
import { EmptyState } from "@/app/components/empty-state";
import { isOverdue, pluralize } from "@/app/lib/task-utils";
import { btnPrimary, btnSecondary, card } from "@/app/lib/ui-classes";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { loading, error, projects, tasks, reload } = useDashboardData(user?.uid);

  const items = useMemo(
    () =>
      projects
        .map((project) => {
          const own = tasks.filter((t) => t.projectId === project.id);
          return { ...project, taskCount: own.length, overdueCount: own.filter((t) => isOverdue(t)).length };
        })
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [projects, tasks]
  );

  return (
    <AppShell>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold leading-9 tracking-tight text-slate-900">Projects</h1>
          <p className="mt-1 text-base text-gray-600">Projects you own or have been added to.</p>
        </div>
        <Link href="/projects/new" className={btnPrimary}>
          <Plus className="size-4" aria-hidden="true" /> New project
        </Link>
      </header>

      {error && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
          <span>{error}</span>
          <button type="button" onClick={reload} className={btnSecondary}>Retry</button>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div role="status" aria-label="Loading projects" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className={`${card} h-28 animate-pulse`} />)}
          </div>
        ) : items.length === 0 && !error ? (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to start organizing tasks with your team.">
            <Link href="/projects/new" className={`${btnPrimary} mt-4`}>Create a project</Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className={`${card} block h-full p-4 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]`}>
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-base font-semibold text-slate-900">{project.name}</span>
                    <span className="shrink-0 rounded-full border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {project.ownerId === user?.uid ? "Owner" : "Member"}
                    </span>
                  </span>
                  {project.description && <span className="mt-1 line-clamp-2 block text-sm text-gray-600">{project.description}</span>}
                  <span className="mt-3 block text-sm text-gray-600">
                    {pluralize(project.taskCount, "task")} · {pluralize(project.memberIds?.length ?? 1, "member")}
                    {project.overdueCount > 0 && <span className="text-red-800"> · {project.overdueCount} overdue</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
