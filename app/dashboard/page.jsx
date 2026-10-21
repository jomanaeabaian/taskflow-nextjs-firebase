"use client";

import { useMemo } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import { AppShell } from "@/app/components/app-shell";
import { DashboardStats } from "@/app/components/dashboard-stats";
import { AssignedTasks, OverdueTasks, ProjectsSection } from "@/app/components/dashboard-sections";
import { byDueDate, computeStats, getFirstName, isOverdue } from "@/app/lib/task-utils";

export default function DashboardPage() {
  const { user, displayName } = useAuth();
  const { loading, error, projects, tasks, reload } = useDashboardData(user?.uid);

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const assigned = useMemo(
    () => tasks.filter((t) => t.assigneeId === user?.uid && t.status !== "done").sort(byDueDate),
    [tasks, user?.uid]
  );
  const overdue = useMemo(() => tasks.filter((t) => isOverdue(t)).sort(byDueDate), [tasks]);
  const projectCards = useMemo(
    () =>
      projects.map((project) => {
        const own = tasks.filter((t) => t.projectId === project.id);
        return { ...project, taskCount: own.length, overdueCount: own.filter((t) => isOverdue(t)).length };
      }),
    [projects, tasks]
  );

  const firstName = getFirstName(displayName);

  return (
    <AppShell>
      <header>
        <h1 className="text-3xl font-bold leading-9 tracking-tight text-slate-900">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="mt-1 text-base text-gray-600">Here is what needs your attention across your projects.</p>
      </header>

      {error && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="h-9 shrink-0 rounded-lg border border-red-300 bg-white px-3 text-sm font-medium text-red-900 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Retry
          </button>
        </div>
      )}

      <DashboardStats stats={stats} loading={loading} />
      <AssignedTasks tasks={assigned} loading={loading} />
      <OverdueTasks tasks={overdue} loading={loading} />
      <ProjectsSection projects={projectCards} loading={loading} uid={user?.uid} />
    </AppShell>
  );
}
